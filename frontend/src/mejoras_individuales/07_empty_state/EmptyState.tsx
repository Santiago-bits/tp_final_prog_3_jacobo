interface Props {
  icon: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div style={s.wrap}>
      <span style={s.icon}>{icon}</span>
      <h3 style={s.title}>{title}</h3>
      {description && <p style={s.desc}>{description}</p>}
      {action && (
        <button style={s.btn} onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 20px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
  icon:  { fontSize: '48px', lineHeight: 1 },
  title: { color: '#f1f5f9', fontSize: '17px', fontWeight: '700', margin: 0, textAlign: 'center' },
  desc:  { color: '#64748b', fontSize: '14px', margin: 0, textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' },
  btn:   { background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '10px', padding: '9px 20px', color: '#eab308', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
}
