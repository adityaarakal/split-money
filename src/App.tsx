import { useState, useEffect } from 'react'

function App() {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    // Try to get version from build-time constant first
    if (typeof __APP_VERSION__ !== 'undefined') {
      setVersion(__APP_VERSION__)
    } else {
      // Fallback: fetch from API endpoint
      fetch('/api/version')
        .then(res => res.json())
        .then(data => setVersion(data.version))
        .catch(() => {
          // Final fallback: try static file
          fetch('/version.json')
            .then(res => res.json())
            .then(data => setVersion(data.version))
            .catch(() => setVersion('Unknown'))
        })
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          margin: '0 0 1rem 0',
          fontWeight: 'bold'
        }}>
          💰 Split Money
        </h1>
        <p style={{
          fontSize: '1.5rem',
          margin: '0 0 2rem 0',
          opacity: 0.9
        }}>
          Split expenses with friends
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px'
        }}>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
            App Version: <strong>{version || 'Loading...'}</strong>
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
            PWA Ready ✓
          </p>
        </div>
        <div style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          opacity: 0.7
        }}>
          <p>🚀 Development server running</p>
          <p>📱 Install as PWA to test offline features</p>
        </div>
      </div>
    </div>
  )
}

export default App

