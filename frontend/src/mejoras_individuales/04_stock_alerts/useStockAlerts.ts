import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { API_BASE } from '../../config'

export interface StockAlert {
  id: string
  productoId: number
  nombre: string
  stock: number
  stockMinimo: number
  categoria: string
  timestamp: Date
  leida: boolean
}

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(API_BASE || window.location.origin)
    socketRef.current = socket

    socket.on('low-stock', (producto: {
      id: number; nombre: string; stock: number; stockMinimo: number; categoria: { nombre: string }
    }) => {
      const alert: StockAlert = {
        id: `${producto.id}-${Date.now()}`,
        productoId: producto.id,
        nombre: producto.nombre,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        categoria: producto.categoria.nombre,
        timestamp: new Date(),
        leida: false,
      }
      setAlerts(prev => [alert, ...prev].slice(0, 50))
    })

    return () => { socket.disconnect() }
  }, [])

  const unreadCount = alerts.filter(a => !a.leida).length

  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, leida: true })))

  const clearAll = () => setAlerts([])

  return { alerts, unreadCount, markAllRead, clearAll }
}
