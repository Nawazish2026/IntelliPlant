import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import MaintenanceRecord from '../models/MaintenanceRecord.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Maintenance AI Service
 * Root Cause Analysis, predictive maintenance, and schedule optimization
 */

/**
 * Get maintenance dashboard data
 */
export async function getDashboard() {
  try {
    const [
      totalRecords,
      openRecords,
      completedRecords,
      criticalRecords,
      recentRecords,
      equipmentStats
    ] = await Promise.all([
      MaintenanceRecord.countDocuments(),
      MaintenanceRecord.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      MaintenanceRecord.countDocuments({ status: 'completed' }),
      MaintenanceRecord.countDocuments({ priority: 'critical', status: { $ne: 'completed' } }),
      MaintenanceRecord.find().sort({ createdAt: -1 }).limit(10).lean(),
      MaintenanceRecord.aggregate([
        { $group: {
          _id: '$equipmentTag',
          totalWorkOrders: { $sum: 1 },
          totalDowntime: { $sum: '$downtimeHours' },
          totalCost: { $sum: '$costINR' },
          avgHealthScore: { $avg: '$healthScore' },
          lastMaintenance: { $max: '$completedDate' },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$type', 'corrective'] }, 1, 0] }
          }
        }},
        { $sort: { failureCount: -1 } }
      ])
    ]);

    return {
      summary: {
        total: totalRecords,
        open: openRecords,
        completed: completedRecords,
        critical: criticalRecords
      },
      recentRecords,
      equipmentStats: equipmentStats.map(eq => ({
        equipmentTag: eq._id,
        totalWorkOrders: eq.totalWorkOrders,
        totalDowntime: eq.totalDowntime,
        totalCost: eq.totalCost,
        healthScore: Math.round(eq.avgHealthScore || 85),
        lastMaintenance: eq.lastMaintenance,
        failureCount: eq.failureCount
      }))
    };
  } catch (error) {
    console.error('Maintenance dashboard error:', error.message);
    return { summary: {}, recentRecords: [], equipmentStats: [] };
  }
}

/**
 * Generate Root Cause Analysis for an equipment failure
 */
export async function generateRCA(equipmentTag) {
  try {
    // Fetch all maintenance history for this equipment
    const records = await MaintenanceRecord.find({ equipmentTag })
      .sort({ completedDate: -1 })
      .lean();

    if (records.length === 0) {
      return { analysis: 'No maintenance records found for this equipment.', recommendations: [] };
    }

    const historyText = records.map(r => `
Work Order: ${r.workOrderId}
Type: ${r.type} | Priority: ${r.priority} | Status: ${r.status}
Date: ${r.completedDate || r.scheduledDate || 'N/A'}
Description: ${r.description}
Failure Mode: ${r.failureMode || 'N/A'}
Root Cause: ${r.rootCause || 'N/A'}
Resolution: ${r.resolution || 'N/A'}
Technician Notes: ${r.technicianNotes || 'N/A'}
Downtime: ${r.downtimeHours}h | Cost: ₹${r.costINR}
Parts Replaced: ${r.partsReplaced?.join(', ') || 'None'}
    `).join('\n---\n');

    const prompt = `You are a senior reliability engineer performing Root Cause Analysis (RCA) for industrial equipment.

Analyze the complete maintenance history for equipment ${equipmentTag} and provide:

1. **Failure Pattern Analysis**: Identify recurring failure modes and their frequency
2. **Root Cause Identification**: Determine the most likely root causes using the 5-Why methodology
3. **Contributing Factors**: Environmental, operational, or design factors
4. **Risk Assessment**: Current risk level (Critical/High/Medium/Low) with justification
5. **Recommendations**: Specific, actionable recommendations to prevent future failures
6. **Predicted Next Failure**: Based on patterns, when the next failure might occur
7. **Cost Impact**: Total maintenance cost and potential savings from recommended actions

Maintenance History:
${historyText}

Provide your analysis in a structured, professional format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 2048 }
    });

    return {
      equipmentTag,
      analysis: response.text || 'Unable to generate analysis.',
      recordCount: records.length,
      totalDowntime: records.reduce((sum, r) => sum + (r.downtimeHours || 0), 0),
      totalCost: records.reduce((sum, r) => sum + (r.costINR || 0), 0),
      failureModes: [...new Set(records.map(r => r.failureMode).filter(Boolean))]
    };
  } catch (error) {
    console.error('RCA generation error:', error.message);
    return { analysis: 'Error generating RCA. Please try again.', recommendations: [] };
  }
}

/**
 * Get predictive maintenance recommendations
 */
export async function getPredictions() {
  try {
    const equipmentStats = await MaintenanceRecord.aggregate([
      { $group: {
        _id: '$equipmentTag',
        equipmentName: { $first: '$equipmentName' },
        totalWorkOrders: { $sum: 1 },
        correctiveCount: {
          $sum: { $cond: [{ $eq: ['$type', 'corrective'] }, 1, 0] }
        },
        avgDowntime: { $avg: '$downtimeHours' },
        totalCost: { $sum: '$costINR' },
        lastMaintenance: { $max: '$completedDate' },
        healthScore: { $avg: '$healthScore' },
        failureModes: { $addToSet: '$failureMode' }
      }},
      { $sort: { correctiveCount: -1 } }
    ]);

    // Calculate risk scores
    const predictions = equipmentStats.map(eq => {
      const daysSinceLastMaintenance = eq.lastMaintenance
        ? Math.floor((Date.now() - new Date(eq.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const failureRate = eq.totalWorkOrders > 0 ? eq.correctiveCount / eq.totalWorkOrders : 0;
      const riskScore = Math.min(100, Math.round(
        (failureRate * 40) + (Math.min(daysSinceLastMaintenance / 180, 1) * 30) + ((1 - (eq.healthScore || 85) / 100) * 30)
      ));

      return {
        equipmentTag: eq._id,
        equipmentName: eq.equipmentName || eq._id,
        riskScore,
        riskLevel: riskScore >= 70 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low',
        healthScore: Math.round(eq.healthScore || 85),
        daysSinceLastMaintenance,
        failureRate: Math.round(failureRate * 100),
        totalWorkOrders: eq.totalWorkOrders,
        correctiveCount: eq.correctiveCount,
        avgDowntime: Math.round(eq.avgDowntime || 0),
        totalCost: eq.totalCost || 0,
        failureModes: eq.failureModes.filter(Boolean),
        recommendation: riskScore >= 70
          ? 'Immediate inspection recommended'
          : riskScore >= 50
            ? 'Schedule preventive maintenance within 2 weeks'
            : riskScore >= 30
              ? 'Monitor closely during next routine inspection'
              : 'Operating within normal parameters'
      };
    });

    return predictions;
  } catch (error) {
    console.error('Prediction error:', error.message);
    return [];
  }
}

export default { getDashboard, generateRCA, getPredictions };
