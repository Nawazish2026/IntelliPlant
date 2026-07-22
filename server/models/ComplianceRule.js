import mongoose from 'mongoose';

const complianceRuleSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  section: { type: String, required: true },
  requirement: { type: String, required: true },
  category: {
    type: String,
    enum: ['fire_safety', 'pressure_vessel', 'environmental', 'electrical', 'occupational_health', 'pipeline_safety', 'storage', 'emergency_response', 'quality'],
    required: true
  },
  applicableEquipment: [String],
  status: { type: String, enum: ['compliant', 'gap', 'pending_review', 'not_applicable'], default: 'pending_review' },
  severity: { type: String, enum: ['critical', 'major', 'minor', 'observation'], default: 'major' },
  lastAuditDate: { type: Date },
  nextAuditDate: { type: Date },
  evidence: [String],
  gapDescription: { type: String },
  recommendation: { type: String },
  responsiblePerson: { type: String },
  relatedDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
}, { timestamps: true });

complianceRuleSchema.index({ regulation: 1 });
complianceRuleSchema.index({ status: 1 });
complianceRuleSchema.index({ category: 1 });

export default mongoose.model('ComplianceRule', complianceRuleSchema);
