'use client'

import { useState } from 'react'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

interface SettingField {
  key: string
  label: string
  placeholder: string
  type?: 'password' | 'text'
  hint?: string
}

const apiSettings: SettingField[] = [
  { key: 'supabase_url', label: 'Supabase URL', placeholder: 'https://xxxx.supabase.co', hint: 'Supabase 프로젝트 Settings > API' },
  { key: 'supabase_anon', label: 'Supabase Anon Key', placeholder: 'eyJhbGc...', type: 'password' },
  { key: 'solapi_key', label: '솔라피 API Key (문자)', placeholder: 'SENS...', type: 'password', hint: 'solapi.com 에서 발급' },
  { key: 'solapi_secret', label: '솔라피 Secret', placeholder: '시크릿 키', type: 'password' },
  { key: 'solapi_from', label: '발신 번호', placeholder: '010-0000-0000' },
  { key: 'kakao_key', label: '카카오 알림톡 Key', placeholder: '카카오 비즈 API 키', type: 'password', hint: 'business.kakao.com 에서 발급' },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // 실제로는 .env.local 또는 Supabase secrets에 저장
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>시스템</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>설정</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>API 키 및 서비스를 연동하세요</p>

      {/* GUIDE */}
      <div style={{
        background: 'var(--accent-bg)', border: '1px solid var(--accent)',
        borderRadius: 12, padding: '14px', marginBottom: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>🔒 보안 안내</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
          API 키는 <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>.env.local</code> 파일에 직접 입력하세요.
          이 화면은 가이드 전용입니다. 절대 외부에 공유하지 마세요.
        </p>
      </div>

      {apiSettings.map(f => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 5 }}>
            {f.label}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={f.type === 'password' && !visible[f.key] ? 'password' : 'text'}
              value={values[f.key] ?? ''}
              onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{
                width: '100%', background: 'var(--bg3)',
                border: '1.5px solid var(--border)', borderRadius: 10,
                padding: f.type === 'password' ? '13px 44px 13px 15px' : '13px 15px',
                fontFamily: 'inherit', fontSize: 15, color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            {f.type === 'password' && (
              <button
                onClick={() => setVisible(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text3)', padding: 0,
                }}
              >
                {visible[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
          {f.hint && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>💡 {f.hint}</p>}
        </div>
      ))}

      <div style={{ height: 8 }} />

      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: '16px', borderRadius: 12, border: 'none',
          background: saved ? 'var(--success)' : 'var(--accent)',
          color: '#fff', fontSize: 16, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: `0 4px 16px ${saved ? 'rgba(34,197,94,0.3)' : 'var(--accent-glow)'}`,
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {saved ? <><CheckCircle size={18} /> 저장 완료!</> : '💾 저장하기'}
      </button>

      {/* ENV GUIDE */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px', marginTop: 24,
      }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>📄 .env.local 설정 예시</p>
        <pre style={{
          background: 'var(--bg)', borderRadius: 10, padding: '14px',
          fontSize: 12, color: 'var(--text2)', lineHeight: 1.8,
          overflowX: 'auto', fontFamily: 'monospace',
        }}>{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
SOLAPI_API_KEY=SENS...
SOLAPI_API_SECRET=xxx
SOLAPI_FROM=01000000000`}</pre>
      </div>
    </div>
  )
}
