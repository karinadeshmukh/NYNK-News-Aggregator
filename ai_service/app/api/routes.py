from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import (
    EmbeddingRequest, EmbeddingResponse,
    ClusterRequest, ClusterResponse,
    BiasAnalysisRequest, BiasAnalysisResponse,
    SummarizationRequest, SummarizationResponse,
    BlindspotResponse, BlindspotAlert,
    RAGAssistantRequest, RAGAssistantResponse
)
from app.services.embedding_service import embedding_service
from app.services.cluster_service import cluster_service
from app.services.bias_service import bias_service
from app.services.summary_service import summary_service
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(payload: EmbeddingRequest):
    try:
        embeddings = embedding_service.get_embeddings(payload.texts)
        dim = len(embeddings[0]) if embeddings else 0
        return EmbeddingResponse(embeddings=embeddings, dimensions=dim)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cluster", response_model=ClusterResponse)
async def cluster_news(payload: ClusterRequest):
    try:
        return cluster_service.cluster_articles(payload.articles, payload.threshold or 0.65)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bias/analyze", response_model=BiasAnalysisResponse)
async def analyze_bias(payload: BiasAnalysisRequest):
    try:
        return bias_service.analyze_text(payload.title, payload.content or "", payload.source_name or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary/cluster", response_model=SummarizationResponse)
async def summarize_cluster(payload: SummarizationRequest):
    try:
        return summary_service.generate_cluster_summary(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assistant/ask", response_model=RAGAssistantResponse)
async def ask_assistant(payload: RAGAssistantRequest):
    try:
        return await rag_service.ask_assistant(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NYNK AI Microservice",
        "version": "1.0.0",
        "fallback_mode": embedding_service._fallback_mode
    }
