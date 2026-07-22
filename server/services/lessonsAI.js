import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Incident from '../models/Incident.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDashboard() {
  try {
    const [total, bySeverity, byType, recent, patterns] = await Promise.all([
      Incident.countDocuments(),
      Incident.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Incident.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Incident.find().sort({ date: -1 }).limit(10).lean(),
      Incident.aggregate([
        { $unwind: '$patternTags' },
        { $group: { _id: '$patternTags', count: { $sum: 1 }, incidents: { $push: '$incidentId' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      summary: {
        total,
        bySeverity: bySeverity.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        byType: byType.reduce((acc, t) => { acc[t._id] = t.count; return acc; }, {})
      },
      recentIncidents: recent,
      topPatterns: patterns
    };
  } catch (error) {
    console.error('Lessons dashboard error:', error.message);
    return { summary: {}, recentIncidents: [], topPatterns: [] };
  }
}

export async function analyzePatterns() {
  try {
    const incidents = await Incident.find().sort({ date: -1 }).lean();

    if (incidents.length === 0) {
      return { analysis: 'No incident records available for pattern analysis.', patterns: [] };
    }

    const incidentsText = incidents.map(i => `
ID: ${i.incidentId} | Type: ${i.type} | Severity: ${i.severity}
Date: ${i.date}
Title: ${i.title}
Description: ${i.description}
Equipment: ${i.equipmentInvolved?.join(', ') || 'N/A'}
Root Cause: ${i.rootCause || 'Under investigation'}
Contributing Factors: ${i.contributingFactors?.join(', ') || 'N/A'}
Lessons Learned: ${i.lessonsLearned || 'N/A'}
Pattern Tags: ${i.patternTags?.join(', ') || 'None'}
    `).join('\n---\n');

    const prompt = `You are a senior safety and reliability expert analyzing incident history for an Indian industrial plant.

Analyze ALL the following incidents and identify:

1. **Systemic Patterns**: Recurring themes, root causes, or failure chains that appear across multiple incidents
2. **Hidden Correlations**: Non-obvious connections between incidents (e.g., seasonal patterns, equipment clusters, shift patterns)
3. **Escalation Risk**: Patterns that suggest near-misses could escalate into major incidents
4. **Knowledge Gaps**: Areas where investigation quality is poor or lessons are not being implemented
5. **Proactive Warnings**: Based on patterns identified, generate specific warnings for operational teams
6. **Recommendations**: Systemic improvements (not just fixing individual incidents)

Incident Database:
${incidentsText}

Provide a comprehensive, structured analysis that would be immediately actionable for plant management.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.3, maxOutputTokens: 3000 }
    });

    return {
      analysis: response.text || 'Unable to generate pattern analysis.',
      totalIncidents: incidents.length,
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('Pattern analysis error:', error.message);
    return { analysis: 'Error performing pattern analysis.', patterns: [] };
  }
}

export async function getAlerts() {
  try {
    const patterns = await Incident.aggregate([
      { $unwind: '$patternTags' },
      { $group: {
        _id: '$patternTags',
        count: { $sum: 1 },
        severities: { $push: '$severity' },
        equipmentInvolved: { $push: '$equipmentInvolved' },
        lastOccurrence: { $max: '$date' },
        incidents: { $push: { id: '$incidentId', title: '$title', severity: '$severity' } }
      }},
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } }
    ]);

    return patterns.map(p => ({
      pattern: p._id,
      occurrences: p.count,
      lastOccurrence: p.lastOccurrence,
      severity: p.severities.includes('critical') ? 'critical'
        : p.severities.includes('high') ? 'high'
        : p.severities.includes('medium') ? 'medium' : 'low',
      affectedEquipment: [...new Set(p.equipmentInvolved.flat())],
      relatedIncidents: p.incidents,
      warning: `Pattern "${p._id}" has occurred ${p.count} times. Review affected equipment and procedures to prevent recurrence.`
    }));
  } catch (error) {
    console.error('Alerts error:', error.message);
    return [];
  }
}

export default { getDashboard, analyzePatterns, getAlerts };
