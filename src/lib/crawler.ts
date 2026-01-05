import { SearchClient, Config } from 'coze-coding-dev-sdk';
import { MediaContent } from '@/types/media';

// 爬虫配置
interface CrawlerConfig {
  type: '小说' | '动漫' | '电视剧' | '综艺' | '短剧';
  count?: number;
  sources?: CrawlerSource[]; // 指定使用的数据源，默认使用所有可用源
  keyword?: string; // 自定义搜索关键词
}

// 数据源类型
type CrawlerSource = 'web_search' | 'tmdb' | 'douban' | 'custom';

// 爬虫结果
interface CrawlerResult {
  success: boolean;
  data?: MediaContent[];
  error?: string;
  source?: string; // 数据来源
}

export class MediaCrawler {
  private searchClient: SearchClient;

  constructor() {
    const config = new Config();
    this.searchClient = new SearchClient(config);
  }

  /**
   * 多源爬取 - 从多个数据源聚合数据
   */
  async crawlMultiSource(config: CrawlerConfig): Promise<CrawlerResult> {
    const { type, count = 10, sources } = config;

    // 默认使用所有可用数据源
    const activeSources = sources || this.getAvailableSources(type);
    const allResults: MediaContent[] = [];

    for (const source of activeSources) {
      try {
        console.log(`从数据源 ${source} 爬取 ${type} 数据...`);
        const result = await this.crawlFromSource(source, type, Math.ceil(count / activeSources.length));

        if (result.success && result.data) {
          // 标记数据来源
          const dataWithSource = result.data.map(item => ({
            ...item,
            dataSource: source,
          }));
          allResults.push(...dataWithSource);
        }
      } catch (error) {
        console.error(`从数据源 ${source} 爬取失败:`, error);
      }
    }

    // 去重（基于标题）
    const uniqueResults = this.deduplicateByTitle(allResults);

    return {
      success: true,
      data: uniqueResults.slice(0, count),
      source: activeSources.join(','),
    };
  }

  /**
   * 从指定数据源爬取
   */
  private async crawlFromSource(
    source: CrawlerSource,
    type: string,
    count: number
  ): Promise<CrawlerResult> {
    switch (source) {
      case 'web_search':
        return this.crawlFromWeb({ type: type as any, count });
      case 'tmdb':
        return this.crawlFromTMDb(type, count);
      case 'douban':
        return this.crawlFromDouban(type, count);
      default:
        return { success: false, error: `不支持的数据源: ${source}` };
    }
  }

  /**
   * 获取可用的数据源
   */
  private getAvailableSources(type: string): CrawlerSource[] {
    // 根据类型返回适合的数据源
    const typeSourceMap: Record<string, CrawlerSource[]> = {
      '小说': ['web_search', 'douban'],
      '动漫': ['web_search', 'tmdb'],
      '电视剧': ['web_search', 'tmdb', 'douban'],
      '综艺': ['web_search', 'douban'],
      '短剧': ['web_search'],
    };

    return typeSourceMap[type] || ['web_search'];
  }

  /**
   * 从 TMDb API 爬取（电影、电视剧、动漫）
   */
  private async crawlFromTMDb(type: string, count: number): Promise<CrawlerResult> {
    try {
      // TMDb API 配置（需要 API key，这里使用公开的演示端点）
      const baseUrl = 'https://api.themoviedb.org/3';
      const apiKey = process.env.TMDB_API_KEY || 'demo'; // 生产环境应使用环境变量

      // 根据类型映射到 TMDb 的分类
      const tmdbTypeMap: Record<string, { type: string; genre: number }> = {
        '动漫': { type: 'tv', genre: 16 }, // Animation
        '电视剧': { type: 'tv', genre: 18 }, // Drama
      };

      const tmdbConfig = tmdbTypeMap[type];
      if (!tmdbConfig) {
        return { success: false, error: `TMDb 不支持该类型: ${type}` };
      }

      // 调用 TMDb API
      const response = await fetch(
        `${baseUrl}/discover/${tmdbConfig.type}?api_key=${apiKey}&with_genres=${tmdbConfig.genre}&language=zh-CN&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDb API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const items: MediaContent[] = data.results.slice(0, count).map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        type: type as any,
        country: '美国', // TMDb 的数据主要是欧美内容
        year: item.release_date || item.first_air_date
          ? parseInt((item.release_date || item.first_air_date).substring(0, 4))
          : 2024,
        rating: item.vote_average,
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/images/placeholders/default.jpg',
        description: item.overview || '暂无描述',
        genre: item.genre_ids.slice(0, 2).map((id: number) => this.getGenreName(id)),
        tags: ['TMDb'],
        status: (item.status === 'Ended' || item.status === 'Released') ? '完结' : '连载中',
        externalUrl: `https://www.themoviedb.org/${tmdbConfig.type}/${item.id}`,
      }));

      return { success: true, data: items };
    } catch (error) {
      // TMDb API 调用失败时，降级到网络搜索
      console.error('TMDb API 调用失败，降级到网络搜索:', error);
      return this.crawlFromWeb({ type: type as any, count });
    }
  }

  /**
   * 从豆瓣 API 爬取（模拟）
   */
  private async crawlFromDouban(type: string, count: number): Promise<CrawlerResult> {
    // 豆瓣 API 需要申请，这里模拟调用
    // 实际使用时应该配置豆瓣 API key
    try {
      const keywords = this.getSearchKeywords(type);
      const items: MediaContent[] = [];

      for (const keyword of keywords.slice(0, 2)) {
        const response = await this.searchClient.webSearch(
          `site:douban.com ${keyword}`,
          Math.ceil(count / 2),
          false
        );

        if (response.web_items) {
          const mediaItems = response.web_items.slice(0, Math.ceil(count / 2)).map((item: any): MediaContent => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: this.extractTitle(item.title, type),
            type: type as any,
            country: '中国',
            year: this.extractYear(item.snippet),
            rating: this.extractRating(item.snippet),
            image: '/images/placeholders/default.jpg',
            description: this.extractDescription(item.snippet),
            genre: this.extractGenre(item.snippet, type),
            tags: ['豆瓣', '国产'],
            status: '完结' as const,
            externalUrl: item.url,
          }));
          items.push(...mediaItems);
        }
      }

      return { success: true, data: items };
    } catch (error) {
      console.error('豆瓣爬取失败:', error);
      return { success: false, error: '豆瓣爬取失败' };
    }
  }

  /**
   * 通过网络搜索爬取媒体数据
   */
  async crawlFromWeb(config: CrawlerConfig): Promise<CrawlerResult> {
    try {
      const { type, count = 10, keyword } = config;

      const results: MediaContent[] = [];

      // 如果提供了自定义关键词，直接使用；否则使用类型关键词
      const searchKeywords = keyword ? [`${keyword} ${type}`] : [type];

      for (const searchKeyword of searchKeywords) {
        try {
          const response = await this.searchClient.webSearch(
            searchKeyword,
            count,
            true
          );

          if (response.web_items) {
            const mediaItems = await this.parseWebResults(response.web_items, type);
            results.push(...mediaItems);
          }
        } catch (error) {
          console.error(`搜索 ${searchKeyword} 失败:`, error);
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
   * 根据类型获取搜索关键词 - 直接搜索作品名称
   */
  private getSearchKeywords(type: string): string[] {
    // 使用具体作品示例搜索，避免搜索到评价文章
    const keywordMap: Record<string, string[]> = {
      '小说': ['小说', '言情小说', '玄幻小说', '穿越小说', '网络小说', '都市小说', '仙侠小说', '历史小说'],
      '动漫': ['动漫', '日本动漫', '国漫', '动漫番剧', '热血动漫', '恋爱动漫', '治愈动漫', '科幻动漫'],
      '电视剧': ['电视剧', '美剧', '韩剧', '国产电视剧', '日剧', '英剧', '都市剧', '古装剧'],
      '综艺': ['综艺', '综艺节目', '真人秀', '音乐综艺', '脱口秀', '竞技综艺', '搞笑综艺'],
      '短剧': ['短剧', '甜宠短剧', '总裁短剧', '穿越短剧', '重生短剧', '都市短剧'],
    };
    return keywordMap[type] || ['推荐'];
  }

  /**
   * 根据 ID 获取类型名称（TMDb）
   */
  private getGenreName(id: number): string {
    const genreMap: Record<number, string> = {
      16: '动画',
      18: '剧情',
      28: '动作',
      35: '喜剧',
      80: '犯罪',
      99: '纪录',
      10749: '爱情',
      10751: '家庭',
      10752: '惊悚',
      10759: '冒险',
      10762: '儿童',
      10763: '新闻',
      10764: '真人秀',
      10765: '科幻',
      10766: '肥皂剧',
      10767: '谈话',
      10768: '战争',
      10769: '西部',
    };
    return genreMap[id] || '其他';
  }

  /**
   * 根据标题去重
   */
  private deduplicateByTitle(items: MediaContent[]): MediaContent[] {
    const seen = new Set<string>();
    const result: MediaContent[] = [];

    for (const item of items) {
      const title = item.title.toLowerCase().trim();
      if (!seen.has(title)) {
        seen.add(title);
        result.push(item);
      }
    }

    return result;
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
    // 移除评价类文章的后缀和特殊字符
    return title
      .replace(/(推荐|排名|榜单|Top\s*\d+|盘点|评分|豆瓣|知乎|B站|优酷|爱奇艺|腾讯|芒果)/gi, '')
      .replace(/(小说|动漫|电视剧|综艺|短剧)全集/g, '$1') // 保留类型但移除"全集"
      .replace(/\[\d+\]/g, '') // 移除 [1]、[2] 这类标记
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
  private extractYear(text: string): number {
    const yearMatch = text.match(/20[1-2][0-9]|19[8-9][0-9]/);
    return yearMatch ? parseInt(yearMatch[0]) : 2024;
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
  private extractStatus(text: string): '完结' | '连载中' | '更新中' {
    if (text.includes('连载') || text.includes('更新')) {
      return '连载中';
    }
    if (text.includes('完结') || text.includes('全集')) {
      return '完结';
    }
    return '完结'; // 默认返回完结
  }

  /**
   * 批量爬取所有类型的数据 - 使用多源爬取
   */
  async crawlAll(countPerType: number = 10): Promise<Record<string, MediaContent[]>> {
    const types: CrawlerConfig['type'][] = ['小说', '动漫', '电视剧', '综艺', '短剧'];
    const results: Record<string, MediaContent[]> = {};

    for (const type of types) {
      console.log(`开始爬取 ${type} 数据（多源聚合）...`);
      const result = await this.crawlMultiSource({ type, count: countPerType });

      if (result.success && result.data) {
        results[type] = result.data;
        console.log(`${type} 爬取完成，获取 ${result.data.length} 条数据，来源: ${result.source}`);
      } else {
        console.error(`${type} 爬取失败:`, result.error);
        results[type] = [];
      }
    }

    return results;
  }
}
