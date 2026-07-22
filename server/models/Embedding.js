import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  chunkIndex: { type: Number, required: true },
  chunkText: { type: String, required: true },
  embedding: { type: [Number], required: true },
  metadata: {
    pageNumber: Number,
    section: String,
    documentType: String,
    documentName: String
  }
}, { timestamps: true });

embeddingSchema.index({ documentId: 1, chunkIndex: 1 });

export default mongoose.model('Embedding', embeddingSchema);
