'use client'

import { useThemeStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/types'

const themes: { value: Theme; label: string; emoji: string }[] = [
  { value: 'dark',  label: '다크',  emoji: '🌙' },
  { value: 'light', label: '라이트', emoji: '☀️' },
  { value: 'pink',  label: '핑크',  emoji: '🌸' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="flex items-center gap-1.5">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          title={t.label}
          className={cn(
            'w-9 h-9 rounded-full text-base flex items-center justify-center transition-all duration-200',
            'border-2',
            theme === t.value
              ? 'border-[var(--accent)] bg-[var(--accent-bg)] scale-110'
              : 'border-[var(--border2)] bg-[var(--surface)] hover:border-[var(--accent)] hover:scale-105'
          )}
        >
          {t.emoji}
        </button>
      ))}
    </div>
  )
}
