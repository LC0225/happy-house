'use client';

import { MediaContent } from '@/types/media';
import Link from 'next/link';

interface MediaCardProps {
  media: MediaContent;
}

export default function MediaCard({ media }: MediaCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case '完结':
        return 'text-green-600 bg-green-100';
      case '连载中':
        return 'text-blue-600 bg-blue-100';
      case '更新中':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Link href={`/detail/${media.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
        {/* 图片区域 */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={media.image}
            alt={media.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* 类型标签 */}
          <div className={`absolute top-2 left-2 ${getTypeColor(media.type)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            {media.type}
          </div>
          {/* 状态标签 */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(media.status)}`}>
            {media.status}
          </div>
        </div>

        {/* 内容信息 */}
        <div className="p-4">
          {/* 标题 */}
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {media.title}
          </h3>

          {/* 评分和年份 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-yellow-500">
              <span className="font-bold mr-1">{media.rating}</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm">{media.year}</span>
          </div>

          {/* 国家 */}
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {media.country}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {media.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
