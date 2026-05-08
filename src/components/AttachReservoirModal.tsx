import React, {useEffect, useState} from 'react'

interface AttachReservoirModalProps {
  isOpen: boolean
  onClose: () => void
  onAttached?: (datasetId: number) => void
}

export const AttachReservoirModal: React.FC<AttachReservoirModalProps> = ({isOpen, onClose, onAttached}) => {
  const [datasets, setDatasets] = useState<Array<any>>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const token = localStorage.getItem('authToken')
    fetch(`/api/datasets/recent/`, {
      headers: {
        Authorization: token ? `Token ${token}` : '',
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) return
      const j = await res.json()
      // filter datasets that don't already have a reservoir_model
      const candidates = j.filter((d: any) => !(d.production_data && d.production_data.reservoir_model))
      setDatasets(candidates)
      if (candidates.length > 0) setSelectedId(candidates[0].id)
    }).catch(() => {})
  }, [isOpen])

  if (!isOpen) return null

  const handleAttach = async () => {
    setError('')
    if (!selectedId) {
      setError('Please select a dataset to attach to')
      return
    }

    let parsed: any = null
    try {
      parsed = JSON.parse(jsonText)
    } catch (e) {
      setError('Invalid JSON for reservoir model')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`/api/datasets/${selectedId}/attach_model/`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({reservoir_model: parsed}),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        let msg = `Server error (${res.status})`
        try { msg = JSON.parse(txt).detail || JSON.stringify(JSON.parse(txt)) } catch (e) { msg = txt || msg }
        setError(msg)
        setIsLoading(false)
        return
      }

      const updated = await res.json()
      setIsLoading(false)
      onAttached && onAttached(updated.id)
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Attach failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 dark:bg-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Attach Reservoir Model</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Select Dataset</label>
            <select value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="w-full p-2 border rounded mt-1 dark:bg-transparent dark:text-slate-100">
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name} (ID: {d.id})</option>
              ))}
              {datasets.length === 0 && <option value="">No recent production-only datasets found</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Paste Reservoir Model JSON</label>
            <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={10} className="w-full p-2 border rounded mt-1 font-mono text-sm dark:bg-transparent dark:text-slate-100" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button onClick={handleAttach} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{isLoading ? 'Attaching...' : 'Attach'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
