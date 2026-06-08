interface Props {
  title: string
  productName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, productName, onConfirm, onCancel }: Props) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.iconWrap}>🗑️</div>
        <h3 style={s.title}>{title}</h3>
        <div style={s.nameBox}>
          <span style={s.nameTxt}>{productName}</span>
        </div>
        <p style={s.warning}>Esta acción no se puede deshacer.</p>
        <div style={s.actions}>
          <button style={s.cancel} onClick={onCancel}>Cancelar</button>
          <button style={s.confirm} onClick={onConfirm}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal:   { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '32px 28px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
  iconWrap:{ fontSize: '40px', lineHeight: 1 },
  title:   { color: '#f1f5f9', fontSize: '18px', fontWeight: '800', margin: 0, textAlign: 'center' },
  nameBox: { background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '10px', padding: '10px 20px', width: '100%', textAlign: 'center' },
  nameTxt: { color: '#eab308', fontSize: '14px', fontWeight: '700' },
  warning: { color: '#94a3b8', fontSize: '13px', margin: 0, textAlign: 'center' },
  actions: { display: 'flex', gap: '10px', width: '100%', marginTop: '4px' },
  cancel:  { flex: 1, background: 'transparent', border: '1px solid #334155', borderRadius: '10px', padding: '10px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  confirm: { flex: 1, background: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
}
