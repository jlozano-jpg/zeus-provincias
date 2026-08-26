import { useEffect, useState } from 'react'

// Estado persistido en localStorage y sincronizado entre pestañas/ventanas
// del mismo origen a través del evento 'storage' (que el navegador dispara
// en las demás pestañas cuando una de ellas escribe la clave).
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw != null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // localStorage puede no estar disponible (modo privado, cuota llena): se ignora
    }
  }, [key, state])

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key || e.newValue == null) return
      try {
        setState(JSON.parse(e.newValue))
      } catch {
        // valor corrupto en otra pestaña: se ignora
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [state, setState]
}
