'use client'

import { useState, useEffect } from 'react'

const MEMBER_INFO_KEY = 'bizmatch_member_info'
const MEMBER_PW_KEY = 'bizmatch_member_pw'
const MEMBER_AI_KEY = 'bizmatch_member_ai'

interface MemberInfo {
  name: string
  email: string
  phone: string
  joinDate: string
}

interface AiKeys {
  gemini: string
  groq: string
  openai: string
}

const AI_PROVIDERS = [
  {
    key: 'gemini',
    label: 'Gemini API Key',
    badge: '무료',
    badgeColor: '#22c55e',
    placeholder: 'AIza...',
    link: 'https://aistudio.google.com/app/apikey',
    desc: 'Google AI Studio에서 무료 발급',
    icon: '🔵',
  },
  {
    key: 'groq',
    label: 'Groq API Key (Llama 3)',
    badge: '무료',
    badgeColor: '#22c55e',
    placeholder: 'gsk_...',
    link: 'https://console.groq.com/keys',
    desc: 'Groq Console에서 무료 발급',
    icon: '⚡',
  },
  {
    key: 'openai',
    label: 'OpenAI API Key (GPT-4o)',
    badge: '유료',
    badgeColor: '#f59e0b',
    placeholder: 'sk-...',
    link: 'https://platform.openai.com/api-keys',
    desc: 'OpenAI Platform에서 발급',
    icon: '🤖',
  },
]

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [aiKeys, setAiKeys] = useState<AiKeys>({ gemini: '', groq: '', openai: '' })
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
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
    const keys = localStorage.getItem(MEMBER_AI_KEY)
    if (keys) setAiKeys(JSON.parse(keys))
  }, [])

  function trigErr(msg: string) {
    setError(msg); setTimeout(() => setError(''), 3500)
  }

  function handleSave() {
    if (!loggedIn) { trigErr('로그인 후 저장 가능해요'); return }
    if (name && newPw && newPw.length < 6) { trigErr('비밀번호는 6자 이상이어야 해요'); return }
    if (newPw && newPw !== newPw2) { trigErr('비밀번호가 일치하지 않아요'); return }
    if (name.trim()) {
      const info: MemberInfo = { name, email, phone, joinDate }
      localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info))
    }
    if (newPw) localStorage.setItem(MEMBER_PW_KEY, newPw)
    localStorage.setItem(MEMBER_AI_KEY, JSON.stringify(aiKeys))
    setNewPw(''); setNewPw2('')
    setSaved(true); setTimeout(() => setSaved(false), 2500)
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

      {/* AI API 키 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>🤖 AI API 키</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          AI 글 생성에 사용되는 본인 API 키예요. 키는 이 기기에만 저장돼요.
        </p>
        {AI_PROVIDERS.map(p => (
          <div key={p.key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p.label}</label>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: `${p.badgeColor}22`, color: p.badgeColor }}>{p.badge}</span>
              </div>
              <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                🔗 발급받기
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showKeys[p.key] ? 'text' : 'password'}
                value={aiKeys[p.key as keyof AiKeys]}
                onChange={e => setAiKeys(prev => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)' }}
              >
                {showKeys[p.key] ? '🙈' : '👁️'}
              </button>
            </div>
            {aiKeys[p.key as keyof AiKeys] && (
              <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>✅ 저장된 키 있음</p>
            )}
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>💡 {p.desc}</p>
          </div>
        ))}
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

      {joinDate && (
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
          가입일: {joinDate}
        </div>
      )}
    </div>
  )
}
