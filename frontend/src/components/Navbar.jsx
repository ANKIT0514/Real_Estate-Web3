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
    { to: '/',            label: 'Home' },
    { to: '/properties',  label: 'Properties' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/dashboard',   label: 'Dashboard' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 32px', height: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(13,13,15,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-d))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={18} color="#080808" strokeWidth={2} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Estate<span style={{ color: 'var(--gold)' }}>Chain</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 16px', borderRadius: 6,
              fontSize: 13, fontWeight: 400,
              color: location.pathname === l.to ? 'var(--gold)' : 'var(--muted)',
              background: location.pathname === l.to ? 'rgba(201,168,76,0.08)' : 'transparent',
              transition: 'all 0.2s', letterSpacing: '0.02em',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <div style={{ position: 'relative' }}>
          {account ? (
            <button onClick={() => setWalletMenu(!walletMenu)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 8, color: 'var(--gold)', fontSize: 13,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
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
                  background: 'var(--card)', border: '1px solid var(--border-h)',
                  borderRadius: 12, padding: 12, minWidth: 220,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ padding: '8px 12px', marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Balance</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                    {parseFloat(balance).toFixed(4)} <span style={{ fontSize: 13, color: 'var(--muted)' }}>ETH</span>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setWalletMenu(false)}
                  style={{ display: 'block', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: 'var(--muted)' }}
                >My Dashboard</Link>
                <button onClick={() => { disconnect(); setWalletMenu(false) }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: 'var(--red)', background: 'transparent', border: 'none' }}
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 99,
              background: 'var(--deep)', borderBottom: '1px solid var(--border)',
              padding: '16px 24px',
            }}
          >
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                color: location.pathname === l.to ? 'var(--gold)' : 'var(--muted)',
                fontSize: 15,
              }}>{l.label}</Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}