'use client'

export default function SettingsPage() {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>시스템</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>설정</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>환경변수는 Vercel 대시보드에서 설정하세요</p>

      {/* 안내 */}
      <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 14, padding: '18px', marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>🔒 API 키 설정 방법</p>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 0 }}>
          API 키는 <strong style={{ color: 'var(--text)' }}>Vercel 환경변수</strong>에 설정해요.<br />
          사이트 UI에 키를 직접 입력하는 방식은 보안상 사용하지 않아요.
        </p>
      </div>

      {/* 링크 버튼들 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[
          { href: 'https://vercel.com/dashboard', icon: '🚀', label: 'Vercel 대시보드 → 환경변수 설정', desc: 'Settings → Environment Variables' },
          { href: 'https://supabase.com/dashboard', icon: '🗄️', label: 'Supabase 대시보드 → API 키 확인', desc: 'Settings → API Keys' },
          { href: 'https://solapi.com', icon: '💬', label: '솔라피 → 문자 API 키 발급', desc: '문자 발송 서비스' },
          { href: 'https://business.kakao.com', icon: '💛', label: '카카오 비즈 → 알림톡 키 발급', desc: '카카오 알림톡 서비스' },
        ].map(l => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)' }}
          >
            <span style={{ fontSize: 22 }}>{l.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{l.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{l.desc}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 16 }}>→</span>
          </a>
        ))}
      </div>

      {/* .env.local 예시 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px' }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>📄 .env.local 설정 예시</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
          아래 키를 <strong>.env.local</strong> 파일에 입력 후 Vercel 환경변수에 그대로 등록하세요.
        </p>
        <pre style={{
          background: 'var(--bg)', borderRadius: 10, padding: '14px',
          fontSize: 12, color: 'var(--text2)', lineHeight: 1.9,
          overflowX: 'auto', fontFamily: 'monospace',
        }}>{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_FROM=`}</pre>
      </div>
    </div>
  )
}
