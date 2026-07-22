import express from 'express';
import ComplianceRule from '../models/ComplianceRule.js';
import { getDashboard, getGaps, generateAuditPackage } from '../services/complianceAI.js';

const router = express.Router();

/**
 * GET /api/compliance/dashboard
 * Get compliance dashboard data
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
 * GET /api/compliance/rules
 * Get all compliance rules
 */
router.get('/rules', async (req, res) => {
  try {
    const { regulation, category, status } = req.query;
    const filter = {};
    if (regulation) filter.regulation = regulation;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const rules = await ComplianceRule.find(filter).sort({ regulation: 1, section: 1 }).lean();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/compliance/gaps
 * Get all compliance gaps
 */
router.get('/gaps', async (req, res) => {
  try {
    const gaps = await getGaps();
    res.json(gaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/compliance/audit-package
 * Generate audit evidence package
 */
router.post('/audit-package', async (req, res) => {
  try {
    const { regulation } = req.body;
    const pkg = await generateAuditPackage(regulation);
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
