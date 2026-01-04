import { MediaContent, UserData, WatchHistory } from '@/types/media';

export const mockMediaData: MediaContent[] = [
  // 小说
  {
    id: '1',
    title: '三体',
    type: '小说',
    country: '中国',
    year: 2008,
    rating: 9.3,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop',
    description: '一部科幻小说巨作，讲述了人类与三体文明的首次接触',
    genre: ['科幻'],
    tags: ['获奖作品', '经典', '烧脑'],
    status: '完结'
  },
  {
    id: '2',
    title: '哈利波特',
    type: '小说',
    country: '英国',
    year: 1997,
    rating: 9.1,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    description: '魔法世界的冒险故事，小巫师哈利波特的成长历程',
    genre: ['奇幻'],
    tags: ['经典', '获奖作品', '完结'],
    status: '完结'
  },
  {
    id: '3',
    title: '诡秘之主',
    type: '小说',
    country: '中国',
    year: 2018,
    rating: 9.0,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    description: '维多利亚时代的奇幻冒险，充满神秘与克苏鲁元素',
    genre: ['奇幻', '悬疑'],
    tags: ['热门', '完结', '经典'],
    status: '完结'
  },
  
  // 动漫
  {
    id: '4',
    title: '进击的巨人',
    type: '动漫',
    country: '日本',
    year: 2013,
    rating: 9.2,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
    description: '人类在巨人威胁下的生存抗争，充满震撼与反转',
    genre: ['热血', '悬疑'],
    tags: ['霸权', '经典', '完结'],
    status: '完结'
  },
  {
    id: '5',
    title: '鬼灭之刃',
    type: '动漫',
    country: '日本',
    year: 2019,
    rating: 8.9,
    image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&h=600&fit=crop',
    description: '炭治郎为救妹妹踏上斩鬼之路',
    genre: ['热血', '冒险'],
    tags: ['霸权', '季番', '经典'],
    status: '完结'
  },
  {
    id: '6',
    title: '一拳超人',
    type: '动漫',
    country: '日本',
    year: 2015,
    rating: 8.8,
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=600&fit=crop',
    description: '最强英雄埼玉的轻松日常',
    genre: ['热血', '喜剧'],
    tags: ['经典', '年番', '完结'],
    status: '完结'
  },
  
  // 电视剧
  {
    id: '7',
    title: '权力的游戏',
    type: '电视剧',
    country: '美国',
    year: 2011,
    rating: 9.0,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    description: '七大王国的权力争斗与冰火之歌',
    genre: ['科幻', '历史'],
    tags: ['热门', '史诗', '经典'],
    status: '完结'
  },
  {
    id: '8',
    title: '黑镜',
    type: '电视剧',
    country: '英国',
    year: 2011,
    rating: 9.1,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    description: '科技对人性的深度探讨，每个故事独立',
    genre: ['悬疑', '科幻'],
    tags: ['经典', '现实主义', '高分'],
    status: '完结'
  },
  {
    id: '9',
    title: '琅琊榜',
    type: '电视剧',
    country: '中国',
    year: 2015,
    rating: 9.4,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    description: '梅长苏为父昭雪，权谋复仇的精彩故事',
    genre: ['古装', '悬疑'],
    tags: ['经典', '高分', '热门'],
    status: '完结'
  },
  {
    id: '10',
    title: '狂飙',
    type: '电视剧',
    country: '中国',
    year: 2023,
    rating: 8.9,
    image: 'https://images.unsplash.com/photo-1559583109-3e7968136c99?w=400&h=600&fit=crop',
    description: '跨越20年的扫黑除恶斗争故事',
    genre: ['悬疑', '都市'],
    tags: ['热门', '现实主义', '高分'],
    status: '完结'
  },
  
  // 综艺
  {
    id: '11',
    title: '奔跑吧兄弟',
    type: '综艺',
    country: '中国',
    year: 2014,
    rating: 7.8,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=600&fit=crop',
    description: '嘉宾团队协作完成任务的户外真人秀',
    genre: ['户外', '真人秀'],
    tags: ['国民综艺', '热门', '经典'],
    status: '完结'
  },
  {
    id: '12',
    title: '拜托了冰箱',
    type: '综艺',
    country: '中国',
    year: 2015,
    rating: 8.0,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&h=600&fit=crop',
    description: '明星与厨师合作烹饪的美食节目',
    genre: ['美食', '访谈'],
    tags: ['创新', '热播', '完结'],
    status: '完结'
  },
  {
    id: '13',
    title: '我是歌手',
    type: '综艺',
    country: '中国',
    year: 2013,
    rating: 8.5,
    image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=600&fit=crop',
    description: '实力歌手现场竞技的音乐节目',
    genre: ['音乐', '竞技'],
    tags: ['国民综艺', '经典', '完结'],
    status: '完结'
  },

  // 短剧
  {
    id: '14',
    title: '总裁的替身新娘',
    type: '短剧',
    country: '中国',
    year: 2023,
    rating: 8.2,
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    description: '富家总裁与替身新娘的浪漫故事，甜宠虐恋并存',
    genre: ['甜宠', '总裁'],
    tags: ['爆款', '完结', 'VIP'],
    status: '完结'
  },
  {
    id: '15',
    title: '重生之复仇女王',
    type: '短剧',
    country: '中国',
    year: 2024,
    rating: 8.5,
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop',
    description: '前世被陷害致死，重生后开启复仇之路',
    genre: ['重生', '复仇'],
    tags: ['爆款', '新番', 'VIP'],
    status: '连载中'
  },
  {
    id: '16',
    title: '穿越古代当皇后',
    type: '短剧',
    country: '中国',
    year: 2023,
    rating: 7.9,
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    description: '现代女孩意外穿越到古代成为皇后',
    genre: ['穿越', '古风'],
    tags: ['热门', '完结', 'VIP'],
    status: '完结'
  },
  {
    id: '17',
    title: '豪门千金归来',
    type: '短剧',
    country: '中国',
    year: 2024,
    rating: 8.3,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=600&fit=crop',
    description: '被抛弃的豪门千金华丽归来，惊艳全场',
    genre: ['总裁', '复仇'],
    tags: ['爆款', '连载', 'VIP'],
    status: '连载中'
  },
  {
    id: '18',
    title: '校园甜心',
    type: '短剧',
    country: '中国',
    year: 2023,
    rating: 7.8,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop',
    description: '高中校园的纯爱故事，甜到掉牙',
    genre: ['甜宠', '校园'],
    tags: ['热门', '完结', 'VIP'],
    status: '完结'
  },
];

export const countries = ['全部', '中国', '日本', '美国', '英国', '韩国'];
export const years = ['全部', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007'];

// 小说分类
export const novelGenres = ['全部', '科幻', '奇幻', '悬疑', '玄幻', '武侠', '言情', '都市', '历史', '军事'];
export const novelTags = ['全部', '获奖作品', '经典', '烧脑', '热门', '新作', '完结', '连载中'];

// 动漫分类
export const animeGenres = ['全部', '热血', '恋爱', '悬疑', '奇幻', '冒险', '校园', '运动', '机甲', '治愈'];
export const animeTags = ['全部', '霸权', '黑马', '新番', '经典', '神作', '季番', '年番'];

// 电视剧分类
export const tvGenres = ['全部', '古装', '都市', '悬疑', '科幻', '历史', '喜剧', '战争', '家庭', '职业'];
export const tvTags = ['全部', '热门', '经典', '现实主义', '史诗', '获奖', '高分', '新作'];

// 综艺分类
export const varietyGenres = ['全部', '户外', '室内', '音乐', '美食', '真人秀', '竞技', '访谈', '选秀', '旅游'];
export const varietyTags = ['全部', '热门', '经典', '国民综艺', '创新', '怀旧', '热播', '完结'];

// 短剧分类
export const shortDramaGenres = ['全部', '甜宠', '虐恋', '重生', '穿越', '总裁', '复仇', '悬疑', '校园', '古风', '现代'];
export const shortDramaTags = ['全部', '爆款', '新番', '完结', '连载', '经典', '热门', 'VIP'];

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
  favorites: ['1', '4', '7', '11', '14', '15'], // 收藏的媒体ID
  watchHistory: [
    { mediaId: '1', watchTime: new Date('2024-01-15T10:30:00').toISOString(), progress: 85 },
    { mediaId: '4', watchTime: new Date('2024-01-14T20:15:00').toISOString(), progress: 100 },
    { mediaId: '5', watchTime: new Date('2024-01-13T15:45:00').toISOString(), progress: 45 },
    { mediaId: '7', watchTime: new Date('2024-01-12T18:20:00').toISOString(), progress: 100 },
    { mediaId: '9', watchTime: new Date('2024-01-11T21:00:00').toISOString(), progress: 60 },
    { mediaId: '11', watchTime: new Date('2024-01-10T14:30:00').toISOString(), progress: 100 },
    { mediaId: '14', watchTime: new Date('2024-01-09T16:00:00').toISOString(), progress: 70 },
    { mediaId: '15', watchTime: new Date('2024-01-08T19:30:00').toISOString(), progress: 30 },
  ],
  bookmarks: [
    { mediaId: '1', chapter: 10, note: '三体问题首次提出', createTime: new Date('2024-01-10T14:30:00').toISOString() },
    { mediaId: '4', timestamp: 1234, note: '艾伦觉醒', createTime: new Date('2024-01-12T16:20:00').toISOString() }
  ]
};
