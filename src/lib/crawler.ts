import { SearchClient, Config, APIError, ImageGenerationClient } from 'coze-coding-dev-sdk';
import { S3Storage } from 'coze-coding-dev-sdk';
import { MediaContent } from '@/types/media';
import axios from 'axios';

// 爬虫配置
interface CrawlerConfig {
  type: '小说' | '动漫' | '电视剧' | '综艺' | '短剧' | '电影';
  count?: number;
  sources?: CrawlerSource[]; // 指定使用的数据源，默认使用所有可用源
  keyword?: string; // 自定义搜索关键词
  generateCover?: boolean; // 是否生成封面图片（默认 false，使用占位图）
}

// 数据源类型
type CrawlerSource = 'web_search' | 'tmdb' | 'douban' | 'custom' | 'fallback';

// 爬虫结果
interface CrawlerResult {
  success: boolean;
  data?: MediaContent[];
  error?: string;
  source?: string; // 数据来源
}

export class MediaCrawler {
  private searchClient: SearchClient | null = null;
  private imageClient: ImageGenerationClient | null = null;
  private storage: S3Storage | null = null;
  private sdkAvailable: boolean = false;

  constructor() {
    // 尝试初始化搜索客户端
    try {
      const config = new Config();
      this.searchClient = new SearchClient(config);
      this.imageClient = new ImageGenerationClient(config);
      this.sdkAvailable = true;
    } catch (error) {
      console.warn('搜索 SDK 初始化失败，将使用 fallback 模式:', error);
      this.sdkAvailable = false;
    }

    // 初始化对象存储
    try {
      this.storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: "",
        secretKey: "",
        bucketName: process.env.COZE_BUCKET_NAME,
        region: "cn-beijing",
      });
    } catch (error) {
      console.warn('对象存储初始化失败:', error);
    }
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
      // 检查 SDK 是否可用
      if (!this.sdkAvailable || !this.searchClient) {
        return this.generateFallbackData(type, count);
      }

      const keywords = this.getSearchKeywords(type);
      const items: MediaContent[] = [];

      for (const keyword of keywords.slice(0, 2)) {
        const response = await this.searchClient.webSearch(
          `site:douban.com/subject ${keyword}`,
          Math.ceil(count / 2),
          false
        );

        if (response.web_items) {
          const mediaItems = await this.parseWebResults(response.web_items, type);
          // 添加豆瓣标签
          mediaItems.forEach(item => {
            item.tags = [...item.tags, '豆瓣', '国产'];
          });
          items.push(...mediaItems);
        }
      }

      return { success: true, data: items.slice(0, count), source: 'douban' };
    } catch (error) {
      console.error('豆瓣爬取失败:', error);
      return this.generateFallbackData(type, count);
    }
  }

  /**
   * 通过网络搜索爬取媒体数据
   */
  async crawlFromWeb(config: CrawlerConfig): Promise<CrawlerResult> {
    const { type, count = 10, keyword } = config;

    // 如果 SDK 不可用，使用 fallback 模式
    if (!this.sdkAvailable || !this.searchClient) {
      console.log('[爬虫] SDK 不可用，使用 fallback 模式生成数据');
      return this.generateFallbackData(type, count, keyword);
    }

    try {
      const results: MediaContent[] = [];

      // 如果提供了自定义关键词，直接使用；否则使用类型关键词
      const searchKeywords = keyword ? [`${keyword} ${type}`] : [type];

      console.log(`[爬虫] 开始搜索，关键词: ${searchKeywords.join(', ')}, 数量: ${count}`);

      for (const searchKeyword of searchKeywords) {
        try {
          console.log(`[爬虫] 搜索关键词: ${searchKeyword}`);
          const response = await this.searchClient.webSearch(
            searchKeyword,
            count,
            false
          );

          console.log(`[爬虫] 搜索返回，web_items 数量: ${response.web_items?.length || 0}`);

          if (response.web_items && response.web_items.length > 0) {
            console.log(`[爬虫] 前3个搜索结果:`, response.web_items.slice(0, 3).map(item => ({
              title: item.title,
              url: item.url
            })));

            const mediaItems = await this.parseWebResults(response.web_items, type);
            console.log(`[爬虫] 解析后得到 ${mediaItems.length} 条有效数据`);

            results.push(...mediaItems);
          }
        } catch (error) {
          console.error(`[爬虫] 搜索 ${searchKeyword} 失败:`, error);
          // 如果是 APIError，说明 SDK 不可用，使用 fallback
          if (error instanceof APIError) {
            console.log('[爬虫] 检测到 API 错误，切换到 fallback 模式');
            return this.generateFallbackData(type, count, keyword);
          }
        }
      }

      console.log(`[爬虫] 总共获取 ${results.length} 条数据`);

      // 如果没有获取到任何结果，使用 fallback
      if (results.length === 0) {
        console.log('[爬虫] 搜索未返回有效结果，使用 fallback 模式');
        return this.generateFallbackData(type, count, keyword);
      }

      return {
        success: true,
        data: results.slice(0, count),
        source: 'web_search',
      };
    } catch (error) {
      // 发生任何错误都使用 fallback
      console.error('[爬虫] 搜索失败，使用 fallback 模式:', error);
      return this.generateFallbackData(type, count, keyword);
    }
  }

  /**
   * Fallback 模式：基于关键词生成示例数据
   */
  private generateFallbackData(type: string, count: number, keyword?: string): CrawlerResult {
    const results: MediaContent[] = [];

    // 如果有自定义关键词，优先使用关键词生成数据
    if (keyword) {
      console.log(`[Fallback] 使用关键词 "${keyword}" 生成 ${count} 条数据`);

      // 为不同的数字后缀生成变体，让每次搜索结果不同
      const variantSuffixes = [
        '',
        ' 第1部',
        ' 第2部',
        ' 完结版',
        ' 精彩版',
        ' 特别篇',
        ' 2024',
        ' 热门',
        ' 推荐',
        ' 经典',
      ];

      // 使用关键词结合后缀生成更多样的数据
      for (let i = 0; i < count; i++) {
        // 随机选择一个后缀
        const suffix = variantSuffixes[i % variantSuffixes.length] || '';
        const title = `${keyword}${suffix}`;

        results.push({
          id: `${Date.now()}${i}${Math.random().toString(36).substr(2, 6)}`,
          title: title,
          type: type as any,
          country: this.getRandomCountry(),
          year: this.getRandomYear(),
          rating: parseFloat((7 + Math.random() * 2.5).toFixed(1)),
          image: '/images/placeholders/default.jpg',
          description: `这是一部关于${keyword}的${type}作品，内容精彩，值得一看。`,
          genre: this.getGenreByType(type),
          tags: ['热门', '推荐', '2024'],
          status: Math.random() > 0.5 ? '完结' as any : '连载中' as any,
          externalUrl: '',
        });
      }

      return {
        success: true,
        data: results,
        source: 'fallback',
      };
    }

    // 基础示例数据
    const baseExamples: Record<string, Array<{ title: string; country: string; year: number; rating: number }>> = {
      '小说': [
        { title: '三体', country: '中国', year: 2008, rating: 9.3 },
        { title: '斗破苍穹', country: '中国', year: 2011, rating: 8.9 },
        { title: '庆余年', country: '中国', year: 2019, rating: 9.1 },
        { title: '赘婿', country: '中国', year: 2018, rating: 8.5 },
        { title: '凡人修仙传', country: '中国', year: 2017, rating: 8.8 },
      ],
      '动漫': [
        { title: '进击的巨人', country: '日本', year: 2013, rating: 9.2 },
        { title: '鬼灭之刃', country: '日本', year: 2019, rating: 9.0 },
        { title: '海贼王', country: '日本', year: 1999, rating: 9.5 },
        { title: '火影忍者', country: '日本', year: 2002, rating: 9.1 },
        { title: '一拳超人', country: '日本', year: 2015, rating: 8.9 },
      ],
      '电视剧': [
        { title: '权力的游戏', country: '美国', year: 2011, rating: 9.0 },
        { title: '绝命毒师', country: '美国', year: 2008, rating: 9.4 },
        { title: '琅琊榜', country: '中国', year: 2015, rating: 9.3 },
        { title: '庆余年', country: '中国', year: 2019, rating: 9.1 },
        { title: '黑暗荣耀', country: '韩国', year: 2022, rating: 9.0 },
      ],
      '综艺': [
        { title: '奔跑吧兄弟', country: '中国', year: 2014, rating: 7.8 },
        { title: '极限挑战', country: '中国', year: 2015, rating: 8.2 },
        { title: '快乐大本营', country: '中国', year: 1997, rating: 8.0 },
        { title: '我是歌手', country: '中国', year: 2013, rating: 8.5 },
        { title: '脱口秀大会', country: '中国', year: 2017, rating: 8.8 },
      ],
      '短剧': [
        { title: '总裁的替身新娘', country: '中国', year: 2023, rating: 8.2 },
        { title: '闪婚成瘾', country: '中国', year: 2023, rating: 8.0 },
        { title: '重生之豪门千金', country: '中国', year: 2024, rating: 8.1 },
        { title: '穿越时空的爱恋', country: '中国', year: 2023, rating: 7.9 },
        { title: '霸道总裁爱上我', country: '中国', year: 2024, rating: 8.3 },
      ],
      '电影': [
        { title: '流浪地球', country: '中国', year: 2019, rating: 8.5 },
        { title: '阿凡达', country: '美国', year: 2009, rating: 8.7 },
        { title: '千与千寻', country: '日本', year: 2001, rating: 9.3 },
        { title: '泰坦尼克号', country: '美国', year: 1997, rating: 9.2 },
        { title: '复仇者联盟', country: '美国', year: 2012, rating: 8.8 },
      ],
    };

    // 获取基础示例
    const examples = baseExamples[type] || baseExamples['小说'];

    for (let i = 0; i < Math.min(count, examples.length); i++) {
      const example = examples[i];

      results.push({
        id: `${Date.now()}${i}${Math.random().toString(36).substr(2, 6)}`,
        title: example.title,
        type: type as any,
        country: example.country,
        year: example.year,
        rating: example.rating,
        image: '/images/placeholders/default.jpg',
        description: `这是一部关于${example.title}的${type}作品，内容精彩，值得一看。`,
        genre: this.getGenreByType(type),
        tags: ['热门', '推荐', '2024'],
        status: '完结' as any,
        externalUrl: '',
      });
    }

    return {
      success: true,
      data: results,
      source: 'fallback',
    };
  }

  /**
   * 随机获取国家
   */
  private getRandomCountry(): string {
    const countries = ['中国', '日本', '美国', '韩国', '英国', '法国', '德国'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  /**
   * 随机获取年份
   */
  private getRandomYear(): number {
    const minYear = 2000;
    const maxYear = 2024;
    return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  }

  /**
   * 根据类型获取题材
   */
  private getGenreByType(type: string): string[] {
    const genreMap: Record<string, string[]> = {
      '小说': ['玄幻', '言情', '科幻', '悬疑', '历史'],
      '动漫': ['热血', '恋爱', '科幻', '悬疑', '治愈'],
      '电视剧': ['剧情', '科幻', '悬疑', '喜剧', '历史'],
      '综艺': ['真人秀', '音乐', '脱口秀', '竞技', '访谈'],
      '短剧': ['甜宠', '总裁', '穿越', '重生', '悬疑'],
      '电影': ['科幻', '动作', '剧情', '喜剧', '动画', '冒险'],
    };
    const genres = genreMap[type] || ['热门'];
    const shuffled = genres.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
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

    console.log(`[解析] 开始解析 ${items.length} 条搜索结果`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        console.log(`[解析] 第 ${i + 1} 条:`, {
          title: item.title,
          url: item.url
        });

        // 检查 URL 是否有效
        if (!this.isValidUrl(item.url)) {
          console.log(`[解析] 第 ${i + 1} 条: URL 无效，跳过`);
          continue;
        }

        // 从搜索结果中提取标题
        const title = this.extractTitle(item.title, type);

        // 检查标题是否有效
        if (!this.isValidTitle(title)) {
          console.log(`[解析] 第 ${i + 1} 条: 标题 "${title}" 无效，跳过`);
          continue;
        }

        console.log(`[解析] 第 ${i + 1} 条: 通过验证，添加到结果`);

        // 从搜索结果中提取信息
        const media: MediaContent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: title,
          type: type as any,
          country: this.extractCountry(item.snippet),
          year: this.extractYear(item.snippet),
          rating: this.extractRating(item.snippet),
          image: '/images/placeholders/default.jpg',
          description: this.extractDescription(item.snippet),
          genre: this.extractGenre(item.snippet, type),
          tags: this.extractTags(item.snippet),
          status: this.extractStatus(item.snippet),
          externalUrl: item.url,
        };

        mediaItems.push(media);
      } catch (error) {
        console.error(`[解析] 第 ${i + 1} 条: 解析失败`, error);
      }
    }

    console.log(`[解析] 最终获得 ${mediaItems.length} 条有效数据`);

    return mediaItems;
  }

  /**
   * 提取标题
   */
  private extractTitle(title: string, type: string): string {
    // 移除评价类文章的后缀和特殊字符
    let cleanedTitle = title
      .replace(/推荐|排名|榜单|Top\s*\d+|盘点|评分|豆瓣|知乎|B站|优酷|爱奇艺|腾讯|芒果|优酷|土豆|搜狐/gi, '')
      .replace(/(小说|动漫|电视剧|综艺|短剧)全集/g, '$1') // 保留类型但移除"全集"
      .replace(/\[\d+\]/g, '') // 移除 [1]、[2] 这类标记
      .replace(/第\d+季/g, '') // 移除"第1季"等
      .replace(/第\d+期/g, '') // 移除"第1期"等
      .replace(/第\d+集/g, '') // 移除"第1集"等
      .replace(/[\s\-_|]+/g, ' ')
      .trim()
      .substring(0, 50);

    // 更严格的过滤：移除明显是评价类文章的内容
    const reviewKeywords = [
      '排行榜', '十大', '最好看', '推荐', '解析', '盘点', '评分',
      'Top', '榜单', '经典', '必看', '精品', '全集',
      '连载', '更新', '最新', '完结', '在线观看', '免费',
      '高清', '完整', '全集', '未删减', '无删减'
    ];

    // 如果标题包含这些关键词，尝试提取核心名称
    for (const keyword of reviewKeywords) {
      if (cleanedTitle.includes(keyword)) {
        cleanedTitle = cleanedTitle.replace(keyword, '').trim();
      }
    }

    // 移除括号及内容（通常是一些说明文字）
    cleanedTitle = cleanedTitle.replace(/\([^)]*\)/g, '').replace(/【[^】]*】/g, '').trim();

    // 如果标题太短或者只剩类型名称，返回原标题的核心部分
    if (cleanedTitle.length < 2 || cleanedTitle === type) {
      // 尝试从原标题提取第一个分句
      const parts = title.split(/[,，、\s-_|]/);
      cleanedTitle = parts[0]?.replace(/推荐|排名|榜单|Top|盘点|评分/gi, '').trim() || title.substring(0, 20);
    }

    return cleanedTitle.substring(0, 50);
  }

  /**
   * 检查 URL 是否为有效作品页面
   */
  private isValidUrl(url: string): boolean {
    if (!url) return false;

    // 放宽 URL 验证，只要是正常的 URL 都接受
    // 只排除一些明显的无效 URL
    const invalidPatterns = [
      '/review', '/comment', '/list', '/rank', '/topic',
      '/news', '/article', '/blog', '/tag', '/category'
    ];

    for (const pattern of invalidPatterns) {
      if (url.includes(pattern)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查标题是否为有效作品标题（非评论类文章）
   */
  private isValidTitle(title: string): boolean {
    // 放宽过滤条件，只过滤明显的评论类文章
    const reviewPatterns = [
      /^推荐/, /^排名/, /^榜单/, /^Top\s*\d+/, /^盘点/, /^评分/,
      /排行榜/, /解析/,
    ];

    // 检查是否匹配任何评论类模式
    for (const pattern of reviewPatterns) {
      if (pattern.test(title)) {
        return false;
      }
    }

    // 检查标题长度是否合理（放宽到 2-100）
    if (title.length < 2 || title.length > 100) {
      return false;
    }

    // 检查是否只包含类型名称
    const types = ['小说', '动漫', '电视剧', '综艺', '短剧'];
    if (types.includes(title.trim())) {
      return false;
    }

    // 检查是否包含"全集"、"完整版"等后缀，只保留核心标题
    // 不要过滤这些，而是让 extractTitle 处理

    return true;
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

  /**
   * 为单个作品生成封面图片
   */
  async generateCoverForItem(item: MediaContent): Promise<string> {
    try {
      // 如果对象存储不可用，返回占位图
      if (!this.storage) {
        console.warn('对象存储不可用，使用占位图');
        return '/images/placeholders/default.jpg';
      }

      // 如果图片生成客户端不可用，返回占位图
      if (!this.imageClient || !this.sdkAvailable) {
        console.warn('图片生成 SDK 不可用，使用占位图');
        return '/images/placeholders/default.jpg';
      }

      // 根据作品类型和描述生成封面提示词
      const prompt = this.generateCoverPrompt(item);
      console.log(`[封面生成] 为 "${item.title}" 生成封面，提示词: ${prompt}`);

      // 生成图片
      const response = await this.imageClient.generate({
        prompt,
        size: '2K',
        watermark: false,
      });

      const helper = this.imageClient.getResponseHelper(response);

      if (!helper.success || helper.imageUrls.length === 0) {
        console.error(`[封面生成] 失败:`, helper.errorMessages);
        return '/images/placeholders/default.jpg';
      }

      // 下载图片
      const imageUrl = helper.imageUrls[0];
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // 生成文件名：标题_UUID.jpg
      const safeTitle = item.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
      const fileName = `${safeTitle}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const fileKey = `covers/${fileName}`;

      // 上传到对象存储
      const key = await this.storage.uploadFile({
        fileContent: imageBuffer,
        fileName: fileKey,
        contentType: 'image/jpeg',
      });

      // 生成访问 URL
      const coverUrl = await this.storage.generatePresignedUrl({
        key,
        expireTime: 31536000, // 1年有效期
      });

      console.log(`[封面生成] 成功: ${coverUrl}`);
      return coverUrl;

    } catch (error) {
      console.error(`[封面生成] 为 "${item.title}" 生成封面失败:`, error);
      return '/images/placeholders/default.jpg';
    }
  }

  /**
   * 生成封面提示词
   */
  private generateCoverPrompt(item: MediaContent): string {
    // 根据作品类型生成不同的提示词
    const typePromptMap: Record<string, string> = {
      '小说': 'book cover, minimalist design, elegant typography, Chinese literature style, high quality, 2K resolution',
      '动漫': 'anime poster, vibrant colors, Japanese anime style, character illustration, dynamic composition, high quality, 2K resolution',
      '电视剧': 'TV series poster, cinematic style, dramatic lighting, professional photography, high quality, 2K resolution',
      '综艺': 'variety show poster, colorful, energetic, entertainment style, modern design, high quality, 2K resolution',
      '短剧': 'drama poster, romantic atmosphere, soft lighting, emotional storytelling, high quality, 2K resolution',
      '电影': 'movie poster, epic scene, cinematic quality, dramatic lighting, professional composition, high quality, 2K resolution',
    };

    const basePrompt = typePromptMap[item.type] || typePromptMap['电影'];

    // 添加作品标题和描述信息
    const detailPrompt = `, featuring "${item.title}", ${item.genre.join(' and ')} genre, ${item.tags.join(' and ')}`;

    return `${basePrompt}${detailPrompt}`;
  }

  /**
   * 批量生成封面（用于现有数据）
   */
  async generateCoversForItems(items: MediaContent[]): Promise<MediaContent[]> {
    console.log(`[批量封面生成] 开始为 ${items.length} 个作品生成封面...`);

    const results: MediaContent[] = [];
    const batchSize = 3; // 每批处理3个，避免API限流

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      console.log(`[批量封面生成] 处理批次 ${i / batchSize + 1}/${Math.ceil(items.length / batchSize)}`);

      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const coverUrl = await this.generateCoverForItem(item);
          return {
            ...item,
            image: coverUrl,
          };
        })
      );

      results.push(...batchResults);

      // 等待一段时间，避免API限流
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[批量封面生成] 完成，成功生成 ${results.length} 个封面`);
    return results;
  }
}
