import { useEffect, useRef } from 'react'

interface Props {
  unreadCount: number
  isOpen: boolean
  onToggle: () => void
  hasNew: boolean
}

export function AlertBell({ unreadCount, isOpen, onToggle, hasNew }: Props) {
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!hasNew || !bellRef.current) return
    bellRef.current.classList.remove('bell-ring')
    void bellRef.current.offsetWidth
    bellRef.current.classList.add('bell-ring')
  }, [hasNew])

  return (
    <button ref={bellRef} onClick={onToggle} title="Alertas de stock" style={{
      position: 'relative', background: isOpen ? 'rgba(234,179,8,0.1)' : 'transparent',
      border: `1px solid ${isOpen ? 'rgba(234,179,8,0.3)' : '#334155'}`,
      borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
      fontSize: '18px', lineHeight: 1, transition: 'all 0.2s',
    }}>
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-6px',
          background: '#ef4444', color: '#fff', borderRadius: '50%',
          width: '18px', height: '18px', fontSize: '10px', fontWeight: '800',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #0f172a',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
