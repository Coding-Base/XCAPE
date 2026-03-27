import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

interface ForecastProps {
  forecast: any
  metric?: string
  title?: string
}

const ForecastCharts: React.FC<ForecastProps> = ({ forecast, metric = 'oil', title }) => {
  if (!forecast) return null

  const preds = forecast.predictions || {}
  const metricData = preds[metric] || {}
  const days = forecast.time_axis?.days || []

  // Build series
  const series = days.map((d: number, i: number) => ({
    day: d,
    mean: metricData.mean?.[i] ?? null,
    p10: metricData.p10?.[i] ?? null,
    p50: metricData.p50?.[i] ?? null,
    p90: metricData.p90?.[i] ?? null,
  }))

  return (
    <div style={{ width: '100%', height: 360 }}>
      {title && <h4 style={{ marginBottom: 8 }}>{title}</h4>}
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="p90" stroke="#8884d8" fillOpacity={1} fill="url(#colorP90)" />
          <Line type="monotone" dataKey="mean" stroke="#ff7300" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ForecastCharts
