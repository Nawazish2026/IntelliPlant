import express from 'express';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import { getDashboard, generateRCA, getPredictions } from '../services/maintenanceAI.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const data = await getDashboard();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/records', async (req, res) => {
  try {
    const { equipmentTag, type, status, priority } = req.query;
    const filter = {};
    if (equipmentTag) filter.equipmentTag = equipmentTag;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const records = await MaintenanceRecord.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rca', async (req, res) => {
  try {
    const { equipmentTag } = req.body;
    if (!equipmentTag) {
      return res.status(400).json({ error: 'equipmentTag is required' });
    }

    const analysis = await generateRCA(equipmentTag);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/predictions', async (req, res) => {
  try {
    const predictions = await getPredictions();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
