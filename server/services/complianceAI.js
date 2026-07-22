import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import ComplianceRule from '../models/ComplianceRule.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export async function getDashboard() {
  try {
    const [total, compliant, gaps, pending, bySeverity, byCategory, byRegulation] = await Promise.all([
      ComplianceRule.countDocuments(),
      ComplianceRule.countDocuments({ status: 'compliant' }),
      ComplianceRule.countDocuments({ status: 'gap' }),
      ComplianceRule.countDocuments({ status: 'pending_review' }),
      ComplianceRule.aggregate([
        { $match: { status: 'gap' } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      ComplianceRule.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            compliant: { $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] } },
            gaps: { $sum: { $cond: [{ $eq: ['$status', 'gap'] }, 1, 0] } }
          }
        },
        { $sort: { gaps: -1 } }
      ]),
      ComplianceRule.aggregate([
        {
          $group: {
            _id: '$regulation',
            total: { $sum: 1 },
            compliant: { $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] } },
            gaps: { $sum: { $cond: [{ $eq: ['$status', 'gap'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const complianceScore = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return {
      summary: { total, compliant, gaps, pending, complianceScore },
      gapsBySeverity: bySeverity.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      byCategory,
      byRegulation
    };
  } catch (error) {
    console.error('Compliance dashboard error:', error.message);
    return { summary: {}, gapsBySeverity: {}, byCategory: [], byRegulation: [] };
  }
}

export async function getGaps() {
  try {
    return await ComplianceRule.find({ status: 'gap' })
      .sort({ severity: 1 })
      .lean();
  } catch (error) {
    console.error('Gaps retrieval error:', error.message);
    return [];
  }
}

export async function generateAuditPackage(regulation) {
  try {
    const rules = await ComplianceRule.find(
      regulation ? { regulation } : {}
    ).lean();

    if (rules.length === 0) {
      return { package: 'No compliance rules found.', regulation };
    }

    const rulesText = rules.map(r => `
Regulation: ${r.regulation} - Section ${r.section}
Requirement: ${r.requirement}
Category: ${r.category}
Status: ${r.status}
Gap Description: ${r.gapDescription || 'N/A'}
Applicable Equipment: ${r.applicableEquipment?.join(', ') || 'General'}
Last Audit: ${r.lastAuditDate || 'Never'}
Evidence: ${r.evidence?.join(', ') || 'None available'}
    `).join('\n---\n');

    const prompt = `You are a compliance officer preparing an audit evidence package for an Indian industrial facility.

Generate a comprehensive audit evidence package for the following compliance requirements:

${rulesText}

The package should include:
1. **Executive Summary** — Overall compliance status and key findings
2. **Compliance Matrix** — Table format showing each requirement, status, and evidence
3. **Gap Analysis Report** — Detailed analysis of each non-compliant area
4. **Corrective Action Plan** — Specific steps to close each gap with timelines
5. **Risk Assessment** — Priority ranking of gaps by potential impact
6. **Recommendations** — Short-term and long-term improvement suggestions

Format the response professionally for regulatory audit submission.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 3000 }
    });

    return {
      regulation: regulation || 'All Regulations',
      package: response.text || 'Unable to generate audit package.',
      totalRules: rules.length,
      compliant: rules.filter(r => r.status === 'compliant').length,
      gaps: rules.filter(r => r.status === 'gap').length,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Audit package generation error:', error.message);
    return { package: 'Error generating audit package.', regulation };
  }
}

export default { getDashboard, getGaps, generateAuditPackage };
