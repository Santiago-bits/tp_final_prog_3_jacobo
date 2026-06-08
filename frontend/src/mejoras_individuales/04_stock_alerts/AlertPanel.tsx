import type { StockAlert } from './useStockAlerts'

interface Props {
  alerts: StockAlert[]
  onClose: () => void
  onMarkAllRead: () => void
  onClearAll: () => void
  onNavigateStock: () => void
}

export function AlertPanel({ alerts, onClose, onMarkAllRead, onClearAll, onNavigateStock }: Props) {
  const fmt = (d: Date) => new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1998 }} />
      <div style={s.panel}>
        <div style={s.header}>
          <span style={s.title}>🔔 Alertas de Stock</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {alerts.length > 0 && (
              <>
                <button style={s.btn} onClick={onMarkAllRead}>Marcar leídas</button>
                <button style={s.btn} onClick={onClearAll}>Limpiar</button>
              </>
            )}
          </div>
        </div>

        <div style={s.list}>
          {alerts.length === 0
            ? (
              <div style={s.empty}>
                <span style={{ fontSize: '32px' }}>✅</span>
                <p>Sin alertas de stock</p>
              </div>
            )
            : alerts.map(a => (
              <div key={a.id} style={{ ...s.item, opacity: a.leida ? 0.6 : 1 }}>
                <div style={s.itemLeft}>
                  <span style={a.stock === 0 ? s.dotOut : s.dotLow} />
                  <div>
                    <p style={s.itemName}>{a.nombre}</p>
                    <p style={s.itemSub}>{a.categoria} · Stock: <strong style={{ color: a.stock === 0 ? '#f87171' : '#fbbf24' }}>{a.stock}</strong> / mín {a.stockMinimo}</p>
                  </div>
                </div>
                <div style={s.itemRight}>
                  <span style={s.time}>{fmt(a.timestamp)}</span>
                  <button style={s.linkBtn} onClick={() => { onNavigateStock(); onClose() }}>→ Ver Stock</button>
                </div>
              </div>
            ))
          }
        </div>

        {alerts.length > 0 && (
          <div style={s.footer}>
            <button style={s.footerBtn} onClick={() => { onNavigateStock(); onClose() }}>
              Ver todos en Stock →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  panel:    { position: 'absolute', top: '52px', right: 0, width: '360px', background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 1999, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #334155' },
  title:    { color: '#f1f5f9', fontSize: '14px', fontWeight: '700' },
  btn:      { background: 'transparent', border: '1px solid #334155', borderRadius: '6px', padding: '4px 10px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' },
  list:     { maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  empty:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '40px 20px', color: '#64748b', fontSize: '13px' },
  item:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #0f172a', gap: '12px' },
  itemLeft: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 },
  dotLow:   { width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: '5px' },
  dotOut:   { width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', flexShrink: 0, marginTop: '5px' },
  itemName: { color: '#f1f5f9', fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemSub:  { color: '#64748b', fontSize: '11px', margin: '2px 0 0' },
  itemRight:{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  time:     { color: '#475569', fontSize: '11px' },
  linkBtn:  { background: 'transparent', border: 'none', color: '#eab308', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 },
  footer:   { padding: '12px 16px', borderTop: '1px solid #334155' },
  footerBtn:{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#eab308', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' },
}
