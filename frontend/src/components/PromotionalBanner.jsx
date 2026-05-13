import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* MAIN BANNER CARD */}
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '90%',
              maxWidth: '900px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              background: '#fff',
            }}
          >
            {/* IMAGE BACKGROUND */}
            <div
              style={{
                height: '400px',
                backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6')", // 🔥 replace this
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              {/* DARK OVERLAY */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))',
                }}
              />

              {/* TEXT CONTENT */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: 30,
                  color: 'white',
                }}
              >
                <h1 style={{ fontSize: '32px', margin: 0 }}>
                  WE SELL YOUR DREAM HOME
                </h1>
                <p style={{ marginTop: 10, opacity: 0.9 }}>
                  Discover premium verified properties across India
                </p>
              </div>
            </div>

            {/* BOTTOM CONTENT */}
            <div style={{ padding: '20px 30px' }}>
              <h2 style={{ margin: 0, color: '#b8860b' }}>
                Offering at ₹79,90,000
              </h2>

              <button
                style={{
                  marginTop: 15,
                  background: '#d4af37',
                  color: '#000',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={() => alert("Explore Properties")}
              >
                Book Now
              </button>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsVisible(false)}
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}