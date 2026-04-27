'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadCard } from '@/components/admin/LeadCard'
import { statusLabel } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/lib/types'
import { Search, Download } from 'lucide-react'

const filterTabs: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all',     label: '전체' },
  { value: 'new',     label: '신규' },
  { value: 'contact', label: '연락중' },
  { value: 'done',    label: '완료' },
  { value: 'trash',   label: '휴지통' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [tab, setTab] = useState<LeadStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [pages, setPages] = useState<{id:string;title:string;slug:string}[]>([])
  const [pageFilter, setPageFilter] = useState<string>('all')

  const loadLeads = useCallback(async () => {
    const [{ data: leadsData }, { data: pagesData }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('landing_pages').select('id,title,slug').order('created_at', { ascending: false }),
    ])
    setLeads(leadsData ?? [])
    setPages(pagesData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadLeads() }, [loadLeads])

  useEffect(() => {
    let result = leads
    if (tab !== 'all') result = result.filter(l => l.status === tab)
    if (pageFilter !== 'all') result = result.filter(l => l.landing_page_id === pageFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.region ?? '').includes(q)
      )
    }
    setFiltered(result)
  }, [leads, tab, search, pageFilter])

  async function handleStatusChange(id: string, status: LeadStatus) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  async function handleDelete(id: string) {
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  function exportCSV() {
    const headers = ['이름', '전화번호', '카톡ID', '지역', '현직업', '상태', '등록일']
    const rows = filtered.map(l => [
      l.name, l.phone, l.kakao_id ?? '', l.region ?? '',
      l.current_job ?? '', statusLabel[l.status], l.created_at,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `리드목록_${new Date().toLocaleDateString('ko-KR')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const countByStatus = (s: LeadStatus | 'all') =>
    s === 'all' ? leads.length : leads.filter(l => l.status === s).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>총 {leads.length}명</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8 }}>리드 목록</h1>
        </div>
        <button
          onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            border: '1px solid var(--border2)',
            background: 'var(--surface)',
            color: 'var(--text2)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          type="text"
          placeholder="이름, 전화번호, 지역으로 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 10, padding: '12px 16px 12px 38px',
            fontFamily: 'inherit', fontSize: 15, color: 'var(--text)',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* 랜딩페이지 필터 */}
      {pages.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <select value={pageFilter} onChange={e => setPageFilter(e.target.value)}
            style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
            <option value="all">📄 전체 랜딩페이지</option>
            {pages.map(p => (
              <option key={p.id} value={p.id}>📌 {p.title} (/join/{p.slug})</option>
            ))}
          </select>
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              padding: '7px 14px', borderRadius: 100,
              background: tab === t.value ? 'var(--accent)' : 'var(--surface)',
              color: tab === t.value ? '#fff' : 'var(--text2)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
              border: `1.5px solid ${tab === t.value ? 'var(--accent)' : 'var(--border2)'}`,
              transition: 'all 0.15s',
            }}
          >
            {t.label} {countByStatus(t.value)}
          </button>
        ))}
      </div>

      {/* LEADS LIST */}
      {loading ? (
        [1,2,3,4].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 14, marginBottom: 10 }} className="skeleton" />
        ))
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🔍</p>
          <p style={{ fontSize: 15 }}>검색 결과가 없어요</p>
        </div>
      ) : (
        filtered.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  )
}
