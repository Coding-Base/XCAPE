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
} from '@mui/icons-material'
import { useAuth } from '@context/AuthContext'
import ForecastCharts from '@components/ForecastCharts'

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
  const { token } = useAuth()

  // File upload state
  const [productionFile, setProductionFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [datasetId, setDatasetId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string>('')
  const [uploadSuccess, setUploadSuccess] = useState<string>('')

  // Controlled quick params
  const [initialPressure, setInitialPressure] = useState<number>(200)
  const [porosity, setPorosity] = useState<number>(15)
  const [permeability, setPermeability] = useState<number>(100)
  const [waterSaturation, setWaterSaturation] = useState<number>(30)

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
        },
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setDatasetId(data.id)
      setUploadSuccess(`Dataset uploaded successfully (ID: ${data.id})`)
      setProductionFile(null)
      setUploadError('')
    } catch (err) {
      console.error('Upload failed', err)
      setUploadError('Failed to upload dataset')
    }
  }

  const pollProgress = (id: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/simulations/${id}/`, {
          headers: {
            Authorization: token ? `Token ${token}` : '',
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) throw new Error('Failed to fetch progress')
        const data = await res.json()
        setRunProgress(data.progress || 0)
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          setIsRunning(false)
          setResults(data)
          setTabValue(3)
        }
      } catch (err) {
        console.error(err)
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 2000)
  }

  const handleRunSimulation = async () => {
    setIsRunning(true)
    setRunProgress(0)

    try {
      const payload = {
        name: `Run - ${new Date().toISOString()}`,
        description: 'Launched from frontend UI',
        matching_type: algorithmType === 'enkf' ? 'enkf' : 'baseline',
        initial_pressure: initialPressure,
        porosity: porosity,
        permeability: permeability,
        water_saturation: waterSaturation,
      }

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

      // Start simulation
      await fetch(`${API_BASE}/simulations/${id}/start/`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
      })

      // Begin polling progress
      pollProgress(id)
    } catch (err) {
      console.error('Run failed', err)
      setIsRunning(false)
    }
  }

  useEffect(() => {
    return () => {
      // cleanup if needed
    }
  }, [])

  const downloadResults = async () => {
    if (!simulationId) return
    try {
      const res = await fetch(`${API_BASE}/forecasts/by_simulation/?simulation_id=${simulationId}`, {
        headers: { Authorization: token ? `Token ${token}` : '' },
      })
      if (!res.ok) throw new Error('Failed to fetch forecasts')
      const forecasts = await res.json()

      // Build JSON bundle
      const payload = { simulation: results, forecasts }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `simulation_${simulationId}_results.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  return (
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
                  </CardContent>
                </Card>
              </Grid>
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
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayIcon />}
                        onClick={handleRunSimulation}
                        sx={{
                          backgroundColor: '#0F4C81',
                          px: 4,
                          '&:hover': {
                            backgroundColor: '#0a3857',
                          },
                        }}
                      >
                        Start Simulation
                      </Button>
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
                    <Typography variant="body2" color="textSecondary">
                      Results will appear here after simulation completion:
                    </Typography>
                    <ul style={{ marginTop: 12 }}>
                      <li>Observed vs Predicted Production Data</li>
                      <li>Parameter Posterior Distributions</li>
                      <li>Ensemble Spread Visualization</li>
                      <li>Production Forecasts</li>
                      <li>RMSE and Match Quality Metrics</li>
                    </ul>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{ backgroundColor: '#0F4C81' }}
                  >
                    Download Results
                  </Button>
                  <Button variant="outlined" sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}>
                    Export Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </Container>
  )
}

export default SimulatorPage
