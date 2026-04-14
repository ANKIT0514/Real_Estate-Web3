import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProperties } from '../utils/api.js'
import PropertyCard from '../components/PropertyCard.jsx'

const TYPE_OPTIONS = ['All', 'House', 'Apartment', 'Villa', 'Commercial', 'Land', 'Office']
const STATUS_OPTIONS = ['All', 'Verified', 'Pending Verification', 'Under Review']

const getAttr = (attributes, trait) => attributes?.find(a => a.trait_type === trait)?.value || '—'
const getCity = (property) => property.city || getAttr(property.attributes, 'City')
const getState = (property) => property.state || getAttr(property.attributes, 'State') || getAttr(property.attributes, 'Country')
const getStatus = (property) => {
  const explicit = getAttr(property.attributes, 'Status')
  if (explicit !== '—') return explicit
  if (property.isVerified) return 'Verified'
  if (property.isListed) return 'Under Review'
  return 'Pending Verification'
}

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy]       = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')

  const cityOptions = useMemo(() => [
    'All',
    ...Array.from(new Set(properties.map(getCity).filter(v => v !== '—'))),
  ], [properties])

  const stateOptions = useMemo(() => [
    'All',
    ...Array.from(new Set(properties.map(getState).filter(v => v !== '—'))),
  ], [properties])

  const cityStats = useMemo(() => {
    const totals = properties.reduce((agg, property) => {
      const city = getCity(property) || 'Unknown'
      if (city === '—') return agg
      agg[city] = (agg[city] || 0) + 1
      return agg
    }, {})

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([city, count]) => ({ city, count }))
  }, [properties])

  const verifiedCount = useMemo(() => properties.filter(p => p.isVerified).length, [properties])
  const forSaleCount = useMemo(() => properties.filter(p => p.isListed).length, [properties])

  useEffect(() => {
    setLoading(true)
    getProperties()
      .then(d => { setProperties(d.properties || []); setFiltered(d.properties || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...properties]
    if (search) result = result.filter(p => ((p.title || p.name) || '').toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') result = result.filter(p => p.propertyType === typeFilter)
    if (cityFilter !== 'All') result = result.filter(p => getCity(p) === cityFilter)
    if (stateFilter !== 'All') result = result.filter(p => getState(p) === stateFilter)
    if (statusFilter !== 'All') result = result.filter(p => getStatus(p) === statusFilter)
    if (minPrice) result = result.filter(p => parseFloat(p.price) >= parseFloat(minPrice))
    if (maxPrice) result = result.filter(p => parseFloat(p.price) <= parseFloat(maxPrice))
    if (sortBy === 'price-asc') result.sort((a,b) => parseFloat(a.price) - parseFloat(b.price))
    if (sortBy === 'price-desc') result.sort((a,b) => parseFloat(b.price) - parseFloat(a.price))
    if (sortBy === 'newest') result.sort((a,b) => Number(b.tokenId) - Number(a.tokenId))
    setFiltered(result)
  }, [search, typeFilter, cityFilter, stateFilter, statusFilter, sortBy, minPrice, maxPrice, properties])

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('All')
    setCityFilter('All')
    setStateFilter('All')
    setStatusFilter('All')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
  }

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />

      <section style={{ padding: '72px 0 42px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="tag" style={{ marginBottom: 16 }}>EstateChain India</div>
            <h1 style={{ fontSize: 'clamp(38px, 5vw, 64px)', marginBottom: 16 }}>Explore Verified Properties Across India</h1>
            <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 680, lineHeight: 1.8 }}>
              Discover premium listings with trusted legal verification, transparent ownership records, and optimized search for India’s top real estate markets.
            </p>
          </motion.div>

          <div className="property-hero" style={{ marginTop: 28 }}>
            <div className="hero-card">
              <p style={{ marginBottom: 14, color: '#7d8a97', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Curated listings
              </p>
              <h2 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 18 }}>
                Premium homes, commercial land, and verified portfolios from Mumbai to Bangalore.
              </h2>
              <p style={{ color: 'var(--dim)', lineHeight: 1.8 }}>
                Browse verified estates with district-level filtering, robust ownership records, and legal status badges for confidence in every transaction.
              </p>
            </div>
            <div className="hero-card" style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <span className="status-pill">Verified ownership secured on-chain</span>
                <span className="status-pill">Instant legal status visibility</span>
                <span className="status-pill">Designed for India’s premium property market</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                <div style={{ flex: '1 1 120px', minWidth: 120, background: 'rgba(16,42,67,0.06)', borderRadius: 18, padding: 18 }}>
                  <div style={{ fontSize: 34, color: 'var(--gold)', marginBottom: 6 }}>₹2.1Cr+</div>
                  <div style={{ fontSize: 13, color: '#5e6d77' }}>Premium listings</div>
                </div>
                <div style={{ flex: '1 1 120px', minWidth: 120, background: 'rgba(250,246,240,0.9)', borderRadius: 18, padding: 18 }}>
                  <div style={{ fontSize: 34, color: '#102a43', marginBottom: 6 }}>{properties.length}</div>
                  <div style={{ fontSize: 13, color: '#5e6d77' }}>Active properties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ position: 'sticky', top: 72, zIndex: 50, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(16,42,67,0.08)', padding: '18px 0' }}>
        <div className="container">
          <div className="property-filters">
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input className="input-field" placeholder="Search by property name" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44, height: 44 }} />
            </div>

            <select className="input-field" value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={{ minWidth: 180, height: 44 }}>
              {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
            </select>

            <select className="input-field" value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ minWidth: 180, height: 44 }}>
              {stateOptions.map(state => <option key={state} value={state}>{state}</option>)}
            </select>

            <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: 180, height: 44 }}>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>

            <select className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 180, height: 44 }}>
              <option value="newest">Newest listed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button className="btn-ghost" onClick={() => setShowFilters(!showFilters)} style={{ padding: '12px 18px', fontSize: 13, height: 44 }}>
              <SlidersHorizontal size={16} /> Advanced
            </button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--dim)' }}>Price (ETH)</span>
                <input className="input-field" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 110, height: 40, fontSize: 13 }} />
                <span style={{ color: 'var(--dim)' }}>—</span>
                <input className="input-field" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 110, height: 40, fontSize: 13 }} />
              </div>
              <button onClick={clearFilters} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: 999 }}>
                <X size={14} /> Clear all filters
              </button>
              <div style={{ marginLeft: 'auto', color: 'var(--dim)', fontSize: 13 }}>
                Showing {filtered.length} properties
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="market-summary" style={{ marginTop: 28 }}>
        <div className="market-summary-card">
          <div className="tag" style={{ marginBottom: 10 }}>India market snapshot</div>
          <h2 style={{ fontSize: 24, marginBottom: 10, color: 'var(--navy)' }}>Top city demand across key Indian markets</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, maxWidth: 520 }}>
            View the most active verified property hubs in India and quickly compare listing volume, verified assets, and for-sale inventory.
          </p>
        </div>
        <div className="market-summary-grid">
          <div className="market-summary-metric">
            <span className="metric-label">Total tokenized properties</span>
            <strong>{properties.length}</strong>
          </div>
          <div className="market-summary-metric">
            <span className="metric-label">Verified listings</span>
            <strong>{verifiedCount}</strong>
          </div>
          <div className="market-summary-metric">
            <span className="metric-label">Properties for sale</span>
            <strong>{forSaleCount}</strong>
          </div>
          {cityStats.map((item) => (
            <div key={item.city} className="market-summary-metric">
              <span className="metric-label">{item.city}</span>
              <strong>{item.count} listings</strong>
            </div>
          ))}
        </div>
      </div>

      <section className="section-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          {loading ? (
            <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="glass-card shimmer" style={{ height: 420 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏚</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--muted)', marginBottom: 8 }}>No matching properties</h3>
              <p style={{ color: 'var(--muted)', maxWidth: 520, margin: '0 auto 24px' }}>Try a broader city, state, or price range to uncover more premium listings across India.</p>
              <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 24 }}>Reset filters</button>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map((p, i) => <PropertyCard key={p.tokenId} property={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
