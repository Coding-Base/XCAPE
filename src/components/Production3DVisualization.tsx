import React from 'react'
import { Box, useTheme } from '@mui/material'
// @ts-ignore - react-plotly.js doesn't have type definitions
import Plot from 'react-plotly.js'

interface FlowData {
  oil: number
  water: number
  gas: number
  pressure: number
}

interface Production3DProps {
  priorData?: FlowData
  posteriorData?: FlowData
  showPrior?: boolean
}

const Production3DVisualization: React.FC<Production3DProps> = ({
  priorData = { oil: 45, water: 65, gas: 80, pressure: 150 },
  posteriorData = { oil: 65, water: 45, gas: 85, pressure: 180 },
  showPrior = true,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const data = showPrior ? priorData : posteriorData
  const title = showPrior ? 'Prior Forecast (Initial State)' : 'Posterior Forecast (Calibrated)'

  // Dark mode color scheme
  const darkModeColors = {
    background: '#1a1a2e',
    card: '#16213e',
    text: '#ecf0f1',
    gridline: 'rgba(100, 120, 140, 0.3)',
    gridBackground: 'rgba(20, 30, 50, 0.5)',
    axis: '#8899aa',
  }

  // Create 3D scatter plot data for production flows with visual flow effects
  const generateFlowData = (flowData: FlowData) => {
    // Create multiple points representing fluid flow in 3D space
    // X = time steps, Y = production volume, Z = pressure
    const timeSteps = Array.from({ length: 20 }, (_, i) => i) // More steps for smoother flow
    
    // Oil Production Trace
    const oilY = timeSteps.map((_, i) => flowData.oil * (1 - i * 0.08))
    const oilZ = timeSteps.map((_, i) => flowData.pressure * (1 - i * 0.05))
    const oilSizes = timeSteps.map((_, i) => 4 + i * 0.6) // Increasing size for flow direction
    
    // Water Production Trace
    const waterY = timeSteps.map((_, i) => flowData.water * (1 + i * 0.1))
    const waterZ = timeSteps.map((_, i) => flowData.pressure * (1 - i * 0.06))
    const waterSizes = timeSteps.map((_, i) => 4 + i * 0.6)
    
    // Gas Production Trace
    const gasY = timeSteps.map((_, i) => flowData.gas * (1 - i * 0.06))
    const gasZ = timeSteps.map((_, i) => flowData.pressure * (1 - i * 0.04))
    const gasSizes = timeSteps.map((_, i) => 4 + i * 0.6)

    const plotData: any[] = [
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: timeSteps,
        y: oilY,
        z: oilZ,
        name: 'Oil Production',
        line: { 
          color: timeSteps, // Color gradient along the line
          colorscale: [[0, 'rgba(212, 165, 116, 0.3)'], [1, 'rgba(212, 165, 116, 1)']],
          width: 8,
          showscale: false,
        },
        marker: { 
          size: oilSizes,
          color: timeSteps,
          colorscale: [[0, 'rgba(212, 165, 116, 0.3)'], [1, 'rgba(212, 165, 116, 1)']],
          symbol: 'diamond',
          showscale: false,
          line: { color: '#8B6F47', width: 1 },
        },
        hovertemplate: '<b>Oil Production</b><br>Time: %{x}<br>Rate: %{y:.0f} bbl/day<br>Pressure: %{z:.0f} psi<extra></extra>',
      },
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: timeSteps,
        y: waterY,
        z: waterZ,
        name: 'Water Production',
        line: { 
          color: timeSteps,
          colorscale: [[0, 'rgba(100, 181, 246, 0.3)'], [1, 'rgba(100, 181, 246, 1)']],
          width: 8,
          showscale: false,
        },
        marker: { 
          size: waterSizes,
          color: timeSteps,
          colorscale: [[0, 'rgba(100, 181, 246, 0.3)'], [1, 'rgba(100, 181, 246, 1)']],
          symbol: 'circle',
          showscale: false,
          line: { color: '#1976D2', width: 1 },
        },
        hovertemplate: '<b>Water Production</b><br>Time: %{x}<br>Rate: %{y:.0f} bbl/day<br>Pressure: %{z:.0f} psi<extra></extra>',
      },
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: timeSteps,
        y: gasY,
        z: gasZ,
        name: 'Gas Production',
        line: { 
          color: timeSteps,
          colorscale: [[0, 'rgba(255, 183, 77, 0.3)'], [1, 'rgba(255, 183, 77, 1)']],
          width: 8,
          showscale: false,
        },
        marker: { 
          size: gasSizes,
          color: timeSteps,
          colorscale: [[0, 'rgba(255, 183, 77, 0.3)'], [1, 'rgba(255, 183, 77, 1)']],
          symbol: 'square',
          showscale: false,
          line: { color: '#FF6F00', width: 1 },
        },
        hovertemplate: '<b>Gas Production</b><br>Time: %{x}<br>Rate: %{y:.0f} bbl/day<br>Pressure: %{z:.0f} psi<extra></extra>',
      },
    ]
    
    return plotData
  }

  const chartData = generateFlowData(data)

  const layout: any = {
    title: {
      text: `<b>${title}</b><br><sub>Fluid Flow Visualization Over Time</sub>`,
      font: { size: 18, color: isDark ? darkModeColors.text : '#0F4C81', family: 'Arial, sans-serif' },
    },
    scene: {
      xaxis: {
        title: '<b>Time Steps</b>',
        backgroundcolor: isDark ? darkModeColors.gridBackground : 'rgba(230, 240, 250, 0.5)',
        gridcolor: isDark ? darkModeColors.gridline : 'rgba(200, 200, 200, 0.3)',
        showbackground: true,
        zerolinecolor: isDark ? darkModeColors.gridline : 'white',
        titlefont: { size: 12, color: isDark ? darkModeColors.text : '#0F4C81' },
      },
      yaxis: {
        title: '<b>Production Rate (bbl/day)</b>',
        backgroundcolor: isDark ? darkModeColors.gridBackground : 'rgba(230, 240, 250, 0.5)',
        gridcolor: isDark ? darkModeColors.gridline : 'rgba(200, 200, 200, 0.3)',
        showbackground: true,
        zerolinecolor: isDark ? darkModeColors.gridline : 'white',
        titlefont: { size: 12, color: isDark ? darkModeColors.text : '#0F4C81' },
      },
      zaxis: {
        title: '<b>Pressure (psi)</b>',
        backgroundcolor: isDark ? darkModeColors.gridBackground : 'rgba(230, 240, 250, 0.5)',
        gridcolor: isDark ? darkModeColors.gridline : 'rgba(200, 200, 200, 0.3)',
        showbackground: true,
        zerolinecolor: isDark ? darkModeColors.gridline : 'white',
        titlefont: { size: 12, color: isDark ? darkModeColors.text : '#0F4C81' },
      },
      camera: {
        eye: { x: 1.8, y: 1.8, z: 1.4 },
        center: { x: 0, y: 0, z: 0 },
      },
      aspectmode: 'cube',
    },
    autosize: true,
    margin: { l: 60, r: 60, b: 60, t: 80 },
    paper_bgcolor: isDark ? darkModeColors.background : 'rgba(245, 250, 255, 1)',
    plot_bgcolor: isDark ? darkModeColors.card : 'rgba(255, 255, 255, 0.9)',
    hovermode: 'closest',
    font: {
      color: isDark ? darkModeColors.text : '#333',
      family: 'Arial, sans-serif',
    },
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: isDark ? 'rgba(22, 33, 62, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      bordercolor: isDark ? darkModeColors.text : '#0F4C81',
      borderwidth: 2,
      font: { size: 11, color: isDark ? darkModeColors.text : '#333' },
    },
    annotations: [
      {
        text: '→ Brighter colors = Later time steps',
        xref: 'paper',
        yref: 'paper',
        x: 0.02,
        y: -0.08,
        showarrow: false,
        font: { size: 10, color: isDark ? '#aaa' : '#666' },
        align: 'left',
      },
      {
        text: '→ Larger markers = Increasing flow intensity',
        xref: 'paper',
        yref: 'paper',
        x: 0.02,
        y: -0.12,
        showarrow: false,
        font: { size: 10, color: isDark ? '#aaa' : '#666' },
        align: 'left',
      },
    ],
  }

  const config: any = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['autoScale2d', 'lasso2d'],
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '550px', 
      borderRadius: '14px', 
      overflow: 'hidden',
      boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(15, 76, 129, 0.15)',
      border: isDark ? '2px solid rgba(136, 153, 170, 0.2)' : '2px solid rgba(15, 76, 129, 0.1)',
      backgroundColor: isDark ? '#16213e' : '#fafbfc',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(15, 76, 129, 0.25)',
      }
    }}>
      <Plot
        data={chartData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  )
}

export default Production3DVisualization

