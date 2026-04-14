import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getProperties } from '../utils/api.js'
import IndiaPropertyMap from '../components/IndiaPropertyMap.jsx'

const SUPPORTED_CITIES = ['Bangalore', 'Mysore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Kolkata']
const STATUS_OPTIONS = ['All', 'Verified', 'Under Review', 'Pending Verification']
const SALE_OPTIONS = ['All', 'For Sale', 'Sold']

const getCity = (property) => property.city || property.attributes?.find(a => a.trait_type === 'City')?.value || ''
const getState = (property) => property.state || property.attributes?.find(a => a.trait_type === 'State')?.value || property.attributes?.find(a => a.trait_type === 'Country')?.value || ''
const getStatus = (property) => {
  const explicit = property.verificationStatus || property.legalStatus || property.attributes?.find(a => a.trait_type === 'Status')?.value
  if (explicit) return explicit
  if (property.isVerified) return 'Verified'
  if (property.isListed) return 'Under Review'
  return 'Pending Verification'
}
const getSale = (property) => (property.isForSale || property.isListed ? 'For Sale' : 'Sold')

const normalizeCity = (city) => city?.toString().trim().toLowerCase()

export default function IndiaMap() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [saleFilter, setSaleFilter] = useState('All')

  useEffect(() => {
    setLoading(true)
    getProperties()
      .then((data) => {
        setProperties(data.properties || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cityOptions = useMemo(() => [
    'All',
    ...SUPPORTED_CITIES.filter((city, index) => SUPPORTED_CITIES.indexOf(city) === index),
  ], [])

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const city = getCity(property)
      const status = getStatus(property)
      const sale = getSale(property)
      const supported = SUPPORTED_CITIES.map(normalizeCity).includes(normalizeCity(city))
      if (!supported) return false
      if (cityFilter !== 'All' && normalizeCity(city) !== normalizeCity(cityFilter)) return false
      if (statusFilter !== 'All' && status !== statusFilter) return false
      if (saleFilter !== 'All' && sale !== saleFilter) return false
      return true
    })
  }, [properties, cityFilter, statusFilter, saleFilter])

  const verifiedCount = filteredProperties.filter((p) => p.isVerified).length
  const forSaleCount = filteredProperties.filter((p) => getSale(p) === 'For Sale').length

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />
      <section style={{ padding: '72px 0 40px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="property-hero" style={{ marginTop: 28, alignItems: 'stretch' }}>
            <div className="hero-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div className="tag" style={{ background: 'rgba(176,141,87,0.12)', borderColor: 'rgba(176,141,87,0.22)' }}>EstateChain India</div>
                  <h2 style={{ fontSize: 'clamp(36px, 4vw, 54px)', marginTop: 20, marginBottom: 22, color: 'var(--navy)', lineHeight: 1.05 }}>Explore Verified Properties Across India</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.9, maxWidth: 650 }}>
                    Browse premium tokenized properties on an interactive India map. Discover verified city listings, legal status transparency, and quick access to property details.
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-card" style={{ display: 'grid', gap: 18, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: 18, background: 'rgba(176,141,87,0.12)', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>+</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Premium India markets</div>
                  <div style={{ color: 'var(--muted)', fontSize: 14 }}>Bangalore, Mumbai, Delhi, Pune and beyond.</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 20, borderRadius: 22, background: 'rgba(250,246,240,0.95)', border: '1px solid rgba(16,42,67,0.08)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Property count</div>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>{filteredProperties.length}</div>
                </div>
                <div style={{ padding: 20, borderRadius: 22, background: 'rgba(250,246,240,0.95)', border: '1px solid rgba(16,42,67,0.08)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Verified listings</div>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>{verifiedCount}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 20, borderRadius: 22, background: 'rgba(250,246,240,0.95)', border: '1px solid rgba(16,42,67,0.08)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>For sale</div>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>{forSaleCount}</div>
                </div>
                <div style={{ padding: 20, borderRadius: 22, background: 'rgba(250,246,240,0.95)', border: '1px solid rgba(16,42,67,0.08)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Legal transparency</div>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>India-ready</div>
                </div>
              </div>
            </div>
          </div>

          <div className="property-filters" style={{ marginTop: 32 }}>
            <div className="glass-card india-map-filter-card">
              <label>City</label>
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="glass-card india-map-filter-card">
              <label>Legal status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="glass-card india-map-filter-card">
              <label>Listing</label>
              <select value={saleFilter} onChange={(e) => setSaleFilter(e.target.value)}>
                {SALE_OPTIONS.map((sale) => <option key={sale} value={sale}>{sale}</option>)}
              </select>
            </div>
          </div>

          <div className="india-map-panel glass-card" style={{ padding: 0, marginTop: 28 }}>
            <div className="india-map-panel-header" style={{ padding: '26px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(16,42,67,0.08)', background: 'rgba(255,255,255,0.92)' }}>
              <div>
                <div className="tag" style={{ marginBottom: 10 }}>India Map View</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Premium city-based property exploration.</div>
              </div>
              <div className="status-pill" style={{ background: 'rgba(176,141,87,0.12)', color: 'var(--navy)' }}>Interactive map experience</div>
            </div>

            {loading ? (
              <div className="india-map-loading">Loading map properties…</div>
            ) : (
              <IndiaPropertyMap properties={filteredProperties} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
