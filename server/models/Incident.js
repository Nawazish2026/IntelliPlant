import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['incident', 'near_miss', 'audit_finding', 'quality_ncr', 'environmental'],
    required: true
  },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  equipmentInvolved: [String],
  location: { type: String },
  rootCause: { type: String },
  contributingFactors: [String],
  correctiveActions: [{
    action: String,
    assignedTo: String,
    dueDate: Date,
    status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' }
  }],
  date: { type: Date, required: true },
  reportedBy: { type: String },
  investigatedBy: { type: String },
  lessonsLearned: { type: String },
  patternTags: [String],
  preventiveMeasures: [String],
  injuriesCount: { type: Number, default: 0 },
  environmentalImpact: { type: String },
  estimatedLossINR: { type: Number, default: 0 },
  relatedIncidentIds: [String],
  relatedDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
}, { timestamps: true });

incidentSchema.index({ type: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ date: -1 });
incidentSchema.index({ equipmentInvolved: 1 });
incidentSchema.index({ patternTags: 1 });

export default mongoose.model('Incident', incidentSchema);
