'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatsCard } from '@/components/admin/StatsCard'
import { LeadCard } from '@/components/admin/LeadCard'
import { formatDate } from '@/lib/utils'
import type { Lead, DashboardStats } from '@/lib/types'
import { PlusSquare, ChevronRight, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0, todayLeads: 0, contactingLeads: 0, doneLeads: 0, conversionRate: 0,
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .neq('status', 'trash')
        .order('created_at', { ascending: false })

      if (!leads) { setLoading(false); return }

      const todayLeads = leads.filter(l => new Date(l.created_at) >= today).length
      const contactingLeads = leads.filter(l => l.status === 'contact').length
      const doneLeads = leads.filter(l => l.status === 'done').length
      const rate = leads.length > 0 ? Math.round((doneLeads / leads.length) * 100) : 0

      setStats({
        totalLeads: leads.length,
        todayLeads,
        contactingLeads,
        doneLeads,
        conversionRate: rate,
      })
      setRecentLeads(leads.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const funnelData = [
    { label: '신청 접수', value: stats.totalLeads, pct: 100, color: 'var(--accent)' },
    { label: '연락 완료', value: stats.contactingLeads + stats.doneLeads, pct: stats.totalLeads > 0 ? Math.round(((stats.contactingLeads + stats.doneLeads) / stats.totalLeads) * 100) : 0, color: 'var(--warning)' },
    { label: '최종 전환', value: stats.doneLeads, pct: stats.totalLeads > 0 ? Math.round((stats.doneLeads / stats.totalLeads) * 100) : 0, color: 'var(--success)' },
  ]

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8 }}>대시보드</h1>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatsCard label="총 리드" value={loading ? '…' : stats.totalLeads} sub="전체 신청자" color="accent" />
        <StatsCard label="오늘 신규" value={loading ? '…' : stats.todayLeads} sub="오늘 등록" color="success" />
        <StatsCard label="연락 중" value={loading ? '…' : stats.contactingLeads} sub="진행 중" color="warning" />
        <StatsCard label="전환율" value={loading ? '…' : `${stats.conversionRate}%`} sub={`${stats.doneLeads}명 완료`} color="accent" />
      </div>

      {/* QUICK ACTION */}
      <Link href="/builder" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'var(--accent)',
          borderRadius: 14, padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
          boxShadow: '0 4px 20px var(--accent-glow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlusSquare size={20} color="#fff" />
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>새 랜딩페이지 만들기</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>5분 안에 완성</p>
            </div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.8)" />
        </div>
      </Link>

      {/* FUNNEL */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14, padding: '18px 16px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={16} color="var(--accent)" />
          <p style={{ fontWeight: 800, fontSize: 16 }}>전환 퍼널</p>
        </div>
        {funnelData.map((f) => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.value}명 ({f.pct}%)</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100,
                background: f.color,
                width: `${f.pct}%`,
                transition: 'width 1s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* RECENT LEADS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: 16 }}>최근 신청자</p>
          <Link href="/leads" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            전체 보기 →
          </Link>
        </div>
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ height: 74, borderRadius: 14, marginBottom: 10 }} className="skeleton" />
          ))
        ) : recentLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
            <p style={{ fontSize: 14 }}>아직 신청자가 없어요</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>랜딩페이지를 만들어 공유해보세요!</p>
          </div>
        ) : (
          recentLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}
