'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light', 'pink')
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
