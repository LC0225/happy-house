#!/bin/bash

# 使用方法: ./push_with_token.sh YOUR_TOKEN

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "==================================="
    echo "  错误: 缺少 GitHub Token"
    echo "==================================="
    echo ""
    echo "使用方法: ./push_with_token.sh YOUR_TOKEN"
    echo ""
    echo "如何获取 Token:"
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 创建新 token，勾选 repo 权限"
    echo "3. 复制 token 并运行: ./push_with_token.sh YOUR_TOKEN"
    echo ""
    echo "示例: ./push_with_token.sh ghp_XXXXXXXXXXXXXXXXXXXX"
    echo ""
    exit 1
fi

echo "==================================="
echo "  Happy House 项目推送"
echo "==================================="
echo ""

# 配置 Git
git config --global user.name "Happy House"
git config --global user.email "happy-house@example.com"

echo "正在推送到 GitHub..."
echo ""

# 使用 token 推送
git push https://LC0225:$TOKEN@github.com/LC0225/happy-house.git main

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
    echo "1. Token 无效或已过期"
    echo "2. Token 没有 repo 权限"
    echo "3. 网络连接问题"
    echo ""
    echo "请检查 Token 后重试"
fi
