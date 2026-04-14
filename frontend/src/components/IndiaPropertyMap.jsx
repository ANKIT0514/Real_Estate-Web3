import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

const CITY_COORDINATES = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mysore: [12.2958, 76.6394],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  pune: [18.5204, 73.8567],
  kolkata: [22.5726, 88.3639],
}

const indiaCenter = [22.0, 78.0]
const indiaZoom = 5.5

const goldMarker = new L.DivIcon({
  className: 'india-map-marker',
  html: '<span class="india-map-marker-dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

function FitBounds({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds, { padding: [48, 48] })
  }, [bounds, map])

  return null
}

const normalizeCity = (city) => (city || '').toString().trim().toLowerCase()

const getPropertyLocation = (property) => {
  if (property.latitude && property.longitude) {
    return [Number(property.latitude), Number(property.longitude)]
  }

  const normalized = normalizeCity(property.city)
  return CITY_COORDINATES[normalized]
}

export default function IndiaPropertyMap({ properties = [] }) {
  const markers = properties
    .map((property) => {
      const position = getPropertyLocation(property)
      if (!position) return null
      return { ...property, position }
    })
    .filter(Boolean)

  const bounds = markers.length
    ? markers.map((marker) => marker.position)
    : null

  return (
    <div className="india-map-shell">
      <MapContainer center={indiaCenter} zoom={indiaZoom} scrollWheelZoom className="india-map-leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds && <FitBounds bounds={bounds} />}

        {markers.map((property) => (
          <Marker key={property.tokenId} position={property.position} icon={goldMarker}>
            <Popup className="india-map-popup" closeButton={false}>
              <div className="india-popup-card">
                {property.image ? (
                  <img className="india-popup-image" src={property.image} alt={property.title || property.name || `Property ${property.tokenId}`} />
                ) : (
                  <div className="india-popup-image india-popup-image-empty">🏛</div>
                )}
                <div className="india-popup-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <h3>{property.title || property.name || `Property #${property.tokenId}`}</h3>
                      <span className="india-popup-meta">{[property.city, property.state].filter(Boolean).join(', ')}</span>
                    </div>
                    <MapPin size={18} color="var(--gold)" />
                  </div>

                  <div className="india-popup-row">
                    <span className="india-popup-label">Price</span>
                    <strong>{property.priceInINR || '—'}</strong>
                  </div>
                  <div className="india-popup-row">
                    <span className="india-popup-label">ETH</span>
                    <strong>{property.priceInETH || property.price || '—'}</strong>
                  </div>
                  <div className="india-popup-row">
                    <span className="india-popup-label">Status</span>
                    <strong>{property.verificationStatus || property.legalStatus || (property.isVerified ? 'Verified' : property.isListed ? 'Under Review' : 'Pending Verification')}</strong>
                  </div>

                  <Link to={`/properties/${property.tokenId}`} className="btn-primary india-popup-button">
                    View Details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
