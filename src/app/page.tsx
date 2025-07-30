export default function Home() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section style={{ padding: 'var(--spacing-3xl) 0' }}>
        <div className="container text-center space-y-8">
          <h2 className="h1 fade-in">
            故人の人生に寄り添う、<br />
            <span style={{ color: 'var(--color-text-secondary)' }}>AI法名生成サービス</span>
          </h2>
          <p className="text-secondary" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            浄土真宗の教義に基づき、故人の人柄や趣味・特技から最適な法名をAIがご提案します。
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

      {/* Pricing Section */}
      <section style={{ padding: 'var(--spacing-3xl) 0', backgroundColor: 'white' }}>
        <div className="container">
          <h3 className="h2 text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>料金プラン</h3>
          <div className="grid grid-md-3 fade-in">
            {/* Free Plan */}
            <div className="card" style={{ border: '2px solid var(--color-sand-beige)' }}>
              <div className="text-center space-y-6">
                <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>無料プラン</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'var(--font-weight-light)', color: 'var(--color-charcoal)' }}>¥0</div>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)' }} className="space-y-4">
                  <li>• 初回3回まで法名生成が可能</li>
                  <li>• 基本機能のみ</li>
                </ul>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  無料で始める
                </button>
              </div>
            </div>

            {/* Basic Plan */}
            <div className="card" style={{ border: '2px solid var(--color-sand-beige)', backgroundColor: 'var(--color-sand-beige-light)' }}>
              <div className="text-center space-y-6">
                <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>ベーシックプラン</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'var(--font-weight-light)', color: 'var(--color-charcoal)' }}>
                  月額 ¥480
                </div>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)' }} className="space-y-4">
                  <li>• 月10回まで生成可能</li>
                  <li>• 生成履歴の保存</li>
                  <li>• PDFエクスポート機能</li>
                </ul>
                <button className="btn btn-secondary" style={{ width: '100%', backgroundColor: 'var(--color-charcoal)', color: 'white' }}>
                  ベーシックプランに登録
                </button>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="card" style={{ border: '2px solid var(--color-sand-beige)' }}>
              <div className="text-center space-y-6">
                <h4 className="h3" style={{ color: 'var(--color-charcoal)' }}>プロフェッショナルプラン</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'var(--font-weight-light)', color: 'var(--color-charcoal)' }}>
                  月額 ¥1,980
                </div>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)' }} className="space-y-4">
                  <li>• 法名生成回数無制限</li>
                  <li>• 全機能を利用可能</li>
                </ul>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  プロフェッショナルプランに登録
                </button>
              </div>
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