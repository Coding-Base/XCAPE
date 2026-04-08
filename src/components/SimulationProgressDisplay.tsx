/**
 * Real-time progress display component for simulations.
 * Shows live updates of EnKF iterations and calibration progress.
 */

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Chip,
  Stack,
  Alert,
  Fade,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import TimerIcon from '@mui/icons-material/Timer'
import { useSimulationWebSocket } from '@hooks/useSimulationWebSocket'

interface SimulationProgressDisplayProps {
  simulationId: number | string | null
  enabled?: boolean
  showDetails?: boolean
}

/**
 * Component to display real-time simulation progress via WebSocket
 */
const SimulationProgressDisplay: React.FC<SimulationProgressDisplayProps> = ({
  simulationId,
  enabled = true,
  showDetails = true,
}) => {
  const progress = useSimulationWebSocket(simulationId, enabled)

  if (!enabled || !simulationId) {
    return null
  }

  const isConnected = progress.status === 'connected'
  const isComplete = progress.message?.type === 'simulation_complete'
  const isError = progress.message?.type === 'simulation_error'

  const getStatusColor = () => {
    if (isError) return 'error'
    if (isComplete) return 'success'
    if (isConnected) return 'info'
    return 'default'
  }

  const getStatusLabel = () => {
    if (isError) return 'Error'
    if (isComplete) return 'Completed'
    if (progress.status === 'connecting') return 'Connecting...'
    if (isConnected) return 'Running'
    return 'Disconnected'
  }

  const getProgressPercentage = () => {
    if (isComplete) return 100
    if (progress.iteration > 0) {
      // Normalize to 0-100% (assuming max 10 iterations for display)
      return Math.min((progress.iteration / 10) * 100, 95)
    }
    return 0
  }

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ mb: 3 }}>
        {/* Status Card */}
        <Card
          sx={{
            backgroundColor: isError ? '#ffebee' : isComplete ? '#e8f5e9' : '#e3f2fd',
            borderLeft: `4px solid ${
              isError ? '#f44336' : isComplete ? '#4caf50' : '#2196f3'
            }`,
          }}
        >
          <CardContent>
            {/* Header with Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {isError ? (
                <ErrorIcon sx={{ color: '#f44336', fontSize: 24 }} />
              ) : isComplete ? (
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#2196f3',
                    animation: isConnected ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Simulation Progress
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Simulation #{simulationId}
                </Typography>
              </Box>

              <Chip
                label={getStatusLabel()}
                color={getStatusColor()}
                size="small"
                variant="outlined"
              />
            </Box>

            {/* Progress Bar */}
            {!isError && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: isComplete
                        ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
                        : 'linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 0.5, color: '#666' }}
                >
                  {getProgressPercentage().toFixed(0)}% complete
                </Typography>
              </Box>
            )}

            {/* Message Display */}
            {progress.message && showDetails && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isError ? '#c62828' : isComplete ? '#2e7d32' : '#1565c0',
                    fontWeight: 500,
                  }}
                >
                  {progress.message.message}
                </Typography>
              </Box>
            )}

            {/* Details */}
            {showDetails && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Current Iteration
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                    {progress.iteration}/10
                  </Typography>
                </Box>

                {isComplete && progress.message?.match_quality !== undefined && progress.message?.match_quality !== null && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Match Quality
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mt: 0.25,
                        color:
                          progress.message.match_quality > 70
                            ? '#4caf50'
                            : progress.message.match_quality > 50
                              ? '#ff9800'
                              : '#f44336',
                      }}
                    >
                      {progress.message.match_quality.toFixed(1)}%
                    </Typography>
                  </Box>
                )}

                {isComplete && progress.message?.duration !== undefined && progress.message?.duration !== null && progress.message?.duration > 0 && (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                    <TimerIcon sx={{ fontSize: 14, color: '#666', mt: 0.25 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Duration
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                        {formatDuration(progress.message.duration)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            )}

            {/* Error Alert */}
            {isError && progress.message?.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">{progress.message.error}</Typography>
              </Alert>
            )}

            {/* Connection Status */}
            {!isError && !isComplete && (
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                {progress.status === 'connecting'
                  ? 'Establishing connection...'
                  : progress.status === 'disconnected'
                    ? 'Waiting for connection...'
                    : 'Live updates active'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  )
}

export default SimulationProgressDisplay
