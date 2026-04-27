'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { categoryLabel } from '@/lib/utils'

const MEMBER_INFO_KEY = 'bizmatch_member_info'
const MEMBER_PW_KEY = 'bizmatch_member_pw'
const MEMBER_AI_KEY = 'bizmatch_member_ai'

interface MemberInfo { name: string; email: string; phone: string; joinDate: string }
interface AiKeys { gemini: string; groq: string; openai: string }
interface MyPage { id: string; slug: string; title: string; is_active: boolean; created_at: string; description: string | null; contact_phone: string | null; offer_text: string | null }

type Tab = 'profile' | 'ai' | 'landing'

const AI_PROVIDERS = [
  { key: 'gemini', label: 'Gemini API Key', badge: '무료', color: '#22c55e', placeholder: 'AIza...', link: 'https://aistudio.google.com/app/apikey', icon: '🔵' },
  { key: 'groq', label: 'Groq API Key (Llama 3)', badge: '무료', color: '#22c55e', placeholder: 'gsk_...', link: 'https://console.groq.com/keys', icon: '⚡' },
  { key: 'openai', label: 'OpenAI API Key (GPT-4o)', badge: '유료', color: '#f59e0b', placeholder: 'sk-...', link: 'https://platform.openai.com/api-keys', icon: '🤖' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [aiKeys, setAiKeys] = useState<AiKeys>({ gemini: '', groq: '', openai: '' })
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [myPages, setMyPages] = useState<MyPage[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editOffer, setEditOffer] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loadingPages, setLoadingPages] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const info = localStorage.getItem(MEMBER_INFO_KEY)
    if (info) {
      const mi: MemberInfo = JSON.parse(info)
      setName(mi.name); setPhone(mi.phone); setEmail(mi.email); setJoinDate(mi.joinDate)
      setLoggedIn(true)
    }
    const keys = localStorage.getItem(MEMBER_AI_KEY)
    if (keys) setAiKeys(JSON.parse(keys))
  }, [])

  const loadMyPages = useCallback(async () => {
    if (!email) return
    setLoadingPages(true)
    const { data } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', email)
      .order('created_at', { ascending: false })
    setMyPages(data ?? [])
    setLoadingPages(false)
  }, [email])

  useEffect(() => {
    if (tab === 'landing' && email) loadMyPages()
  }, [tab, email, loadMyPages])

  function trigErr(msg: string) { setError(msg); setTimeout(() => setError(''), 3500) }
  function trigOk(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }

  function handleSaveProfile() {
    if (!loggedIn) { trigErr('로그인 후 저장 가능해요'); return }
    if (!name.trim()) { trigErr('이름을 입력하세요'); return }
    if (newPw && newPw.length < 6) { trigErr('비밀번호는 6자 이상'); return }
    if (newPw && newPw !== newPw2) { trigErr('비밀번호가 일치하지 않아요'); return }
    const info: MemberInfo = { name, email, phone, joinDate }
    localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(info))
    if (newPw) localStorage.setItem(MEMBER_PW_KEY, newPw)
    setNewPw(''); setNewPw2('')
    trigOk('저장되었어요!')
  }

  function handleSaveAi() {
    localStorage.setItem(MEMBER_AI_KEY, JSON.stringify(aiKeys))
    trigOk('AI 키가 저장되었어요!')
  }

  async function handleDeletePage(id: string) {
    if (!confirm('랜딩페이지를 삭제하시겠어요?')) return
    await supabase.from('landing_pages').delete().eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.filter(p => p.id !== id))
  }

  async function handleSavePage(id: string) {
    if (!editTitle.trim()) { trigErr('제목을 입력하세요'); return }
    await supabase.from('landing_pages').update({
      title: editTitle,
      description: editDesc || null,
      contact_phone: editPhone || null,
      offer_text: editOffer || null,
    }).eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.map(p => p.id === id ? { ...p, title: editTitle, description: editDesc, contact_phone: editPhone, offer_text: editOffer } : p))
    setEditingId(null)
    trigOk('수정되었어요!')
  }

  async function toggleMyPage(id: string, current: boolean) {
    await supabase.from('landing_pages').update({ is_active: !current }).eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', fontFamily: 'inherit',
    fontSize: 15, color: 'var(--text)', outline: 'none',
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: '프로필', icon: '👤' },
    { id: 'ai', label: 'AI 키', icon: '🤖' },
    { id: 'landing', label: '내 랜딩', icon: '📄' },
  ]

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>내 계정</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 20 }}>설정</h1>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg3)', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px', borderRadius: 8, border: 'none',
            background: tab === t.id ? 'var(--surface)' : 'transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--text3)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>⚠️ {error}</div>}
      {success && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✅ {success}</div>}

      {/* PROFILE */}
      {tab === 'profile' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>👤 기본 정보</p>
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>이름</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inp} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>이메일</label>
              <input value={email} readOnly style={{ ...inp, opacity: 0.6, cursor: 'default' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>전화번호</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={inp} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>🔐 비밀번호 변경</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>변경하지 않으려면 비워두세요</p>
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>새 비밀번호 (6자 이상)</label>
              <div style={{ position: 'relative' }}>
                <input value={newPw} onChange={e => setNewPw(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="새 비밀번호" style={{ ...inp, paddingRight: 44 }} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button onClick={() => setShowPw(!showPw)} type="button" style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)' }}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>새 비밀번호 확인</label>
              <input value={newPw2} onChange={e => setNewPw2(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="비밀번호 재입력" style={inp} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          <button onClick={handleSaveProfile} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
            💾 저장하기
          </button>
          {joinDate && <div style={{ marginTop: 14, padding: '10px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>가입일: {joinDate}</div>}
        </div>
      )}

      {/* AI KEYS */}
      {tab === 'ai' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>🤖 AI API 키</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>AI 글 생성에 사용되는 본인 API 키예요. 이 기기에만 저장돼요.</p>
            {AI_PROVIDERS.map(p => (
              <div key={p.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</label>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: `${p.color}22`, color: p.color }}>{p.badge}</span>
                  </div>
                  <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>🔗 발급받기</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showKeys[p.key] ? 'text' : 'password'} value={aiKeys[p.key as keyof AiKeys]} onChange={e => setAiKeys(prev => ({ ...prev, [p.key]: e.target.value }))} placeholder={p.placeholder} style={{ ...inp, paddingRight: 44 }} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <button type="button" onClick={() => setShowKeys(prev => ({ ...prev, [p.key]: !prev[p.key] }))} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)' }}>
                    {showKeys[p.key] ? '🙈' : '👁️'}
                  </button>
                </div>
                {aiKeys[p.key as keyof AiKeys] && <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>✅ 저장된 키 있음</p>}
              </div>
            ))}
          </div>
          <button onClick={handleSaveAi} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
            💾 AI 키 저장하기
          </button>
        </div>
      )}

      {/* MY LANDING PAGES */}
      {tab === 'landing' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16 }}>📄 내 랜딩페이지</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>총 {myPages.length}개</p>
            </div>
            <button onClick={loadMyPages} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              🔄 새로고침
            </button>
          </div>

          {!loggedIn ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
              <p style={{ fontSize: 14, fontWeight: 700 }}>로그인 후 이용 가능해요</p>
            </div>
          ) : loadingPages ? (
            [1,2].map(i => <div key={i} style={{ height: 80, borderRadius: 14, background: 'var(--surface2)', marginBottom: 10, animation: 'skelPulse 1.5s infinite' }} />)
          ) : myPages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>아직 만든 랜딩페이지가 없어요</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>랜딩 만들기에서 새로 만들어보세요!</p>
            </div>
          ) : myPages.map(p => (
            <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
              {editingId === p.id ? (
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✏️ 수정하기</p>
                  {[
                    { label: '제목', val: editTitle, set: setEditTitle, ph: '랜딩 제목', req: true },
                    { label: '설명', val: editDesc, set: setEditDesc, ph: '설명 (선택)' },
                    { label: '담당자 연락처', val: editPhone, set: setEditPhone, ph: '010-0000-0000 (선택)' },
                    { label: '혜택 문구', val: editOffer, set: setEditOffer, ph: '무료 PDF 등 (선택)' },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>{f.label}</label>
                      <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ ...inp, fontSize: 14, padding: '10px 12px' }} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>취소</button>
                    <button onClick={() => handleSavePage(p.id)} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 10px var(--accent-glow)' }}>💾 저장</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{p.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: p.is_active ? 'var(--success-bg)' : 'var(--danger-bg)', color: p.is_active ? 'var(--success)' : 'var(--danger)' }}>
                          {p.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>🔗 /join/{p.slug}</p>
                      {p.contact_phone && <p style={{ fontSize: 12, color: 'var(--text2)' }}>📞 {p.contact_phone}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => window.open(`/join/${p.slug}`, '_blank')} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>👁️ 보기</button>
                    <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${p.slug}`)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔗 링크복사</button>
                    <button onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditDesc(p.description || ''); setEditPhone(p.contact_phone || ''); setEditOffer(p.offer_text || '') }} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ 수정</button>
                    <button onClick={() => toggleMyPage(p.id, p.is_active)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{p.is_active ? '⏸ 비활성' : '▶ 활성화'}</button>
                    <button onClick={() => handleDeletePage(p.id)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--danger-bg)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ 삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
