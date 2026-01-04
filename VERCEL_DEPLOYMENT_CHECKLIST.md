# Vercel 部署检查清单

## 当前状态
✅ 代码已修复 localStorage SSR 问题
✅ 本地构建测试通过
✅ 本地服务运行正常（http://localhost:5000）

## Vercel 部署后无法访问？按顺序检查：

### 步骤 1: 确认 Vercel 部署状态
- [ ] 进入 Vercel Dashboard
- [ ] 找到你的项目
- [ ] 检查最新部署的状态是否为 "Ready"（绿色勾）
- [ ] 如果显示 "Failed" 或 "Building"，等待完成

### 步骤 2: 检查构建日志
- [ ] 点击最新部署记录
- [ ] 查看 "Build Logs"
- [ ] 确认最后显示 "Build Completed"
- [ ] 如果有错误，复制错误信息

### 步骤 3: 访问部署的域名
Vercel 会自动生成域名，格式：
```
https://你的项目名.vercel.app
```
例如：`https://happy-house.vercel.app`

- [ ] 尝试访问这个 URL
- [ ] 等待 DNS 解析（通常 1-5 分钟）

### 步骤 4: 如果页面无法打开

#### 4.1 检查浏览器控制台
1. 按 F12 打开开发者工具
2. 点击 "Console" 标签
3. 查看是否有红色错误信息
4. 复制错误信息

#### 4.2 检查网络请求
1. 在开发者工具中点击 "Network" 标签
2. 刷新页面（F5）
3. 查看是否有请求失败（红色）
4. 检查失败的请求是什么

### 步骤 5: 常见问题和解决方案

#### 问题 1: 白屏（页面空白但加载成功）
**原因**：客户端 JavaScript 错误
**解决**：
- 查看 Console 标签的错误信息
- 如果是 "localStorage is not defined"，说明修复未生效
- 重新部署代码

#### 问题 2: 500 Internal Server Error
**原因**：服务端运行时错误
**解决**：
- 在 Vercel Dashboard 查看 "Function Logs"
- 检查是否缺少环境变量
- 确认集成服务已授权

#### 问题 3: 404 Not Found
**原因**：路由配置问题或域名未解析
**解决**：
- 等待 DNS 传播（最多 24 小时）
- 检查项目域名设置
- 尝试访问 `/` 路径

#### 问题 4: 样式错乱
**原因**：CSS 加载失败
**解决**：
- 检查 Network 标签的 CSS 文件状态
- 确认 Tailwind 配置正确
- 清除浏览器缓存

### 步骤 6: 强制重新部署
如果怀疑缓存问题：

#### 方法 A: 通过 Vercel Dashboard
1. 进入项目 → Deployments
2. 点击最新部署的右侧 "..." 菜单
3. 选择 "Redeploy"
4. 等待重新部署完成

#### 方法 B: 通过 Git
```bash
# 做一个空提交触发重新部署
git commit --allow-empty -m "trigger vercel redeploy"
git push
```

### 步骤 7: 联系支持前收集信息
如果以上都试过还是不行，收集以下信息：

1. **Vercel 部署 URL**：
   ```
   https://xxxxxxxx.vercel.app
   ```

2. **构建日志**：
   - 截图或复制 Build Logs 的最后部分

3. **浏览器控制台错误**：
   - F12 → Console 的错误信息（截图或复制）

4. **Function Logs**（如果有 500 错误）：
   - Vercel Dashboard → Functions → 查看

## 本地验证方法

如果怀疑是环境问题，在本地模拟生产环境：

```bash
# 1. 停止开发服务器（如果运行中）
# Ctrl+C

# 2. 构建生产版本
npm run build

# 3. 启动生产服务器
npm start

# 4. 访问 http://localhost:3000
```

如果本地生产环境正常，说明代码没问题，是 Vercel 环境配置问题。

## 项目信息

- **项目名称**：happy-house
- **框架**：Next.js 16
- **包管理器**：npm
- **构建命令**：`npm run build`
- **启动命令**：`npm start`

## 技术说明

### 为什么之前会失败？
页面直接在组件初始化时访问 `localStorage`，导致服务端渲染时出错：
```javascript
// ❌ 错误：在服务端渲染时执行
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('favorites'); // 服务端没有 localStorage
  return new Set(JSON.parse(saved));
});
```

### 修复后的代码
使用 `useEffect` 延迟加载，只在客户端执行：
```javascript
// ✅ 正确：只在客户端加载
const [favorites, setFavorites] = useState(new Set());
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  const saved = localStorage.getItem('favorites');
  if (saved) {
    setFavorites(new Set(JSON.parse(saved)));
  }
}, []);
```

## 下一步操作

1. **推送最新代码到 GitHub**（如果还没有）
   ```bash
   git add .
   git commit -m "fix: resolve localStorage SSR issue"
   git push
   ```

2. **等待 Vercel 自动部署**
   - Vercel 会检测到新提交
   - 自动触发构建和部署
   - 通常需要 1-3 分钟

3. **访问部署的 URL**
   - 部署完成后点击访问链接
   - 或使用 Vercel 提供的域名

## 相关文档

- `DEPLOYMENT_TROUBLESHOOTING.md` - 详细故障排除指南
- `VERCEL_SETUP_GUIDE.md` - Vercel 配置说明
- `SOLUTION.md` - pnpm 到 npm 的迁移方案

## 需要帮助？

如果按照以上步骤还是无法解决，请提供：
1. Vercel 部署 URL
2. 浏览器控制台的错误截图
3. Vercel 构建日志（最后部分）
4. Vercel Function Logs（如果有的话）
