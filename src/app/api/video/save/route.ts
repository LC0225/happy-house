import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mediaId, videoUrl, episodeUrls } = body;

    if (!mediaId) {
      return NextResponse.json(
        { error: '请提供作品ID' },
        { status: 400 }
      );
    }

    if (!videoUrl && (!episodeUrls || Object.keys(episodeUrls).length === 0)) {
      return NextResponse.json(
        { error: '请提供视频URL或分集URL' },
        { status: 400 }
      );
    }

    // 从 localStorage 中获取数据（这里通过客户端传递，实际应该存储到数据库）
    // 由于API无法直接访问localStorage，我们需要让客户端处理保存逻辑
    // 这个API主要用于验证和预处理数据

    // 验证URL格式
    const urlPattern = /^https?:\/\/.+\.(mp4|m3u8|flv|webm|mkv)/i;
    const isValidUrl = (url: string) => urlPattern.test(url);

    if (videoUrl && !isValidUrl(videoUrl)) {
      return NextResponse.json(
        { error: '视频URL格式不正确，应该是.mp4/.m3u8/.flv/.webm/.mkv等格式' },
        { status: 400 }
      );
    }

    if (episodeUrls) {
      for (const [episode, url] of Object.entries(episodeUrls)) {
        if (!isValidUrl(String(url))) {
          return NextResponse.json(
            { error: `第${episode}集的URL格式不正确` },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '视频URL验证通过，请在客户端保存配置',
      data: {
        mediaId,
        videoUrl,
        episodeUrls,
      }
    });
  } catch (error) {
    console.error('Save video URL error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存失败'
      },
      { status: 500 }
    );
  }
}
