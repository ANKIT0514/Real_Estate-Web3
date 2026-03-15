import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, MapPin, Home } from 'lucide-react'
import { getListings } from '../utils/api.js'

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getListings()
      .then(d => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getAttr = (attrs, trait) => attrs?.find(a => a.trait_type === trait)?.value || '—'

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />

      {/* Header */}
      <section style={{ padding: '60px 0 48px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="tag" style={{ marginBottom: 16 }}>
              <TrendingUp size={11} /> Live Marketplace
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 12 }}>Active Listings</h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              {listings.length} active listings · Direct on-chain purchases
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">

          {loading ? (
            <div className="grid-3">
              {[...Array(5)].map((_,i) => (
                <div key={i} className="glass-card shimmer" style={{ height: 320 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏛</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--muted)', marginBottom: 8 }}>
                No Active Listings
              </h3>
              <p style={{ fontSize: 14, marginBottom: 24 }}>
                Be the first to list a property
              </p>
              <Link to="/dashboard" className="btn-primary">
                List a Property <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid-3">
              {listings.map((l, i) => (
                <motion.div key={l.tokenId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card"
                >
                  <Link to={`/properties/${l.tokenId}`}>
                    {/* Image */}
                    <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--surface)' }}>
                      {l.image ? (
                        <img src={l.image} alt={l.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--dim)' }}>🏛</div>
                      )}

                      {/* Live badge */}
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(74,222,128,0.15)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        borderRadius: 100, padding: '4px 10px',
                        fontSize: 10, color: 'var(--green)',
                        fontWeight: 500, letterSpacing: '0.06em',
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                        LIVE
                      </div>

                      {/* Token badge */}
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        padding: '3px 8px', borderRadius: 4,
                        fontSize: 10, color: 'var(--dim)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        #{l.tokenId}
                      </div>

                      {/* Price overlay */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(0deg, rgba(8,8,8,0.95) 0%, transparent 100%)',
                        padding: '28px 16px 12px',
                      }}>
                        <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 300 }}>
                          {l.price} <span style={{ fontSize: 14, color: 'var(--muted)' }}>ETH</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px 20px 20px' }}>
                      <h3 style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
                        {l.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--dim)', fontSize: 12, marginBottom: 14 }}>
                        <MapPin size={11} />
                        {getAttr(l.attributes, 'City')}{getAttr(l.attributes, 'Country') !== '—' ? `, ${getAttr(l.attributes, 'Country')}` : ''}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                          {l.seller?.slice(0,8)}...{l.seller?.slice(-4)}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 12, color: 'var(--gold)',
                          background: 'rgba(201,168,76,0.08)',
                          padding: '4px 10px', borderRadius: 4,
                        }}>
                          Buy Now <ArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}