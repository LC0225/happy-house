import { SearchClient, Config } from 'coze-coding-dev-sdk';
import { MediaContent } from '@/types/media';

// 爬虫配置
interface CrawlerConfig {
  type: '小说' | '动漫' | '电视剧' | '综艺' | '短剧';
  count?: number;
}

// 爬虫结果
interface CrawlerResult {
  success: boolean;
  data?: MediaContent[];
  error?: string;
}

export class MediaCrawler {
  private searchClient: SearchClient;

  constructor() {
    const config = new Config();
    this.searchClient = new SearchClient(config);
  }

  /**
   * 通过网络搜索爬取媒体数据
   */
  async crawlFromWeb(config: CrawlerConfig): Promise<CrawlerResult> {
    try {
      const { type, count = 10 } = config;
      
      // 构建搜索关键词
      const keywords = this.getSearchKeywords(type);
      const results: MediaContent[] = [];

      for (const keyword of keywords) {
        try {
          const response = await this.searchClient.webSearch(
            `${keyword} 推荐 2024`,
            Math.ceil(count / keywords.length),
            true
          );

          if (response.web_items) {
            const mediaItems = await this.parseWebResults(response.web_items, type);
            results.push(...mediaItems);
          }
        } catch (error) {
          console.error(`搜索 ${keyword} 失败:`, error);
        }
      }

      return {
        success: true,
        data: results.slice(0, count),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 根据类型获取搜索关键词
   */
  private getSearchKeywords(type: string): string[] {
    const keywordMap: Record<string, string[]> = {
      '小说': ['热门小说', '经典小说', '网络小说推荐', '最新小说'],
      '动漫': ['热门动漫', '经典动漫', '日本动漫推荐', '新番动漫'],
      '电视剧': ['热门电视剧', '经典电视剧', '美剧推荐', '国产剧推荐'],
      '综艺': ['热门综艺', '经典综艺', '国产综艺', '综艺节目'],
      '短剧': ['热门短剧', '甜宠短剧', '总裁短剧', '短剧推荐'],
    };
    return keywordMap[type] || ['推荐'];
  }

  /**
   * 解析网页搜索结果
   */
  private async parseWebResults(items: any[], type: string): Promise<MediaContent[]> {
    const mediaItems: MediaContent[] = [];

    for (const item of items) {
      try {
        // 从搜索结果中提取信息
        const media: MediaContent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: this.extractTitle(item.title, type),
          type: type as any,
          country: this.extractCountry(item.snippet),
          year: this.extractYear(item.snippet),
          rating: this.extractRating(item.snippet),
          image: '/images/placeholders/default.jpg',
          description: this.extractDescription(item.snippet),
          genre: this.extractGenre(item.snippet, type),
          tags: this.extractTags(item.snippet),
          status: this.extractStatus(item.snippet),
        };

        mediaItems.push(media);
      } catch (error) {
        console.error('解析结果失败:', error);
      }
    }

    return mediaItems;
  }

  /**
   * 提取标题
   */
  private extractTitle(title: string, type: string): string {
    // 移除类型后缀和特殊字符
    return title
      .replace(new RegExp(`(${type}|小说|动漫|电视剧|综艺|短剧|推荐|热门|经典)`, 'gi'), '')
      .replace(/[\s\-_|]+/g, ' ')
      .trim()
      .substring(0, 50);
  }

  /**
   * 提取国家
   */
  private extractCountry(text: string): string {
    const countries = ['中国', '日本', '美国', '韩国', '英国', '法国', '德国'];
    for (const country of countries) {
      if (text.includes(country)) {
        return country;
      }
    }
    return '中国'; // 默认中国
  }

  /**
   * 提取年份
   */
  private extractYear(text: string): string {
    const yearMatch = text.match(/20[1-2][0-9]|19[8-9][0-9]/);
    return yearMatch ? yearMatch[0] : '2024';
  }

  /**
   * 提取评分
   */
  private extractRating(text: string): number {
    const ratingMatch = text.match(/(\d\.\d+)/);
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1]);
      return Math.min(Math.max(rating, 0), 10);
    }
    return Math.random() * 2 + 7; // 7-9 之间的随机评分
  }

  /**
   * 提取描述
   */
  private extractDescription(text: string): string {
    return text.substring(0, 100).trim() || '暂无描述';
  }

  /**
   * 提取类型
   */
  private extractGenre(text: string, type: string): string[] {
    const genreMap: Record<string, string[]> = {
      '小说': ['玄幻', '言情', '科幻', '悬疑', '历史'],
      '动漫': ['热血', '恋爱', '科幻', '悬疑', '治愈'],
      '电视剧': ['剧情', '科幻', '悬疑', '喜剧', '历史'],
      '综艺': ['真人秀', '音乐', '脱口秀', '竞技', '访谈'],
      '短剧': ['甜宠', '总裁', '穿越', '重生', '悬疑'],
    };

    const genres = genreMap[type] || ['热门'];
    // 随机选择 1-2 个类型
    const shuffled = genres.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  /**
   * 提取标签
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const keywords = ['爆款', '经典', '完结', '热门', 'VIP', '独家', '最新'];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    // 随机添加一些标签
    if (tags.length === 0) {
      const randomTags = ['热门', '推荐', '2024'];
      const shuffled = randomTags.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2);
    }

    return tags.slice(0, 3);
  }

  /**
   * 提取状态
   */
  private extractStatus(text: string): string {
    if (text.includes('连载') || text.includes('更新')) {
      return '连载中';
    }
    if (text.includes('完结') || text.includes('全集')) {
      return '完结';
    }
    return '未知';
  }

  /**
   * 批量爬取所有类型的数据
   */
  async crawlAll(countPerType: number = 10): Promise<Record<string, MediaContent[]>> {
    const types: CrawlerConfig['type'][] = ['小说', '动漫', '电视剧', '综艺', '短剧'];
    const results: Record<string, MediaContent[]> = {};

    for (const type of types) {
      console.log(`开始爬取 ${type} 数据...`);
      const result = await this.crawlFromWeb({ type, count: countPerType });
      
      if (result.success && result.data) {
        results[type] = result.data;
        console.log(`${type} 爬取完成，获取 ${result.data.length} 条数据`);
      } else {
        console.error(`${type} 爬取失败:`, result.error);
        results[type] = [];
      }
    }

    return results;
  }
}
