import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Menu, X, ChevronDown } from 'lucide-react'
import { useWallet } from '../context/WalletContext.jsx'

export default function Navbar() {
  const { account, shortAddress, connect, disconnect, connecting, balance } = useWallet()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [walletMenu, setWalletMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/india-map', label: 'India Map' },
    { to: '/dashboard?view=analytics', label: 'Analytics' },
    { to: '/marketplace', label: 'Verifier' },
    { to: '/dashboard?view=profile', label: 'Profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8 }}
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,

    // KEY FIXES
    background: scrolled ? 'rgba(10,14,22,0.55)' : 'transparent',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',

    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',

    // IMPORTANT
    transition: 'all 0.4s ease'
  }}
>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>

          {/* LOGO */}
          <Link to="/" style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>
            Easy<span style={{ color: 'gold' }}>Dwells</span>
          </Link>

          {/* DESKTOP MENU */}
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }} className="hidden md:flex">

            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 14,
                  color: isActive(link.to) ? 'white' : '#aaa',
                  background: isActive(link.to)
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                  border: isActive(link.to)
                    ? '1px solid rgba(255,255,255,0.2)'
                    : 'none',
                  transition: '0.3s'
                }}
              >
                {link.label}
              </Link>
            ))}

          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* WALLET */}
            {account ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setWalletMenu(!walletMenu)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    color: 'gold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {shortAddress}
                  <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {walletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '110%',
                        background: '#111',
                        padding: 16,
                        borderRadius: 12,
                        minWidth: 200,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <p style={{ color: 'gold', marginBottom: 10 }}>
                        {parseFloat(balance).toFixed(3)} ETH
                      </p>

                      <Link to="/dashboard" style={{ display: 'block', marginBottom: 8 }}>
                        Dashboard
                      </Link>

                      <button onClick={disconnect} style={{ color: 'red' }}>
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={connect}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'gold',
                  color: '#000',
                  fontWeight: 600
                }}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            )}

           
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              style={{
                background: '#111',
                padding: 20
              }}
            >
              {links.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{ display: 'block', marginBottom: 10 }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </>
  )
}