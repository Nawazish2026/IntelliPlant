import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema({
  equipmentTag: { type: String, required: true },
  equipmentName: { type: String },
  workOrderId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['preventive', 'corrective', 'predictive', 'emergency'], required: true },
  description: { type: String, required: true },
  failureMode: { type: String },
  rootCause: { type: String },
  resolution: { type: String },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  technicianName: { type: String },
  technicianNotes: { type: String },
  downtimeHours: { type: Number, default: 0 },
  costINR: { type: Number, default: 0 },
  partsReplaced: [String],
  relatedDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  healthScore: { type: Number, min: 0, max: 100, default: 85 }
}, { timestamps: true });

maintenanceRecordSchema.index({ equipmentTag: 1 });
maintenanceRecordSchema.index({ status: 1 });
maintenanceRecordSchema.index({ scheduledDate: 1 });
maintenanceRecordSchema.index({ type: 1 });

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
