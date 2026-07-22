import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'xlsx', 'csv', 'txt', 'docx', 'image', 'other'], required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['uploaded', 'processing', 'ready', 'error'], default: 'uploaded' },
  extractedText: { type: String, default: '' },
  pageCount: { type: Number, default: 0 },
  source: { type: String, default: 'manual_upload' },
  category: {
    type: String,
    enum: ['engineering_drawing', 'maintenance_record', 'safety_procedure', 'inspection_report', 'operating_instruction', 'project_file', 'regulatory', 'incident_report', 'other'],
    default: 'other'
  },
  entityCount: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 0 },
  processingError: { type: String },
  metadata: { type: Map, of: String }
}, { timestamps: true });

documentSchema.index({ status: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ uploadDate: -1 });

export default mongoose.model('Document', documentSchema);
