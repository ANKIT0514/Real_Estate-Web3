import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, FileText, MapPin, Layers, ChevronDown } from 'lucide-react'
import { useWallet } from '../context/WalletContext.jsx'
import { getStats, getProperties } from '../utils/api.js'
import PropertyCard from '../components/PropertyCard.jsx'

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const { connect, account } = useWallet()
  const [stats,    setStats]    = useState({ totalMinted: 0, totalListed: 0 })
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    getStats().then(d => setStats(d)).catch(() => {})
    getProperties().then(d => setFeatured((d.properties || []).slice(0, 3))).catch(() => {})
  }, [])

  const highlights = [
    { icon: Shield,     title: 'Verified Ownership',          desc: 'Tokenized title records ensure ownership is authenticated and easily transferable.' },
    { icon: FileText,   title: 'Legal Document Validation',   desc: 'Upload deeds, approvals, and NOCs for seamless verification with every listing.' },
    { icon: MapPin,     title: 'India City Listings',         desc: 'Explore premium properties from Mumbai, Delhi, Bangalore, Pune and other leading markets.' },
    { icon: Layers,     title: 'Blockchain Transparency',    desc: 'Every transaction is recorded immutably, creating a trusted audit trail for buyers and sellers.' },
  ]

  const processSteps = [
    { title: 'List Property',       desc: 'Create a polished asset listing with complete property details.' },
    { title: 'Upload Documents',    desc: 'Submit ownership papers, clearances, and certificates for verification.' },
    { title: 'Verify',              desc: 'Confirm legal authenticity and blockchain-backed title integrity.' },
    { title: 'Buy Securely',        desc: 'Complete purchase with confidence using secure on-chain settlement.' },
  ]

  const heroStats = [
    { label: 'Verified Properties', value: stats.totalMinted ? `${stats.totalMinted}+` : '128+' },
    { label: 'Indian Cities Covered', value: '14+' },
    { label: 'Documents Validated', value: '5,400+' },
  ]

  return (
    <div style={{ paddingTop: 96 }}>
      <section className="hero-section" style={{ backgroundImage: "url('/home.png')" }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <motion.div variants={stagger} initial="hidden" animate="show" className="hero-copy">
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="tag" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)', color: '#f7ede0' }}>
                Luxury real estate secured on-chain
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} transition={{ duration: 0.75, delay: 0.1 }} className="hero-title">
              Secure Property Ownership in India
            </motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.75, delay: 0.15 }} className="hero-subtitle">
              Buy, verify, and manage real estate across Indian cities with blockchain-backed trust and document verification.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.75, delay: 0.25 }} className="hero-actions">
              <Link to="/properties" className="btn-primary">Explore Properties <ArrowRight size={16} /></Link>
              {account ? (
                <Link to="/dashboard" className="btn-secondary">Upload Property</Link>
              ) : (
                <button className="btn-secondary" onClick={connect}>Connect Wallet</button>
              )}
            </motion.div>

            <motion.p variants={fadeUp} transition={{ duration: 0.75, delay: 0.3 }} className="hero-support">
              e-Katha / A-Katha / B-Katha Verification • On-chain Ownership • India City Listings
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.75, delay: 0.35 }} className="hero-right">
            <div className="hero-stats-grid">
              {heroStats.map((item, index) => (
                <div key={index} className="hero-glass-card">
                  <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700, marginBottom: 12 }}>{item.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div className="tag" style={{ marginBottom: 20 }}>Core Benefits</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 16, color: '#102a43' }}>
              Built for premium Indian real estate transactions
            </h2>
            <p style={{ maxWidth: 640, margin: '0 auto', color: '#7d8a97', lineHeight: 1.8 }}>
              EstateChain delivers verified ownership, legal validation, city-wide listings, and immutable transparency for confident buying and selling.
            </p>
          </motion.div>
          <div className="grid-4">
            {highlights.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card" style={{ padding: '32px 28px', minHeight: 250 }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(176,141,87,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, color: '#102a43' }}>
                  <item.icon size={24} />
                </div>
                <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: '#102a43', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#5e6d77', lineHeight: 1.9 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}
            >
              <div>
                <div className="tag" style={{ marginBottom: 16 }}>On The Market</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Featured Properties</h2>
              </div>
              <Link to="/properties" className="btn-ghost" style={{ flexShrink: 0 }}>View All <ArrowRight size={14} /></Link>
            </motion.div>
            <div className="grid-3">
              {featured.map((p, i) => <PropertyCard key={p.tokenId} property={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trusted Process */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div className="tag" style={{ marginBottom: 20 }}>Trusted Process</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 16, color: '#102a43' }}>
              List Property → Upload Documents → Verify → Buy Securely
            </h2>
            <p style={{ maxWidth: 640, margin: '0 auto', color: '#7d8a97', lineHeight: 1.8 }}>
              A clear, step-by-step workflow built for India’s real estate buyers and sellers, blending legal certainty with blockchain trust.
            </p>
          </motion.div>

          <div className="grid-4">
            {processSteps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card" style={{ padding: 30, minHeight: 210 }}
              >
                <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: 'rgba(16,42,67,0.06)', color: '#102a43', fontWeight: 700, fontSize: 18 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 20, color: '#102a43', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: '#5e6d77', lineHeight: 1.85 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: 'linear-gradient(135deg, rgba(176,141,87,0.14), rgba(244,239,230,0.85))', border: '1px solid rgba(16,42,67,0.08)', borderRadius: 28, padding: '64px 48px', textAlign: 'center' }}
          >
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 16, color: '#102a43' }}>
              Start building your trusted property portfolio
            </h2>
            <p style={{ color: '#5e6d77', fontSize: 16, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
              Connect your wallet to view the latest curated Indian listings and complete purchases with verified ownership.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/properties" className="btn-primary" style={{ fontSize: 14, padding: '14px 36px' }}>
                Explore Properties <ArrowRight size={16} />
              </Link>
              {!account ? (
                <button className="btn-ghost" onClick={connect} style={{ fontSize: 14, padding: '14px 36px' }}>
                  Connect Wallet
                </button>
              ) : (
                <Link to="/dashboard" className="btn-ghost" style={{ fontSize: 14, padding: '14px 36px' }}>
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0', borderTop: '1px solid rgba(16,42,67,0.08)', marginTop: 40, background: '#ffffff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: 32, alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: 24, marginBottom: 14, color: '#102a43' }}>EstateChain</h3>
            <p style={{ color: '#7d8a97', maxWidth: 460, lineHeight: 1.8 }}>
              Secure property ownership and verified asset transfer across Indian cities using blockchain-backed records.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 18, color: '#102a43' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#5e6d77' }}>
              <Link to="/properties">Properties</Link>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 18, color: '#102a43' }}>Contact</h4>
            <p style={{ color: '#5e6d77', lineHeight: 1.8 }}>support@estatechain.in</p>
            <p style={{ color: '#5e6d77', lineHeight: 1.8 }}>+91 98765 43210</p>
          </div>
        </div>
      </footer>
    </div>
  )
}