import React, { useState } from 'react'
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
  const [activeStep, setActiveStep] = useState(0)
  const [tabValue, setTabValue] = useState(0)
  const [algorithmType, setAlgorithmType] = useState('enkf')
  const [isRunning, setIsRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)

  const handleRunSimulation = () => {
    setIsRunning(true)
    // Simulate progress
    const interval = setInterval(() => {
      setRunProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 1000)
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
                <Card sx={{ backgroundColor: '#F7F9FC' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Production Data Upload
                    </Typography>
                    <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 2 }}>
                      Upload CSV file with pressure, flow rates, and cumulative production data
                    </Alert>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}
                    >
                      Select Production Data File
                    </Button>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'textSecondary' }}>
                      Supported: CSV, XLSX
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#F7F9FC' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Reservoir Model Upload
                    </Typography>
                    <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 2 }}>
                      Upload your OPM Flow model file or parameter configuration
                    </Alert>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ color: '#0F4C81', borderColor: '#0F4C81' }}
                    >
                      Select Model File
                    </Button>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'textSecondary' }}>
                      Supported: DATA, PY, JSON
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#F7F9FC' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F4C81' }}>
                      Quick Parameters
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Initial Pressure (bar)"
                          type="number"
                          defaultValue={200}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Porosity (%)"
                          type="number"
                          defaultValue={15}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Permeability (mD)"
                          type="number"
                          defaultValue={100}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Water Saturation (%)"
                          type="number"
                          defaultValue={30}
                          variant="outlined"
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
                <Card sx={{ backgroundColor: '#F7F9FC' }}>
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
                <Card sx={{ backgroundColor: '#F7F9FC' }}>
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
