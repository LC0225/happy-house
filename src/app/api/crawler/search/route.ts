import { NextRequest, NextResponse } from 'next/server';
import { MediaCrawler } from '@/lib/crawler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, type = '全部', count = 10 } = body;

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '搜索关键词不能为空',
      }, { status: 400 });
    }

    console.log('开始搜索爬取:', { keyword, type, count });

    // 创建爬虫实例
    const crawler = new MediaCrawler();

    // 如果指定了类型，使用对应的类型爬取
    let results: any[] = [];
    let source = '';

    if (type === '全部') {
      // 全部类型：尝试从所有类型中搜索
      const types: Array<'小说' | '动漫' | '电视剧' | '综艺' | '短剧' | '电影'> = [
        '小说', '动漫', '电视剧', '综艺', '短剧', '电影'
      ];

      // 并行搜索所有类型
      const searchPromises = types.map(t =>
        crawler.crawlFromWeb({
          type: t,
          count: Math.ceil(count / types.length),
          keyword,
        })
      );

      const searchResults = await Promise.all(searchPromises);

      // 合并结果
      searchResults.forEach(result => {
        if (result.success && result.data) {
          results.push(...result.data);
        }
        if (result.source && !source) {
          source = result.source;
        }
      });
    } else {
      // 指定类型：只搜索该类型
      const result = await crawler.crawlFromWeb({
        type: type as any,
        count,
        keyword,
      });

      if (result.success && result.data) {
        results = result.data;
        source = result.source || 'fallback';
      }
    }

    // 标注搜索关键词
    results = results.map(item => ({
      ...item,
      searchKeyword: keyword,
    }));

    // 按评分排序，取前 count 个
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    results = results.slice(0, count);

    // 返回结果
    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        totalCount: results.length,
        keyword: keyword,
        type: type,
        source: source || 'fallback',
      },
    });
  } catch (error) {
    console.error('搜索爬取失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
      message: '搜索服务暂时不可用，请稍后重试',
    }, { status: 500 });
  }
}
