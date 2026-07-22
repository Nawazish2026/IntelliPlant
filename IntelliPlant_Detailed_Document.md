# IntelliPlant: Unified Asset & Operations Brain
## ET AI Hackathon 2.0 - Phase 2 Submission
**Problem Statement 8: AI for Industrial Knowledge Intelligence**

---

### 1. Executive Summary
The heavy industrial sector in India is facing a dual crisis: unprecedented information fragmentation and a looming "knowledge cliff" as experienced operators retire. According to industry studies, 18-22% of unplanned downtime is directly caused by maintenance and engineering teams lacking complete context during critical events. 

**IntelliPlant** is an AI-powered Industrial Knowledge Intelligence platform designed specifically to solve this. It serves as a "Unified Operations Brain," ingesting heterogeneous data silos (P&IDs, maintenance logs, inspection reports, and safety manuals) into a highly relational, vector-searchable Knowledge Graph. It transforms static documents into a dynamic, queryable, and predictive intelligence layer.

---

### 2. Core Architecture & Tech Stack
Our platform utilizes a modern, highly scalable architecture combining Agentic AI with robust data persistence.

*   **Frontend:** React, Vite, and CSS Variables (Glassmorphism design for professional, glare-free industrial usage).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB Atlas (Combining standard relational models for Knowledge Edges and Vector Embeddings for semantic RAG search).
*   **AI Engine:** Google Gemini 3.6 Flash (`gemini-flash-latest`) for multi-modal parsing, Entity Extraction, and Copilot intelligence.

---

### 3. Key Deliverables & Features Built

#### 3.1. Universal Document Ingestion & Knowledge Graph Agent
*   **Implementation:** We built a custom document pipeline (`documentProcessor.js`) that uses `pdf-parse` to read unstructured industrial files. 
*   **AI Extraction:** The Gemini AI agent automatically extracts critical industrial entities (e.g., Equipment Tags like P-101A, Personnel, Processes) and categorizes the document.
*   **Graph Mapping:** The AI maps relationships (e.g., `[Sensor VT-101] monitors [Pump P-101A]`) and stores these as `KnowledgeEdges` in MongoDB, creating a live digital twin of plant relationships.

#### 3.2. Expert Knowledge Copilot (RAG)
*   **Implementation:** A conversational interface embedded directly in the platform.
*   **Functionality:** Powered by Retrieval-Augmented Generation (RAG). When an operator asks a question (e.g., "What is the acceptable vibration limit for P-101A?"), the Copilot queries the vectorized MongoDB documents, retrieves the exact OEM manual context, and generates a precise answer with source citations.

#### 3.3. Maintenance Intelligence & Root Cause Analysis (RCA) Agent
*   **Implementation:** The `maintenanceAI.js` service correlates live/historical incident data with work orders.
*   **Functionality:** It detects patterns (e.g., recurring seal failures on crude feed pumps) and generates predictive maintenance suggestions and structured RCA reports before catastrophic downtime occurs.

#### 3.4. Quality & Regulatory Compliance Intelligence
*   **Implementation:** The `complianceAI.js` service maps plant equipment conditions against ingested regulatory frameworks (e.g., OSHA 1910.119 Process Safety Management).
*   **Functionality:** It automatically generates comprehensive audit evidence packages, identifies non-compliant gaps, and recommends corrective workflows.

---

### 4. Real-World Data Seeding
To prove the viability of the platform, IntelliPlant was strictly developed and tested against hyper-realistic industrial data structures inspired by NASA Turbofan and real oil/gas predictive maintenance datasets. 
*   Rather than relying on generic "Lorem Ipsum" text, the platform's MongoDB database successfully ingests and maps real-world physics failures (e.g., bearing degradation) and genuine regulatory standards (API RP 686).

### 5. Future Scalability & Conclusion
IntelliPlant is designed to scale horizontally via MongoDB Atlas. The agentic AI layer is model-agnostic, though highly optimized for Google Gemini's massive context window, ensuring that as a refinery generates gigabytes of new shift logs daily, the "Unified Operations Brain" only grows smarter. 

This platform completely shifts industrial knowledge management from a reactive, manual search process into a proactive, intelligent, and zero-downtime operation.
