'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug, categoryLabel, categoryEmoji, fieldLabel } from '@/lib/utils'
import type { LandingCategory } from '@/lib/types'
import { CheckCircle, Copy, ExternalLink } from 'lucide-react'

const categories: LandingCategory[] = ['network', 'franchise', 'startup', 'beauty', 'edu', 'custom']
const allFields = ['name', 'phone', 'kakao', 'age', 'region', 'job', 'income', 'time']

const defaultTitles: Record<LandingCategory, string> = {
  network:   '월 300만원 부업 파트너 모집',
  franchise: '프랜차이즈 가맹점 모집',
  startup:   '함께 성장할 창업 파트너 모집',
  beauty:    '뷰티/헬스케어 파트너 모집',
  edu:       '강사/수강생 모집',
  custom:    '',
}

export default function BuilderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<LandingCategory>('network')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [offer, setOffer] = useState('')
  const [fields, setFields] = useState(['name', 'phone'])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  function toggleField(f: string) {
    if (f === 'name' || f === 'phone') return // 필수
    setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setLoading(true)
    const newSlug = generateSlug(title)
    const { error } = await supabase.from('landing_pages').insert({
      slug: newSlug,
      title: title.trim(),
      description: description.trim() || null,
      category,
      contact_phone: phone.trim() || null,
      offer_text: offer.trim() || null,
      fields,
      is_active: true,
    })
    if (!error) {
      setSlug(newSlug)
      setDone(true)
    }
    setLoading(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (done) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${slug}`
    return (
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>완성!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 14 }}>
          랜딩페이지가 생성되었어요.<br />링크를 복사해서 공유하세요!
        </p>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
          <button
            onClick={copyLink}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: copied ? 'var(--success)' : 'var(--accent)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
        <a
          href={`/join/${slug}`} target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', borderRadius: 12, marginBottom: 12,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            color: 'var(--text)', fontSize: 15, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={16} /> 페이지 미리보기
        </a>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: 'var(--accent)', color: '#fff',
            fontSize: 15, fontWeight: 700, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}
        >
          대시보드로 이동
        </button>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Step {step} / 3</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>랜딩 만들기</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>5분 안에 완성하는 모집 페이지</p>

      {/* PROGRESS BAR */}
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 100, marginBottom: 28 }}>
        <div style={{
          height: '100%', borderRadius: 100, background: 'var(--accent)',
          width: `${(step / 3) * 100}%`, transition: 'width 0.3s',
        }} />
      </div>

      {/* STEP 1: CATEGORY */}
      {step === 1 && (
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>① 업종 선택</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                  border: `2px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
                  background: category === c ? 'var(--accent-bg)' : 'var(--surface)',
                  fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{categoryEmoji[c]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: category === c ? 'var(--accent)' : 'var(--text)' }}>
                  {categoryLabel[c]}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setTitle(defaultTitles[category]); setStep(2) }}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}
          >
            다음 →
          </button>
        </div>
      )}

      {/* STEP 2: CONTENT */}
      {step === 2 && (
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>② 내용 입력</p>
          {[
            { label: '📌 제목 (헤드라인) *', id: 'title', value: title, setter: setTitle, placeholder: '예) 월 300만원 부업 파트너 모집', required: true },
            { label: '📝 부제목 (설명)', id: 'desc', value: description, setter: setDescription, placeholder: '신청자에게 보여줄 설명을 입력하세요', required: false, multi: true },
            { label: '📞 담당자 연락처', id: 'phone', value: phone, setter: setPhone, placeholder: '010-0000-0000', required: false },
            { label: '🎁 무료 제공 혜택', id: 'offer', value: offer, setter: setOffer, placeholder: '예) 무료 PDF 제공, 1:1 상담 제공', required: false },
          ].map(f => (
            <div key={f.id} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
                {f.label}
              </label>
              {f.multi ? (
                <textarea
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  style={{
                    width: '100%', background: 'var(--bg3)',
                    border: '1.5px solid var(--border)', borderRadius: 10,
                    padding: '13px 15px', fontFamily: 'inherit', fontSize: 16,
                    color: 'var(--text)', outline: 'none', resize: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', background: 'var(--bg3)',
                    border: '1.5px solid var(--border)', borderRadius: 10,
                    padding: '13px 15px', fontFamily: 'inherit', fontSize: 16,
                    color: 'var(--text)', outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: '14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>← 이전</button>
            <button
              onClick={() => title.trim() && setStep(3)}
              disabled={!title.trim()}
              style={{
                flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                background: title.trim() ? 'var(--accent)' : 'var(--surface2)',
                color: title.trim() ? '#fff' : 'var(--text3)',
                fontWeight: 800, fontSize: 15, cursor: title.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', boxShadow: title.trim() ? '0 4px 16px var(--accent-glow)' : 'none',
              }}
            >다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 3: FIELDS */}
      {step === 3 && (
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>③ 수집 항목 선택</p>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>이름·전화번호는 필수입니다</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {allFields.map(f => {
              const required = f === 'name' || f === 'phone'
              const active = fields.includes(f)
              return (
                <button
                  key={f}
                  onClick={() => toggleField(f)}
                  style={{
                    padding: '9px 16px', borderRadius: 100,
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border2)'}`,
                    background: active ? 'var(--accent)' : 'var(--surface)',
                    color: active ? '#fff' : 'var(--text2)',
                    fontSize: 13, fontWeight: 700,
                    cursor: required ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: required && active ? 1 : 1,
                  }}
                >
                  {fieldLabel[f]} {required && '✓'}
                </button>
              )
            })}
          </div>

          {/* PREVIEW */}
          <div style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 8 }}>📋 미리보기</p>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{title}</p>
            {description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{description}</p>}
            {offer && <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>🎁 {offer}</p>}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, padding: '14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>← 이전</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 16px var(--accent-glow)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '생성 중...' : '✨ 완성!'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
