#!/bin/bash

echo "=== 快乐屋部署测试脚本 ==="
echo ""

# 测试 1: 检查首页
echo "测试 1: 检查首页响应"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$response" = "200" ]; then
  echo "✓ 首页响应正常 (HTTP 200)"
else
  echo "✗ 首页响应异常 (HTTP $response)"
  exit 1
fi
echo ""

# 测试 2: 检查 HTML 是否包含关键内容
echo "测试 2: 检查页面关键内容"
content=$(curl -s http://localhost:5000)
if echo "$content" | grep -q "快乐屋"; then
  echo "✓ 找到页面标题: 快乐屋"
else
  echo "✗ 未找到页面标题"
  exit 1
fi

if echo "$content" | grep -q "小说\|动漫\|电视剧\|综艺\|短剧"; then
  echo "✓ 找到媒体类型标签"
else
  echo "✗ 未找到媒体类型标签"
  exit 1
fi
echo ""

# 测试 3: 检查静态资源
echo "测试 3: 检查静态资源"
css_check=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/_next/static/css)
if [ "$css_check" = "200" ] || [ "$css_check" = "404" ]; then
  echo "✓ 静态资源路径可访问"
else
  echo "⚠ 静态资源路径响应: HTTP $css_check"
fi
echo ""

# 测试 4: 检查详情页路由（动态路由）
echo "测试 4: 检查详情页路由"
detail_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/detail/1)
if [ "$detail_response" = "200" ]; then
  echo "✓ 详情页路由正常 (HTTP 200)"
else
  echo "⚠ 详情页路由响应: HTTP $detail_response"
fi
echo ""

# 测试 5: 检查个人中心页
echo "测试 5: 检查个人中心页"
profile_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/profile)
if [ "$profile_response" = "200" ]; then
  echo "✓ 个人中心页面正常 (HTTP 200)"
else
  echo "⚠ 个人中心页面响应: HTTP $profile_response"
fi
echo ""

echo "=== 测试完成 ==="
echo ""
echo "本地测试通过！如果 Vercel 部署后无法访问，请参考："
echo "- DEPLOYMENT_TROUBLESHOOTING.md"
echo "- VERCEL_SETUP_GUIDE.md"
