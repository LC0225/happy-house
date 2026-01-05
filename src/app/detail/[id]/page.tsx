'use client';

import { mockMediaData } from '@/data/mockData';
import { MediaContent } from '@/types/media';
import Link from 'next/link';
import { use, useState, useEffect, useMemo, useRef } from 'react';
import PlaceholderImage from '@/components/PlaceholderImage';
import { ChevronLeft, ChevronRight, Settings, X, BookOpen } from 'lucide-react';

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // 播放器状态
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('1');
  const [videoDuration, setVideoDuration] = useState(0);

  // 背景色配置（必须在提前 return 之前调用，以保持 Hooks 顺序一致）
  const backgroundConfig = useMemo(() => {
    const configs = {
      white: { bg: 'bg-white', text: 'text-gray-800', name: '白色' },
      warm: { bg: 'bg-amber-50', text: 'text-amber-900', name: '护眼黄' },
      dark: { bg: 'bg-gray-900', text: 'text-gray-100', name: '夜间' },
      green: { bg: 'bg-green-50', text: 'text-green-900', name: '护眼绿' },
    };
    return configs[backgroundColor];
  }, [backgroundColor]);

  // 获取实际的总集数（从 episodeUrls 中获取）
  const episodeKeys = media?.episodeUrls ? Object.keys(media.episodeUrls).map(Number).sort((a, b) => a - b) : [];
  const totalEpisodes = episodeKeys.length > 0 ? Math.max(...episodeKeys) : 0;

  // 生成区域选项
  const generateRegions = (total: number, regionSize: number) => {
    const regions = [];
    for (let i = 0; i < total; i += regionSize) {
      const start = i + 1;
      const end = Math.min(i + regionSize, total);
      regions.push({
        id: start.toString(),
        label: `${start}-${end}`,
        start,
        end
      });
    }
    return regions;
  };

  const episodeRegions = useMemo(() => generateRegions(totalEpisodes, 10), [totalEpisodes]);
  const speedOptions = [1, 1.25, 1.5, 2, 3];

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

  // 当 id 改变时重置播放器和阅读器状态
  useEffect(() => {
    return () => {
      // 退出全屏
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('退出全屏失败:', err);
        });
      }
      // 重置状态
      setShowReader(false);
      setShowPlayer(false);
      setCurrentChapter(null);
      setCurrentEpisode(1);
    };
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

  // 监听全屏状态变化（必须在提前 return 之前调用）
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // 组件卸载时退出全屏
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('退出全屏失败:', err);
        });
      }
    };
  }, []);

  // 改变播放速度（必须在提前 return 之前调用）
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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
      case '电影':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isNovel = media.type === '小说';
  const isMovie = media.type === '电影';

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

  // 打开阅读器
  const openReader = (chapterNumber: number) => {
    if (chapters.length === 0) {
      alert('暂无章节内容，请稍后再试');
      return;
    }
    setCurrentChapter(chapterNumber);
    setShowReader(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 关闭阅读器
  const closeReader = () => {
    setShowReader(false);
    setCurrentChapter(null);
  };

  // 打开播放器
  const openPlayer = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber);
    setCurrentTime(0);
    setShowPlayer(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 关闭播放器
  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentEpisode(1);
    setCurrentTime(0);
    // 停止视频播放
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // 获取当前集的视频URL
  const getVideoUrl = () => {
    if (!media) return '';

    // 如果是电影类型，使用 videoUrl
    if (media.type === '电影') {
      return media.videoUrl || '';
    }

    // 其他类型（电视剧、动漫等），使用 episodeUrls 中的对应集数
    if (media.episodeUrls && media.episodeUrls[currentEpisode]) {
      return media.episodeUrls[currentEpisode];
    }

    // 返回空字符串表示没有视频源
    return '';
  };

  // 处理视频时间更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 处理视频元数据加载完成
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    // 检查元素是否连接到 DOM
    if (!document.body.contains(videoContainerRef.current)) {
      console.warn('视频容器未连接到 DOM，无法切换全屏');
      return;
    }

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('全屏切换失败:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('退出全屏失败:', err);
      });
    }
  };

  // 上一章/集
  const prevChapter = currentChapter && currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter && currentChapter < totalChapters ? currentChapter + 1 : null;
  const prevEpisode = currentEpisode > 1 ? currentEpisode - 1 : null;
  const nextEpisode = currentEpisode < totalEpisodes ? currentEpisode + 1 : null;

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
                {isNovel ? (
                  <button
                    onClick={() => openReader(1)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    {chapters.length > 0 ? '开始阅读' : '暂无章节'}
                  </button>
                ) : (
                  <button
                    onClick={() => openPlayer(1)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    立即观看
                  </button>
                )}
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  加入收藏
                </button>
              </div>
            </div>
          </div>

          {/* 小说章节列表 */}
          {isNovel && (
            <div className="border-t border-gray-200 p-6 md:p-8">
              {chapters.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg mb-2">暂无章节内容</p>
                  <p className="text-gray-400 text-sm">该小说的章节正在完善中，请稍后再试</p>
                </div>
              )}
            </div>
          )}

          {/* 视频集数列表（电视剧、动漫、短剧、综艺显示集数，电影不显示） */}
          {!isNovel && !isMovie && totalEpisodes > 0 && episodeRegions.length > 0 && (
            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">集数列表</h2>
              <div className="mb-4">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {episodeRegions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <span className="ml-4 text-gray-600">共 {totalEpisodes} 集</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {(() => {
                  const region = episodeRegions.find(r => r.id === selectedRegion);
                  if (!region) return [];
                  return Array.from({ length: region.end - region.start + 1 }, (_, i) => region.start + i).map((episode) => (
                    <button
                      key={episode}
                      onClick={() => openPlayer(episode)}
                      className="px-3 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg transition-colors text-sm text-center cursor-pointer"
                    >
                      第{episode}集
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* 电影提示 */}
          {!isNovel && isMovie && (
            <div className="border-t border-gray-200 p-6 md:p-8 text-center">
              <p className="text-gray-600">这是一部完整的电影，点击"立即观看"即可开始播放</p>
            </div>
          )}

          {/* 没有集数数据的提示（电视剧、动漫等类型但没有集数数据） */}
          {!isNovel && !isMovie && totalEpisodes === 0 && (
            <div className="border-t border-gray-200 p-6 md:p-8 text-center">
              <p className="text-gray-600">该作品的集数数据正在完善中，请稍后再试</p>
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

  // 播放器视图
  const PlayerView = () => (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={closePlayer}
              className="text-purple-100 hover:text-white transition-colors flex items-center"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-1">返回详情</span>
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold truncate">{media.title}</h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-6">
        {/* 集数选择 - 区域划分 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">集数选择</label>
          <div className="flex items-center gap-4 mb-4">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {episodeRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
            <div className="text-gray-600 text-sm">
              共 {totalEpisodes} 集
            </div>
          </div>

          {/* 当前区域的集数列表 */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {(() => {
              const region = episodeRegions.find(r => r.id === selectedRegion);
              if (!region) return [];
              return Array.from({ length: region.end - region.start + 1 }, (_, i) => region.start + i).map((episode) => (
                <button
                  key={episode}
                  onClick={() => openPlayer(episode)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    currentEpisode === episode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  第{episode}集
                </button>
              ));
            })()}
          </div>
        </div>

        {/* 视频播放界面 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div ref={videoContainerRef} className="relative bg-black aspect-video">
            {/* 真实视频播放器 - 只在有视频源时渲染 */}
            {getVideoUrl() && (
              <video
                ref={videoRef}
                className="w-full h-full"
                autoPlay
                controls
                playsInline
                poster={media.image || '/images/placeholders/default.jpg'}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              >
                <source
                  src={getVideoUrl()}
                  type="video/mp4"
                />
                您的浏览器不支持视频播放。
              </video>
            )}

            {/* 如果没有视频源，显示提示 */}
            {!getVideoUrl() && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-white text-center max-w-md px-4">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-2xl font-semibold mb-2">{media.title}</p>
                  <p className="text-gray-400 mb-2">第 {currentEpisode} 集</p>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-200 text-sm">
                    <p className="font-semibold mb-1">⚠️ 暂无视频源</p>
                    <p className="opacity-90">
                      当前内容没有配置视频源。请联系管理员添加视频URL，或使用外部链接观看。
                    </p>
                    {media.externalUrl && (
                      <div className="mt-3">
                        <a
                          href={media.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                        >
                          外部观看链接
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 倍速选择按钮 */}
            <div className="absolute top-4 left-4">
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors cursor-pointer"
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-black/90 text-white rounded-lg overflow-hidden z-10">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full px-4 py-2 text-left hover:bg-black/70 transition-colors cursor-pointer ${
                          speed === playbackSpeed ? 'bg-purple-600' : ''
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 播放控制栏 - 移除，使用原生HTML5 video的controls */}
          </div>
        </div>

        {/* 集数切换 */}
        <div className="flex gap-4">
          <button
            onClick={() => prevEpisode && openPlayer(prevEpisode)}
            disabled={!prevEpisode}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
              prevEpisode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-700 cursor-not-allowed'
            }`}
          >
            上一集
          </button>
          <button
            onClick={() => nextEpisode && openPlayer(nextEpisode)}
            disabled={!nextEpisode}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
              nextEpisode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-700 cursor-not-allowed'
            }`}
          >
            下一集
          </button>
        </div>
      </main>
    </div>
  );

  // 根据状态显示不同视图
  return showPlayer ? <PlayerView /> : showReader ? <ReaderView /> : <DetailView />;
}
