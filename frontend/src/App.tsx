import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import type { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (!parsed.nombre) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return null
    }
    return parsed
  })

  const handleLogin = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
