import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'

const SENSITIVITY_LIB = '/libs/gas-lift-sensitivity-analyzer-frontend.umd.cjs'
const SENSITIVITY_CSS = '/libs/style.css'

const SensitivityPage: React.FC = () => {
  const [loaded, setLoaded] = React.useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { token } = useAuth()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Determine backend API base URL
    // In development: backend is on localhost:8000; frontend (Vite) is on localhost:3000
    // In production: both may be on the same domain
    const apiBase = typeof window !== 'undefined' && window.location.port === '3000'
      ? 'http://localhost:8000/api/sensitivity'
      : '/api/sensitivity'

    function getGlobalLib() {
      // UMD attaches to global Pt.SensitivityAnalyzer or global SensitivityAnalyzer
      const g = (window as any).Pt?.SensitivityAnalyzer || (window as any).SensitivityAnalyzer
      return g && g.default ? g.default : g
    }

    async function mountLib() {
      const lib = getGlobalLib()
      if (!lib) return
      try {
        if (typeof lib.setApiBase === 'function') lib.setApiBase(apiBase)
        // If XCAPE has an auth token in context, pass it to the embedded lib
        if (token && typeof lib.setAuthToken === 'function') {
          lib.setAuthToken(token)
        }

        if (typeof lib.mount === 'function') {
          lib.mount(container, { apiBase })
          setLoaded(true)
        } else {
          console.error('Sensitivity library missing mount()')
        }
      } catch (err) {
        console.error('Error mounting sensitivity lib', err)
      }
    }

    const existing = getGlobalLib()
    if (existing) {
      mountLib()
      return () => {
        try { if (existing.unmount) existing.unmount(container) } catch {}
      }
    }

    // Ensure host React/ReactDOM globals exist for the UMD bundle
    if (!(window as any).React) {
      ;(window as any).React = React
    }
    if (!(window as any).ReactDOM) {
      ;(window as any).ReactDOM = ReactDOM
    }
    // Some UMD bundles call createRoot from react-dom; ensure react-dom/client is available
    if (!(window as any).ReactDOMClient) {
      ;(window as any).ReactDOMClient = ReactDOMClient
    }

    // Ensure `process` exists in the browser for UMD bundles that reference it
    if (!(window as any).process) {
      ;(window as any).process = { env: { NODE_ENV: 'production' } }
    }

    // Load CSS file
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = SENSITIVITY_CSS
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = SENSITIVITY_LIB
    script.async = true
    script.onload = () => { mountLib().catch(err => console.error(err)) }
    script.onerror = (e) => console.error('Failed to load sensitivity library', e)
    document.body.appendChild(script)

    return () => {
      const lib = getGlobalLib()
      try { if (lib && lib.unmount) lib.unmount(container) } catch {}
    }
  }, [])

  return (
    <Box sx={{ height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
      {!loaded && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <div id="sensitivity-root" ref={containerRef} style={{ width: '100%', flex: 1, overflowY: 'auto' }} />
    </Box>
  )
}

export default SensitivityPage
