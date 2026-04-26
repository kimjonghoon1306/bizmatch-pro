'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: '📊', mobileIcon: '📊' },
  { href: '/leads',     label: '리드 목록',  icon: '👥', mobileIcon: '👥' },
  { href: '/builder',   label: '랜딩 만들기', icon: '✨', mobileIcon: '✨' },
  { href: '/messages',  label: '메시지',     icon: '💬', mobileIcon: '💬' },
  { href: '/settings',  label: '설정',       icon: '⚙️', mobileIcon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <>
      <style>{`
        .admin-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 40;
          transition: transform 0.25s ease;
        }
        .sidebar-logo {
          padding: 20px 18px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 34px; height: 34px;
          background: var(--accent);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px var(--accent-glow);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 4px 12px var(--accent-glow); }
          50% { box-shadow: 0 4px 24px var(--accent-glow), 0 0 40px var(--accent-glow); }
        }
        .logo-text {
          font-size: 15px; font-weight: 900; letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .logo-badge {
          font-size: 9px; font-weight: 800;
          background: var(--accent); color: #fff;
          padding: 2px 6px; border-radius: 100px;
          letter-spacing: 0.5px;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 12px; border-radius: 10px;
          text-decoration: none; font-size: 14px; font-weight: 600;
          color: var(--text2);
          transition: all 0.15s;
          position: relative;
          overflow: hidden;
        }
        .nav-link::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--accent);
          opacity: 0; border-radius: 10px;
          transition: opacity 0.15s;
        }
        .nav-link:hover::before { opacity: 0.06; }
        .nav-link:hover { color: var(--text); }
        .nav-link.active {
          background: var(--accent-bg);
          color: var(--accent);
          font-weight: 700;
        }
        .nav-link.active .nav-dot {
          opacity: 1;
        }
        .nav-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent);
          margin-left: auto; opacity: 0;
          box-shadow: 0 0 6px var(--accent);
        }
        .nav-icon { font-size: 18px; flex-shrink: 0; }
        .sidebar-bottom {
          padding: 14px 12px;
          border-top: 1px solid var(--border);
        }
        .version-badge {
          font-size: 10px; color: var(--text3);
          text-align: center; font-weight: 600;
          padding: 6px;
          background: var(--bg3); border-radius: 8px;
        }

        /* ── TOP BAR ── */
        .topbar {
          position: sticky; top: 0; z-index: 30;
          height: 56px;
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          padding: 0 20px;
          gap: 12px;
          backdrop-filter: blur(12px);
        }
        .hamburger {
          display: none;
          background: none; border: none;
          cursor: pointer; color: var(--text2);
          font-size: 22px; padding: 4px;
          line-height: 1;
        }
        .topbar-title {
          font-size: 15px; font-weight: 800;
          flex: 1;
        }
        .topbar-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

        /* ── CONTENT ── */
        .content-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }
        .content-main {
          flex: 1;
          overflow-y: auto;
        }

        /* ── BOTTOM NAV (mobile) ── */
        .bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: var(--bg2);
          border-top: 1px solid var(--border);
          padding: 6px 0 env(safe-area-inset-bottom, 6px);
        }
        .bottom-nav-inner {
          display: flex;
        }
        .bnav-item {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 2px;
          padding: 6px 4px;
          text-decoration: none;
          color: var(--text3);
          transition: color 0.15s;
          font-size: 10px; font-weight: 700;
        }
        .bnav-item.active { color: var(--accent); }
        .bnav-item.active .bnav-icon { transform: scale(1.2); }
        .bnav-icon { font-size: 22px; transition: transform 0.2s; }

        /* ── OVERLAY ── */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 39;
          background: rgba(0,0,0,0.5);
        }

        /* ── MOBILE BREAKPOINT ── */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            z-index: 40;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .hamburger { display: flex; align-items: center; }
          .bottom-nav { display: block; }
          .content-main { padding-bottom: 70px; }
        }

        /* ── DECORATIVE SIDEBAR ELEMENTS ── */
        .sidebar-deco {
          padding: 12px 12px 4px;
        }
        .deco-card {
          background: linear-gradient(135deg, var(--accent-bg), transparent);
          border: 1px solid var(--accent);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }
        .deco-char {
          font-size: 32px;
          animation: sideChar 3s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes sideChar {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        .deco-text {
          font-size: 11px; font-weight: 700;
          color: var(--accent); margin-top: 4px;
        }

        /* ── STATS STRIP (topbar) ── */
        .topbar-stats {
          display: flex; gap: 16px; align-items: center;
        }
        .topbar-stat {
          font-size: 12px; color: var(--text2); font-weight: 600;
        }
        .topbar-stat strong { color: var(--accent); }

        @media (max-width: 600px) {
          .topbar-stats { display: none; }
        }
      `}</style>

      <div className="admin-root">

        {/* SIDEBAR */}
        <aside className={`sidebar${sideOpen ? ' open' : ''}`}>
          {/* LOGO */}
          <div className="sidebar-logo">
            <div className="logo-icon">⚡</div>
            <div>
              <div className="logo-text">BizMatch</div>
              <span className="logo-badge">PRO</span>
            </div>
          </div>

          {/* NAV */}
          <nav className="sidebar-nav">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link${active ? ' active' : ''}`}
                  onClick={() => setSideOpen(false)}
                >
                  <span className="nav-icon">{icon}</span>
                  <span>{label}</span>
                  <span className="nav-dot" />
                </Link>
              )
            })}
          </nav>

          {/* DECO CHARACTER */}
          <div className="sidebar-deco">
            <div className="deco-card">
              <span className="deco-char">🚀</span>
              <div className="deco-text">오늘도 파이팅!</div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="sidebar-bottom">
            <ThemeToggle />
            <div className="version-badge" style={{ marginTop: 10 }}>
              BizMatch PRO v0.1.0
            </div>
          </div>
        </aside>

        {/* OVERLAY */}
        <div
          className={`sidebar-overlay${sideOpen ? ' open' : ''}`}
          onClick={() => setSideOpen(false)}
        />

        {/* CONTENT */}
        <div className="content-wrap">
          {/* TOP BAR */}
          <header className="topbar">
            <button className="hamburger" onClick={() => setSideOpen(!sideOpen)}>
              {sideOpen ? '✕' : '☰'}
            </button>
            <div className="topbar-title">
              {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.icon}{' '}
              {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label ?? '관리자'}
            </div>
            <div className="topbar-right">
              <div className="topbar-stats">
                <span className="topbar-stat">사업자 모집 <strong>자동화</strong></span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* MAIN */}
          <main className="content-main">
            {children}
          </main>
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {navItems.map(({ href, label, mobileIcon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} className={`bnav-item${active ? ' active' : ''}`}>
                  <span className="bnav-icon">{mobileIcon}</span>
                  <span>{label.length > 4 ? label.slice(0, 4) : label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
