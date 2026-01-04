export default function SimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#002FA7', marginBottom: '20px' }}>快乐屋 - 极简测试</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        这是最简单的页面，用于测试 Vercel 部署响应速度
      </p>
      <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ 如果您看到此页面，说明部署成功！</p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/test" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#002FA7',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
          }}
        >
          查看完整测试页面
        </a>
      </div>
    </div>
  );
}
