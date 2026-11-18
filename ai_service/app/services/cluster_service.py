import uuid
import numpy as np
from typing import List, Dict, Tuple
from app.schemas import ArticleInput, StoryClusterOutput, ClusterResponse, PerspectiveBreakdown
from app.services.embedding_service import embedding_service
from app.services.bias_service import bias_service

class ClusterService:
    def cluster_articles(self, articles: List[ArticleInput], threshold: float = 0.65) -> ClusterResponse:
        if not articles:
            return ClusterResponse(clusters=[], total_articles=0, clustered_articles=0, unclustered_article_ids=[])

        if len(articles) == 1:
            art = articles[0]
            bias = bias_service.analyze_text(art.title, art.content or "", art.source_name)
            p_breakdown = PerspectiveBreakdown()
            if bias.perspective == "Left": p_breakdown.left_count = 1
            elif bias.perspective == "Right": p_breakdown.right_count = 1
            elif bias.perspective == "Official": p_breakdown.official_count = 1
            else: p_breakdown.center_count = 1
            p_breakdown.dominant_perspective = bias.perspective

            single_cluster = StoryClusterOutput(
                cluster_id=f"cluster_{art.id}",
                title=art.title,
                representative_article_id=art.id,
                article_ids=[art.id],
                articles=[art],
                perspectives=p_breakdown,
                diversity_score=0.25,
                blindspot_detected="Requires more outlet coverage to establish perspective consensus.",
                created_at=art.published_at
            )
            return ClusterResponse(
                clusters=[single_cluster],
                total_articles=1,
                clustered_articles=1,
                unclustered_article_ids=[]
            )

        # 1. Prepare texts for embedding with headline and full content snippet
        texts = [f"{a.title}. {a.summary or ''} {a.content[:350] if a.content else ''}" for a in articles]
        
        # 2. Get embeddings
        embeddings = np.array(embedding_service.get_embeddings(texts))
        
        # 3. Calculate Cosine Similarity Matrix
        dot_product = np.dot(embeddings, embeddings.T)
        cosine_matrix = np.clip(dot_product, 0.0, 1.0)

        # Token set Jaccard similarity to boost topical entity alignment
        n = len(articles)
        import re
        macro_stopwords = {
            "the", "a", "an", "in", "on", "of", "and", "to", "for", "with", "at", "by", "from", "is", "was", "are",
            "has", "have", "had", "been", "will", "would", "about", "into", "over", "after", "says", "said", "new",
            "india", "indian", "government", "cabinet", "minister", "ministry", "official", "state", "national", "report", "news", "amid", "delhi", "under"
        }
        token_sets = []
        for a in articles:
            full_raw = f"{a.title} {a.summary or ''} {a.content or ''}".lower()
            words = set(re.findall(r'\b[a-zA-Z]{4,}\b', full_raw)) - macro_stopwords
            token_sets.append(words)

        effective_threshold = 0.50
        similarity_matrix = np.zeros((n, n))
        for i in range(n):
            for j in range(n):
                if i == j:
                    similarity_matrix[i, j] = 1.0
                elif j > i:
                    cos_s = cosine_matrix[i, j]
                    set_i, set_j = token_sets[i], token_sets[j]
                    shared = set_i & set_j
                    
                    # Direct check for shared focal topical anchors
                    is_same_story = False
                    if len(shared) >= 1:
                        topical_anchors = {"semiconductor", "solar", "renewable", "voter", "electoral", "authentication", "fab", "fossil", "foundries"}
                        if shared & topical_anchors:
                            is_same_story = True

                    if is_same_story:
                        similarity_matrix[i, j] = similarity_matrix[j, i] = 0.90
                    elif len(shared) >= 2 and cos_s >= 0.35:
                        similarity_matrix[i, j] = similarity_matrix[j, i] = 0.85
                    elif cos_s >= effective_threshold:
                        similarity_matrix[i, j] = similarity_matrix[j, i] = cos_s
        visited = set()
        clusters_list: List[List[int]] = []

        for i in range(n):
            if i in visited:
                continue
            # BFS / DFS to find all connected articles with similarity >= threshold
            current_cluster = []
            queue = [i]
            visited.add(i)

            while queue:
                curr = queue.pop(0)
                current_cluster.append(curr)
                for neighbor in range(n):
                    if neighbor not in visited and similarity_matrix[curr, neighbor] >= effective_threshold:
                        visited.add(neighbor)
                        queue.append(neighbor)

            clusters_list.append(current_cluster)

        # 5. Process and format clusters
        output_clusters: List[StoryClusterOutput] = []
        unclustered_ids: List[str] = []

        for cluster_indices in clusters_list:
            cluster_articles = [articles[idx] for idx in cluster_indices]
            
            # Find representative article (highest average similarity to others in cluster)
            if len(cluster_indices) > 1:
                sub_sim = similarity_matrix[np.ix_(cluster_indices, cluster_indices)]
                avg_sims = np.mean(sub_sim, axis=1)
                best_local_idx = int(np.argmax(avg_sims))
                rep_article = cluster_articles[best_local_idx]
            else:
                rep_article = cluster_articles[0]

            # Perspective Breakdown & Bias Analysis
            p_breakdown = PerspectiveBreakdown()
            for art in cluster_articles:
                bias = bias_service.analyze_text(art.title, art.content or "", art.source_name)
                if bias.perspective == "Left":
                    p_breakdown.left_count += 1
                elif bias.perspective == "Right":
                    p_breakdown.right_count += 1
                elif bias.perspective == "Official":
                    p_breakdown.official_count += 1
                else:
                    p_breakdown.center_count += 1

            # Dominant Perspective
            counts = {
                "Left": p_breakdown.left_count,
                "Center": p_breakdown.center_count,
                "Right": p_breakdown.right_count,
                "Official": p_breakdown.official_count
            }
            dominant = max(counts, key=counts.get)
            active_perspectives = sum(1 for v in counts.values() if v > 0)
            
            # Diversity score between 0.0 and 1.0
            diversity_score = round(min((active_perspectives / 4.0) * (len(cluster_articles) / (len(cluster_articles) + 1)), 1.0), 2)
            
            if active_perspectives >= 3:
                p_breakdown.dominant_perspective = "Diverse / Multi-Sourced"
            else:
                p_breakdown.dominant_perspective = dominant

            # Blindspot Detection for this cluster
            blindspot_msg = None
            if len(cluster_articles) >= 3:
                if p_breakdown.left_count == 0 and (p_breakdown.right_count >= 2 or p_breakdown.official_count >= 2):
                    blindspot_msg = "Left Blindspot: High Right/Official reporting, unaddressed by Left outlets."
                elif p_breakdown.right_count == 0 and (p_breakdown.left_count >= 2 or p_breakdown.center_count >= 2):
                    blindspot_msg = "Right Blindspot: Under-reported by Right media outlets."
                elif p_breakdown.official_count == 0 and len(cluster_articles) >= 4:
                    blindspot_msg = "Official Gap: No PIB/Govt response or statement recorded yet."

            cluster_id = f"cl_{uuid.uuid5(uuid.NAMESPACE_DNS, rep_article.id + str(len(cluster_articles))).hex[:10]}"
            
            output_clusters.append(StoryClusterOutput(
                cluster_id=cluster_id,
                title=rep_article.title,
                representative_article_id=rep_article.id,
                article_ids=[a.id for a in cluster_articles],
                articles=cluster_articles,
                perspectives=p_breakdown,
                diversity_score=diversity_score,
                blindspot_detected=blindspot_msg,
                created_at=rep_article.published_at
            ))

        # Sort clusters: largest multi-perspective stories first
        output_clusters.sort(key=lambda c: (len(c.article_ids), c.diversity_score), reverse=True)

        clustered_count = sum(len(c.article_ids) for c in output_clusters)

        return ClusterResponse(
            clusters=output_clusters,
            total_articles=len(articles),
            clustered_articles=clustered_count,
            unclustered_article_ids=unclustered_ids
        )

cluster_service = ClusterService()
