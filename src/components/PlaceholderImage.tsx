'use client';

import { MediaContent } from '@/types/media';

interface PlaceholderImageProps {
  media: MediaContent;
  className?: string;
}

export default function PlaceholderImage({ media, className = '' }: PlaceholderImageProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case '小说':
        return '#3B82F6';      // 蓝色
      case '动漫':
        return '#EC4899';      // 粉色
      case '电视剧':
        return '#8B5CF6';      // 紫色
      case '综艺':
        return '#10B981';      // 绿色
      case '短剧':
        return '#F59E0B';      // 橙色
      default:
        return '#6B7280';      // 灰色
    }
  };

  const color = getTypeColor(media.type);

  return (
    <div
      className={className}
      style={{
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="text-center text-white p-4">
        <div className="text-4xl font-bold mb-2 opacity-80">{media.type}</div>
        <div className="text-xl font-medium">{media.title}</div>
        <div className="text-sm mt-2 opacity-70">{media.year}</div>
      </div>
    </div>
  );
}
