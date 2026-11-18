# **NYNK – News You Need to Know**

> **AI-Powered Multiperspective News Aggregator & Intelligence Platform**

NYNK is an end-to-end news intelligence platform built to counter media echo chambers, illuminate coverage blindspots, and provide transparent, multi-angle news analysis with explainable AI.

---

## 🌟 Key Features

1. **Multi-Source News Aggregation**: Ingests articles from official state sources (Press Information Bureau - PIB), national dailies (The Indian Express, The Hindu, Times of India), and digital newsrooms across the political spectrum (The Wire, OpIndia, Swarajya, BBC, Reuters).
2. **Semantic News Clustering**: Employs vector embeddings and cosine similarity to group reports covering the same event from different media outlets into a single story cluster.
3. **Explainable Bias & Framing Analysis**: Classifies articles into **Official (PIB)**, **Left**, **Center**, and **Right** perspectives with explainable sentiment scores, subjectivity metrics, framing factors, and detected keywords.
4. **Media Blindspot Detection**: Flags stories that receive heavy attention on one side of the media spectrum but are under-covered or ignored by other editorial perspectives.
5. **Story Comparison Matrix**: Displays side-by-side comparative views of multiple publishers' headlines, angles, and quotes for the identical event.
6. **Consensus & Divergence Summarization**: Generates an agreed-upon core factual summary alongside an explicit breakdown of editorial divergence.
7. **Interactive AI News Assistant**: RAG-grounded conversational agent that answers user queries with source citations, publisher perspective notes, and consensus insights.
8. **Personalization**: Filter by topics (Technology, Economy, Governance, National, World), regions, and custom interests.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend API Gateway**: Node.js, Express.js, TypeScript, Mongoose, RSS-Parser, Axios.
- **Database**: MongoDB (with seamless in-memory fallback for immediate zero-config standalone development).
- **AI Microservice**: Python 3.12, FastAPI, Pydantic v2, Scikit-Learn, SentenceTransformers, OpenRouter API.

---

## 🚀 Quick Start Guide

### Option 1: Running with Docker Compose (Recommended)

```bash
docker-compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Health: `/health`, Docs: `/api/...`)
- **AI Microservice**: [http://localhost:8000](http://localhost:8000) (Swagger: `/docs`)

---

### Option 2: Running Locally for Development

#### 1. AI Microservice (FastAPI)
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```
*Runs on `http://127.0.0.1:8000`*

#### 2. Backend Gateway (Node.js / Express)
```bash
cd backend
npm install
npm run build
npm start
```
*Runs on `http://localhost:5000`*

#### 3. Frontend App (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

---

## 🧪 Testing

### Backend Unit Tests:
```bash
cd backend
npm test
```

### AI Microservice Unit Tests:
```bash
cd ai_service
python -m unittest discover -s tests
```

### Frontend Build Verification:
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License © 2026 NYNK Intelligence

