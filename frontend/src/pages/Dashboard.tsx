import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { User } from '../types'
import Categorias from './Categorias'
import Articulos from './Articulos'
import Stock from './Stock'
import Ventas from './Ventas'
import { AlertBell }      from '../mejoras_individuales/04_stock_alerts/AlertBell'
import { AlertPanel }     from '../mejoras_individuales/04_stock_alerts/AlertPanel'
import { useStockAlerts } from '../mejoras_individuales/04_stock_alerts/useStockAlerts'
import { useTheme }       from '../mejoras_individuales/02_dark_mode/ThemeContext'
import { PageTransition } from '../mejoras_individuales/08_page_transition/PageTransition'
import DashboardHome      from '../mejoras_individuales/03_dashboard_home/DashboardHome'
import { PAGE_TO_URL, getActivePage } from '../mejoras_individuales/09_router/routeMap'

interface PageItem   { id: string; label: string; icon: string }
interface SubSection { id: string; label: string; icon: string; children?: PageItem[] }
interface Section    { id: string; label: string; icon: string; roles: string[]; children?: SubSection[] }

const allSections: Section[] = [
  {
    id: 'ventas', label: 'Ventas', icon: '🛒', roles: ['ADMIN', 'VENDEDOR'],
    children: [
      { id: 'punto-venta', label: 'Punto de Venta', icon: '🧾' },
      {
        id: 'inventario', label: 'Inventario', icon: '📦',
        children: [
          { id: 'categorias', label: 'Categorías', icon: '🏷️' },
          { id: 'articulos',  label: 'Artículos',  icon: '📋' },
          { id: 'stock',      label: 'Stock',       icon: '📊' },
        ],
      },
    ],
  },
]

const modalItems = [
  { id: 'alquiler',      label: 'Alquiler',          icon: '🏠', roles: ['ADMIN'] },
  { id: 'servicios',     label: 'Servicios Técnicos', icon: '🔧', roles: ['ADMIN'] },
  { id: 'configuracion', label: 'Configuración',      icon: '⚙️', roles: ['ADMIN', 'VENDEDOR'] },
]

const pageLabels: Record<string, string> = {
  home: 'Inicio', 'punto-venta': 'Punto de Venta',
  categorias: 'Categorías', articulos: 'Artículos', stock: 'Stock',
}

type ModalId = 'alquiler' | 'servicios' | 'configuracion' | null

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const sections      = allSections.filter(s => s.roles.includes(user.rol))
  const visibleModals = modalItems.filter(m => m.roles.includes(user.rol))
  const reactNavigate = useNavigate()
  const location      = useLocation()
  const activePage    = getActivePage(location.pathname)

  const { isDark, toggle: toggleTheme } = useTheme()

  const [expanded, setExpanded]       = useState<string[]>(['ventas', 'inventario'])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertPanelOpen, setAlertPanel] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalId>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const prevCount = useRef(0)

  const { alerts, unreadCount, markAllRead, clearAll } = useStockAlerts()
  const hasNew = unreadCount > prevCount.current
  useEffect(() => { prevCount.current = unreadCount }, [unreadCount])

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const navigate = (id: string) => {
    reactNavigate(PAGE_TO_URL[id] ?? '/')
    setSidebarOpen(false)
  }

  const navigateStock = (productoId?: number) => {
    navigate('stock')
    if (productoId) setHighlightId(productoId)
  }

  const openModal = (id: ModalId) => {
    setActiveModal(id)
    setSidebarOpen(false)
  }

  const isAnyPageActive = (sub: SubSection) =>
    sub.children?.some(p => p.id === activePage) ?? false

  const renderContent = () => {
    if (activePage === 'home')        return <DashboardHome user={user} navigate={navigate} />
    if (activePage === 'punto-venta') return <Ventas user={user} />
    if (activePage === 'categorias')  return <Categorias user={user} />
    if (activePage === 'articulos')   return <Articulos user={user} />
    if (activePage === 'stock')       return <Stock user={user} highlightId={highlightId} onHighlightDone={() => setHighlightId(null)} />
    return <DashboardHome user={user} navigate={navigate} />
  }

  const modalLabel: Record<string, string> = {
    alquiler: '🏠 Alquiler', servicios: '🔧 Servicios Técnicos', configuracion: '⚙️ Configuración',
  }

  return (
    <div className="db-layout">
      {sidebarOpen && <div className="db-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Modal overlay */}
      {activeModal && (
        <div style={st.modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={st.modalBox} onClick={e => e.stopPropagation()}>
            <div style={st.modalHeader}>
              <h3 style={st.modalTitle}>{modalLabel[activeModal]}</h3>
              <button style={st.modalClose} onClick={() => setActiveModal(null)}>✕</button>
            </div>

            {activeModal === 'configuracion' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={st.modalDesc}>Seleccioná el tema visual del sistema. La preferencia se guarda en tu cuenta.</p>
                <div style={st.themeRow}>
                  <button
                    style={{ ...st.themeCard, ...(isDark ? st.themeCardActive : {}) }}
                    onClick={() => { if (!isDark) toggleTheme() }}>
                    <span style={{ fontSize: '32px' }}>🌙</span>
                    <span style={st.themeCardLabel}>Oscuro</span>
                    {isDark && <span style={st.themeCardCheck}>✓ Activo</span>}
                  </button>
                  <button
                    style={{ ...st.themeCard, ...(!isDark ? st.themeCardActiveLight : {}) }}
                    onClick={() => { if (isDark) toggleTheme() }}>
                    <span style={{ fontSize: '32px' }}>☀️</span>
                    <span style={st.themeCardLabel}>Claro</span>
                    {!isDark && <span style={{ ...st.themeCardCheck, color: '#ca8a04' }}>✓ Activo</span>}
                  </button>
                </div>
              </div>
            ) : (
              <div style={st.modalDevContent}>
                <div style={{ fontSize: '52px' }}>🚧</div>
                <p style={st.devText}>Este módulo está siendo construido.</p>
                <div style={st.devBadge}>Próximamente</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`db-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={st.sidebarTop}>
          <div style={st.logoArea}>
            <img src="/logosh.png" alt="SH Servicios" style={st.logoImg} />
            <div>
              <p style={st.logoName}>SH Servicios</p>
              <p style={st.logoTag}>ERP</p>
            </div>
            <button className="db-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div style={st.userCard}>
            <div style={st.avatar}>{user.nombre.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p style={st.userName}>{user.nombre}</p>
              <p style={st.userRole}>{user.rol === 'ADMIN' ? 'Administrador' : 'Vendedor'}</p>
            </div>
          </div>

          <div style={st.navSection}>
            <p style={st.navLabel}>MENÚ PRINCIPAL</p>
            <nav style={st.nav}>
              {/* Inicio */}
              <button
                style={{ ...st.navItem, ...(activePage === 'home' ? st.navItemActive : {}), position: 'relative' }}
                onClick={() => navigate('home')}>
                {activePage === 'home' && <span style={st.activeBar} />}
                <span style={st.navIcon}>🏠</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Inicio</span>
              </button>

              {/* Secciones con hijos (Ventas) */}
              {sections.map(section => {
                const secExpanded = expanded.includes(section.id)
                const hasChildren = !!section.children?.length
                const secHasActive = section.children?.some(sub =>
                  sub.id === activePage || sub.children?.some(p => p.id === activePage)
                )
                return (
                  <div key={section.id}>
                    <button
                      style={{ ...st.navItem, ...(secHasActive ? st.navItemActive : {}), position: 'relative' }}
                      onClick={() => hasChildren ? toggle(section.id) : navigate(section.id)}>
                      {secHasActive && !hasChildren && <span style={st.activeBar} />}
                      <span style={st.navIcon}>{section.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{section.label}</span>
                      {hasChildren && (
                        <span style={{ ...st.arrow, transform: secExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                      )}
                    </button>

                    {hasChildren && secExpanded && section.children!.map(sub => {
                      const subExpanded = expanded.includes(sub.id)
                      const subHasChildren = !!sub.children?.length
                      const subActive = isAnyPageActive(sub)
                      return (
                        <div key={sub.id} style={st.subMenuWrap}>
                          <button
                            style={{ ...st.subItem, ...(subActive ? st.subItemActive : {}) }}
                            onClick={() => subHasChildren ? toggle(sub.id) : navigate(sub.id)}>
                            <span style={st.subIcon}>{sub.icon}</span>
                            <span style={{ flex: 1, textAlign: 'left' }}>{sub.label}</span>
                            {subHasChildren && (
                              <span style={{ ...st.arrow, fontSize: '10px', transform: subExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                            )}
                          </button>
                          {subHasChildren && subExpanded && (
                            <div style={st.pageMenuWrap}>
                              {sub.children!.map(page => (
                                <button
                                  key={page.id}
                                  style={{ ...st.pageItem, ...(activePage === page.id ? st.pageItemActive : {}), position: 'relative' }}
                                  onClick={() => navigate(page.id)}>
                                  {activePage === page.id && <span style={st.activeBar} />}
                                  <span style={st.pageIcon}>{page.icon}</span>
                                  <span>{page.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              {/* Items de modal: Alquiler, Servicios Técnicos, Configuración */}
              {visibleModals.map(item => (
                <button
                  key={item.id}
                  style={{ ...st.navItem, ...(activeModal === item.id ? st.navItemActive : {}), position: 'relative' }}
                  onClick={() => openModal(item.id as ModalId)}>
                  <span style={st.navIcon}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <button style={st.logoutBtn} onClick={onLogout}>
          <span>🚪</span><span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main */}
      <main className="db-main">
        <div style={st.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="db-hamburger" onClick={() => setSidebarOpen(true)}>
              <span style={st.hLine} /><span style={st.hLine} /><span style={st.hLine} />
            </button>
            <div>
              <h2 style={st.pageTitle}>{pageLabels[activePage] ?? 'Inicio'}</h2>
              <p className="db-topbar-path" style={st.pagePath}>
                SH Servicios &rsaquo; {pageLabels[activePage] ?? 'Inicio'}
              </p>
            </div>
          </div>

          <div style={st.topBarRight}>
            {user.rol === 'ADMIN' && (
              <div style={{ position: 'relative' }}>
                <AlertBell
                  unreadCount={unreadCount}
                  isOpen={alertPanelOpen}
                  onToggle={() => { setAlertPanel(o => !o); if (!alertPanelOpen) markAllRead() }}
                  hasNew={hasNew}
                />
                {alertPanelOpen && (
                  <AlertPanel
                    alerts={alerts}
                    onClose={() => setAlertPanel(false)}
                    onMarkAllRead={markAllRead}
                    onClearAll={clearAll}
                    onNavigateStock={(id) => navigateStock(id)}
                  />
                )}
              </div>
            )}
            <div style={st.topBarUser}>
              <span style={st.topBarAvatar}>{user.nombre.charAt(0).toUpperCase()}</span>
              <span className="db-topbar-name" style={st.topBarName}>{user.nombre}</span>
            </div>
          </div>
        </div>

        <PageTransition pageKey={activePage}>
          {renderContent()}
        </PageTransition>

        <footer style={st.footer}>
          <span style={st.footerText}>
            Proyecto desarrollado por&nbsp;&nbsp;
            <strong>Rodríguez Nazareno</strong> · <strong>Jacobo Santiago</strong> · <strong>Mover Leonardo</strong>
          </span>
        </footer>
      </main>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  sidebarTop:    { display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: 0, overflow: 'hidden' },
  logoArea:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px 20px', borderBottom: '1px solid var(--c-border)' },
  logoImg:       { width: '38px', height: '38px', objectFit: 'contain', flexShrink: 0, borderRadius: '6px' },
  logoName:      { color: 'var(--c-text-1)', fontSize: '14px', fontWeight: '700', margin: 0 },
  logoTag:       { color: '#eab308', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', margin: 0 },
  userCard:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--c-bg-deep)', borderRadius: '10px', border: '1px solid var(--c-border)' },
  avatar:        { width: '34px', height: '34px', borderRadius: '50%', background: '#eab308', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  userName:      { color: 'var(--c-text-1)', fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:      { color: 'var(--c-text-3)', fontSize: '11px', margin: 0, marginTop: '1px' },
  navSection:    { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' },
  navLabel:      { color: 'var(--c-text-2)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', margin: '0 0 2px 8px' },
  nav:           { display: 'flex', flexDirection: 'column', gap: '1px' },
  navItem:       { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--c-text-3)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', width: '100%', overflow: 'hidden' },
  navItemActive: { background: 'rgba(234,179,8,0.1)', color: '#eab308', fontWeight: '600' },
  navIcon:       { fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 },
  arrow:         { fontSize: '10px', color: 'var(--c-text-2)', display: 'inline-block', transition: 'transform 0.2s' },
  activeBar:     { position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '3px', background: '#eab308', borderRadius: '0 3px 3px 0' },
  subMenuWrap:   { marginLeft: '10px', paddingLeft: '10px', borderLeft: '1px solid var(--c-border)' },
  subItem:       { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: '7px', color: 'var(--c-text-3)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', width: '100%' },
  subItemActive: { background: 'rgba(234,179,8,0.08)', color: '#eab308', fontWeight: '600' },
  subIcon:       { fontSize: '14px', width: '18px', textAlign: 'center' },
  pageMenuWrap:  { marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--c-border-sub)' },
  pageItem:      { display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', background: 'transparent', border: 'none', borderRadius: '6px', color: 'var(--c-text-2)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', width: '100%', overflow: 'hidden' },
  pageItemActive:{ background: 'rgba(234,179,8,0.06)', color: '#eab308', fontWeight: '600' },
  pageIcon:      { fontSize: '12px', flexShrink: 0 },
  logoutBtn:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'transparent', border: '1px solid var(--c-border)', borderRadius: '8px', color: 'var(--c-text-3)', fontSize: '13px', cursor: 'pointer', width: '100%' },
  hLine:         { display: 'block', width: '22px', height: '2px', background: 'var(--c-text-3)', borderRadius: '2px' },
  topBar:        { padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--c-bg-card)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 },
  pageTitle:     { color: 'var(--c-text-1)', fontSize: '18px', fontWeight: '700', margin: 0 },
  pagePath:      { color: 'var(--c-text-2)', fontSize: '12px', margin: '3px 0 0' },
  topBarRight:   { display: 'flex', alignItems: 'center', gap: '10px' },
  topBarUser:    { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--c-bg-deep)', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '6px 12px' },
  topBarAvatar:  { width: '26px', height: '26px', borderRadius: '50%', background: '#eab308', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px' },
  topBarName:    { color: 'var(--c-text-3)', fontSize: '13px', fontWeight: '500' },
  footer:        { padding: '10px 20px', borderTop: '1px solid var(--c-border-sub)', textAlign: 'center', flexShrink: 0 },
  footerText:    { color: 'var(--c-text-4)', fontSize: '11px' },
  devText:       { color: 'var(--c-text-3)', fontSize: '15px', lineHeight: '1.6', margin: 0, textAlign: 'center' },
  devBadge:      { background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },

  /* Modal */
  modalOverlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalBox:      { background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' },
  modalHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle:    { color: 'var(--c-text-1)', fontSize: '18px', fontWeight: '700', margin: 0 },
  modalClose:    { background: 'transparent', border: 'none', color: 'var(--c-text-3)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' },
  modalDesc:     { color: 'var(--c-text-3)', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  modalDevContent:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '10px 0' },

  /* Configuración — tarjetas de tema */
  themeRow:         { display: 'flex', gap: '12px' },
  themeCard:        { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 12px', background: 'var(--c-bg-deep)', border: '2px solid var(--c-border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s' },
  themeCardActive:  { borderColor: '#eab308', background: 'rgba(234,179,8,0.06)' },
  themeCardActiveLight:{ borderColor: '#fbbf24', background: 'rgba(251,191,36,0.08)' },
  themeCardLabel:   { color: 'var(--c-text-1)', fontSize: '13px', fontWeight: '600' },
  themeCardCheck:   { color: '#eab308', fontSize: '11px', fontWeight: '700' },
}
