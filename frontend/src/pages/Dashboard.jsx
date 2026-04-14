import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Wallet, Home, Tag, Plus, ExternalLink } from 'lucide-react'
import { useWallet } from '../context/WalletContext.jsx'
import { getOwnerProps, getTenantLeases, getBuyerEscrows } from '../utils/api.js'
import { getPropertyNFTContract } from '../utils/contracts.js'
import { ethers } from 'ethers'

const TABS = ['My Properties', 'Active Leases', 'Escrows', 'Mint Property']

export default function Dashboard() {
  const { account, signer, balance, connect } = useWallet()
  const [tab,        setTab]        = useState(0)
  const [properties, setProperties] = useState([])
  const [leases,     setLeases]     = useState([])
  const [escrows,    setEscrows]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [mintForm,   setMintForm]   = useState({ name:'', description:'', price:'', propertyType:'0', city:'', country:'', address:'', bedrooms:'', bathrooms:'', area:'', isForRent:false, rentPerMonth:'0' })
  const [minting,    setMinting]    = useState(false)
  const [mintHash,   setMintHash]   = useState(null)
  const [mintError,  setMintError]  = useState(null)

  useEffect(() => {
    if (!account) return
    setLoading(true)
    Promise.all([
      getOwnerProps(account).then(d => setProperties(d.properties || [])),
      getTenantLeases(account).then(d => setLeases(d.leases || [])),
      getBuyerEscrows(account).then(d => setEscrows(d.escrows || [])),
    ]).finally(() => setLoading(false))
  }, [account])

  const handleMint = async () => {
    if (!signer) return
    setMinting(true); setMintError(null)
    try {
      const metadata = {
        name: mintForm.name,
        description: mintForm.description,
        image: '',
        attributes: [
          { trait_type: 'Property Type', value: ['House','Apartment','Villa','Commercial','Land','Office'][mintForm.propertyType] },
          { trait_type: 'City',          value: mintForm.city },
          { trait_type: 'Country',       value: mintForm.country },
          { trait_type: 'Address',       value: mintForm.address },
          { trait_type: 'Bedrooms',      value: mintForm.bedrooms },
          { trait_type: 'Bathrooms',     value: mintForm.bathrooms },
          { trait_type: 'Area (sqft)',   value: mintForm.area },
          { trait_type: 'Price (ETH)',   value: mintForm.price },
        ],
      }
      const metaURI  = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      const contract = getPropertyNFTContract(signer)
      const tx       = await contract.mintProperty(
        metaURI,
        ethers.parseEther(mintForm.price || '0'),
        ethers.parseEther(mintForm.rentPerMonth || '0'),
        mintForm.isForRent,
        parseInt(mintForm.propertyType)
      )
      await tx.wait()
      setMintHash(tx.hash)
      setMintForm({ name:'', description:'', price:'', propertyType:'0', city:'', country:'', address:'', bedrooms:'', bathrooms:'', area:'', isForRent:false, rentPerMonth:'0' })
    } catch (e) { setMintError(e.reason || e.message) }
    finally { setMinting(false) }
  }

  if (!account) return (
    <div style={{ paddingTop: 72, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 60, marginBottom: 24 }}>🔐</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 12 }}>Connect Your Wallet</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>Connect MetaMask to access your dashboard and manage properties.</p>
        <button className="btn-primary" onClick={connect} style={{ fontSize: 14, padding: '14px 36px' }}>
          <Wallet size={16} /> Connect Wallet
        </button>
      </motion.div>
    </div>
  )

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="orb orb-1" />

      {/* Header */}
      <section style={{ padding: '48px 0 32px', position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(16,42,67,0.08)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div className="tag" style={{ marginBottom: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#124634', display: 'inline-block' }} /> Connected
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>My Dashboard</h1>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontFamily: 'var(--font-mono)' }}>{account}</p>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Balance',    val: `${parseFloat(balance||0).toFixed(4)} ETH` },
                { label: 'Properties', val: properties.length },
                { label: 'Leases',     val: leases.length },
              ].map((s,i) => (
                <div key={i} className="glass-card" style={{ padding: '20px 26px', textAlign: 'center', minWidth: 130, background: '#ffffff' }}>
                  <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 600 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#7d8a97', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(16,42,67,0.08)', position: 'sticky', top: 78, zIndex: 50, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
        <div className="container" style={{ display: 'flex' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === i ? 'var(--gold)' : 'var(--dim)',
              borderBottom: tab === i ? '2px solid var(--gold)' : '2px solid transparent',
              fontSize: 13, fontFamily: 'var(--font-body)', transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <section className="section-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">

          {/* My Properties */}
          {tab === 0 && (
            loading ? (
              <div className="grid-3">{[...Array(3)].map((_,i) => <div key={i} className="glass-card shimmer" style={{ height: 300 }} />)}</div>
            ) : properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--muted)', marginBottom: 8 }}>No Properties Yet</h3>
                <button className="btn-primary" onClick={() => setTab(3)} style={{ marginTop: 16 }}><Plus size={14} /> Mint Property</button>
              </div>
            ) : (
              <div className="grid-3">
                {properties.map((p, i) => (
                  <motion.div key={p.tokenId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.08 }} className="glass-card">
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>{p.name || `Property #${p.tokenId}`}</h3>
                        <div style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, background: p.isListed ? 'rgba(176,141,87,0.14)' : 'rgba(244,239,230,0.8)', color: p.isListed ? '#102a43' : '#7d8a97' }}>
                          {p.isListed ? 'Listed' : 'Unlisted'}
                        </div>
                      </div>
                      <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: 16 }}>{p.price} <span style={{ fontSize: 14, color: 'var(--muted)' }}>ETH</span></div>
                      <Link to={`/properties/${p.tokenId}`} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: 12 }}>
                        View <ExternalLink size={11} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Leases */}
          {tab === 1 && (
            leases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--dim)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--muted)' }}>No Active Leases</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {leases.map((l, i) => (
                  <motion.div key={l.leaseId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.08 }}
                    className="glass-card" style={{ padding: 24 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 4 }}>Lease #{l.leaseId} · Property #{l.tokenId}</div>
                        <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{l.rentAmount} ETH<span style={{ fontSize: 13, color: 'var(--muted)' }}>/month</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <div><div style={{ fontSize: 11, color: '#7d8a97', marginBottom: 2 }}>Status</div><div style={{ fontSize: 13, color: l.status === 'ACTIVE' ? '#124634' : '#b63636' }}>{l.status}</div></div>
                        <div><div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 2 }}>Ends</div><div style={{ fontSize: 13 }}>{new Date(l.endDate).toLocaleDateString()}</div></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Escrows */}
          {tab === 2 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--muted)' }}>
                {escrows.length === 0 ? 'No Active Escrows' : `${escrows.length} Escrow(s) Active`}
              </h3>
            </div>
          )}

          {/* Mint */}
          {tab === 3 && (
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8, fontWeight: 300 }}>Mint a Property</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 36 }}>Create your property as an NFT on the blockchain</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Property Name', key: 'name',        placeholder: 'e.g. Luxury Villa Mumbai' },
                    { label: 'Description',   key: 'description', placeholder: 'Describe the property...' },
                    { label: 'Address',       key: 'address',     placeholder: 'Street address' },
                    { label: 'City',          key: 'city',        placeholder: 'City' },
                    { label: 'Country',       key: 'country',     placeholder: 'Country' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{f.label}</label>
                      {f.key === 'description' ? (
                        <textarea className="input-field" placeholder={f.placeholder} rows={3} value={mintForm[f.key]} onChange={e => setMintForm(p => ({...p, [f.key]: e.target.value}))} style={{ resize: 'vertical' }} />
                      ) : (
                        <input className="input-field" placeholder={f.placeholder} value={mintForm[f.key]} onChange={e => setMintForm(p => ({...p, [f.key]: e.target.value}))} />
                      )}
                    </div>
                  ))}

                  <div className="grid-2">
                    {[
                      { label: 'Bedrooms',    key: 'bedrooms' },
                      { label: 'Bathrooms',   key: 'bathrooms' },
                      { label: 'Area (sqft)', key: 'area' },
                      { label: 'Price (ETH)', key: 'price', placeholder: '0.00' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{f.label}</label>
                        <input className="input-field" type="number" placeholder={f.placeholder || f.label} value={mintForm[f.key]} onChange={e => setMintForm(p => ({...p, [f.key]: e.target.value}))} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Property Type</label>
                    <select className="input-field" value={mintForm.propertyType} onChange={e => setMintForm(p => ({...p, propertyType: e.target.value}))}>
                      {['House','Apartment','Villa','Commercial','Land','Office'].map((t,i) => <option key={i} value={i}>{t}</option>)}
                    </select>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mintForm.isForRent} onChange={e => setMintForm(p => ({...p, isForRent: e.target.checked}))} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                    <span style={{ fontSize: 14, color: 'var(--muted)' }}>Also available for rent</span>
                  </label>

                  {mintForm.isForRent && (
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Rent Per Month (ETH)</label>
                      <input className="input-field" type="number" placeholder="0.00" value={mintForm.rentPerMonth} onChange={e => setMintForm(p => ({...p, rentPerMonth: e.target.value}))} />
                    </div>
                  )}

                  <button className="btn-primary" onClick={handleMint} disabled={minting || !mintForm.name || !mintForm.price}
                    style={{ justifyContent: 'center', fontSize: 14, padding: '14px', marginTop: 8 }}
                  >
                    {minting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Minting...</> : <><Plus size={15} /> Mint Property NFT</>}
                  </button>

                  {mintError && <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>{mintError}</div>}
                  {mintHash  && <div style={{ padding: '12px 16px', background: 'rgba(176,141,87,0.08)',  border: '1px solid rgba(176,141,87,0.15)',  borderRadius: 14, fontSize: 13, color: '#124634' }}>✓ Property minted! <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4 }}>{mintHash}</div></div>}
                </div>
              </motion.div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}