from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class ArticleInput(BaseModel):
    id: str
    title: str
    content: Optional[str] = ""
    summary: Optional[str] = ""
    source_name: str
    source_category: Optional[str] = "Mainstream"
    url: Optional[str] = ""
    published_at: Optional[str] = None
    language: Optional[str] = "en"

class EmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int

class ClusterRequest(BaseModel):
    articles: List[ArticleInput]
    threshold: Optional[float] = 0.65

class PerspectiveBreakdown(BaseModel):
    left_count: int = 0
    center_count: int = 0
    right_count: int = 0
    official_count: int = 0
    dominant_perspective: str = "Neutral/Balanced"

class StoryClusterOutput(BaseModel):
    cluster_id: str
    title: str
    representative_article_id: str
    article_ids: List[str]
    articles: List[ArticleInput] = []
    perspectives: PerspectiveBreakdown
    diversity_score: float
    blindspot_detected: Optional[str] = None
    created_at: Optional[str] = None

class ClusterResponse(BaseModel):
    clusters: List[StoryClusterOutput]
    total_articles: int
    clustered_articles: int
    unclustered_article_ids: List[str]

class BiasFactor(BaseModel):
    category: str
    score: float
    description: str

class BiasAnalysisRequest(BaseModel):
    title: str
    content: Optional[str] = ""
    source_name: Optional[str] = ""

class BiasAnalysisResponse(BaseModel):
    perspective: str # "Left", "Center", "Right", "Official"
    confidence: float
    sentiment: str   # "Positive", "Neutral", "Negative", "Critical", "Sensational"
    sentiment_score: float # -1.0 to 1.0
    subjectivity: float # 0.0 (objective) to 1.0 (subjective)
    framing_factors: List[BiasFactor]
    detected_keywords: List[str]
    explanation: str

class SummarizationRequest(BaseModel):
    cluster_id: str
    cluster_title: str
    articles: List[ArticleInput]

class PerspectiveSummaryDetail(BaseModel):
    perspective: str
    angle: str
    articles_quoted: List[str]

class SummarizationResponse(BaseModel):
    cluster_id: str
    consensus_summary: str
    key_facts: List[str]
    perspective_breakdown: List[PerspectiveSummaryDetail]
    coverage_divergence: str

class BlindspotAlert(BaseModel):
    cluster_id: str
    cluster_title: str
    missing_perspective: str # e.g. "Left", "Right", "Center"
    severity: str # "High", "Medium", "Low"
    message: str
    coverage_ratios: Dict[str, float]

class BlindspotResponse(BaseModel):
    total_clusters_analyzed: int
    blindspots: List[BlindspotAlert]

class RAGCitation(BaseModel):
    source_name: str
    article_title: str
    url: Optional[str] = ""
    perspective: Optional[str] = "Center"

class RAGAssistantRequest(BaseModel):
    query: str
    context_articles: List[ArticleInput]
    conversation_history: Optional[List[Dict[str, str]]] = []

class RAGAssistantResponse(BaseModel):
    answer: str
    citations: List[RAGCitation]
    confidence: float
    consensus_note: Optional[str] = None
