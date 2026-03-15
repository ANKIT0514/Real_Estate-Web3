import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Maximize2, Shield, Tag } from 'lucide-react'

export default function PropertyCard({ property, index = 0 }) {
  const { tokenId, name, image, price, isVerified, isForRent, rentPerMonth, propertyType, attributes = [] } = property
  const getAttr = (trait) => attributes.find(a => a.trait_type === trait)?.value || '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card"
    >
      <Link to={`/properties/${tokenId}`}>
        {/* Image */}
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: 'var(--surface)' }}>
          {image ? (
            <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface), var(--card))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', fontSize: 48 }}>
              🏛
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {isVerified && <div className="tag" style={{ fontSize: 10, padding: '3px 8px' }}><Shield size={10} /> Verified</div>}
            {isForRent && <div className="tag" style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.3)', color: 'var(--blue)' }}>For Rent</div>}
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '3px 8px', borderRadius: 4, fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
            #{tokenId}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(8,8,8,0.9) 0%, transparent 100%)', padding: '24px 16px 12px' }}>
            <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 300 }}>
              {price} <span style={{ fontSize: 14, color: 'var(--muted)' }}>ETH</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 400, lineHeight: 1.2, flex: 1 }}>
              {name || `Property #${tokenId}`}
            </h3>
            <div style={{ padding: '3px 10px', borderRadius: 4, background: 'rgba(201,168,76,0.08)', fontSize: 11, color: 'var(--gold)', whiteSpace: 'nowrap', marginLeft: 8 }}>
              {propertyType}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--dim)', fontSize: 12, marginBottom: 14 }}>
            <MapPin size={12} />
            <span>{getAttr('City')}{getAttr('Country') !== '—' ? `, ${getAttr('Country')}` : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {getAttr('Bedrooms') !== '—' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                <Bed size={13} /> {getAttr('Bedrooms')} bed
              </div>
            )}
            {getAttr('Bathrooms') !== '—' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                <Bath size={13} /> {getAttr('Bathrooms')} bath
              </div>
            )}
            {getAttr('Area (sqft)') !== '—' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                <Maximize2 size={13} /> {getAttr('Area (sqft)')} sqft
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}