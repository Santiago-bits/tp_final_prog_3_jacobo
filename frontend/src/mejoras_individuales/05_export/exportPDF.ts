import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ProductoStock {
  nombre: string; stock: number; stockMinimo: number
  activo: boolean; categoria: { nombre: string }
}

interface ProductoArticulo {
  codigo: string | null; nombre: string; precioCosto: number
  precio: number; stock: number; activo: boolean; categoria: { nombre: string }
}

const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const now  = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function exportStockPDF(productos: ProductoStock[]) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Reporte de Stock — SH Servicios', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${now()} · ${productos.length} productos`, 14, 26)

  autoTable(doc, {
    startY: 32,
    head: [['Producto', 'Categoría', 'Stock', 'Mínimo', 'Estado']],
    body: productos.map(p => {
      const estado = p.stock === 0 ? 'Sin stock' : p.stock <= p.stockMinimo ? 'Stock bajo' : 'Normal'
      return [p.nombre, p.categoria.nombre, p.stock, p.stockMinimo, estado]
    }),
    headStyles: { fillColor: [30, 41, 59], textColor: [241, 245, 249] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10 },
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  })

  doc.save(`stock_${now().replace(/\//g, '-')}.pdf`)
}

export function exportArticulosPDF(productos: ProductoArticulo[]) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Listado de Artículos — SH Servicios', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generado: ${now()} · ${productos.length} artículos`, 14, 26)

  autoTable(doc, {
    startY: 32,
    head: [['Código', 'Nombre', 'Categoría', 'Costo', 'Venta', 'Stock']],
    body: productos.map(p => [
      p.codigo ?? '—', p.nombre, p.categoria.nombre,
      `$${fmt(p.precioCosto)}`, `$${fmt(p.precio)}`, p.stock,
    ]),
    headStyles: { fillColor: [30, 41, 59], textColor: [241, 245, 249] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9 },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'center' } },
  })

  doc.save(`articulos_${now().replace(/\//g, '-')}.pdf`)
}
