import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProperties } from '../utils/api.js'
import PropertyCard from '../components/PropertyCard.jsx'

const TYPES = ['All', 'House', 'Apartment', 'Villa', 'Commercial', 'Land', 'Office']

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy,     setSortBy]     = useState('newest')
  const [showFilters,setShowFilters]= useState(false)
  const [minPrice,   setMinPrice]   = useState('')
  const [maxPrice,   setMaxPrice]   = useState('')

  useEffect(() => {
    setLoading(true)
    getProperties()
      .then(d => { setProperties(d.properties || []); setFiltered(d.properties || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...properties]
    if (search)        result = result.filter(p => (p.name||'').toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') result = result.filter(p => p.propertyType === typeFilter)
    if (minPrice)      result = result.filter(p => parseFloat(p.price) >= parseFloat(minPrice))
    if (maxPrice)      result = result.filter(p => parseFloat(p.price) <= parseFloat(maxPrice))
    if (sortBy === 'price-asc')  result.sort((a,b) => parseFloat(a.price) - parseFloat(b.price))
    if (sortBy === 'price-desc') result.sort((a,b) => parseFloat(b.price) - parseFloat(a.price))
    setFiltered(result)
  }, [search, typeFilter, sortBy, minPrice, maxPrice, properties])

  const clearFilters = () => { setSearch(''); setTypeFilter('All'); setMinPrice(''); setMaxPrice(''); setSortBy('newest') }

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />

      <section style={{ padding: '60px 0 48px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="tag" style={{ marginBottom: 16 }}>On-Chain Listings</div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 12 }}>Available Properties</h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>{filtered.length} properties · All ownership verified on blockchain</p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <div style={{ position: 'sticky', top: 72, zIndex: 50, background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input className="input-field" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, height: 42 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  padding: '8px 14px', borderRadius: 100, fontSize: 12, border: 'none', cursor: 'pointer',
                  background: typeFilter === t ? 'var(--gold)' : 'var(--surface)',
                  color: typeFilter === t ? 'var(--black)' : 'var(--muted)',
                  transition: 'all 0.2s',
                }}>{t}</button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field"
              style={{ width: 'auto', height: 42, cursor: 'pointer' }}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button className="btn-ghost" onClick={() => setShowFilters(!showFilters)} style={{ padding: '10px 16px', fontSize: 12, height: 42 }}>
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>Price (ETH):</span>
              <input className="input-field" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 90, height: 36, fontSize: 13 }} type="number" />
              <span style={{ color: 'var(--dim)' }}>—</span>
              <input className="input-field" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 90, height: 36, fontSize: 13 }} type="number" />
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={12} /> Clear All
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <section className="section-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          {loading ? (
            <div className="grid-3">{[...Array(6)].map((_,i) => <div key={i} className="glass-card shimmer" style={{ height: 380 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏚</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--muted)', marginBottom: 8 }}>No Properties Found</h3>
              <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 24 }}>Clear Filters</button>
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