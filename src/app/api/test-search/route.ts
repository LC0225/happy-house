import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = '三体小说', count = 5 } = body;

    console.log('开始测试搜索:', { query, count });

    // 创建搜索客户端
    const config = new Config();
    const searchClient = new SearchClient(config);

    // 执行搜索
    const response = await searchClient.webSearch(
      query,
      count,
      false // 不需要摘要，只获取原始结果
    );

    console.log('搜索响应:', JSON.stringify(response, null, 2));

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('测试搜索失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
