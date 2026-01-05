'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // 读取 localStorage
    const data = localStorage.getItem('realMediaData');
    setLocalStorageData(data ? JSON.parse(data) : []);

    // 同时读取收藏数据
    const favorites = localStorage.getItem('favorites');
    console.log('Favorites:', favorites ? JSON.parse(favorites) : []);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">调试页面 - localStorage 内容</h1>

      {localStorageData === null ? (
        <p>加载中...</p>
      ) : localStorageData.length === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">localStorage 中没有数据！</p>
          <p className="text-red-500 mt-2">请先在首页搜索或去个人中心使用爬虫</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-semibold">localStorage 中共有 {localStorageData.length} 条数据</p>
          </div>

          {localStorageData.map((item: any, index: number) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{index + 1}. {item.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>类型:</strong> {item.type}</p>
                <p><strong>国家:</strong> {item.country}</p>
                <p><strong>年份:</strong> {item.year}</p>
                <p><strong>评分:</strong> {item.rating}</p>
                <p><strong>章节:</strong> {item.chapters ? `${item.chapters.length} 章` : '无'}</p>
                <p><strong>数据源:</strong> {item.dataSource || '未知'}</p>
              </div>
              <a
                href={`/detail/${item.id}`}
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                查看详情页
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <a
          href="/"
          className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
