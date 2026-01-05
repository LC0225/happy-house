import { NextResponse } from 'next/server';
import { MediaCrawler } from '@/lib/crawler';
import { MediaContent } from '@/types/media';

/**
 * POST /api/crawler/generate-covers
 * 批量生成封面图片
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '缺少 items 参数或格式不正确' },
        { status: 400 }
      );
    }

    console.log(`[API] 开始为 ${items.length} 个作品生成封面...`);

    const crawler = new MediaCrawler();
    const results = await crawler.generateCoversForItems(items);

    console.log(`[API] 封面生成完成`);

    return NextResponse.json({
      success: true,
      data: results,
      message: `成功为 ${results.length} 个作品生成封面`,
    });
  } catch (error) {
    console.error('封面生成错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
