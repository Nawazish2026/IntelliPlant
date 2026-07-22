import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



const EXTRACTION_PROMPT = `You are an industrial knowledge extraction expert. Analyze the following document text from an industrial plant and extract ALL entities.

For each entity, provide:
- name: The entity identifier or name
- type: One of: equipment, instrument, personnel, process, chemical, regulation, location, date, parameter, document_ref
- subType: More specific classification (e.g., for equipment: pump, valve, heat_exchanger, compressor, vessel, tank, motor)
- attributes: Key-value pairs of relevant properties
- confidence: 0.0 to 1.0 confidence score

IMPORTANT RULES:
1. Equipment tags follow patterns like P-101, V-203, E-301, C-401, TK-501
2. Instruments follow patterns like TT-101 (temperature), PT-201 (pressure), FT-301 (flow), LT-401 (level)
3. Extract ALL regulatory references (OISD, PESO, Factory Act, BIS, CPCB, etc.)
4. Extract process parameters with units (temperature: 350°C, pressure: 15 bar, etc.)
5. Extract personnel with roles if mentioned

Also identify RELATIONSHIPS between entities found in this text. For each relationship provide:
- source: source entity name
- target: target entity name
- relationship: One of: connected_to, maintained_by, regulated_by, located_at, caused_by, resolved_by, references, operated_by, part_of, monitors, controls, feeds_into, inspected_by

Return ONLY valid JSON in this exact format:
{
  "entities": [
    { "name": "...", "type": "...", "subType": "...", "attributes": {...}, "confidence": 0.9, "description": "..." }
  ],
  "relationships": [
    { "source": "...", "target": "...", "relationship": "...", "confidence": 0.8 }
  ]
}

Document text to analyze:
`;

export async function extractEntities(text, documentType = 'general') {
  try {
    const maxChars = 15000;
    const truncatedText = text.length > maxChars
      ? text.slice(0, maxChars) + '\n\n[... text truncated for processing ...]'
      : text;

    const contextNote = `\n[Document Type: ${documentType}]\n\n`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{
        parts: [{ text: EXTRACTION_PROMPT + contextNote + truncatedText }]
      }],
      config: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    });

    const responseText = response.text || '';

    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonStr);
    return {
      entities: result.entities || [],
      relationships: result.relationships || []
    };
  } catch (error) {
    console.error('Entity extraction error:', error.message);
    return { entities: [], relationships: [] };
  }
}

export async function categorizeDocument(text) {
  try {
    const prompt = `Analyze this industrial document text and categorize it into exactly ONE of these categories:
- engineering_drawing: P&IDs, process flow diagrams, equipment layouts
- maintenance_record: Work orders, maintenance logs, repair records
- safety_procedure: Safety SOPs, emergency procedures, HAZOP
- inspection_report: Equipment inspection reports, NDT reports
- operating_instruction: Standard Operating Procedures, operating manuals
- project_file: Project documentation, MOC records
- regulatory: Regulatory submissions, compliance documents
- incident_report: Incident reports, near-miss records, investigation reports
- other: Anything else

Return ONLY the category name, nothing else.

Document text (first 2000 chars):
${text.slice(0, 2000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0, maxOutputTokens: 50 }
    });

    const category = (response.text || 'other').trim().toLowerCase().replace(/[^a-z_]/g, '');
    const validCategories = ['engineering_drawing', 'maintenance_record', 'safety_procedure', 'inspection_report', 'operating_instruction', 'project_file', 'regulatory', 'incident_report', 'other'];
    return validCategories.includes(category) ? category : 'other';
  } catch (error) {
    console.error('Document categorization error:', error.message);
    return 'other';
  }
}

export default { extractEntities, categorizeDocument };
