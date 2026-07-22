import express from 'express';
import { getFullGraph, getEntityDetails, getGraphStats, searchEntities } from '../services/knowledgeGraph.js';

const router = express.Router();

router.get('/graph', async (req, res) => {
  try {
    const { type, search } = req.query;
    const graph = await getFullGraph({ type, search });
    res.json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await getGraphStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/entities', async (req, res) => {
  try {
    const { q, type, limit } = req.query;
    const entities = await searchEntities(q || '', type, parseInt(limit) || 20);
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/entities/:id', async (req, res) => {
  try {
    const entity = await getEntityDetails(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });
    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
