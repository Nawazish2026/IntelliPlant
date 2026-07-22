import express from 'express';
import { processQuery, getSuggestedQuestions } from '../services/ragService.js';

const router = express.Router();

// In-memory conversation store (for demo; use MongoDB for production)
const conversations = new Map();

/**
 * POST /api/copilot/chat
 * Process a chat query through the RAG pipeline
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, conversationId } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get or create conversation history
    const history = conversations.get(conversationId) || [];

    // Process through RAG pipeline
    const result = await processQuery(query, history);

    // Store in conversation history
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: result.answer });

    // Keep only last 20 messages
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

/**
 * GET /api/copilot/suggestions
 * Get suggested questions
 */
router.get('/suggestions', (req, res) => {
  res.json(getSuggestedQuestions());
});

/**
 * DELETE /api/copilot/conversation/:id
 * Clear a conversation
 */
router.delete('/conversation/:id', (req, res) => {
  conversations.delete(req.params.id);
  res.json({ message: 'Conversation cleared' });
});

export default router;
