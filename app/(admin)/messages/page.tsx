'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AutomationSetting } from '@/lib/types'
import { MessageSquare, Send, ToggleLeft, ToggleRight } from 'lucide-react'

const triggerLabel: Record<string, string> = {
  immediate: '즉시 발송',
  d1: 'D+1 (하루 뒤)',
  d3: 'D+3 (3일 뒤)',
  d7: 'D+7 (7일 뒤)',
}

export default function MessagesPage() {
  const [settings, setSettings] = useState<AutomationSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('automation_settings')
        .select('*')
        .order('created_at')
      setSettings(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('automation_settings').update({ is_active: !current }).eq('id', id)
    setSettings(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function saveEdit(id: string) {
    await supabase.from('automation_settings').update({ message_template: editText }).eq('id', id)
    setSettings(prev => prev.map(s => s.id === id ? { ...s, message_template: editText } : s))
    setEditing(null)
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>자동화</p>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, marginBottom: 6 }}>메시지 설정</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
        신청자에게 자동 발송되는 메시지를 설정하세요
      </p>

      {/* VARIABLE GUIDE */}
      <div style={{
        background: 'var(--accent-bg)', border: '1px solid var(--accent)',
        borderRadius: 12, padding: '12px 14px', marginBottom: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>💡 사용 가능한 변수</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['{{name}}', '{{phone}}', '{{contact_phone}}'].map(v => (
            <code key={v} style={{
              background: 'var(--surface)', padding: '2px 8px', borderRadius: 6,
              fontSize: 12, color: 'var(--text)', fontFamily: 'monospace',
            }}>{v}</code>
          ))}
        </div>
      </div>

      {loading ? (
        [1,2,3,4].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 14, marginBottom: 12 }} className="skeleton" />
        ))
      ) : (
        settings.map(s => (
          <div
            key={s.id}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${s.is_active ? 'var(--border2)' : 'var(--border)'}`,
              borderRadius: 14, padding: '16px',
              marginBottom: 12, opacity: s.is_active ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                  background: 'var(--accent-bg)', color: 'var(--accent)',
                }}>
                  {triggerLabel[s.trigger_type]}
                </span>
              </div>
              <button
                onClick={() => toggleActive(s.id, s.is_active)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: s.is_active ? 'var(--success)' : 'var(--text3)', padding: 0,
                }}
              >
                {s.is_active
                  ? <ToggleRight size={30} />
                  : <ToggleLeft size={30} />
                }
              </button>
            </div>

            {editing === s.id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', background: 'var(--bg3)',
                    border: '1.5px solid var(--accent)', borderRadius: 10,
                    padding: '12px', fontFamily: 'inherit', fontSize: 14,
                    color: 'var(--text)', outline: 'none', resize: 'none',
                    marginBottom: 8,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(null)} style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    background: 'var(--surface2)', border: '1px solid var(--border2)',
                    color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>취소</button>
                  <button onClick={() => saveEdit(s.id)} style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    background: 'var(--accent)', border: 'none',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>저장</button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
                  background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px',
                  marginBottom: 8,
                }}>
                  {s.message_template}
                </p>
                <button
                  onClick={() => { setEditing(s.id); setEditText(s.message_template) }}
                  style={{
                    fontSize: 13, color: 'var(--accent)', background: 'none',
                    border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', padding: 0,
                  }}
                >
                  ✏️ 수정하기
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px', marginTop: 8,
        textAlign: 'center',
      }}>
        <MessageSquare size={24} style={{ color: 'var(--text3)', marginBottom: 8 }} />
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>실제 발송 연동</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
          솔라피(문자) / 카카오 알림톡 API 키를<br />설정에서 등록하면 자동 발송이 활성화됩니다
        </p>
        <button
          onClick={() => window.location.href = '/settings'}
          style={{
            marginTop: 12, padding: '10px 20px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          설정으로 이동 →
        </button>
      </div>
    </div>
  )
}
