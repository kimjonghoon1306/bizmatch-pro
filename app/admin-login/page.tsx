'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'bizmatch_admin_auth'
const PW_KEY = 'bizmatch_admin_pw'
const DEFAULT_PW = '123456'

function getStoredPw() {
  if (typeof window === 'undefined') return DEFAULT_PW
  return localStorage.getItem(PW_KEY) || DEFAULT_PW
}

export default function AdminLoginPage() {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mode, setMode] = useState<'login' | 'change'>('login')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [changed, setChanged] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true') {
      router.replace('/dashboard')
    }
  }, [router])

  function handleLogin() {
    if (!pw.trim()) { triggerError('비밀번호를 입력하세요'); return }
    if (pw === getStoredPw()) {
      setSuccess(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      setTimeout(() => router.replace('/dashboard'), 1200)
    } else {
      triggerError('비밀번호가 틀렸어요')
      setPw('')
    }
  }

  function handleChangePw() {
    if (!pw.trim()) { triggerError('현재 비밀번호를 입력하세요'); return }
    if (pw !== getStoredPw()) { triggerError('현재 비밀번호가 틀렸어요'); setPw(''); return }
    if (newPw.length < 4) { triggerError('새 비밀번호는 4자 이상이어야 해요'); return }
    if (newPw !== newPw2) { triggerError('새 비밀번호가 일치하지 않아요'); return }
    localStorage.setItem(PW_KEY, newPw)
    setChanged(true)
    setPw(''); setNewPw(''); setNewPw2('')
    setTimeout(() => { setChanged(false); setMode('login') }, 2000)
  }

  function triggerError(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
    setTimeout(() => setError(''), 3000)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleChangePw()
  }

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: `${(i * 47 + 13) % 100}%`,
    y: `${(i * 61 + 9) % 100}%`,
    size: 6 + (i % 4) * 5,
    color: ['#6c63ff','#f472b6','#22c55e','#f59e0b','#38bdf8','#fb7185','#a78bfa'][i % 7],
    dur: 3 + (i % 4),
    delay: i * 0.3,
    shape: i % 3,
  }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{background:#080814;font-family:'Outfit','Pretendard Variable',sans-serif}

        .login-root {
          min-height:100vh;
          background: radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #080814 50%),
                      radial-gradient(ellipse at 80% 20%, #0f1a30 0%, transparent 60%);
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;position:relative;padding:20px;
        }

        /* GRID BG */
        .grid-bg {
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(108,99,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove { 0%{transform:translateY(0)} 100%{transform:translateY(48px)} }

        /* PARTICLES */
        .particle {
          position:absolute;pointer-events:none;
          animation: floatP var(--dur) ease-in-out var(--delay) infinite alternate;
        }
        @keyframes floatP {
          0%{transform:translateY(0) rotate(0deg) scale(1);opacity:0.4}
          100%{transform:translateY(-28px) rotate(200deg) scale(1.3);opacity:0.8}
        }

        /* GLOW ORBS */
        .orb {
          position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;
          animation:orbPulse var(--dur) ease-in-out infinite alternate;
        }
        @keyframes orbPulse {
          0%{transform:scale(1);opacity:0.4}
          100%{transform:scale(1.3);opacity:0.7}
        }

        /* CARD */
        .login-card {
          position:relative;z-index:10;
          width:100%;max-width:420px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:28px;
          padding:40px 36px;
          backdrop-filter:blur(20px);
          box-shadow:0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes cardIn {
          from{opacity:0;transform:translateY(40px) scale(0.9)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        .shake { animation: shakeIt 0.5s ease both !important; }
        @keyframes shakeIt {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-8px)}
          80%{transform:translateX(8px)}
        }

        /* LOGO */
        .logo-wrap {
          text-align:center;margin-bottom:32px;
        }
        .logo-icon {
          width:72px;height:72px;border-radius:22px;
          background:linear-gradient(135deg,#6c63ff,#f472b6);
          display:inline-flex;align-items:center;justify-content:center;
          font-size:34px;margin-bottom:14px;
          box-shadow:0 8px 32px rgba(108,99,255,0.5);
          animation:logoFloat 3s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%,100%{transform:translateY(0) rotate(-3deg)}
          50%{transform:translateY(-8px) rotate(3deg)}
        }
        .logo-title {
          font-size:26px;font-weight:900;letter-spacing:-1px;
          background:linear-gradient(135deg,#a78bfa,#f472b6,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          margin-bottom:4px;
        }
        .logo-sub { font-size:13px;color:rgba(255,255,255,0.4);font-weight:500; }

        /* TABS */
        .mode-tabs {
          display:flex;background:rgba(255,255,255,0.05);
          border-radius:12px;padding:4px;margin-bottom:28px;
          border:1px solid rgba(255,255,255,0.08);
        }
        .mode-tab {
          flex:1;padding:9px;border-radius:8px;border:none;
          background:transparent;color:rgba(255,255,255,0.4);
          font-family:inherit;font-size:13px;font-weight:700;
          cursor:pointer;transition:all 0.2s;
        }
        .mode-tab.active {
          background:linear-gradient(135deg,#6c63ff,#8b5cf6);
          color:#fff;
          box-shadow:0 4px 12px rgba(108,99,255,0.4);
        }

        /* INPUT */
        .field { margin-bottom:16px; }
        .field label {
          display:block;font-size:12px;font-weight:700;
          color:rgba(255,255,255,0.5);margin-bottom:7px;letter-spacing:0.5px;
          text-transform:uppercase;
        }
        .input-wrap { position:relative; }
        .input-wrap input {
          width:100%;background:rgba(255,255,255,0.06);
          border:1.5px solid rgba(255,255,255,0.1);
          border-radius:12px;padding:14px 44px 14px 16px;
          font-family:inherit;font-size:16px;color:#fff;outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .input-wrap input::placeholder{color:rgba(255,255,255,0.25)}
        .input-wrap input:focus {
          border-color:#6c63ff;
          box-shadow:0 0 0 3px rgba(108,99,255,0.2);
        }
        .eye-btn {
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:rgba(255,255,255,0.4);font-size:18px;padding:0;
          transition:color 0.2s;
        }
        .eye-btn:hover{color:rgba(255,255,255,0.8)}

        /* ERROR */
        .error-msg {
          background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);
          border-radius:10px;padding:10px 14px;margin-bottom:14px;
          font-size:13px;color:#fca5a5;font-weight:600;
          animation:fadeIn 0.2s ease;
        }
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

        /* SUCCESS */
        .success-msg {
          background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);
          border-radius:10px;padding:10px 14px;margin-bottom:14px;
          font-size:13px;color:#86efac;font-weight:600;
          animation:fadeIn 0.2s ease;
        }

        /* BTN */
        .login-btn {
          width:100%;padding:16px;border-radius:14px;border:none;
          background:linear-gradient(135deg,#6c63ff,#8b5cf6);
          color:#fff;font-family:inherit;font-size:17px;font-weight:800;
          cursor:pointer;letter-spacing:-0.3px;
          transition:all 0.2s;margin-top:8px;
          box-shadow:0 8px 24px rgba(108,99,255,0.4);
          position:relative;overflow:hidden;
        }
        .login-btn::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
        }
        .login-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(108,99,255,0.5)}
        .login-btn:active{transform:scale(0.98)}
        .login-btn.success-btn {
          background:linear-gradient(135deg,#22c55e,#16a34a);
          box-shadow:0 8px 24px rgba(34,197,94,0.4);
        }

        /* HINT */
        .hint {
          text-align:center;margin-top:20px;
          font-size:12px;color:rgba(255,255,255,0.25);font-weight:500;
        }
        .hint strong{color:rgba(255,255,255,0.5)}

        /* SVG DECO */
        .deco-svg {
          position:absolute;pointer-events:none;opacity:0.12;
          animation:decoSpin var(--dur) linear infinite;
        }
        @keyframes decoSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        @media(max-width:480px){
          .login-card{padding:32px 24px;border-radius:22px}
          .logo-icon{width:60px;height:60px;font-size:28px}
          .logo-title{font-size:22px}
        }
      `}</style>

      <div className="login-root">
        {/* GRID */}
        <div className="grid-bg" />

        {/* GLOW ORBS */}
        <div className="orb" style={{ width: 400, height: 400, top: '-10%', left: '-10%', background: '#6c63ff', '--dur': '6s' } as React.CSSProperties} />
        <div className="orb" style={{ width: 300, height: 300, bottom: '-5%', right: '-5%', background: '#f472b6', '--dur': '8s' } as React.CSSProperties} />
        <div className="orb" style={{ width: 200, height: 200, top: '50%', right: '20%', background: '#38bdf8', '--dur': '5s' } as React.CSSProperties} />

        {/* SVG DECO */}
        <svg className="deco-svg" style={{ top: '10%', right: '8%', width: 120, height: 120, '--dur': '20s' } as React.CSSProperties} viewBox="0 0 120 120">
          <polygon points="60,5 115,90 5,90" fill="none" stroke="#6c63ff" strokeWidth="2" />
          <polygon points="60,20 100,85 20,85" fill="none" stroke="#f472b6" strokeWidth="1" />
        </svg>
        <svg className="deco-svg" style={{ bottom: '12%', left: '6%', width: 100, height: 100, '--dur': '15s', animationDirection: 'reverse' } as React.CSSProperties} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#38bdf8" strokeWidth="2" rx="8" />
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="#f59e0b" strokeWidth="1" rx="4" />
        </svg>
        <svg className="deco-svg" style={{ top: '60%', right: '5%', width: 80, height: 80, '--dur': '12s' } as React.CSSProperties} viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 4" />
          <circle cx="40" cy="40" r="20" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
        </svg>

        {/* PARTICLES */}
        {particles.map((p, i) => (
          <div key={i} className="particle" style={{
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '4px' : '2px',
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
          } as React.CSSProperties} />
        ))}

        {/* CARD */}
        <div className={`login-card${shake ? ' shake' : ''}`}>
          {/* LOGO */}
          <div className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <div className="logo-title">BizMatch PRO</div>
            <div className="logo-sub">관리자 전용 시스템</div>
          </div>

          {/* MODE TABS */}
          <div className="mode-tabs">
            <button className={`mode-tab${mode === 'login' ? ' active' : ''}`} onClick={() => { setMode('login'); setError('') }}>
              🔐 로그인
            </button>
            <button className={`mode-tab${mode === 'change' ? ' active' : ''}`} onClick={() => { setMode('change'); setError('') }}>
              🔑 비번 변경
            </button>
          </div>

          {/* ERROR */}
          {error && <div className="error-msg">⚠️ {error}</div>}
          {changed && <div className="success-msg">✅ 비밀번호가 변경되었어요!</div>}
          {success && <div className="success-msg">✅ 로그인 성공! 이동 중...</div>}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              <div className="field">
                <label>비밀번호</label>
                <div className="input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="관리자 비밀번호 입력"
                    autoFocus
                  />
                  <button className="eye-btn" onClick={() => setShow(!show)} type="button">
                    {show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                className={`login-btn${success ? ' success-btn' : ''}`}
                onClick={handleLogin}
              >
                {success ? '✅ 로그인 성공!' : '🚀 관리자 입장'}
              </button>
              <div className="hint">초기 비밀번호: <strong>123456</strong></div>
            </>
          )}

          {/* CHANGE MODE */}
          {mode === 'change' && (
            <>
              <div className="field">
                <label>현재 비밀번호</label>
                <div className="input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="현재 비밀번호"
                  />
                  <button className="eye-btn" onClick={() => setShow(!show)} type="button">
                    {show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="field">
                <label>새 비밀번호 (4자 이상)</label>
                <div className="input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="새 비밀번호"
                  />
                </div>
              </div>
              <div className="field">
                <label>새 비밀번호 확인</label>
                <div className="input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={newPw2}
                    onChange={e => setNewPw2(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="새 비밀번호 재입력"
                  />
                </div>
              </div>
              <button className="login-btn" onClick={handleChangePw}>
                🔑 비밀번호 변경하기
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
