export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">测试页面</h1>
        <p className="text-gray-600 mb-8">如果你能看到这个页面，说明部署是成功的！</p>
        <div className="space-y-2">
          <p className="text-green-600">✅ 页面加载成功</p>
          <p className="text-green-600">✅ CSS 渲染正常</p>
          <p className="text-green-600">✅ 服务器响应正常</p>
        </div>
        <a href="/" className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          返回首页
        </a>
      </div>
    </div>
  );
}
