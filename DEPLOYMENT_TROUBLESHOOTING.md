# Vercel 部署超时问题排查指南

## 问题现象
所有页面（包括最简单的页面）都响应缓慢或超时（> 21秒）

## 已完成的优化

### 1. 移除 Vercel 自定义配置
- ✅ 删除了 `vercel.json`
- ✅ 使用 Vercel 默认配置

### 2. 优化 Next.js 配置
- ✅ 启用图片优化禁用（unoptimized: true）
- ✅ 启用包导入优化
- ✅ 启用严格模式

### 3. 创建测试页面
- ✅ `/health.html` - 纯静态 HTML，预期响应 < 100ms
- ✅ `/simple` - 最简 Next.js 页面，预期响应 < 1s
- ✅ `/test` - 完整测试页面，预期响应 < 3s

### 4. 减少数据量
- ✅ mockData 从 18 条减少到 5 条
- ✅ 减少所有筛选选项

## 测试步骤

### 第一步：测试最底层
访问：`https://你的域名/health.html`

**预期结果：**
- 响应时间 < 100ms
- 立即显示页面

**如果失败：**
- ❌ 说明是 Vercel 平台问题，可能是：
  - Vercel 账号配置问题
  - 区域选择问题
  - Vercel 服务故障
  - 网络连接问题

### 第二步：测试 Next.js 路由
访问：`https://你的域名/simple`

**预期结果：**
- 响应时间 < 1s
- 显示简单页面

**如果失败但 health.html 成功：**
- ❌ 说明是 Next.js 配置或构建问题

### 第三步：测试完整应用
访问：`https://你的域名/`

**预期结果：**
- 响应时间 < 5s
- 显示完整应用

## 如果仍然超时的解决方案

### 方案 1：检查 Vercel 项目设置

1. 登录 Vercel Dashboard
2. 进入项目设置
3. 检查以下配置：
   - **Build & Development Settings**
     - Build Command: `pnpm run build`
     - Output Directory: `.next`
     - Install Command: `pnpm install`
   - **Regions**
     - 删除所有自定义区域
     - 使用 Vercel 的默认选择
   - **Environment Variables**
     - 检查是否有无效的环境变量

### 方案 2：重新部署

1. 在 Vercel Dashboard 中
2. 点击 "Redeploy" 按钮
3. 选择 "Redeploy without build cache"
4. 等待部署完成

### 方案 3：检查部署日志

在 Vercel Dashboard 中查看部署日志：
```
Settings > Functions > Logs
```

检查是否有：
- 超时错误
- 内存错误
- 构建失败
- 依赖安装失败

### 方案 4：更换部署平台

如果 Vercel 持续出现问题，可以考虑：
- **Netlify**
- **Cloudflare Pages**
- **Railway**
- **Render**

### 方案 5：使用 Vercel 免费域名测试

当前使用的可能是自定义域名，先测试 Vercel 提供的免费 `.vercel.app` 域名。

## 诊断命令

在本地测试：
```bash
# 测试构建时间
time pnpm run build

# 测试本地启动
time pnpm start

# 测试页面响应
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/health.html
```

curl-format.txt 内容：
```
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```

## 关键文件

- `next.config.ts` - Next.js 配置
- `public/health.html` - 纯静态 HTML 测试页
- `src/app/simple/page.tsx` - 最简 Next.js 页面
- `src/app/test/page.tsx` - 完整测试页面
- `src/data/mockData.ts` - 优化后的数据

## 当前状态

- ✅ TypeScript 类型检查通过
- ✅ Next.js 构建成功（2.7s）
- ✅ 静态页面生成成功（667ms）
- ⏳ 等待 Vercel 部署测试
