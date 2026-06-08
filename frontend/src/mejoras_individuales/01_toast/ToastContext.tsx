import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  action?: { label: string; onClick: () => void }
}

interface ToastCtx {
  showToast: (message: string, type: Toast['type'], action?: Toast['action']) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'], action?: Toast['action']) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, action }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={styles.container}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...typeStyle[t.type] }}>
            <span style={styles.icon}>{typeIcon[t.type]}</span>
            <span style={styles.msg}>{t.message}</span>
            {t.action && (
              <button style={styles.action} onClick={() => { t.action!.onClick(); remove(t.id) }}>
                {t.action.label}
              </button>
            )}
            <button style={styles.close} onClick={() => remove(t.id)}>✕</button>
            <div style={{ ...styles.bar, background: typeStyle[t.type].borderColor }} className="toast-bar" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

const typeIcon = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
const typeStyle: Record<Toast['type'], React.CSSProperties> = {
  success: { borderColor: '#4ade80', background: 'rgba(74,222,128,0.08)' },
  error:   { borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' },
  warning: { borderColor: '#fbbf24', background: 'rgba(251,191,36,0.08)' },
  info:    { borderColor: '#60a5fa', background: 'rgba(96,165,250,0.08)' },
}

const styles: Record<string, React.CSSProperties> = {
  container: { position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999, maxWidth: '360px' },
  toast:     { display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', border: '1px solid', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden', animation: 'slideInToast 0.25s ease' },
  icon:      { fontSize: '16px', flexShrink: 0 },
  msg:       { flex: 1, color: '#f1f5f9', fontSize: '13px', fontWeight: '500', lineHeight: '1.4' },
  action:    { background: 'transparent', border: 'none', color: '#eab308', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', padding: '0 4px' },
  close:     { background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', flexShrink: 0, padding: '0 2px' },
  bar:       { position: 'absolute', bottom: 0, left: 0, height: '3px', width: '100%', opacity: 0.6, animation: 'toastProgress 5s linear forwards' },
}
