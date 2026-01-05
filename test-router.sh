#!/bin/bash

echo "=== 路由测试脚本 ==="
echo ""

BASE_URL="http://localhost:5000"

echo "1. 测试首页..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/")
echo "   状态码: $STATUS"
if [ "$STATUS" = "200" ]; then
    echo "   ✓ 首页正常"
else
    echo "   ✗ 首页异常"
fi
echo ""

echo "2. 测试详情页 (/detail/1)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/detail/1")
echo "   状态码: $STATUS"
if [ "$STATUS" = "200" ]; then
    echo "   ✓ 详情页正常"
else
    echo "   ✗ 详情页异常"
fi
echo ""

echo "3. 测试阅读器页面 (/reader/1/1)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/reader/1/1")
echo "   状态码: $STATUS"
if [ "$STATUS" = "200" ]; then
    echo "   ✓ 阅读器页面正常"
else
    echo "   ✗ 阅读器页面异常"
fi
echo ""

echo "4. 测试路由测试页面 (/test-router)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/test-router")
echo "   状态码: $STATUS"
if [ "$STATUS" = "200" ]; then
    echo "   ✓ 测试页面正常"
    CONTENT=$(curl -s "${BASE_URL}/test-router")
    if echo "$CONTENT" | grep -q "路由测试页面"; then
        echo "   ✓ 测试页面内容正常"
    else
        echo "   ✗ 测试页面内容异常"
    fi
else
    echo "   ✗ 测试页面异常"
fi
echo ""

echo "=== 测试完成 ==="
