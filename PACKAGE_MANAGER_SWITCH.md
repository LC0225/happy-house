# 包管理器切换说明

## 问题描述

### pnpm 安装失败
```
 ERR_PNPM_META_FETCH_FAIL  GET https://registry.npmjs.org/@tailwindcss%2Fpostcss: Value of "this" must be of type URLSearchParams
 WARN  GET https://registry.npmjs.org/zod error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.
Error: Command "pnpm install" exited with 1
```

### npm 安装失败
```
npm error Cannot read properties of null (reading 'matches')
```

## 解决方案

### 切换到 Yarn

经过多次尝试，pnpm 和 npm 在当前环境都不稳定，最终选择使用 **yarn**。

### 执行步骤

1. **删除旧的 lock 文件**
```bash
rm -f pnpm-lock.yaml
```

2. **删除 node_modules**
```bash
rm -rf node_modules
```

3. **使用 yarn 安装依赖**
```bash
yarn install
```

### 安装结果

```
yarn install v1.22.22
info No lockfile found.
[1/4] Resolving packages...
warning coze-coding-dev-sdk > drizzle-kit > @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is
warning coze-coding-dev-sdk > drizzle-kit > @esbuild-kit/esm-loader > @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
Done in 45.75s.
```

## 验证结果

### 依赖安装
- ✅ 安装时间：45.75s
- ✅ 生成 yarn.lock
- ✅ 依赖完整

### 构建测试
```bash
npm run build
```

```
   ▲ Next.js 16.0.10 (Turbopack)
   Creating an optimized build ...
 ✓ Compiled successfully in 3.1s
 ✓ Generating static pages (7/7) in 555.2ms
```

### Vercel 部署配置

由于删除了 `vercel.json`，Vercel 会自动检测项目类型：

- **检测到文件**：`yarn.lock`
- **自动使用的包管理器**：`yarn`
- **安装命令**：`yarn install`
- **构建命令**：`yarn build` 或 `npm run build`

## 包管理器对比

| 包管理器 | 状态 | 原因 |
|---------|------|------|
| pnpm | ❌ 失败 | URLSearchParams 错误，网络请求失败 |
| npm | ❌ 失败 | 读取 null 属性错误 |
| yarn | ✅ 成功 | 稳定可靠，兼容性好 |

## 当前配置

### package.json
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

### Vercel 自动检测
- Lock 文件：`yarn.lock`
- 包管理器：`yarn`
- 部署命令：自动识别

## 后续维护

### 添加依赖
```bash
yarn add package-name
```

### 添加开发依赖
```bash
yarn add -D package-name
```

### 删除依赖
```bash
yarn remove package-name
```

### 更新依赖
```bash
yarn upgrade
```

## 注意事项

1. **不要手动修改 yarn.lock** - 它由 yarn 自动管理
2. **提交 yarn.lock 到 Git** - 确保团队使用相同版本的依赖
3. **删除其他 lock 文件** - 避免冲突（package-lock.json, pnpm-lock.yaml）
4. **Vercel 自动检测** - 不需要手动配置，Vercel 会识别 yarn.lock

## 总结

**推荐使用 yarn 作为项目的包管理器**，因为它在当前环境下最稳定可靠。
