# Vercel 部署配置指南

## 问题说明
项目从 pnpm 切换到 npm 后，需要在 Vercel 中正确配置构建命令。

## 配置步骤

### 1. 进入 Vercel 项目设置

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击你的项目进入项目详情页
3. 点击顶部导航栏的 **Settings** 标签

### 2. 配置构建设置

在 **Settings** 页面中：

1. 左侧菜单点击 **General**
2. 滚动到 **Build & Development Settings** 部分
3. 修改以下配置：

   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. 删除并重新导入项目（如果上述配置无效）

如果项目之前使用 pnpm 部署失败，建议完全重新导入：

1. **删除现有项目**
   - 在项目页面，点击右上角 **Settings**
   - 滚动到最底部
   - 点击 **Delete Project**
   - 确认删除

2. **重新导入项目**
   - 在 Vercel Dashboard 点击 **Add New** > **Project**
   - 选择你的 GitHub 仓库
   - **重要**：在导入页面，点击 **Framework Preset** 右侧的 **Edit**
   - 确认配置：
     - Framework: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Install Command: `npm install`
     - Output Directory: `.next`
   - 点击 **Deploy**

### 4. 验证部署

部署完成后，检查构建日志：
- 应该看到 `npm install` 而不是 `pnpm install`
- 构建过程应该成功完成

## 常见问题

### Q: 找不到 Build & Development Settings
- 确保你在 **Settings** > **General** 页面
- 向下滚动到底部

### Q: 仍然使用 pnpm
- 删除项目后重新导入
- 确保本地代码已推送到 GitHub（删除了 pnpm-lock.yaml）
- 检查 vercel.json 中的配置是否正确

### Q: 构建失败
- 检查构建日志查看具体错误
- 确保所有依赖都在 package.json 中
- 检查 TypeScript 类型错误

## 当前项目配置

- 包管理器: npm
- 框架: Next.js 16
- Node.js 版本: 自动检测（建议 18.x 或 20.x）
- 构建命令: `npm run build`
- 启动命令: `next start`

## 相关文件

- `vercel.json`: Vercel 项目配置
- `package.json`: 项目依赖和脚本
- `.npmrc`: 已删除（避免冲突）
- `pnpm-lock.yaml`: 已删除（切换到 npm）
