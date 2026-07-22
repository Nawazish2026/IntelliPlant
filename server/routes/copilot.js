import express from 'express';
import { processQuery, getSuggestedQuestions } from '../services/ragService.js';

const router = express.Router();

const conversations = new Map();

router.post('/chat', async (req, res) => {
  try {
    const { query, conversationId } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const history = conversations.get(conversationId) || [];

    const result = await processQuery(query, history);

    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: result.answer });

    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    const convId = conversationId || `conv_${Date.now()}`;
    conversations.set(convId, history);

    res.json({
      ...result,
      conversationId: convId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Copilot error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/suggestions', (req, res) => {
  res.json(getSuggestedQuestions());
});

router.delete('/conversation/:id', (req, res) => {
  conversations.delete(req.params.id);
  res.json({ message: 'Conversation cleared' });
});

export default router;
