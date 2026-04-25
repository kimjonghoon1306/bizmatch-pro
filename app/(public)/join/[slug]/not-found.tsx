export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center', padding: 24,
      background: 'var(--bg)', color: 'var(--text)',
    }}>
      <p style={{ fontSize: 64, marginBottom: 16 }}>😢</p>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>페이지를 찾을 수 없어요</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)' }}>
        링크가 만료되었거나 잘못된 주소예요
      </p>
    </div>
  )
}
