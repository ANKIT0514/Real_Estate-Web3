import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Maximize2, Shield, ShoppingBag, Eye } from 'lucide-react'

const FULL_INR_RATE = 165000
const formatINR = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value)

export default function PropertyCard({ property, index = 0 }) {
  const {
    id,
    tokenId,
    title,
    name,
    image,
    price,
    priceInETH,
    priceInINR,
    isVerified,
    isListed,
    isForSale,
    propertyType,
    ownerAddress,
    currentOwner,
    attributes = [],
    city = '',
    state = '',
    areaSqFt = '',
  } = property

  const displayTitle = title || name || `Property #${tokenId || id}`
  const getAttr = (trait) => attributes.find(a => a.trait_type?.toLowerCase() === trait.toLowerCase())?.value || '—'
  const displayCity = city || getAttr('City') || getAttr('city') || ''
  const displayState = state || getAttr('State') || getAttr('Country') || ''
  const displayArea = areaSqFt || getAttr('Area (sqft)') || getAttr('Area') || '—'
  const status = getAttr('Status') !== '—' ? getAttr('Status') : (isVerified ? 'Verified' : (isListed ? 'Under Review' : 'Pending Verification'))
  const owner = ownerAddress || currentOwner || property.owner || '—'
  const shortOwner = owner !== '—' ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : '—'
  const ethValue = parseFloat(priceInETH || price || '0')
  const inrValue = priceInINR || (ethValue ? formatINR(ethValue * FULL_INR_RATE) : '—')
  const saleBadge = isListed ? 'For Sale' : 'Sold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card property-card"
    >
      <div style={{ position: 'relative', height: 240, overflow: 'hidden', background: '#f4efe6' }}>
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d8a97', fontSize: 48 }}>
            🏛
          </div>
        )}

        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <div className="tag" style={{ fontSize: 10, padding: '5px 10px' }}><Shield size={10} /> {status}</div>
          <div className="tag badge-secondary" style={{ fontSize: 10, padding: '5px 10px' }}>{saleBadge}</div>
        </div>

        <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', padding: '5px 10px', borderRadius: 6, fontSize: 11, color: 'var(--white)', fontFamily: 'var(--font-mono)' }}>
          #{tokenId}
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(16,42,67,0.88) 0%, transparent 100%)', padding: '20px 18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: '#ffffff', fontWeight: 700, lineHeight: 1.1 }}>
                {priceInETH || price} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)' }}>ETH</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{inrValue}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.2, color: 'var(--navy)', marginBottom: 8 }}>
              {displayTitle}
            </h3>
            <div style={{ fontSize: 12, color: '#7d8a97', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{propertyType}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7d8a97', fontSize: 13, marginBottom: 18 }}>
          <MapPin size={14} color="#7d8a97" />
          <span>{displayCity}{displayState ? ` · ${displayState}` : ''}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, color: '#5e6d77', fontSize: 13, marginBottom: 18 }}>
          {displayArea !== '—' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Maximize2 size={14} /> {displayArea} sqft</div>
          )}
          {getAttr('Bedrooms') !== '—' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bed size={14} /> {getAttr('Bedrooms')} bd</div>
          )}
          {getAttr('Bathrooms') !== '—' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bath size={14} /> {getAttr('Bathrooms')} ba</div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <span className="status-pill">{shortOwner}</span>
          <span className="status-pill badge-secondary">{status}</span>
        </div>

        <div className="property-card-actions">
          <Link to={`/properties/${tokenId}`} className="btn-ghost" style={{ flex: '1 1 150px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Eye size={14} /> View Details
          </Link>
          {isListed && (
            <Link to={`/properties/${tokenId}`} className="btn-primary" style={{ flex: '1 1 150px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={14} /> Buy Property
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
