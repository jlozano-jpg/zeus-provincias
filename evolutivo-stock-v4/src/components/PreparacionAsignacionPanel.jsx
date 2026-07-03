import { useState } from 'react'
import styles from './PreparacionAsignacionPanel.module.css'

const ESTADOS_OCUPADO = ['Pendiente', 'En Proceso']

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2 L13.8 8.2 L20 10 L13.8 11.8 L12 18 L10.2 11.8 L4 10 L10.2 8.2 Z" />
    <path d="M19 1 L19.7 3.3 L22 4 L19.7 4.7 L19 7 L18.3 4.7 L16 4 L18.3 3.3 Z" />
  </svg>
)

export default function PreparacionAsignacionPanel({
  operarios,
  preparaciones = [],
  prioridades = [],
  numeroPreparacion,
  onBack,
  onCancel,
  onConfirm,
}) {
  const preparadores = operarios.filter(o => o.preparador)

  const busyMap = new Map()
  preparaciones
    .filter(p => ESTADOS_OCUPADO.includes(p.estado))
    .forEach(p => { if (!busyMap.has(p.preparador)) busyMap.set(p.preparador, p) })

  const formatPreparador = (p) => `${p.code} - ${p.name}`

  const sugerido = preparadores.find(p => !busyMap.has(p.name)) ?? preparadores[0]
  const defaultPreparador = sugerido ? formatPreparador(sugerido) : ''
  const defaultPrioridad = prioridades[0]?.descripcion ?? ''

  const [preparador, setPreparador] = useState(defaultPreparador)
  const [prioridad, setPrioridad] = useState(defaultPrioridad)

  const getBusyPrep = (formattedValue) => {
    const name = formattedValue.split(' - ').slice(1).join(' - ')
    return busyMap.get(name) ?? null
  }

  const busyPrep = preparador ? getBusyPrep(preparador) : null

  const handleConfirm = () => onConfirm({ preparador, prioridad })

  return (
    <div className={styles.panel} role="dialog" aria-modal="true">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Volver" title="Volver">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className={styles.title}>Preparador y prioridad</h2>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.closeBtn} onClick={onCancel} aria-label="Cerrar panel" title="Cerrar (Esc)">✕</button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.suggestionBanner}>
          <span className={styles.bannerIcon}><SparkleIcon /></span>
          <p className={styles.bannerText}>
            El sistema sugiere el preparador y la prioridad en función de los comprobantes seleccionados y las reglas de asignación configuradas. Podés modificarlos si lo deseás.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.fieldLabel} htmlFor="asig-preparador">Preparador</label>
              {preparador === defaultPreparador && <span className={styles.suggestedBadge}>Sugerido</span>}
            </div>
            <div className={styles.selectWrap}>
              <select
                id="asig-preparador"
                className={styles.select}
                value={preparador}
                onChange={e => setPreparador(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {preparadores.map(p => (
                  <option key={p.id} value={formatPreparador(p)}>{formatPreparador(p)}</option>
                ))}
              </select>
              {busyPrep && (
                <span
                  className={styles.busyBadge}
                  title={`Ocupado en preparación #${busyPrep.numeroPreparacion} (${busyPrep.estado})`}
                >
                  <ClockIcon />
                  Ocupado
                </span>
              )}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.fieldLabel} htmlFor="asig-prioridad">Prioridad</label>
              {prioridad === defaultPrioridad && <span className={styles.suggestedBadge}>Sugerida</span>}
            </div>
            <select
              id="asig-prioridad"
              className={styles.select}
              value={prioridad}
              onChange={e => setPrioridad(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {prioridades.map(p => (
                <option key={p.id} value={p.descripcion}>{p.descripcion}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancelar</button>
        <button className={styles.confirmBtn} type="button" onClick={handleConfirm}>Confirmar</button>
      </div>
    </div>
  )
}
