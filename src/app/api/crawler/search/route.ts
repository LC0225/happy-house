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
