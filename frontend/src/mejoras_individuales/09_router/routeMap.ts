export const PAGE_TO_URL: Record<string, string> = {
  'home':        '/',
  'punto-venta': '/ventas',
  'categorias':  '/inventario/categorias',
  'articulos':   '/inventario/articulos',
  'stock':       '/inventario/stock',
  'alquiler':    '/alquiler',
  'servicios':   '/servicios',
}

export const URL_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_URL).map(([k, v]) => [v, k])
)

export function getActivePage(pathname: string): string {
  return URL_TO_PAGE[pathname] ?? 'home'
}
