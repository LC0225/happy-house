'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { mockMediaData, countries, years, getGenresByType, getTagsByType } from '@/data/mockData';
import { MediaType, FilterOptions } from '@/types/media';
import MediaCard from '@/components/MediaCard';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const [selectedType, setSelectedType] = useState<MediaType | '全部'>('全部');

  // 实际生效的筛选条件
  const [appliedFilters, setAppliedFilters] = useState({
    country: '全部',
    year: '全部',
    genre: '全部',
    tag: '全部'
  });

  // 临时筛选条件（用户正在调整但未确认的）
  const [tempFilters, setTempFilters] = useState({
    country: '全部',
    year: '全部',
    genre: '全部',
    tag: '全部'
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [realData, setRealData] = useState<any[]>([]);

  // 从 localStorage 加载收藏状态和真实数据
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 只在客户端挂载后加载 localStorage
  useEffect(() => {
    setMounted(true);
    try {
      // 加载收藏
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }

      // 加载真实数据
      const realDataSaved = localStorage.getItem('realMediaData');
      if (realDataSaved) {
        setRealData(JSON.parse(realDataSaved));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, []);

  // 切换收藏并保存到 localStorage
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      // 只在客户端保存到 localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
        } catch (error) {
          console.error('Failed to save favorites to localStorage:', error);
        }
      }
      return newFavorites;
    });
  };

  // 根据选择的类型获取对应的分类和标签
  const currentGenres = selectedType === '全部' ? ['全部'] : getGenresByType(selectedType);
  const currentTags = selectedType === '全部' ? ['全部'] : getTagsByType(selectedType);

  // 当切换类型时，重置筛选条件
  const handleTypeChange = (type: MediaType | '全部') => {
    setSelectedType(type);
    setAppliedFilters({
      country: '全部',
      year: '全部',
      genre: '全部',
      tag: '全部'
    });
    setTempFilters({
      country: '全部',
      year: '全部',
      genre: '全部',
      tag: '全部'
    });
  };

  // 确认筛选
  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
  };

  // 重置筛选
  const handleResetFilters = () => {
    setTempFilters({
      country: '全部',
      year: '全部',
      genre: '全部',
      tag: '全部'
    });
    setAppliedFilters({
      country: '全部',
      year: '全部',
      genre: '全部',
      tag: '全部'
    });
  };

  const filteredData = useMemo(() => {
    const dataSource = useRealData ? realData : mockMediaData;
    return dataSource.filter(item => {
      // 首先匹配类型
      if (selectedType !== '全部' && item.type !== selectedType) return false;

      // 然后匹配筛选条件（只对当前类型生效）
      const matchCountry = appliedFilters.country === '全部' || item.country === appliedFilters.country;
      const matchYear = appliedFilters.year === '全部' || item.year.toString() === appliedFilters.year;
      const matchGenre = appliedFilters.genre === '全部' || item.genre.includes(appliedFilters.genre);
      const matchTag = appliedFilters.tag === '全部' || item.tags.includes(appliedFilters.tag);
      const matchSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCountry && matchYear && matchGenre && matchTag && matchSearch;
    });
  }, [selectedType, appliedFilters, searchQuery]);

  const mediaTypes: (MediaType | '全部')[] = ['全部', '小说', '动漫', '电视剧', '综艺', '短剧'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header
        className="text-white shadow-lg relative"
        style={{ backgroundColor: "#002FA7" }}
      >
        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">快乐屋</h1>
              <p className="text-purple-100">发现小说、动漫、电视剧、综艺、短剧</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/crawler"
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                爬虫管理
              </Link>
              <Link
                href="/profile"
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人中心
              </Link>
            </div>
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
          
          {/* 数据源切换 */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">数据源:</span>
            <button
              onClick={() => setUseRealData(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !useRealData
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              演示数据
            </button>
            <button
              onClick={() => setUseRealData(true)}
              disabled={realData.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                useRealData
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${realData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              真实数据 ({realData.length})
            </button>
            {realData.length === 0 && (
              <Link
                href="/crawler"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                前往爬虫管理页面获取数据
              </Link>
            )}
          </div>
        </div>

        {/* 类型切换 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <FilterBar
              countries={countries}
              years={years}
              genres={currentGenres}
              tags={currentTags}
              selectedCountry={tempFilters.country}
              selectedYear={tempFilters.year}
              selectedGenre={tempFilters.genre}
              selectedTag={tempFilters.tag}
              onCountryChange={(value) => setTempFilters({ ...tempFilters, country: value })}
              onYearChange={(value) => setTempFilters({ ...tempFilters, year: value })}
              onGenreChange={(value) => setTempFilters({ ...tempFilters, genre: value })}
              onTagChange={(value) => setTempFilters({ ...tempFilters, tag: value })}
            />

            {/* 操作按钮 */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleApplyFilters}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                确认筛选
              </button>
              <button
                onClick={handleResetFilters}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        )}

        {/* 结果统计 */}
        <div className="mb-6 text-gray-600">
          <span className="font-semibold">共 {filteredData.length} 部作品</span>
          {selectedType !== '全部' && <span className="ml-2">· {selectedType}</span>}
          {appliedFilters.country !== '全部' && <span className="ml-2">· {appliedFilters.country}</span>}
          {appliedFilters.year !== '全部' && <span className="ml-2">· {appliedFilters.year}年</span>}
          {appliedFilters.genre !== '全部' && <span className="ml-2">· {appliedFilters.genre}</span>}
          {appliedFilters.tag !== '全部' && <span className="ml-2">· {appliedFilters.tag}</span>}
        </div>

        {/* 内容展示 */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredData.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                isFavorite={favorites.has(item.id)}
                onFavoriteToggle={handleToggleFavorite}
              />
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
