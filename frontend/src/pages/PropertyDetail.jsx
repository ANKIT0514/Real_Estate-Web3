import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, MapPin, Bed, Bath, Maximize2, ExternalLink, Wallet, Clock } from 'lucide-react'
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
      const tx = await market.buyProperty(id, { value: ethers.parseEther(property.price) })
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
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 32, background: 'var(--surface)', aspectRatio: '16/9' }}>
              {property.image ? (
                <img src={property.image} alt={property.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🏛</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1 }}>{property.name || `Property #${property.tokenId}`}</h1>
              <div style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(201,168,76,0.08)', color: 'var(--gold)', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 16 }}>{property.propertyType}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
              <MapPin size={13} /> {getAttr('Address')}, {getAttr('City')}, {getAttr('Country')}
            </div>

            <div style={{ display: 'flex', gap: 24, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
              {[
                { icon: Bed,       label: 'Bedrooms',  val: getAttr('Bedrooms') },
                { icon: Bath,      label: 'Bathrooms', val: getAttr('Bathrooms') },
                { icon: Maximize2, label: 'Area',      val: `${getAttr('Area (sqft)')} sqft` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Price</div>
                <div style={{ fontSize: 42, fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>
                  {property.price} <span style={{ fontSize: 18, color: 'var(--muted)' }}>ETH</span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface)', borderRadius: 8, padding: 4 }}>
                {['buy', 'offer', 'escrow'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: tab === t ? 'var(--card)' : 'transparent',
                    color: tab === t ? 'var(--white)' : 'var(--dim)',
                    fontSize: 12, fontFamily: 'var(--font-body)', textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>{t}</button>
                ))}
              </div>

              {tab === 'buy' && (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
                    Purchase this property instantly. The NFT transfers to your wallet upon payment.
                  </p>
                  <button className="btn-primary" onClick={buyProperty}
                    disabled={txLoading || !account || !property.isListed}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px' }}
                  >
                    {txLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing...</> : <><Wallet size={15} /> Buy for {property.price} ETH</>}
                  </button>
                </div>
              )}

              {tab === 'offer' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Your Offer (ETH)</label>
                    <input className="input-field" placeholder="0.00" type="number" min="0" step="0.01" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Expires in: {offerDays} days</label>
                    <input type="range" min="1" max="30" value={offerDays} onChange={e => setOfferDays(e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                  </div>
                  <button className="btn-primary" onClick={makeOffer} disabled={txLoading || !account || !offerAmount}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px' }}
                  >
                    {txLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : 'Submit Offer'}
                  </button>
                </div>
              )}

              {tab === 'escrow' && (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>
                    Funds are held by the smart contract until both parties approve the deal.
                  </p>
                  {['Buyer deposits ETH', 'Both parties approve', 'Funds + NFT transferred'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s}</span>
                    </div>
                  ))}
                  <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, marginTop: 16 }}>
                    Start Escrow
                  </button>
                </div>
              )}

              {error && <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>{error}</div>}
              {txHash && <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--green)' }}>✓ Transaction confirmed! <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4 }}>{txHash.slice(0,30)}...</div></div>}
              {!account && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--dim)', marginTop: 16 }}>Connect your wallet to transact</p>}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}