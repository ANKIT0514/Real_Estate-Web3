import { Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <WalletProvider>
      <div style={{ minHeight: '100vh', background: 'var(--void)' }}>
        <Navbar />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/properties"     element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/marketplace"    element={<Marketplace />} />
          <Route path="/dashboard"      element={<Dashboard />} />
        </Routes>
      </div>
    </WalletProvider>
  )
}