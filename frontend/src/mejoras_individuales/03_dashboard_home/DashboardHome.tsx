import { useEffect, useState } from 'react'
import type { User } from '../../types'
import { API } from '../../config'

interface Producto { id: number; nombre: string; stock: number; stockMinimo: number; activo: boolean }
interface Venta { id: number; total: number; creadoEn: string; medioPago: string; usuario: { nombre: string } }
interface Categoria { id: number; nombre: string }

const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString()

export default function DashboardHome({ user, navigate }: { user: User; navigate: (id: string) => void }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token') ?? ''
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products`, { headers }).then(r => r.json()),
      fetch(`${API}/sales`, { headers }).then(r => r.json()),
      fetch(`${API}/categories`, { headers }).then(r => r.json()),
    ]).then(([p, v, c]) => {
      setProductos(p); setVentas(v); setCategorias(c); setLoading(false)
    })
  }, [])

  const ventasHoy     = ventas.filter(v => isToday(v.creadoEn))
  const recaudadoHoy  = ventasHoy.reduce((s, v) => s + v.total, 0)
  const stockBajo     = productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stockMinimo).length
  const sinStock      = productos.filter(p => p.stock === 0).length

  const stats = [
    { label: 'Ventas hoy',      value: ventasHoy.length,      unit: '',     color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)',   icon: '🛒', page: 'punto-venta' },
    { label: 'Recaudado hoy',   value: recaudadoHoy,           unit: '$',    color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)',   icon: '💰', page: null },
    { label: 'Stock bajo',      value: stockBajo,              unit: '',     color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.2)',   icon: '⚠️', page: 'stock' },
    { label: 'Sin stock',       value: sinStock,               unit: '',     color: '#f87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.2)',  icon: '🔴', page: 'stock' },
  ]

  if (loading) return <div style={s.loading}>Cargando...</div>

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Bienvenido, {user.nombre} 👋</h2>
          <p style={s.sub}>Resumen del día — {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Tarjetas de stats */}
      <div style={s.grid}>
        {stats.map(st => (
          <div key={st.label}
            style={{ ...s.card, background: st.bg, borderColor: st.border, cursor: st.page ? 'pointer' : 'default' }}
            onClick={() => st.page && navigate(st.page)}>
            <div style={s.cardTop}>
              <span style={s.cardIcon}>{st.icon}</span>
              {st.page && <span style={{ color: 'var(--c-text-4)', fontSize: '12px' }}>Ver →</span>}
            </div>
            <p style={{ ...s.cardVal, color: st.color }}>
              {st.unit}{typeof st.value === 'number' && st.unit === '$' ? fmt(st.value) : st.value}
            </p>
            <p style={s.cardLabel}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Resumen ventas del día */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Últimas ventas del día</h3>
        {ventasHoy.length === 0
          ? <p style={s.empty}>No hubo ventas hoy todavía.</p>
          : (
            <div style={s.tableWrap}>
              <div style={s.tHead}>
                <span style={{ ...s.th, flex: 1 }}>Vendedor</span>
                <span style={{ ...s.th, width: '120px' }}>Medio de pago</span>
                <span style={{ ...s.th, width: '110px', textAlign: 'right' }}>Total</span>
              </div>
              {ventasHoy.slice(0, 8).map(v => (
                <div key={v.id} style={s.tRow}>
                  <span style={{ ...s.td, flex: 1 }}>{v.usuario.nombre}</span>
                  <span style={{ ...s.td, width: '120px' }}>{v.medioPago}</span>
                  <span style={{ ...s.td, width: '110px', textAlign: 'right', color: '#4ade80', fontWeight: '700' }}>${fmt(v.total)}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Quick links */}
      <div style={s.quickLinks}>
        {[
          { label: '📋 Artículos',  page: 'articulos'   },
          { label: '📊 Stock',      page: 'stock'        },
          { label: '🏷️ Categorías', page: 'categorias'  },
          { label: '🧾 Punto de Venta', page: 'punto-venta' },
        ].map(l => (
          <button key={l.page} style={s.qlBtn} onClick={() => navigate(l.page)}>{l.label}</button>
        ))}
      </div>

      <div style={s.info}>
        <span>{productos.length} productos · {categorias.length} categorías · {ventas.length} ventas totales</span>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap:       { padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' },
  loading:    { color: 'var(--c-text-3)', padding: '60px', textAlign: 'center' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:      { color: 'var(--c-text-1)', fontSize: '22px', fontWeight: '800', margin: 0 },
  sub:        { color: 'var(--c-text-3)', fontSize: '13px', margin: '4px 0 0', textTransform: 'capitalize' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  card:       { border: '1px solid', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.15s, box-shadow 0.15s' },
  cardTop:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardIcon:   { fontSize: '24px' },
  cardVal:    { fontSize: '32px', fontWeight: '800', margin: 0, lineHeight: 1 },
  cardLabel:  { color: 'var(--c-text-3)', fontSize: '12px', fontWeight: '600', margin: 0 },
  section:    { background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionTitle:{ color: 'var(--c-text-1)', fontSize: '15px', fontWeight: '700', margin: 0 },
  empty:      { color: 'var(--c-text-4)', fontSize: '14px', textAlign: 'center', padding: '20px 0' },
  tableWrap:  { display: 'flex', flexDirection: 'column', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--c-border)' },
  tHead:      { display: 'flex', background: 'var(--c-bg)', padding: '8px 14px', borderBottom: '1px solid var(--c-border)' },
  th:         { color: 'var(--c-text-3)', fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center' } as React.CSSProperties,
  tRow:       { display: 'flex', padding: '10px 14px', borderBottom: '1px solid var(--c-border-sub)', background: 'var(--c-bg-card)' },
  td:         { color: 'var(--c-text-2)', fontSize: '13px', display: 'flex', alignItems: 'center' },
  quickLinks: { display: 'flex', gap: '10px', flexWrap: 'wrap' } as React.CSSProperties,
  qlBtn:      { background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '10px 18px', color: 'var(--c-text-2)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  info:       { color: 'var(--c-text-4)', fontSize: '12px', textAlign: 'center' } as React.CSSProperties,
}
