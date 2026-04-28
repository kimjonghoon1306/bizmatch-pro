'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const MEMBER_INFO_KEY = 'bizmatch_member_info'
const MEMBER_PW_KEY = 'bizmatch_member_pw'
const MEMBER_AI_KEY = 'bizmatch_member_ai'

interface MemberInfo { name: string; email: string; phone: string; joinDate: string }
interface MyPage { id: string; slug: string; title: string; is_active: boolean; created_at: string; description: string | null; contact_phone: string | null; offer_text: string | null }

type Tab = 'profile' | 'ai' | 'landing'

const AI_CONFIGS = [
  {
    key: 'gemini', label: 'Gemini API Key', icon: '🔵',
    badge: '무료', badgeColor: '#22c55e',
    placeholder: 'AIzaSy...',
    link: 'https://aistudio.google.com/app/apikey', linkText: 'Google AI Studio에서 발급받기',
    desc: 'Google이 만든 AI예요. 무료로 사용할 수 있어요.',
    usage: '글 자동 생성에 사용해요. 오류 시 다른 모델로 자동 전환돼요.',
    quality: '⭐⭐⭐⭐ 무료',
    noKey: false,
  },
  {
    key: 'groq', label: 'Groq API Key', icon: '⚡',
    badge: '무료', badgeColor: '#22c55e',
    placeholder: 'gsk_...',
    link: 'https://console.groq.com/keys', linkText: 'Groq Console에서 발급받기',
    desc: '매우 빠른 속도의 AI예요. 무료로 사용할 수 있어요.',
    usage: 'Gemini 오류 시 자동으로 대체 사용해요.',
    quality: '⭐⭐⭐⭐ 무료',
    noKey: false,
  },
  {
    key: 'openai', label: 'OpenAI API Key', icon: '🤖',
    badge: '유료', badgeColor: '#f59e0b',
    placeholder: 'sk-...',
    link: 'https://platform.openai.com/api-keys', linkText: 'OpenAI Platform에서 발급받기',
    desc: 'ChatGPT 만든 회사의 AI예요. 키 하나로 글 생성(GPT-4o) + 이미지 생성(DALL-E 3) 모두 사용 가능해요.',
    usage: '글 생성 + 고품질 이미지 생성을 동시에 사용해요.',
    quality: '⭐⭐⭐⭐⭐ 유료 · 글+이미지 동시 사용',
    noKey: false,
  },
  {
    key: 'pollinations', label: 'Pollinations (이미지 생성)', icon: '🎨',
    badge: '무료 · 키 불필요', badgeColor: '#8b5cf6',
    placeholder: '키가 필요 없어요 — 바로 사용 가능!',
    link: 'https://pollinations.ai', linkText: 'Pollinations 사이트 보기',
    desc: '텍스트로 이미지를 자동 생성해요. 키 없이 무료로 바로 사용 가능해요. 단, 퀄리티가 다소 낮을 수 있어요.',
    usage: '랜딩페이지 이미지 자동 생성에 사용해요.',
    quality: '⭐⭐⭐ 무료 · 키 불필요',
    noKey: true,
  },
]

function HelpBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
      <div>
        <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [aiKeys, setAiKeys] = useState<Record<string, string>>({})
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
    const { data } = await supabase.from('landing_pages').select('*').eq('user_id', email).order('created_at', { ascending: false })
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
    if (newPw && newPw.length < 6) { trigErr('비밀번호는 6자 이상이어야 해요'); return }
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
    if (!confirm('이 랜딩페이지를 삭제하시겠어요?')) return
    await supabase.from('landing_pages').delete().eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.filter(p => p.id !== id))
    trigOk('삭제되었어요!')
  }

  async function handleSavePage(id: string) {
    if (!editTitle.trim()) { trigErr('제목을 입력하세요'); return }
    await supabase.from('landing_pages').update({ title: editTitle, description: editDesc || null, contact_phone: editPhone || null, offer_text: editOffer || null }).eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.map(p => p.id === id ? { ...p, title: editTitle, description: editDesc, contact_phone: editPhone, offer_text: editOffer } : p))
    setEditingId(null)
    trigOk('수정되었어요!')
  }

  async function toggleMyPage(id: string, current: boolean) {
    await supabase.from('landing_pages').update({ is_active: !current }).eq('id', id).eq('user_id', email)
    setMyPages(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const inp: React.CSSProperties = { width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', fontFamily: 'inherit', fontSize: 15, color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s' }
  const TABS = [{ id: 'profile' as Tab, label: '👤 프로필', desc: '내 정보' }, { id: 'ai' as Tab, label: '🤖 AI 키', desc: 'API 설정' }, { id: 'landing' as Tab, label: '📄 내 랜딩', desc: '페이지 관리' }]

  return (
    <>
      <style>{`
        @keyframes skelPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .set-inp:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-glow) !important; }
        .key-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; margin-bottom: 14px; transition: border-color 0.2s; }
        .key-card:hover { border-color: var(--border2); }
        .action-btn { padding: 8px 14px; border-radius: 9px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2); font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .action-btn:hover { border-color: var(--accent); color: var(--accent); }
        .danger-btn { border-color: var(--danger-bg) !important; background: var(--danger-bg) !important; color: var(--danger) !important; }
      `}</style>

      <div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>내 계정</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>설정</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>프로필, AI 키, 내 랜딩페이지를 관리하세요</p>

        {/* TABS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24, background: 'var(--bg3)', borderRadius: 14, padding: 5 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '12px 8px', borderRadius: 10, border: 'none', background: tab === t.id ? 'var(--surface)' : 'transparent', color: tab === t.id ? 'var(--text)' : 'var(--text3)', fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
              <div>{t.label}</div>
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: 0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {error && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>⚠️ {error}</div>}
        {success && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✅ {success}</div>}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div>
            <HelpBox title="프로필 설정이란?" desc="내 이름, 전화번호, 비밀번호를 변경할 수 있어요. 이메일은 로그인 아이디라 변경이 안돼요." />
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 20 }}>👤</span> 기본 정보</p>
              {[
                { label: '이름', val: name, set: setName, ph: '홍길동', ro: false },
                { label: '이메일 (변경 불가)', val: email, set: () => {}, ph: '', ro: true },
                { label: '전화번호', val: phone, set: setPhone, ph: '010-0000-0000', ro: false },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 13 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>{f.label}</label>
                  <input className="set-inp" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} readOnly={f.ro} style={{ ...inp, opacity: f.ro ? 0.5 : 1, cursor: f.ro ? 'default' : 'text' }} />
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 18 }}>
              <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 20 }}>🔐</span> 비밀번호 변경</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>비밀번호를 바꾸고 싶을 때만 입력하세요. 비워두면 기존 비밀번호 유지돼요.</p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>새 비밀번호 (6자 이상)</label>
                <div style={{ position: 'relative' }}>
                  <input className="set-inp" value={newPw} onChange={e => setNewPw(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="새 비밀번호를 입력하세요" style={{ ...inp, paddingRight: 44 }} />
                  <button onClick={() => setShowPw(!showPw)} type="button" style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text3)' }}>{showPw ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>새 비밀번호 확인</label>
                <input className="set-inp" value={newPw2} onChange={e => setNewPw2(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="비밀번호를 한 번 더 입력하세요" style={inp} />
              </div>
            </div>

            <button onClick={handleSaveProfile} style={{ width: '100%', padding: '16px', borderRadius: 13, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
              💾 저장하기
            </button>
            {joinDate && <div style={{ marginTop: 14, padding: '10px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>가입일: {joinDate}</div>}
          </div>
        )}

        {/* ── AI KEYS ── */}
        {tab === 'ai' && (
          <div>
            <HelpBox title="AI 키란 무엇인가요?" desc="AI 키는 인공지능 서비스를 사용하기 위한 비밀번호예요. 아래에서 각 서비스 키를 입력하고 저장하면 AI 글 자동 생성과 이미지 생성 기능을 사용할 수 있어요." />

            {AI_CONFIGS.map(cfg => (
              <div key={cfg.key} className="key-card">
                {/* 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{cfg.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: `${cfg.badgeColor}22`, color: cfg.badgeColor }}>{cfg.badge}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{cfg.quality}</div>
                    </div>
                  </div>
                  <a href={cfg.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: 'var(--accent-bg)', border: '1px solid var(--accent)', color: 'var(--accent)', textDecoration: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    🔗 발급받기
                  </a>
                </div>

                {/* 설명 */}
                <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 3 }}>📌 {cfg.desc}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>💼 사용처: {cfg.usage}</p>
                </div>

                {/* 입력 */}
                {!cfg.noKey ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      className="set-inp"
                      type={showKeys[cfg.key] ? 'text' : 'password'}
                      value={aiKeys[cfg.key] || ''}
                      onChange={e => setAiKeys(prev => ({ ...prev, [cfg.key]: e.target.value }))}
                      placeholder={cfg.placeholder}
                      style={{ ...inp, paddingRight: 50, fontSize: 14 }}
                    />
                    <button type="button" onClick={() => setShowKeys(prev => ({ ...prev, [cfg.key]: !prev[cfg.key] }))} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text3)' }}>
                      {showKeys[cfg.key] ? '🙈' : '👁️'}
                    </button>
                    {aiKeys[cfg.key] && <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 5, fontWeight: 700 }}>✅ 키가 저장되어 있어요</p>}
                  </div>
                ) : (
                  <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>
                    ✅ 키 없이 바로 사용 가능해요!
                  </div>
                )}
              </div>
            ))}

            <button onClick={handleSaveAi} style={{ width: '100%', padding: '16px', borderRadius: 13, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)', marginTop: 4 }}>
              💾 AI 키 전체 저장하기
            </button>
          </div>
        )}

        {/* ── MY LANDING ── */}
        {tab === 'landing' && (
          <div>
            <HelpBox title="내 랜딩페이지란?" desc="내가 만든 사업자 모집 페이지 목록이에요. 링크를 복사해서 공유하거나, 내용을 수정하거나, 삭제할 수 있어요." />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>📄 내 랜딩페이지</p>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>총 {myPages.length}개</p>
              </div>
              <button onClick={loadMyPages} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🔄 새로고침
              </button>
            </div>

            {!loggedIn ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🔐</div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>로그인 후 이용 가능해요</p>
              </div>
            ) : loadingPages ? (
              [1, 2].map(i => <div key={i} style={{ height: 90, borderRadius: 14, background: 'var(--surface)', marginBottom: 10, animation: 'skelPulse 1.5s infinite' }} />)
            ) : myPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📄</div>
                <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>아직 만든 랜딩페이지가 없어요</p>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>왼쪽 메뉴에서 "랜딩 만들기"를 눌러 시작하세요!</p>
              </div>
            ) : myPages.map(p => (
              <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                {editingId === p.id ? (
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, color: 'var(--accent)' }}>✏️ 내용 수정하기</p>
                    {[
                      { label: '제목 *', val: editTitle, set: setEditTitle, ph: '랜딩 제목' },
                      { label: '설명 (선택)', val: editDesc, set: setEditDesc, ph: '간단한 설명' },
                      { label: '담당자 연락처 (선택)', val: editPhone, set: setEditPhone, ph: '010-0000-0000' },
                      { label: '제공 혜택 (선택)', val: editOffer, set: setEditOffer, ph: '무료 상담, PDF 제공 등' },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 11 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>{f.label}</label>
                        <input className="set-inp" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ ...inp, fontSize: 14, padding: '11px 13px' }} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => setEditingId(null)} className="action-btn" style={{ flex: 1 }}>취소</button>
                      <button onClick={() => handleSavePage(p.id)} style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>💾 저장하기</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>{p.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: p.is_active ? 'var(--success-bg)' : 'var(--danger-bg)', color: p.is_active ? 'var(--success)' : 'var(--danger)' }}>
                            {p.is_active ? '✅ 활성' : '⏸ 비활성'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text3)' }}>🔗 /join/{p.slug}</p>
                        {p.contact_phone && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>📞 {p.contact_phone}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => window.open(`/join/${p.slug}`, '_blank')}>👁️ 미리보기</button>
                      <button className="action-btn" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${p.slug}`)}>🔗 링크 복사</button>
                      <button className="action-btn" onClick={() => { setEditingId(p.id); setEditTitle(p.title); setEditDesc(p.description || ''); setEditPhone(p.contact_phone || ''); setEditOffer(p.offer_text || '') }}>✏️ 수정</button>
                      <button className="action-btn" onClick={() => toggleMyPage(p.id, p.is_active)}>{p.is_active ? '⏸ 비활성화' : '▶ 활성화'}</button>
                      <button className="action-btn danger-btn" onClick={() => handleDeletePage(p.id)}>🗑️ 삭제</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
