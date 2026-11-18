import unittest
from app.schemas import ArticleInput, SummarizationRequest, RAGAssistantRequest
from app.services.embedding_service import embedding_service
from app.services.bias_service import bias_service
from app.services.cluster_service import cluster_service
from app.services.summary_service import summary_service
from app.services.rag_service import rag_service

class TestNYNKAIServices(unittest.TestCase):

    def test_embeddings_generation(self):
        texts = [
            "Semiconductor manufacturing plant announced in Gujarat.",
            "Water rights dispute raised by agricultural collectives near tech park."
        ]
        embeddings = embedding_service.get_embeddings(texts)
        self.assertEqual(len(embeddings), 2)
        self.assertGreater(len(embeddings[0]), 0)

    def test_bias_framing_analysis(self):
        # 1. Official source
        official_analysis = bias_service.analyze_text(
            title="Cabinet approved new flagship scheme for rural electrification",
            content="Press Information Bureau release: Guidelines issued by Ministry.",
            source_name="Press Information Bureau"
        )
        self.assertEqual(official_analysis.perspective, "Official")

        # 2. Left framing
        left_analysis = bias_service.analyze_text(
            title="Activists condemn authoritarian clampdown on marginalized labor rights and inequality",
            content="Severe corporate exploitation and draconian measures reported.",
            source_name="The Wire"
        )
        self.assertEqual(left_analysis.perspective, "Left")

        # 3. Right framing
        right_analysis = bias_service.analyze_text(
            title="Decisive national security leadership defeats infiltrator terror nexus",
            content="Sanatan cultural heritage protected through decisive governance.",
            source_name="OpIndia"
        )
        self.assertEqual(right_analysis.perspective, "Right")

        # 4. Center / Neutral framing
        center_analysis = bias_service.analyze_text(
            title="Central bank leaves benchmark interest rates unchanged at 6.5 percent",
            content="Monetary policy committee members voted unanimously according to official minutes.",
            source_name="Reuters"
        )
        self.assertEqual(center_analysis.perspective, "Center")

    def test_semantic_clustering(self):
        articles = [
            ArticleInput(
                id="art1",
                title="India expands semiconductor mission with 76000 crore subsidy package",
                content="Cabinet approves major financial incentive for chip fab clusters.",
                source_name="Press Information Bureau",
                published_at="2026-11-16T10:00:00Z"
            ),
            ArticleInput(
                id="art2",
                title="Environmental concerns raised over water consumption in new semiconductor fab zones",
                content="Local collectives worry about groundwater depletion for microchip fabs.",
                source_name="The Hindu",
                published_at="2026-11-16T11:00:00Z"
            ),
            ArticleInput(
                id="art3",
                title="Cricket world cup preparation begins with training camp in Mumbai",
                content="National cricket squad begins intensive conditioning ahead of tournament.",
                source_name="Times of India",
                published_at="2026-11-16T12:00:00Z"
            )
        ]

        res = cluster_service.cluster_articles(articles, threshold=0.45)
        self.assertGreater(len(res.clusters), 0)
        # Verify the semiconductor articles group together or form clusters
        total_clustered = sum(len(c.article_ids) for c in res.clusters)
        self.assertEqual(total_clustered, 3)

    def test_cluster_summarization(self):
        articles = [
            ArticleInput(
                id="art1",
                title="Government inaugurates solar park reaching 200 GW capacity milestone",
                content="Ministry announced landmark achievement in green power generation.",
                source_name="Press Information Bureau"
            ),
            ArticleInput(
                id="art2",
                title="Renewable power reaches 200 gigawatts as storage investments ramp up",
                content="Power grid integration and battery tenders underway.",
                source_name="Reuters"
            )
        ]

        req = SummarizationRequest(
            cluster_id="test_cluster_01",
            cluster_title="Renewable Energy 200 GW Milestone",
            articles=articles
        )

        summary = summary_service.generate_cluster_summary(req)
        self.assertEqual(summary.cluster_id, "test_cluster_01")
        self.assertIn("200", summary.consensus_summary)
        self.assertGreater(len(summary.key_facts), 0)

if __name__ == "__main__":
    unittest.main()

