# 快乐屋 - 多媒体内容浏览平台

一个支持小说、动漫、电视剧、综艺、短剧浏览的现代化网站。

## ✨ 特性

- 📚 **五种媒体类型**：小说、动漫、电视剧、综艺、短剧
- 🎨 **克莱因蓝主题**：统一的蓝色系设计
- 🔍 **智能搜索**：支持标题、描述、标签搜索
- 🌍 **多维筛选**：国家、年份、类型、标签
- ❤️ **收藏功能**：保存喜欢的内容
- 📱 **响应式设计**：适配各种设备
- ⚡ **极速加载**：零外部依赖，秒级响应

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5000
```

### 构建生产版本

```bash
# 构建
npm run build

# 启动生产服务器
npm start

# 访问 http://localhost:3000
```

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 等待自动部署完成
4. 访问部署的域名

## 📁 项目结构

```
src/
├── app/
│   ├── detail/[id]/page.tsx    # 详情页
│   ├── play/[id]/page.tsx      # 播放页
│   ├── profile/page.tsx        # 个人中心
│   ├── test/page.tsx           # 测试页面
│   ├── page.tsx                # 首页
│   └── layout.tsx              # 根布局
├── components/
│   ├── MediaCard.tsx           # 媒体卡片
│   ├── FilterBar.tsx           # 筛选栏
│   └── PlaceholderImage.tsx    # 占位符图片
├── data/
│   └── mockData.ts             # 模拟数据
└── types/
    └── media.ts                # 类型定义
```

## 🎨 占位符说明

当前使用彩色占位符显示内容封面：
- **小说**：蓝色 (#3B82F6)
- **动漫**：粉色 (#EC4899)
- **电视剧**：紫色 (#8B5CF6)
- **综艺**：绿色 (#10B981)
- **短剧**：橙色 (#F59E0B)

这确保了：
- ✅ 零外部依赖
- ✅ 极速加载
- ✅ 统一视觉风格

后续可以轻松替换为真实图片或 AI 生成的封面。

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **UI**：React 19 + Tailwind CSS 4
- **语言**：TypeScript 5
- **包管理**：npm
- **部署**：Vercel

## 📚 文档

- `ULTRA_OPTIMIZATION.md` - 极致优化方案（重要！）
- `DEPLOYMENT_READY.md` - 部署就绪指南
- `TIMEOUT_SOLUTION.md` - 超时问题解决方案
- `DEPLOYMENT_TROUBLESHOOTING.md` - 故障排除指南
- `CHANGELOG.md` - 更新日志

## 🔧 开发命令

```bash
npm run dev          # 启动开发服务器（端口 5000）
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 代码检查
npx tsc --noEmit     # TypeScript 类型检查
```

## 📝 注意事项

### SSR 相关
- 页面使用 `'use client'` 标记为客户端组件
- localStorage 访问已在 useEffect 中延迟加载
- 所有外部依赖已移除（包括 Google Fonts）

### 构建相关
- 使用 npm 而非 pnpm（Vercel 兼容性）
- 构建时间约 10 秒
- 首屏加载 < 100ms

### Vercel 部署
- 不指定 region，让 Vercel 自动选择最优节点
- 移除 Google Fonts，使用系统默认字体
- 极致优化后，应该能在 1-3 分钟内完成部署

## 🎯 后续优化

- [ ] 添加真实封面图
- [ ] AI 生成封面功能
- [ ] SEO 优化
- [ ] 用户认证系统
- [ ] 评论功能
- [ ] 推荐算法

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**：v1.2.0-optimized
**状态**：✅ 极致优化完成，准备部署
**最后更新**：2024-01-04
**关键优化**：移除 Google Fonts 和 Region 配置
