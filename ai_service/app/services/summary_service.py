import re
from typing import List, Dict
from app.schemas import SummarizationRequest, SummarizationResponse, PerspectiveSummaryDetail
from app.services.bias_service import bias_service

class SummaryService:
    def generate_cluster_summary(self, request: SummarizationRequest) -> SummarizationResponse:
        articles = request.articles
        if not articles:
            return SummarizationResponse(
                cluster_id=request.cluster_id,
                consensus_summary="No articles available for this cluster.",
                key_facts=[],
                perspective_breakdown=[],
                coverage_divergence="Insufficient data."
            )

        # 1. Group articles by perspective
        by_perspective: Dict[str, List] = {"Left": [], "Center": [], "Right": [], "Official": []}
        
        for art in articles:
            bias = bias_service.analyze_text(art.title, art.content or "", art.source_name)
            p = bias.perspective if bias.perspective in by_perspective else "Center"
            by_perspective[p].append((art, bias))

        # 2. Extract facts and sentences
        all_sentences = []
        for art in articles:
            # Check title first as it holds primary event facts
            clean_title = art.title.strip()
            if clean_title:
                all_sentences.append(clean_title)

            body = (art.content or art.summary or "")
            # split into sentences
            sents = re.split(r'(?<=[.!?])\s+', body)
            for s in sents:
                clean_s = s.strip()
                if 25 < len(clean_s) < 220:
                    all_sentences.append(clean_s)

        # 3. Formulate consensus summary
        # Identify sentences with high entity overlap or numbers/dates
        fact_sentences = []
        for s in all_sentences:
            if re.search(r'\b(announced|approved|reported|according to|stated|increased|decreased|signed|investigation|crore|percent|billion|\d+|\d{4})\b', s, re.IGNORECASE):
                if s not in fact_sentences:
                    fact_sentences.append(s)
            if len(fact_sentences) >= 4:
                break

        if not fact_sentences:
            fact_sentences = [articles[0].title]
            if len(articles) > 1:
                fact_sentences.append(articles[1].title)

        consensus_summary = " ".join(fact_sentences[:3])

        # Key Facts bullet points
        key_facts = [
            f"Event covered by {len(articles)} distinct reporting outlets.",
            f"Primary developments: {articles[0].title}."
        ]
        if len(fact_sentences) > 1:
            key_facts.append(f"Core development: {fact_sentences[1]}")
        if len(articles) > 2:
            key_facts.append(f"Corroborated by independent reporting from {', '.join(set(a.source_name for a in articles[:4]))}.")

        # 4. Formulate Perspective Breakdown
        breakdown: List[PerspectiveSummaryDetail] = []

        if by_perspective["Official"]:
            arts, biases = zip(*by_perspective["Official"])
            sources = [a.source_name for a in arts]
            breakdown.append(PerspectiveSummaryDetail(
                perspective="Official / Government (PIB)",
                angle="Emphasizes statutory authorizations, administrative directives, welfare statistics, and national policy execution.",
                articles_quoted=sources
            ))

        if by_perspective["Left"]:
            arts, biases = zip(*by_perspective["Left"])
            sources = [a.source_name for a in arts]
            breakdown.append(PerspectiveSummaryDetail(
                perspective="Left / Progressive Outlets",
                angle="Highlights institutional scrutiny, socioeconomic disparities, labor/civic safeguards, and accountability demands.",
                articles_quoted=sources
            ))

        if by_perspective["Right"]:
            arts, biases = zip(*by_perspective["Right"])
            sources = [a.source_name for a in arts]
            breakdown.append(PerspectiveSummaryDetail(
                perspective="Right / Conservative Outlets",
                angle="Focuses on sovereign security, national economic growth trajectory, governance determination, and institutional order.",
                articles_quoted=sources
            ))

        if by_perspective["Center"] or not breakdown:
            arts = [a for a, _ in by_perspective["Center"]] if by_perspective["Center"] else articles
            sources = [a.source_name for a in arts]
            breakdown.append(PerspectiveSummaryDetail(
                perspective="Center / Wire Reports",
                angle="Maintains neutral chronological timeline, factual dispatches, and verbatim quotes from primary stakeholders.",
                articles_quoted=sources
            ))

        # 5. Divergence analysis
        divergence_pts = []
        if by_perspective["Official"] and by_perspective["Left"]:
            divergence_pts.append("Official sources focus on policy success metrics, while Left coverage scrutinizes structural implementation gaps.")
        if by_perspective["Right"] and by_perspective["Left"]:
            divergence_pts.append("Right coverage frames the issue around stability and development; Left coverage focuses on civic equity and environmental/labor impacts.")
        if not divergence_pts:
            divergence_pts.append("Reporting is broadly aligned on factual baseline events with minor editorial divergence in headline tone.")

        return SummarizationResponse(
            cluster_id=request.cluster_id,
            consensus_summary=consensus_summary,
            key_facts=key_facts,
            perspective_breakdown=breakdown,
            coverage_divergence=" ".join(divergence_pts)
        )

summary_service = SummaryService()
