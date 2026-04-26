'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const STORAGE_KEY = 'bizmatch_admin_auth'
const PW_KEY = 'bizmatch_admin_pw'
const DEFAULT_PW = '123456'

function getStoredPw() {
  if (typeof window === 'undefined') return DEFAULT_PW
  return localStorage.getItem(PW_KEY) || DEFAULT_PW
}

export default function AdminLoginPage() {
  const [tab, setTab] = useState<'login' | 'changePw'>('login')
  const [pw, setPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pwChanged, setPwChanged] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true') {
      router.replace('/dashboard')
    }
  }, [router])

  function trigErr(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
    setTimeout(() => setError(''), 3000)
  }

  function handleLogin() {
    if (!pw.trim()) { trigErr('비밀번호를 입력하세요'); return }
    if (pw === getStoredPw()) {
      setSuccess(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      setTimeout(() => router.replace('/dashboard'), 900)
    } else {
      setPw(''); trigErr('비밀번호가 틀렸어요')
    }
  }

  function handleChangePw() {
    if (!pw.trim()) { trigErr('현재 비밀번호를 입력하세요'); return }
    if (pw !== getStoredPw()) { setPw(''); trigErr('현재 비밀번호가 틀렸어요'); return }
    if (newPw.length < 4) { trigErr('새 비밀번호는 4자 이상이어야 해요'); return }
    if (newPw !== newPw2) { trigErr('새 비밀번호가 일치하지 않아요'); return }
    localStorage.setItem(PW_KEY, newPw)
    setPwChanged(true)
    setPw(''); setNewPw(''); setNewPw2('')
    setTimeout(() => { setPwChanged(false); setTab('login') }, 2000)
  }

  function switchTab(t: 'login' | 'changePw') {
    setTab(t); setError(''); setPw(''); setNewPw(''); setNewPw2('')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent }
        body { background:var(--bg); color:var(--text); font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif }

        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-7px)} 80%{transform:translateX(7px)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes orbPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.15} 50%{transform:translate(-50%,-50%) scale(1.25);opacity:.25} }
        @keyframes floatLogo { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-8px) rotate(3deg)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes successPop { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes gridScroll { 0%{transform:translateY(0)} 100%{transform:translateY(52px)} }
        @keyframes lineMove { 0%{transform:translateX(-100%)} 100%{transform:translateX(100vw)} }

        .root {
          min-height:100vh;
          display:flex;align-items:center;justify-content:center;
          padding:20px;position:relative;overflow:hidden;
          background:var(--bg);
        }

        /* 그리드 배경 */
        .grid-bg {
          position:fixed;inset:0;z-index:0;pointer-events:none;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size:56px 56px;
          animation:gridScroll 20s linear infinite;
          opacity:.6;
        }

        /* 빛나는 라인 */
        .scan-line {
          position:fixed;top:0;bottom:0;width:2px;z-index:0;pointer-events:none;
          background:linear-gradient(to bottom,transparent,var(--accent),transparent);
          opacity:.15;
          animation:lineMove 8s linear infinite;
        }

        /* 글로우 오브 */
        .orb {
          position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;
          transform:translate(-50%,-50%);
          animation:orbPulse var(--dur) ease-in-out infinite;
        }

        .card {
          position:relative;z-index:10;
          width:100%;max-width:420px;
          background:var(--surface);
          border:1px solid var(--border2);
          border-radius:24px;
          padding:40px 36px;
          box-shadow:0 32px 80px rgba(0,0,0,0.2);
          animation:cardIn .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .card.shake { animation:shake .5s ease both !important }

        /* 상단 장식 라인 */
        .card::before {
          content:'';
          position:absolute;top:0;left:20px;right:20px;height:1px;
          background:linear-gradient(90deg,transparent,var(--accent),transparent);
        }

        .logo-wrap { text-align:center;margin-bottom:32px }
        .logo-icon {
          width:64px;height:64px;border-radius:18px;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          display:inline-flex;align-items:center;justify-content:center;
          font-size:28px;margin-bottom:14px;
          box-shadow:0 8px 28px rgba(139,92,246,.4);
          animation:floatLogo 4s ease-in-out infinite;
        }
        .logo-title {
          font-family:'Syne',sans-serif;
          font-size:22px;font-weight:900;letter-spacing:-1px;
          color:var(--text);margin-bottom:3px;
        }
        .logo-badge {
          display:inline-block;font-size:10px;font-weight:800;
          background:var(--accent-bg);color:var(--accent);
          border:1px solid var(--accent);
          padding:3px 10px;border-radius:100px;letter-spacing:1px;
        }

        /* 탭 */
        .tabs {
          display:flex;background:var(--bg3);border-radius:12px;padding:4px;gap:4px;
          margin-bottom:28px;
        }
        .tab {
          flex:1;padding:10px;border-radius:8px;border:none;
          background:transparent;color:var(--text3);
          font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;
        }
        .tab.on {
          background:var(--surface);color:var(--text);
          box-shadow:0 2px 8px rgba(0,0,0,.1);
        }

        /* 인풋 */
        .field { margin-bottom:16px }
        .field label {
          display:block;font-size:11px;font-weight:800;
          color:var(--text3);letter-spacing:1.5px;
          text-transform:uppercase;margin-bottom:7px;
        }
        .input-wrap { position:relative }
        .inp {
          width:100%;padding:14px 46px 14px 16px;
          background:var(--bg3);border:1.5px solid var(--border);
          border-radius:12px;font-family:inherit;font-size:15px;
          color:var(--text);outline:none;transition:all .2s;
        }
        .inp:focus { border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow) }
        .inp::placeholder { color:var(--text3) }
        .eye {
          position:absolute;right:14px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          font-size:16px;color:var(--text3);padding:0;line-height:1;
        }

        /* 에러 */
        .err {
          background:var(--danger-bg);border:1px solid var(--danger);
          border-radius:10px;padding:10px 14px;margin-bottom:14px;
          font-size:13px;color:var(--danger);font-weight:600;
          animation:fadeSlide .2s ease;
        }
        .ok-msg {
          background:var(--success-bg);border:1px solid var(--success);
          border-radius:10px;padding:10px 14px;margin-bottom:14px;
          font-size:13px;color:var(--success);font-weight:600;
          animation:fadeSlide .2s ease;
        }

        /* 버튼 */
        .btn-primary {
          width:100%;padding:15px;border-radius:13px;border:none;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
          color:#fff;font-family:inherit;font-size:16px;font-weight:800;
          cursor:pointer;letter-spacing:-.3px;
          box-shadow:0 6px 20px rgba(139,92,246,.35);
          transition:all .2s;margin-bottom:10px;
        }
        .btn-primary:hover { transform:translateY(-2px);box-shadow:0 10px 28px rgba(139,92,246,.5) }
        .btn-primary:active { transform:scale(.98) }
        .btn-primary.success { background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 6px 20px rgba(34,197,94,.35) }

        .btn-ghost {
          width:100%;padding:13px;border-radius:13px;
          border:1.5px solid var(--border2);background:transparent;
          color:var(--text2);font-family:inherit;font-size:14px;font-weight:700;
          cursor:pointer;transition:all .2s;text-decoration:none;
          display:flex;align-items:center;justify-content:center;gap:6px;
        }
        .btn-ghost:hover { border-color:var(--accent);color:var(--accent) }

        .success-wrap {
          text-align:center;padding:16px 0;
          animation:successPop .3s cubic-bezier(.34,1.56,.64,1);
        }
        .changed-wrap {
          background:var(--success-bg);border:1px solid var(--success);
          border-radius:12px;padding:16px;text-align:center;
          margin-bottom:16px;animation:fadeSlide .2s ease;
        }

        /* 분리선 */
        .divider {
          display:flex;align-items:center;gap:10px;margin:16px 0;
        }
        .divider-line { flex:1;height:1px;background:var(--border) }
        .divider-text { font-size:11px;color:var(--text3);font-weight:600;white-space:nowrap }

        @media(max-width:480px) {
          .card { padding:32px 20px;border-radius:20px }
        }
      `}</style>

      {/* 배경 */}
      <div className="grid-bg" />
      <div className="scan-line" />
      <div className="orb" style={{ width:500,height:500,left:'10%',top:'30%',background:'#8b5cf6','--dur':'7s' } as React.CSSProperties} />
      <div className="orb" style={{ width:400,height:400,left:'85%',top:'70%',background:'#ec4899','--dur':'9s' } as React.CSSProperties} />
      <div className="orb" style={{ width:250,height:250,left:'60%',top:'15%',background:'#3b82f6','--dur':'5s' } as React.CSSProperties} />

      {/* 테마 버튼 */}
      <div style={{ position:'fixed',top:16,right:16,zIndex:100 }}>
        <ThemeToggle />
      </div>

      <div className="root">
        <div className={`card${shake ? ' shake' : ''}`}>

          {/* 로고 */}
          <div className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <div className="logo-title">관리자 로그인</div>
            <span className="logo-badge">ADMIN ONLY</span>
          </div>

          {/* 탭 */}
          <div className="tabs">
            <button className={`tab${tab === 'login' ? ' on' : ''}`} onClick={() => switchTab('login')}>
              🔐 로그인
            </button>
            <button className={`tab${tab === 'changePw' ? ' on' : ''}`} onClick={() => switchTab('changePw')}>
              🔑 비번 변경
            </button>
          </div>

          {error && <div className="err">⚠️ {error}</div>}

          {/* 로그인 */}
          {tab === 'login' && (
            success ? (
              <div className="success-wrap">
                <div style={{ fontSize:56,marginBottom:12 }}>✅</div>
                <p style={{ fontWeight:900,fontSize:18,marginBottom:4 }}>로그인 성공!</p>
                <p style={{ fontSize:13,color:'var(--text2)' }}>대시보드로 이동 중...</p>
              </div>
            ) : (
              <>
                <div className="field">
                  <label>비밀번호</label>
                  <div className="input-wrap">
                    <input
                      className="inp"
                      type={showPw ? 'text' : 'password'}
                      value={pw}
                      onChange={e => setPw(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      placeholder="관리자 비밀번호"
                      autoFocus
                    />
                    <button className="eye" onClick={() => setShowPw(!showPw)} type="button">
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button
                  className={`btn-primary${success ? ' success' : ''}`}
                  onClick={handleLogin}
                >
                  🚀 관리자 입장
                </button>
              </>
            )
          )}

          {/* 비번 변경 */}
          {tab === 'changePw' && (
            pwChanged ? (
              <div className="changed-wrap">
                <div style={{ fontSize:32,marginBottom:8 }}>✅</div>
                <p style={{ fontWeight:800,fontSize:15,color:'var(--success)' }}>비밀번호가 변경되었어요!</p>
              </div>
            ) : (
              <>
                {['현재 비밀번호', '새 비밀번호 (4자 이상)', '새 비밀번호 확인'].map((lbl, i) => {
                  const vals = [pw, newPw, newPw2]
                  const setters = [setPw, setNewPw, setNewPw2]
                  return (
                    <div key={lbl} className="field">
                      <label>{lbl}</label>
                      <div className="input-wrap">
                        <input
                          className="inp"
                          type={showNew ? 'text' : 'password'}
                          value={vals[i]}
                          onChange={e => setters[i](e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleChangePw()}
                          placeholder={lbl}
                        />
                        {i === 0 && (
                          <button className="eye" onClick={() => setShowNew(!showNew)} type="button">
                            {showNew ? '🙈' : '👁️'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button className="btn-primary" onClick={handleChangePw}>
                  🔑 비밀번호 변경하기
                </button>
              </>
            )
          )}

          {/* 구분선 */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">회원이신가요?</span>
            <div className="divider-line" />
          </div>

          {/* 회원 로그인으로 이동 */}
          <Link href="/member-auth" className="btn-ghost">
            👤 회원 로그인으로 이동
          </Link>

        </div>
      </div>
    </>
  )
}
