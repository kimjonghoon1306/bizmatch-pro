'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const MEMBER_KEY = 'bizmatch_member_auth'
const MEMBER_PW_KEY = 'bizmatch_member_pw'
const MEMBER_INFO_KEY = 'bizmatch_member_info'

type Panel = 'home' | 'login' | 'register' | 'findId' | 'findPw' | 'mypage'

interface MemberInfo {
  name: string
  email: string
  phone: string
  joinDate: string
  apiKey: string
}

function NeuralBg() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let w = (c.width = window.innerWidth)
    let h = (c.height = window.innerHeight)
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.5,
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      })
      pts.forEach((a, i) =>
        pts.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 110) * 0.2})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      )
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(139,92,246,0.45)'; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onR = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight }
    window.addEventListener('resize', onR)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

function Field({ label, value, onChange, type = 'text', placeholder, readonly }: {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; placeholder?: string; readonly?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const isPw = type === 'password'
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readonly}
          type={isPw && !showPw ? 'password' : 'text'}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: isPw ? '13px 44px 13px 15px' : '13px 15px',
            background: 'var(--bg3)',
            border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12, fontFamily: 'inherit', fontSize: 15,
            color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
            boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
            cursor: readonly ? 'default' : 'text',
          }}
        />
        {isPw && !readonly && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)', padding: 0, lineHeight: 1 }}
          >
            {showPw ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled }: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '14px', borderRadius: 13, border: 'none',
    fontFamily: 'inherit', fontSize: 15, fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', marginBottom: 10, opacity: disabled ? 0.6 : 1,
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff', boxShadow: '0 6px 20px var(--accent-glow)' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border2)' },
    danger: { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  )
}

function ErrMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>⚠️ {msg}</div>
}

function OkMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✅ {msg}</div>
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5, padding: 0, fontFamily: 'inherit' }}>
      ← 돌아가기
    </button>
  )
}

export default function MemberAuthPage() {
  const [panel, setPanel] = useState<Panel>('home')
  const [browsing, setBrowsing] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [findVal, setFindVal] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [regDone, setRegDone] = useState(false)
  const [findDone, setFindDone] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editApiKey, setEditApiKey] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')

  useEffect(() => {
    const authed = localStorage.getItem(MEMBER_KEY) === 'true'
    if (authed) {
      setLoggedIn(true)
      const info = localStorage.getItem(MEMBER_INFO_KEY)
      if (info) setMemberInfo(JSON.parse(info))
    }
  }, [])

  function reset() {
    setEmail(''); setPw(''); setPw2(''); setName(''); setPhone('')
    setApiKey(''); setFindVal(''); setError(''); setOk('')
    setRegDone(false); setFindDone(false)
  }

  function go(p: Panel) { reset(); setPanel(p) }
  function trigErr(msg: string) { setError(msg); setTimeout(() => setError(''), 3500) }
  function trigOk(msg: string) { setOk(msg); setTimeout(() => setOk(''), 3500) }

  function doLogin() {
    if (!email.includes('@')) { trigErr('올바른 이메일을 입력하세요'); return }
    if (!pw.trim()) { trigErr('비밀번호를 입력하세요'); return }
    const stored = localStorage.getItem(MEMBER_PW_KEY)
    const info = localStorage.getItem(MEMBER_INFO_KEY)
    if (!stored || !info) { trigErr('가입된 계정이 없어요. 먼저 회원가입 해주세요'); return }
    const mi: MemberInfo = JSON.parse(info)
    if (mi.email !== email || stored !== pw) { trigErr('이메일 또는 비밀번호가 틀렸어요'); return }
    localStorage.setItem(MEMBER_KEY, 'true')
    setLoggedIn(true); setMemberInfo(mi)
    trigOk('로그인 성공!'); setTimeout(() => go('home'), 800)
  }

  function doRegister() {
    if (!name.trim()) { trigErr('이름을 입력하세요'); return }
    if (!email.includes('@')) { trigErr('올바른 이메일을 입력하세요'); return }
    if (!phone.trim()) { trigErr('전화번호를 입력하세요'); return }
    if (pw.length < 6) { trigErr('비밀번호 6자 이상'); return }
    if (pw !== pw2) { trigErr('비밀번호가 일치하지 않아요'); return }
    const info: MemberInfo = { name, email, phone, joinDate: new Date().toLocaleDateString('ko-KR'), apiKey: '' }
    localStorage.setItem(MEMBER_PW_KEY, pw)
    localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info))
    setRegDone(true)
  }

  function doFind() {
    if (!findVal.trim()) { trigErr('입력하세요'); return }
    setFindDone(true)
  }

  function doLogout() {
    localStorage.removeItem(MEMBER_KEY)
    setLoggedIn(false); setMemberInfo(null); go('home')
  }

  function saveMypage() {
    if (!editName.trim()) { trigErr('이름을 입력하세요'); return }
    if (newPw && newPw.length < 6) { trigErr('새 비밀번호 6자 이상'); return }
    if (newPw && newPw !== newPw2) { trigErr('비밀번호가 일치하지 않아요'); return }
    const updated: MemberInfo = { ...memberInfo!, name: editName, phone: editPhone, apiKey: editApiKey }
    localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(updated))
    if (newPw) localStorage.setItem(MEMBER_PW_KEY, newPw)
    setMemberInfo(updated); trigOk('저장되었어요!')
    setNewPw(''); setNewPw2('')
  }

  function openMypage() {
    if (!memberInfo) return
    setEditName(memberInfo.name); setEditPhone(memberInfo.phone); setEditApiKey(memberInfo.apiKey || '')
    setNewPw(''); setNewPw2('')
    go('mypage')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{background:var(--bg);color:var(--text);font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif}
        @keyframes popIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes appear{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatIcon{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes dotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
        .page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;background:var(--bg)}
        .card{position:relative;z-index:10;width:100%;max-width:440px;background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:40px 36px;box-shadow:0 24px 64px rgba(0,0,0,0.12);animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both}
        .syne{font-family:'Syne',sans-serif}
        .grad{background:linear-gradient(135deg,#8b5cf6,#ec4899,#f59e0b);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 5s ease infinite}
        .tag{display:inline-flex;align-items:center;gap:7px;background:var(--surface2);border:1px solid var(--border2);border-radius:100px;padding:5px 13px;font-size:11px;font-weight:700;color:var(--text2);margin-bottom:18px}
        .live-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:dotPulse 2s infinite}
        .mgrid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:11px}
        .mbtn{padding:20px 14px;border-radius:18px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;font-family:inherit;text-align:left;transition:all .2s;width:100%}
        .mbtn:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px var(--accent-glow)}
        .mbtn:active{transform:scale(.98)}
        .micon{font-size:26px;display:block;margin-bottom:10px;animation:floatIcon 3s ease-in-out infinite}
        .mlbl{font-size:14px;font-weight:800;color:var(--text);display:block;margin-bottom:2px}
        .mdesc{font-size:11px;color:var(--text3)}
        .browse-btn{width:100%;padding:13px;border-radius:14px;border:1.5px dashed var(--border2);background:transparent;color:var(--text2);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .browse-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-bg)}
        .info-pill{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--text3);background:var(--bg3);border:1px solid var(--border);border-radius:100px;padding:3px 10px;margin-bottom:8px;cursor:pointer;transition:all .2s}
        .info-pill:hover{color:var(--accent);border-color:var(--accent)}
        .find-link{background:none;border:none;color:var(--accent);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:3px}
        .browse-bar{position:fixed;top:0;left:0;right:0;z-index:300;background:linear-gradient(135deg,var(--accent),#ec4899);padding:11px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .browse-lock{position:fixed;inset:0;top:46px;z-index:290;cursor:not-allowed}
        .avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#ec4899);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;box-shadow:0 8px 24px var(--accent-glow)}
        .sec-title{font-size:12px;font-weight:800;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin:20px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--border)}
        .api-box{background:var(--accent-bg);border:1px solid var(--accent);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:14px}
        .feats{display:flex;gap:14px;justify-content:center;margin-top:18px;flex-wrap:wrap}
        .feat{font-size:11px;color:var(--text3);display:flex;align-items:center;gap:4px}
        .welcome-box{background:var(--accent-bg);border:1px solid var(--accent);border-radius:14px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;gap:10px}
        @media(max-width:480px){.card{padding:28px 18px;border-radius:22px}.mgrid{gap:9px}.mbtn{padding:16px 12px}}
      `}</style>

      <NeuralBg />

      <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 100, display: 'flex', alignItems: 'center', gap: 8 }}>
        {loggedIn && (
          <>
            <button onClick={openMypage} style={{ padding: '7px 14px', borderRadius: 100, background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              👤 {memberInfo?.name}
            </button>
            <button onClick={doLogout} style={{ padding: '7px 12px', borderRadius: 100, background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              나가기
            </button>
          </>
        )}
        <ThemeToggle />
      </div>

      <Link href="/admin-login" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100, width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none', boxShadow: 'var(--shadow-sm)', transition: 'all .2s' }} title="관리자 전용">
        ⚙️
      </Link>

      {browsing && (
        <>
          <div className="browse-bar">
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, flex: 1 }}>👀 둘러보기 중 — 실제 기능은 로그인 후 사용 가능해요</p>
            <button onClick={() => { setBrowsing(false); go('login') }} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>🔐 로그인</button>
            <button onClick={() => setBrowsing(false)} style={{ padding: '6px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
          </div>
          <div className="browse-lock" onClick={e => { e.preventDefault(); e.stopPropagation() }} />
        </>
      )}

      <div className="page">
        <div className="card">

          {panel === 'home' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <div className="tag"><span className="live-dot" />사업자 모집 자동화 플랫폼</div>
              <h1 className="syne" style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.1, marginBottom: 10 }}>
                당신의 사업을<br /><span className="grad">자동으로</span><br />키우세요
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>네트워크·프랜차이즈·창업 모집을<br />스마트하게 자동화하는 플랫폼</p>

              {loggedIn ? (
                <div style={{ marginBottom: 12 }}>
                  <div className="welcome-box">
                    <span style={{ fontSize: 20 }}>👋</span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{memberInfo?.name}님, 환영해요!</p>
                      <p style={{ fontSize: 12, color: 'var(--text2)' }}>가입일: {memberInfo?.joinDate}</p>
                    </div>
                  </div>
                  <button className="mbtn" onClick={openMypage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                    <span style={{ fontSize: 24 }}>👤</span>
                    <div>
                      <span className="mlbl">마이페이지</span>
                      <span className="mdesc">정보 수정 · API 키 관리</span>
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  <div className="mgrid">
                    <div>
                      <div className="info-pill" onClick={() => alert('가입한 이메일과 비밀번호로 로그인하세요.\n아이디/비번 찾기 기능도 제공해요.')}>ℹ️ 로그인이란?</div>
                      <button className="mbtn" onClick={() => go('login')}>
                        <span className="micon" style={{ animationDelay: '0s' }}>🔐</span>
                        <span className="mlbl">로그인</span>
                        <span className="mdesc">기존 계정으로 입장</span>
                      </button>
                    </div>
                    <div>
                      <div className="info-pill" onClick={() => alert('이름, 이메일, 전화번호, 비밀번호로\n30초 만에 가입! 무료로 시작하세요.')}>ℹ️ 회원가입이란?</div>
                      <button className="mbtn" onClick={() => go('register')}>
                        <span className="micon" style={{ animationDelay: '.4s' }}>✨</span>
                        <span className="mlbl">회원가입</span>
                        <span className="mdesc">지금 바로 시작하기</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="info-pill" onClick={() => alert('로그인 없이 UI를 둘러볼 수 있어요.\n단, 실제 기능은 로그인 후 사용 가능해요.')}>ℹ️ 둘러보기란?</div>
                    <button className="browse-btn" onClick={() => setBrowsing(true)}>
                      <span>👀</span> 로그인 없이 둘러보기
                    </button>
                  </div>
                </>
              )}
              <div className="feats">
                {['📊 리드 관리', '✨ 랜딩 빌더', '💬 자동 메시지', '📈 전환 분석'].map(f => (
                  <span key={f} className="feat">{f}</span>
                ))}
              </div>
            </div>
          )}

          {panel === 'login' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <BackBtn onClick={() => go('home')} />
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
              <h2 className="syne" style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>로그인</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>다시 만나서 반가워요!</p>
              <ErrMsg msg={error} /><OkMsg msg={ok} />
              <Field label="이메일" value={email} onChange={setEmail} type="email" placeholder="example@email.com" />
              <Field label="비밀번호" value={pw} onChange={setPw} type="password" placeholder="비밀번호 입력" />
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <button className="find-link" onClick={() => go('findId')}>아이디 찾기</button>
                <button className="find-link" onClick={() => go('findPw')}>비밀번호 찾기</button>
              </div>
              <Btn onClick={doLogin}>🚀 로그인</Btn>
              <Btn onClick={() => go('register')} variant="ghost">계정이 없으신가요? 회원가입</Btn>
            </div>
          )}

          {panel === 'register' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <BackBtn onClick={() => go('home')} />
              {regDone ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 60, marginBottom: 14 }}>🎉</div>
                  <h2 className="syne" style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>가입 완료!</h2>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>BizMatch PRO 회원이 되셨어요!<br />이제 사업자 모집을 시작해보세요 🚀</p>
                  <Btn onClick={() => go('login')}>🔐 로그인하기</Btn>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
                  <h2 className="syne" style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>회원가입</h2>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>함께 성장할 파트너가 되어요!</p>
                  <ErrMsg msg={error} />
                  <Field label="이름" value={name} onChange={setName} placeholder="홍길동" />
                  <Field label="이메일" value={email} onChange={setEmail} type="email" placeholder="example@email.com" />
                  <Field label="전화번호" value={phone} onChange={setPhone} placeholder="010-0000-0000" />
                  <Field label="비밀번호 (6자 이상)" value={pw} onChange={setPw} type="password" placeholder="비밀번호" />
                  <Field label="비밀번호 확인" value={pw2} onChange={setPw2} type="password" placeholder="비밀번호 재입력" />
                  <Btn onClick={doRegister}>🎉 가입하기</Btn>
                  <Btn onClick={() => go('login')} variant="ghost">이미 계정이 있으신가요?</Btn>
                </>
              )}
            </div>
          )}

          {panel === 'findId' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <BackBtn onClick={() => go('login')} />
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <h2 className="syne" style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>아이디 찾기</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>가입 시 등록한 전화번호로 찾아드려요</p>
              <ErrMsg msg={error} />
              {findDone ? (
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--success)' }}>전화번호로 아이디를 전송했어요!</p>
                </div>
              ) : (
                <Field label="전화번호" value={findVal} onChange={setFindVal} placeholder="010-0000-0000" />
              )}
              {!findDone && <Btn onClick={doFind}>🔍 아이디 찾기</Btn>}
              <Btn onClick={() => go('login')} variant="ghost">로그인으로 돌아가기</Btn>
            </div>
          )}

          {panel === 'findPw' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <BackBtn onClick={() => go('login')} />
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔑</div>
              <h2 className="syne" style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>비밀번호 찾기</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>가입한 이메일로 재설정 링크를 보내드려요</p>
              <ErrMsg msg={error} />
              {findDone ? (
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--success)' }}>이메일로 재설정 링크를 보냈어요!</p>
                </div>
              ) : (
                <Field label="이메일" value={findVal} onChange={setFindVal} type="email" placeholder="가입한 이메일" />
              )}
              {!findDone && <Btn onClick={doFind}>📧 링크 보내기</Btn>}
              <Btn onClick={() => go('login')} variant="ghost">로그인으로 돌아가기</Btn>
            </div>
          )}

          {panel === 'mypage' && (
            <div style={{ animation: 'appear .4s ease both' }}>
              <BackBtn onClick={() => go('home')} />
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="avatar">👤</div>
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>마이페이지</h2>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>가입일: {memberInfo?.joinDate}</p>
              </div>
              <ErrMsg msg={error} /><OkMsg msg={ok} />
              <div className="sec-title">📋 기본 정보</div>
              <Field label="이름" value={editName} onChange={setEditName} placeholder="홍길동" />
              <Field label="이메일" value={memberInfo?.email || ''} readonly />
              <Field label="전화번호" value={editPhone} onChange={setEditPhone} placeholder="010-0000-0000" />
              <div className="sec-title">🔑 내 API 키 (개인 전용)</div>
              <div className="api-box">
                여기에 입력한 API 키는 <strong>본인만 사용</strong>해요.<br />
                관리자의 API 키와 완전히 분리된 개인 데이터 공간이에요.
              </div>
              <Field label="내 API 키" value={editApiKey} onChange={setEditApiKey} placeholder="개인 API 키 입력" />
              <div className="sec-title">🔐 비밀번호 변경 (선택)</div>
              <Field label="새 비밀번호 (6자 이상)" value={newPw} onChange={setNewPw} type="password" placeholder="변경하려면 입력" />
              <Field label="새 비밀번호 확인" value={newPw2} onChange={setNewPw2} type="password" placeholder="비밀번호 재입력" />
              <Btn onClick={saveMypage}>💾 저장하기</Btn>
              <Btn onClick={doLogout} variant="danger">🚪 로그아웃</Btn>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
