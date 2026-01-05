import { pgTable, serial, text, real, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * 媒体内容表
 *
 * 重要：只存储元数据和链接，不存储实际的视频和图片文件
 * - image: 封面图片的 URL 链接
 * - externalUrl: 外部网站链接（如豆瓣、IMDb）
 * - playUrl: 播放链接（可选）
 */
export const mediaContents = pgTable('media_contents', {
  id: serial('id').primaryKey(),

  // 基本信息
  title: text('title').notNull(),
  type: text('type').notNull(), // 小说、动漫、电视剧、综艺、短剧
  country: text('country').notNull(),
  year: text('year').notNull(),
  rating: real('rating'),

  // 图片和描述（只存链接）
  image: text('image'), // 封面图片 URL，不存储实际图片文件
  description: text('description'), // 简短描述，限制 500 字符

  // 分类和标签
  genre: jsonb('genre').notNull().$type<string[]>(),
  tags: jsonb('tags').notNull().$type<string[]>(),
  status: text('status'), // 完结、连载中

  // 外部链接（只存链接）
  externalUrl: text('external_url'), // 外部网站链接（豆瓣、IMDb、官方站点等）
  externalId: text('external_id'), // 外部平台的 ID
  playUrl: text('play_url'), // 播放链接（如果有）
  detailPage: text('detail_page'), // 详情页链接

  // 数据来源（支持多元化）
  dataSource: text('data_source').notNull(), // web_search, tmdb, douban, custom
  sourceMetadata: jsonb('source_metadata'), // 数据源的元数据（如评分来源、更新时间等）

  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * 数据源配置表
 *
 * 支持多元化的数据源配置
 */
export const dataSources = pgTable('data_sources', {
  id: serial('id').primaryKey(),

  // 数据源信息
  name: text('name').notNull(), // 数据源名称
  type: text('type').notNull(), // web_search, tmdb_api, douban_api, custom_url
  config: jsonb('config').notNull(), // 配置信息（API key、URL 等）

  // 状态
  enabled: text('enabled').notNull(), // true/false
  priority: serial('priority'), // 优先级，数字越小优先级越高

  // 统计
  successCount: serial('success_count'),
  failCount: serial('fail_count'),
  lastUsed: timestamp('last_used'),

  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * 爬虫任务表
 */
export const crawlerTasks = pgTable('crawler_tasks', {
  id: serial('id').primaryKey(),

  // 任务信息
  type: text('type').notNull(), // 小说、动漫、电视剧、综艺、短剧
  status: text('status').notNull(), // pending、running、completed、failed
  source: text('source').notNull(), // web_search, tmdb_api, douban_api, custom

  // 任务详情
  totalCount: serial('total_count'),
  successCount: serial('success_count'),
  failCount: serial('fail_count'),
  errorMessage: text('error_message'),

  // 配置
  config: jsonb('config'), // 任务配置（数量、类型等）
  result: jsonb('result'), // 任务结果摘要

  // 时间戳
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
