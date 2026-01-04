'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockMediaData, countries, years, getGenresByType, getTagsByType } from '@/data/mockData';
import { MediaType, FilterOptions } from '@/types/media';
import MediaCard from '@/components/MediaCard';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const [selectedType, setSelectedType] = useState<MediaType | '全部'>('全部');
  const [selectedCountry, setSelectedCountry] = useState<string>('全部');
  const [selectedYear, setSelectedYear] = useState<string>('全部');
  const [selectedGenre, setSelectedGenre] = useState<string>('全部');
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 根据选择的类型获取对应的分类和标签
  const currentGenres = selectedType === '全部' ? ['全部'] : getGenresByType(selectedType);
  const currentTags = selectedType === '全部' ? ['全部'] : getTagsByType(selectedType);

  const filteredData = useMemo(() => {
    return mockMediaData.filter(item => {
      const matchType = selectedType === '全部' || item.type === selectedType;
      const matchCountry = selectedCountry === '全部' || item.country === selectedCountry;
      const matchYear = selectedYear === '全部' || item.year.toString() === selectedYear;
      const matchGenre = selectedGenre === '全部' || item.genre.includes(selectedGenre);
      const matchTag = selectedTag === '全部' || item.tags.includes(selectedTag);
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchType && matchCountry && matchYear && matchGenre && matchTag && matchSearch;
    });
  }, [selectedType, selectedCountry, selectedYear, selectedGenre, selectedTag, searchQuery]);

  const mediaTypes: (MediaType | '全部')[] = ['全部', '小说', '动漫', '电视剧', '综艺', '短剧'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">多媒体内容平台</h1>
              <p className="text-purple-100">发现小说、动漫、电视剧、综艺、短剧</p>
            </div>
            <Link
              href="/profile"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              个人中心
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索标题、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* 类型切换 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
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

        {/* 筛选栏 - 只在选择具体类型时显示 */}
        {selectedType !== '全部' && (
          <FilterBar
            countries={countries}
            years={years}
            genres={currentGenres}
            tags={currentTags}
            selectedCountry={selectedCountry}
            selectedYear={selectedYear}
            selectedGenre={selectedGenre}
            selectedTag={selectedTag}
            onCountryChange={setSelectedCountry}
            onYearChange={setSelectedYear}
            onGenreChange={setSelectedGenre}
            onTagChange={setSelectedTag}
          />
        )}

        {/* 结果统计 */}
        <div className="mb-6 text-gray-600">
          <span className="font-semibold">共 {filteredData.length} 部作品</span>
          {selectedType !== '全部' && <span className="ml-2">· {selectedType}</span>}
          {selectedCountry !== '全部' && <span className="ml-2">· {selectedCountry}</span>}
          {selectedYear !== '全部' && <span className="ml-2">· {selectedYear}</span>}
          {selectedGenre !== '全部' && <span className="ml-2">· {selectedGenre}</span>}
          {selectedTag !== '全部' && <span className="ml-2">· {selectedTag}</span>}
        </div>

        {/* 内容展示 */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredData.map(item => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">没有找到匹配的内容</p>
            <p className="text-gray-400 mt-2">请尝试调整筛选条件</p>
          </div>
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
