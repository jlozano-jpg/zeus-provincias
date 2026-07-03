import { useState, useRef } from 'react'
import styles from './AsignacionAutomaticaPanel.module.css'

const CRITERIOS_INITIAL = [
  {
    id: 'carga',
    nombre: 'Menor carga actual',
    descripcion: 'Preparador con menos preparaciones activas.',
    activo: true,
  },
  {
    id: 'afinidad',
    nombre: 'Afinidad por tamaño de preparación',
    descripcion: 'Artículos promedio más cercano a la preparación actual.',
    activo: true,
  },
  {
    id: 'tiempo',
    nombre: 'Menor tiempo promedio por ubicación',
    descripcion: 'Historial de los últimos 30 días.',
    activo: true,
  },
  {
    id: 'antiguedad',
    nombre: 'Mayor antigüedad en el puesto',
    descripcion: 'Preparador con más experiencia en el rol.',
    activo: false,
  },
]

const ICONS = {
  carga: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  afinidad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.27 6.96 8.73 5.04 8.73-5.04"/>
      <path d="M12 22.08V12"/>
    </svg>
  ),
  tiempo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  antiguedad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
}

export default function AsignacionAutomaticaPanel({ onClose }) {
  const [criterios, setCriterios] = useState(CRITERIOS_INITIAL)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragIdxRef = useRef(null)

  const toggleActivo = (id) => {
    setCriterios(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c))
  }

  const handleDragStart = (e, idx) => {
    dragIdxRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }

  const handleDrop = (e, toIdx) => {
    e.preventDefault()
    const fromIdx = dragIdxRef.current
    if (fromIdx == null || fromIdx === toIdx) { setDragOverIdx(null); return }
    const updated = [...criterios]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    setCriterios(updated)
    dragIdxRef.current = null
    setDragOverIdx(null)
  }

  const handleDragEnd = () => {
    dragIdxRef.current = null
    setDragOverIdx(null)
  }

  let counter = 0
  const withOrder = criterios.map(c => ({
    ...c,
    order: c.activo ? ++counter : null,
  }))

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Asignación Automática de Preparadores">

        <div className={styles.header}>
          <h2 className={styles.title}>Asignación Automática de Preparadores</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel">✕</button>
        </div>

        <p className={styles.intro}>
          Activá los criterios que quieras usar y ordenalos según prioridad de aplicación.
        </p>

        <div className={styles.criteriosList}>
          {withOrder.map((c, idx) => (
            <div
              key={c.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`${styles.criterioRow} ${dragOverIdx === idx ? styles.criterioRowDragOver : ''}`}
            >
              <div className={`${styles.criterioContent} ${!c.activo ? styles.criterioContentInactive : ''}`}>
                <div className={styles.grip} aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <circle cx="7" cy="4" r="1.6"/>
                    <circle cx="13" cy="4" r="1.6"/>
                    <circle cx="7" cy="10" r="1.6"/>
                    <circle cx="13" cy="10" r="1.6"/>
                    <circle cx="7" cy="16" r="1.6"/>
                    <circle cx="13" cy="16" r="1.6"/>
                  </svg>
                </div>

                <div className={styles.orderBadge}>
                  {c.order != null && <span className={styles.badge}>{c.order}</span>}
                </div>

                <div className={styles.criterioIcon}>
                  {ICONS[c.id]}
                </div>

                <div className={styles.criterioInfo}>
                  <span className={styles.criterioNombre}>{c.nombre}</span>
                  <span className={styles.criterioDesc}>{c.descripcion}</span>
                </div>
              </div>

              <button
                type="button"
                className={`${styles.toggle} ${c.activo ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => toggleActivo(c.id)}
                aria-pressed={c.activo}
                aria-label={`${c.activo ? 'Desactivar' : 'Activar'} criterio: ${c.nombre}`}
              >
                <span className={`${styles.toggleThumb} ${c.activo ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
              </button>
            </div>
          ))}
        </div>

        <p className={styles.footerText}>
          Los criterios activos se aplican en orden secuencial hasta identificar al preparador sugerido.
        </p>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.saveBtn} onClick={onClose}>Guardar</button>
        </div>
      </div>
    </>
  )
}
