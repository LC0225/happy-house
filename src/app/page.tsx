'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { countries, years, getGenresByType, getTagsByType, mockMediaData } from '@/data/mockData';
import { MediaType, FilterOptions } from '@/types/media';
import MediaCard from '@/components/MediaCard';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();

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
  const [realData, setRealData] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [lastSearchKeyword, setLastSearchKeyword] = useState<string>('');

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

      // 加载首页状态
      const homeStateSaved = localStorage.getItem('homePageState');
      if (homeStateSaved) {
        const state = JSON.parse(homeStateSaved);
        setSelectedType(state.selectedType || '全部');
        setAppliedFilters(state.appliedFilters || {
          country: '全部',
          year: '全部',
          genre: '全部',
          tag: '全部'
        });
        setTempFilters(state.tempFilters || {
          country: '全部',
          year: '全部',
          genre: '全部',
          tag: '全部'
        });
        setSearchQuery(state.searchQuery || '');
        setIsSearching(state.isSearching || false);
        setSearchError(state.searchError || null);
        setSearchSource(state.searchSource || null);
        setLastSearchKeyword(state.lastSearchKeyword || '');
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, []);

  // 保存首页状态到 localStorage
  const saveHomePageState = () => {
    if (typeof window !== 'undefined') {
      try {
        const state = {
          selectedType,
          appliedFilters,
          tempFilters,
          searchQuery,
          isSearching,
          searchError,
          searchSource,
          lastSearchKeyword
        };
        localStorage.setItem('homePageState', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save home page state:', error);
      }
    }
  };

  // 监听状态变化并保存
  useEffect(() => {
    saveHomePageState();
  }, [selectedType, appliedFilters, tempFilters, searchQuery, isSearching, searchError, searchSource, lastSearchKeyword]);

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

  // 搜索并爬取数据
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const keyword = searchQuery.trim();
    if (!keyword) {
      setSearchError('请输入搜索关键词');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchSource(null);

    try {
      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          type: selectedType,
          count: 20,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // 更新搜索来源信息
        setSearchSource(data.summary?.source || 'unknown');
        setLastSearchKeyword(keyword);

        // 将搜索结果合并到现有数据中
        setRealData(prev => {
          const newData = [...prev];

          console.log('=== 搜索结果保存调试 ===');
          console.log('搜索返回的数据:', data.data);
          console.log('搜索返回的数据数量:', data.data.length);

          data.data.forEach((item: any) => {
            // 如果是小说且没有章节内容，尝试从 mockData 继承章节
            let itemWithChapters = item;
            if (item.type === '小说' && (!item.chapters || item.chapters.length === 0)) {
              // 精确匹配
              let mockNovel = mockMediaData.find(m =>
                m.title === item.title && m.type === '小说'
              );

              // 如果精确匹配失败，尝试模糊匹配（标题包含关系）
              if (!mockNovel) {
                mockNovel = mockMediaData.find(m =>
                  m.type === '小说' &&
                  (m.title.includes(item.title) || item.title.includes(m.title))
                );
              }

              if (mockNovel && mockNovel.chapters) {
                itemWithChapters = {
                  ...item,
                  chapters: mockNovel.chapters
                };
                console.log(`为 "${item.title}" 继承了 "${mockNovel.title}" 的章节`);
              }
            }

            console.log('准备保存的项:', itemWithChapters.id, itemWithChapters.title);

            // 检查是否已存在（根据 ID）
            const existingIndex = newData.findIndex(existing => existing.id === itemWithChapters.id);

            if (existingIndex >= 0) {
              // 如果 ID 已存在，更新数据
              newData[existingIndex] = itemWithChapters;
              console.log('更新现有项:', itemWithChapters.id);
            } else {
              // 如果 ID 不存在，添加新数据
              newData.push(itemWithChapters);
              console.log('添加新项:', itemWithChapters.id);
            }
          });

          console.log('保存后的总数据量:', newData.length);

          // 保存到 localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('realMediaData', JSON.stringify(newData));
              console.log('数据已保存到 localStorage');
            } catch (error) {
              console.error('Failed to save data to localStorage:', error);
            }
          }

          return newData;
        });

        // 自动切换到对应类型（如果搜索的是特定类型）
        if (selectedType !== '全部' && data.data.length > 0) {
          // 已在选中类型，无需切换
        } else if (data.data.length > 0) {
          // 根据搜索结果的类型自动切换
          const firstResultType = data.data[0].type;
          setSelectedType(firstResultType);
        }
      } else {
        setSearchError(data.error || data.message || '搜索失败，请重试');
      }
    } catch (error) {
      setSearchError('搜索失败，请检查网络连接');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
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
    // 只使用爬虫爬取的真实数据
    const dataSource = realData;
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
  }, [selectedType, appliedFilters, searchQuery, realData]);

  const mediaTypes: (MediaType | '全部')[] = ['全部', '小说', '动漫', '电视剧', '综艺', '短剧', '电影'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header
        className="text-white shadow-lg relative"
        style={{ backgroundColor: "#002FA7" }}
      >
        <div className="container mx-auto px-4 py-4 md:py-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">快乐屋</h1>
              <p className="text-purple-100 text-sm md:text-base">发现小说、动漫、电视剧、综艺、短剧、电影</p>
            </div>
            <Link
              href="/profile"
              className="px-4 md:px-6 py-2 md:py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm md:text-base justify-center sm:justify-start"
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
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="搜索作品名称（自动爬取相关内容）..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="flex-1 px-4 py-3 text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  搜索中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  搜索
                </>
              )}
            </button>
          </form>

          {/* 错误提示 */}
          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {searchError}
            </div>
          )}

          {/* 数据状态提示 */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">
              当前共有 <strong>{realData.length}</strong> 部作品
            </span>
            {searchSource && lastSearchKeyword && (
              <span className="text-sm text-gray-500 ml-2">
                （已搜索 "{lastSearchKeyword}"）
              </span>
            )}
            {realData.length === 0 && (
              <Link
                href="/profile"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                前往个人中心使用爬虫获取数据 →
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
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                确认筛选
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
            {realData.length === 0 ? (
              <>
                <p className="text-gray-500 text-xl mb-4">还没有数据</p>
                <p className="text-gray-400 mb-6">请先使用爬虫获取作品数据</p>
                <Link
                  href="/profile"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  前往个人中心获取数据
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-xl mb-4">没有找到匹配的内容</p>
                <p className="text-gray-400">请尝试调整筛选条件或搜索关键词</p>
              </>
            )}
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
