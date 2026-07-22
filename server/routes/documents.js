import express from 'express';
import upload from '../middleware/upload.js';
import Document from '../models/Document.js';
import Entity from '../models/Entity.js';
import KnowledgeEdge from '../models/KnowledgeEdge.js';
import Embedding from '../models/Embedding.js';
import { processDocument, chunkText, detectFileType } from '../services/documentProcessor.js';
import { extractEntities, categorizeDocument } from '../services/entityExtractor.js';
import { generateAndStoreEmbeddings } from '../services/embeddingService.js';

const router = express.Router();

/**
 * POST /api/documents/upload
 * Upload and process a document
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = detectFileType(req.file.originalname);

    // Create document record
    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      status: 'processing',
      source: req.body.source || 'manual_upload',
      category: req.body.category || 'other'
    });

    // Process asynchronously
    processDocumentPipeline(doc, req.file.path).catch(err => {
      console.error('Pipeline error:', err);
    });

    res.status(201).json({
      message: 'Document uploaded and processing started',
      document: doc
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Full document processing pipeline (async)
 */
async function processDocumentPipeline(doc, filePath) {
  try {
    // Step 1: Extract text
    const { text, pageCount, info } = await processDocument(filePath, doc.fileType);
    doc.extractedText = text;
    doc.pageCount = pageCount;

    if (!text || text.trim().length < 10) {
      doc.status = 'ready';
      doc.extractedText = '[No extractable text content]';
      await doc.save();
      return;
    }

    // Step 2: Categorize document
    const category = await categorizeDocument(text);
    doc.category = category;

    // Step 3: Extract entities
    const { entities, relationships } = await extractEntities(text, category);

    // Store entities
    const entityMap = {};
    for (const entity of entities) {
      let existing = await Entity.findOne({ name: entity.name, type: entity.type });
      if (existing) {
        if (!existing.documentIds.includes(doc._id)) {
          existing.documentIds.push(doc._id);
        }
        existing.confidence = Math.max(existing.confidence, entity.confidence);
        if (entity.attributes) {
          for (const [key, value] of Object.entries(entity.attributes)) {
            existing.attributes.set(key, value);
          }
        }
        await existing.save();
        entityMap[entity.name] = existing;
      } else {
        const newEntity = await Entity.create({
          name: entity.name,
          type: entity.type,
          subType: entity.subType,
          attributes: entity.attributes || {},
          documentIds: [doc._id],
          confidence: entity.confidence || 0.85,
          description: entity.description || ''
        });
        entityMap[entity.name] = newEntity;
      }
    }

    // Store relationships
    for (const rel of relationships) {
      const sourceEntity = entityMap[rel.source];
      const targetEntity = entityMap[rel.target];
      if (sourceEntity && targetEntity) {
        const existingEdge = await KnowledgeEdge.findOne({
          sourceEntityId: sourceEntity._id,
          targetEntityId: targetEntity._id,
          relationship: rel.relationship
        });
        if (!existingEdge) {
          await KnowledgeEdge.create({
            sourceEntityId: sourceEntity._id,
            targetEntityId: targetEntity._id,
            relationship: rel.relationship,
            confidence: rel.confidence || 0.8,
            documentIds: [doc._id]
          });
        }
      }
    }

    doc.entityCount = entities.length;

    // Step 4: Generate embeddings
    const chunks = chunkText(text);
    await generateAndStoreEmbeddings(doc._id, chunks, {
      documentType: category,
      documentName: doc.originalName
    });
    doc.chunkCount = chunks.length;

    // Mark as ready
    doc.status = 'ready';
    await doc.save();

    console.log(`✅ Document processed: ${doc.originalName} — ${entities.length} entities, ${chunks.length} chunks`);
  } catch (error) {
    console.error(`❌ Processing error for ${doc.originalName}:`, error.message);
    doc.status = 'error';
    doc.processingError = error.message;
    await doc.save();
  }
}

/**
 * GET /api/documents
 * List all documents
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { extractedText: { $regex: search, $options: 'i' } }
      ];
    }

    const docs = await Document.find(filter)
      .select('-extractedText')
      .sort({ uploadDate: -1 })
      .lean();

    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/stats
 * Get document statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, byCategory, totalEntities, totalEdges, totalEmbeddings] = await Promise.all([
      Document.countDocuments(),
      Document.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Document.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Entity.countDocuments(),
      KnowledgeEdge.countDocuments(),
      Embedding.countDocuments()
    ]);

    res.json({
      totalDocuments: total,
      byStatus: byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      byCategory: byCategory.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
      totalEntities,
      totalRelationships: totalEdges,
      totalEmbeddings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/:id
 * Get document details
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Get associated entities
    const entities = await Entity.find({ documentIds: doc._id })
      .select('-embedding')
      .lean();

    res.json({ ...doc, entities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document and its associated data
 */
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Remove embeddings
    await Embedding.deleteMany({ documentId: doc._id });

    // Remove document reference from entities
    await Entity.updateMany(
      { documentIds: doc._id },
      { $pull: { documentIds: doc._id } }
    );

    await doc.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
