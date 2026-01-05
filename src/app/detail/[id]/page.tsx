'use client';

import { mockMediaData } from '@/data/mockData';
import { MediaContent } from '@/types/media';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [media, setMedia] = useState<MediaContent | null>(null);
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载真实数据
  useEffect(() => {
    setMounted(true);
    try {
      const realDataSaved = localStorage.getItem('realMediaData');
      const realData = realDataSaved ? JSON.parse(realDataSaved) : [];

      console.log('=== 详情页调试信息 ===');
      console.log('查找的 ID:', resolvedParams.id);
      console.log('localStorage 中的数据数量:', realData.length);
      console.log('localStorage 中的所有 ID:', realData.map((item: MediaContent) => item.id));

      // 先从真实数据中查找
      const foundInReal = realData.find((item: MediaContent) => item.id === resolvedParams.id);

      console.log('在真实数据中找到的结果:', foundInReal);

      if (foundInReal) {
        setMedia(foundInReal);
        return;
      }

      // 再从 mockData 中查找
      const foundInMock = mockMediaData.find(item => item.id === resolvedParams.id);

      console.log('在 mockData 中找到的结果:', foundInMock);

      if (foundInMock) {
        setMedia(foundInMock);
        return;
      }

      // 都没找到
      setMedia(null);
    } catch (error) {
      console.error('Failed to load media data:', error);
      // 降级到只从 mockData 查找
      const foundInMock = mockMediaData.find(item => item.id === resolvedParams.id);
      setMedia(foundInMock || null);
    }
  }, [resolvedParams.id]);

  if (!mounted) {
    // 首次渲染时显示加载状态
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">内容不存在</h1>
          <p className="text-gray-600 mb-4">该作品可能已被删除或数据未正确加载</p>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

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

  const isNovel = media.type === '小说';

  // 对于小说，如果没有章节，检查 mockData 中是否有对应的章节
  let mediaWithChapters = media;
  if (isNovel && (!media.chapters || media.chapters.length === 0)) {
    // 精确匹配
    let mockNovel = mockMediaData.find(m => m.title === media.title && m.type === '小说');

    // 如果精确匹配失败，尝试模糊匹配（标题包含关系）
    if (!mockNovel) {
      mockNovel = mockMediaData.find(m =>
        m.type === '小说' &&
        (m.title.includes(media.title) || media.title.includes(m.title))
      );
    }

    if (mockNovel && mockNovel.chapters) {
      mediaWithChapters = {
        ...media,
        chapters: mockNovel.chapters
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-purple-100 hover:text-white transition-colors">
            ← 返回首页
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* 图片区域 */}
            <div className="md:w-1/3">
              <PlaceholderImage media={media} className="w-full h-auto" />
            </div>

            {/* 信息区域 */}
            <div className="md:w-2/3 p-6 md:p-8">
              {/* 类型和状态标签 */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`${getTypeColor(media.type)} text-white px-4 py-1 rounded-full text-sm font-medium`}>
                  {media.type}
                </span>
                <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">
                  {media.status}
                </span>
              </div>

              {/* 标题 */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{media.title}</h1>

              {/* 评分和年份 */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <span className="text-xl md:text-2xl font-bold mr-2">{media.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 md:w-6 md:h-6 ${i < Math.floor(media.rating / 2) ? 'fill-current' : 'fill-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-gray-600 text-base md:text-lg">
                  {media.year}年 · {media.country}
                </div>
              </div>

              {/* 描述 */}
              <div className="mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">简介</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{media.description}</p>
              </div>

              {/* 题材 */}
              <div className="mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">题材</h2>
                <div className="flex flex-wrap gap-2">
                  {media.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* 标签 */}
              <div className="mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-4">
                {isNovel && media.chapters && media.chapters.length > 0 ? (
                  <Link
                    href={`/reader/${media.id}/1`}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                  >
                    开始阅读
                  </Link>
                ) : (
                  <Link
                    href={`/play/${media.id}`}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                  >
                    {media.type === '小说' ? '立即阅读' : '立即观看'}
                  </Link>
                )}
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  加入收藏
                </button>
              </div>
            </div>
          </div>

          {/* 小说章节列表 */}
          {isNovel && media.chapters && media.chapters.length > 0 && (
            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">章节列表</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {media.chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/reader/${media.id}/${chapter.number}`}
                    className="px-4 py-3 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg transition-colors text-sm md:text-base text-center"
                    onClick={(e) => {
                      console.log('=== 章节点击调试 ===');
                      console.log('点击的章节:', chapter.title);
                      console.log('章节 ID:', chapter.id);
                      console.log('章节号:', chapter.number);
                      console.log('小说 ID:', media.id);
                      console.log('目标 URL:', `/reader/${media.id}/${chapter.number}`);
                      console.log('当前 URL:', window.location.href);
                    }}
                  >
                    {chapter.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm md:text-base">多媒体内容平台 - 发现更多精彩内容</p>
        </div>
      </footer>
    </div>
  );
}
