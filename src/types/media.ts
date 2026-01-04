export type MediaType = '小说' | '动漫' | '电视剧' | '综艺' | '短剧';

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

export interface UserData {
  favorites: string[]; // media IDs
  watchHistory: WatchHistory[];
}
