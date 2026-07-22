import mongoose from 'mongoose';

const entitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['equipment', 'instrument', 'personnel', 'process', 'chemical', 'regulation', 'location', 'date', 'parameter', 'document_ref'],
    required: true
  },
  subType: { type: String },
  attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  confidence: { type: Number, default: 0.85, min: 0, max: 1 },
  description: { type: String },
  tags: [String],
  embedding: { type: [Number], default: [] }
}, { timestamps: true });

entitySchema.index({ type: 1 });
entitySchema.index({ name: 'text', description: 'text' });
entitySchema.index({ documentIds: 1 });

export default mongoose.model('Entity', entitySchema);
