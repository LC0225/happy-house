'use client';

import { MediaContent, MediaType, WatchHistory } from '@/types/media';
import { mockMediaData, mockUserData } from '@/data/mockData';
import { useState, useMemo, useEffect } from 'react';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'data'>('favorites');
  const [selectedType, setSelectedType] = useState<MediaType | '全部'>('全部');
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载收藏状态
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // 只在客户端挂载后加载 localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavoriteIds(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  // 获取收藏的媒体
  const favorites = useMemo(() => {
    return mockMediaData.filter(media => favoriteIds.has(media.id));
  }, [favoriteIds]);

  // 获取观看历史的媒体（按时间倒序）
  const watchHistory = useMemo(() => {
    return mockUserData.watchHistory
      .sort((a: WatchHistory, b: WatchHistory) => new Date(b.watchTime).getTime() - new Date(a.watchTime).getTime())
      .map((history: WatchHistory) => ({
        ...mockMediaData.find(m => m.id === history.mediaId)!,
        watchTime: history.watchTime,
        progress: history.progress
      }));
  }, []);

  // 根据类型筛选
  const filterByType = (items: any[], type: MediaType | '全部') => {
    if (type === '全部') return items;
    return items.filter(item => item.type === type);
  };

  const mediaTypes: (MediaType | '全部')[] = ['全部', '小说', '动漫', '电视剧', '综艺', '短剧'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">个人中心</h1>
              <p className="text-purple-100">管理您的收藏和观看记录</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              用
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-800">用户</h2>
              <p className="text-gray-600">VIP会员</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-gray-500">
                  <strong className="text-gray-700">{favorites.length}</strong> 部收藏
                </span>
                <span className="text-gray-500">
                  <strong className="text-gray-700">{watchHistory.length}</strong> 部观看记录
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-purple-100'
            }`}
          >
            我的收藏 ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-purple-100'
            }`}
          >
            最近观看 ({watchHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'data'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-purple-100'
            }`}
          >
            数据管理
          </button>
        </div>

        {/* 类型筛选 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 内容展示 */}
        {activeTab === 'favorites' && (
          <>
            {favorites.length > 0 ? (
              <>
                {/* 按类型分组显示收藏 */}
                {(selectedType === '全部' ? ['小说', '动漫', '电视剧', '综艺', '短剧'] as MediaType[] : [selectedType as MediaType]).map(type => {
                  const typeFavorites = favorites.filter(f => f.type === type);
                  if (typeFavorites.length === 0) return null;

                  return (
                    <div key={type} className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{type}</h3>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {typeFavorites.length} 部
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {typeFavorites.map(media => (
                          <MediaCard
                            key={media.id}
                            media={media}
                            isFavorite
                            onFavoriteToggle={(id) => {
                              setFavoriteIds(prev => {
                                const newFavorites = new Set(prev);
                                newFavorites.delete(id);
                                localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
                                return newFavorites;
                              });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-xl">暂无收藏内容</p>
                <Link href="/" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
                  去发现更多内容
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {filterByType(watchHistory, selectedType).length > 0 ? (
              <div className="space-y-4">
                {filterByType(watchHistory, selectedType).map((item: any) => (
                  <WatchHistoryCard key={item.id} media={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-xl">暂无观看记录</p>
                <Link href="/" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
                  去发现更多内容
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === 'data' && <DataManager />}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">多媒体内容平台 - 发现更多精彩内容</p>
        </div>
      </footer>
    </div>
  );
}

// 数据管理组件
function DataManager() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [count, setCount] = useState(3);
  const [selectedSources, setSelectedSources] = useState<string[]>(['web_search', 'tmdb', 'douban']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const types = [
    { id: 'all', label: '全部类型' },
    { id: '小说', label: '小说' },
    { id: '动漫', label: '动漫' },
    { id: '电视剧', label: '电视剧' },
    { id: '综艺', label: '综艺' },
    { id: '短剧', label: '短剧' },
  ];

  const sources = [
    { id: 'web_search', label: '联网搜索', desc: '从公开网页搜索并提取数据' },
    { id: 'tmdb', label: 'TMDb API', desc: '电影数据库（电影、电视剧、动漫）' },
    { id: 'douban', label: '豆瓣', desc: '中文影视资料库' },
  ];

  const startCrawler = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          count,
          sources: selectedSources.length > 0 ? selectedSources : undefined,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    if (!result?.success || !result?.data) return;

    try {
      let allData: any[] = [];

      // 判断 data 是数组还是对象
      if (Array.isArray(result.data)) {
        // 单个类型爬取：data 是数组
        allData = result.data.map((item: any) => ({
          ...item,
          type: item.type || selectedType,
        }));
      } else {
        // 所有类型爬取：data 是对象
        Object.entries(result.data).forEach(([type, items]: [string, any]) => {
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              allData.push({
                ...item,
                type: type,
              });
            });
          }
        });
      }

      // 保存到 localStorage
      localStorage.setItem('realMediaData', JSON.stringify(allData));
      alert('数据已保存！可以在首页的"真实数据"选项卡中使用');
    } catch (error) {
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">数据爬取管理</h3>

      {/* 配置表单 */}
      <div className="space-y-6 mb-8">
        {/* 类型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            数据类型
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  selectedType === type.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 数据源选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            数据来源（多源聚合）
          </label>
          <div className="space-y-2">
            {sources.map((source) => (
              <label
                key={source.id}
                className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSources([...selectedSources, source.id]);
                    } else {
                      setSelectedSources(selectedSources.filter(s => s !== source.id));
                    }
                  }}
                  className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">{source.label}</div>
                  <div className="text-sm text-gray-500">{source.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 数量设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            每个类型爬取数量（测试模式）
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            建议数量：1-5，测试模式使用少量数据快速验证
          </p>
        </div>

        {/* 开始按钮 */}
        <div className="flex gap-4">
          <button
            onClick={startCrawler}
            disabled={loading}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition shadow-lg"
          >
            {loading ? '爬取中...' : '开始爬取'}
          </button>

          {loading && (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
              正在从网络搜索并提取数据...
            </div>
          )}
        </div>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            爬取结果
          </h4>

          {result.success ? (
            <div className="space-y-6">
              {/* 汇总信息 */}
              {result.summary && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-purple-900">
                      爬取汇总
                    </h5>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-purple-600">
                        {result.summary.totalCount} 条
                      </span>
                      <button
                        onClick={saveToLocalStorage}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                      >
                        保存到首页
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(result.summary.byType).map(([type, count]: [string, unknown]) => (
                      <div key={type} className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{String(count)}</div>
                        <div className="text-sm text-gray-600">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 详细数据 */}
              {result.data && (
                <div className="space-y-4">
                  {Array.isArray(result.data) ? (
                    // 单个类型爬取：data 是数组
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h6 className="text-lg font-semibold text-gray-900 mb-3">
                        {result.source || '数据'} ({result.data.length} 条)
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {result.data.slice(0, 3).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="font-medium text-gray-900 mb-2">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>评分: {item.rating?.toFixed(1)}</div>
                              <div>年份: {item.year}</div>
                              <div>国家: {item.country}</div>
                            </div>
                          </div>
                        ))}
                        {result.data.length > 3 && (
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                            +{result.data.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 所有类型爬取：data 是对象
                    Object.entries(result.data).map(([type, items]: [string, any]) => (
                      <div key={type} className="border border-gray-200 rounded-lg p-4">
                        <h6 className="text-lg font-semibold text-gray-900 mb-3">
                          {type} ({items.length} 条)
                        </h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.isArray(items) ? items.slice(0, 3).map((item: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="font-medium text-gray-900 mb-2">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>评分: {item.rating?.toFixed(1)}</div>
                                <div>年份: {item.year}</div>
                                <div>国家: {item.country}</div>
                              </div>
                            </div>
                          )) : null}
                          {Array.isArray(items) && items.length > 3 && (
                            <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                              +{items.length - 3} 更多
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-sm text-red-800 font-medium">爬取失败</p>
              <p className="text-sm text-red-700 mt-1">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">使用说明</h4>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <strong className="font-semibold">数据来源：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>联网搜索 - 从公开网页获取真实数据</li>
              <li>智能解析 - 自动提取标题、评分、分类等信息</li>
              <li>多源聚合 - 支持小说、动漫、电视剧、综艺、短剧</li>
            </ul>
          </div>
          <div>
            <strong className="font-semibold">存储优化：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>只存储链接 - 不存储实际视频和图片文件</li>
              <li>轻量级设计 - 数据库仅保存元数据和 URL</li>
              <li>测试模式 - 默认少量数据，节省资源</li>
            </ul>
          </div>
          <div>
            <strong className="font-semibold">注意事项：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>爬取的数据为演示性质，仅供开发测试使用</li>
              <li>图片链接为占位符，需要手动替换</li>
              <li>请勿用于商业用途或大规模数据采集</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 观看历史卡片组件
function WatchHistoryCard({ media }: { media: any }) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '小说':
        return 'bg-blue-500';
      case '动漫':
        return 'bg-pink-500';
      case '电视剧':
        return 'bg-purple-500';
      case '综艺':
        return 'bg-green-500';
      case '短剧':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/detail/${media.id}`);
  };

  const handleContinueWatching = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex"
    >
      {/* 图片区域 */}
      <div className="relative w-40 flex-shrink-0">
        <img
          src={media.image}
          alt={media.title}
          className="w-full h-full object-cover"
        />
        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-purple-600"
            style={{ width: `${media.progress}%` }}
          />
        </div>
        {/* 类型标签 */}
        <div className={`absolute top-2 left-2 ${getTypeColor(media.type)} text-white px-2 py-1 rounded text-xs font-medium`}>
          {media.type}
        </div>
      </div>

      {/* 内容信息 */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* 标题 */}
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
            {media.title}
          </h3>

          {/* 描述 */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {media.description}
          </p>

          {/* 进度信息 */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>观看进度: </span>
            <span className="ml-2 font-semibold text-purple-600">{media.progress}%</span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {media.genre.slice(0, 3).map((genre: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-400">
            观看于 {formatDate(media.watchTime)}
          </div>
          <Link
            href={`/play/${media.id}`}
            onClick={handleContinueWatching}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            继续观看
          </Link>
        </div>
      </div>
    </div>
  );
}
