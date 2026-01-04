#!/bin/bash

echo "==================================="
echo "  Happy House 项目推送脚本"
echo "==================================="
echo ""

# 设置 Git 用户配置（如果未设置）
if [ -z "$(git config --global user.name)" ]; then
    echo "配置 Git 用户..."
    git config --global user.name "Happy House"
    git config --global user.email "happy-house@example.com"
    echo "✓ Git 配置完成"
fi

echo ""
echo "检查 Git 状态..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "发现未提交的更改，正在添加..."

    # 添加所有文件
    git add .

    # 提交
    git commit -m "导出项目 - 包含完整的源代码和配置文件

- 添加 Vercel 部署配置
- 添加 pnpm 支持配置
- 添加项目文档 README.md
- 修复播放页面 useEffect 问题
- 准备项目导出"

    echo "✓ 代码已提交"
else
    echo "没有需要提交的更改"
fi

echo ""
echo "正在推送到 GitHub..."
echo "如果提示输入密码，请使用 Personal Access Token"
echo "创建 Token: https://github.com/settings/tokens"
echo ""

# 推送到 GitHub
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "==================================="
    echo "  ✓ 推送成功！"
    echo "==================================="
    echo ""
    echo "下一步："
    echo "1. 访问 https://github.com/LC0225/happy-house"
    echo "2. 点击 'Code' 按钮"
    echo "3. 选择 'Download ZIP' 下载项目"
    echo ""
else
    echo ""
    echo "==================================="
    echo "  ✗ 推送失败"
    echo "==================================="
    echo ""
    echo "可能的原因："
    echo "1. GitHub 账号或密码错误"
    echo "2. 网络连接问题"
    echo "3. 仓库权限问题"
    echo ""
    echo "请检查后重试。如果需要使用 Token，访问："
    echo "https://github.com/settings/tokens"
fi
