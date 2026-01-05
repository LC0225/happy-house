export type MediaType = '小说' | '动漫' | '电视剧' | '综艺' | '短剧';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  number: number;
}

export interface MediaContent {
  id: string;
  title: string;
  type: MediaType;
  country: string;
  year: number;
  rating: number;
  image: string;
  description: string;
  genre: string[];
  tags: string[];
  status: '完结' | '连载中' | '更新中';
  externalUrl?: string; // 外部网站链接（可选）
  chapters?: Chapter[]; // 小说章节（仅小说类型）
}

export interface FilterOptions {
  type?: MediaType;
  country?: string;
  year?: number;
  genre?: string;
  status?: string;
}

export interface WatchHistory {
  mediaId: string;
  watchTime: string; // ISO timestamp
  progress: number; // 0-100, percentage watched
}

export interface Bookmark {
  mediaId: string;
  chapter?: number; // 章节号（针对小说）
  timestamp?: number; // 时间戳（针对视频）
  note?: string; // 备注
  createTime: string; // ISO timestamp
}

export interface UserData {
  favorites: string[]; // media IDs
  watchHistory: WatchHistory[];
  bookmarks: Bookmark[];
}
