'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type Modal = 'login' | 'register' | 'findId' | 'findPw' | 'browse' |
             'info_login' | 'info_register' | 'info_browse' | null

// ── 팝업 컴포넌트 ──────────────────────────────
function InfoPopup({ title, content, emoji, onClose }: {
  title: string; content: string; emoji: string; onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed',inset:0,zIndex:200,
        background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',
        display:'flex',alignItems:'center',justifyContent:'center',padding:20,
        animation:'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--surface)',border:'1px solid var(--border2)',
          borderRadius:24,padding:'32px 28px',width:'100%',maxWidth:380,
          boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
          animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{fontSize:48,textAlign:'center',marginBottom:16}}>{emoji}</div>
        <h3 style={{fontSize:20,fontWeight:900,textAlign:'center',marginBottom:12,letterSpacing:-0.5}}>{title}</h3>
        <p style={{fontSize:14,color:'var(--text2)',lineHeight:1.8,textAlign:'center',marginBottom:24}}>{content}</p>
        <button onClick={onClose} style={{
          width:'100%',padding:'14px',borderRadius:12,border:'none',
          background:'var(--accent)',color:'#fff',fontWeight:800,fontSize:15,
          cursor:'pointer',fontFamily:'inherit',
          boxShadow:'0 4px 16px var(--accent-glow)',
        }}>확인했어요 ✓</button>
      </div>
    </div>
  )
}

// ── 로그인 모달 ────────────────────────────────
function LoginModal({ onClose, onFindId, onFindPw }: {
  onClose: () => void; onFindId: () => void; onFindPw: () => void
}) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleLogin() {
    if (!email.trim()) { triggerError('이메일을 입력하세요'); return }
    if (!pw.trim()) { triggerError('비밀번호를 입력하세요'); return }
    alert('준비 중이에요! Supabase Auth 연동 후 사용 가능해요 🚀')
  }

  function triggerError(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
    setTimeout(() => setError(''), 3000)
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn 0.2s ease'}}>
      <div onClick={e => e.stopPropagation()} className={shake ? 'shake' : ''} style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:24,padding:'32px 28px',width:'100%',maxWidth:400,boxShadow:'0 32px 80px rgba(0,0,0,0.5)',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🔐</div>
          <h2 style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,marginBottom:4}}>로그인</h2>
          <p style={{fontSize:13,color:'var(--text2)'}}>BizMatch PRO에 오신걸 환영해요!</p>
        </div>
        {error && <div style={{background:'var(--danger-bg)',border:'1px solid var(--danger)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'var(--danger)',fontWeight:600}}>⚠️ {error}</div>}
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>이메일</label>
          <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleLogin()} type="email" placeholder="example@email.com" style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'14px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>비밀번호</label>
          <div style={{position:'relative'}}>
            <input value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleLogin()} type={showPw?'text':'password'} placeholder="비밀번호 입력" style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'14px 44px 14px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text3)'}}>
              {showPw?'🙈':'👁️'}
            </button>
          </div>
        </div>
        <div style={{display:'flex',gap:16,marginBottom:20}}>
          <button onClick={()=>{onClose();onFindId()}} style={{background:'none',border:'none',color:'var(--accent)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>아이디 찾기</button>
          <button onClick={()=>{onClose();onFindPw()}} style={{background:'none',border:'none',color:'var(--accent)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>비밀번호 찾기</button>
        </div>
        <button onClick={handleLogin} style={{width:'100%',padding:'16px',borderRadius:14,border:'none',background:'var(--accent)',color:'#fff',fontWeight:800,fontSize:16,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 6px 20px var(--accent-glow)',marginBottom:12}}>
          🚀 로그인
        </button>
        <button onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:12,border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>
          닫기
        </button>
      </div>
    </div>
  )
}

// ── 회원가입 모달 ──────────────────────────────
function RegisterModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [done, setDone] = useState(false)

  function handleRegister() {
    if (!name.trim()) { triggerError('이름을 입력하세요'); return }
    if (!email.includes('@')) { triggerError('올바른 이메일을 입력하세요'); return }
    if (!phone.trim()) { triggerError('전화번호를 입력하세요'); return }
    if (pw.length < 6) { triggerError('비밀번호는 6자 이상이어야 해요'); return }
    if (pw !== pw2) { triggerError('비밀번호가 일치하지 않아요'); return }
    setDone(true)
  }

  function triggerError(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 600)
    setTimeout(() => setError(''), 3000)
  }

  if (done) return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:24,padding:'40px 28px',width:'100%',maxWidth:380,textAlign:'center',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:8}}>가입 완료!</h2>
        <p style={{fontSize:14,color:'var(--text2)',lineHeight:1.7,marginBottom:24}}>BizMatch PRO 회원이 되셨어요!<br/>이제 사업자 모집을 시작해보세요 🚀</p>
        <button onClick={onClose} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:'var(--accent)',color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px var(--accent-glow)'}}>시작하기</button>
      </div>
    </div>
  )

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,overflowY:'auto',animation:'fadeIn 0.2s ease'}}>
      <div onClick={e=>e.stopPropagation()} className={shake?'shake':''} style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:24,padding:'32px 28px',width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,0.5)',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',margin:'20px 0'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>✨</div>
          <h2 style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,marginBottom:4}}>회원가입</h2>
          <p style={{fontSize:13,color:'var(--text2)'}}>함께 성장할 파트너가 되어요!</p>
        </div>
        {error && <div style={{background:'var(--danger-bg)',border:'1px solid var(--danger)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'var(--danger)',fontWeight:600}}>⚠️ {error}</div>}
        {[
          {label:'이름',val:name,set:setName,placeholder:'홍길동',type:'text'},
          {label:'이메일',val:email,set:setEmail,placeholder:'example@email.com',type:'email'},
          {label:'전화번호',val:phone,set:setPhone,placeholder:'010-0000-0000',type:'tel'},
        ].map(f => (
          <div key={f.label} style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>{f.label}</label>
            <input value={f.val} onChange={e=>f.set(e.target.value)} type={f.type} placeholder={f.placeholder} style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'13px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>비밀번호 (6자 이상)</label>
          <div style={{position:'relative'}}>
            <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?'text':'password'} placeholder="비밀번호" style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'13px 44px 13px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text3)'}}>
              {showPw?'🙈':'👁️'}
            </button>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>비밀번호 확인</label>
          <input value={pw2} onChange={e=>setPw2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRegister()} type={showPw?'text':'password'} placeholder="비밀번호 재입력" style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'13px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
        </div>
        <button onClick={handleRegister} style={{width:'100%',padding:'16px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#6c63ff,#f472b6)',color:'#fff',fontWeight:800,fontSize:16,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 6px 20px rgba(108,99,255,0.4)',marginBottom:12}}>
          🎉 가입하기
        </button>
        <button onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:12,border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>닫기</button>
      </div>
    </div>
  )
}

// ── 아이디/비번 찾기 모달 ─────────────────────
function FindModal({ type, onClose }: { type: 'id'|'pw'; onClose: () => void }) {
  const [val, setVal] = useState('')
  const [done, setDone] = useState(false)

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn 0.2s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:24,padding:'32px 28px',width:'100%',maxWidth:380,boxShadow:'0 32px 80px rgba(0,0,0,0.5)',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>{type==='id'?'🔍':'🔑'}</div>
          <h2 style={{fontSize:20,fontWeight:900,marginBottom:4}}>{type==='id'?'아이디 찾기':'비밀번호 찾기'}</h2>
          <p style={{fontSize:13,color:'var(--text2)'}}>{type==='id'?'가입 시 등록한 전화번호로 찾아드려요':'등록된 이메일로 재설정 링크를 보내드려요'}</p>
        </div>
        {done ? (
          <div style={{background:'var(--success-bg)',border:'1px solid var(--success)',borderRadius:12,padding:'16px',textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:24,marginBottom:6}}>✅</div>
            <p style={{fontSize:14,color:'var(--success)',fontWeight:700}}>{type==='id'?'전화번호로 아이디를 전송했어요!':'이메일로 재설정 링크를 보냈어요!'}</p>
          </div>
        ) : (
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text2)',marginBottom:8,textTransform:'uppercase',letterSpacing:0.5}}>{type==='id'?'전화번호':'이메일'}</label>
            <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&setDone(true)} type={type==='id'?'tel':'email'} placeholder={type==='id'?'010-0000-0000':'example@email.com'} style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'14px 16px',fontFamily:'inherit',fontSize:16,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} autoFocus />
          </div>
        )}
        {!done && (
          <button onClick={()=>val.trim()&&setDone(true)} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:'var(--accent)',color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px var(--accent-glow)',marginBottom:12}}>
            {type==='id'?'🔍 아이디 찾기':'📧 링크 보내기'}
          </button>
        )}
        <button onClick={onClose} style={{width:'100%',padding:'12px',borderRadius:12,border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>닫기</button>
      </div>
    </div>
  )
}

// ── 둘러보기 오버레이 ──────────────────────────
function BrowseOverlay({ onLogin, onClose }: { onLogin: () => void; onClose: () => void }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,pointerEvents:'none'}}>
      {/* 상단 안내 배너 */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:60,background:'linear-gradient(135deg,#6c63ff,#f472b6)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',pointerEvents:'all'}}>
        <p style={{color:'#fff',fontSize:13,fontWeight:700}}>👀 둘러보기 중 — 대부분 기능은 로그인 후 사용 가능해요</p>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onLogin} style={{padding:'7px 16px',borderRadius:100,border:'none',background:'rgba(255,255,255,0.25)',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>🔐 로그인</button>
          <button onClick={onClose} style={{padding:'7px 12px',borderRadius:100,border:'none',background:'rgba(255,255,255,0.15)',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
        </div>
      </div>
      {/* 잠금 오버레이 (클릭 차단) */}
      <div style={{position:'fixed',inset:0,top:48,zIndex:55,pointerEvents:'all',cursor:'not-allowed'}} onClick={e=>{e.preventDefault();e.stopPropagation()}} />
    </div>
  )
}

// ── 메인 페이지 ────────────────────────────────
export default function MemberAuthPage() {
  const [modal, setModal] = useState<Modal>(null)
  const [browsing, setBrowsing] = useState(false)

  const particles = Array.from({length:24},(_,i)=>({
    x:`${(i*43+17)%100}%`, y:`${(i*67+11)%100}%`,
    size: 5+(i%5)*4,
    color:['#6c63ff','#f472b6','#22c55e','#f59e0b','#38bdf8','#fb7185','#a78bfa','#34d399'][i%8],
    dur: 3+(i%4), delay: i*0.25, shape: i%4,
  }))

  const infoData = {
    login: { emoji:'🔐', title:'로그인 안내', content:'가입한 이메일과 비밀번호로 로그인하세요.\n아이디/비밀번호를 잊으셨다면 찾기 기능을 이용하세요.\n로그인 후 모든 기능을 자유롭게 사용할 수 있어요!' },
    register: { emoji:'✨', title:'회원가입 안내', content:'이름, 이메일, 전화번호, 비밀번호로 간편하게 가입하세요.\n가입 즉시 사업자 모집 랜딩페이지를 만들 수 있어요.\n무료로 시작하고 언제든지 업그레이드하세요!' },
    browse: { emoji:'👀', title:'둘러보기 안내', content:'로그인 없이 BizMatch PRO를 구경할 수 있어요.\n단, 실제 기능(버튼 클릭, 데이터 입력)은 사용 불가해요.\n마음에 드셨다면 회원가입 후 시작해보세요!' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{background:#060612;font-family:'Outfit','Pretendard Variable',sans-serif}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes gridScroll{0%{transform:translateY(0)}100%{transform:translateY(52px)}}
        @keyframes orbFloat{0%{transform:scale(1);opacity:0.3}100%{transform:scale(1.3) translate(15px,-15px);opacity:0.6}}
        @keyframes ptFloat{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:0.3}100%{transform:translateY(-22px) rotate(200deg) scale(1.3);opacity:0.7}}
        @keyframes svgSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes svgSpinRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes heroFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes btnGlow{0%,100%{box-shadow:0 6px 20px var(--g1,rgba(108,99,255,0.4))}50%{box-shadow:0 8px 32px var(--g1,rgba(108,99,255,0.6)),0 0 60px var(--g1,rgba(108,99,255,0.2))}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        @keyframes badgeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .shake{animation:shake 0.5s ease both}

        .page-root{
          min-height:100vh;
          background:radial-gradient(ellipse at 15% 40%,#1a0533 0%,#060612 55%),
                     radial-gradient(ellipse at 85% 70%,#0c1a35 0%,transparent 55%),
                     radial-gradient(ellipse at 50% 0%,#1a0a20 0%,transparent 40%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          overflow:hidden;position:relative;padding:20px;
        }
        .grid-bg{position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(108,99,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.05) 1px,transparent 1px);
          background-size:52px 52px;animation:gridScroll 25s linear infinite}
        .orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;animation:orbFloat var(--dur) ease-in-out infinite alternate}
        .pt{position:absolute;pointer-events:none;animation:ptFloat var(--dur) ease-in-out var(--dly) infinite alternate}
        .svg-deco{position:absolute;pointer-events:none;opacity:0.1}
        .main-card{position:relative;z-index:10;width:100%;max-width:480px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:32px;padding:44px 36px;backdrop-filter:blur(20px);box-shadow:0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);animation:popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both}
        .hero-emoji{display:inline-block;animation:heroFloat 4s ease-in-out infinite;filter:drop-shadow(0 8px 24px rgba(108,99,255,0.5))}
        .grad-text{background:linear-gradient(135deg,#a78bfa,#f472b6,#38bdf8);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 4s ease infinite}
        .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.4);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:700;color:#a78bfa;animation:badgeFloat 2.5s ease-in-out infinite}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#6c63ff;box-shadow:0 0 6px #6c63ff;animation:ptFloat 1.5s ease-in-out infinite alternate}

        .btn-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .auth-btn{padding:18px 12px;border-radius:18px;border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:15px;transition:all 0.2s;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:6px;animation:btnGlow 3s ease-in-out infinite}
        .auth-btn:hover{transform:translateY(-3px) scale(1.02)}
        .auth-btn:active{transform:scale(0.97)}
        .auth-btn-icon{font-size:26px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))}

        .btn-login{background:linear-gradient(135deg,#6c63ff,#8b5cf6);color:#fff;--g1:rgba(108,99,255,0.4)}
        .btn-register{background:linear-gradient(135deg,#f472b6,#fb7185);color:#fff;--g1:rgba(244,114,182,0.4)}
        .btn-browse{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12)!important;color:rgba(255,255,255,0.7);animation:none!important}
        .btn-browse:hover{background:rgba(255,255,255,0.1);color:#fff}

        .info-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.3);font-size:14px;transition:color 0.2s;position:absolute;top:8px;right:8px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%}
        .info-btn:hover{color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.1)}

        .divider{display:flex;align-items:center;gap:12px;margin:16px 0}
        .divider-line{flex:1;height:1px;background:rgba(255,255,255,0.08)}
        .divider-text{font-size:12px;color:rgba(255,255,255,0.25);font-weight:600;white-space:nowrap}

        .feature-row{display:flex;justify-content:center;gap:20px;margin-top:20px;flex-wrap:wrap}
        .feature-item{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,0.4)}

        .admin-fab{position:fixed;bottom:24px;right:24px;z-index:90;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;text-decoration:none;transition:all 0.2s;box-shadow:0 4px 20px rgba(0,0,0,0.3)}
        .admin-fab:hover{background:rgba(108,99,255,0.2);border-color:rgba(108,99,255,0.4);transform:scale(1.1)}

        .theme-wrap{position:fixed;top:16px;right:16px;z-index:90}

        @media(max-width:480px){
          .main-card{padding:32px 20px;border-radius:24px}
          .btn-row{gap:10px}
          .auth-btn{padding:16px 10px;font-size:14px}
        }
      `}</style>

      {/* THEME TOGGLE */}
      <div className="theme-wrap"><ThemeToggle /></div>

      {/* BROWSE OVERLAY */}
      {browsing && (
        <BrowseOverlay
          onLogin={() => { setBrowsing(false); setModal('login') }}
          onClose={() => setBrowsing(false)}
        />
      )}

      {/* MODALS */}
      {modal === 'login' && <LoginModal onClose={() => setModal(null)} onFindId={() => setModal('findId')} onFindPw={() => setModal('findPw')} />}
      {modal === 'register' && <RegisterModal onClose={() => setModal(null)} />}
      {modal === 'findId' && <FindModal type="id" onClose={() => setModal(null)} />}
      {modal === 'findPw' && <FindModal type="pw" onClose={() => setModal(null)} />}
      {modal === 'info_login' && <InfoPopup {...infoData.login} onClose={() => setModal(null)} />}
      {modal === 'info_register' && <InfoPopup {...infoData.register} onClose={() => setModal(null)} />}
      {modal === 'info_browse' && <InfoPopup {...infoData.browse} onClose={() => setModal(null)} />}

      <div className="page-root">
        <div className="grid-bg" />

        {/* ORBS */}
        <div className="orb" style={{width:500,height:500,top:'-15%',left:'-10%',background:'#6c63ff','--dur':'7s'} as React.CSSProperties} />
        <div className="orb" style={{width:350,height:350,bottom:'-10%',right:'-8%',background:'#f472b6','--dur':'9s'} as React.CSSProperties} />
        <div className="orb" style={{width:250,height:250,top:'40%',right:'15%',background:'#38bdf8','--dur':'5s'} as React.CSSProperties} />

        {/* SVG DECOS */}
        <svg className="svg-deco" style={{top:'8%',left:'6%',width:140,height:140,animation:'svgSpin 22s linear infinite'}} viewBox="0 0 140 140">
          <polygon points="70,6 134,105 6,105" fill="none" stroke="#6c63ff" strokeWidth="2"/>
          <polygon points="70,22 118,100 22,100" fill="none" stroke="#f472b6" strokeWidth="1"/>
        </svg>
        <svg className="svg-deco" style={{bottom:'10%',left:'4%',width:110,height:110,animation:'svgSpinRev 18s linear infinite'}} viewBox="0 0 110 110">
          <rect x="8" y="8" width="94" height="94" fill="none" stroke="#38bdf8" strokeWidth="2" rx="10"/>
          <rect x="22" y="22" width="66" height="66" fill="none" stroke="#f59e0b" strokeWidth="1" rx="5"/>
        </svg>
        <svg className="svg-deco" style={{top:'55%',right:'4%',width:90,height:90,animation:'svgSpin 14s linear infinite'}} viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="40" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="10 5"/>
          <circle cx="45" cy="45" r="25" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
        </svg>
        <svg className="svg-deco" style={{top:'15%',right:'8%',width:70,height:70,animation:'svgSpinRev 10s linear infinite'}} viewBox="0 0 70 70">
          <polygon points="35,3 67,52 3,52" fill="none" stroke="#fb7185" strokeWidth="2"/>
        </svg>

        {/* PARTICLES */}
        {particles.map((p,i) => (
          <div key={i} className="pt" style={{
            left:p.x,top:p.y,width:p.size,height:p.size,
            background:p.color,
            borderRadius:p.shape===0?'50%':p.shape===1?'4px':p.shape===2?'2px':'30% 70% 70% 30%',
            '--dur':`${p.dur}s`,'--dly':`${p.delay}s`,
          } as React.CSSProperties}/>
        ))}

        {/* MAIN CARD */}
        <div className="main-card">
          {/* BADGE */}
          <div style={{textAlign:'center',marginBottom:20}}>
            <div className="badge">
              <span className="badge-dot"/>
              사업자 모집 자동화 플랫폼
            </div>
          </div>

          {/* HERO */}
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{marginBottom:12}}>
              <span className="hero-emoji" style={{fontSize:68}}>🚀</span>
            </div>
            <h1 style={{fontSize:'clamp(26px,5vw,36px)',fontWeight:900,letterSpacing:-1.5,color:'#fff',lineHeight:1.15,marginBottom:8}}>
              <span className="grad-text">BizMatch PRO</span>
            </h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>
              네트워크·프랜차이즈·창업 모집을<br/>스마트하게 자동화하세요
            </p>
          </div>

          {/* MAIN BUTTONS */}
          <div className="btn-row">
            {/* 로그인 */}
            <div style={{position:'relative'}}>
              <button className="auth-btn btn-login" onClick={() => setModal('login')}>
                <span className="auth-btn-icon">🔐</span>
                로그인
              </button>
              <button className="info-btn" onClick={() => setModal('info_login')} title="로그인 안내">ℹ</button>
            </div>
            {/* 회원가입 */}
            <div style={{position:'relative'}}>
              <button className="auth-btn btn-register" onClick={() => setModal('register')}>
                <span className="auth-btn-icon">✨</span>
                회원가입
              </button>
              <button className="info-btn" onClick={() => setModal('info_register')} title="회원가입 안내">ℹ</button>
            </div>
          </div>

          {/* 둘러보기 */}
          <div style={{position:'relative'}}>
            <button className="auth-btn btn-browse" style={{width:'100%'}} onClick={() => setBrowsing(true)}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>👀</span>
                로그인 없이 둘러보기
              </span>
            </button>
            <button className="info-btn" onClick={() => setModal('info_browse')} title="둘러보기 안내">ℹ</button>
          </div>

          {/* DIVIDER */}
          <div className="divider">
            <div className="divider-line"/>
            <span className="divider-text">BizMatch PRO의 특별한 기능</span>
            <div className="divider-line"/>
          </div>

          {/* FEATURES */}
          <div className="feature-row">
            {[
              {icon:'📊',text:'리드 관리'},
              {icon:'✨',text:'랜딩 빌더'},
              {icon:'💬',text:'자동 메시지'},
              {icon:'📈',text:'전환 분석'},
            ].map(f => (
              <div key={f.text} className="feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 관리자 FAB */}
      <Link href="/admin-login" className="admin-fab" title="관리자 로그인">
        ⚙️
      </Link>
    </>
  )
}
