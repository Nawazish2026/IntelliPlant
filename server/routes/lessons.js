import express from 'express';
import Incident from '../models/Incident.js';
import { getDashboard, analyzePatterns, getAlerts } from '../services/lessonsAI.js';

const router = express.Router();

/**
 * GET /api/lessons/dashboard
 * Get lessons learned dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const data = await getDashboard();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lessons/incidents
 * Get all incidents
 */
router.get('/incidents', async (req, res) => {
  try {
    const { type, severity, equipment } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (equipment) filter.equipmentInvolved = equipment;

    const incidents = await Incident.find(filter).sort({ date: -1 }).lean();
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/lessons/analyze
 * Analyze incident patterns using AI
 */
router.post('/analyze', async (req, res) => {
  try {
    const analysis = await analyzePatterns();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lessons/alerts
 * Get proactive alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await getAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
