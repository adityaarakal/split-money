import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeDatabase } from './store/database'
import { offlineDetector } from './utils/offline-detection'
import { syncQueuedOperations } from './services/offline-sync.service'

// Initialize database before rendering app
initializeDatabase()
  .then(() => {
    // Set up offline sync when back online
    offlineDetector.subscribe((status) => {
      if (status === 'online') {
        // Sync queued operations when back online
        syncQueuedOperations().catch((error) => {
          console.error('Error syncing offline operations:', error);
        });
      }
    });

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Failed to initialize application:', error)
    const root = document.getElementById('root')
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h1>Application Error</h1>
          <p>Failed to initialize database. Please refresh the page.</p>
          <p style="color: red;">${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `
    }
  })

