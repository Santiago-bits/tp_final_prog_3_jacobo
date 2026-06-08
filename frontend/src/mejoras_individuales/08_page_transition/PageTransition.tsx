import { type ReactNode, useEffect, useRef } from 'react'

export function PageTransition({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = 'pageIn 0.22s ease'
  }, [pageKey])

  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {children}
    </div>
  )
}
