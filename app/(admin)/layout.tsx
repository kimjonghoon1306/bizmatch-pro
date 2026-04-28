'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const STORAGE_KEY = 'bizmatch_admin_auth'

// 각 메뉴에 설명 추가
const navItems = [
  {
    href: '/dashboard', label: '대시보드', icon: '📊',
    desc: '전체 현황을 한눈에 확인',
    help: '오늘 신청자 수, 전환율, 랜딩페이지 성과를 한눈에 볼 수 있어요.',
  },
  {
    href: '/leads', label: '리드 목록', icon: '👥',
    desc: '신청자 관리',
    help: '랜딩페이지에서 신청한 사람들의 목록이에요. 연락처 확인, 상태 변경이 가능해요.',
  },
  {
    href: '/builder', label: '랜딩 만들기', icon: '✨',
    desc: '모집 페이지 제작',
    help: 'AI가 자동으로 글을 써주는 모집 페이지를 만들어요. 링크 하나로 공유할 수 있어요.',
  },
  {
    href: '/messages', label: '메시지', icon: '💬',
    desc: '자동 문자 발송',
    help: '신청자에게 자동으로 문자를 발송해요. D+0, D+1, D+7 시퀀스를 설정할 수 있어요.',
  },
  {
    href: '/settings', label: '설정', icon: '⚙️',
    desc: 'AI키, 프로필 관리',
    help: 'AI API 키 입력, 프로필 수정, 내 랜딩페이지 관리를 할 수 있어요.',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sideOpen, setSideOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [showHelp, setShowHelp] = useState(true)

  useEffect(() => {
    if (pathname === '/admin-login') { setAuthed(true); return }
    const ok = localStorage.getItem(STORAGE_KEY) === 'true'
    if (!ok) { router.replace('/admin-login'); return }
    setAuthed(true)
  }, [pathname, router])

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    router.replace('/admin-login')
  }

  if (pathname === '/admin-login') return <>{children}</>
  if (!authed) return null

  const currentNav = navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        .al-root{display:flex;min-height:100vh;background:var(--bg);color:var(--text);font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif}

        /* ── SIDEBAR ─────────────────────── */
        .al-side{width:240px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;z-index:40;transition:transform 0.25s ease}

        .al-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .al-logo-icon{width:38px;height:38px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 14px rgba(139,92,246,.4);flex-shrink:0;animation:logoBounce 3s ease-in-out infinite}
        @keyframes logoBounce{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg) translateY(-2px)}}
        .al-logo-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:900;letter-spacing:-.5px;background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .al-logo-badge{font-size:9px;font-weight:800;background:var(--accent);color:#fff;padding:2px 7px;border-radius:100px;letter-spacing:.5px;width:fit-content;margin-top:1px}

        /* 메뉴 섹션 */
        .al-nav-section{padding:10px 10px 4px;font-size:10px;font-weight:800;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;margin-top:6px}
        .al-nav{flex:1;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
        .al-link{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;text-decoration:none;font-size:14px;font-weight:600;color:var(--text2);transition:all .15s;position:relative;overflow:hidden}
        .al-link:hover{color:var(--text);background:var(--surface)}
        .al-link.on{background:var(--accent-bg);color:var(--accent);font-weight:800}
        .al-link.on::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--accent);border-radius:0 3px 3px 0}
        .al-link-icon{font-size:18px;flex-shrink:0}
        .al-link-info{flex:1}
        .al-link-label{display:block;line-height:1.2}
        .al-link-desc{display:block;font-size:10px;color:var(--text3);font-weight:500;margin-top:1px}
        .al-link.on .al-link-desc{color:var(--accent);opacity:.7}

        /* 하단 */
        .al-bottom{padding:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
        .al-admin-link{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:11px;text-decoration:none;font-size:13px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent);transition:all .2s}
        .al-admin-link:hover{background:var(--accent);color:#fff}
        .al-logout{width:100%;padding:9px;border-radius:10px;border:1px solid var(--danger-bg);background:transparent;color:var(--danger);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
        .al-logout:hover{background:var(--danger-bg)}
        .al-version{font-size:10px;color:var(--text3);text-align:center;padding:5px;background:var(--bg3);border-radius:8px;font-weight:600}
        .al-deco{text-align:center;padding:12px 8px;background:linear-gradient(135deg,var(--accent-bg),transparent);border:1px solid var(--border);border-radius:12px;margin:4px 0}
        .al-deco-icon{font-size:26px;animation:floatDeco 3s ease-in-out infinite;display:inline-block}
        @keyframes floatDeco{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-6px) rotate(4deg)}}

        /* ── TOPBAR ──────────────────────── */
        .al-top{position:sticky;top:0;z-index:30;height:58px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;backdrop-filter:blur(12px)}
        .al-hamburger{display:none;background:none;border:none;cursor:pointer;color:var(--text2);font-size:22px;padding:4px;line-height:1;align-items:center}
        .al-top-left{flex:1;display:flex;align-items:center;gap:10px}
        .al-top-icon{font-size:22px}
        .al-top-text h2{font-size:15px;font-weight:800;margin:0;line-height:1.2}
        .al-top-text p{font-size:11px;color:var(--text3);margin:0;font-weight:500}
        .al-top-right{display:flex;align-items:center;gap:8px}
        .al-icon-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:var(--surface2);border:1px solid var(--border2);text-decoration:none;font-size:17px;transition:all .2s;cursor:pointer;color:var(--text)}
        .al-icon-btn:hover{border-color:var(--accent);background:var(--accent-bg)}

        /* ── HELP BAR ────────────────────── */
        .al-help{margin:16px 20px 0;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px}
        .al-help-icon{font-size:22px;flex-shrink:0;margin-top:1px}
        .al-help-text{flex:1}
        .al-help-title{font-weight:800;font-size:14px;margin-bottom:3px;color:var(--accent)}
        .al-help-desc{font-size:12px;color:var(--text2);line-height:1.6}
        .al-help-close{background:none;border:none;cursor:pointer;color:var(--text3);font-size:16px;padding:0;line-height:1;flex-shrink:0}

        /* ── MAIN ────────────────────────── */
        .al-wrap{flex:1;display:flex;flex-direction:column;min-width:0;overflow-x:hidden}
        .al-main{flex:1;padding:20px;overflow-y:auto}

        /* ── BOTTOM NAV (모바일) ──────────── */
        .al-bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:50;background:var(--bg2);border-top:1px solid var(--border);padding:4px 0 env(safe-area-inset-bottom,4px)}
        .al-bnav-inner{display:flex}
        .al-bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 4px;text-decoration:none;color:var(--text3);transition:color .15s;font-size:9px;font-weight:700}
        .al-bnav-item.on{color:var(--accent)}
        .al-bnav-icon{font-size:22px;transition:transform .2s}
        .al-bnav-item.on .al-bnav-icon{transform:scale(1.15)}

        /* ── OVERLAY ─────────────────────── */
        .al-overlay{display:none;position:fixed;inset:0;z-index:39;background:rgba(0,0,0,.5);backdrop-filter:blur(2px)}

        @media(max-width:768px){
          .al-side{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);z-index:40}
          .al-side.open{transform:translateX(0)}
          .al-overlay.open{display:block}
          .al-hamburger{display:flex}
          .al-bnav{display:block}
          .al-main{padding-bottom:80px;padding:16px 16px 80px}
          .al-help{margin:12px 16px 0}
        }
      `}</style>

      <div className="al-root">

        {/* ── SIDEBAR ── */}
        <aside className={`al-side${sideOpen ? ' open' : ''}`}>
          <div className="al-logo">
            <div className="al-logo-icon">⚡</div>
            <div>
              <div className="al-logo-title">BizMatch</div>
              <span className="al-logo-badge">PRO 관리자</span>
            </div>
          </div>

          <nav className="al-nav">
            <div className="al-nav-section">📋 메인 메뉴</div>
            {navItems.map(({ href, label, icon, desc }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} className={`al-link${active ? ' on' : ''}`} onClick={() => setSideOpen(false)}>
                  <span className="al-link-icon">{icon}</span>
                  <span className="al-link-info">
                    <span className="al-link-label">{label}</span>
                    <span className="al-link-desc">{desc}</span>
                  </span>
                </Link>
              )
            })}

            <div className="al-nav-section" style={{ marginTop: 12 }}>🔧 관리</div>
            <Link href="/admin-control" className={`al-link${pathname === '/admin-control' ? ' on' : ''}`} onClick={() => setSideOpen(false)}>
              <span className="al-link-icon">🎛️</span>
              <span className="al-link-info">
                <span className="al-link-label">관리자 센터</span>
                <span className="al-link-desc">전체 시스템 관리</span>
              </span>
            </Link>
          </nav>

          <div className="al-deco">
            <span className="al-deco-icon">🚀</span>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginTop: 6, marginBottom: 0 }}>오늘도 파이팅!</p>
          </div>

          <div className="al-bottom">
            <button className="al-logout" onClick={handleLogout}>🚪 로그아웃</button>
            <div className="al-version">BizMatch PRO v0.2.0</div>
          </div>
        </aside>

        <div className={`al-overlay${sideOpen ? ' open' : ''}`} onClick={() => setSideOpen(false)} />

        <div className="al-wrap">
          {/* ── TOPBAR ── */}
          <header className="al-top">
            <button className="al-hamburger" onClick={() => setSideOpen(!sideOpen)}>
              {sideOpen ? '✕' : '☰'}
            </button>
            <div className="al-top-left">
              <span className="al-top-icon">{currentNav?.icon ?? '⚙️'}</span>
              <div className="al-top-text">
                <h2>{currentNav?.label ?? '관리자'}</h2>
                <p>{currentNav?.desc ?? 'BizMatch PRO'}</p>
              </div>
            </div>
            <div className="al-top-right">
              <ThemeToggle />
              <Link href="/admin-control" className="al-icon-btn" title="관리자 센터">🎛️</Link>
            </div>
          </header>

          {/* ── HELP BAR (기능 설명 고정) ── */}
          {currentNav && showHelp && (
            <div className="al-help">
              <span className="al-help-icon">💡</span>
              <div className="al-help-text">
                <div className="al-help-title">{currentNav.label} 사용법</div>
                <div className="al-help-desc">{currentNav.help}</div>
              </div>
              <button className="al-help-close" onClick={() => setShowHelp(false)} title="닫기">✕</button>
            </div>
          )}
          {!showHelp && (
            <button onClick={() => setShowHelp(true)} style={{ margin: '10px 20px 0', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              💡 도움말 보기
            </button>
          )}

          <main className="al-main">{children}</main>
        </div>

        {/* ── BOTTOM NAV (모바일) ── */}
        <nav className="al-bnav">
          <div className="al-bnav-inner">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} className={`al-bnav-item${active ? ' on' : ''}`}>
                  <span className="al-bnav-icon">{icon}</span>
                  <span>{label.slice(0, 4)}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
