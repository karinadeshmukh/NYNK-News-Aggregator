import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { aiClient } from './aiClient';
import { IArticle } from '../models/Article';

interface RSSFeedConfig {
  name: string;
  url: string;
  category: string;
  perspective_prior: 'Left' | 'Center' | 'Right' | 'Official';
}

const RSS_FEEDS: RSSFeedConfig[] = [
  {
    name: 'Press Information Bureau (PIB)',
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1',
    category: 'Governance',
    perspective_prior: 'Official'
  },
  {
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'National',
    perspective_prior: 'Left'
  },
  {
    name: 'The Indian Express',
    url: 'https://indianexpress.com/section/india/feed/',
    category: 'National',
    perspective_prior: 'Center'
  },
  {
    name: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    category: 'National',
    perspective_prior: 'Center'
  },
  {
    name: 'Firstpost',
    url: 'https://www.firstpost.com/commonfeeds/v1/cpt/rss/india.xml',
    category: 'Politics',
    perspective_prior: 'Right'
  },
  {
    name: 'BBC News (India)',
    url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
    category: 'World',
    perspective_prior: 'Center'
  }
];

export class NewsIngestionService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NYNK/1.0 NewsAggregator'
      }
    });
  }

  // Pre-seeded multi-perspective dataset covering 3 key stories from 4 angles each
  async seedInitialMultiPerspectiveNews(): Promise<void> {
    const hasFlagship = await store.getArticleById('art_pib_semi_01');
    if (hasFlagship) return; // already seeded

    console.log('[Ingestion] Seeding high-quality multi-perspective stories...');

    const sampleArticles = [
      // Cluster 1: India Semiconductor & Manufacturing Policy 2026
      {
        id: 'art_pib_semi_01',
        title: 'Cabinet approves ₹76,000 Crore expansion under India Semiconductor Mission for advanced fab clusters',
        content: 'The Union Cabinet chaired by the Prime Minister has approved the second phase of the India Semiconductor Mission with an outlay of ₹76,000 crore. The initiative aims to position India as a global manufacturing and design hub, offering 50% fiscal support for silicon fabs and display fabrication units. Ministry of Electronics and IT confirmed that three major global joint ventures have committed infrastructure investments in Gujarat and Karnataka.',
        summary: 'Cabinet greenlights ₹76,000 crore incentive package for next-gen semiconductor foundries and design facilities.',
        source_name: 'Press Information Bureau (PIB)',
        source_category: 'Government Press',
        url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2001',
        published_at: new Date(Date.now() - 3600000 * 2),
        language: 'en',
        perspective: 'Official' as const,
        topic: 'Technology'
      },
      {
        id: 'art_hindu_semi_02',
        title: 'Critics flag environmental clearance waivers and water allocation disputes in new semiconductor fab zones',
        content: 'While the government announced massive capital subsidies for semiconductor manufacturing, ecological experts and local farmer collectives in drought-prone districts have raised alarms. Ultrapure water requirements of over 20 million liters daily could strain local reservoirs. Activists demand strict oversight and question whether corporate subsidies compromise indigenous community water rights.',
        summary: 'Ecologists and farmer groups express concerns over heavy groundwater extraction and fast-track environmental waivers for chip fabs.',
        source_name: 'The Hindu',
        source_category: 'National Daily',
        url: 'https://thehindu.com/news/national/semiconductor-policy-water-rights',
        published_at: new Date(Date.now() - 3600000 * 3),
        language: 'en',
        perspective: 'Left' as const,
        topic: 'Technology'
      },
      {
        id: 'art_ie_semi_03',
        title: 'Semiconductor Mission 2.0: Strategic tech sovereignty meets global supply chain diversification',
        content: 'India\'s stepped-up semiconductor push comes as global multinationals seek supply chain resilience away from East Asian concentration. Industry analysts project over 35,000 direct high-tech engineering jobs. However, experts note that domestic talent availability and uninterrupted power grids will be crucial execution tests over the 36-month construction cycle.',
        summary: 'Strategic analysis examines India\'s positioning in global chip supply chains alongside workforce and power infrastructure hurdles.',
        source_name: 'The Indian Express',
        source_category: 'National Daily',
        url: 'https://indianexpress.com/article/business/semiconductor-mission-global-chain',
        published_at: new Date(Date.now() - 3600000 * 4),
        language: 'en',
        perspective: 'Center' as const,
        topic: 'Technology'
      },
      {
        id: 'art_swarajya_semi_04',
        title: 'Decisive industrial leadership transforms India into high-tech superpower, defying foreign skeptics',
        content: 'The expansion of the India Semiconductor Mission marks a historic civilizational leap in indigenous technological sovereignty. Overcoming decades of policy paralysis and red tape, national leadership has established an ecosystem capable of competing with Taiwan and South Korea, strengthening national defense capabilities and high-tech self-reliance.',
        summary: 'Commentary lauds decisive policy push and self-reliance milestones as India challenges East Asian chip dominance.',
        source_name: 'Swarajya',
        source_category: 'Cultural & Political Review',
        url: 'https://swarajyamag.com/economy/semiconductor-revolution-leadership',
        published_at: new Date(Date.now() - 3600000 * 5),
        language: 'en',
        perspective: 'Right' as const,
        topic: 'Technology'
      },

      // Cluster 2: National Green Energy Transition & Grid Reforms
      {
        id: 'art_pib_green_01',
        title: 'Ministry of New and Renewable Energy achieves 200 GW milestone in non-fossil installed capacity',
        content: 'India has officially surpassed 200 GW of installed renewable energy capacity, making it the fastest-growing clean energy economy in the G20. The Prime Minister congratulated citizens and announced accelerated rooftop solar subsidies under the PM Surya Ghar scheme, benefitting over 1 crore households with 300 units of free power monthly.',
        summary: 'Official ministry declaration celebrates 200 GW clean energy landmark and solar power subsidies.',
        source_name: 'Press Information Bureau (PIB)',
        source_category: 'Government Press',
        url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2002',
        published_at: new Date(Date.now() - 3600000 * 6),
        language: 'en',
        perspective: 'Official' as const,
        topic: 'Economy'
      },
      {
        id: 'art_wire_green_02',
        title: 'Rooftop solar scheme implementation reveals tariff disparities and delays for marginalized communities',
        content: 'Ground reports from several northern and eastern states indicate that despite celebrated milestones, small farmers and tenant households face bureaucratic hurdles in securing subsidized solar meters. Private distribution companies continue to delay net-metering approvals, while tariff benefits heavily skew towards affluent urban homeowners.',
        summary: 'Field report reveals bureaucratic bottlenecks and unequal distribution in clean energy subsidies.',
        source_name: 'The Wire',
        source_category: 'Independent Digital Media',
        url: 'https://thewire.in/energy/rooftop-solar-subsidies-ground-reality',
        published_at: new Date(Date.now() - 3600000 * 7),
        language: 'en',
        perspective: 'Left' as const,
        topic: 'Economy'
      },
      {
        id: 'art_reuters_green_03',
        title: 'India surpasses 200 GW clean energy threshold, eyes grid modernization and battery storage investments',
        content: 'India crossed the 200 gigawatt mark in renewable power installations, according to official data and international energy monitors. Major global sovereign funds and utilities are now pivoting investments toward grid-scale battery storage and transmission corridors to prevent curtailment during peak daylight hours.',
        summary: 'Global energy wire reports on capacity milestone and upcoming grid battery storage tenders.',
        source_name: 'Reuters',
        source_category: 'Global News Wire',
        url: 'https://reuters.com/business/energy/india-renewables-200gw-milestone',
        published_at: new Date(Date.now() - 3600000 * 8),
        language: 'en',
        perspective: 'Center' as const,
        topic: 'Economy'
      },
      {
        id: 'art_opindia_green_04',
        title: 'Modi government delivers historic 200 GW renewable milestone, debunking opposition doom-mongering',
        content: 'India has stunned international observers by achieving 200 GW renewable capacity years ahead of scheduled international treaty targets. While opposition politicians predicted grid collapse and economic slowdown, visionary governance and public-private partnerships have positioned the nation as a clean energy leader without compromising domestic coal security.',
        summary: 'Report highlights target overachievement and criticizes opposition skepticism.',
        source_name: 'OpIndia',
        source_category: 'Digital Media',
        url: 'https://opindia.com/news/economy/200gw-renewable-energy-milestone-modi',
        published_at: new Date(Date.now() - 3600000 * 9),
        language: 'en',
        perspective: 'Right' as const,
        topic: 'Economy'
      },

      // Cluster 3: Media Blindspot Case – Electoral Reform & Transparency Bill
      {
        id: 'art_pib_reform_01',
        title: 'Law Ministry introduces comprehensive Election Conduct and Digital Voter Authentication Bill in Parliament',
        content: 'The Union Minister for Law and Justice has introduced the Electoral Transparency Bill, modernizing ballot verification and enabling facial recognition validation at sensitive booths. The legislation provides statutory safeguards to prevent impersonation and streamline voter list purging across all states.',
        summary: 'Official introduction of parliament bill aiming to streamline voter ID authentication and security.',
        source_name: 'Press Information Bureau (PIB)',
        source_category: 'Government Press',
        url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2003',
        published_at: new Date(Date.now() - 3600000 * 10),
        language: 'en',
        perspective: 'Official' as const,
        topic: 'Governance'
      },
      {
        id: 'art_firstpost_reform_02',
        title: 'Electoral reform bill strikes decisive blow against bogus voting and illegal infiltrator registration',
        content: 'The new electoral amendments represent a long-overdue cleanup of voter rolls in sensitive border districts. By linking biometrics with constitutional roll checks, national security and democratic sanctity are preserved against coordinated vote-bank manipulations.',
        summary: 'Analysis supporting electoral amendments as essential for border security and voter integrity.',
        source_name: 'Firstpost',
        source_category: 'Digital Media',
        url: 'https://firstpost.com/politics/electoral-reform-bill-border-voter-rolls',
        published_at: new Date(Date.now() - 3600000 * 11),
        language: 'en',
        perspective: 'Right' as const,
        topic: 'Governance'
      },
      {
        id: 'art_toi_reform_03',
        title: 'Parliament debates voter authentication bill amid privacy questions from civil society',
        content: 'A debate has begun in Parliament following the introduction of the digital voter authentication bill. Legal scholars note the bill could speed up collation of election results, but question privacy safeguards and whether technical glitches could disenfranchise rural voters.',
        summary: 'Overview of parliamentary debate balancing fraud prevention with privacy and access concerns.',
        source_name: 'Times of India',
        source_category: 'National Daily',
        url: 'https://timesofindia.indiatimes.com/india/voter-authentication-bill-parliament',
        published_at: new Date(Date.now() - 3600000 * 12),
        language: 'en',
        perspective: 'Center' as const,
        topic: 'Governance'
      }
    ];

    for (const art of sampleArticles) {
      const bias = await aiClient.analyzeBias(art.title, art.content, art.source_name);
      await store.saveArticle({
        ...art,
        sentiment: bias.sentiment,
        subjectivity: bias.subjectivity,
        detected_keywords: bias.detected_keywords
      });
    }

    console.log(`[Ingestion] Successfully seeded ${sampleArticles.length} curated multi-perspective articles.`);
  }

  // Live RSS Ingestion
  async fetchLiveFeeds(): Promise<number> {
    let totalImported = 0;

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await this.parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 5); // take recent 5

        for (const item of items) {
          if (!item.title) continue;

          const existingArticles = await store.getArticles({ limit: 100 });
          const isDuplicate = existingArticles.some(
            (a) => a.title.toLowerCase() === item.title?.toLowerCase() || (item.link && a.url === item.link)
          );
          if (isDuplicate) continue;

          const cleanContent = item.contentSnippet || item.content || item.summary || '';
          const bias = await aiClient.analyzeBias(item.title, cleanContent, feed.name);

          const articleId = `art_${uuidv4().substring(0, 8)}`;
          await store.saveArticle({
            id: articleId,
            title: item.title,
            content: cleanContent,
            summary: item.contentSnippet || item.title,
            source_name: feed.name,
            source_category: feed.category,
            url: item.link || '',
            published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
            language: 'en',
            perspective: bias.perspective || feed.perspective_prior,
            sentiment: bias.sentiment,
            subjectivity: bias.subjectivity,
            detected_keywords: bias.detected_keywords
          });

          totalImported++;
        }
      } catch (err: any) {
        // Individual feed errors (e.g., network timeout or RSS structural quirks) logged without halting ingestion
        console.warn(`[Ingestion] Notice: feed "${feed.name}" skipped (${err.message}).`);
      }
    }

    return totalImported;
  }
}

export const newsIngestionService = new NewsIngestionService();

