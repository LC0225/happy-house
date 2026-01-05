'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockMediaData } from '@/data/mockData';

export default function TestFlowPage() {
  const [testId, setTestId] = useState<string>('');

  useEffect(() => {
    // 1. 测试：将 mockData 保存到 localStorage
    console.log('=== 测试数据流 ===');
    console.log('1. 准备将 mockData 保存到 localStorage');
    localStorage.setItem('realMediaData', JSON.stringify(mockMediaData));
    console.log('2. 已保存，共', mockMediaData.length, '条数据');

    // 2. 测试：读取 localStorage
    const saved = localStorage.getItem('realMediaData');
    const parsed = saved ? JSON.parse(saved) : [];
    console.log('3. 从 localStorage 读取，共', parsed.length, '条数据');

    // 3. 测试：设置第一个 ID
    if (parsed.length > 0) {
      setTestId(parsed[0].id);
      console.log('4. 设置测试 ID:', parsed[0].id, '-', parsed[0].title);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem('realMediaData');
    console.log('localStorage 已清空');
    setTestId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">数据流测试页面</h1>

      <div className="space-y-6">
        {/* 测试状态 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">测试步骤</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>将 mockData 保存到 localStorage</li>
            <li>从 localStorage 读取数据</li>
            <li>点击测试链接访问详情页</li>
            <li>验证详情页是否能正确显示</li>
          </ol>
        </div>

        {/* 测试链接 */}
        {testId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">测试链接</h2>
            <p className="mb-4">ID: <strong>{testId}</strong></p>
            <div className="space-y-2">
              <Link
                href={`/detail/${testId}`}
                className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              >
                测试详情页
              </Link>
              {mockMediaData[0].type === '小说' && mockMediaData[0].chapters && mockMediaData[0].chapters.length > 0 && (
                <Link
                  href={`/reader/${testId}/1`}
                  className="block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
                >
                  测试阅读器页
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            重新加载
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            清空 localStorage
          </button>
        </div>

        {/* 所有数据 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">当前 localStorage 中的所有数据</h2>
          <div className="space-y-2">
            {mockMediaData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-gray-500 ml-2">({item.type})</span>
                  <span className="text-gray-400 text-sm ml-2">ID: {item.id}</span>
                </div>
                <Link
                  href={`/detail/${item.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  查看
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 返回首页 */}
        <div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
