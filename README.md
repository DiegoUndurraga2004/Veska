<div align="center">

# Veska

### Privacy-oriented document intelligence for organizations

A full-stack Retrieval-Augmented Generation (RAG) platform designed to help organizations securely search, understand and interact with their internal documentation.

![Next.js](https://img.shields.io/badge/Next.js-0D1117?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-0D1117?style=for-the-badge&logo=typescript&logoColor=58A6FF)
![Python](https://img.shields.io/badge/Python-0D1117?style=for-the-badge&logo=python&logoColor=58A6FF)
![FastAPI](https://img.shields.io/badge/FastAPI-0D1117?style=for-the-badge&logo=fastapi&logoColor=58A6FF)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0D1117?style=for-the-badge&logo=postgresql&logoColor=58A6FF)

</div>

---

## Overview

Veska is a personal software project exploring how organizations can make large collections of internal documents accessible through a conversational interface without losing sight of privacy, access control and data ownership.

Instead of manually searching through folders, PDFs and internal documentation, users can ask questions in natural language and receive answers grounded in the organization's own documents.

The project was designed around a **Retrieval-Augmented Generation (RAG)** architecture, combining document processing, semantic search and large language models.

---

## Why I built it

Organizations often accumulate large amounts of internal knowledge across documents, policies, manuals and reports.

Finding the right information can become slow and fragmented.

Veska explores a different workflow:

```text
Internal documents
        │
        ▼
Document processing
        │
        ▼
Chunking & embeddings
        │
        ▼
Vector search
        │
        ▼
Relevant context
        │
        ▼
Large Language Model
        │
        ▼
Grounded response
```

The project also explores an important architectural trade-off in enterprise AI:

**convenience vs. data privacy.**

Veska was designed to support both external model APIs and more privacy-oriented inference architectures where the model can be hosted separately from third-party AI providers.

---

## Architecture

```text
                        ┌──────────────────────┐
                        │        User          │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Next.js Frontend   │
                        │     TypeScript       │
                        └──────────┬───────────┘
                                   │
                              REST API
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   FastAPI Backend    │
                        │       Python         │
                        └──────────┬───────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
        Document Processing   Vector Search      LLM Inference
                │                  │                  │
                ▼                  ▼                  ▼
        Chunking/Embeddings    PostgreSQL /      External API
                               pgvector           or private
                                                   inference
```

The frontend and backend are maintained inside the same repository to keep the entire product architecture visible and versioned together.

---

## Repository structure

```text
Veska/
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── docs/
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

### Frontend

Built with:

- Next.js
- React
- TypeScript
- Tailwind CSS

Responsible for the user-facing application and communication with the backend API.

### Backend

Built with:

- Python
- FastAPI
- Pydantic
- Uvicorn

Responsible for application logic, validation, authorization, document processing, data access and AI-related services.

---

## RAG pipeline

At a high level, the retrieval pipeline follows four stages.

### 1. Document ingestion

Documents are processed and converted into a format suitable for semantic retrieval.

### 2. Chunking & embeddings

Documents are divided into smaller semantic units and transformed into vector embeddings.

### 3. Retrieval

When a user submits a question, its semantic representation is compared against the stored document vectors to retrieve the most relevant context.

### 4. Generation

The retrieved context is provided to a language model together with the user's query, allowing the response to remain grounded in the organization's own information.

---

## Data & vector search

The project explores the use of:

- PostgreSQL
- pgvector
- vector embeddings
- semantic similarity search
- document metadata

This allows Veska to retrieve information based on **meaning**, rather than relying only on exact keyword matching.

---

## Privacy-oriented inference

One of the main design questions behind Veska is how organizations can use generative AI while retaining greater control over sensitive information.

The architecture considers two approaches:

### External model API

```text
Veska Backend
     │
     ▼
External LLM API
```

Useful for rapid deployment and access to high-quality hosted models.

### Private inference

```text
Veska Backend
     │
     ▼
Private inference environment
     │
     ▼
Self-hosted / isolated model
```

This approach is intended for scenarios where organizations require greater control over where their information is processed.

---

## Security considerations

Because Veska is designed around internal organizational documents, security is a fundamental part of the architecture.

Current and planned considerations include:

- separation between public and server-side credentials
- environment-based secrets management
- authentication and authorization before sensitive operations
- tenant-aware data access
- restricted document access
- secure API communication
- separation between development and production environments
- no real organizational documents in development environments

As the project evolves, I plan to explore additional controls including:

- stronger tenant isolation
- cloud IAM
- encryption and key management
- audit logging
- secure CI/CD
- automated dependency and code scanning
- infrastructure security
- threat modeling
- defenses against RAG-specific attacks such as prompt injection

---

## Local development

### Clone the repository

```bash
git clone https://github.com/DiegoUndurraga2004/Veska.git
cd Veska
```

---

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

### Backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

---

## Development principles

The project follows a few simple principles:

**Privacy by design**  
Sensitive organizational information should influence architectural decisions from the beginning.

**Separation of concerns**  
Frontend, application logic, retrieval and inference are treated as distinct components.

**Security at the backend boundary**  
Sensitive authorization and data-access decisions must not rely on frontend controls.

**Learn by building**  
Veska is also an ongoing engineering project used to explore software architecture, AI infrastructure and security concepts through implementation.

---

## Current status

Veska is currently an **MVP / active development project**.

The current work focuses on building the core application architecture and RAG functionality. Future iterations will increasingly focus on infrastructure, deployment automation and security engineering.

---

## Roadmap

Planned areas of development include:

- [ ] Expand document ingestion pipeline
- [ ] Improve retrieval and ranking
- [ ] Add stronger authentication and authorization
- [ ] Implement tenant isolation
- [ ] Containerize frontend and backend
- [ ] Add automated tests
- [ ] Build CI/CD pipelines
- [ ] Add automated security scanning
- [ ] Deploy infrastructure in the cloud
- [ ] Manage infrastructure through Terraform
- [ ] Add centralized logging and observability
- [ ] Perform application threat modeling
- [ ] Explore security controls for RAG-specific threats

---

## What I learned

Building Veska has allowed me to explore the intersection between:

- full-stack software engineering
- REST API design
- Python backend development
- document processing
- vector databases
- embeddings
- Retrieval-Augmented Generation
- AI infrastructure
- privacy and security architecture

The project is now also serving as a platform for my ongoing work in **Cloud and Security Engineering**.

---

<div align="center">

Built as a personal engineering project exploring  
**Software · AI · Cloud · Security**

</div>
