'use client';

import { useState } from 'react';

export default function TestRouterPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, log]);
    console.log(log);
  };

  const testWindowLocation = () => {
    addLog('=== 测试 window.location.href ===');
    addLog(`当前 URL: ${window.location.href}`);

    const targetUrl = '/reader/1/1';
    addLog(`目标 URL: ${targetUrl}`);

    addLog('即将跳转...');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);
  };

  const testRouterPush = async () => {
    try {
      const { useRouter } = await import('next/navigation');
      const router = useRouter();
      addLog('=== 测试 router.push ===');
      addLog(`router 对象: ${router ? '存在' : '不存在'}`);
      addLog(`router.push 方法: ${typeof router.push}`);

      const targetUrl = '/reader/1/1';
      addLog(`目标 URL: ${targetUrl}`);
      addLog('即将跳转...');

      router.push(targetUrl);
    } catch (error) {
      addLog(`错误: ${error}`);
    }
  };

  const testDirectLink = () => {
    addLog('=== 测试原生 Link ===');
    const targetUrl = '/reader/1/1';
    addLog(`目标 URL: ${targetUrl}`);
    addLog('请点击下面的链接测试跳转');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">路由测试页面</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">测试方法</h2>

          <div className="space-y-4">
            <button
              onClick={testWindowLocation}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              方法 1: window.location.href
            </button>

            <button
              onClick={testRouterPush}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              方法 2: router.push()
            </button>

            <div className="flex items-center gap-4">
              <span className="text-gray-600">方法 3: 原生 Link</span>
              <a
                href="/reader/1/1"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                跳转到 /reader/1/1
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">测试日志</h2>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-400">点击上面的按钮开始测试...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>

          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              清空日志
            </button>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-bold text-blue-900 mb-2">测试说明</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>依次点击上面的三种测试方法</li>
            <li>观察哪些方法能成功跳转到阅读器页面</li>
            <li>查看控制台日志和页面日志</li>
            <li>如果能成功跳转，说明路由功能正常</li>
            <li>如果都失败，可能是 Next.js 配置问题</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
