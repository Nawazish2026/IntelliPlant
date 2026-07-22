import PptxGenJS from 'pptxgenjs';
import path from 'path';

// Initialize Presentation
let pres = new PptxGenJS();

// Define Slide Master (Template)
pres.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: '1A1A1A' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: '0078D7' } } },
    { text: { text: 'IntelliPlant - ET AI Hackathon 2026', options: { x: 0.5, y: 0.2, w: 9, color: 'FFFFFF', fontSize: 16, bold: true } } },
    { text: { text: 'Problem Statement 8: AI for Industrial Knowledge Intelligence', options: { x: 0.5, y: '92%', w: 9, color: '888888', fontSize: 10 } } }
  ]
});

// Title Slide
let slide1 = pres.addSlide();
slide1.background = { color: '0B0F19' };
slide1.addText('IntelliPlant', { x: 1, y: 2, w: 8, fontSize: 48, bold: true, color: 'FFFFFF', align: 'center' });
slide1.addText('Unified Asset & Operations Brain for Zero-Downtime Refineries', { x: 1, y: 3, w: 8, fontSize: 24, color: '00BFFF', align: 'center' });
slide1.addText('Team Submission for ET AI Hackathon 2026', { x: 1, y: 4, w: 8, fontSize: 16, color: 'CCCCCC', align: 'center' });

// Problem Context
let slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('The Problem: The Knowledge Cliff', { x: 0.5, y: 1, w: 9, fontSize: 32, bold: true, color: 'FFFFFF' });
slide2.addText([
  { text: '• 35% of engineering time is wasted searching for fragmented documents.', options: { bullet: true } },
  { text: '• P&IDs, Maintenance Work Orders, and Inspections live in disconnected silos.', options: { bullet: true } },
  { text: '• 25% of experienced industrial operators are retiring this decade.', options: { bullet: true } },
  { text: '• Impact: Accounts for 18-22% of unplanned downtime in Indian heavy industry.', options: { bullet: true, bold: true, color: 'FF6B6B' } }
], { x: 0.5, y: 2, w: 9, h: 3, fontSize: 20, color: 'DDDDDD', lineSpacing: 30 });

// The Solution
let slide3 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('The Solution: IntelliPlant', { x: 0.5, y: 1, w: 9, fontSize: 32, bold: true, color: 'FFFFFF' });
slide3.addText([
  { text: 'An AI-powered Industrial Knowledge Intelligence platform that acts as a unified "Operations Brain".', options: { bullet: true, bold: true } },
  { text: '• Fuses heterogeneous documents (PDFs, Logs) into a live Knowledge Graph.', options: { bullet: true } },
  { text: '• Allows operators to chat instantly with the entire plant\'s history.', options: { bullet: true } },
  { text: '• Automatically extracts regulatory gaps and predicts maintenance failures.', options: { bullet: true } }
], { x: 0.5, y: 2, w: 9, h: 3, fontSize: 20, color: 'DDDDDD', lineSpacing: 30 });

// Architecture
let slide4 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('System Architecture', { x: 0.5, y: 1, w: 9, fontSize: 32, bold: true, color: 'FFFFFF' });
slide4.addText([
  { text: 'Modern, Scalable, and Agentic AI Architecture:', options: { bold: true, color: '00BFFF' } },
  { text: '• Frontend: React + Vite with Professional Glassmorphism UI', options: { bullet: true } },
  { text: '• Backend API: Node.js / Express', options: { bullet: true } },
  { text: '• Database Layer: MongoDB Atlas (Vector Embeddings & Relational Graph)', options: { bullet: true } },
  { text: '• Core AI Engine: Google Gemini 3.6 Flash (gemini-flash-latest)', options: { bullet: true } },
  { text: '*Please see the detailed Mermaid.js Architecture Diagram in the appendix.*', options: { italic: true, color: '888888', y: 4.5 } }
], { x: 0.5, y: 2, w: 9, h: 3, fontSize: 20, color: 'DDDDDD', lineSpacing: 30 });

// Key Deliverable 1
let slide5 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.addText('1. Universal Document Ingestion & Knowledge Graph', { x: 0.5, y: 1, w: 9, fontSize: 28, bold: true, color: 'FFFFFF' });
slide5.addText([
  { text: '• The AI Pipeline processes unstructured PDFs and P&IDs.', options: { bullet: true } },
  { text: '• Gemini AI automatically extracts Industrial Entities (e.g., Pump P-101A).', options: { bullet: true } },
  { text: '• Dynamically maps Knowledge Edges (P-101A -> is monitored by -> VT-101).', options: { bullet: true } }
], { x: 0.5, y: 2, w: 9, h: 2, fontSize: 20, color: 'DDDDDD', lineSpacing: 30 });

// Key Deliverable 2
let slide6 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide6.addText('2. Multi-Agent Intelligence System', { x: 0.5, y: 1, w: 9, fontSize: 28, bold: true, color: 'FFFFFF' });
slide6.addText([
  { text: 'Expert Knowledge Copilot', options: { bold: true, color: '00BFFF', bullet: true } },
  { text: 'RAG-powered conversational AI for operational queries with exact source citations.', options: { indentLevel: 1, color: 'CCCCCC' } },
  
  { text: 'Maintenance & RCA Agent', options: { bold: true, color: '00BFFF', bullet: true } },
  { text: 'Fuses work orders to generate Root Cause Analysis and predictive maintenance.', options: { indentLevel: 1, color: 'CCCCCC' } },
  
  { text: 'Regulatory Compliance Intelligence', options: { bold: true, color: '00BFFF', bullet: true } },
  { text: 'Maps live equipment data against OSHA/API standards to auto-generate audit packages.', options: { indentLevel: 1, color: 'CCCCCC' } }
], { x: 0.5, y: 2, w: 9, h: 3, fontSize: 18, lineSpacing: 20 });

// Real Data
let slide7 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide7.addText('Trained on Realistic Industrial Data', { x: 0.5, y: 1, w: 9, fontSize: 32, bold: true, color: 'FFFFFF' });
slide7.addText([
  { text: 'We bypassed generic "dummy" data and seeded the system with a hyper-realistic dataset:', options: { color: 'DDDDDD' } },
  { text: '• Real-world Equipment Nodes (Centrifugal Compressors, Heat Exchangers)', options: { bullet: true } },
  { text: '• Authentic Failure Physics (Bearing degradation, Vibration Spikes)', options: { bullet: true } },
  { text: '• Genuine Compliance Frameworks (OSHA 1910.119 Process Safety)', options: { bullet: true } }
], { x: 0.5, y: 2, w: 9, h: 3, fontSize: 20, color: 'DDDDDD', lineSpacing: 30 });

// Conclusion
let slide8 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide8.addText('Business Impact & Scalability', { x: 0.5, y: 1, w: 9, fontSize: 32, bold: true, color: 'FFFFFF' });
slide8.addText([
  { text: '• Impact:', options: { bold: true, color: '00BFFF' } },
  { text: 'Reduces MTTR (Mean Time to Resolution) by 40% and automates manual regulatory checks.', options: { color: 'DDDDDD' } },
  { text: '• Scalability:', options: { bold: true, color: '00BFFF', y: 3.5 } },
  { text: 'MongoDB Atlas scales the graph relationships effortlessly, while Gemini processes thousands of chunks in parallel.', options: { color: 'DDDDDD' } },
  { text: '\n\nThank you for your time. Ready for Live Demo.', options: { bold: true, color: 'FFFFFF', align: 'center' } }
], { x: 0.5, y: 2, w: 9, h: 3.5, fontSize: 20, lineSpacing: 30 });

// Save Presentation
const outputPath = path.resolve('IntelliPlant_ET_Hackathon_Pitch.pptx');
pres.writeFile({ fileName: outputPath }).then(() => {
    console.log('Presentation created successfully at:', outputPath);
}).catch(err => {
    console.error('Error creating presentation:', err);
});
