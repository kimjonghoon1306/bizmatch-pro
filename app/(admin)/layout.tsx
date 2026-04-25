'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  PlusSquare,
  MessageSquare,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/leads',     label: '리드 목록', icon: Users },
  { href: '/builder',   label: '랜딩 만들기', icon: PlusSquare },
  { href: '/messages',  label: '메시지 발송', icon: MessageSquare },
  { href: '/settings',  label: '설정',      icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* TOP BAR */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text2)', padding: 4, display: 'flex',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={20} color="var(--accent)" fill="var(--accent)" />
            <span style={{
              fontWeight: 900, fontSize: 18, letterSpacing: -0.5,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              BizMatch PRO
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* SIDEBAR DRAWER */}
      <aside style={{
        position: 'fixed', top: 60, left: 0, bottom: 0, zIndex: 45,
        width: 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        padding: '16px 12px',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        overflowY: 'auto',
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: active ? 700 : 500,
                  fontSize: 15,
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
            BizMatch PRO v0.1.0
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ padding: '24px 20px 80px', maxWidth: 600, margin: '0 auto' }}>
        {children}
      </main>

      {/* BOTTOM NAV (mobile) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                padding: '8px 4px',
                textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text3)',
                transition: 'color 0.15s',
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
