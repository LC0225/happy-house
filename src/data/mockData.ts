import { MediaContent, UserData, WatchHistory } from '@/types/media';

// 简化版数据，仅保留5个项目用于快速加载测试
export const mockMediaData: MediaContent[] = [
  // 小说
  {
    id: '1',
    title: '三体',
    type: '小说',
    country: '中国',
    year: 2008,
    rating: 9.3,
    image: '/images/placeholders/novel-1.jpg',
    description: '一部科幻小说巨作，讲述了人类与三体文明的首次接触',
    genre: ['科幻'],
    tags: ['获奖作品', '经典', '烧脑'],
    status: '完结'
  },

  // 动漫
  {
    id: '2',
    title: '进击的巨人',
    type: '动漫',
    country: '日本',
    year: 2013,
    rating: 9.2,
    image: '/images/placeholders/anime-1.jpg',
    description: '人类在巨人威胁下的生存抗争，充满震撼与反转',
    genre: ['热血', '悬疑'],
    tags: ['霸权', '经典', '完结'],
    status: '完结'
  },

  // 电视剧
  {
    id: '3',
    title: '权力的游戏',
    type: '电视剧',
    country: '美国',
    year: 2011,
    rating: 9.0,
    image: '/images/placeholders/tv-1.jpg',
    description: '七大王国的权力争斗与冰火之歌',
    genre: ['科幻', '历史'],
    tags: ['热门', '史诗', '经典'],
    status: '完结'
  },

  // 综艺
  {
    id: '4',
    title: '奔跑吧兄弟',
    type: '综艺',
    country: '中国',
    year: 2014,
    rating: 7.8,
    image: '/images/placeholders/variety-1.jpg',
    description: '嘉宾团队协作完成任务的户外真人秀',
    genre: ['户外', '真人秀'],
    tags: ['国民综艺', '热门', '经典'],
    status: '完结'
  },

  // 短剧
  {
    id: '5',
    title: '总裁的替身新娘',
    type: '短剧',
    country: '中国',
    year: 2023,
    rating: 8.2,
    image: '/images/placeholders/drama-1.jpg',
    description: '富家总裁与替身新娘的浪漫故事，甜宠虐恋并存',
    genre: ['甜宠', '总裁'],
    tags: ['爆款', '完结', 'VIP'],
    status: '完结'
  },
];

export const countries = ['全部', '中国', '日本', '美国'];
export const years = ['全部', '2024', '2023', '2020', '2015', '2013', '2011', '2008'];

// 小说分类
export const novelGenres = ['全部', '科幻', '奇幻', '悬疑'];
export const novelTags = ['全部', '获奖作品', '经典', '完结'];

// 动漫分类
export const animeGenres = ['全部', '热血', '悬疑'];
export const animeTags = ['全部', '经典', '完结'];

// 电视剧分类
export const tvGenres = ['全部', '科幻', '悬疑'];
export const tvTags = ['全部', '经典', '完结'];

// 综艺分类
export const varietyGenres = ['全部', '户外', '音乐'];
export const varietyTags = ['全部', '经典', '完结'];

// 短剧分类
export const shortDramaGenres = ['全部', '甜宠', '总裁'];
export const shortDramaTags = ['全部', '爆款', '完结', 'VIP'];

// 根据类型获取分类
export const getGenresByType = (type: string): string[] => {
  switch (type) {
    case '小说':
      return novelGenres;
    case '动漫':
      return animeGenres;
    case '电视剧':
      return tvGenres;
    case '综艺':
      return varietyGenres;
    case '短剧':
      return shortDramaGenres;
    default:
      return ['全部'];
  }
};

// 根据类型获取标签
export const getTagsByType = (type: string): string[] => {
  switch (type) {
    case '小说':
      return novelTags;
    case '动漫':
      return animeTags;
    case '电视剧':
      return tvTags;
    case '综艺':
      return varietyTags;
    case '短剧':
      return shortDramaTags;
    default:
      return ['全部'];
  }
};

// 用户数据（模拟）
export const mockUserData: UserData = {
  favorites: ['1', '2', '3', '4', '5'], // 收藏的媒体ID
  watchHistory: [
    { mediaId: '1', watchTime: new Date('2024-01-15T10:30:00').toISOString(), progress: 85 },
    { mediaId: '2', watchTime: new Date('2024-01-14T20:15:00').toISOString(), progress: 100 },
    { mediaId: '3', watchTime: new Date('2024-01-13T15:45:00').toISOString(), progress: 45 },
  ],
  bookmarks: [
    { mediaId: '1', chapter: 10, note: '三体问题首次提出', createTime: new Date('2024-01-10T14:30:00').toISOString() }
  ]
};
