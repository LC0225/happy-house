# Vercel 部署故障排除指南

## 已修复的问题

### 1. localStorage SSR 错误
**问题**：页面在服务端渲染时访问 localStorage 导致 "localStorage is not defined" 错误

**解决方案**：
- ✅ 使用 `useEffect` 延迟加载 localStorage 数据
- ✅ 添加 `mounted` 状态确保只在客户端执行
- ✅ 添加 try-catch 错误处理

**修改文件**：
- `src/app/page.tsx` - 修复收藏状态的加载和保存逻辑

## 部署后仍然无法访问的可能原因

### 1. 检查 Vercel 构建日志
1. 进入 Vercel Dashboard
2. 点击你的项目
3. 查看 **Deployments** 标签
4. 点击最新的部署记录
5. 检查 **Build Logs** 是否有错误

### 2. 常见问题排查

#### 问题 A: 页面显示 "Server Error" 或 500 错误
**可能原因**：
- 环境变量未配置
- 数据库连接失败
- 集成服务未授权

**解决步骤**：
1. 检查 **Environment Variables** 是否正确配置
2. 查看 **Function Logs** 获取详细错误信息
3. 确认集成服务的授权配置

#### 问题 B: 白屏但构建成功
**可能原因**：
- 客户端 JavaScript 错误
- CORS 问题
- 资源加载失败

**解决步骤**：
1. 打开浏览器开发者工具（F12）
2. 查看 **Console** 标签的错误信息
3. 查看 **Network** 标签检查资源加载状态

#### 问题 C: 样式加载失败
**可能原因**：
- Tailwind CSS 配置问题
- 静态资源路径错误

**解决步骤**：
1. 检查浏览器 Console 中是否有样式相关错误
2. 确认 `tailwind.config.ts` 配置正确
3. 检查 `src/app/globals.css` 是否正确导入

### 3. 本地验证

在本地运行生产构建模拟 Vercel 环境：

```bash
# 1. 构建生产版本
npm run build

# 2. 启动生产服务器
npm start

# 3. 访问 http://localhost:3000
```

如果本地生产环境正常，说明代码没有问题，问题出在 Vercel 配置或环境变量上。

### 4. 检查域名配置

#### 如果使用自定义域名：
1. 在 Vercel Dashboard 的 **Domains** 设置中
2. 确认 DNS 记录已正确配置
3. 检查 SSL 证书是否已颁发

#### 如果使用 Vercel 默认域名：
- 格式通常是 `https://你的项目名.vercel.app`
- 等待 DNS 传播（通常 1-5 分钟）

### 5. 强制重新部署

如果缓存导致问题：

**方法 1: 通过 Dashboard**
1. 进入项目页面
2. 点击 **Deployments**
3. 找到最新部署
4. 点击右边的 **...** 菜单
5. 选择 **Redeploy**

**方法 2: 通过 Git**
```bash
# 做一个空提交触发重新部署
git commit --allow-empty -m "trigger redeploy"
git push
```

### 6. 查看实时日志

在 Vercel Dashboard 中：
1. 点击 **Functions** 标签
2. 可以查看实时的函数调用日志
3. 帮助定位运行时错误

## 项目架构说明

### 页面结构
- `/` - 首页（客户端组件，使用 localStorage）
- `/detail/[id]` - 详情页（动态路由）
- `/play/[id]` - 播放页（动态路由）
- `/profile` - 个人中心

### 数据来源
- 当前使用 `mockData.ts` 中的模拟数据
- 不依赖外部 API 或数据库
- 可以在没有环境变量的情况下正常访问

## 调试建议

### 1. 使用 Console 日志
在关键位置添加日志：
```typescript
console.log('页面加载完成');
console.log('收藏数据:', favorites);
```

### 2. 检查浏览器控制台
- **Console**: JavaScript 运行时错误
- **Network**: 请求和资源加载状态
- **Elements**: DOM 结构和样式

### 3. Vercel 日志位置
- **Build Logs**: 构建阶段的日志
- **Function Logs**: 运行时的函数调用日志
- **Real-time Logs**: 实时日志流

## 联系支持

如果以上方法都无法解决问题：
1. 收集完整的错误信息（截图或复制日志）
2. 记录复现步骤
3. 说明你的 Vercel 项目名称和部署 URL
4. 查阅 [Vercel 文档](https://vercel.com/docs)

## 快速检查清单

- [ ] 构建日志显示成功，无错误
- [ ] 部署状态显示 "Ready"
- [ ] 浏览器控制台无 JavaScript 错误
- [ ] Network 标签显示所有资源加载成功（状态码 200）
- [ ] 可以访问域名（DNS 已解析）
- [ ] 本地生产环境（npm run build && npm start）运行正常
- [ ] 如果使用自定义域名，DNS 记录正确
