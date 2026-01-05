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
    status: '完结',
    chapters: [
      {
        id: '1-1',
        title: '第一章 科学边界',
        number: 1,
        content: `科学边界事件\n\n那是一个阳光明媚的下午，汪淼坐在北京的家中，看着窗外熙熙攘攘的街道。作为一名纳米材料科学家，他最近一直在为一项重要研究而忙碌。这时，手机响了，是他的同事史强打来的。\n\n"汪淼，有个奇怪的事情要告诉你，"史强的声音听起来很严肃，"最近科学界出现了一些不寻常的死亡事件。"\n\n"死亡事件？"汪淼皱起眉头，"什么意思？"\n\n"一些顶尖科学家，在毫无征兆的情况下选择了自杀。更诡异的是，他们都在死前接触过一个叫'科学边界'的组织。"\n\n汪淼的心中升起一股寒意。他听说过"科学边界"这个组织，据说是由一些前沿科学家组成的，探讨科学的最前沿问题。但他从未想过，这个组织会与自杀事件有关。\n\n"我需要你帮个忙，"史强说，"去参加一个科学边界的会议，看看能不能发现什么线索。"\n\n汪淼沉默了片刻，然后说："好的，我会去。"\n\n他知道，这可能是揭开科学家死亡之谜的关键。`
      },
      {
        id: '1-2',
        title: '第二章 射手与农场主',
        number: 2,
        content: `射手与农场主假说\n\n汪淼来到了科学边界的会议现场。这是一座古老的建筑，隐藏在北京的一条深巷中。推开沉重的木门，他走进了一个昏暗的大厅。\n\n大厅里坐满了人，他们都是来自各个领域的顶尖科学家。主持人是一个白发苍苍的老者，他的声音低沉而有力。\n\n"欢迎大家，"他说，"今天我们要讨论的是，科学是否已经到达了边界。"\n\n汪淼坐在角落里，静静地听着。一个个科学家上台发言，他们谈论着自己的研究，谈论着科学面临的困境。有人质疑现有的理论框架，有人暗示科学已经无法解释某些现象。\n\n然后，一个名叫丁仪的物理学家站了起来。他的眼睛里闪烁着一种奇异的光芒。\n\n"我想讲一个故事，"丁仪说，"射手和农场主的故事。"\n\n大厅里安静了下来。\n\n"一个神枪手，在一个靶子上每隔十厘米打一个洞。靶子上有一种智慧生物，它们发现这些洞之间的距离都是十厘米，于是它们总结出了一个物理学定律：每隔十厘米必定有一个洞。它们认为这是宇宙的基本规律。"\n\n"后来，这个射手改变了射击的距离，每隔五厘米打一个洞。那些生物的世界观彻底崩塌了，因为它们引以为傲的物理定律失效了。"\n\n"还有一个农场主，每天上午十一点给火鸡喂食。火鸡们观察了一年，发现每天十一点都有食物到来，于是它们总结出了一个定律：每天十一点，食物就会降临。它们建立了精密的数学模型来描述这个规律。"\n\n"直到感恩节那天，农场主带来的不是食物，而是屠刀。"`
      },
      {
        id: '1-3',
        title: '第三章 台球',
        number: 3,
        content: `物理规律的崩塌\n\n会议结束后，汪淼找到了丁仪。这位年轻的物理学家坐在一张旧沙发上，手中把玩着一颗台球。\n\n"你的故事很有趣，"汪淼说，"但我不明白你想表达什么。"\n\n"我想说的是，我们的物理学可能只是那些'火鸡'的物理学，"丁仪说，"我们观察到的宇宙规律，可能只是更高维度文明为我们设置的'喂食时间'。"\n\n汪淼沉默了。这个想法太荒谬了，但又无法反驳。\n\n"你还记得宇宙微波背景辐射吗？"丁仪问。\n\n"记得，大爆炸的余晖。"\n\n"最近，我们发现了宇宙微波背景辐射上的一个闪烁模式，它像是一种倒计时。每当这个倒计时结束时，就会有科学家死亡。"\n\n汪淼的寒毛直竖。\n\n"这个倒计时是什么意思？"\n\n"我不知道，"丁仪说，"但我知道，我们的物理学正在崩塌。就像那些火鸡一样，我们引以为傲的科学定律，可能只是更高智慧存在为我们制造的幻觉。"`
      },
      {
        id: '1-4',
        title: '第四章 三体游戏',
        number: 4,
        content: `虚拟中的真实\n\n汪淼回到家，发现桌上放着一个奇怪的装置。那是一个VR眼镜，旁边有一张纸条：'戴上它，你会看到真相。'\n\n他戴上了VR眼镜，眼前出现了一个奇异的世界。天空中有三个太阳，它们时而聚拢，时而散开。大地被炙烤，生命在绝望中挣扎。\n\n这是"三体世界"。汪淼了解到，这是一个拥有三个太阳的行星系。由于三个太阳的无序运动，这个星球的文明经历了无数次的毁灭与重生。\n\n他看到"三体人"创造了一个巨大的电脑，用来计算三个太阳的运动规律。但计算结果令人绝望：三个太阳的运动是混沌的，无法预测。这意味着三体文明注定要不断面对毁灭。\n\n汪淼摘下VR眼镜，心中充满了震撼。他开始明白，地球可能也面临着某种威胁。而那些科学家的自杀，可能只是这个威胁的前兆。`
      },
      {
        id: '1-5',
        title: '第五章 乱纪元',
        number: 5,
        content: `文明轮回\n\n在三体游戏中，汪淼经历了数十次文明的兴衰。他看到三体人在乱纪元中休眠，在恒纪元中发展；他看到他们一次次创造文明，又一次次看着它毁灭。\n\n最可怕的是，汪淼发现，三体人已经发现了地球的存在。而在他们眼中，地球是一个天堂——一个拥有稳定太阳、能够持续发展文明的乐土。\n\n"我们要入侵地球，"游戏中一个三体人说，"这是唯一的选择。"\n\n汪淼摘下VR眼镜，冷汗浸湿了后背。他终于明白了科学家的自杀：他们知道了这个威胁，却无法承受这个真相。`
      }
    ]
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
