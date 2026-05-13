import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <Navbar />
      <main className="app-main" style={{ background: 'linear-gradient(120deg, var(--dark) 80%, var(--deep) 100%)', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
