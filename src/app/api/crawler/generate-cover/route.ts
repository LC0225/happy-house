import { NextResponse } from 'next/server';
import { MediaCrawler } from '@/lib/crawler';
import { MediaContent } from '@/types/media';

/**
 * POST /api/crawler/generate-cover
 * 为单个作品生成封面图片
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item } = body;

    if (!item || !item.title || !item.type) {
      return NextResponse.json(
        { error: '缺少 item 参数或格式不正确' },
        { status: 400 }
      );
    }

    console.log(`[API] 开始为作品 "${item.title}" 生成封面...`);

    const crawler = new MediaCrawler();
    const coverUrl = await crawler.generateCoverForItem(item);

    console.log(`[API] 封面生成完成: ${coverUrl}`);

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        image: coverUrl,
      },
      message: `成功为作品 "${item.title}" 生成封面`,
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
