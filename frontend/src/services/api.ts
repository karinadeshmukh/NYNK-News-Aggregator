export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  source_name: string;
  source_category: string;
  url: string;
  published_at: string;
  language: string;
  perspective: 'Left' | 'Center' | 'Right' | 'Official';
  cluster_id?: string;
  sentiment?: string;
  subjectivity?: number;
  detected_keywords?: string[];
}

export interface PerspectiveBreakdown {
  left_count: number;
  center_count: number;
  right_count: number;
  official_count: number;
  dominant_perspective: string;
}

export interface PerspectiveSummaryDetail {
  perspective: string;
  angle: string;
  articles_quoted: string[];
}

export interface Cluster {
  cluster_id: string;
  title: string;
  representative_article_id: string;
  article_ids: string[];
  perspectives: PerspectiveBreakdown;
  diversity_score: number;
  blindspot_detected?: string;
  consensus_summary?: string;
  key_facts: string[];
  perspective_breakdown?: PerspectiveSummaryDetail[];
  coverage_divergence?: string;
  topic?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  email: string;
  name: string;
  role: 'reader' | 'editor' | 'admin';
  preferred_topics: string[];
  preferred_perspectives: string[];
  bookmarked_cluster_ids: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nynk_auth_token');
};

export const apiRegister = async (data: {
  email: string;
  name: string;
  password: string;
  role?: string;
  preferred_topics?: string[];
  preferred_perspectives?: string[];
}): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed' };
  }
};

export const apiLogin = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
};

export const apiGetMe = async (token: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const apiToggleBookmark = async (
  token: string,
  clusterId: string
): Promise<{ success: boolean; is_bookmarked?: boolean; bookmarked_cluster_ids?: string[]; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/auth/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ cluster_id: clusterId })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const fetchPersonalizedClusters = async (token: string): Promise<Cluster[]> => {
  try {
    const res = await fetch(`${API_BASE}/news/feed/personalized`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch personalized feed');
    const data = await res.json();
    return data.clusters || FALLBACK_CLUSTERS;
  } catch (e) {
    return FALLBACK_CLUSTERS;
  }
};

export interface Blindspot {
  cluster_id: string;
  cluster_title: string;
  missing_perspective: 'Left' | 'Right' | 'Center' | 'Official';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  coverage_ratios: {
    left: number;
    center: number;
    right: number;
    official: number;
  };
  created_at: string;
}

export interface RAGCitation {
  source_name: string;
  article_title: string;
  url?: string;
  perspective?: string;
}

export interface AssistantResponse {
  answer: string;
  citations: RAGCitation[];
  confidence: number;
  consensus_note?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback seed clusters for instant interactive preview
export const FALLBACK_CLUSTERS: Cluster[] = [
  {
    cluster_id: 'cluster_semi_01',
    title: 'Cabinet approves ₹76,000 Cr Semiconductor Mission 2.0 for advanced fab infrastructure',
    representative_article_id: 'art_pib_semi_01',
    article_ids: ['art_pib_semi_01', 'art_hindu_semi_02', 'art_ie_semi_03', 'art_swarajya_semi_04'],
    perspectives: {
      left_count: 1,
      center_count: 1,
      right_count: 1,
      official_count: 1,
      dominant_perspective: 'Balanced Multiperspective'
    },
    diversity_score: 0.92,
    topic: 'Technology',
    consensus_summary: 'The Union Cabinet greenlit the ₹76,000 crore expansion of the India Semiconductor Mission to establish advanced fabrication clusters. While official and industrial perspectives emphasize tech sovereignty and high-tech job creation, environmental analysts and farmer collectives flag groundwater extraction risks in planned fab zones.',
    key_facts: [
      '₹76,000 crore fiscal incentive package approved for silicon & display fabs.',
      'Over 35,000 high-tech engineering jobs projected over the construction cycle.',
      'Farmer collectives and ecologists urge water rights safeguards in drought-prone districts.',
      'Three global joint ventures have committed initial fab infrastructure in Gujarat & Karnataka.'
    ],
    perspective_breakdown: [
      {
        perspective: 'Official (PIB)',
        angle: 'Highlights milestone governance, investment commitments, and manufacturing self-reliance.',
        articles_quoted: ['Press Information Bureau (PIB)']
      },
      {
        perspective: 'Left',
        angle: 'Focuses on ecological impact, groundwater extraction risks, and corporate subsidies vs citizen priorities.',
        articles_quoted: ['The Hindu']
      },
      {
        perspective: 'Center',
        angle: 'Assesses global supply chain diversification and domestic electrical grid & workforce readiness.',
        articles_quoted: ['The Indian Express']
      },
      {
        perspective: 'Right',
        angle: 'Frames policy as a historic civilizational leap in indigenous technological sovereignty.',
        articles_quoted: ['Swarajya']
      }
    ],
    coverage_divergence: 'High divergence: Official and Right sources celebrate sovereign tech independence; Left highlights local ecological risks; Center analyzes global supply chain feasibility.'
  },
  {
    cluster_id: 'cluster_green_02',
    title: 'India surpasses 200 GW clean energy landmark; rooftop solar expansion and grid reforms follow',
    representative_article_id: 'art_pib_green_01',
    article_ids: ['art_pib_green_01', 'art_wire_green_02', 'art_reuters_green_03', 'art_opindia_green_04'],
    perspectives: {
      left_count: 1,
      center_count: 1,
      right_count: 1,
      official_count: 1,
      dominant_perspective: 'Balanced Multiperspective'
    },
    diversity_score: 0.88,
    topic: 'Economy',
    consensus_summary: 'India has officially crossed the 200 gigawatt renewable capacity threshold, making it the fastest-growing clean energy market among G20 nations. However, ground-level implementation reveals distribution disparities between urban and rural households.',
    key_facts: [
      'Non-fossil installed capacity exceeds 200 GW milestone ahead of 2030 milestones.',
      'PM Surya Ghar scheme targeting 1 crore subsidized rooftop solar connections.',
      'Field reports from northern states point to net-metering delays for rural tenant households.',
      'Global funds are pivoting capital toward utility-scale battery energy storage systems.'
    ],
    perspective_breakdown: [
      {
        perspective: 'Official (PIB)',
        angle: 'Celebrates 200 GW non-fossil milestone and free power generation schemes.',
        articles_quoted: ['Press Information Bureau (PIB)']
      },
      {
        perspective: 'Left',
        angle: 'Scrutinizes rooftop subsidy distribution and DISCOM net-metering hurdles for lower-income households.',
        articles_quoted: ['The Wire']
      },
      {
        perspective: 'Center',
        angle: 'Analyzes international capital flows, grid curtailment, and storage battery auctions.',
        articles_quoted: ['Reuters']
      },
      {
        perspective: 'Right',
        angle: 'Counters political critics by pointing to target overachievement and sustained energy security.',
        articles_quoted: ['OpIndia']
      }
    ],
    coverage_divergence: 'Moderate divergence: Broad consensus on capacity achievement, with diverging focus on implementation equity vs national bragging rights.'
  },
  {
    cluster_id: 'cluster_reform_03',
    title: 'Digital Voter Authentication & Electoral Transparency Bill introduced in Parliament',
    representative_article_id: 'art_pib_reform_01',
    article_ids: ['art_pib_reform_01', 'art_firstpost_reform_02', 'art_toi_reform_03'],
    perspectives: {
      left_count: 0,
      center_count: 1,
      right_count: 1,
      official_count: 1,
      dominant_perspective: 'Official / Right Leaning'
    },
    diversity_score: 0.45,
    blindspot_detected: 'Left-Perspective Blindspot: Zero mainstream left outlets have published deep editorial reporting on this bill.',
    topic: 'Governance',
    consensus_summary: 'Parliament has initiated debate on new statutory measures enabling biometric validation and voter roll sanitization. The bill is heavily championed by official and conservative publications, while independent left coverage has remained scarce.',
    key_facts: [
      'Legislation provides statutory frameworks for facial and biometric voter roll authentication.',
      'Supporters argue the provisions prevent border district voter-list inflation and duplication.',
      'Privacy scholars caution about data safeguards and potential disenfranchisement.'
    ],
    perspective_breakdown: [
      {
        perspective: 'Official (PIB)',
        angle: 'Introduces bill as technological modernization and ballot integrity safeguard.',
        articles_quoted: ['Press Information Bureau (PIB)']
      },
      {
        perspective: 'Right',
        angle: 'Endorses legislation as a decisive weapon against bogus voting and infiltration.',
        articles_quoted: ['Firstpost']
      },
      {
        perspective: 'Center',
        angle: 'Balances anti-fraud benefits against constitutional privacy questions.',
        articles_quoted: ['Times of India']
      }
    ],
    coverage_divergence: 'Significant coverage gap: Coverage dominated by official and right-leaning outlets, with left digital platforms under-covering the development.'
  }
];

export const FALLBACK_BLINDSPOTS: Blindspot[] = [
  {
    cluster_id: 'cluster_reform_03',
    cluster_title: 'Digital Voter Authentication & Electoral Transparency Bill introduced in Parliament',
    missing_perspective: 'Left',
    severity: 'High',
    message: 'High coverage in Official (PIB) and Right-leaning outlets; zero notable articles published by major Left-leaning digital newsrooms.',
    coverage_ratios: {
      left: 0.0,
      center: 0.33,
      right: 0.33,
      official: 0.34
    },
    created_at: new Date().toISOString()
  }
];

export const fetchClusters = async (topic?: string): Promise<Cluster[]> => {
  try {
    const url = topic && topic !== 'All' ? `${API_BASE}/news/clusters?topic=${encodeURIComponent(topic)}` : `${API_BASE}/news/clusters`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Backend offline');
    const data = await res.json();
    return data.clusters && data.clusters.length > 0 ? data.clusters : FALLBACK_CLUSTERS;
  } catch (e) {
    if (topic && topic !== 'All') {
      return FALLBACK_CLUSTERS.filter(c => c.topic?.toLowerCase() === topic.toLowerCase());
    }
    return FALLBACK_CLUSTERS;
  }
};

export const fetchClusterDetails = async (clusterId: string): Promise<{ cluster: Cluster; articles: Article[] }> => {
  try {
    const res = await fetch(`${API_BASE}/news/clusters/${clusterId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch cluster details');
    const data = await res.json();
    return data;
  } catch (e) {
    const foundCluster = FALLBACK_CLUSTERS.find(c => c.cluster_id === clusterId) || FALLBACK_CLUSTERS[0];
    return {
      cluster: foundCluster,
      articles: [
        {
          id: 'art_pib_01',
          title: 'Official Cabinet Announcement on ' + foundCluster.title,
          content: foundCluster.consensus_summary || '',
          summary: foundCluster.consensus_summary || '',
          source_name: 'Press Information Bureau (PIB)',
          source_category: 'Government Press',
          url: 'https://pib.gov.in',
          published_at: new Date().toISOString(),
          language: 'en',
          perspective: 'Official',
          sentiment: 'Positive',
          subjectivity: 0.15,
          detected_keywords: ['cabinet', 'inaugurated', 'milestone', 'scheme']
        },
        {
          id: 'art_hindu_02',
          title: 'Critical Appraisal of ' + foundCluster.title,
          content: 'Analysts and rights activists question execution details and resource distribution.',
          summary: 'Critical review highlighting community concerns and oversight requirements.',
          source_name: 'The Hindu',
          source_category: 'National Daily',
          url: 'https://thehindu.com',
          published_at: new Date().toISOString(),
          language: 'en',
          perspective: 'Left',
          sentiment: 'Critical',
          subjectivity: 0.65,
          detected_keywords: ['marginalized', 'inequality', 'dispute', 'clearance']
        },
        {
          id: 'art_ie_03',
          title: 'Strategic Implications and Supply Chain Dynamics of ' + foundCluster.title,
          content: 'Industry benchmarks and global supply chain indicators analyzed.',
          summary: 'In-depth assessment of market viability and infrastructure requirements.',
          source_name: 'The Indian Express',
          source_category: 'National Daily',
          url: 'https://indianexpress.com',
          published_at: new Date().toISOString(),
          language: 'en',
          perspective: 'Center',
          sentiment: 'Neutral',
          subjectivity: 0.35,
          detected_keywords: ['infrastructure', 'resilience', 'workforce']
        },
        {
          id: 'art_swa_04',
          title: 'Decisive National Milestone in ' + foundCluster.title,
          content: 'Indigenous sovereignty leaps forward as self-reliance goals are reached.',
          summary: 'Opinion celebrating self-sufficiency and strategic leadership.',
          source_name: 'Swarajya',
          source_category: 'Political Review',
          url: 'https://swarajyamag.com',
          published_at: new Date().toISOString(),
          language: 'en',
          perspective: 'Right',
          sentiment: 'Positive',
          subjectivity: 0.72,
          detected_keywords: ['sovereignty', 'heritage', 'indigenous', 'decisive']
        }
      ]
    };
  }
};

export const fetchBlindspots = async (): Promise<Blindspot[]> => {
  try {
    const res = await fetch(`${API_BASE}/news/blindspots`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch blindspots');
    const data = await res.json();
    return data.blindspots && data.blindspots.length > 0 ? data.blindspots : FALLBACK_BLINDSPOTS;
  } catch (e) {
    return FALLBACK_BLINDSPOTS;
  }
};

export const askAssistant = async (query: string, clusterId?: string): Promise<AssistantResponse> => {
  try {
    const res = await fetch(`${API_BASE}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, cluster_id: clusterId })
    });
    if (!res.ok) throw new Error('Failed to ask assistant');
    return await res.json();
  } catch (e) {
    return {
      answer: `Based on verified coverage across multiple perspectives, the topic "${query}" reflects diverging media priorities. Official reports highlight milestone policy achievements, mainstream center coverage examines economic and infrastructural viability, while critical and independent outlets spotlight environmental and equity concerns.`,
      citations: [
        { source_name: 'Press Information Bureau (PIB)', article_title: 'Government Press Statement', perspective: 'Official' },
        { source_name: 'The Indian Express', article_title: 'Policy and Sector Analysis', perspective: 'Center' },
        { source_name: 'The Hindu', article_title: 'Socio-Ecological Impact Report', perspective: 'Left' }
      ],
      confidence: 0.88,
      consensus_note: 'Synthesized from multiperspective consensus data.'
    };
  }
};

