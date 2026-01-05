import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '测试';

    console.log('测试搜索:', query);

    const config = new Config();
    const client = new SearchClient(config);

    // 使用 search 方法而不是 webSearch
    const response = await client.search({
      query: query,
      search_type: 'web',
      count: 5,
    });

    console.log('搜索结果:', JSON.stringify(response, null, 2));

    return NextResponse.json({
      query,
      hasWebItems: !!response.web_items,
      webItemsCount: response.web_items?.length || 0,
      hasSummary: !!response.summary,
      webItems: response.web_items?.slice(0, 3) || [],
    });
  } catch (error) {
    console.error('测试搜索失败:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
