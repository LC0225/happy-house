# Netlify 部署指南（修复 404 问题）

## 问题解决

### 原问题
部署到 Netlify 后访问页面出现 404 错误：
```
Page not found
Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
```

### 根本原因
- 尝试使用静态导出模式（`output: 'export'`）
- Next.js 动态路由在静态导出时需要 `generateStaticParams()`
- 客户端组件（`'use client'`）不能导出 `generateStaticParams()`
- Netlify 配置不正确

### 解决方案
- ✅ 移除静态导出模式
- ✅ 使用 Next.js 标准部署（Serverless Functions）
- ✅ 配置正确的 Netlify 构建

## 📋 完整部署步骤

### 步骤 1：重新配置 Netlify 项目

1. 登录 Netlify：https://app.netlify.com/

2. 找到你的项目或创建新项目

3. 进入项目设置（Site Settings）

4. 找到 "Build & deploy" → "Build settings"

5. 配置构建设置：
   ```
   Build command: npm run build
   Publish directory: .next
   ```

6. **重要**：确保使用 Netlify Next.js 插件
   - 进入 "Plugins"
   - 添加 "@netlify/plugin-nextjs" 插件
   - 或者配置文件 `netlify.toml` 已包含此配置

### 步骤 2：重新部署

**方法 1：通过 Netlify Dashboard**

1. 进入 "Deploys" 标签
2. 找到最新的部署
3. 点击 "Trigger deploy" → "Deploy site"

**方法 2：通过 Git**

1. 确保代码已提交到 GitHub
2. Netlify 会自动检测到更改并触发部署

### 步骤 3：验证部署

部署完成后，访问以下页面进行验证：

#### 测试优先级（从简到繁）

| 页面 | 类型 | 预期结果 |
|------|------|----------|
| `/health.html` | 静态 HTML | ✅ 快速显示（< 200ms） |
| `/simple` | Next.js 页面 | ✅ 显示页面 |
| `/test` | Next.js 页面 | ✅ 显示页面 |
| `/` | Next.js 首页 | ✅ 显示应用 |
| `/detail/1` | 动态路由 | ✅ 显示详情页 |
| `/play/1` | 动态路由 | ✅ 显示播放页 |

## 🔧 关键配置文件

### 1. `netlify.toml` - Netlify 配置

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NETLIFY_NEXT_PLUGIN_SKIP = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. `next.config.ts` - Next.js 配置

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  experimental: {
    optimizePackageImports: ['react'],
  },
};

export default nextConfig;
```

**注意**：没有 `output: 'export'`，使用标准模式

### 3. `package.json` - 构建命令

```json
{
  "scripts": {
    "dev": "next dev -p 5000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

## 📊 部署模式对比

| 模式 | 构建命令 | 发布目录 | 优点 | 缺点 |
|------|---------|----------|------|------|
| **标准模式**（推荐） | `npm run build` | `.next` | ✅ 支持动态路由<br>✅ 支持客户端组件<br>✅ 完整功能 | ❌ 需要 Serverless Functions |
| 静态导出 | `npm run build` | `out` | ✅ 纯静态<br>✅ 无服务器成本 | ❌ 不支持动态路由<br>❌ 客户端组件限制多 |

## 🧪 故障排查

### 问题 1：仍然是 404 错误

**检查清单：**
- [ ] 构建命令是否正确：`npm run build`
- [ ] 发布目录是否正确：`.next`
- [ ] 是否安装了 Next.js 插件：`@netlify/plugin-nextjs`
- [ ] 构建日志是否显示成功

**解决方案：**
1. 查看 Netlify 构建日志
2. 确保 "Publish directory" 设置为 `.next`（不是 `out`）
3. 重新部署

### 问题 2：构建失败

**常见错误：**

#### 错误 A：依赖安装失败
```
Error: Cannot find module 'next'
```

**解决方案：**
```bash
# 清理并重新安装
rm -rf node_modules
npm install
```

#### 错误 B：TypeScript 错误
```
TS2307: Cannot find module
```

**解决方案：**
1. 运行 `npm run build` 在本地测试
2. 修复类型错误
3. 重新部署

### 问题 3：部分页面正常，部分 404

**可能原因：**
- 静态页面正常：`/`, `/simple`, `/test`
- 动态路由 404：`/detail/[id]`, `/play/[id]`

**解决方案：**
1. 确保 `netlify.toml` 包含 Next.js 插件
2. 检查 Netlify Functions 是否正常部署
3. 查看 Netlify Functions 日志

### 问题 4：样式不加载

**症状：**页面显示但样式混乱

**解决方案：**
1. 检查 `/public/_redirects` 文件是否存在
2. 确保 `netlify.toml` 中的 headers 配置正确
3. 清除浏览器缓存

## 🎯 性能预期

| 页面 | 本地响应 | Netlify 预期 |
|------|----------|-------------|
| /health.html | < 10ms | < 200ms |
| /simple | 340ms | < 500ms |
| / | 待测试 | < 1s |
| /detail/1 | 待测试 | < 1s |

## 📝 部署验证清单

部署完成后，请验证以下项目：

- [ ] `/health.html` 显示正常
- [ ] `/simple` 显示正常
- [ ] `/test` 显示正常
- [ ] `/` 首页加载正常
- [ ] `/detail/1` 详情页显示正常
- [ ] `/play/1` 播放页显示正常
- [ ] 样式正确加载
- [ ] 控制台无错误
- [ ] 所有交互功能正常

## 🚀 重新部署命令

### 方法 1：通过 Netlify Dashboard
1. 进入项目
2. 点击 "Deploys"
3. 点击 "Trigger deploy" → "Deploy site"

### 方法 2：通过 Netlify CLI
```bash
# 安装 CLI
npm install -g netlify-cli

# 登录
netlify login

# 重新部署
netlify deploy --prod
```

### 方法 3：通过 Git
```bash
git add .
git commit -m "fix: 修复 Netlify 404 问题"
git push
```

## 💡 最佳实践

1. **使用 Next.js 插件**：`@netlify/plugin-nextjs` 自动处理部署
2. **不要使用静态导出**：除非确定不需要动态路由
3. **本地先测试**：`npm run build` 在本地验证
4. **查看构建日志**：有问题先检查日志
5. **使用 Netlify Functions**：动态路由会自动转换为 Functions

## 📞 需要帮助？

### Netlify 资源
- 文档：https://docs.netlify.com/
- Next.js 指南：https://docs.netlify.com/frameworks/nextjs/
- 支持：https://answers.netlify.com/

### 本地测试
```bash
# 本地构建测试
npm run build

# 本地启动测试
npm start
```

## ✅ 部署成功标志

- ✅ 构建日志显示 "Publishing to Netlify"
- ✅ 所有页面都能访问
- ✅ 动态路由正常工作
- ✅ 样式正确加载
- ✅ 控制台无错误

## 🎉 总结

**关键配置：**
- ✅ 构建命令：`npm run build`
- ✅ 发布目录：`.next`
- ✅ 使用 Next.js 插件：`@netlify/plugin-nextjs`
- ✅ 移除静态导出：无 `output: 'export'`

**预期结果：**
- 所有页面正常访问
- 响应时间 < 1s
- 动态路由正常工作

部署就绪！🚀
