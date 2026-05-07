import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInterpretation } from '../store/slices/interpretationSlice'
import { useAuth } from '../context/AuthContext'
import type { RootState } from '../store/store'
import type { AppDispatch } from '../store/store'
import './InterpretButton.css'

interface InterpretButtonProps {
  simulationId: number
  disabled?: boolean
}

export const InterpretButton: React.FC<InterpretButtonProps> = ({
  simulationId,
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.interpretation)
  const { token } = useAuth()

  const handleClick = () => {
    if (!disabled && !loading && token) {
      dispatch(
        fetchInterpretation({
          simulationId,
          token,
        })
      )
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="interpret-button"
      title="Generate AI-powered interpretation of simulation results"
      aria-label="Interpret simulation results"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path d="M9 10h.01"></path>
        <path d="M13 10h.01"></path>
        <path d="M17 10h.01"></path>
      </svg>
      <span>{loading ? 'Interpreting...' : 'Interpret'}</span>
    </button>
  )
}
