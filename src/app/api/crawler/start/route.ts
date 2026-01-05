import { NextResponse } from 'next/server';
import { MediaCrawler } from '@/lib/crawler';

/**
 * POST /api/crawler/start
 * 启动爬虫任务
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, count = 10 } = body;

    if (!type) {
      return NextResponse.json(
        { error: '缺少 type 参数' },
        { status: 400 }
      );
    }

    const crawler = new MediaCrawler();
    
    if (type === 'all') {
      // 爬取所有类型
      const results = await crawler.crawlAll(count);
      
      const totalCount = Object.values(results).reduce(
        (sum, items) => sum + items.length,
        0
      );

      return NextResponse.json({
        success: true,
        data: results,
        summary: {
          totalCount,
          byType: Object.fromEntries(
            Object.entries(results).map(([type, items]) => [
              type,
              items.length,
            ])
          ),
        },
      });
    } else {
      // 爬取指定类型
      const result = await crawler.crawlFromWeb({ type, count });

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('爬虫错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crawler/status
 * 获取爬虫状态（预留）
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    availableTypes: ['小说', '动漫', '电视剧', '综艺', '短剧', 'all'],
  });
}
