import { pgTable, serial, text, real, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 媒体内容表
export const mediaContents = pgTable('media_contents', {
  id: serial('id').primaryKey(),
  // 基本信息
  title: text('title').notNull(),
  type: text('type').notNull(), // 小说、动漫、电视剧、综艺、短剧
  country: text('country').notNull(),
  year: text('year').notNull(),
  rating: real('rating'),
  
  // 图片和描述
  image: text('image'),
  description: text('description'),
  
  // 分类和标签
  genre: jsonb('genre').notNull().$type<string[]>(),
  tags: jsonb('tags').notNull().$type<string[]>(),
  status: text('status'), // 完结、连载中
  
  // 外部链接
  externalUrl: text('external_url'),
  externalId: text('external_id'),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 爬虫任务表
export const crawlerTasks = pgTable('crawler_tasks', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 小说、动漫、电视剧、综艺、短剧
  status: text('status').notNull(), // pending、running、completed、failed
  source: text('source').notNull(), // tmdb、web_spider 等
  
  // 任务详情
  totalCount: serial('total_count'),
  successCount: serial('success_count'),
  failCount: serial('fail_count'),
  errorMessage: text('error_message'),
  
  // 时间戳
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
