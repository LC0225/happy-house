export default function TestPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          测试页面
        </h1>
        <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '40px' }}>
          如果您能看到这个页面，说明部署是成功的！
        </p>
        <div style={{ marginBottom: '40px', textAlign: 'left' }}>
          <div style={{ padding: '15px', marginBottom: '10px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>
            ✅ 页面加载成功
          </div>
          <div style={{ padding: '15px', marginBottom: '10px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>
            ✅ CSS 渲染正常
          </div>
          <div style={{ padding: '15px', marginBottom: '10px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>
            ✅ 服务器响应正常
          </div>
          <div style={{ padding: '15px', backgroundColor: '#dbeafe', borderRadius: '8px', color: '#1e40af' }}>
            ℹ️ 当前使用内联样式，零外部依赖
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#002FA7',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            返回首页
          </a>
          <a
            href="/simple"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            极简测试
          </a>
        </div>
      </div>
    </div>
  );
}
