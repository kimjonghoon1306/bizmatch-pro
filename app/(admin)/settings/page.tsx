'use client'

import { useState, useEffect } from 'react'

const MEMBER_INFO_KEY = 'bizmatch_member_info'
const MEMBER_PW_KEY = 'bizmatch_member_pw'

interface MemberInfo {
  name: string
  email: string
  phone: string
  joinDate: string
}

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const info = localStorage.getItem(MEMBER_INFO_KEY)
    if (info) {
      const mi: MemberInfo = JSON.parse(info)
      setName(mi.name); setPhone(mi.phone)
      setEmail(mi.email); setJoinDate(mi.joinDate)
      setLoggedIn(true)
    }
  }, [])

  function trigErr(msg: string) {
    setError(msg); setTimeout(() => setError(''), 3500)
  }

  function handleSave() {
    if (!name.trim()) { trigErr('이름을 입력하세요'); return }
    if (newPw && newPw.length < 6) { trigErr('비밀번호는 6자 이상이어야 해요'); return }
    if (newPw && newPw !== newPw2) { trigErr('비밀번호가 일치하지 않아요'); return }

    const info: MemberInfo = { name, email, phone, joinDate }
    localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info))
    if (newPw) localStorage.setItem(MEMBER_PW_KEY, newPw)
    setNewPw(''); setNewPw2('')
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  if (!loggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <p style={{ fontSize: 15, fontWeight: 700 }}>로그인 후 이용 가능해요</p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)',
    border: '1.5px solid var(--border)', borderRadius: 10,
    padding: '13px 15px', fontFamily: 'inherit',
    fontSize: 15, color: 'var(--text)', outline: 'none',
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>내 계정</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 24 }}>설정</h1>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>👤 기본 정보</p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>이름</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>이메일</label>
          <input value={email} readOnly style={{ ...inputStyle, cursor: 'default', opacity: 0.6 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>전화번호</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>🔐 비밀번호 변경</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>변경하지 않으려면 비워두세요</p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>새 비밀번호 (6자 이상)</label>
          <div style={{ position: 'relative' }}>
            <input value={newPw} onChange={e => setNewPw(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="새 비밀번호" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button onClick={() => setShowPw(!showPw)} type="button" style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)' }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>새 비밀번호 확인</label>
          <input value={newPw2} onChange={e => setNewPw2(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="비밀번호 재입력" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>

      {/* 저장 */}
      <button onClick={handleSave} style={{
        width: '100%', padding: '16px', borderRadius: 12, border: 'none',
        background: saved ? 'var(--success)' : 'var(--accent)',
        color: '#fff', fontSize: 16, fontWeight: 800,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: `0 4px 16px ${saved ? 'rgba(34,197,94,0.3)' : 'var(--accent-glow)'}`,
        transition: 'all 0.2s',
      }}>
        {saved ? '✅ 저장 완료!' : '💾 저장하기'}
      </button>

      {/* 가입 정보 */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        가입일: {joinDate}
      </div>
    </div>
  )
}
