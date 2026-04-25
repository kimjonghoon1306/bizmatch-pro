'use client'

import { useState } from 'react'
import { Phone, MessageCircle, MoreVertical, Clock } from 'lucide-react'
import { formatRelative, statusLabel, statusColor, cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/lib/types'

interface LeadCardProps {
  lead: Lead
  onStatusChange?: (id: string, status: LeadStatus) => void
  onDelete?: (id: string) => void
}

const statusOptions: LeadStatus[] = ['new', 'contact', 'done', 'trash']

export function LeadCard({ lead, onStatusChange, onDelete }: LeadCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = lead.name.slice(0, 2)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 10,
      position: 'relative',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* AVATAR */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, color: 'var(--accent)',
          flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* INFO */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{lead.name}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: `var(--${lead.status === 'new' ? 'accent' : lead.status === 'contact' ? 'warning' : lead.status === 'done' ? 'success' : 'danger'}-bg)`,
              color: `var(--${lead.status === 'new' ? 'accent' : lead.status === 'contact' ? 'warning' : lead.status === 'done' ? 'success' : 'danger'})`,
            }}>
              {statusLabel[lead.status]}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>{lead.phone}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text3)', fontSize: 11 }}>
            <Clock size={10} />
            <span>{formatRelative(lead.created_at)}</span>
            {lead.region && <><span>·</span><span>{lead.region}</span></>}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <a
            href={`tel:${lead.phone}`}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--success-bg)', color: 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <Phone size={15} />
          </a>
          {lead.kakao_id && (
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--warning-bg)', color: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <MessageCircle size={15} />
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--surface2)', color: 'var(--text2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', right: 16, top: 56, zIndex: 20,
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
            borderRadius: 12, padding: 8, minWidth: 150,
            boxShadow: 'var(--shadow)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', padding: '4px 8px', fontWeight: 600 }}>상태 변경</p>
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => { onStatusChange?.(lead.id, s); setMenuOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: lead.status === s ? 'var(--accent-bg)' : 'transparent',
                  color: lead.status === s ? 'var(--accent)' : 'var(--text)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {statusLabel[s]}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
            <button
              onClick={() => { onDelete?.(lead.id); setMenuOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', borderRadius: 8, border: 'none',
                background: 'transparent', color: 'var(--danger)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              삭제
            </button>
          </div>
        </>
      )}

      {/* MEMO */}
      {lead.memo && (
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: 'var(--bg3)', borderRadius: 8,
          fontSize: 13, color: 'var(--text2)',
        }}>
          {lead.memo}
        </div>
      )}
    </div>
  )
}
