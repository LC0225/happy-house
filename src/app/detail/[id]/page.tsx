'use client';

import { mockMediaData } from '@/data/mockData';
import { MediaContent } from '@/types/media';
import Link from 'next/link';
import { use } from 'react';

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const media = mockMediaData.find(item => item.id === resolvedParams.id);

  if (!media) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">内容不存在</h1>
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
              <img
                src={media.image}
                alt={media.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* 信息区域 */}
            <div className="md:w-2/3 p-8">
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
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{media.title}</h1>

              {/* 评分和年份 */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center text-yellow-500">
                  <span className="text-2xl font-bold mr-2">{media.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(media.rating / 2) ? 'fill-current' : 'fill-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-gray-600 text-lg">
                  {media.year}年 · {media.country}
                </div>
              </div>

              {/* 描述 */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">简介</h2>
                <p className="text-gray-600 leading-relaxed">{media.description}</p>
              </div>

              {/* 题材 */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">题材</h2>
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
                <h2 className="text-xl font-semibold text-gray-800 mb-2">标签</h2>
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
              <div className="flex gap-4">
                <Link
                  href={`/play/${media.id}`}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                >
                  {media.type === '小说' ? '立即阅读' : '立即观看'}
                </Link>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  加入收藏
                </button>
              </div>
            </div>
          </div>
        </div>
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
