import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, MapPin, Bed, Bath, Maximize2, ExternalLink, Wallet, Clock, Check, AlertCircle, X } from 'lucide-react'
import { getProperty } from '../utils/api.js'
import { useWallet } from '../context/WalletContext.jsx'
import { getMarketplaceContract } from '../utils/contracts.js'
import { ethers } from 'ethers'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { account, signer } = useWallet()

  const [property,    setProperty]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('buy')
  const [txLoading,   setTxLoading]   = useState(false)
  const [txHash,      setTxHash]      = useState(null)
  const [error,       setError]       = useState(null)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerDays,   setOfferDays]   = useState(7)

  useEffect(() => {
    getProperty(id)
      .then(d => setProperty(d.property))
      .catch(() => navigate('/properties'))
      .finally(() => setLoading(false))
  }, [id])

  const buyProperty = async () => {
    if (!signer) return setError('Connect wallet first')
    setTxLoading(true); setError(null)
    try {
      const market = getMarketplaceContract(signer)
      const ethValue = property.priceInETH || property.price
      const tx = await market.buyProperty(id, { value: ethers.parseEther(ethValue) })
      await tx.wait()
      setTxHash(tx.hash)
    } catch (e) { setError(e.reason || e.message) }
    finally { setTxLoading(false) }
  }

  const makeOffer = async () => {
    if (!signer || !offerAmount) return setError('Enter offer amount')
    setTxLoading(true); setError(null)
    try {
      const market = getMarketplaceContract(signer)
      const tx = await market.makeOffer(id, offerDays, { value: ethers.parseEther(offerAmount) })
      await tx.wait()
      setTxHash(tx.hash)
    } catch (e) { setError(e.reason || e.message) }
    finally { setTxLoading(false) }
  }

  const getAttr = (trait) => property?.attributes?.find(a => a.trait_type === trait)?.value || '—'

  // Determine verification badge styling
  const getVerificationBadgeConfig = () => {
    const verificationStatus = property?.verificationStatus || 'Pending'
    if (verificationStatus === 'Verified') {
      return {
        icon: Check,
        background: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        color: '#166534',
        dotBg: '#22c55e',
      }
    } else if (verificationStatus === 'Rejected') {
      return {
        icon: X,
        background: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#7f1d1d',
        dotBg: '#ef4444',
      }
    } else {
      return {
        icon: AlertCircle,
        background: 'rgba(217, 119, 6, 0.15)',
        borderColor: 'rgba(217, 119, 6, 0.3)',
        color: '#78350f',
        dotBg: '#ea580c',
      }
    }
  }

  const verificationBadgeConfig = getVerificationBadgeConfig()
  const VerificationIcon = verificationBadgeConfig.icon

  const isVerifiedProperty = (property?.verificationStatus || 'Pending') === 'Verified'

  if (loading) return (
    <div style={{ paddingTop: 72, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
  if (!property) return null

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, position: 'relative', zIndex: 1 }}>

        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 32, padding: '8px 16px', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back
        </motion.button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, alignItems: 'start' }}>

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 32, background: '#f4efe6', aspectRatio: '16/9', boxShadow: '0 24px 60px rgba(16,42,67,0.08)' }}>
              {property.image ? (
                <img src={property.image} alt={property.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#7d8a97' }}>🏛</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1, color: 'var(--navy)' }}>{property.title || property.name || `Property #${property.tokenId}`}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(176,141,87,0.12)', color: '#102a43', fontSize: 12, whiteSpace: 'nowrap', fontWeight: 700 }}>{property.propertyType}</div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(12px)',
                  background: verificationBadgeConfig.background,
                  border: `2px solid ${verificationBadgeConfig.borderColor}`,
                  color: verificationBadgeConfig.color,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.3)',
                }}>
                  <VerificationIcon size={14} strokeWidth={2.5} />
                  {property.verificationStatus || 'Pending'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7d8a97', fontSize: 14, marginBottom: 24 }}>
              <MapPin size={14} color="#7d8a97" /> {property.city || getAttr('City') || ''}{(property.state || getAttr('State') || getAttr('Country')) ? `, ${property.state || getAttr('State') || getAttr('Country')}` : ''}
            </div>

            <div style={{ display: 'flex', gap: 24, padding: '24px 0', borderTop: '1px solid rgba(16,42,67,0.08)', borderBottom: '1px solid rgba(16,42,67,0.08)', marginBottom: 32 }}>
              {[
                { icon: Bed,       label: 'Bedrooms',  val: getAttr('Bedrooms') },
                { icon: Bath,      label: 'Bathrooms', val: getAttr('Bathrooms') },
                { icon: Maximize2, label: 'Area',      val: `${getAttr('Area (sqft)')} sqft` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={16} color="var(--gold)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 12, fontWeight: 400 }}>About this Property</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 14, marginBottom: 32 }}>{property.description || 'No description provided.'}</p>

            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 400 }}>Blockchain Details</h3>
              {[
                { label: 'Token ID', val: `#${property.tokenId}` },
                { label: 'Owner',    val: property.currentOwner ? `${property.currentOwner.slice(0,10)}...${property.currentOwner.slice(-6)}` : '—' },
                { label: 'Verified', val: property.isVerified ? '✓ Yes' : 'No' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--dim)' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Buy Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ position: 'sticky', top: 100 }}
          >
            <div className="glass-card" style={{ padding: 28, border: '1px solid rgba(16,42,67,0.08)', background: '#ffffff' }}>
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Price</div>
                <div style={{ fontSize: 42, fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>
                  {property.priceInETH || property.price} <span style={{ fontSize: 18, color: 'var(--muted)' }}>ETH</span>
                </div>
                {property.priceInINR && <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>{property.priceInINR}</div>}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f4efe6', borderRadius: 14, padding: 6 }}>
                {['buy', 'offer', 'escrow'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: tab === t ? 'var(--gold)' : 'transparent',
                    color: tab === t ? 'var(--navy)' : '#5e6d77',
                    fontSize: 13, fontFamily: 'var(--font-body)', textTransform: 'capitalize', transition: 'all 0.2s',
                    fontWeight: 700,
                  }}>{t}</button>
                ))}
              </div>

              {tab === 'buy' && (
                <div>
                  {!isVerifiedProperty && (
                    <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 20, marginTop: -2 }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#854d0e', marginBottom: 4 }}>Verification Required</div>
                        <p style={{ fontSize: 12, color: '#7c2d12', lineHeight: 1.5 }}>This property must be legally verified before purchase. Contact the seller or our support for verification status.</p>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
                    Purchase this property instantly. The NFT transfers to your wallet upon payment.
                  </p>
                  <button className="btn-primary" onClick={buyProperty}
                    disabled={!isVerifiedProperty || txLoading || !account || !property.isListed}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '16px', opacity: !isVerifiedProperty ? 0.5 : 1 }}
                  >
                    {txLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing...</> : <><Wallet size={15} /> Buy for {property.priceInETH || property.price} ETH</>}
                  </button>
                </div>
              )}

              {tab === 'offer' && (
                <div>
                  {!isVerifiedProperty && (
                    <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 20, marginTop: -2 }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#854d0e', marginBottom: 4 }}>Verification Required</div>
                        <p style={{ fontSize: 12, color: '#7c2d12', lineHeight: 1.5 }}>This property must be legally verified before purchase. Contact the seller or our support for verification status.</p>
                      </div>
                    </div>
                  )}
                  <div style={{ marginBottom: 16, opacity: !isVerifiedProperty ? 0.5 : 1, pointerEvents: !isVerifiedProperty ? 'none' : 'auto' }}>
                    <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Your Offer (ETH)</label>
                    <input className="input-field" placeholder="0.00" type="number" min="0" step="0.01" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} disabled={!isVerifiedProperty} />
                  </div>
                  <div style={{ marginBottom: 20, opacity: !isVerifiedProperty ? 0.5 : 1, pointerEvents: !isVerifiedProperty ? 'none' : 'auto' }}>
                    <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Expires in: {offerDays} days</label>
                    <input type="range" min="1" max="30" value={offerDays} onChange={e => setOfferDays(e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} disabled={!isVerifiedProperty} />
                  </div>
                  <button className="btn-primary" onClick={makeOffer} disabled={!isVerifiedProperty || txLoading || !account || !offerAmount}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px', opacity: !isVerifiedProperty ? 0.5 : 1 }}
                  >
                    {txLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : 'Submit Offer'}
                  </button>
                </div>
              )}

              {tab === 'escrow' && (
                <div>
                  {!isVerifiedProperty && (
                    <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 20, marginTop: -2 }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#854d0e', marginBottom: 4 }}>Verification Required</div>
                        <p style={{ fontSize: 12, color: '#7c2d12', lineHeight: 1.5 }}>This property must be legally verified before purchase. Contact the seller or our support for verification status.</p>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20, opacity: !isVerifiedProperty ? 0.5 : 1 }}>
                    Funds are held by the smart contract until both parties approve the deal.
                  </p>
                  <div style={{ opacity: !isVerifiedProperty ? 0.5 : 1, pointerEvents: !isVerifiedProperty ? 'none' : 'auto' }}>
                    {['Buyer deposits ETH', 'Both parties approve', 'Funds + NFT transferred'].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-ghost" disabled={!isVerifiedProperty} style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginTop: 16, opacity: !isVerifiedProperty ? 0.5 : 1 }}>
                    Start Escrow
                  </button>
                </div>
              )}

              {error && <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.16)', borderRadius: 14, fontSize: 13, color: '#991b1b' }}>{error}</div>}
              {txHash && <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, fontSize: 13, color: '#047857' }}>✓ Transaction confirmed! <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 6 }}>{txHash.slice(0,30)}...</div></div>}
              {!account && <p style={{ textAlign: 'center', fontSize: 13, color: '#7d8a97', marginTop: 16 }}>Connect your wallet to transact</p>}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}