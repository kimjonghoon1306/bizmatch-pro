'use client'

import { useThemeStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/types'

const themes: { value: Theme; label: string; emoji: string }[] = [
  { value: 'dark',   label: '다크',   emoji: '🌙' },
  { value: 'light',  label: '라이트',  emoji: '☀️' },
  { value: 'yellow', label: '옐로우',  emoji: '🌟' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          title={t.label}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            border: `2px solid ${theme === t.value ? 'var(--accent)' : 'var(--border2)'}`,
            background: theme === t.value ? 'var(--accent-bg)' : 'var(--surface)',
            transform: theme === t.value ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {t.emoji}
        </button>
      ))}
    </div>
  )
}
