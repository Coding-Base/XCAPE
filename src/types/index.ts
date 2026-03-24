// Common types for the XCAPE application

export interface Concept {
  id: string
  title: string
  description: string
  fullContent: string
  icon?: string
}

export interface SimulationParameters {
  porosity: number
  permeability: number
  initialPressure: number
  waterSaturation: number
  [key: string]: number | string
}

export interface SimulationResult {
  id: string
  timestamp: string
  parameters: SimulationParameters
  predictedProduction: number[]
  observedProduction: number[]
  matchingError: number
}

export interface Contributor {
  id: string
  name: string
  role: string
  bio: string
  image?: string
  qualification?: string
  achievement?: string
  contact?: string
  address?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}
