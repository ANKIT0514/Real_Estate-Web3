import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--beige)' }}>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
