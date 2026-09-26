import { useEffect, useState } from 'react'
import api from '../api/axiosClient.js'

export default function useInventoryData(endpoint, initialValue) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get(endpoint)
      .then((response) => {
        if (active) {
          setData(response.data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load inventory data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [endpoint, reloadKey])

  return { data, loading, error, reload: () => setReloadKey((key) => key + 1) }
}