import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material'
import {
  Upload as UploadIcon,
  PlayArrow as PlayIcon,
  DownloadRounded as DownloadIcon,
  Info as InfoIcon,
  DataObject as DataObjectIcon,
} from '@mui/icons-material'
import { useAuth } from '@context/AuthContext'
import ForecastCharts from '@components/ForecastCharts'
import ProductionFlowVisualization from '@components/ProductionFlowVisualization'
import DataDrawer from '@components/DataDrawer'
import { DataInputModal } from '@components/DataInputModal'
import { InterpretButton } from '@components/InterpretButton'
import { InterpretationDrawer } from '@components/InterpretationDrawer'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const SimulatorPage: React.FC = () => {
  const activeStep = 0
  const [tabValue, setTabValue] = useState(0)
  const [algorithmType, setAlgorithmType] = useState('enkf')
  const [isRunning, setIsRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)
  const [simulationId, setSimulationId] = useState<number | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [dataDrawerOpen, setDataDrawerOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const { token } = useAuth()

  // File upload state
  const [productionFile, setProductionFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string>('')
  const [uploadSuccess, setUploadSuccess] = useState<string>('')
  const [uploadedDatasetId, setUploadedDatasetId] = useState<number | null>(null)

  // Export state
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string>('')
  const [exportSuccess, setExportSuccess] = useState<string>('')

  // Chart state
  const [priorForecast, setPriorForecast] = useState<any | null>(null)
  const [posteriorForecast, setPosteriorForecast] = useState<any | null>(null)
  const [chartMetric, setChartMetric] = useState<string>('oil')

  // Controlled quick params
  const [initialPressure, setInitialPressure] = useState<number>(200)
  const [porosity, setPorosity] = useState<number>(15)
  const [permeability, setPermeability] = useState<number>(100)
  const [waterSaturation, setWaterSaturation] = useState<number>(30)
  const [datasetParams, setDatasetParams] = useState<{
    initial_pressure?: number | null
    porosity?: number | null
    permeability?: number | null
    water_saturation?: number | null
  } | null>(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  const handleProductionFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File too large (max 50MB)')
        return
      }
      setProductionFile(file)
      setUploadError('')
    }
  }

  const handleModelFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setUploadError('File too large (max 100MB)')
        return
      }
      setModelFile(file)
      setUploadError('')
    }
  }

  const uploadDataset = async () => {
    if (!productionFile) {
      setUploadError('Please select a production data file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', productionFile)
      formData.append('name', `Production Data - ${new Date().toLocaleString()}`)

      const res = await fetch(`${API_BASE}/datasets/`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          // Do NOT set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }))
        const errorMsg = errorData?.detail || errorData?.error || 'Upload failed'
        throw new Error(errorMsg)
      }

      const data = await res.json()
      setUploadedDatasetId(data.id)
      setUploadSuccess(`Dataset uploaded successfully (ID: ${data.id}) - Data parsed and ready to use!`)
      setProductionFile(null)
      setUploadError('')
      console.log('[DATASET] Stored dataset ID:', data.id, 'Name:', data.name)
    } catch (err) {
      console.error('Upload failed', err)
      setUploadError(`Upload error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // When a dataset is selected/created, fetch it to see if it contains reservoir_model
  useEffect(() => {
    if (!uploadedDatasetId) {
      setDatasetParams(null)
      return
    }

    const fetchDataset = async () => {
      try {
        const res = await fetch(`${API_BASE}/datasets/${uploadedDatasetId}/`, {
          headers: { Authorization: token ? `Token ${token}` : '' },
        })
        if (!res.ok) return
        const data = await res.json()
        const prod = data.production_data || {}
        let rm = null
        if (prod && typeof prod === 'object') {
          rm = prod.reservoir_model || prod.raw_json || prod
        }

        if (rm && typeof rm === 'object') {
          // Extract common parameter names (best-effort)
          let ip: number | null = null
          let por: number | null = null
          let perm: number | null = null
          let wsat: number | null = null

          ip = (rm.initial_pressure ?? rm.pressure ?? rm.initial_pressure_bar ?? rm.pressure_bar) || null
          por = (rm.porosity ?? rm.porosity_fraction ?? rm.poro) || null
          perm = (rm.permeability ?? rm.perm ?? rm.permeability_md) || null
          wsat = (rm.water_saturation ?? rm.water_saturation ?? rm.wat_sat ?? rm.initial_water_saturation) || null

          // If nested rock_properties/fluid_properties exist, prefer those
          if (rm.rock_properties && typeof rm.rock_properties === 'object') {
            por = por || (rm.rock_properties.porosity ?? rm.rock_properties.poro ?? rm.rock_properties.porosity_fraction) || null
            perm = perm || (rm.rock_properties.permeability ?? rm.rock_properties.perm ?? rm.rock_properties.permeability_md) || null
          }

          if (rm.fluid_properties && typeof rm.fluid_properties === 'object') {
            ip = ip || (rm.fluid_properties.initial_pressure ?? rm.fluid_properties.pressure) || null
            wsat = wsat || (rm.fluid_properties.water_saturation ?? rm.fluid_properties.waterSat) || null
          }

          // Normalize porosity/water saturation to fraction (0-1). Accept numbers or numeric strings.
          const normalizeFraction = (v: any) => {
            const n = Number(v)
            if (!isFinite(n)) return null
            let x = n
            if (x > 1) {
              // Common case: value in percent (0-100)
              if (x <= 100) x = x / 100
              else if (x <= 1000) x = x / 100
              else x = x / 10000
            }
            if (x < 0) return null
            if (x > 1) x = 1
            return x
          }

          por = normalizeFraction(por)
          wsat = normalizeFraction(wsat)

          setDatasetParams({
            initial_pressure: ip ?? null,
            porosity: por ?? null,
            permeability: perm ?? null,
            water_saturation: wsat ?? null,
          })
          return
        }

        // If we reached here and no reservoir model params found, try to infer initial pressure
        // from production data arrays (e.g., Pressure_psi or Pressure)
        try {
          const possiblePressureArrays = [
            prod.Pressure_psi,
            prod.Pressure,
            prod.pressure_psi,
            prod.pressure,
          ]

          let firstPressure: number | null = null
          for (const arr of possiblePressureArrays) {
            if (Array.isArray(arr) && arr.length > 0) {
              const v = Number(arr[0])
              if (!isNaN(v)) {
                firstPressure = v
                break
              }
            }
          }

          if (firstPressure !== null) {
            setDatasetParams({
              initial_pressure: firstPressure,
              porosity: null,
              permeability: null,
              water_saturation: null,
            })
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.warn('Failed to fetch dataset params', e)
        setDatasetParams(null)
      }
    }

    fetchDataset()
  }, [uploadedDatasetId, API_BASE, token])

  const handleManualDatasetSave = async (payload: { name: string; description?: string; production_data: Record<string, any> }) => {
    try {
      const authToken = token || localStorage.getItem('authToken')
      if (!authToken) throw new Error('Authentication token not found')

      const res = await fetch(`${API_BASE}/datasets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Token ${authToken}` : '',
        },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description || '',
          production_data: payload.production_data,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let msg = `Server error (${res.status})`
        try {
          const j = JSON.parse(text)
          msg = j.detail || JSON.stringify(j)
        } catch (e) {
          msg = text || msg
        }
        throw new Error(msg)
      }

      const created = await res.json()
      if (created && created.id) {
        setUploadedDatasetId(created.id)
      }
      setIsManualModalOpen(false)
      alert(`Dataset created (ID: ${created?.id})`)
    } catch (err) {
      console.error('Manual dataset save failed', err)
      throw err
    }
  }

  const pollProgress = async (id: number) => {
    let isPolling = true
    const pollInterval = 1000 // Poll every 1 second for faster updates
    
    while (isPolling) {
      try {
        const res = await fetch(`${API_BASE}/simulations/${id}/`, {
          headers: {
            Authorization: token ? `Token ${token}` : '',
            'Content-Type': 'application/json',
          },
        })
        
        if (!res.ok) {
          throw new Error('Failed to fetch progress')
        }
        
        const data = await res.json()
        console.log(`[POLL] Progress: ${data.progress}%, Status: ${data.status}`)
        
        // Update progress state
        setRunProgress(data.progress || 0)
        
        // Check if simulation is complete
        if (data.status === 'completed' || data.status === 'failed') {
          isPolling = false
          setIsRunning(false)
          console.log('🎯 Simulation completed. Results:', {
            duration_seconds: data.duration_seconds,
            match_quality: data.match_quality,
            status: data.status,
            progress: data.progress,
            fullData: data,
          })
          setResults(data)
          setRunProgress(100)
          setTabValue(3)
          break
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      } catch (err) {
        console.error('Poll error:', err)
        isPolling = false
        setIsRunning(false)
        break
      }
    }
  }

  const handleRunSimulation = async (type: string = 'baseline') => {
    setIsRunning(true)
    setRunProgress(0)
    setPriorForecast(null)
    setPosteriorForecast(null)

    try {
      const payload = {
        name: `Run - ${new Date().toISOString()}`,
        description: 'Launched from frontend UI',
        matching_type: type === 'enkf' ? 'enkf' : 'baseline',
        initial_pressure: initialPressure,
        porosity: porosity,
        permeability: permeability,
        water_saturation: waterSaturation,
        ...(uploadedDatasetId && { dataset: uploadedDatasetId }),
      }

      console.log('[SIM] Creating simulation with payload:', payload)

      const createRes = await fetch(`${API_BASE}/simulations/`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!createRes.ok) {
        const err = await createRes.text()
        throw new Error(err)
      }

      const created = await createRes.json()
      const id = created.id
      setSimulationId(id)

      console.log('[SIM] Simulation created with ID:', id)

      // Start simulation
      const startRes = await fetch(`${API_BASE}/simulations/${id}/start/`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
      })

      if (!startRes.ok) {
        throw new Error('Failed to start simulation')
      }

      console.log('[SIM] Simulation started, beginning polling...')

      // Begin polling progress - fire and forget but track in promise
      pollProgress(id).catch(err => {
        console.error('[SIM] Poll error:', err)
        setIsRunning(false)
      })
    } catch (err) {
      console.error('[SIM] Run failed:', err)
      setIsRunning(false)
    }
  }

  useEffect(() => {
    return () => {
      // cleanup if needed
    }
  }, [])

  // Fetch forecasts when simulation completes
  useEffect(() => {
    if (!results || !simulationId) return

    const fetchForecasts = async () => {
      try {
        console.log(`[Forecasts] Fetching for simulation ${simulationId}`)
        const res = await fetch(`${API_BASE}/forecasts/by_simulation/?simulation_id=${simulationId}`, {
          headers: { Authorization: token ? `Token ${token}` : '' },
        })
        if (!res.ok) {
          console.warn(`[Forecasts] Fetch returned ${res.status}`)
          return
        }

        const forecasts = await res.json()
        console.log(`[Forecasts] Received ${forecasts.length} forecasts:`, forecasts)
        
        const prior = forecasts.find((f: any) => f.forecast_type === 'prior')
        const posterior = forecasts.find((f: any) => f.forecast_type === 'posterior')

        console.log(`[Forecasts] Found prior:`, !!prior, 'posterior:', !!posterior)
        if (prior) {
          console.log(`[Forecasts] Prior predictions keys:`, Object.keys(prior.predictions || {}))
          setPriorForecast(prior)
        }
        if (posterior) {
          console.log(`[Forecasts] Posterior predictions keys:`, Object.keys(posterior.predictions || {}))
          setPosteriorForecast(posterior)
        }
      } catch (err) {
        console.error('Failed to fetch forecasts', err)
      }
    }

    fetchForecasts()
  }, [results, simulationId, token])

  const downloadResults = async () => {
    if (!simulationId) {
      setExportError('No simulation available to export')
      return
    }

    setExportLoading(true)
    setExportError('')
    setExportSuccess('')

    try {
      const res = await fetch(`${API_BASE}/forecasts/by_simulation/?simulation_id=${simulationId}`, {
        headers: { Authorization: token ? `Token ${token}` : '' },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch forecasts: ${res.status} ${res.statusText}`)
      }

      const forecasts = await res.json()

      // Build comprehensive JSON bundle with all data
      const payload = {
        exportDate: new Date().toISOString(),
        simulation: results,
        forecasts: forecasts,
        metadata: {
          simulationId: simulationId,
          datasetId: uploadedDatasetId,
          matchQuality: results?.match_quality,
          duration: results?.duration_seconds,
        },
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `simulation_${simulationId}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(`✓ Results exported successfully as simulation_${simulationId}.json`)
      setTimeout(() => setExportSuccess(''), 4000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Download failed:', err)
      setExportError(`Export failed: ${errorMessage}`)
    } finally {
      setExportLoading(false)
    }
  }

  const generatePDFReport = async () => {
    if (!simulationId || !results) {
      setExportError('No simulation results available')
      return
    }

    setExportLoading(true)
    setExportError('')
    setExportSuccess('')

    try {
      // Check if jspdf is available
      const jsPDF = (await import('jspdf')).jsPDF

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Title
      doc.setFontSize(24)
      doc.setTextColor(15, 76, 129)
      doc.text('XCAPE Simulation Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Export Date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      // Divider line
      doc.setDrawColor(15, 76, 129)
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 10

      // Simulation Details Section
      doc.setFontSize(14)
      doc.setTextColor(15, 76, 129)
      doc.text('Simulation Results', 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)

      const detailsData = [
        ['Simulation ID:', String(simulationId)],
        ['Status:', results?.status || 'Completed'],
        ['Algorithm:', results?.matching_type === 'enkf' ? 'Ensemble Kalman Filter (EnKF)' : 'Baseline'],
        ['Match Quality:', `${Number(results?.match_quality || 0).toFixed(2)}%`],
        ['Duration:', results?.duration_seconds ? `${Math.floor(results.duration_seconds / 60)}m ${results.duration_seconds % 60}s` : 'N/A'],
        ['Dataset:', uploadedDatasetId ? `Dataset #${uploadedDatasetId}` : 'None'],
      ]

      detailsData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 30, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 90, yPosition)
        yPosition += 8
      })

      yPosition += 5

      // Parameters Section
      doc.setFontSize(14)
      doc.setTextColor(15, 76, 129)
      doc.text('Reservoir Parameters', 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)

      const paramsData = [
        ['Initial Pressure:', `${initialPressure} bar`],
        ['Porosity:', `${porosity}%`],
        ['Permeability:', `${permeability} mD`],
        ['Water Saturation:', `${waterSaturation}%`],
      ]

      paramsData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 30, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 90, yPosition)
        yPosition += 8
      })

      // Add new page for forecasts summary
      doc.addPage()
      yPosition = 20

      doc.setFontSize(14)
      doc.setTextColor(15, 76, 129)
      doc.text('Forecast Summary', 20, yPosition)
      yPosition += 15

      if (priorForecast) {
        doc.setFontSize(12)
        doc.text('Prior Forecast (Initial Prediction)', 20, yPosition)
        yPosition += 8
        doc.setFontSize(10)
        const priorUncertainty = priorForecast.uncertainty || {}
        doc.text(`Oil Std Dev: ${(priorUncertainty.oil_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 5
        doc.text(`Water Std Dev: ${(priorUncertainty.water_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 5
        doc.text(`Gas Std Dev: ${(priorUncertainty.gas_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 10
      }

      if (posteriorForecast) {
        doc.setFontSize(12)
        doc.text('Posterior Forecast (After Calibration)', 20, yPosition)
        yPosition += 8
        doc.setFontSize(10)
        const posteriorUncertainty = posteriorForecast.uncertainty || {}
        doc.text(`Oil Std Dev: ${(posteriorUncertainty.oil_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 5
        doc.text(`Water Std Dev: ${(posteriorUncertainty.water_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 5
        doc.text(`Gas Std Dev: ${(posteriorUncertainty.gas_std_mean || 0).toFixed(2)}`, 30, yPosition)
        yPosition += 10
      }

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('This report was generated by XCAPE - Automated Reservoir History Matching System', 20, pageHeight - 10)

      // Save PDF
      doc.save(`simulation_${simulationId}_report.pdf`)
      setExportSuccess('✓ PDF report generated and downloaded successfully!')
      setTimeout(() => setExportSuccess(''), 4000)
    } catch (err) {
      // If jsPDF not available, provide fallback message
      if ((err as any)?.message?.includes('Cannot find module')) {
        setExportError('PDF export requires additional libraries. Using JSON export instead.')
        // Fall back to JSON export
        downloadResults()
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('PDF generation failed:', err)
        setExportError(`PDF export failed: ${errorMessage}. Downloading JSON instead.`)
        downloadResults()
      }
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <>
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            textAlign: 'center',
            fontWeight: 700,
            color: '#0F4C81',
          }}
        >
          XCAPE Simulator
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'textSecondary',
            mb: 4,
            fontSize: '1.1rem',
          }}
        >
          Perform automated reservoir history matching and generate forecasts
        </Typography>

        {/* Process Steps */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            <Step>
              <StepLabel>Upload Data</StepLabel>
            </Step>
            <Step>
              <StepLabel>Configure</StepLabel>
            </Step>
            <Step>
              <StepLabel>Run</StepLabel>
            </Step>
            <Step>
              <StepLabel>Results</StepLabel>
            </Step>
          </Stepper>
        </Card>

        {/* Tabbed Interface */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              aria-label="simulator tabs"
            >
              <Tab label="Input Data" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Configuration" id="tab-1" aria-controls="tabpanel-1" />
              <Tab label="Execution" id="tab-2" aria-controls="tabpanel-2" />
              <Tab label="Results" id="tab-3" aria-controls="tabpanel-3" />
            </Tabs>
          </Box>

          {/* Tab 1: Input Data */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Sample Data Info Card */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
                    border: '2px solid #0F4C81',
                    borderRadius: '12px',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#0F4C81' }}>
                          📚 Need Help Getting Started?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          View sample datasets, understand data structure, and learn what format the system expects
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<DataObjectIcon />}
                        onClick={() => setDataDrawerOpen(true)}
                        sx={{
                          backgroundColor: '#0F4C81',
                          '&:hover': { backgroundColor: '#0D3A5C' },
                          whiteSpace: 'nowrap',
                          ml: 2,
                        }}
                      >
                        View Sample Data
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: '#F7F9FC',
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: '#1a2332',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Production Data Upload
                    </Typography>
                    <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 2 }}>
                      Upload CSV file with pressure, flow rates, and cumulative production data
                    </Alert>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}
                    >
                      {productionFile ? `✓ ${productionFile.name}` : 'Select Production Data File'}
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleProductionFileSelect}
                        hidden
                      />
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsManualModalOpen(true)}
                        sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}
                      >
                        Manual Entry
                      </Button>
                      <Button
                        variant="contained"
                        onClick={uploadDataset}
                        sx={{ ml: 'auto' }}
                      >
                        Upload
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'textSecondary' }}>
                      Supported: CSV, XLSX
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: '#F7F9FC',
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: '#1a2332',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Reservoir Model Upload
                    </Typography>
                    <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 2 }}>
                      Upload your OPM Flow model file or parameter configuration
                    </Alert>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}
                    >
                      {modelFile ? `✓ ${modelFile.name}` : 'Select Model File'}
                      <input
                        type="file"
                        accept=".data,.py,.json"
                        onChange={handleModelFileSelect}
                        hidden
                      />
                    </Button>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'textSecondary' }}>
                      Supported: DATA, PY, JSON
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: '#F7F9FC',
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: '#1a2332',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Quick Parameters
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Initial Pressure (bar)"
                          placeholder="Enter pressure"
                          type="number"
                          value={initialPressure}
                          onChange={(e) => setInitialPressure(Number(e.target.value))}
                          variant="outlined"
                          inputProps={{
                            style: {
                              color: 'inherit',
                            },
                          }}
                          sx={{
                            '& .MuiOutlinedInput-input::placeholder': {
                              color: 'rgba(189, 189, 189, 0.7)',
                              opacity: 1,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Porosity (%)"
                          placeholder="Enter porosity"
                          type="number"
                          value={porosity}
                          onChange={(e) => setPorosity(Number(e.target.value))}
                          variant="outlined"
                          inputProps={{
                            style: {
                              color: 'inherit',
                            },
                          }}
                          sx={{
                            '& .MuiOutlinedInput-input::placeholder': {
                              color: 'rgba(189, 189, 189, 0.7)',
                              opacity: 1,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Permeability (mD)"
                          placeholder="Enter permeability"
                          type="number"
                          value={permeability}
                          onChange={(e) => setPermeability(Number(e.target.value))}
                          variant="outlined"
                          inputProps={{
                            style: {
                              color: 'inherit',
                            },
                          }}
                          sx={{
                            '& .MuiOutlinedInput-input::placeholder': {
                              color: 'rgba(189, 189, 189, 0.7)',
                              opacity: 1,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Water Saturation (%)"
                          placeholder="Enter saturation"
                          type="number"
                          value={waterSaturation}
                          onChange={(e) => setWaterSaturation(Number(e.target.value))}
                          variant="outlined"
                          inputProps={{
                            style: {
                              color: 'inherit',
                            },
                          }}
                          sx={{
                            '& .MuiOutlinedInput-input::placeholder': {
                              color: 'rgba(189, 189, 189, 0.7)',
                              opacity: 1,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                    {datasetParams && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2">Detected dataset parameters:</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {datasetParams.initial_pressure != null ? `Initial Pressure: ${datasetParams.initial_pressure}` : 'Initial Pressure: —'}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {datasetParams.porosity != null ? `Porosity: ${Math.min((datasetParams.porosity * 100), 100).toFixed(2)}%` : 'Porosity: —'}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {datasetParams.permeability != null ? `Permeability: ${datasetParams.permeability} mD` : 'Permeability: —'}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            if (datasetParams.initial_pressure) setInitialPressure(Number(datasetParams.initial_pressure))
                            if (datasetParams.porosity) setPorosity(Number((datasetParams.porosity as number) * 100))
                            if (datasetParams.permeability) setPermeability(Number(datasetParams.permeability))
                            if (datasetParams.water_saturation) setWaterSaturation(Number((datasetParams.water_saturation as number) * 100))
                            alert('Dataset parameters applied to quick parameters')
                            }}
                          >
                            Apply dataset parameters
                          </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {uploadError && (
                <Grid item xs={12}>
                  <Alert severity="error">{uploadError}</Alert>
                </Grid>
              )}

              {uploadSuccess && (
                <Grid item xs={12}>
                  <Alert severity="success">{uploadSuccess}</Alert>
                </Grid>
              )}

              {productionFile && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={uploadDataset}
                    sx={{ backgroundColor: '#0F4C81' }}
                  >
                    Upload Dataset
                  </Button>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Tab 2: Configuration */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0F4C81' }}>
                      Algorithm Selection
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Algorithm Type</InputLabel>
                      <Select
                        value={algorithmType}
                        label="Algorithm Type"
                        onChange={(e) => setAlgorithmType(e.target.value)}
                      >
                        <MenuItem value="manual">Manual Baseline Matching</MenuItem>
                        <MenuItem value="enkf">Ensemble Kalman Filter (EnKF)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Ensemble Size"
                      type="number"
                      defaultValue={100}
                      sx={{ mb: 2 }}
                      helperText="Number of ensemble members (50-500)"
                    />

                    <FormControl fullWidth>
                      <InputLabel>Update Frequency</InputLabel>
                      <Select defaultValue="daily">
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0F4C81' }}>
                      Convergence Settings
                    </Typography>
                    <TextField
                      fullWidth
                      label="Target RMSE"
                      type="number"
                      defaultValue={0.05}
                      sx={{ mb: 2 }}
                      helperText="Target root mean square error"
                    />

                    <TextField
                      fullWidth
                      label="Max Iterations"
                      type="number"
                      defaultValue={50}
                      sx={{ mb: 2 }}
                      helperText="Maximum number of iterations"
                    />

                    <TextField
                      fullWidth
                      label="Localization Radius"
                      type="number"
                      defaultValue={5}
                      helperText="Grid blocks for localization (EnKF)"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Execution */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0F4C81' }}>
                      Run Simulation
                    </Typography>

                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Ensure all data has been uploaded and configuration is complete before running
                    </Alert>

                    {!isRunning ? (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PlayIcon />}
                          onClick={() => handleRunSimulation('baseline')}
                          sx={{
                            backgroundColor: '#0F4C81',
                            px: 4,
                            '&:hover': {
                              backgroundColor: '#0a3857',
                            },
                          }}
                        >
                          Start Baseline
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PlayIcon />}
                          onClick={async () => {
                            setIsRunning(true)
                            setRunProgress(0)
                            try {
                              const payload = {
                                name: `EnKF Run - ${new Date().toISOString()}`,
                                description: 'EnKF with prior/posterior forecasts',
                                matching_type: 'enkf',
                                initial_pressure: initialPressure,
                                porosity: porosity,
                                permeability: permeability,
                                water_saturation: waterSaturation,
                                ...(uploadedDatasetId && { dataset: uploadedDatasetId }),
                              }
                              console.log('[EnKF] Creating simulation with dataset:', uploadedDatasetId)
                              const createRes = await fetch(`${API_BASE}/simulations/`, {
                                method: 'POST',
                                headers: {
                                  Authorization: token ? `Token ${token}` : '',
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                              })
                              if (!createRes.ok) throw new Error('Failed to create simulation')
                              const created = await createRes.json()
                              const id = created.id
                              setSimulationId(id)

                              // Begin polling progress immediately so the UI updates while EnKF runs
                              pollProgress(id).catch((err) => {
                                console.error('[SIM] Poll error (EnKF):', err)
                              })

                              // Run EnKF with forecasts (server may stream updates to simulation.progress)
                              const enkfRes = await fetch(`${API_BASE}/simulations/${id}/run_enkf_with_forecasts/`, {
                                method: 'POST',
                                headers: {
                                  Authorization: token ? `Token ${token}` : '',
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  ensemble_size: 100,
                                  num_iterations: 10,
                                  forecast_period_days: 365,
                                }),
                              })
                              if (!enkfRes.ok) throw new Error('EnKF failed')
                              const result = await enkfRes.json()

                              // Ensure final progress and results are set (pollProgress may already have done this)
                              setRunProgress(100)
                              setResults(result.simulation)
                              setIsRunning(false)
                              setTabValue(3)
                            } catch (err) {
                              console.error(err)
                              setIsRunning(false)
                            }
                          }}
                          sx={{
                            backgroundColor: '#28a745',
                            px: 4,
                            '&:hover': {
                              backgroundColor: '#218838',
                            },
                          }}
                        >
                          Run EnKF + Forecasts
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Running simulation... {Math.round(runProgress)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(runProgress, 100)}
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                        />
                        {runProgress >= 100 && (
                          <Alert severity="success">Simulation completed successfully!</Alert>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: '#F7F9FC',
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: '#1a2332',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Simulation Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Status
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {isRunning ? 'Running' : 'Ready'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Elapsed Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {Math.round(runProgress * 0.5)} sec
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          CPU Usage
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {isRunning ? '85%' : '0%'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Memory
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {isRunning ? '2.3 GB' : '0.5 GB'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: Results */}
          <TabPanel value={tabValue} index={3}>
            {!results ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      backgroundColor: '#F7F9FC',
                      '@media (prefers-color-scheme: dark)': {
                        backgroundColor: '#1a2332',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                        Results & Visualization
                      </Typography>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Run a simulation to view results, charts, and parameter distributions
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {/* Simulation Stats */}
                <Grid item xs={12}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F1FA 100%)',
                    boxShadow: '0 8px 24px rgba(15, 76, 129, 0.12)',
                    border: '1px solid rgba(15, 76, 129, 0.15)',
                    borderRadius: '12px',
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#0F4C81', display: 'flex', alignItems: 'center', gap: 1 }}>
                        🔍 Simulation Results
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(15, 76, 129, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(15, 76, 129, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(15, 76, 129, 0.12)',
                              boxShadow: '0 4px 12px rgba(15, 76, 129, 0.15)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                              Status
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F4C81', fontSize: '18px' }}>
                              ✓ {results.status || 'Complete'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(40, 167, 69, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(40, 167, 69, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(40, 167, 69, 0.12)',
                              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                              Match Quality
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#28a745', fontSize: '18px' }}>
                              {results.match_quality !== undefined && results.match_quality !== null ? `${Number(results.match_quality).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.12)',
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                              Duration
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#FF9800', fontSize: '18px' }}>
                              {results.duration_seconds !== undefined && results.duration_seconds !== null && results.duration_seconds > 0
                                ? `${Math.floor(results.duration_seconds / 60)}m ${results.duration_seconds % 60}s`
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(76, 175, 80, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.12)',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                              Algorithm
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#4CAF50', fontSize: '18px' }}>
                              {results.matching_type === 'enkf' ? 'EnKF' : 'Baseline'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Charts */}
                {(priorForecast || posteriorForecast) && (
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, #F7F9FC 0%, #E8F1F8 100%)',
                        boxShadow: '0 8px 24px rgba(15, 76, 129, 0.12)',
                        border: '1px solid rgba(15, 76, 129, 0.1)',
                        borderRadius: '12px',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#0F4C81', display: 'flex', alignItems: 'center', gap: 1 }}>
                          📊 Production Forecast Analysis
                        </Typography>

                        {/* Metric Selector - Enhanced */}
                        <Box sx={{ 
                          mb: 4, 
                          display: 'flex', 
                          gap: 1, 
                          flexWrap: 'wrap',
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '8px',
                          border: '1px solid rgba(15, 76, 129, 0.1)'
                        }}>
                          {['oil', 'water', 'gas', 'pressure'].map((metric) => (
                            <Button
                              key={metric}
                              variant={chartMetric === metric ? 'contained' : 'outlined'}
                              onClick={() => setChartMetric(metric)}
                              sx={{
                                backgroundColor: chartMetric === metric ? 'linear-gradient(135deg, #0F4C81 0%, #0D3A5C 100%)' : 'transparent',
                                color: chartMetric === metric ? 'white' : '#0F4C81',
                                borderColor: '#0F4C81',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: chartMetric === metric ? 'linear-gradient(135deg, #0D3A5C 0%, #0A2A42 100%)' : 'rgba(15, 76, 129, 0.05)',
                                  borderColor: '#0D3A5C',
                                }
                              }}
                            >
                              {metric.charAt(0).toUpperCase() + metric.slice(1)}
                            </Button>
                          ))}
                        </Box>

                        {/* Prior Forecast Chart */}
                        {priorForecast && (
                          <Box sx={{ mb: 5 }}>
                            <ForecastCharts
                              forecast={priorForecast}
                              metric={chartMetric}
                              title={`${chartMetric.toUpperCase()} - Prior Forecast`}
                              forecastType="prior"
                            />
                          </Box>
                        )}

                        {/* Posterior Forecast Chart */}
                        {posteriorForecast && (
                          <Box sx={{ mb: 3 }}>
                            <ForecastCharts
                              forecast={posteriorForecast}
                              metric={chartMetric}
                              title={`${chartMetric.toUpperCase()} - Posterior Forecast`}
                              forecastType="posterior"
                            />
                          </Box>
                        )}

                        {!priorForecast && !posteriorForecast && (
                          <Alert 
                            severity="info"
                            sx={{
                              backgroundColor: 'rgba(15, 76, 129, 0.1)',
                              color: '#0F4C81',
                              '& .MuiAlert-icon': { color: '#0F4C81' }
                            }}
                          >
                            Forecasts are being generated. This typically takes 30-60 seconds. Refresh the page in a moment.
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Production Flow Visualization */}
                {(priorForecast || posteriorForecast) && (
                  <Grid item xs={12}>
                    <ProductionFlowVisualization
                      priorData={
                        priorForecast && priorForecast.predictions
                          ? {
                              oil: priorForecast.predictions.oil?.mean?.[0] || 45,
                              water: priorForecast.predictions.water?.mean?.[0] || 65,
                              gas: priorForecast.predictions.gas?.mean?.[0] || 80,
                              pressure: priorForecast.predictions.pressure?.mean?.[0] || 150,
                            }
                          : undefined
                      }
                      posteriorData={
                        posteriorForecast && posteriorForecast.predictions
                          ? {
                              oil: posteriorForecast.predictions.oil?.mean?.[0] || 65,
                              water: posteriorForecast.predictions.water?.mean?.[0] || 45,
                              gas: posteriorForecast.predictions.gas?.mean?.[0] || 85,
                              pressure: posteriorForecast.predictions.pressure?.mean?.[0] || 180,
                            }
                          : undefined
                      }
                    />
                  </Grid>
                )}

                {/* Download Section */}
                <Grid item xs={12}>
                  {exportError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {exportError}
                    </Alert>
                  )}
                  {exportSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {exportSuccess}
                    </Alert>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={downloadResults}
                      disabled={exportLoading}
                      sx={{ 
                        backgroundColor: '#0F4C81',
                        '&:disabled': { opacity: 0.6 }
                      }}
                    >
                      {exportLoading ? 'Exporting...' : 'Download Results (JSON)'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={generatePDFReport}
                      disabled={exportLoading}
                      sx={{
                        color: '#28a745',
                        borderColor: '#28a745',
                        '&:hover': {
                          backgroundColor: 'rgba(40, 167, 69, 0.05)',
                          borderColor: '#20c04a',
                        },
                        '&:disabled': { opacity: 0.6 }
                      }}
                    >
                      {exportLoading ? 'Generating PDF...' : 'Export Report (PDF)'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        </Card>

        {/* Data Drawer */}
            <DataDrawer open={dataDrawerOpen} onClose={() => setDataDrawerOpen(false)} onDatasetCreated={(id?: number) => {
              if (id) setUploadedDatasetId(id)
            }} />

          {/* Manual Entry Modal (moved from DataDrawer) */}
          <DataInputModal
            isOpen={isManualModalOpen}
            onClose={() => setIsManualModalOpen(false)}
            onSave={handleManualDatasetSave}
          />
      </Box>
    </Container>

    {/* Floating Interpret Button - Outside container for absolute positioning */}
    {simulationId && results && (
      <InterpretButton 
        simulationId={simulationId} 
        disabled={!results}
      />
    )}

    {/* Interpretation Drawer */}
    <InterpretationDrawer />
    </>
  )
}

export default SimulatorPage
