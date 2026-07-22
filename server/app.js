import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Routes
import documentsRouter from './routes/documents.js';
import knowledgeRouter from './routes/knowledge.js';
import copilotRouter from './routes/copilot.js';
import maintenanceRouter from './routes/maintenance.js';
import complianceRouter from './routes/compliance.js';
import lessonsRouter from './routes/lessons.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/documents', documentsRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/copilot', copilotRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/lessons', lessonsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'IntelliPlant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🏭 IntelliPlant Server Running                 ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  ║
║   Port: ${PORT}                                    ║
║   Mode: ${process.env.NODE_ENV || 'development'}                          ║
║   API:  http://localhost:${PORT}/api               ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);
  });
};

startServer();

export default app;
