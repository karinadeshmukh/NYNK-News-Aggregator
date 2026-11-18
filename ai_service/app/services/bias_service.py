import re
from typing import Dict, List, Tuple
from app.schemas import BiasAnalysisResponse, BiasFactor

# Media outlet reputation baseline mappings
SOURCE_PRIORS: Dict[str, Dict[str, str]] = {
    "pib": {"perspective": "Official", "category": "Government Press Information Bureau"},
    "press information bureau": {"perspective": "Official", "category": "Government Press"},
    "dd news": {"perspective": "Official", "category": "State Broadcaster"},
    "sansad tv": {"perspective": "Official", "category": "Parliamentary Broadcaster"},
    
    "the hindu": {"perspective": "Left", "category": "Mainstream English Daily"},
    "the wire": {"perspective": "Left", "category": "Independent Digital Media"},
    "scroll.in": {"perspective": "Left", "category": "Independent Digital Media"},
    "the quint": {"perspective": "Left", "category": "Digital Media"},
    "the caravan": {"perspective": "Left", "category": "Longform Investigative"},
    "the guardian": {"perspective": "Left", "category": "International News"},
    "new york times": {"perspective": "Left", "category": "International News"},

    "the indian express": {"perspective": "Center", "category": "National Daily"},
    "times of india": {"perspective": "Center", "category": "Commercial National Daily"},
    "hindustan times": {"perspective": "Center", "category": "National Daily"},
    "reuters": {"perspective": "Center", "category": "Global News Wire"},
    "associated press": {"perspective": "Center", "category": "Global News Wire"},
    "ap news": {"perspective": "Center", "category": "Global News Wire"},
    "bbc": {"perspective": "Center", "category": "Public Broadcaster"},
    "bloomberg": {"perspective": "Center", "category": "Financial News Wire"},
    "financial express": {"perspective": "Center", "category": "Business Daily"},
    "livemint": {"perspective": "Center", "category": "Business Daily"},

    "opindia": {"perspective": "Right", "category": "Digital Media"},
    "swarajya": {"perspective": "Right", "category": "Cultural & Political Review"},
    "organizer": {"perspective": "Right", "category": "Affiliated Publication"},
    "republic world": {"perspective": "Right", "category": "Broadcast Media"},
    "zee news": {"perspective": "Right", "category": "Broadcast Media"},
    "firstpost": {"perspective": "Right", "category": "Digital Media"},
    "wall street journal": {"perspective": "Right", "category": "Financial & Opinion Daily"},
    "fox news": {"perspective": "Right", "category": "Broadcast Media"},
}

LEFT_FRAMING_TERMS = {
    "inequality", "marginalized", "suppression", "authoritarian", "dissent", 
    "oligarchy", "exploitation", "labor rights", "secularism", "social justice",
    "clampdown", "disenfranchised", "casteism", "corporate greed", "draconian"
}

RIGHT_FRAMING_TERMS = {
    "national security", "heritage", "patriotism", "subversion", "infiltrator",
    "indigenous", "decisive leadership", "law and order", "terror nexus", "sanatan",
    "development leap", "propaganda", "anti-national", "sovereignty", "appeasement"
}

OFFICIAL_FRAMING_TERMS = {
    "ministry", "inaugurated", "scheme", "cabinet approved", "beneficiaries",
    "allocated", "press release", "flagship program", "guidelines issued", "milestone achieved"
}

SENSATIONAL_TERMS = {
    "shocking", "blast", "exploded", "slams", "humiliated", "destroyed",
    "unbelievable", "massive storm", "panic", "chaos", "bombshell", "fury"
}

SUBJECTIVE_MARKERS = {
    "obviously", "undoubtedly", "clearly", "allegedly", "apparently", "disgraceful",
    "unprecedented disaster", "masterstroke", "miracle", "catastrophic", "sinister"
}

class BiasService:
    @staticmethod
    def analyze_text(title: str, content: str = "", source_name: str = "") -> BiasAnalysisResponse:
        full_text = f"{title} {content}".lower()
        words = re.findall(r'\b[a-zA-Z]{3,}\b', full_text)
        total_words = max(len(words), 1)

        # Baseline check against source prior
        clean_src = source_name.strip().lower()
        prior_data = None
        for key, val in SOURCE_PRIORS.items():
            if key in clean_src:
                prior_data = val
                break

        # Count framing signals
        left_count = sum(1 for w in words if w in LEFT_FRAMING_TERMS)
        right_count = sum(1 for w in words if w in RIGHT_FRAMING_TERMS)
        official_count = sum(1 for w in words if w in OFFICIAL_FRAMING_TERMS)
        sensational_count = sum(1 for w in words if w in SENSATIONAL_TERMS)
        subjective_count = sum(1 for w in words if w in SUBJECTIVE_MARKERS)

        # Check title cues specifically (titles carry heavy editorial weight)
        title_lower = title.lower()
        title_words = re.findall(r'\b[a-zA-Z]{3,}\b', title_lower)
        for tw in title_words:
            if tw in LEFT_FRAMING_TERMS:
                left_count += 2
            if tw in RIGHT_FRAMING_TERMS:
                right_count += 2
            if tw in OFFICIAL_FRAMING_TERMS:
                official_count += 2
            if tw in SENSATIONAL_TERMS:
                sensational_count += 2

        framing_factors: List[BiasFactor] = []
        detected_keywords: List[str] = []

        # Perspective decision logic
        perspective_scores = {
            "Official": official_count * 2.2,
            "Left": left_count * 1.5,
            "Right": right_count * 1.5,
            "Center": 2.0 # baseline neutral weight
        }

        # Apply source prior weight if known (strong baseline)
        if prior_data:
            prior_p = prior_data["perspective"]
            perspective_scores[prior_p] += 5.0
            framing_factors.append(BiasFactor(
                category="Publisher Historical Baseline",
                score=0.90,
                description=f"Source '{source_name}' historically categorized under {prior_p} ({prior_data['category']})."
            ))

        if official_count > 0:
            framing_factors.append(BiasFactor(
                category="Institutional & Policy Focus",
                score=min(official_count / 5.0, 1.0),
                description=f"Identified {official_count} official communication / policy implementation markers."
            ))

        if left_count > 0:
            framing_factors.append(BiasFactor(
                category="Socio-Structural / Dissent Framing",
                score=min(left_count / 5.0, 1.0),
                description=f"Identified {left_count} socio-critical / labor / institutional critique vocabulary elements."
            ))

        if right_count > 0:
            framing_factors.append(BiasFactor(
                category="National Interest / Cultural Framing",
                score=min(right_count / 5.0, 1.0),
                description=f"Identified {right_count} sovereignty / decisive governance / cultural heritage framing keywords."
            ))

        # Subjectivity & Sensationalism
        subjectivity_score = min(round((subjective_count * 3 + sensational_count * 2) / (total_words * 0.15 + 10), 2), 1.0)
        
        sentiment = "Neutral"
        sentiment_score = 0.0
        if sensational_count >= 2:
            sentiment = "Sensational"
            sentiment_score = -0.3
            framing_factors.append(BiasFactor(
                category="Sensational Rhetoric",
                score=min(sensational_count / 4.0, 1.0),
                description=f"Detected emotive / clickbait markers: e.g. '{', '.join(w for w in words if w in SENSATIONAL_TERMS)[:50]}'."
            ))
        elif left_count > right_count and left_count > 1:
            sentiment = "Critical"
            sentiment_score = -0.4
        elif official_count > 2:
            sentiment = "Positive"
            sentiment_score = 0.5
        elif right_count > left_count and right_count > 1:
            sentiment = "Affirmative / Assertive"
            sentiment_score = 0.3

        # Choose best perspective
        best_perspective = max(perspective_scores, key=perspective_scores.get)
        total_p_score = sum(perspective_scores.values()) or 1.0
        confidence = round(min(perspective_scores[best_perspective] / total_p_score + 0.35, 0.98), 2)

        # Extract up to 6 unique detected keywords
        all_detected = [w for w in words if w in LEFT_FRAMING_TERMS or w in RIGHT_FRAMING_TERMS or w in OFFICIAL_FRAMING_TERMS or w in SENSATIONAL_TERMS]
        detected_keywords = list(dict.fromkeys(all_detected))[:6]

        explanation = (
            f"Article framing assessed as {best_perspective} (confidence {int(confidence*100)}%). "
            f"Sentiment is {sentiment} with {subjectivity_score:.2f} subjectivity rating. "
            f"{'Detected publisher historical alignment. ' if prior_data else ''}"
            f"Key editorial signals: {', '.join(detected_keywords) if detected_keywords else 'balanced factual reporting'}."
        )

        return BiasAnalysisResponse(
            perspective=best_perspective,
            confidence=confidence,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            subjectivity=subjectivity_score,
            framing_factors=framing_factors,
            detected_keywords=detected_keywords,
            explanation=explanation
        )

bias_service = BiasService()
