import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Menu, X, Building2, ChevronDown } from 'lucide-react'
import { useWallet } from '../context/WalletContext.jsx'

export default function Navbar() {
  const { account, shortAddress, connect, disconnect, connecting, balance } = useWallet()
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [walletMenu, setWalletMenu] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const links = [
    { to: '/',                      label: 'Home' },
    { to: '/properties',            label: 'Properties' },
    { to: '/india-map',             label: 'India Map' },
    { to: '/dashboard?view=analytics', label: 'Analytics' },
    { to: '/marketplace',           label: 'Verifier' },
    { to: '/dashboard?view=profile', label: 'Profile' },
  ]

  const getActive = (link) => {
    if (link.label === 'Home') return location.pathname === '/'
    if (link.label === 'Properties') return location.pathname === '/properties'
    if (link.label === 'India Map') return location.pathname === '/india-map'
    if (link.label === 'Analytics') return location.pathname === '/dashboard' && !location.search.includes('view=profile')
    if (link.label === 'Profile') return location.pathname === '/dashboard' && location.search.includes('view=profile')
    return location.pathname === link.to
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 18, left: 18, right: 18, zIndex: 100,
          padding: '0 28px', minHeight: 76,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(10,14,22,0.92)' : 'rgba(10,14,22,0.74)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          boxShadow: scrolled ? '0 26px 60px rgba(0,0,0,0.18)' : '0 18px 45px rgba(0,0,0,0.14)',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={18} color="#f7ede0" strokeWidth={2} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#f4efe6', letterSpacing: '-0.02em' }}>
            EstateChain <span style={{ color: 'var(--gold)' }}>India</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {links.map((link) => {
            const active = getActive(link)
            return (
              <Link key={`${link.label}-${link.to}`} to={link.to} className={active ? 'nav-link active' : 'nav-link'}>
                {link.label}
              </Link>
            )
          })}
        </div>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Wallet */}
        <div style={{ position: 'relative' }}>
          {account ? (
            <button onClick={() => setWalletMenu(!walletMenu)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 999, color: '#fff', fontSize: 13, fontWeight: 600,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest)', boxShadow: '0 0 8px rgba(18,70,52,0.25)' }} />
              {shortAddress}
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: walletMenu ? 'rotate(180deg)' : 'none' }} />
            </button>
          ) : (
            <button className="btn-primary" onClick={connect} disabled={connecting} style={{ padding: '10px 20px', fontSize: 13 }}>
              {connecting ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Wallet size={14} />}
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          <AnimatePresence>
            {walletMenu && account && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--white)', border: '1px solid rgba(16,42,67,0.08)',
                  borderRadius: 18, padding: 16, minWidth: 240,
                  boxShadow: '0 24px 55px rgba(16,42,67,0.12)',
                }}
              >
                <div style={{ padding: '10px 12px', marginBottom: 12, borderBottom: '1px solid rgba(16,42,67,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#7d8a97', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Balance</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                    {parseFloat(balance).toFixed(4)} <span style={{ fontSize: 13, color: '#5e6d77' }}>ETH</span>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setWalletMenu(false)}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#5e6d77', marginBottom: 8, background: 'rgba(16,42,67,0.03)' }}
                >My Dashboard</Link>
                <button onClick={() => { disconnect(); setWalletMenu(false) }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#b63636', background: 'transparent', border: '1px solid rgba(182,54,54,0.12)' }}
                >Disconnect</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="navbar-mobile-menu"
          >
            {links.map((link) => {
              const active = getActive(link)
              return (
                <Link key={`${link.label}-mobile`} to={link.to} className={active ? 'mobile-nav-link active' : 'mobile-nav-link'}>
                  {link.label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}