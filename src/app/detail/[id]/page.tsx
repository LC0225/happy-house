'use client';

import { mockMediaData } from '@/data/mockData';
import { MediaContent } from '@/types/media';
import Link from 'next/link';
import { use, useState, useEffect, useMemo } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';
import { ChevronLeft, ChevronRight, Settings, X, BookOpen } from 'lucide-react';

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // 媒体数据状态
  const [media, setMedia] = useState<MediaContent | null>(null);
  const [mounted, setMounted] = useState(false);

  // 阅读器状态
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [brightness, setBrightness] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'warm' | 'dark' | 'green'>('white');
  const [showSettings, setShowSettings] = useState(false);

  // 从 localStorage 加载媒体数据
  useEffect(() => {
    setMounted(true);
    try {
      const realDataSaved = localStorage.getItem('realMediaData');
      const realData = realDataSaved ? JSON.parse(realDataSaved) : [];

      // 先从真实数据中查找
      const foundInReal = realData.find((item: MediaContent) => item.id === resolvedParams.id);

      if (foundInReal) {
        setMedia(foundInReal);
        return;
      }

      // 再从 mockData 中查找
      const foundInMock = mockMediaData.find(item => item.id === resolvedParams.id);

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

  // 从 localStorage 加载阅读设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('readerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFontSize(settings.fontSize || 18);
      setBrightness(settings.brightness || 100);
      setBackgroundColor(settings.backgroundColor || 'white');
    }
  }, []);

  // 保存设置到 localStorage
  useEffect(() => {
    const settings = { fontSize, brightness, backgroundColor };
    localStorage.setItem('readerSettings', JSON.stringify(settings));
  }, [fontSize, brightness, backgroundColor]);

  if (!mounted) {
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

  const chapters = mediaWithChapters.chapters || [];
  const currentChapterData = chapters.find(ch => ch.number === currentChapter);
  const totalChapters = chapters.length;

  // 背景色配置
  const backgroundConfig = useMemo(() => {
    const configs = {
      white: { bg: 'bg-white', text: 'text-gray-800', name: '白色' },
      warm: { bg: 'bg-amber-50', text: 'text-amber-900', name: '护眼黄' },
      dark: { bg: 'bg-gray-900', text: 'text-gray-100', name: '夜间' },
      green: { bg: 'bg-green-50', text: 'text-green-900', name: '护眼绿' },
    };
    return configs[backgroundColor];
  }, [backgroundColor]);

  // 打开阅读器
  const openReader = (chapterNumber: number) => {
    setCurrentChapter(chapterNumber);
    setShowReader(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 关闭阅读器
  const closeReader = () => {
    setShowReader(false);
    setCurrentChapter(null);
  };

  // 上一章
  const prevChapter = currentChapter && currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter && currentChapter < totalChapters ? currentChapter + 1 : null;

  // 详情页视图
  const DetailView = () => (
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
                {isNovel && chapters.length > 0 ? (
                  <button
                    onClick={() => openReader(1)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    开始阅读
                  </button>
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
          {isNovel && chapters.length > 0 && (
            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">章节列表</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => openReader(chapter.number)}
                    className="px-4 py-3 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg transition-colors text-sm md:text-base text-center cursor-pointer"
                  >
                    {chapter.title}
                  </button>
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

  // 阅读器视图
  const ReaderView = () => (
    <div className="min-h-screen transition-colors duration-300" style={{ filter: `brightness(${brightness}%)` }}>
      {/* 顶部导航 */}
      <header className={`sticky top-0 z-40 ${backgroundConfig.bg} border-b border-gray-200 shadow-sm`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={closeReader}
              className={`flex items-center ${backgroundConfig.text} hover:opacity-70 transition-opacity`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-1">返回详情</span>
            </button>

            <h1 className={`text-base md:text-lg font-semibold ${backgroundConfig.text} truncate px-4`}>
              {currentChapterData?.title || '章节加载中...'}
            </h1>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${backgroundConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 阅读设置面板 */}
      {showSettings && (
        <div className={`sticky top-16 z-30 ${backgroundConfig.bg} border-b border-gray-200 p-4 shadow-sm`}>
          <div className="container mx-auto">
            <h3 className={`font-semibold ${backgroundConfig.text} mb-3`}>阅读设置</h3>
            <div className="space-y-4">
              {/* 字体大小 */}
              <div>
                <label className={`text-sm ${backgroundConfig.text} mb-2 block`}>字体大小</label>
                <input
                  type="range"
                  min="14"
                  max="28"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className={`text-xs ${backgroundConfig.text} mt-1`}>当前: {fontSize}px</div>
              </div>

              {/* 亮度 */}
              <div>
                <label className={`text-sm ${backgroundConfig.text} mb-2 block`}>亮度</label>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
                <div className={`text-xs ${backgroundConfig.text} mt-1`}>当前: {brightness}%</div>
              </div>

              {/* 背景色 */}
              <div>
                <label className={`text-sm ${backgroundConfig.text} mb-2 block`}>背景色</label>
                <div className="flex gap-2">
                  {Object.entries({
                    white: '白色',
                    warm: '护眼黄',
                    dark: '夜间',
                    green: '护眼绿'
                  }).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => setBackgroundColor(key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        backgroundColor === key
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 章节内容 */}
      <main className={`container mx-auto px-4 py-8 ${backgroundConfig.bg}`}>
        <article className={`max-w-4xl mx-auto ${backgroundConfig.text} leading-relaxed`}>
          {currentChapterData ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{currentChapterData.title}</h2>
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: currentChapterData.content }}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">章节加载中...</p>
            </div>
          )}
        </article>
      </main>

      {/* 章节导航 */}
      {currentChapterData && (
        <footer className={`sticky bottom-0 z-40 ${backgroundConfig.bg} border-t border-gray-200 shadow-lg`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => prevChapter && openReader(prevChapter)}
                disabled={!prevChapter}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  prevChapter
                    ? `${backgroundConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                上一章
              </button>

              <span className={`text-sm ${backgroundConfig.text}`}>
                {currentChapter} / {totalChapters}
              </span>

              <button
                onClick={() => nextChapter && openReader(nextChapter)}
                disabled={!nextChapter}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  nextChapter
                    ? `${backgroundConfig.text} hover:bg-gray-200 dark:hover:bg-gray-700`
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                下一章
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );

  // 根据状态显示不同视图
  return showReader ? <ReaderView /> : <DetailView />;
}
