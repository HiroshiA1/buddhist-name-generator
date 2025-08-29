'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // 保存されているテーマを読み込み
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // システムテーマの検出
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newResolvedTheme)
        document.documentElement.setAttribute('data-theme', newResolvedTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    let newResolvedTheme: 'light' | 'dark'
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
    } else {
      newResolvedTheme = theme as 'light' | 'dark'
    }

    setResolvedTheme(newResolvedTheme)
    document.documentElement.setAttribute('data-theme', newResolvedTheme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }
}