'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fieldLabel } from '@/lib/utils'
import { CheckCircle, Phone } from 'lucide-react'

interface Props {
  landingPageId: string
  fields: string[]
  contactPhone: string | null
}

const fieldPlaceholders: Record<string, string> = {
  name:   '홍길동',
  phone:  '010-0000-0000',
  kakao:  '카카오톡 아이디',
  age:    '예) 30대',
  region: '예) 서울 강남',
  job:    '예) 직장인, 주부',
  income: '예) 월 100만원',
  time:   '예) 평일 저녁',
}

const fieldTypes: Record<string, string> = {
  phone: 'tel',
  name: 'text',
  kakao: 'text',
  age: 'text',
  region: 'text',
  job: 'text',
  income: 'text',
  time: 'text',
}

export function LeadForm({ landingPageId, fields, contactPhone }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const fieldMap: Record<string, string> = {
    kakao: 'kakao_id',
    job: 'current_job',
    income: 'desired_income',
    time: 'available_time',
  }

  async function handleSubmit() {
    if (!values.name?.trim() || !values.phone?.trim()) {
      setError('이름과 전화번호는 필수입니다.')
      return
    }
    setError('')
    setLoading(true)

    const payload: Record<string, string> = {
      landing_page_id: landingPageId,
      status: 'new',
    }
    fields.forEach(f => {
      const dbKey = fieldMap[f] ?? f
      if (values[f]) payload[dbKey] = values[f].trim()
    })

    const { error: err } = await supabase.from('leads').insert(payload)
    if (err) {
      setError('오류가 발생했어요. 다시 시도해주세요.')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '40px 24px',
        marginTop: 16,
      }}>
        <CheckCircle size={56} color="var(--success)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>신청 완료!</h2>
        <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
          신청해 주셔서 감사합니다 😊<br />담당자가 곧 연락드리겠습니다.
        </p>
        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12,
              background: 'var(--success-bg)', color: 'var(--success)',
              textDecoration: 'none', fontWeight: 700, fontSize: 15,
              border: '1px solid var(--success)',
            }}
          >
            <Phone size={16} /> {contactPhone}
          </a>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20, padding: '24px 20px',
      marginTop: 16,
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>지금 바로 신청하세요</h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        30초면 완료됩니다 ✨
      </p>

      {fields.map(f => (
        <div key={f} style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block', fontSize: 14, fontWeight: 700,
            color: 'var(--text2)', marginBottom: 6,
          }}>
            {fieldLabel[f]}
            {(f === 'name' || f === 'phone') && (
              <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>
            )}
          </label>
          <input
            type={fieldTypes[f] ?? 'text'}
            value={values[f] ?? ''}
            onChange={e => setValues(prev => ({ ...prev, [f]: e.target.value }))}
            placeholder={fieldPlaceholders[f] ?? ''}
            style={{
              width: '100%', background: 'var(--bg3)',
              border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '15px 16px',
              fontFamily: 'inherit', fontSize: 16,
              color: 'var(--text)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      ))}

      {error && (
        <p style={{
          color: 'var(--danger)', fontSize: 13, fontWeight: 600,
          background: 'var(--danger-bg)', borderRadius: 8,
          padding: '10px 12px', marginBottom: 12,
        }}>{error}</p>
      )}

      <div style={{ height: 8 }} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '18px', borderRadius: 14, border: 'none',
          background: loading ? 'var(--surface2)' : 'var(--accent)',
          color: loading ? 'var(--text3)' : '#fff',
          fontSize: 17, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          boxShadow: loading ? 'none' : '0 6px 20px var(--accent-glow)',
          transition: 'all 0.2s',
          letterSpacing: -0.3,
        }}
      >
        {loading ? '신청 중...' : '✅ 무료로 신청하기'}
      </button>

      <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 12 }}>
        개인정보는 모집 목적으로만 사용됩니다
      </p>
    </div>
  )
}
