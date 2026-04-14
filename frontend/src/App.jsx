import { Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Dashboard from './pages/Dashboard.jsx'
import IndiaMap from './pages/IndiaMap.jsx'

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="india-map" element={<IndiaMap />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </WalletProvider>
  )
}