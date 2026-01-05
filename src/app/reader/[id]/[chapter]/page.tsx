'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockMediaData } from '@/data/mockData';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Settings, X } from 'lucide-react';
import { MediaContent } from '@/types/media';

export default function ReaderPage({ params }: { params: Promise<{ id: string; chapter: string }> }) {
  const resolvedParams = use(params);
  const { id, chapter } = resolvedParams;

  // 阅读设置
  const [fontSize, setFontSize] = useState(18);
  const [brightness, setBrightness] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'warm' | 'dark' | 'green'>('white');
  const [showSettings, setShowSettings] = useState(false);
  const [novel, setNovel] = useState<MediaContent | null>(null);
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载设置
  useEffect(() => {
    setMounted(true);
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

  // 从 localStorage 加载小说数据
  useEffect(() => {
    console.log('=== 阅读器页面调试 ===');
    console.log('查找的小说 ID:', id);
    console.log('查找的章节:', chapter);

    try {
      const realDataSaved = localStorage.getItem('realMediaData');
      const realData = realDataSaved ? JSON.parse(realDataSaved) : [];

      console.log('localStorage 中的数据数量:', realData.length);
      console.log('localStorage 中的小说:', realData.filter((item: MediaContent) => item.type === '小说').map((item: MediaContent) => ({ id: item.id, title: item.title, hasChapters: !!(item.chapters && item.chapters.length > 0) })));

      // 先从真实数据中查找
      const foundInReal = realData.find((item: MediaContent) => item.id === id);
      console.log('在真实数据中找到的小说:', foundInReal);

      if (foundInReal) {
        // 如果是小说但没有章节，尝试从 mockData 复制章节
        if (foundInReal.type === '小说' && (!foundInReal.chapters || foundInReal.chapters.length === 0)) {
          console.log('小说没有章节，尝试从 mockData 继承');
          // 精确匹配
          let mockNovel = mockMediaData.find(m => m.title === foundInReal.title && m.type === '小说');

          // 如果精确匹配失败，尝试模糊匹配（标题包含关系）
          if (!mockNovel) {
            mockNovel = mockMediaData.find(m =>
              m.type === '小说' &&
              (m.title.includes(foundInReal.title) || foundInReal.title.includes(m.title))
            );
          }

          console.log('匹配到的 mockNovel:', mockNovel?.title);

          if (mockNovel && mockNovel.chapters) {
            const novelWithChapters = {
              ...foundInReal,
              chapters: mockNovel.chapters
            };
            console.log('设置的小说（带章节）:', novelWithChapters.title, novelWithChapters.chapters?.length, '章');
            setNovel(novelWithChapters);
            return;
          }
        }
        console.log('设置的小说（自带章节）:', foundInReal.title, foundInReal.chapters?.length, '章');
        setNovel(foundInReal);
        return;
      }

      // 再从 mockData 中查找
      console.log('在 mockData 中查找...');
      const foundInMock = mockMediaData.find(item => item.id === id);
      console.log('在 mockData 中找到的小说:', foundInMock);

      if (foundInMock) {
        setNovel(foundInMock);
        return;
      }

      // 都没找到
      console.log('未找到小说数据');
      setNovel(null);
    } catch (error) {
      console.error('Failed to load novel data:', error);
      // 降级到只从 mockData 查找
      const foundInMock = mockMediaData.find(item => item.id === id);
      setNovel(foundInMock || null);
    }
  }, [id]);

  // 查找章节
  const currentChapterNumber = parseInt(chapter);
  console.log('解析的章节号:', currentChapterNumber, '原始值:', chapter);

  const currentChapter = novel?.chapters?.find(ch => ch.number === currentChapterNumber);
  const totalChapters = novel?.chapters?.length || 0;

  console.log('当前章节:', currentChapter);
  console.log('总章节数:', totalChapters);

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

  if (!mounted) {
    // 首次渲染时显示加载状态
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">内容不存在</h1>
          <p className="text-gray-600 mb-2">该小说可能已被删除或数据未正确加载</p>
          <p className="text-gray-500 text-sm mb-4">小说 ID: {id} | 章节: {chapter}</p>
          <Link href={`/detail/${id}`} className="text-purple-600 hover:text-purple-800 mr-4">
            返回详情页
          </Link>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">章节不存在</h1>
          <p className="text-gray-600 mb-2">该章节可能不存在或小说暂无章节内容</p>
          <p className="text-gray-500 text-sm mb-4">
            小说: {novel.title} | 章节号: {currentChapterNumber} | 总章数: {totalChapters}
          </p>
          <Link href={`/detail/${id}`} className="text-purple-600 hover:text-purple-800 mr-4">
            返回详情页
          </Link>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const prevChapter = currentChapterNumber > 1 ? currentChapterNumber - 1 : null;
  const nextChapter = currentChapterNumber < totalChapters ? currentChapterNumber + 1 : null;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ filter: `brightness(${brightness}%)` }}>
      {/* 页面标识 - 用于确认是否正确跳转到阅读器页面 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-purple-600 z-[100]"></div>

      {/* 顶部导航 */}
      <header className={`sticky top-0 z-40 ${backgroundConfig.bg} border-b border-gray-200 shadow-sm`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/detail/${id}`}
              className={`flex items-center ${backgroundConfig.text} hover:opacity-70 transition-opacity`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-1">返回</span>
            </Link>

            <h1 className={`text-base md:text-lg font-semibold ${backgroundConfig.text} truncate px-4`}>
              {currentChapter.title}
            </h1>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${backgroundConfig.text}`}
            >
              {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-x-0 top-0 z-50 pt-16 pb-4 px-4 bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto max-w-4xl space-y-4">
            {/* 字体大小 */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium w-16">字体大小</span>
              <input
                type="range"
                min="14"
                max="28"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{fontSize}px</span>
            </div>

            {/* 亮度 */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium w-16">亮度</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{brightness}%</span>
            </div>

            {/* 背景色 */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium w-16">背景色</span>
              <div className="flex gap-2 flex-1">
                {(['white', 'warm', 'dark', 'green'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                      backgroundColor === color
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundColor:
                        color === 'white'
                          ? '#ffffff'
                          : color === 'warm'
                          ? '#fffbeb'
                          : color === 'dark'
                          ? '#111827'
                          : '#f0fdf4',
                    }}
                  >
                    <span className={`text-xs font-medium ${
                      color === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      {backgroundConfig.name === color ? (
                        {
                          white: '白色',
                          warm: '护眼黄',
                          dark: '夜间',
                          green: '护眼绿'
                        }[color]
                      ) : (
                        {
                          white: '白色',
                          warm: '护眼黄',
                          dark: '夜间',
                          green: '护眼绿'
                        }[color]
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 预览文字 */}
            <div className="mt-4 p-4 rounded-lg" style={{
              backgroundColor:
                backgroundColor === 'white'
                  ? '#ffffff'
                  : backgroundColor === 'warm'
                  ? '#fffbeb'
                  : backgroundColor === 'dark'
                  ? '#111827'
                  : '#f0fdf4',
            }}>
              <p className={`leading-relaxed ${
                backgroundColor === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`} style={{ fontSize: `${fontSize}px` }}>
                这是预览文字效果。在这里可以看到当前的字体大小、背景颜色设置。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 阅读内容 */}
      <main className={`${backgroundConfig.bg} min-h-screen`}>
        <article className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
          <h2
            className={`text-xl md:text-2xl font-bold mb-6 ${backgroundConfig.text} text-center`}
          >
            {currentChapter.title}
          </h2>

          <div
            className={`leading-relaxed ${backgroundConfig.text} whitespace-pre-line`}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            {currentChapter.content}
          </div>

          {/* 章节导航 */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {prevChapter ? (
              <Link
                href={`/reader/${id}/${prevChapter}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">上一章</span>
              </Link>
            ) : (
              <div className="w-24"></div>
            )}

            <div className={`text-sm ${backgroundConfig.text}`}>
              {currentChapterNumber} / {totalChapters}
            </div>

            {nextChapter ? (
              <Link
                href={`/reader/${id}/${nextChapter}`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                <span className="text-sm">下一章</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="w-24"></div>
            )}
          </div>
        </article>
      </main>

      {/* 底部目录快捷入口 */}
      <footer className={`sticky bottom-0 ${backgroundConfig.bg} border-t border-gray-200 shadow-lg`}>
        <div className="container mx-auto px-4 py-3">
          <Link
            href={`/detail/${id}`}
            className={`block text-center ${backgroundConfig.text} hover:opacity-70 transition-opacity text-sm`}
          >
            目录
          </Link>
        </div>
      </footer>
    </div>
  );
}
