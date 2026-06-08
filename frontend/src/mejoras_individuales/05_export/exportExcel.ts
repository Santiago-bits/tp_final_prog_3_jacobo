import * as XLSX from 'xlsx'

interface ProductoStock {
  nombre: string; stock: number; stockMinimo: number
  activo: boolean; categoria: { nombre: string }
}

interface ProductoArticulo {
  codigo: string | null; nombre: string; precioCosto: number
  precio: number; stock: number; activo: boolean; categoria: { nombre: string }
}

const now = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function exportStockExcel(productos: ProductoStock[]) {
  const data = productos.map(p => ({
    Producto: p.nombre,
    Categoría: p.categoria.nombre,
    Stock: p.stock,
    Mínimo: p.stockMinimo,
    Estado: p.stock === 0 ? 'Sin stock' : p.stock <= p.stockMinimo ? 'Stock bajo' : 'Normal',
    Activo: p.activo ? 'Sí' : 'No',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 40 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 8 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stock')
  XLSX.writeFile(wb, `stock_${now().replace(/\//g, '-')}.xlsx`)
}

export function exportArticulosExcel(productos: ProductoArticulo[]) {
  const data = productos.map(p => ({
    Código: p.codigo ?? '—',
    Nombre: p.nombre,
    Categoría: p.categoria.nombre,
    'Precio Costo': p.precioCosto,
    'Precio Venta': p.precio,
    Stock: p.stock,
    Activo: p.activo ? 'Sí' : 'No',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 8 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Artículos')
  XLSX.writeFile(wb, `articulos_${now().replace(/\//g, '-')}.xlsx`)
}
