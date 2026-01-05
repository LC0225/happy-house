'use client';

import { useState } from 'react';

interface CrawlerResult {
  success: boolean;
  data?: Record<string, any[]>;
  error?: string;
  summary?: {
    totalCount: number;
    byType: Record<string, number>;
  };
}

export default function CrawlerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlerResult | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [count, setCount] = useState(10);
  const [saving, setSaving] = useState(false);

  const types = [
    { id: 'all', label: '全部类型' },
    { id: '小说', label: '小说' },
    { id: '动漫', label: '动漫' },
    { id: '电视剧', label: '电视剧' },
    { id: '综艺', label: '综艺' },
    { id: '短剧', label: '短剧' },
  ];

  const startCrawler = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          count,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    if (!result?.success || !result?.data) return;

    setSaving(true);
    try {
      // 将所有类型的数据合并为一个数组
      const allData: any[] = [];
      Object.entries(result.data).forEach(([type, items]) => {
        items.forEach((item: any) => {
          allData.push({
            ...item,
            type: type,
          });
        });
      });

      // 保存到 localStorage
      localStorage.setItem('realMediaData', JSON.stringify(allData));
      
      alert('数据已保存！可以在首页的"真实数据"选项卡中使用');
    } catch (error) {
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* 顶部导航 */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">快乐屋 - 爬虫管理</h1>
            <a
              href="/"
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition"
            >
              返回首页
            </a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            自动爬虫配置
          </h2>

          {/* 配置表单 */}
          <div className="space-y-6 mb-8">
            {/* 类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据类型
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      selectedType === type.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 数量设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每个类型爬取数量
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                建议数量：5-20，数量过多可能会增加爬取时间
              </p>
            </div>

            {/* 开始按钮 */}
            <div className="flex gap-4">
              <button
                onClick={startCrawler}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition shadow-lg"
              >
                {loading ? '爬取中...' : '开始爬取'}
              </button>

              {loading && (
                <div className="flex items-center text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  正在从网络搜索并提取数据...
                </div>
              )}
            </div>
          </div>

          {/* 结果展示 */}
          {result && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                爬取结果
              </h3>

              {result.success ? (
                <div className="space-y-6">
                  {/* 汇总信息 */}
                  {result.summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-blue-900">
                          爬取汇总
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-blue-600">
                            {result.summary.totalCount} 条
                          </span>
                          <button
                            onClick={saveToLocalStorage}
                            disabled={saving}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
                          >
                            {saving ? '保存中...' : '保存到首页'}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Object.entries(result.summary.byType).map(([type, count]) => (
                          <div key={type} className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{count}</div>
                            <div className="text-sm text-gray-600">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 详细数据 */}
                  {result.data && (
                    <div className="space-y-4">
                      {Object.entries(result.data).map(([type, items]) => (
                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 mb-3">
                            {type} ({items.length} 条)
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {items.slice(0, 4).map((item: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="font-medium text-gray-900 mb-2">
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>评分: {item.rating}</div>
                                  <div>年份: {item.year}</div>
                                  <div>国家: {item.country}</div>
                                </div>
                              </div>
                            ))}
                            {items.length > 4 && (
                              <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                                +{items.length - 4} 更多
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 操作提示 */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-600 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-green-800 font-medium">
                          爬取成功！
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          数据已准备好，可以继续保存到数据库或在页面中使用。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-red-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">
                        爬取失败
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
