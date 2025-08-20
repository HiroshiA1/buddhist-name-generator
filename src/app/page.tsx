'use client'

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section style={{ padding: 'var(--spacing-3xl) 0' }}>
        <div className="container text-center space-y-8">
          <div className="fade-in" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <img 
              src="/buddhist-name-gene_logomark.png" 
              alt="法名ジェネレーター" 
              style={{ 
                height: '80px', 
                width: 'auto', 
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
          <h2 className="h1 fade-in">
            故人の人生に寄り添う、<br />
            <span style={{ color: 'var(--color-text-secondary)' }}>AI法名生成サービス</span>
          </h2>
          <p className="text-secondary" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            故人の生き様や歩んだ軌跡から最適な法名を提案します。
          </p>
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <a href="/generate" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: 'var(--spacing-lg) var(--spacing-2xl)' }}>
              法名を生成する
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: 'var(--spacing-3xl) 0' }}>
        <div className="container">
          <h3 className="h2 text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>主な機能</h3>
          <div className="grid grid-md-3 fade-in">
            <div className="card">
              <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>AIによる法名生成</h4>
              <p className="text-secondary">故人の詳細情報から、浄土真宗の教義に沿った法名を複数案提案します。</p>
            </div>
            <div className="card">
              <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>カスタマイズ機能</h4>
              <p className="text-secondary">生成された法名案に対し、特定の漢字の追加・除外、俗名からの文字含めが可能です。</p>
            </div>
            <div className="card">
              <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>履歴保存・管理</h4>
              <p className="text-secondary">生成した法名と入力情報をアカウントに紐づけて保存し、いつでも確認できます。</p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer style={{ backgroundColor: 'white', borderTop: '1px solid var(--border-color)', padding: 'var(--spacing-xl) 0', textAlign: 'center' }}>
        <div className="container">
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            &copy; 2025 浄土真宗 法名ジェネレーター. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}