import mongoose from 'mongoose';

const knowledgeEdgeSchema = new mongoose.Schema({
  sourceEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  targetEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  relationship: {
    type: String,
    enum: [
      'connected_to', 'maintained_by', 'regulated_by', 'located_at',
      'caused_by', 'resolved_by', 'references', 'operated_by',
      'part_of', 'monitors', 'controls', 'feeds_into',
      'inspected_by', 'manufactured_by', 'installed_at', 'replaced_with'
    ],
    required: true
  },
  confidence: { type: Number, default: 0.8, min: 0, max: 1 },
  documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

knowledgeEdgeSchema.index({ sourceEntityId: 1, targetEntityId: 1 });
knowledgeEdgeSchema.index({ relationship: 1 });

export default mongoose.model('KnowledgeEdge', knowledgeEdgeSchema);
