import fs from 'fs';
import path from 'path';

/**
 * Document Processor Service
 * Handles text extraction from various document formats
 * Uses pdf-parse for digital PDFs, xlsx for spreadsheets
 */

// Dynamic import for pdf-parse (CommonJS module)
let pdfParse;
const loadPdfParse = async () => {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default;
  }
  return pdfParse;
};

/**
 * Extract text from a PDF file
 */
export async function extractFromPDF(filePath) {
  try {
    const parse = await loadPdfParse();
    const dataBuffer = fs.readFileSync(filePath);
    const data = await parse(dataBuffer);
    return {
      text: data.text,
      pageCount: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return { text: '', pageCount: 0, info: {} };
  }
}

/**
 * Extract text from Excel/CSV files
 */
export async function extractFromSpreadsheet(filePath) {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile(filePath);
    let allText = '';

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      allText += `\n--- Sheet: ${sheetName} ---\n${csv}`;
    });

    return {
      text: allText.trim(),
      pageCount: workbook.SheetNames.length,
      info: { sheets: workbook.SheetNames }
    };
  } catch (error) {
    console.error('Spreadsheet extraction error:', error.message);
    return { text: '', pageCount: 0, info: {} };
  }
}

/**
 * Extract text from plain text files
 */
export async function extractFromText(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    return {
      text,
      pageCount: 1,
      info: {}
    };
  } catch (error) {
    console.error('Text extraction error:', error.message);
    return { text: '', pageCount: 0, info: {} };
  }
}

/**
 * Process any supported document type
 */
export async function processDocument(filePath, fileType) {
  switch (fileType) {
    case 'pdf':
      return extractFromPDF(filePath);
    case 'xlsx':
    case 'csv':
      return extractFromSpreadsheet(filePath);
    case 'txt':
    case 'docx':
      return extractFromText(filePath);
    default:
      return { text: '', pageCount: 0, info: {} };
  }
}

/**
 * Chunk text into overlapping segments for embedding
 * @param {string} text - Full document text
 * @param {number} chunkSize - Characters per chunk (default 500)
 * @param {number} overlap - Overlap characters (default 100)
 * @returns {Array<{text: string, index: number}>}
 */
export function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || text.length === 0) return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at sentence or word boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    chunks.push({
      text: chunk.trim(),
      index: index++
    });

    start += chunk.length - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

/**
 * Detect file type from filename
 */
export function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const typeMap = {
    'pdf': 'pdf',
    'xlsx': 'xlsx',
    'xls': 'xlsx',
    'csv': 'csv',
    'txt': 'txt',
    'doc': 'docx',
    'docx': 'docx',
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'tiff': 'image',
    'tif': 'image'
  };
  return typeMap[ext] || 'other';
}
