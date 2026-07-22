import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { searchSimilar } from './embeddingService.js';
import Document from '../models/Document.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * RAG Service
 * Retrieval-Augmented Generation pipeline using MongoDB Vector Search + Gemini
 */

const SYSTEM_PROMPT = `You are IntelliPlant AI, an expert industrial knowledge assistant for the Bharat Petrochem Complex. You help engineers, operators, and maintenance technicians find information across the plant's entire document corpus.

RULES:
1. Answer ONLY based on the provided context documents. If the context doesn't contain the answer, say "I don't have enough information in the knowledge base to answer this question accurately."
2. Always cite your sources with [Source: document name] at the end of relevant statements.
3. Be precise with technical values — never approximate unless stated.
4. For maintenance questions, include equipment tags, failure modes, and relevant history.
5. For compliance questions, cite the specific regulation section.
6. For safety queries, err on the side of caution and always mention relevant safety procedures.
7. Provide a confidence score (Low/Medium/High) at the end of your response.
8. Format your response with clear headings and bullet points for readability.
9. If the question relates to multiple documents, synthesize information across them.`;

/**
 * Process a chat query through the RAG pipeline
 */
export async function processQuery(query, conversationHistory = []) {
  try {
    // Step 1: Retrieve relevant chunks via vector search
    const relevantChunks = await searchSimilar(query, 6);

    // Step 2: Build context from retrieved chunks
    let context = '';
    const sources = [];

    if (relevantChunks.length > 0) {
      // Fetch document names for citations
      const docIds = [...new Set(relevantChunks.map(c => c.documentId?.toString()).filter(Boolean))];
      const docs = await Document.find({ _id: { $in: docIds } }).lean();
      const docMap = {};
      docs.forEach(d => { docMap[d._id.toString()] = d; });

      context = relevantChunks.map((chunk, i) => {
        const doc = docMap[chunk.documentId?.toString()];
        const docName = doc?.originalName || chunk.metadata?.documentName || 'Unknown Document';
        const docType = doc?.category || chunk.metadata?.documentType || 'unknown';

        sources.push({
          documentId: chunk.documentId,
          documentName: docName,
          documentType: docType,
          chunkIndex: chunk.chunkIndex,
          score: chunk.score,
          excerpt: chunk.chunkText?.slice(0, 200)
        });

        return `[Document ${i + 1}: ${docName} (Type: ${docType})]:\n${chunk.chunkText}`;
      }).join('\n\n---\n\n');
    }

    // Step 3: Build conversation context
    const messages = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I am IntelliPlant AI, ready to assist with industrial knowledge queries. I will only answer based on the provided context and always cite sources.' }] }
    ];

    // Add conversation history (last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Step 4: Construct the final query with context
    const augmentedQuery = context
      ? `Based on the following retrieved documents from the plant knowledge base:\n\n${context}\n\n---\n\nUser Question: ${query}`
      : `User Question: ${query}\n\nNote: No relevant documents were found in the knowledge base for this query. Please inform the user accordingly.`;

    messages.push({ role: 'user', parts: [{ text: augmentedQuery }] });

    // Step 5: Generate response with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: messages,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    });

    const answer = response.text || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';

    // Determine confidence based on retrieval scores
    const avgScore = sources.length > 0
      ? sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length
      : 0;
    let confidence = 'Low';
    if (avgScore > 0.8) confidence = 'High';
    else if (avgScore > 0.6) confidence = 'Medium';

    return {
      answer,
      sources: sources.slice(0, 5),
      confidence,
      retrievalScore: avgScore,
      chunksUsed: relevantChunks.length
    };
  } catch (error) {
    console.error('RAG processing error:', error.message);
    return {
      answer: 'I encountered an error processing your query. Please try again.',
      sources: [],
      confidence: 'Low',
      retrievalScore: 0,
      chunksUsed: 0,
      error: error.message
    };
  }
}

/**
 * Get suggested questions based on available data
 */
export function getSuggestedQuestions() {
  return [
    "What is the maintenance history of pump P-101?",
    "What are the OISD-116 fire safety requirements for our storage tanks?",
    "Show me all equipment failures related to seal leaks in the last 6 months",
    "What safety precautions are needed before hot work on heat exchanger E-201?",
    "What were the root causes of the last 3 incidents at the plant?",
    "Which equipment is overdue for preventive maintenance?",
    "What are the CPCB emission norms applicable to our flare system?",
    "Summarize the operating procedure for compressor C-301 startup",
  ];
}

export default { processQuery, getSuggestedQuestions };
