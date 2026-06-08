import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { API } from '../../config'

interface ThemeCtx {
  isDark: boolean
  toggle: () => void
  applyFromDB: (colorSistema: number) => void
}

const ThemeContext = createContext<ThemeCtx>({ isDark: true, toggle: () => {}, applyFromDB: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light')

  useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${API}/users/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ colorSistema: next ? 1 : 2 }),
      }).catch(() => {})
    }
  }

  const applyFromDB = (colorSistema: number) => setIsDark(colorSistema !== 2)

  return <ThemeContext.Provider value={{ isDark, toggle, applyFromDB }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
