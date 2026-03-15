import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Globe, TrendingUp, ChevronDown } from 'lucide-react'
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

  const features = [
    { icon: Shield,     title: 'Fully On-Chain',    desc: 'Every property is an NFT. Ownership is verifiable on the blockchain forever.' },
    { icon: Zap,        title: 'Instant Transfer',  desc: 'Smart contracts execute transfers automatically. No intermediaries, no delays.' },
    { icon: Globe,      title: 'Global Access',     desc: 'Buy, sell, and rent properties anywhere in the world using crypto.' },
    { icon: TrendingUp, title: 'Transparent Price', desc: 'All transactions are public and verifiable. No hidden fees or manipulation.' },
  ]

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Hero */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          mask: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 60, paddingBottom: 60 }}>
          <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth: 800 }}>

            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <div className="tag" style={{ marginBottom: 32 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Blockchain-Powered Real Estate
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }}
              style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.0, marginBottom: 28, letterSpacing: '-0.03em' }}
            >
              The Future of{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Property
              </span>
              <br />Ownership
            </motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, marginBottom: 44 }}
            >
              Buy, sell, and rent real estate entirely on the blockchain.
              Every transaction is trustless, transparent, and permanent.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
            >
              <Link to="/properties" className="btn-primary" style={{ fontSize: 14, padding: '14px 32px' }}>
                Explore Properties <ArrowRight size={16} />
              </Link>
              {!account && (
                <button className="btn-ghost" onClick={connect} style={{ fontSize: 14, padding: '14px 32px' }}>
                  Connect Wallet
                </button>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: 48, marginTop: 64, paddingTop: 48, borderTop: '1px solid var(--border)' }}
            >
              {[
                { label: 'Properties Minted', value: stats.totalMinted },
                { label: 'Listed for Sale',   value: stats.totalListed },
                { label: 'Smart Contracts',   value: 4 },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'var(--dim)' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--deep)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div className="tag" style={{ marginBottom: 20 }}>Why EstateChain</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 16 }}>
              Real Estate, <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Reimagined</span>
            </h2>
            <div className="gold-line" style={{ marginTop: 24 }} />
          </motion.div>
          <div className="grid-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card" style={{ padding: '32px 28px' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={22} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
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

      {/* CTA */}
      <section className="section-sm">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 28, padding: '64px 48px', textAlign: 'center' }}
          >
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 16 }}>
              Ready to Own Property on<br />
              <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>the Blockchain?</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Connect your MetaMask wallet and start buying, selling, or renting properties today.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              {!account ? (
                <button className="btn-primary" onClick={connect} style={{ fontSize: 14, padding: '14px 36px' }}>
                  Connect Wallet <ArrowRight size={16} />
                </button>
              ) : (
                <Link to="/properties" className="btn-primary" style={{ fontSize: 14, padding: '14px 36px' }}>
                  Browse Properties <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', marginTop: 40 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Estate<span style={{ color: 'var(--gold)' }}>Chain</span></div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>Built on Ethereum · Smart Contracts · Fully Decentralized</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)' }}>v1.0.0</div>
        </div>
      </footer>
    </div>
  )
}