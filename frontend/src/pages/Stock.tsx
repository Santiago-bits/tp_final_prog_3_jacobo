import { useState, useEffect, useRef } from 'react'
import type { User } from '../types'
import { API } from '../config'
import { EmptyState }         from '../mejoras_individuales/07_empty_state/EmptyState'
import { exportStockPDF }     from '../mejoras_individuales/05_export/exportPDF'
import { exportStockExcel }   from '../mejoras_individuales/05_export/exportExcel'
import { useToast }           from '../mejoras_individuales/01_toast/ToastContext'

interface Categoria { id: number; nombre: string }
interface Producto {
  id: number; nombre: string; stock: number; stockMinimo: number
  activo: boolean; categoria: Categoria
}

export default function Stock({ user, highlightId, onHighlightDone }: {
  user: User
  highlightId?: number | null
  onHighlightDone?: () => void
}) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading]     = useState(true)
  const [adjusting, setAdjusting] = useState<{ id: number; value: string } | null>(null)
  const [filter, setFilter]       = useState<'all' | 'low' | 'out'>('all')
  const [search, setSearch]       = useState('')
  const [dlPDF, setDlPDF]         = useState(false)
  const [dlXLS, setDlXLS]         = useState(false)
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const { showToast } = useToast()

  const token   = localStorage.getItem('token') ?? ''
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  const isAdmin = user.rol === 'ADMIN'

  const fetchAll = async () => {
    const res = await fetch(`${API}/products`, { headers })
    setProductos(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  /* Scroll + highlight cuando llega highlightId desde Dashboard */
  useEffect(() => {
    if (!highlightId) return
    const el = rowRefs.current[highlightId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('stock-row-highlight')
      const t = setTimeout(() => { el.classList.remove('stock-row-highlight'); onHighlightDone?.() }, 2500)
      return () => clearTimeout(t)
    }
  }, [highlightId, productos])

  const handleAdjust = async (id: number, stock: number) => {
    await fetch(`${API}/products/${id}`, { method: 'PUT', headers, body: JSON.stringify({ stock }) })
    setAdjusting(null)
    fetchAll()
    showToast('Stock actualizado correctamente', 'success')
  }

  const handleExportPDF = () => {
    exportStockPDF(filtered)
    setDlPDF(true)
    showToast('PDF descargado', 'success')
    setTimeout(() => setDlPDF(false), 2000)
  }

  const handleExportExcel = () => {
    exportStockExcel(filtered)
    setDlXLS(true)
    showToast('Excel descargado', 'success')
    setTimeout(() => setDlXLS(false), 2000)
  }

  const filtered = productos.filter(p => {
    if (filter === 'low') { if (!(p.activo && p.stock > 0 && p.stock <= p.stockMinimo)) return false }
    if (filter === 'out') { if (p.stock !== 0) return false }
    if (search) {
      const q = search.toLowerCase()
      if (!p.nombre.toLowerCase().includes(q) && !p.categoria.nombre.toLowerCase().includes(q)) return false
    }
    return true
  })

  const lowCount = productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stockMinimo).length
  const outCount = productos.filter(p => p.stock === 0).length
  const okCount  = productos.filter(p => p.activo && p.stock > p.stockMinimo).length

  if (loading) return <div style={s.loading}>Cargando stock...</div>

  return (
    <div className="page-container">
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Stock</h2>
          <p style={s.subtitle}>{productos.length} productos en inventario</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={s.exportBtn} onClick={handleExportPDF} disabled={dlPDF}>
            {dlPDF ? '✓ Descargado' : '📄 PDF'}
          </button>
          <button style={{ ...s.exportBtn, color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }} onClick={handleExportExcel} disabled={dlXLS}>
            {dlXLS ? '✓ Descargado' : '📊 Excel'}
          </button>
        </div>
      </div>

      {/* Tarjetas resumen — sticky */}
      <div style={s.stickyBar}>
        <div className="stock-cards">
          {[
            { label: 'Total',      value: productos.length, color: '#f1f5f9', bg: '#1e293b',                    border: '#334155' },
            { label: 'Normal',     value: okCount,          color: '#4ade80', bg: 'rgba(74,222,128,0.05)',    border: 'rgba(74,222,128,0.2)' },
            { label: 'Stock bajo', value: lowCount,         color: '#fbbf24', bg: 'rgba(251,191,36,0.05)',    border: 'rgba(251,191,36,0.2)' },
            { label: 'Sin stock',  value: outCount,         color: '#f87171', bg: 'rgba(248,113,113,0.05)',   border: 'rgba(248,113,113,0.2)' },
          ].map(c => (
            <div key={c.label} style={{ ...s.card, background: c.bg, borderColor: c.border }}>
              <p style={{ ...s.cardVal, color: c.color }}>{c.value}</p>
              <p style={s.cardLbl}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros + búsqueda */}
        <div style={s.filterRow}>
          <div style={s.tabs}>
            {([
              { key: 'all', label: 'Todos' },
              { key: 'low', label: `⚠️ Stock bajo (${lowCount})` },
              { key: 'out', label: `🔴 Sin stock (${outCount})` },
            ] as const).map(f => (
              <button key={f.key}
                style={{ ...s.tab, ...(filter === f.key ? s.tabActive : {}) }}
                onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <input
            style={s.searchInput}
            placeholder="🔍 Buscar producto o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="stock-table-wrap">
        <div style={s.thead}>
          <span style={{ ...s.th, flex: 1 }}>Producto</span>
          <span className="stock-cat-col" style={{ ...s.th, width: '140px' }}>Categoría</span>
          <span style={{ ...s.th, width: '110px', textAlign: 'center' }}>Stock</span>
          <span className="stock-min-col" style={{ ...s.th, width: '100px', textAlign: 'center' }}>Mínimo</span>
          <span style={{ ...s.th, width: '100px', textAlign: 'center' }}>Estado</span>
          {isAdmin && <span style={{ ...s.th, width: '120px', textAlign: 'center' }}>Ajustar</span>}
        </div>

        {filtered.length === 0
          ? (
            <div style={{ padding: '16px' }}>
              <EmptyState
                icon="🔍"
                title="Sin resultados"
                description={search ? `No hay productos que coincidan con "${search}"` : 'No hay productos en esta categoría'}
                action={search ? { label: 'Limpiar búsqueda', onClick: () => setSearch('') } : undefined}
              />
            </div>
          )
          : filtered.map(p => {
            const status     = p.stock === 0 ? 'out' : p.stock <= p.stockMinimo ? 'low' : 'ok'
            const stockColor = status === 'out' ? '#f87171' : status === 'low' ? '#fbbf24' : '#4ade80'
            return (
              <div key={p.id} ref={el => { rowRefs.current[p.id] = el }} className="stock-row" style={s.row}>
                <span style={{ ...s.td, flex: 1 }}>
                  <span style={s.name}>{p.nombre}</span>
                </span>
                <span className="stock-cat-col" style={{ ...s.td, width: '140px' }}>
                  <span style={s.catBadge}>{p.categoria.nombre}</span>
                </span>
                <span style={{ ...s.td, width: '110px', justifyContent: 'center' }}>
                  {isAdmin && adjusting?.id === p.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input style={s.adjustInput} type="number" min="0"
                        value={adjusting.value}
                        onChange={e => setAdjusting({ id: p.id, value: e.target.value })}
                        autoFocus />
                      <button style={s.btnSave} onClick={() => handleAdjust(p.id, Number(adjusting.value))}>✓</button>
                      <button style={s.btnCancel} onClick={() => setAdjusting(null)}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: '800', fontSize: '18px', color: stockColor }}>{p.stock}</span>
                  )}
                </span>
                <span className="stock-min-col" style={{ ...s.td, width: '100px', justifyContent: 'center', color: '#cbd5e1', fontWeight: '600' }}>
                  {p.stockMinimo}
                </span>
                <span style={{ ...s.td, width: '100px', justifyContent: 'center' }}>
                  {status === 'out' && <span style={s.badgeOut}>Sin stock</span>}
                  {status === 'low' && <span style={s.badgeLow}>Stock bajo</span>}
                  {status === 'ok'  && <span style={s.badgeOk}>Normal</span>}
                </span>
                {isAdmin && (
                  <span style={{ ...s.td, width: '120px', justifyContent: 'center' }}>
                    {adjusting?.id !== p.id && (
                      <button style={s.btnEdit} onClick={() => setAdjusting({ id: p.id, value: String(p.stock) })}>
                        Ajustar stock
                      </button>
                    )}
                  </span>
                )}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  loading:     { color: 'var(--c-text-3)', padding: '40px', textAlign: 'center' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  title:       { color: 'var(--c-text-1)', fontSize: '20px', fontWeight: '700', margin: 0 },
  subtitle:    { color: 'var(--c-text-2)', fontSize: '13px' },
  exportBtn:   { background: 'transparent', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px', padding: '7px 14px', color: '#eab308', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  stickyBar:   { position: 'sticky', top: '72px', zIndex: 10, background: 'var(--c-bg)', paddingTop: '4px', paddingBottom: '8px', display: 'flex', flexDirection: 'column', gap: '10px' },
  filterRow:   { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' as const },
  tabs:        { display: 'flex', gap: '6px' },
  tab:         { background: 'transparent', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '7px 14px', color: 'var(--c-text-3)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  tabActive:   { background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)', color: '#eab308', fontWeight: '600' },
  searchInput: { flex: 1, minWidth: '200px', background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '7px 14px', color: 'var(--c-text-1)', fontSize: '13px', outline: 'none' },
  card:        { background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '18px 20px' },
  cardVal:     { fontSize: '30px', fontWeight: '800', margin: 0 },
  cardLbl:     { color: 'var(--c-text-2)', fontSize: '12px', margin: '4px 0 0', fontWeight: '500' },
  thead:       { display: 'flex', alignItems: 'center', padding: '10px 16px', background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' },
  th:          { color: 'var(--c-text-2)', fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center' },
  row:         { display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--c-border-sub)', background: 'var(--c-bg-card)', transition: 'background 0.15s' },
  td:          { display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--c-text-2)' },
  name:        { color: 'var(--c-text-1)', fontWeight: '600' },
  catBadge:    { background: 'var(--c-bg-deep)', color: 'var(--c-text-3)', border: '1px solid var(--c-border)', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', whiteSpace: 'nowrap' as const },
  badgeOut:    { background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' as const, display: 'inline-block' },
  badgeLow:    { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' as const, display: 'inline-block' },
  badgeOk:     { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' as const, display: 'inline-block' },
  adjustInput: { background: 'var(--c-bg-deep)', border: '1px solid #eab308', borderRadius: '6px', padding: '5px 8px', color: 'var(--c-text-1)', fontSize: '13px', outline: 'none', width: '64px' },
  btnSave:     { background: '#4ade80', border: 'none', borderRadius: '5px', padding: '5px 8px', color: '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },
  btnCancel:   { background: 'var(--c-btn)', border: 'none', borderRadius: '5px', padding: '5px 8px', color: 'var(--c-text-3)', cursor: 'pointer', fontSize: '13px' },
  btnEdit:     { background: 'var(--c-btn)', border: '1px solid var(--c-border)', borderRadius: '6px', padding: '5px 12px', color: 'var(--c-text-2)', fontSize: '12px', cursor: 'pointer', fontWeight: '500' },
}
