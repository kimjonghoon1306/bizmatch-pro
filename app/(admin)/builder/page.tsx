'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug, categoryLabel, categoryEmoji } from '@/lib/utils'
import type { LandingCategory } from '@/lib/types'
import { Copy, ExternalLink, CheckCircle, Eye, X } from 'lucide-react'

type Step = 'category' | 'ai' | 'template' | 'content' | 'fields' | 'done'

const categories: LandingCategory[] = ['network','franchise','startup','beauty','edu','custom']

// ── 10가지 템플릿 ──────────────────────────────────
const TEMPLATES = [
  { id: 'impact',     name: '🔥 임팩트',      desc: '강렬한 빨강/주황',   primary: '#ef4444', secondary: '#f97316', bg: '#1a0000', text: '#fff' },
  { id: 'premium',    name: '💎 프리미엄',    desc: '블랙/골드',          primary: '#d4af37', secondary: '#b8962e', bg: '#0a0a0a', text: '#f5f5f5' },
  { id: 'nature',     name: '🌿 자연',        desc: '초록/민트',          primary: '#22c55e', secondary: '#10b981', bg: '#f0fdf4', text: '#1a2e1a' },
  { id: 'trust',      name: '💙 신뢰',        desc: '파랑/네이비',        primary: '#3b82f6', secondary: '#1d4ed8', bg: '#eff6ff', text: '#1e3a5f' },
  { id: 'emotion',    name: '🌸 감성',        desc: '핑크/보라',          primary: '#ec4899', secondary: '#8b5cf6', bg: '#fdf4ff', text: '#4a1a4a' },
  { id: 'tech',       name: '⚡ 테크',        desc: '다크/네온',          primary: '#00ff88', secondary: '#00d4ff', bg: '#0a0a1a', text: '#e0ffe0' },
  { id: 'news',       name: '📰 뉴스',        desc: '흑백/클린',          primary: '#111111', secondary: '#555555', bg: '#ffffff', text: '#111111' },
  { id: 'sales',      name: '🎯 세일즈',      desc: '주황/강조',          primary: '#f59e0b', secondary: '#ef4444', bg: '#fffbeb', text: '#1a0f00' },
  { id: 'success',    name: '🏆 성공',        desc: '골드/브라운',        primary: '#b45309', secondary: '#d97706', bg: '#fefce8', text: '#1a1000' },
  { id: 'creative',   name: '🎨 크리에이티브', desc: '알록달록',           primary: '#8b5cf6', secondary: '#ec4899', bg: '#fafafa', text: '#1a1a2e' },
]

// ── 템플릿으로 HTML 생성 ────────────────────────────
function buildTemplateHtml(templateId: string, title: string, content: string): string {
  const tpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0]

  // 마커 파싱
  const faqMatch = content.match(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/)
  const refMatch  = content.match(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/)
  const relMatch  = content.match(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/)

  let mainContent = content
    .replace(/\[FAQ시작\][\s\S]*?\[FAQ끝\]/g, '')
    .replace(/\[참고자료시작\][\s\S]*?[\[참고자료끝\]/g, '')
    .replace(/\[관련글시작\][\s\S]*?\[관련글끝\]/g, '')
    .trim()

  // 본문 변환
  const lines = mainContent.split('\n')
  let htmlBody = ''
  let h2count = 0
  for (const line of lines) {
    if (!line.trim()) { htmlBody += '<br>'; continue }
    if (line.startsWith('## ')) {
      h2count++
      htmlBody += `<h2 style="font-size:20px;font-weight:800;margin:28px 0 12px;color:${tpl.primary};display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${tpl.primary};color:#fff;font-size:12px;font-weight:800;flex-shrink:0">${h2count}</span>${line.slice(3)}</h2>`
    } else if (line.startsWith('[팁]')) {
      htmlBody += `<div style="background:${tpl.primary}15;border-left:4px solid ${tpl.primary};border-radius:0 10px 10px 0;padding:12px 16px;margin:12px 0;font-size:14px;color:${tpl.text}">💡 ${line.slice(4).trim()}</div>`
    } else if (line.startsWith('[주의]')) {
      htmlBody += `<div style="background:#ef444415;border-left:4px solid #ef4444;border-radius:0 10px 10px 0;padding:12px 16px;margin:12px 0;font-size:14px;color:${tpl.text}">⚠️ ${line.slice(5).trim()}</div>`
    } else if (line.startsWith('[중요]')) {
      htmlBody += `<div style="background:${tpl.secondary}15;border-left:4px solid ${tpl.secondary};border-radius:0 10px 10px 0;padding:12px 16px;margin:12px 0;font-size:14px;color:${tpl.text};font-weight:700">📌 ${line.slice(5).trim()}</div>`
    } else {
      htmlBody += `<p style="font-size:15px;line-height:1.8;margin:0 0 10px;color:${tpl.text}">${line}</p>`
    }
  }

  // FAQ
  let faqHtml = ''
  if (faqMatch) {
    const faqLines = faqMatch[1].trim().split('\n').filter(Boolean)
    const faqs: {q:string;a:string}[] = []
    for (let i = 0; i < faqLines.length; i++) {
      const l = faqLines[i]
      if (/^Q\d+:/.test(l)) faqs.push({ q: l.replace(/^Q\d+:\s*/, ''), a: '' })
      else if (/^A\d+:/.test(l) && faqs.length > 0) faqs[faqs.length-1].a = l.replace(/^A\d+:\s*/, '')
    }
    if (faqs.length > 0) {
      faqHtml = `<div style="margin:32px 0"><h3 style="font-size:18px;font-weight:800;margin:0 0 16px;color:${tpl.primary}">❓ 자주 묻는 질문</h3>${faqs.map((f,i) => `<div style="margin-bottom:12px;border:1px solid ${tpl.primary}30;border-radius:12px;overflow:hidden"><div style="background:${tpl.primary}15;padding:12px 16px;font-weight:700;font-size:14px;color:${tpl.primary}">Q${i+1}. ${f.q}</div><div style="padding:12px 16px;font-size:14px;line-height:1.7;color:${tpl.text}">${f.a}</div></div>`).join('')}</div>`
    }
  }

  // 참고자료
  let refHtml = ''
  if (refMatch) {
    const refLines = refMatch[1].trim().split('\n').filter(l => /^LINK\d+:/.test(l))
    if (refLines.length > 0) {
      refHtml = `<div style="margin:28px 0"><h3 style="font-size:16px;font-weight:800;margin:0 0 12px;color:${tpl.primary}">🔗 참고자료</h3>${refLines.map(l => {
        const parts = l.replace(/^LINK\d+:\s*/, '').split('|')
        const name = parts[0]||''; const desc = parts[1]||''; const url = parts[2]||'#'
        return `<a href="${url.trim()}" target="_blank" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${tpl.primary}08;border:1px solid ${tpl.primary}25;border-radius:10px;text-decoration:none;margin-bottom:8px"><div><div style="font-weight:700;color:${tpl.primary};font-size:14px">${name.trim()}</div><div style="color:${tpl.text};opacity:0.6;font-size:12px;margin-top:2px">${desc.trim()}</div></div><span style="color:${tpl.primary};font-size:16px">→</span></a>`
      }).join('')}</div>`
    }
  }

  // 관련글
  let relHtml = ''
  if (relMatch) {
    const relLines = relMatch[1].trim().split('\n').filter(l => /^POST\d+:/.test(l))
    if (relLines.length > 0) {
      relHtml = `<div style="margin:28px 0"><h3 style="font-size:16px;font-weight:800;margin:0 0 12px;color:${tpl.primary}">📚 관련 글</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">${relLines.map(l => {
        const parts = l.replace(/^POST\d+:\s*/, '').split('|')
        return `<div style="padding:14px;background:${tpl.primary}08;border:1px solid ${tpl.primary}25;border-radius:10px"><div style="font-weight:700;font-size:13px;color:${tpl.primary};margin-bottom:4px">${(parts[0]||'').trim()}</div><div style="font-size:12px;color:${tpl.text};opacity:0.6">${(parts[1]||'').trim()}</div></div>`
      }).join('')}</div></div>`
    }
  }

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;padding:0;background:${tpl.bg};font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif">
<div style="max-width:800px;margin:0 auto;padding:40px 20px">
  <div style="text-align:center;margin-bottom:40px;padding:40px 24px;background:linear-gradient(135deg,${tpl.primary},${tpl.secondary});border-radius:20px">
    <h1 style="font-size:clamp(24px,4vw,36px);font-weight:900;color:#fff;margin:0 0 12px;letter-spacing:-1px;line-height:1.2">${title}</h1>
    <div style="width:60px;height:3px;background:rgba(255,255,255,0.5);border-radius:2px;margin:0 auto"></div>
  </div>
  <div style="background:${tpl.bg === '#ffffff' ? '#f9f9f9' : tpl.bg};border:1px solid ${tpl.primary}20;border-radius:16px;padding:32px 28px;margin-bottom:24px">
    ${htmlBody}
  </div>
  ${faqHtml}${refHtml}${relHtml}
</div>
</body></html>`
}

// ── AI 키 가져오기 ─────────────────────────────────
function getAiKeys() {
  if (typeof window === 'undefined') return { gemini: '', groq: '', openai: '' }
  // 관리자 키 우선, 없으면 회원 키
  return {
    gemini: localStorage.getItem('admin_gemini') || localStorage.getItem('bizmatch_member_ai') && JSON.parse(localStorage.getItem('bizmatch_member_ai') || '{}').gemini || '',
    groq:   localStorage.getItem('admin_groq')   || localStorage.getItem('bizmatch_member_ai') && JSON.parse(localStorage.getItem('bizmatch_member_ai') || '{}').groq   || '',
    openai: localStorage.getItem('admin_openai') || localStorage.getItem('bizmatch_member_ai') && JSON.parse(localStorage.getItem('bizmatch_member_ai') || '{}').openai || '',
  }
}

// ── MAIN ──────────────────────────────────────────
export default function BuilderPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<LandingCategory>('network')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('impact')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [offer, setOffer] = useState('')
  const [fields, setFields] = useState(['name', 'phone'])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const supabase = createClient()

  const allFields = ['name','phone','kakao','age','region','job','income','time']
  const fieldLabel: Record<string,string> = {
    name:'이름', phone:'전화번호', kakao:'카톡 ID', age:'나이',
    region:'지역', job:'현직업', income:'희망 수입', time:'가능 시간',
  }

  function toggleField(f: string) {
    if (f === 'name' || f === 'phone') return
    setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function handleGenerate() {
    if (!topic.trim()) { setGenError('주제를 입력해주세요'); return }
    const keys = getAiKeys()
    const key = aiProvider === 'gemini' ? keys.gemini : aiProvider === 'groq' ? keys.groq : keys.openai
    if (!key) { setGenError(`${aiProvider} API 키가 없어요. 설정에서 입력해주세요.`); return }
    setGenerating(true); setGenError('')
    try {
      const resp = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, apiKey: key, keyword: topic, language: 'ko', minChars: 800 }),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'AI 생성 실패')
      }
      const data = await resp.json()
      const content = data.content || ''
      // 첫 줄을 제목으로
      const lines = content.split('\n').filter((l: string) => l.trim())
      const firstLine = lines[0] || topic
      setGeneratedTitle(firstLine.replace(/^#+\s*/, ''))
      setGeneratedContent(content)
      setTitle(firstLine.replace(/^#+\s*/, ''))
      setDescription(lines.slice(1, 3).join(' ').slice(0, 100))
      setStep('template')
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'AI 생성 중 오류가 발생했어요')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setLoading(true)
    const newSlug = generateSlug(title)
    const { error } = await supabase.from('landing_pages').insert({
      slug: newSlug, title: title.trim(),
      description: description.trim() || null,
      category, contact_phone: phone.trim() || null,
      offer_text: offer.trim() || null,
      fields, is_active: true,
    })
    if (!error) { setSlug(newSlug); setDone(true) }
    setLoading(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const previewHtml = buildTemplateHtml(selectedTemplate, generatedTitle || title, generatedContent)

  // ── DONE ────────────────────────────────────────
  if (done) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${slug}`
    return (
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>완성!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 14 }}>링크를 공유하세요!</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
          <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: copied ? 'var(--success)' : 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}{copied ? '복사됨!' : '복사'}
          </button>
        </div>
        <a href={`/join/${slug}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, marginBottom: 12, background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          <ExternalLink size={16} /> 페이지 미리보기
        </a>
        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
          대시보드로 이동
        </button>
      </div>
    )
  }

  const stepNum = { category: 1, ai: 2, template: 3, content: 4, fields: 5, done: 6 }[step]
  const totalSteps = 5

  return (
    <>
      {/* PREVIEW MODAL */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>👁️ 미리보기</span>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}><X size={20} /></button>
          </div>
          <iframe srcDoc={previewHtml} style={{ flex: 1, border: 'none', width: '100%' }} />
        </div>
      )}

      <div>
        {/* PROGRESS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Step {stepNum} / {totalSteps}</p>
        </div>
        <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 100, marginBottom: 28 }}>
          <div style={{ height: '100%', borderRadius: 100, background: 'var(--accent)', width: `${(stepNum / totalSteps) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* STEP 1: CATEGORY */}
        {step === 'category' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>랜딩 만들기</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>업종을 선택하세요</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ padding: '16px 12px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`, background: category === c ? 'var(--accent-bg)' : 'var(--surface)', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{categoryEmoji[c]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: category === c ? 'var(--accent)' : 'var(--text)' }}>{categoryLabel[c]}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('ai')} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
              다음 →
            </button>
          </div>
        )}

        {/* STEP 2: AI 생성 */}
        {step === 'ai' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>AI 글 생성</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>주제를 입력하면 AI가 자동으로 글을 써드려요</p>

            {/* AI 선택 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>AI 선택</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'gemini', label: '🔵 Gemini', badge: '무료' },
                  { id: 'groq',   label: '⚡ Groq',   badge: '무료' },
                  { id: 'openai', label: '🤖 GPT-4o', badge: '유료' },
                ].map(p => (
                  <button key={p.id} onClick={() => setAiProvider(p.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${aiProvider === p.id ? 'var(--accent)' : 'var(--border2)'}`, background: aiProvider === p.id ? 'var(--accent-bg)' : 'var(--surface)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: aiProvider === p.id ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {p.label}<br /><span style={{ fontSize: 10, opacity: 0.7 }}>{p.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 주제 입력 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>주제 / 키워드</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} placeholder="예) 네트워크 마케팅 파트너 모집, 프랜차이즈 창업" style={{ width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', fontFamily: 'inherit', fontSize: 16, color: 'var(--text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {genError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>⚠️ {genError}</div>}

            <button onClick={handleGenerate} disabled={generating || !topic.trim()} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: generating ? 'var(--surface2)' : 'var(--accent)', color: generating ? 'var(--text3)' : '#fff', fontSize: 16, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: !generating ? '0 4px 16px var(--accent-glow)' : 'none', marginBottom: 10, transition: 'all 0.2s' }}>
              {generating ? '✨ AI가 글을 쓰고 있어요...' : '✨ AI로 글 생성하기'}
            </button>
            <button onClick={() => setStep('category')} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← 이전</button>
          </div>
        )}

        {/* STEP 3: 템플릿 선택 */}
        {step === 'template' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>템플릿 선택</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>원하는 디자인을 골라주세요</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{ padding: '16px 12px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${selectedTemplate === t.id ? t.primary : 'var(--border)'}`, background: selectedTemplate === t.id ? `${t.primary}18` : 'var(--surface)', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3, color: selectedTemplate === t.id ? t.primary : 'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.desc}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.primary }} />
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.secondary }} />
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.bg, border: '1px solid var(--border)' }} />
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button onClick={() => setShowPreview(true)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Eye size={16} /> 미리보기
              </button>
              <button onClick={() => setStep('content')} style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)' }}>
                이 템플릿 선택 →
              </button>
            </div>
            <button onClick={() => setStep('ai')} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← 이전</button>
          </div>
        )}

        {/* STEP 4: 내용 수정 */}
        {step === 'content' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>내용 수정</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>AI가 생성한 내용을 확인하고 수정하세요</p>
            {[
              { label: '📌 제목', id: 'title', value: title, setter: setTitle as (v: string) => void, placeholder: '모집 페이지 제목', req: true },
              { label: '📝 설명', id: 'desc', value: description, setter: setDescription, placeholder: '간단한 설명', multi: true },
              { label: '📞 담당자 연락처', id: 'phone', value: phone, setter: setPhone, placeholder: '010-0000-0000' },
              { label: '🎁 무료 제공 혜택', id: 'offer', value: offer, setter: setOffer, placeholder: '예) 무료 PDF 제공' },
            ].map(f => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>{f.label}{f.req && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
                {f.multi ? (
                  <textarea value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} rows={3} style={{ width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 15px', fontFamily: 'inherit', fontSize: 16, color: 'var(--text)', outline: 'none', resize: 'none' }} />
                ) : (
                  <input type="text" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 15px', fontFamily: 'inherit', fontSize: 16, color: 'var(--text)', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('template')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← 이전</button>
              <button onClick={() => title.trim() && setStep('fields')} disabled={!title.trim()} style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: title.trim() ? 'var(--accent)' : 'var(--surface2)', color: title.trim() ? '#fff' : 'var(--text3)', fontWeight: 800, fontSize: 15, cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>다음 →</button>
            </div>
          </div>
        )}

        {/* STEP 5: 수집 항목 */}
        {step === 'fields' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>수집 항목</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>신청자에게 받을 정보를 선택하세요</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {allFields.map(f => {
                const required = f === 'name' || f === 'phone'
                const active = fields.includes(f)
                return (
                  <button key={f} onClick={() => toggleField(f)} style={{ padding: '9px 16px', borderRadius: 100, border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border2)'}`, background: active ? 'var(--accent)' : 'var(--surface)', color: active ? '#fff' : 'var(--text2)', fontSize: 13, fontWeight: 700, cursor: required ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                    {fieldLabel[f]} {required && '✓'}
                  </button>
                )
              })}
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 6 }}>📋 미리보기</p>
              <p style={{ fontWeight: 800, fontSize: 15 }}>{title}</p>
              {description && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('content')} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← 이전</button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)', opacity: loading ? 0.7 : 1 }}>
                {loading ? '생성 중...' : '✨ 완성!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
