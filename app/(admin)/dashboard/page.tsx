'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Lead, DashboardStats } from '@/lib/types'
import { formatRelative, statusLabel } from '@/lib/utils'

function StatCard({ label, value, icon, color, sub, delay }: {
  label: string; value: string | number; icon: string
  color: string; sub?: string; delay: number
}) {
  const [displayed, setDisplayed] = useState(0)
  const numVal = typeof value === 'number' ? value : parseInt(String(value)) || 0
  useEffect(() => {
    let start = 0
    const step = Math.max(1, Math.ceil(numVal / 30))
    const timer = setInterval(() => {
      start = Math.min(start + step, numVal)
      setDisplayed(start)
      if (start >= numVal) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [numVal])
  return (
    <div
      className="stat-card-hover"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '20px 16px', position: 'relative',
        overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: 0.12, filter: 'blur(20px)',
      }} />
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, color, lineHeight: 1 }}>
        {typeof value === 'string' && value.includes('%') ? `${displayed}%` : displayed}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function FunnelBar({ label, pct, count, color, delay }: {
  label: string; pct: number; count: number; color: string; delay: number
}) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400 + delay)
    return () => clearTimeout(t)
  }, [pct, delay])
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{count}명 · {pct}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 100, background: color,
          width: `${width}%`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

function LeadRow({ lead, idx }: { lead: Lead; idx: number }) {
  const colors: Record<string, string> = {
    new: '#6c63ff', contact: '#f59e0b', done: '#22c55e', trash: '#ef4444',
  }
  const c = colors[lead.status] ?? '#6c63ff'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: `${c}22`, color: c,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 14, flexShrink: 0,
      }}>
        {lead.name.slice(0, 1)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{lead.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{formatRelative(lead.created_at)}</div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
        background: `${c}22`, color: c, flexShrink: 0,
      }}>
        {statusLabel[lead.status]}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0, todayLeads: 0, contactingLeads: 0, doneLeads: 0, conversionRate: 0,
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const update = () => setTime(
      new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    )
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: leads } = await supabase
        .from('leads').select('*').neq('status', 'trash')
        .order('created_at', { ascending: false })
      if (!leads) { setLoading(false); return }
      const todayLeads = leads.filter(l => new Date(l.created_at) >= today).length
      const contactingLeads = leads.filter(l => l.status === 'contact').length
      const doneLeads = leads.filter(l => l.status === 'done').length
      const rate = leads.length > 0 ? Math.round((doneLeads / leads.length) * 100) : 0
      setStats({ totalLeads: leads.length, todayLeads, contactingLeads, doneLeads, conversionRate: rate })
      setRecentLeads(leads.slice(0, 6))
      setLoading(false)
    }
    load()
  }, [])

  const funnelData = [
    { label: '📥 신청 접수', count: stats.totalLeads, pct: 100, color: '#6c63ff' },
    {
      label: '📞 연락 완료',
      count: stats.contactingLeads + stats.doneLeads,
      pct: stats.totalLeads > 0
        ? Math.round(((stats.contactingLeads + stats.doneLeads) / stats.totalLeads) * 100)
        : 0,
      color: '#f59e0b',
    },
    {
      label: '✅ 최종 전환',
      count: stats.doneLeads,
      pct: stats.totalLeads > 0
        ? Math.round((stats.doneLeads / stats.totalLeads) * 100)
        : 0,
      color: '#22c55e',
    },
  ]

  const particles = Array.from({ length: 12 }, (_, i) => ({
    left: `${(i * 41 + 13) % 100}%`,
    top: `${(i * 57 + 9) % 80}%`,
    width: `${8 + (i % 3) * 6}px`,
    height: `${8 + (i % 3) * 6}px`,
    background: ['#6c63ff', '#f472b6', '#22c55e', '#f59e0b', '#38bdf8'][i % 5],
    borderRadius: i % 2 === 0 ? '50%' : '4px',
    opacity: 0.2,
    animationDuration: `${3 + (i % 3)}s`,
    animationDelay: `${i * 0.4}s`,
  }))

  return (
    <>
      <style>{`
        .stat-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
        .action-btn { display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;background:var(--surface);border:1px solid var(--border);border-radius:16px;text-decoration:none;color:var(--text);transition:all 0.2s; }
        .action-btn:hover { transform:translateY(-3px);border-color:var(--accent);box-shadow:0 8px 24px var(--accent-glow); }
        .float-icon { animation:floatIcon 3s ease-in-out infinite alternate;display:inline-block; }
        @keyframes floatIcon { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
        .char-float { animation:charFloat 4s ease-in-out infinite;display:inline-block;filter:drop-shadow(0 8px 24px rgba(108,99,255,0.4)); }
        @keyframes charFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-16px) rotate(3deg)} }
        .particle { position:absolute;animation:particleFloat var(--pdur,4s) ease-in-out infinite alternate;pointer-events:none; }
        @keyframes particleFloat { 0%{transform:translateY(0) rotate(0deg) scale(1)} 100%{transform:translateY(-20px) rotate(180deg) scale(1.2)} }
        .wave-svg { display:block;animation:waveMove 6s ease-in-out infinite alternate; }
        @keyframes waveMove { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }
        .pulse-dot { animation:pulseDot 2s infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        .stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:-40px;margin-bottom:24px;position:relative;z-index:2; }
        .actions-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px; }
        .main-grid { display:grid;grid-template-columns:1fr 280px;gap:18px;align-items:start; }
        @media(max-width:900px) { .stats-grid{grid-template-columns:repeat(2,1fr)} .main-grid{grid-template-columns:1fr} .pc-aside{display:none!important} }
        @media(max-width:480px) { .stats-grid{grid-template-columns:repeat(2,1fr);gap:10px} .actions-grid{grid-template-columns:repeat(2,1fr)} }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

        {/* HERO */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)',
          padding: '32px 24px 64px', overflow: 'hidden',
        }}>
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{
              left: p.left, top: p.top,
              width: p.width, height: p.height,
              background: p.background, borderRadius: p.borderRadius,
              opacity: p.opacity,
              ['--pdur' as string]: p.animationDuration,
              animationDelay: p.animationDelay,
            } as React.CSSProperties} />
          ))}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              <h1 style={{ fontSize: 'clamp(20px,4vw,34px)', fontWeight: 900, letterSpacing: -1, lineHeight: 1.2, marginBottom: 6 }}>
                안녕하세요 👋 <span style={{ color: 'var(--accent)' }}>BizMatch PRO</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text2)' }}>오늘도 최고의 사업자를 모집하세요 🔥</p>
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 12, padding: '10px 16px', textAlign: 'center',
              fontSize: 20, fontWeight: 800, color: 'var(--accent)',
              letterSpacing: 1, boxShadow: '0 0 20px var(--accent-glow)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {time}
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, letterSpacing: 0 }}>LIVE</div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', lineHeight: 0, pointerEvents: 'none' }}>
            <svg className="wave-svg" viewBox="0 0 1440 60">
              <path fill="#6c63ff" fillOpacity="0.1" d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1380,15 1440,30 L1440,60 L0,60 Z" />
            </svg>
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px 100px' }}>

          {/* STATS */}
          <div className="stats-grid">
            <StatCard label="총 리드" value={stats.totalLeads} icon="👥" color="#6c63ff" sub="전체 신청자" delay={0} />
            <StatCard label="오늘 신규" value={stats.todayLeads} icon="⚡" color="#22c55e" sub="오늘 등록" delay={100} />
            <StatCard label="연락 중" value={stats.contactingLeads} icon="📞" color="#f59e0b" sub="진행 중" delay={200} />
            <StatCard label="전환율" value={`${stats.conversionRate}%`} icon="🎯" color="#f472b6" sub={`${stats.doneLeads}명 완료`} delay={300} />
          </div>

          {/* QUICK ACTIONS */}
          <div className="actions-grid">
            {[
              { href: '/builder', icon: '✨', label: '랜딩 만들기' },
              { href: '/leads',   icon: '👥', label: '리드 목록' },
              { href: '/messages',icon: '💬', label: '메시지' },
              { href: '/settings',icon: '⚙️', label: '설정' },
            ].map((a, i) => (
              <Link key={a.href} href={a.href} className="action-btn">
                <span className="float-icon" style={{ fontSize: 28, animationDelay: `${i * 0.3}s` }}>{a.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{a.label}</span>
              </Link>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="main-grid">
            <div>
              {/* FUNNEL */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 15, fontWeight: 800 }}>
                  <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                  전환 퍼널
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto', fontWeight: 500 }}>실시간</span>
                </div>
                {loading
                  ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 14, borderRadius: 10 }} />)
                  : funnelData.map((f, i) => <FunnelBar key={f.label} {...f} delay={i * 150} />)
                }
              </div>

              {/* RECENT LEADS */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800 }}>
                    <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#f472b6', boxShadow: '0 0 8px #f472b6' }} />
                    최근 신청자
                  </div>
                  <Link href="/leads" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>전체 보기 →</Link>
                </div>
                {loading
                  ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />)
                  : recentLeads.length === 0
                    ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text3)' }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                        <p style={{ fontSize: 14 }}>아직 신청자가 없어요</p>
                        <p style={{ fontSize: 12, marginTop: 4 }}>랜딩페이지를 만들어 공유해보세요!</p>
                      </div>
                    )
                    : recentLeads.map((l, i) => <LeadRow key={l.id} lead={l} idx={i} />)
                }
              </div>
            </div>

            {/* PC ASIDE */}
            <div className="pc-aside" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px 16px', textAlign: 'center' }}>
                <span className="char-float" style={{ fontSize: 64 }}>🚀</span>
                <p style={{ fontSize: 13, fontWeight: 700, marginTop: 12, color: 'var(--text2)' }}>오늘도 파이팅!</p>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10 }}>
                  {['⭐','💎','🏆'].map((e, i) => (
                    <span key={i} className="float-icon" style={{ fontSize: 22, animationDelay: `${i * 0.4}s` }}>{e}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>📊 이번 달</div>
                {[
                  { label: '신규 리드', val: stats.totalLeads, color: '#6c63ff' },
                  { label: '연락 완료', val: stats.contactingLeads, color: '#f59e0b' },
                  { label: '전환 완료', val: stats.doneLeads, color: '#22c55e' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontWeight: 900, color: r.color }}>{r.val}명</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, var(--accent-bg), transparent)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>💡 오늘의 팁</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  신청 후 <strong style={{ color: 'var(--accent)' }}>1시간 이내</strong> 연락하면 전환율이 3배 높아져요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
