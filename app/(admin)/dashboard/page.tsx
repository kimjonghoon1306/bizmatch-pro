'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Lead, DashboardStats } from '@/lib/types'
import { formatRelative, statusLabel } from '@/lib/utils'

// ────────────────────────────────────────────
// MINI LINE CHART (SVG)
// ────────────────────────────────────────────
function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const w = 120; const h = 40; const pad = 4
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const areaBottom = `${w - pad},${h - pad} ${pad},${h - pad}`
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaBottom}`} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2)
        const y = h - pad - (v / max) * (h - pad * 2)
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ) : null
      })}
    </svg>
  )
}

// ────────────────────────────────────────────
// DONUT CHART
// ────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const r = 54; const cx = 64; const cy = 64; const stroke = 16
  let offset = 0
  const circumference = 2 * Math.PI * r
  return (
    <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * circumference
        const gap = circumference - dash
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        )
        offset += pct
        return el
      })}
      <circle cx={cx} cy={cy} r={r - stroke / 2} fill="none" stroke="var(--bg3)" strokeWidth="1" />
    </svg>
  )
}

// ────────────────────────────────────────────
// ANIMATED COUNTER
// ────────────────────────────────────────────
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = Math.max(1, Math.ceil(value / 40))
    const t = setInterval(() => {
      cur = Math.min(cur + step, value)
      setN(cur)
      if (cur >= value) clearInterval(t)
    }, 30)
    return () => clearInterval(t)
  }, [value])
  return <>{n}{suffix}</>
}

// ────────────────────────────────────────────
// FLOATING MASCOT
// ────────────────────────────────────────────
function Mascot({ emoji, size = 56, style }: { emoji: string; size?: number; style?: React.CSSProperties }) {
  return (
    <span style={{
      fontSize: size, display: 'inline-block',
      animation: 'mascotFloat 4s ease-in-out infinite',
      filter: `drop-shadow(0 8px 16px rgba(108,99,255,0.35))`,
      ...style,
    }}>{emoji}</span>
  )
}

// ────────────────────────────────────────────
// FUNNEL
// ────────────────────────────────────────────
function FunnelBar({ label, pct, count, color, delay }: {
  label: string; pct: number; count: number; color: string; delay: number
}) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 500 + delay)
    return () => clearTimeout(t)
  }, [pct, delay])
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{count}명 · {pct}%</span>
      </div>
      <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', borderRadius: 100, background: `linear-gradient(90deg, ${color}99, ${color})`, width: `${w}%`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', borderRadius: 100 }} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// LEAD ROW
// ────────────────────────────────────────────
function LeadRow({ lead }: { lead: Lead }) {
  const c: Record<string, string> = { new: '#6c63ff', contact: '#f59e0b', done: '#22c55e', trash: '#ef4444' }
  const col = c[lead.status] ?? '#6c63ff'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${col}22`, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
        {lead.name.slice(0, 1)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{formatRelative(lead.created_at)}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${col}22`, color: col, flexShrink: 0 }}>
        {statusLabel[lead.status]}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalLeads: 0, todayLeads: 0, contactingLeads: 0, doneLeads: 0, conversionRate: 0 })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const { data: leads } = await supabase.from('leads').select('*').neq('status', 'trash').order('created_at', { ascending: false })
      if (!leads) { setLoading(false); return }
      const todayLeads = leads.filter(l => new Date(l.created_at) >= today).length
      const contactingLeads = leads.filter(l => l.status === 'contact').length
      const doneLeads = leads.filter(l => l.status === 'done').length
      const rate = leads.length > 0 ? Math.round((doneLeads / leads.length) * 100) : 0
      setStats({ totalLeads: leads.length, todayLeads, contactingLeads, doneLeads, conversionRate: rate })
      setRecentLeads(leads.slice(0, 8))
      // 주간 데이터
      const weekly = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0)
        const next = new Date(d); next.setDate(next.getDate() + 1)
        return leads.filter(l => { const t = new Date(l.created_at); return t >= d && t < next }).length
      })
      setWeeklyData(weekly)
      setLoading(false)
    }
    load()
  }, [])

  const days = ['월', '화', '수', '목', '금', '토', '일']
  const todayIdx = (new Date().getDay() + 6) % 7

  const funnelData = [
    { label: '📥 신청 접수', count: stats.totalLeads, pct: 100, color: '#6c63ff' },
    { label: '📞 연락 완료', count: stats.contactingLeads + stats.doneLeads, pct: stats.totalLeads > 0 ? Math.round(((stats.contactingLeads + stats.doneLeads) / stats.totalLeads) * 100) : 0, color: '#f59e0b' },
    { label: '✅ 최종 전환', count: stats.doneLeads, pct: stats.totalLeads > 0 ? Math.round((stats.doneLeads / stats.totalLeads) * 100) : 0, color: '#22c55e' },
  ]

  const donutData = [
    { value: stats.todayLeads,       color: '#6c63ff', label: '신규' },
    { value: stats.contactingLeads,  color: '#f59e0b', label: '연락중' },
    { value: stats.doneLeads,        color: '#22c55e', label: '완료' },
  ]

  const skel = (h: number) => (
    <div style={{ height: h, borderRadius: 12, background: 'var(--surface2)', animation: 'skelPulse 1.5s infinite' }} />
  )

  return (
    <>
      <style>{`
        @keyframes mascotFloat { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes skelPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes waveAnim { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes particleFloat { 0%{transform:translateY(0) rotate(0deg)} 100%{transform:translateY(-18px) rotate(180deg)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;animation:fadeUp 0.5s ease both; }
        .card:hover { border-color:var(--border2); }
        .pulse-dot { width:8px;height:8px;border-radius:50%;animation:pulseDot 2s infinite; }
        .stat-hover:hover { transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.15); }
        .action-hover:hover { transform:translateY(-3px);box-shadow:0 8px 24px var(--accent-glow); }
        .bar-item:hover { background:var(--surface2); }

        /* HERO GRADIENT */
        .hero-bg {
          background: linear-gradient(135deg, var(--bg2), var(--bg3));
        }

        /* GRID LAYOUTS */
        .grid-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
        .grid-3 { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .grid-main { display:grid;grid-template-columns:1fr 320px;gap:16px; }

        @media(max-width:1100px) { .grid-4{grid-template-columns:repeat(2,1fr)} .grid-main{grid-template-columns:1fr} .aside-col{display:none} }
        @media(max-width:700px) { .grid-3{grid-template-columns:repeat(2,1fr)} .grid-2{grid-template-columns:1fr} }
        @media(max-width:480px) { .grid-4{grid-template-columns:repeat(2,1fr);gap:10px} .grid-3{grid-template-columns:repeat(2,1fr);gap:10px} }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

        {/* ── HERO HEADER ──────────────────── */}
        <div className="hero-bg" style={{ position: 'relative', padding: '36px 28px 80px', overflow: 'hidden' }}>
          {/* Particles */}
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 43 + 11) % 100}%`,
              top: `${(i * 61 + 7) % 90}%`,
              width: `${6 + (i % 4) * 4}px`,
              height: `${6 + (i % 4) * 4}px`,
              background: ['#6c63ff','#f472b6','#22c55e','#f59e0b','#38bdf8','#fb7185'][i % 6],
              borderRadius: i % 3 === 0 ? '50%' : '3px',
              opacity: 0.3,
              animation: `particleFloat ${3 + (i % 3)}s ease-in-out ${i * 0.35}s infinite alternate`,
              pointerEvents: 'none',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, maxWidth: 1600, margin: '0 auto' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              <h1 style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 900, letterSpacing: -1.5, color: 'var(--text)', lineHeight: 1.15, marginBottom: 8 }}>
                안녕하세요 👋<br />
                <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BizMatch PRO</span>
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text2)', fontWeight: 500 }}>오늘도 최고의 사업자를 모집하세요 🔥</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              {/* LIVE CLOCK */}
              <div style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)', border: '1px solid var(--border2)', borderRadius: 16, padding: '14px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: 2, marginTop: 2 }}>LIVE · KST</div>
              </div>
              {/* MASCOT ROW */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {['🚀','💎','⭐'].map((e, i) => (
                  <Mascot key={i} emoji={e} size={32} style={{ animationDelay: `${i * 0.6}s` }} />
                ))}
              </div>
            </div>
          </div>

          {/* WAVE */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
            <svg viewBox="0 0 1440 70" style={{ display: 'block', animation: 'waveAnim 8s ease-in-out infinite alternate' }}>
              <path fill="var(--bg)" d="M0,40 C200,70 400,10 600,40 C800,70 1000,10 1200,40 C1320,60 1400,30 1440,40 L1440,70 L0,70 Z" />
            </svg>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────── */}
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px 120px' }}>

          {/* STAT CARDS — overlap wave */}
          <div className="grid-4" style={{ marginTop: -44, position: 'relative', zIndex: 2, marginBottom: 24 }}>
            {[
              { label: '총 리드', val: stats.totalLeads, icon: '👥', color: '#6c63ff', sub: '전체 신청자', chart: weeklyData },
              { label: '오늘 신규', val: stats.todayLeads, icon: '⚡', color: '#22c55e', sub: '오늘 등록', chart: weeklyData.map(v => Math.max(0, v - 1)) },
              { label: '연락 중', val: stats.contactingLeads, icon: '📞', color: '#f59e0b', sub: '진행 중', chart: weeklyData.map(v => Math.round(v * 0.6)) },
              { label: '전환율', val: stats.conversionRate, icon: '🎯', color: '#f472b6', sub: `${stats.doneLeads}명 완료`, chart: weeklyData.map(v => Math.round(v * 0.3)), suffix: '%' },
            ].map((s, i) => (
              <div key={s.label} className="card stat-hover" style={{ animationDelay: `${i * 80}ms`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: s.color, opacity: 0.08, filter: 'blur(24px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 26 }}>{s.icon}</span>
                  {loading ? null : <MiniLineChart data={s.chart} color={s.color} />}
                </div>
                <div style={{ fontSize: 'clamp(28px,3vw,38px)', fontWeight: 900, letterSpacing: -1, color: s.color, lineHeight: 1 }}>
                  {loading ? '—' : <Counter value={s.val} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {[
              { href: '/builder',  icon: '✨', label: '랜딩 만들기',  desc: '5분 만에 완성', color: '#6c63ff' },
              { href: '/leads',    icon: '👥', label: '리드 목록',    desc: `총 ${stats.totalLeads}명 관리`, color: '#22c55e' },
              { href: '/messages', icon: '💬', label: '자동화 메시지', desc: 'D+0~D+7 설정', color: '#f59e0b' },
            ].map((a, i) => (
              <Link key={a.href} href={a.href} className="card action-hover" style={{
                display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'var(--text)',
                transition: 'transform 0.2s, box-shadow 0.2s', animationDelay: `${i * 80}ms`,
                border: `1px solid ${a.color}33`,
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: `0 0 16px ${a.color}30` }}>
                  <Mascot emoji={a.icon} size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 18, color: a.color }}>→</div>
              </Link>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="grid-main">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* WEEKLY BAR CHART */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div className="pulse-dot" style={{ background: '#6c63ff', boxShadow: '0 0 8px #6c63ff' }} />
                  <span style={{ fontWeight: 800, fontSize: 15 }}>주간 신청 현황</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>최근 7일</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                  {weeklyData.map((v, i) => {
                    const maxV = Math.max(...weeklyData, 1)
                    const pct = (v / maxV) * 100
                    const isToday = i === todayIdx
                    return (
                      <div key={i} className="bar-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 2px', borderRadius: 8, transition: 'background 0.2s', cursor: 'default' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#6c63ff' : 'var(--text3)' }}>{v}</div>
                        <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, minHeight: 4, borderRadius: 6, background: isToday ? '#6c63ff' : 'var(--surface2)', transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: isToday ? '0 0 12px #6c63ff66' : 'none' }} />
                        <div style={{ fontSize: 10, color: isToday ? '#6c63ff' : 'var(--text3)', fontWeight: isToday ? 800 : 400 }}>{days[i]}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* FUNNEL */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <div className="pulse-dot" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                  <span style={{ fontWeight: 800, fontSize: 15 }}>전환 퍼널</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>실시간</span>
                </div>
                {loading ? [1,2,3].map(i => <div key={i} style={{ marginBottom: 14 }}>{skel(48)}</div>) : funnelData.map((f, i) => <FunnelBar key={f.label} {...f} delay={i * 150} />)}
              </div>

              {/* RECENT LEADS */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pulse-dot" style={{ background: '#f472b6', boxShadow: '0 0 8px #f472b6' }} />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>최근 신청자</span>
                  </div>
                  <Link href="/leads" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>전체 보기 →</Link>
                </div>
                {loading ? [1,2,3,4].map(i => <div key={i} style={{ marginBottom: 10 }}>{skel(52)}</div>)
                  : recentLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
                      <Mascot emoji="📭" size={48} style={{ marginBottom: 12 }} />
                      <p style={{ fontSize: 14, fontWeight: 600 }}>아직 신청자가 없어요</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>랜딩페이지를 만들어 공유해보세요!</p>
                    </div>
                  ) : recentLeads.map(l => <LeadRow key={l.id} lead={l} />)
                }
              </div>
            </div>

            {/* ASIDE */}
            <div className="aside-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* DONUT */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div className="pulse-dot" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                  <span style={{ fontWeight: 800, fontSize: 15 }}>리드 현황</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DonutChart segments={donutData} />
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{stats.totalLeads}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>TOTAL</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  {donutData.map(d => (
                    <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{d.label} {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MASCOT CARD */}
              <div className="card" style={{
                textAlign: 'center', padding: '28px 20px',
                background: 'linear-gradient(135deg, var(--accent-bg), var(--surface))',
                border: '1px solid var(--accent)',
              }}>
                <Mascot emoji="🚀" size={64} />
                <p style={{ fontSize: 16, fontWeight: 900, marginTop: 14, marginBottom: 4 }}>오늘도 파이팅!</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>목표를 향해 달려가세요<br />당신은 할 수 있어요! 💪</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
                  {['⭐','💎','🏆','🎯'].map((e, i) => (
                    <Mascot key={i} emoji={e} size={22} style={{ animationDelay: `${i * 0.5}s` }} />
                  ))}
                </div>
              </div>

              {/* TIP CARD */}
              <div className="card" style={{ background: 'linear-gradient(135deg, #6c63ff18, transparent)' }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>💡 오늘의 팁</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                  신청 후 <strong style={{ color: '#6c63ff' }}>1시간 이내</strong> 연락하면<br />전환율이 <strong style={{ color: '#22c55e' }}>3배</strong> 높아져요!
                </p>
              </div>

              {/* CONVERSION RATE */}
              <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>📈 이번 달 성과</div>
                {[
                  { label: '신규 리드', val: stats.totalLeads, color: '#6c63ff', icon: '👥' },
                  { label: '연락 완료', val: stats.contactingLeads, color: '#f59e0b', icon: '📞' },
                  { label: '전환 완료', val: stats.doneLeads, color: '#22c55e', icon: '✅' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{r.label}</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 16, color: r.color }}>
                      {loading ? '—' : <Counter value={r.val} />}
                      <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 2 }}>명</span>
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: '12px', background: 'var(--bg3)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 4 }}>전환율</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#f472b6' }}>
                    {loading ? '—' : <Counter value={stats.conversionRate} suffix="%" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
