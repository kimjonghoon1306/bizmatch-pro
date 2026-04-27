'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { formatDate, formatRelative, statusLabel, categoryLabel } from '@/lib/utils'
import type { Lead, LandingPage, AutomationSetting } from '@/lib/types'
import { Eye, EyeOff, ToggleLeft, ToggleRight, X, Send } from 'lucide-react'

type Tab = 'overview' | 'members' | 'landing' | 'automation' | 'popup' | 'system'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',   label: '전체 현황',  icon: '📊' },
  { id: 'members',    label: '회원 관리',  icon: '👥' },
  { id: 'landing',    label: '랜딩 관리',  icon: '📄' },
  { id: 'automation', label: '자동화',     icon: '⚡' },
  { id: 'popup',      label: '팝업 관리',  icon: '🔔' },
  { id: 'system',     label: '시스템',     icon: '🔧' },
]

const triggerLabel: Record<string, string> = {
  immediate: '즉시', d1: 'D+1', d3: 'D+3', d7: 'D+7',
}

// ── Shared Card ────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 18, padding: 20, ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 28 }}>{sub}</p>}
    </div>
  )
}

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${color}44`,
      borderRadius: 14, padding: '16px 14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  )
}

// ── POPUP PREVIEW ──────────────────────────────
function PopupPreview({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 24,
        padding: '28px 24px', width: '100%', maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--surface2)', border: 'none', borderRadius: '50%',
          width: 30, height: 30, cursor: 'pointer', color: 'var(--text2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><X size={14} /></button>
        <div style={{ fontSize: 24, marginBottom: 10 }}>📢</div>
        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>{title || '팝업 제목'}</h3>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
          {content || '팝업 내용이 여기에 표시됩니다.'}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: '1px solid var(--border2)', background: 'var(--surface2)',
            color: 'var(--text2)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
          }}>일주일 동안 보지 않기</button>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: 'none', background: 'var(--accent)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
          }}>닫기</button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────
export default function AdminControlPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [leads, setLeads] = useState<Lead[]>([])
  const [pages, setPages] = useState<LandingPage[]>([])
  const [automations, setAutomations] = useState<AutomationSetting[]>([])
  const [loading, setLoading] = useState(true)

  // Popup state
  const [popupTitle, setPopupTitle] = useState('')
  const [popupContent, setPopupContent] = useState('')
  const [popupSchedule, setPopupSchedule] = useState('immediate')
  const [popupScheduleTime, setPopupScheduleTime] = useState('')
  const [popupInterval, setPopupInterval] = useState('0')
  const [showPreview, setShowPreview] = useState(false)
  const [popupSent, setPopupSent] = useState(false)

  // System state

  const supabase = createClient()

  const load = useCallback(async () => {
    const [{ data: l }, { data: p }, { data: a }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('landing_pages').select('*').order('created_at', { ascending: false }),
      supabase.from('automation_settings').select('*').order('created_at'),
    ])
    setLeads(l ?? [])
    setPages(p ?? [])
    setAutomations(a ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleLeadStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l))
  }

  async function handleDeleteLead(id: string) {
    if (!confirm('정말 삭제하시겠어요?')) return
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  async function togglePage(id: string, current: boolean) {
    await supabase.from('landing_pages').update({ is_active: !current }).eq('id', id)
    setPages(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  async function deletePage(id: string) {
    if (!confirm('랜딩페이지를 삭제하시겠어요?')) return
    await supabase.from('landing_pages').delete().eq('id', id)
    setPages(prev => prev.filter(p => p.id !== id))
  }

  async function toggleAuto(id: string, current: boolean) {
    await supabase.from('automation_settings').update({ is_active: !current }).eq('id', id)
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }

  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [landingView, setLandingView] = useState<'admin'|'members'>('admin')
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editOffer, setEditOffer] = useState('')
  const [curPw, setCurPw] = useState('')
  const [newAdminPw, setNewAdminPw] = useState('')
  const [newAdminPw2, setNewAdminPw2] = useState('')
  const [pwChanged, setPwChanged] = useState(false)
  const [pwError, setPwError] = useState('')

  async function savePage(id: string) {
    await supabase.from('landing_pages').update({
      title: editTitle,
      description: editDesc || null,
      contact_phone: editPhone || null,
      offer_text: editOffer || null,
    }).eq('id', id)
    setPages(prev => prev.map(p => p.id === id ? { ...p, title: editTitle, description: editDesc, contact_phone: editPhone, offer_text: editOffer } : p))
    setEditingPage(null)
  }

  function handleChangePw() {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('bizmatch_admin_pw') || '123456') : '123456'
    if (!curPw.trim()) { setPwError('현재 비밀번호를 입력하세요'); return }
    if (curPw !== stored) { setPwError('현재 비밀번호가 틀렸어요'); setCurPw(''); return }
    if (newAdminPw.length < 4) { setPwError('새 비밀번호는 4자 이상'); return }
    if (newAdminPw !== newAdminPw2) { setPwError('비밀번호가 일치하지 않아요'); return }
    localStorage.setItem('bizmatch_admin_pw', newAdminPw)
    setPwChanged(true); setCurPw(''); setNewAdminPw(''); setNewAdminPw2(''); setPwError('')
    setTimeout(() => setPwChanged(false), 3000)
  }


  function sendPopup() {
    if (!popupTitle.trim() || !popupContent.trim()) return
    setPopupSent(true)
    setTimeout(() => setPopupSent(false), 3000)
  }

  function exportCSV() {
    const headers = ['이름', '전화번호', '지역', '상태', '등록일']
    const rows = leads.map(l => [l.name, l.phone, l.region ?? '', statusLabel[l.status], formatDate(l.created_at)])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `회원목록_${new Date().toLocaleDateString('ko-KR')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const totalLeads = leads.length
  const newLeads = leads.filter(l => l.status === 'new').length
  const doneLeads = leads.filter(l => l.status === 'done').length
  const activePages = pages.filter(p => p.is_active).length

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)',
    border: '1.5px solid var(--border)', borderRadius: 10,
    padding: '13px 15px', fontFamily: 'inherit', fontSize: 15,
    color: 'var(--text)', outline: 'none',
  }

  const memberList = Array.from(new Set(pages.filter(p => p.user_id && p.user_id !== 'admin').map(p => p.user_id as string)))
  const filteredPages = pages.filter(p => {
    if (landingView === 'admin') return !p.user_id || p.user_id === 'admin'
    if (selectedMember === 'all') return p.user_id && p.user_id !== 'admin'
    return p.user_id === selectedMember
  })

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .tab-btn { padding:9px 16px;border-radius:100px;border:1.5px solid var(--border2);background:var(--surface);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;white-space:nowrap; }
        .tab-btn.active { background:var(--accent);color:#fff;border-color:var(--accent); }
        .tab-btn:hover:not(.active) { border-color:var(--accent);color:var(--accent); }
        .lead-row:hover { background:var(--surface2); }
        .action-sm { padding:6px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--surface2);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s; }
        .action-sm:hover { border-color:var(--accent);color:var(--accent); }
        .action-danger { border-color:var(--danger-bg)!important;color:var(--danger)!important; }
        input:focus,textarea:focus,select:focus { border-color:var(--accent)!important;box-shadow:0 0 0 3px var(--accent-glow); }
        .grid-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px; }
        @media(max-width:700px){ .grid-stats{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:480px){ .grid-stats{grid-template-columns:repeat(2,1fr);gap:8px} }
      `}</style>

      {showPreview && (
        <PopupPreview title={popupTitle} content={popupContent} onClose={() => setShowPreview(false)} />
      )}

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

        {/* PAGE HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
          borderBottom: '1px solid var(--border)',
          padding: '24px 28px 20px',
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, boxShadow: '0 4px 12px var(--accent-glow)',
                  }}>⚙️</div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>관리자 컨트롤 센터</h1>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 46 }}>모든 기능을 한 곳에서 관리하세요</p>
              </div>
              <ThemeToggle />
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {TABS.map(t => (
                <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 100px' }}>

          {/* ── OVERVIEW ─────────────────────────── */}
          {tab === 'overview' && (
            <div>
              <SectionTitle icon="📊" title="전체 현황" sub="실시간 사업 현황을 확인하세요" />
              <div className="grid-stats">
                <StatBadge label="총 회원" value={totalLeads} color="#6c63ff" />
                <StatBadge label="신규 리드" value={newLeads} color="#22c55e" />
                <StatBadge label="전환 완료" value={doneLeads} color="#f472b6" />
                <StatBadge label="활성 랜딩" value={activePages} color="#f59e0b" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🕐 최근 활동</div>
                  {loading ? <div style={{ color: 'var(--text3)', fontSize: 14 }}>로딩 중...</div> :
                    leads.slice(0, 6).map(l => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                          {l.name.slice(0, 1)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700 }}>{l.name}</span>
                          <span style={{ color: 'var(--text3)', marginLeft: 6 }}>{l.phone}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatRelative(l.created_at)}</span>
                      </div>
                    ))
                  }
                </Card>
                <Card>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📄 랜딩페이지 현황</div>
                  {loading ? <div style={{ color: 'var(--text3)', fontSize: 14 }}>로딩 중...</div> :
                    pages.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>/join/{p.slug}</div>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                          background: p.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: p.is_active ? 'var(--success)' : 'var(--danger)',
                        }}>{p.is_active ? '활성' : '비활성'}</div>
                      </div>
                    ))
                  }
                </Card>

              <Card style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🔑 관리자 비밀번호 변경</div>
                {pwChanged && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>✅ 변경 완료!</div>}
                {pwError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>⚠️ {pwError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                  {[{label:'현재 비밀번호',val:curPw,set:setCurPw},{label:'새 비밀번호(4자↑)',val:newAdminPw,set:setNewAdminPw},{label:'새 비밀번호 확인',val:newAdminPw2,set:setNewAdminPw2}].map(f=>(
                    <div key={f.label}>
                      <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text2)',marginBottom:5}}>{f.label}</label>
                      <input type="password" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.label} style={{width:'100%',background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:10,padding:'11px 13px',fontFamily:'inherit',fontSize:14,color:'var(--text)',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    </div>
                  ))}
                </div>
                <button onClick={handleChangePw} style={{padding:'12px 24px',borderRadius:10,border:'none',background:'var(--accent)',color:'#fff',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 14px var(--accent-glow)'}}>
                  🔑 비밀번호 변경하기
                </button>
              </Card>
              </div>
            </div>
          )}

          {/* ── MEMBERS ──────────────────────────── */}
          {tab === 'members' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <SectionTitle icon="👥" title="회원 관리" sub={`총 ${leads.length}명 · 활동 내역 및 상태 관리`} />
                <button onClick={exportCSV} style={{
                  padding: '10px 18px', borderRadius: 10,
                  border: '1px solid var(--border2)', background: 'var(--surface)',
                  color: 'var(--text)', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>📥 CSV 내보내기</button>
              </div>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)' }}>
                        {['이름', '연락처', '지역', '현직업', '상태', '등록일', '관리'].map(h => (
                          <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text2)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>로딩 중...</td></tr>
                      ) : leads.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: 'var(--text3)', fontSize: 15 }}>📭 회원이 없어요</td></tr>
                      ) : leads.map(l => (
                        <tr key={l.id} className="lead-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                                {l.name.slice(0, 1)}
                              </div>
                              {l.name}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>
                            <a href={`tel:${l.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{l.phone}</a>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{l.region ?? '—'}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{l.current_job ?? '—'}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={l.status}
                              onChange={e => handleLeadStatus(l.id, e.target.value)}
                              style={{
                                background: 'var(--bg3)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '5px 8px', color: 'var(--text)',
                                fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              <option value="new">신규</option>
                              <option value="contact">연락중</option>
                              <option value="done">완료</option>
                              <option value="trash">휴지통</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{formatDate(l.created_at)}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button className="action-sm action-danger" onClick={() => handleDeleteLead(l.id)}>삭제</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── LANDING ──────────────────────────── */}
          {tab === 'landing' && (
            <div>
              <SectionTitle icon="📄" title="랜딩 관리" sub="관리자/회원 랜딩페이지를 분리 관리" />

              {/* 카테고리 탭 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg3)', borderRadius: 12, padding: 4 }}>
                {[
                  { id: 'admin', label: '🔧 관리자 랜딩' },
                  { id: 'members', label: '👥 회원 랜딩' },
                ].map(t => (
                  <button key={t.id} onClick={() => setLandingView(t.id as 'admin'|'members')} style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                    background: landingView === t.id ? 'var(--surface)' : 'transparent',
                    color: landingView === t.id ? 'var(--text)' : 'var(--text3)',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: landingView === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s',
                  }}>{t.label}</button>
                ))}
              </div>

              {/* 회원 선택 (회원 탭일때) */}
              {landingView === 'members' && (
                <div style={{ marginBottom: 14 }}>
                  <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
                    <option value="all">👥 전체 회원 랜딩</option>
                    {memberList.map(m => <option key={m} value={m}>👤 {m}</option>)}
                  </select>
                </div>
              )}

              {loading ? <div style={{ color: 'var(--text3)' }}>로딩 중...</div> :
                filteredPages.length === 0 ? (
                  <Card style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                    <p style={{ fontSize: 15, color: 'var(--text3)' }}>생성된 랜딩페이지가 없어요</p>
                  </Card>
                ) : filteredPages.map(p => (
                  <Card key={p.id} style={{ marginBottom: 12 }}>
                    {editingPage === p.id ? (
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>✏️ 내용 수정</div>
                        {[
                          { label: '제목', val: editTitle, set: setEditTitle, ph: '랜딩 제목' },
                          { label: '설명', val: editDesc, set: setEditDesc, ph: '설명 (선택)' },
                          { label: '담당자 연락처', val: editPhone, set: setEditPhone, ph: '010-0000-0000 (선택)' },
                          { label: '혜택 문구', val: editOffer, set: setEditOffer, ph: '무료 PDF 제공 등 (선택)' },
                        ].map(f => (
                          <div key={f.label} style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>{f.label}</label>
                            <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                              style={{ width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 13px', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="action-sm" onClick={() => setEditingPage(null)}>취소</button>
                          <button onClick={() => savePage(p.id)} style={{ flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>💾 저장</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 800 }}>{p.title}</span>
                            <div style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: p.is_active ? 'var(--success-bg)' : 'var(--danger-bg)', color: p.is_active ? 'var(--success)' : 'var(--danger)' }}>
                              {p.is_active ? '활성' : '비활성'}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                            🔗 /join/{p.slug} · {categoryLabel[p.category as keyof typeof categoryLabel]}
                          </div>
                          {p.contact_phone && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>📞 {p.contact_phone}</div>}
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>수집: {(p.fields as string[]).join(', ')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                          <button className="action-sm" onClick={() => window.open(`/join/${p.slug}`, '_blank')}>미리보기</button>
                          <button className="action-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join/${p.slug}`) }}>링크 복사</button>
                          <button className="action-sm" onClick={() => {
                            setEditingPage(p.id)
                            setEditTitle(p.title)
                            setEditDesc(p.description || '')
                            setEditPhone(p.contact_phone || '')
                            setEditOffer(p.offer_text || '')
                          }}>✏️ 수정</button>
                          <button className="action-sm" onClick={() => togglePage(p.id, p.is_active)}>
                            {p.is_active ? '비활성화' : '활성화'}
                          </button>
                          <button className="action-sm action-danger" onClick={() => deletePage(p.id)}>🗑️ 삭제</button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── AUTOMATION ───────────────────────── */}
          {tab === 'automation' && (
            <div>
              <SectionTitle icon="⚡" title="자동화 설정" sub="자동 메시지 발송 시퀀스를 설정하세요" />
              <Card style={{ marginBottom: 16, background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>💡 사용 가능한 변수</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['{{name}}', '{{phone}}', '{{contact_phone}}'].map(v => (
                    <code key={v} style={{ background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{v}</code>
                  ))}
                </div>
              </Card>
              {automations.map(a => (
                <Card key={a.id} style={{ marginBottom: 12, opacity: a.is_active ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</span>
                      <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                        {triggerLabel[a.trigger_type]}
                      </span>
                    </div>
                    <button onClick={() => toggleAuto(a.id, a.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.is_active ? 'var(--success)' : 'var(--text3)', padding: 0 }}>
                      {a.is_active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                    {a.message_template}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── POPUP ────────────────────────────── */}
          {tab === 'popup' && (
            <div>
              <SectionTitle icon="🔔" title="팝업 관리" sub="회원들에게 팝업 메시지를 발송하세요" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* 작성 폼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Card>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>✏️ 팝업 작성</div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>📌 제목</label>
                      <input value={popupTitle} onChange={e => setPopupTitle(e.target.value)} placeholder="팝업 제목을 입력하세요" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>📝 내용</label>
                      <textarea value={popupContent} onChange={e => setPopupContent(e.target.value)} placeholder="팝업 내용을 입력하세요" rows={4}
                        style={{ ...inputStyle, resize: 'none' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </Card>

                  <Card>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>⏰ 발송 설정</div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>발송 방식</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                          { val: 'immediate', label: '⚡ 즉시 발송' },
                          { val: 'scheduled', label: '📅 예약 발송' },
                          { val: 'interval',  label: '🔄 주기 반복' },
                        ].map(opt => (
                          <button key={opt.val} onClick={() => setPopupSchedule(opt.val)} style={{
                            padding: '9px 16px', borderRadius: 100, cursor: 'pointer',
                            border: `1.5px solid ${popupSchedule === opt.val ? 'var(--accent)' : 'var(--border2)'}`,
                            background: popupSchedule === opt.val ? 'var(--accent)' : 'var(--surface)',
                            color: popupSchedule === opt.val ? '#fff' : 'var(--text2)',
                            fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                          }}>{opt.label}</button>
                        ))}
                      </div>
                    </div>

                    {popupSchedule === 'scheduled' && (
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>📅 예약 시간</label>
                        <input type="datetime-local" value={popupScheduleTime} onChange={e => setPopupScheduleTime(e.target.value)} style={inputStyle} />
                      </div>
                    )}

                    {popupSchedule === 'interval' && (
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>🔄 반복 주기</label>
                        <select value={popupInterval} onChange={e => setPopupInterval(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option value="1">1시간마다</option>
                          <option value="3">3시간마다</option>
                          <option value="6">6시간마다</option>
                          <option value="12">12시간마다</option>
                          <option value="24">매일 1회</option>
                        </select>
                      </div>
                    )}
                  </Card>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowPreview(true)} style={{
                      flex: 1, padding: '14px', borderRadius: 12,
                      border: '1px solid var(--border2)', background: 'var(--surface)',
                      color: 'var(--text)', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Eye size={16} /> 미리보기
                    </button>
                    <button onClick={sendPopup} disabled={!popupTitle.trim() || !popupContent.trim()} style={{
                      flex: 2, padding: '14px', borderRadius: 12,
                      border: 'none',
                      background: popupSent ? 'var(--success)' : (!popupTitle.trim() || !popupContent.trim()) ? 'var(--surface2)' : 'var(--accent)',
                      color: (!popupTitle.trim() || !popupContent.trim()) ? 'var(--text3)' : '#fff',
                      fontWeight: 800, fontSize: 14,
                      cursor: (!popupTitle.trim() || !popupContent.trim()) ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: popupTitle.trim() && popupContent.trim() ? '0 4px 16px var(--accent-glow)' : 'none',
                    }}>
                      {popupSent ? '✅ 발송 완료!' : <><Send size={16} /> {popupSchedule === 'immediate' ? '즉시 발송' : popupSchedule === 'scheduled' ? '예약 등록' : '반복 설정'}</>}
                    </button>
                  </div>
                </div>

                {/* 미리보기 패널 */}
                <div>
                  <Card style={{ background: 'var(--bg3)', border: '2px dashed var(--border2)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, color: 'var(--text2)' }}>👁️ 회원 화면 미리보기</div>
                    <div style={{
                      background: 'var(--surface)', borderRadius: 20,
                      padding: '24px 20px', boxShadow: 'var(--shadow)',
                      textAlign: 'left', position: 'relative',
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 10 }}>📢</div>
                      <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>
                        {popupTitle || '팝업 제목'}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 18 }}>
                        {popupContent || '팝업 내용이 여기에 표시됩니다. 회원들에게 전달할 내용을 왼쪽에서 입력하세요.'}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface2)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', textAlign: 'center' }}>
                          일주일 동안 보지 않기
                        </div>
                        <div style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--accent)', fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                          닫기
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14 }}>실제 회원 화면에서 이렇게 보여요</p>
                  </Card>

                  <Card style={{ marginTop: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>📋 발송 규칙 안내</div>
                    {[
                      { icon: '⚡', title: '즉시 발송', desc: '지금 바로 모든 회원에게 팝업 표시' },
                      { icon: '📅', title: '예약 발송', desc: '지정한 시간에 자동으로 팝업 발송' },
                      { icon: '🔄', title: '주기 반복', desc: '설정한 시간 간격으로 반복 표시' },
                    ].map(r => (
                      <div key={r.title} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 18 }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ── SYSTEM ───────────────────────────── */}
          {tab === 'system' && (
            <div>
              <SectionTitle icon="🔧" title="시스템 설정" sub="환경변수는 Vercel 대시보드에서 설정하세요" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>🤖 AI API 키</div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>관리자용 AI 키예요. 이 기기에만 저장돼요.</p>
                  {[
                    { key: 'admin_gemini', label: 'Gemini API Key', badge: '무료', color: '#22c55e', placeholder: 'AIza...', link: 'https://aistudio.google.com/app/apikey', icon: '🔵' },
                    { key: 'admin_groq', label: 'Groq API Key (Llama 3)', badge: '무료', color: '#22c55e', placeholder: 'gsk_...', link: 'https://console.groq.com/keys', icon: '⚡' },
                    { key: 'admin_openai', label: 'OpenAI API Key (GPT-4o)', badge: '유료', color: '#f59e0b', placeholder: 'sk-...', link: 'https://platform.openai.com/api-keys', icon: '🤖' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{f.icon}</span>
                          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.label}</label>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: `${f.color}22`, color: f.color }}>{f.badge}</span>
                        </div>
                        <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>🔗 발급받기</a>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          placeholder={f.placeholder}
                          defaultValue={typeof window !== 'undefined' ? localStorage.getItem(f.key) || '' : ''}
                          onChange={e => { if (typeof window !== 'undefined') localStorage.setItem(f.key, e.target.value) }}
                          style={{ width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 15px', fontFamily: 'inherit', fontSize: 15, color: 'var(--text)', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { alert('✅ 저장되었어요!') }} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, marginBottom: 8, boxShadow: '0 4px 14px var(--accent-glow)' }}>
                    💾 AI 키 저장하기
                  </button>
                  <div style={{ height: 8 }} />
                  <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>🔒 Supabase/Vercel 설정 방법</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                      Supabase URL, Anon Key는 <strong>Vercel 환경변수</strong>에 설정해요.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { href: 'https://vercel.com/dashboard', icon: '🚀', label: 'Vercel 대시보드 → 환경변수 설정' },
                      { href: 'https://supabase.com/dashboard', icon: '🗄️', label: 'Supabase 대시보드 → API 키 확인' },
                      { href: 'https://solapi.com', icon: '💬', label: '솔라피 → 문자 API 키 발급' },
                      { href: 'https://business.kakao.com', icon: '💛', label: '카카오 비즈 → 알림톡 키 발급' },
                    ].map(l => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 13, transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 18 }}>{l.icon}</span>
                        <span>{l.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 12 }}>→</span>
                      </a>
                    ))}
                  </div>
                </Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Card>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📄 .env.local 설정 예시</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.6 }}>
                      아래 키를 <strong>.env.local</strong> 파일에 입력 후<br />Vercel 환경변수에 그대로 등록하세요.
                    </p>
                    <pre style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, fontSize: 11, color: 'var(--text2)', lineHeight: 1.9, overflowX: 'auto', fontFamily: 'monospace' }}>{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_FROM=`}</pre>
                  </Card>
                  <Card>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>🛠️ 시스템 정보</div>
                    {[
                      { label: 'Next.js', val: '14.x' },
                      { label: 'Supabase', val: '연결됨' },
                      { label: '버전', val: 'v0.1.0' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{r.label}</span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{r.val}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
