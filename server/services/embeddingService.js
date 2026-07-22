import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Embedding from '../models/Embedding.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



export async function generateEmbedding(text) {
  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: [{ parts: [{ text }] }],
    });
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return null;
  }
}

export async function generateAndStoreEmbeddings(documentId, chunks, metadata = {}) {
  const results = [];

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.text);

      if (embedding) {
        const embeddingDoc = await Embedding.create({
          documentId,
          chunkIndex: chunk.index,
          chunkText: chunk.text,
          embedding,
          metadata: {
            ...metadata,
            pageNumber: chunk.pageNumber || 0,
            section: chunk.section || '',
            documentType: metadata.documentType || '',
            documentName: metadata.documentName || ''
          }
        });
        results.push(embeddingDoc);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Embedding error for chunk ${chunk.index}:`, error.message);
    }
  }

  return results;
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchSimilar(queryText, limit = 5) {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    if (!queryEmbedding) return [];

    try {
      const results = await Embedding.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit
          }
        },
        {
          $project: {
            chunkText: 1,
            documentId: 1,
            chunkIndex: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]);

      if (results.length > 0) return results;
    } catch (e) {
    }

    const allEmbeddings = await Embedding.find({}).lean();
    const scored = allEmbeddings.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(({ embedding, ...rest }) => rest);
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
}

export default { generateEmbedding, generateAndStoreEmbeddings, searchSimilar };
