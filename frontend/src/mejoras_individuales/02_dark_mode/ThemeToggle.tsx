import { useTheme } from './ThemeContext'

export function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button onClick={toggle} title={isDark ? 'Modo claro' : 'Modo oscuro'} style={{
      background: 'transparent', border: '1px solid #334155', borderRadius: '8px',
      padding: '6px 10px', cursor: 'pointer', fontSize: '16px', lineHeight: 1,
      color: isDark ? '#fbbf24' : '#64748b', transition: 'all 0.2s',
    }}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
