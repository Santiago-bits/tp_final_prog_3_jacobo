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
import { ThemeToggle }    from '../mejoras_individuales/02_dark_mode/ThemeToggle'
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
  { id: 'alquiler',  label: 'Alquiler',          icon: '🏠', roles: ['ADMIN'] },
  { id: 'servicios', label: 'Servicios Técnicos', icon: '🔧', roles: ['ADMIN'] },
]

const pageLabels: Record<string, string> = {
  'home': 'Inicio', 'punto-venta': 'Punto de Venta',
  categorias: 'Categorías', articulos: 'Artículos', stock: 'Stock',
  alquiler: 'Alquiler', servicios: 'Servicios Técnicos',
}

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const sections      = allSections.filter(s => s.roles.includes(user.rol))
  const reactNavigate = useNavigate()
  const location      = useLocation()
  const activePage    = getActivePage(location.pathname)

  const { isDark, toggle: toggleTheme } = useTheme()

  const [expanded, setExpanded]           = useState<string[]>(['ventas', 'inventario'])
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [alertPanelOpen, setAlertPanel]   = useState(false)
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [highlightId, setHighlightId]     = useState<number | null>(null)
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

  const isAnyPageActive = (sub: SubSection) =>
    sub.children?.some(p => p.id === activePage) ?? false

  const renderContent = () => {
    if (activePage === 'home')        return <DashboardHome user={user} navigate={navigate} />
    if (activePage === 'punto-venta') return <Ventas user={user} />
    if (activePage === 'categorias')  return <Categorias user={user} />
    if (activePage === 'articulos')   return <Articulos user={user} />
    if (activePage === 'stock')       return <Stock user={user} highlightId={highlightId} onHighlightDone={() => setHighlightId(null)} />
    return (
      <div style={st.contentArea}>
        <div style={st.devCard}>
          <div style={st.devIcon}>🚧</div>
          <h3 style={st.devTitle}>En Desarrollo</h3>
          <p style={st.devText}>El módulo de <strong>{pageLabels[activePage]}</strong> está siendo construido.</p>
          <div style={st.devBadge}>Próximamente</div>
        </div>
      </div>
    )
  }

  return (
    <div className="db-layout">
      {sidebarOpen && <div className="db-backdrop" onClick={() => setSidebarOpen(false)} />}

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

          {/* Inicio en sidebar */}
          <div style={st.navSection}>
            <p style={st.navLabel}>MENÚ PRINCIPAL</p>
            <nav style={st.nav}>
              <button
                style={{ ...st.navItem, ...(activePage === 'home' ? st.navItemActive : {}), position: 'relative' }}
                onClick={() => navigate('home')}>
                {activePage === 'home' && <span style={st.activeBar} />}
                <span style={st.navIcon}>🏠</span>
                <span style={{ flex: 1, textAlign: 'left' }}>Inicio</span>
              </button>

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
            </nav>
          </div>
        </div>

        {/* Configuración visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {settingsOpen && (
            <div style={st.settingsPanel}>
              <p style={st.settingsPanelTitle}>⚙️ Apariencia</p>
              <div style={st.settingsRow}>
                <button
                  style={{ ...st.themeOptBtn, ...(isDark ? st.themeOptActive : {}) }}
                  onClick={() => { if (!isDark) toggleTheme() }}>
                  🌙 Oscuro
                </button>
                <button
                  style={{ ...st.themeOptBtn, ...(!isDark ? st.themeOptActiveLight : {}) }}
                  onClick={() => { if (isDark) toggleTheme() }}>
                  ☀️ Claro
                </button>
              </div>
            </div>
          )}
          <button
            style={{ ...st.settingsBtn, ...(settingsOpen ? st.settingsBtnActive : {}) }}
            onClick={() => setSettingsOpen(o => !o)}>
            <span>⚙️</span><span>Configuración</span>
          </button>
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
              <h2 style={st.pageTitle}>{pageLabels[activePage] ?? ''}</h2>
              <p className="db-topbar-path" style={st.pagePath}>
                SH Servicios &rsaquo; {pageLabels[activePage] ?? ''}
              </p>
            </div>
          </div>

          <div style={st.topBarRight}>
            <ThemeToggle />
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
                  onNavigateStock={() => navigateStock()}
                />
              )}
            </div>
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
  logoArea:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px 20px', borderBottom: '1px solid #334155' },
  logoImg:       { width: '38px', height: '38px', objectFit: 'contain', flexShrink: 0, borderRadius: '6px' },
  logoName:      { color: '#f1f5f9', fontSize: '14px', fontWeight: '700', margin: 0 },
  logoTag:       { color: '#eab308', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', margin: 0 },
  userCard:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' },
  avatar:        { width: '34px', height: '34px', borderRadius: '50%', background: '#eab308', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  userName:      { color: '#f1f5f9', fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:      { color: '#94a3b8', fontSize: '11px', margin: 0, marginTop: '1px' },
  navSection:    { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' },
  navLabel:      { color: '#cbd5e1', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', margin: '0 0 2px 8px' },
  nav:           { display: 'flex', flexDirection: 'column', gap: '1px' },
  navItem:       { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: '500', cursor: 'pointer', width: '100%', overflow: 'hidden' },
  navItemActive: { background: 'rgba(234,179,8,0.1)', color: '#eab308', fontWeight: '600' },
  navIcon:       { fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 },
  arrow:         { fontSize: '10px', color: '#cbd5e1', display: 'inline-block', transition: 'transform 0.2s' },
  activeBar:     { position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '3px', background: '#eab308', borderRadius: '0 3px 3px 0' },
  subMenuWrap:   { marginLeft: '10px', paddingLeft: '10px', borderLeft: '1px solid #334155' },
  subItem:       { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: '7px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', cursor: 'pointer', width: '100%' },
  subItemActive: { background: 'rgba(234,179,8,0.08)', color: '#eab308', fontWeight: '600' },
  subIcon:       { fontSize: '14px', width: '18px', textAlign: 'center' },
  pageMenuWrap:  { marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid #1e293b' },
  pageItem:      { display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', background: 'transparent', border: 'none', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px', fontWeight: '500', cursor: 'pointer', width: '100%', overflow: 'hidden' },
  pageItemActive:{ background: 'rgba(234,179,8,0.06)', color: '#eab308', fontWeight: '600' },
  pageIcon:      { fontSize: '12px', flexShrink: 0 },
  logoutBtn:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', width: '100%' },
  hLine:         { display: 'block', width: '22px', height: '2px', background: '#94a3b8', borderRadius: '2px' },
  topBar:        { padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 },
  pageTitle:     { color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: 0 },
  pagePath:      { color: '#cbd5e1', fontSize: '12px', margin: '3px 0 0' },
  topBarRight:   { display: 'flex', alignItems: 'center', gap: '10px' },
  topBarUser:    { display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px' },
  topBarAvatar:  { width: '26px', height: '26px', borderRadius: '50%', background: '#eab308', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px' },
  topBarName:    { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
  contentArea:   { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  devCard:       { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '400px' },
  devIcon:       { fontSize: '48px' },
  devTitle:      { color: '#f1f5f9', fontSize: '22px', fontWeight: '700', margin: 0 },
  devText:       { color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: 0 },
  devBadge:      { background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginTop: '8px' },
  footer:        { padding: '10px 20px', borderTop: '1px solid #1e293b', textAlign: 'center', flexShrink: 0 },
  footerText:    { color: '#334155', fontSize: '11px' },
  settingsBtn:      { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', width: '100%', transition: 'all 0.15s' },
  settingsBtnActive:{ borderColor: 'rgba(234,179,8,0.4)', color: '#eab308', background: 'rgba(234,179,8,0.06)' },
  settingsPanel:    { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  settingsPanelTitle:{ color: '#cbd5e1', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', margin: 0 },
  settingsRow:      { display: 'flex', gap: '6px' },
  themeOptBtn:      { flex: 1, padding: '8px 4px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' },
  themeOptActive:   { background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.35)', color: '#eab308', fontWeight: '700' },
  themeOptActiveLight:{ background: 'rgba(250,204,21,0.12)', borderColor: 'rgba(250,204,21,0.4)', color: '#ca8a04', fontWeight: '700' },
}
