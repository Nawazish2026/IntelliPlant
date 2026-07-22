# IntelliPlant — Industrial Knowledge Intelligence Platform

**AI-Powered Unified Asset & Operations Brain**

IntelliPlant is a full-stack platform that ingests heterogeneous industrial documents (PDFs, spreadsheets, engineering drawings, maintenance records), extracts entities, builds a unified knowledge graph, and provides an AI copilot for querying — across all operational functions.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** — [Get free key](https://ai.google.dev)

### 1. Backend Setup
```bash
cd server
cp .env.example .env  # Edit with your Gemini API key and MongoDB URI
npm install
npm run seed          # Load realistic demo data
npm run dev           # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev           # Starts on http://localhost:3000
```

### 3. Configure `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intelliplant
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📋 Features

### 1. Universal Document Ingestion & Knowledge Graph
- Upload PDFs, XLSX, CSV, TXT documents
- AI-powered entity extraction (equipment tags, instruments, personnel, regulations)
- Automatic relationship inference and knowledge graph construction
- Interactive force-directed graph visualization

### 2. Expert Knowledge Copilot
- RAG-powered conversational AI over the full document corpus
- Source citations with confidence scores
- Suggested domain-specific questions
- Conversation history

### 3. Maintenance Intelligence & RCA Agent
- Equipment health scoring and predictive risk assessment
- AI-generated Root Cause Analysis (RCA) using Gemini
- Failure pattern detection across work order history
- Maintenance schedule optimization

### 4. Quality & Regulatory Compliance Intelligence
- Regulatory gap detection (OISD, PESO, Factory Act, CPCB)
- Compliance matrix with status tracking
- AI-generated audit evidence packages
- Quality deviation flagging

### 5. Lessons Learned & Failure Intelligence Engine
- Incident timeline with severity tracking
- AI pattern analysis across incidents and near-misses
- Proactive alerts based on recurring patterns
- Trend analysis and systemic improvement recommendations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + Vite)                │
│  Dashboard │ Docs │ Graph │ Chat │ Maint │ ...  │
└─────────────────┬───────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────┐
│           Backend (Node.js + Express)            │
│  Doc Processor │ Entity Extractor │ RAG Pipeline │
│  Knowledge Graph │ Maintenance AI │ Compliance AI│
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Data Layer                          │
│  MongoDB (Documents + Vector Search)             │
│  Google Gemini (LLM + Embeddings)               │
└─────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Recharts, react-force-graph-2d |
| Styling | Vanilla CSS (premium dark theme) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Atlas Vector Search |
| AI/LLM | Google Gemini API (2.0 Flash + Embedding) |
| Document Processing | pdf-parse, xlsx |

## 📊 Demo Data

The platform ships with realistic synthetic data for **Bharat Petrochem Complex — Jamnagar Unit**, including:
- 10 industrial documents (P&IDs, SOPs, inspection reports, compliance assessments)
- 35+ entities (equipment, instruments, personnel, regulations)
- 40+ knowledge graph relationships
- 15 maintenance work orders with failure history
- 12 compliance rules with gap analysis
- 8 incident reports with lessons learned

<img width="992" height="616" alt="image" src="https://github.com/user-attachments/assets/7b94be7d-715a-49a6-85af-ed7c363d63b3" />

