import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type } = body;

    if (!title) {
      return NextResponse.json(
        { error: '请提供作品标题' },
        { status: 400 }
      );
    }

    // 搜索关键词构建
    const searchQuery = type === '电影'
      ? `${title} 在线观看 正版 官方`
      : `${title} 第1集 在线观看 正版 官方`;

    // 模拟搜索结果（实际应该使用真实的搜索服务）
    // 注意：由于沙箱环境的网络限制，这里返回模拟数据
    const mockResults = [
      {
        platform: '示例平台1',
        url: `https://example.com/video/${encodeURIComponent(title)}`,
        quality: '高清',
        description: `${title} 正版在线观看`,
      },
      {
        platform: '示例平台2',
        url: `https://example2.com/play/${encodeURIComponent(title)}`,
        quality: '超清',
        description: `${title} 官方授权播放`,
      },
      {
        platform: '示例平台3',
        url: `https://example3.com/v/${encodeURIComponent(title)}`,
        quality: '蓝光',
        description: `${title} 4K超清画质`,
      },
    ];

    return NextResponse.json({
      success: true,
      query: searchQuery,
      results: mockResults,
      note: '当前为模拟数据，生产环境应接入真实搜索服务'
    });
  } catch (error) {
    console.error('Search video URL error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '搜索失败'
      },
      { status: 500 }
    );
  }
}
