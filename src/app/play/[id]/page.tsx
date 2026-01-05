'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { use } from 'react';
import { mockMediaData, mockUserData } from '@/data/mockData';
import { MediaContent, MediaType, WatchHistory, Bookmark } from '@/types/media';
import Link from 'next/link';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [media, setMedia] = useState<MediaContent | null>(null);
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载真实数据
  useEffect(() => {
    setMounted(true);
    try {
      const realDataSaved = localStorage.getItem('realMediaData');
      const realData = realDataSaved ? JSON.parse(realDataSaved) : [];

      console.log('=== 播放器页调试信息 ===');
      console.log('查找的 ID:', resolvedParams.id);
      console.log('localStorage 中的数据数量:', realData.length);

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

  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCasting, setIsCasting] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // 区域选择
  const [selectedRegion, setSelectedRegion] = useState('1');

  // 模拟集数数据
  const totalEpisodes = 30;

  // 模拟章节数据
  const totalChapters = 500;

  // 倍速选项
  const speedOptions = [1, 1.25, 1.5, 2, 3];

  // 使用ref存储最新值，避免useEffect频繁重新执行
  const currentChapterRef = useRef(currentChapter);
  const currentTimeRef = useRef(currentTime);
  const mediaRef = useRef(media);
  const totalChaptersRef = useRef(totalChapters);

  // 更新ref的值
  useEffect(() => {
    currentChapterRef.current = currentChapter;
    currentTimeRef.current = currentTime;
    mediaRef.current = media;
    totalChaptersRef.current = totalChapters;
  }, [currentChapter, currentTime, media, totalChapters]);

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

  const chapterRegions = useMemo(() => generateRegions(totalChapters, 100), [totalChapters]);
  const episodeRegions = useMemo(() => generateRegions(totalEpisodes, 10), [totalEpisodes]);

  // 自动保存进度（只在组件挂载时执行一次）
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const currentMedia = mediaRef.current;
      if (!currentMedia) return;

      // 自动保存进度
      const progress: WatchHistory = {
        mediaId: currentMedia.id,
        watchTime: new Date().toISOString(),
        progress: currentMedia.type === '小说' ? (currentChapterRef.current / totalChaptersRef.current) * 100 : (currentTimeRef.current / 3600) * 100
      };

      console.log('自动保存进度:', progress);
      // 在实际应用中，这里应该调用 API 保存到后端
    }, 5000); // 每5秒自动保存一次

    return () => clearInterval(saveInterval);
  }, []); // 空依赖数组，只在挂载时执行一次

  // 加载观看历史
  useEffect(() => {
    if (!media) return;

    const watchHistory = mockUserData.watchHistory.find(h => h.mediaId === media.id);
    if (watchHistory) {
      if (media.type === '小说') {
        // 小说：加载上次阅读的章节
        const mediaBookmark = mockUserData.bookmarks.find(b => b.mediaId === media.id);
        if (mediaBookmark && mediaBookmark.chapter) {
          setCurrentChapter(mediaBookmark.chapter);
          // 设置对应的区域
          const region = chapterRegions.find(r => mediaBookmark.chapter! >= r.start && mediaBookmark.chapter! <= r.end);
          if (region) setSelectedRegion(region.id);
        }
      } else {
        // 视频：加载上次播放时间
        setCurrentTime(watchHistory.progress * 36); // 假设视频总时长60分钟
        // 设置对应的区域
        const region = episodeRegions.find(r => currentEpisode >= r.start && currentEpisode <= r.end);
        if (region) setSelectedRegion(region.id);
      }
    }

    // 加载书签（仅小说）
    if (media.type === '小说') {
      const mediaBookmarks = mockUserData.bookmarks.filter(b => b.mediaId === media.id);
      setBookmarks(mediaBookmarks);
    }
  }, [media, currentEpisode, chapterRegions, episodeRegions]);

  // 添加书签（仅小说）
  const handleAddBookmark = () => {
    if (!media || media.type !== '小说') return;

    const newBookmark: Bookmark = {
      mediaId: media.id,
      chapter: currentChapter,
      note: bookmarkNote,
      createTime: new Date().toISOString()
    };

    setBookmarks([...bookmarks, newBookmark]);
    setBookmarkNote('');
    setShowBookmarkModal(false);

    // 在实际应用中，这里应该调用 API 保存到后端
    console.log('添加书签:', newBookmark);
  };

  // 跳转到书签（仅小说）
  const jumpToBookmark = (bookmark: Bookmark) => {
    if (bookmark.chapter) {
      setCurrentChapter(bookmark.chapter);
      // 更新对应的区域
      const region = chapterRegions.find(r => bookmark.chapter! >= r.start && bookmark.chapter! <= r.end);
      if (region) setSelectedRegion(region.id);
    }
  };

  // 投屏功能
  const handleCast = () => {
    if (typeof window !== 'undefined' && (window as any).presentation) {
      // 使用 Presentation API 投屏
      (window as any).presentation.defaultRequest?.start();
    } else {
      // 模拟投屏
      setIsCasting(true);
      setTimeout(() => setIsCasting(false), 3000);
      alert('投屏功能已启动（演示模式）');
    }
  };

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
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">内容不存在</h1>
          <p className="text-gray-600 mb-2">ID: {resolvedParams.id}</p>
          <p className="text-gray-600 mb-4">
            该作品可能已被删除或数据未正确加载。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="text-purple-600 hover:text-purple-800">
              返回首页
            </Link>
            <Link href="/debug" className="text-blue-600 hover:text-blue-800">
              查看调试页面
            </Link>
          </div>
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

  // 获取当前区域的章节/集数列表
  const getCurrentRegionList = () => {
    if (media.type === '小说') {
      const region = chapterRegions.find(r => r.id === selectedRegion);
      if (!region) return [];
      return Array.from({ length: region.end - region.start + 1 }, (_, i) => region.start + i);
    } else {
      const region = episodeRegions.find(r => r.id === selectedRegion);
      if (!region) return [];
      return Array.from({ length: region.end - region.start + 1 }, (_, i) => region.start + i);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/detail/${media.id}`} className="text-purple-100 hover:text-white transition-colors">
              ← 返回详情
            </Link>
            <div className="flex items-center gap-4">
              {media.type === '小说' && (
                <button
                  onClick={() => setShowBookmarkModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  添加书签
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* 标题和信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className={`${getTypeColor(media.type)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                {media.type}
              </span>
              <span className="text-gray-600 text-lg">
                {media.year}年 · {media.country}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{media.title}</h1>
          </div>

          {/* 章节/集数选择 - 区域划分 */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {media.type === '小说' ? '章节选择' : '集数选择'}
            </label>
            <div className="flex items-center gap-4 mb-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {media.type === '小说' ? (
                  chapterRegions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))
                ) : (
                  episodeRegions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))
                )}
              </select>
              <div className="text-gray-600 text-sm">
                共 {media.type === '小说' ? totalChapters : totalEpisodes} {media.type === '小说' ? '章' : '集'}
              </div>
            </div>

            {/* 当前区域的章节/集数列表 */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {getCurrentRegionList().map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (media.type === '小说') {
                      setCurrentChapter(item);
                    } else {
                      setCurrentEpisode(item);
                      setCurrentTime(0);
                    }
                  }}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    (media.type === '小说' && currentChapter === item) ||
                    (media.type !== '小说' && currentEpisode === item)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {media.type === '小说' ? `第${item}章` : `第${item}集`}
                </button>
              ))}
            </div>
          </div>

          {/* 播放/阅读区域 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            {media.type === '小说' ? (
              // 小说阅读界面
              <div className="p-8">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    第 {currentChapter} 章
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newChapter = Math.max(1, currentChapter - 1);
                        setCurrentChapter(newChapter);
                        const region = chapterRegions.find(r => newChapter >= r.start && newChapter <= r.end);
                        if (region) setSelectedRegion(region.id);
                      }}
                      disabled={currentChapter <= 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一章
                    </button>
                    <button
                      onClick={() => {
                        const newChapter = Math.min(totalChapters, currentChapter + 1);
                        setCurrentChapter(newChapter);
                        const region = chapterRegions.find(r => newChapter >= r.start && newChapter <= r.end);
                        if (region) setSelectedRegion(region.id);
                      }}
                      disabled={currentChapter >= totalChapters}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一章
                    </button>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    这是第 {currentChapter} 章的内容。在实际应用中，这里会显示小说的正文内容。
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    小说阅读界面支持章节切换、书签功能、阅读进度保存等功能。
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    当用户退出后再次打开时，会自动跳转到上次阅读的章节，实现断点续读。系统会每5秒自动保存一次阅读进度。
                  </p>
                </div>
              </div>
            ) : (
              // 视频播放界面
              <div className="relative bg-black aspect-video">
                {/* 模拟视频播放器 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center max-w-md px-4">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <p className="text-2xl font-semibold mb-2">{media.title}</p>
                    <p className="text-gray-400 mb-2">第 {currentEpisode} 集</p>
                    <p className="text-gray-500 text-sm mb-4">
                      当前播放时间: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                    </p>
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-200 text-sm">
                      <p className="font-semibold mb-1">⚠️ 演示模式</p>
                      <p className="opacity-90">
                        这是一个演示版本的视频播放器。在真实环境中，这里会集成真实的视频播放器（如 Video.js、DPlayer 等）和视频源。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 投屏按钮（视频播放界面） */}
                <button
                  onClick={handleCast}
                  className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isCasting
                      ? 'bg-green-500 text-white'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {isCasting ? '投屏中...' : '投屏'}
                </button>

                {/* 倍速选择按钮 */}
                <div className="absolute top-4 left-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
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
                            className={`block w-full px-4 py-2 text-left hover:bg-black/70 transition-colors ${
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

                {/* 播放控制栏 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <button className="text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex-1 bg-gray-600 h-2 rounded-full">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentTime / 3600) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">
                      {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 60:00
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 书签列表（仅小说显示） */}
          {media.type === '小说' && bookmarks.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                书签 ({bookmarks.length})
              </h3>
              <div className="space-y-3">
                {bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => jumpToBookmark(bookmark)}
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        第 {bookmark.chapter} 章
                      </div>
                      {bookmark.note && (
                        <div className="text-sm text-gray-600 mt-1">{bookmark.note}</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookmarks(bookmarks.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>

      {/* 添加书签弹窗（仅小说显示） */}
      {showBookmarkModal && media.type === '小说' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">添加书签</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注（可选）
              </label>
              <textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="给这个书签添加备注..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="mb-4 text-sm text-gray-600">
              当前位置: 第 {currentChapter} 章
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddBookmark}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowBookmarkModal(false);
                  setBookmarkNote('');
                }}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
