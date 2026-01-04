'use client';

import { MediaContent, MediaType, WatchHistory } from '@/types/media';
import { mockMediaData, mockUserData } from '@/data/mockData';
import { useState, useMemo } from 'react';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [selectedType, setSelectedType] = useState<MediaType | '全部'>('全部');

  // 获取收藏的媒体
  const favorites = useMemo(() => {
    return mockMediaData.filter(media => mockUserData.favorites.includes(media.id));
  }, []);

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
        <div className="flex gap-4 mb-6">
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
        {activeTab === 'favorites' ? (
          <>
            {filterByType(favorites, selectedType).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filterByType(favorites, selectedType).map(media => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-xl">暂无收藏内容</p>
                <Link href="/" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
                  去发现更多内容
                </Link>
              </div>
            )}
          </>
        ) : (
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

  return (
    <Link href={`/detail/${media.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex">
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

          {/* 时间 */}
          <div className="text-sm text-gray-400 mt-3">
            观看于 {formatDate(media.watchTime)}
          </div>
        </div>
      </div>
    </Link>
  );
}
