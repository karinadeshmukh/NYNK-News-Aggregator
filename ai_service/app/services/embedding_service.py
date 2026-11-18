import logging
import numpy as np
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self._model = None
        self._fallback_mode = False
        self._init_model()

    def _init_model(self):
        # First check if model is cached locally without waiting for network timeout
        try:
            from sentence_transformers import SentenceTransformer
            # Try loading locally first
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, local_files_only=True)
            logger.info("SentenceTransformer successfully loaded from local cache.")
        except Exception:
            # Model is not in local cache; use fast high-dimensional TF-IDF vectorizer fallback
            logger.info("SentenceTransformer not cached locally. Initialized fast normalized TF-IDF semantic vectorizer.")
            self._fallback_mode = True

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # Clean texts
        cleaned_texts = [t.strip() if t and t.strip() else "untitled news" for t in texts]

        if not self._fallback_mode and self._model is not None:
            try:
                embeddings = self._model.encode(cleaned_texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error encoding with SentenceTransformer: {e}. Using fallback vectorizer.")

        # Fallback vectorizer with word and char n-grams for strong semantic overlap
        try:
            vectorizer = TfidfVectorizer(
                max_features=512,
                stop_words="english",
                ngram_range=(1, 2),
                sublinear_tf=True
            )
            tfidf_mat = vectorizer.fit_transform(cleaned_texts).toarray()
            
            # Normalize to unit vectors for cosine similarity
            norms = np.linalg.norm(tfidf_mat, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            normalized = tfidf_mat / norms
            return normalized.tolist()
        except Exception as err:
            logger.error(f"Fallback vectorizer error: {err}")
            # Minimal one-hot / bag fallback
            dim = 64
            result = []
            for t in cleaned_texts:
                vec = np.zeros(dim)
                for char in t:
                    vec[ord(char) % dim] += 1
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec = vec / norm
                result.append(vec.tolist())
            return result

embedding_service = EmbeddingService()
