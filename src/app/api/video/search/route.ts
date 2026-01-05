import { NextRequest, NextResponse } from 'next/server';
import { SearchClient, Config, APIError } from 'coze-coding-dev-sdk';

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

    // 搜索关键词构建 - 搜索主流视频平台
    const searchQuery = type === '电影'
      ? `"${title}" 在线观看 正版 腾讯视频 爱奇艺 优酷 哔哩哔哩`
      : `"${title}" 在线观看 第1集 正版 腾讯视频 爱奇艺 优酷 哔哩哔哩`;

    console.log('[视频搜索] 开始搜索:', searchQuery);

    try {
      // 初始化搜索客户端
      const config = new Config();
      const client = new SearchClient(config);

      // 执行网络搜索
      const response = await client.webSearch(searchQuery, 10, false);

      console.log('[视频搜索] 搜索结果:', JSON.stringify(response, null, 2));

      if (!response.web_items || response.web_items.length === 0) {
        return NextResponse.json({
          success: true,
          query: searchQuery,
          results: [],
          message: '未找到相关视频源'
        });
      }

      // 处理搜索结果，提取视频平台信息
      const results = response.web_items
        .filter(item => item.url && item.site_name)
        .map((item, index) => {
          const url = item.url!;
          const siteName = item.site_name!;
          // 判断平台类型
          let platform = siteName;
          let quality = '高清';

          // 根据网站URL和名称判断平台
          if (url.includes('v.qq.com') || siteName.includes('腾讯')) {
            platform = '腾讯视频';
            quality = '高清';
          } else if (url.includes('iqiyi.com') || siteName.includes('爱奇艺')) {
            platform = '爱奇艺';
            quality = '超清';
          } else if (url.includes('youku.com') || siteName.includes('优酷')) {
            platform = '优酷';
            quality = '高清';
          } else if (url.includes('bilibili.com') || siteName.includes('哔哩') || siteName.includes('B站')) {
            platform = '哔哩哔哩';
            quality = '高清';
          } else if (url.includes('mgtv.com') || siteName.includes('芒果')) {
            platform = '芒果TV';
            quality = '高清';
          }

          return {
            platform,
            url: url,
            quality,
            description: item.snippet || `${title} 在线观看`,
            title: item.title,
            index: index + 1,
          };
        });

      // 去重（根据平台名称）
      const uniqueResults = results.filter((result, index, self) =>
        index === self.findIndex(r => r.platform === result.platform)
      );

      return NextResponse.json({
        success: true,
        query: searchQuery,
        results: uniqueResults,
        total: uniqueResults.length,
        message: `找到 ${uniqueResults.length} 个视频源`
      });
    } catch (apiError) {
      if (apiError instanceof APIError) {
        console.error('[视频搜索] API Error:', {
          message: apiError.message,
          statusCode: apiError.statusCode
        });
      } else {
        console.error('[视频搜索] 搜索错误:', apiError);
      }

      // 搜索服务失败时，返回建议的视频平台
      const suggestedPlatforms = [
        {
          platform: '腾讯视频',
          url: `https://v.qq.com/x/search/?q=${encodeURIComponent(title)}`,
          quality: '高清',
          description: '腾讯视频 - 中国领先的视频媒体平台',
          title: title,
          index: 1,
        },
        {
          platform: '爱奇艺',
          url: `https://www.iqiyi.com/search/${encodeURIComponent(title)}`,
          quality: '超清',
          description: '爱奇艺 - 高品质视频娱乐平台',
          title: title,
          index: 2,
        },
        {
          platform: '优酷',
          url: `https://so.youku.com/search_video/q_${encodeURIComponent(title)}`,
          quality: '高清',
          description: '优酷 - 优质视频分享网站',
          title: title,
          index: 3,
        },
        {
          platform: '哔哩哔哩',
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(title)}`,
          quality: '高清',
          description: '哔哩哔哩 - 乐于分享的年轻社区',
          title: title,
          index: 4,
        },
        {
          platform: '芒果TV',
          url: `https://so.mgtv.com/so?q=${encodeURIComponent(title)}`,
          quality: '高清',
          description: '芒果TV - 快乐中国',
          title: title,
          index: 5,
        },
      ];

      return NextResponse.json({
        success: true,
        query: searchQuery,
        results: suggestedPlatforms,
        message: '搜索服务暂不可用，已推荐主流视频平台',
        error: apiError instanceof Error ? apiError.message : '未知错误',
        note: '由于搜索服务暂时不可用，已为您推荐主流视频平台的搜索页面'
      });
    }
  } catch (error) {
    console.error('[视频搜索] 系统错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '搜索失败'
      },
      { status: 500 }
    );
  }
}
