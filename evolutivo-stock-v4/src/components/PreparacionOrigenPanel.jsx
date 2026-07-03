import styles from './PreparacionOrigenPanel.module.css'

const ORIGENES = [
  { id: 'pedidos-venta', title: 'Pedidos de venta', description: 'Seleccionar como origen de la preparación' },
  { id: 'sugerencias-compra', title: 'Sugerencias de compra', description: 'Seleccionar como origen de la preparación' },
  { id: 'facturas-acopio', title: 'Facturas de acopio', description: 'Seleccionar como origen de la preparación' }
]

export default function PreparacionOrigenPanel({ onSelect, onCancel, rightOffset = 0, activeOriginId, inactive = false }) {
  return (
    <>
      <div className={styles.overlay} onClick={onCancel} aria-hidden="true" />
      <div className={`${styles.panel} ${inactive ? styles.panelInactive : ''}`} style={{ right: rightOffset }} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>Seleccionar el origen de la preparación a crear</h2>
          <button
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Cerrar panel"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {ORIGENES.map(origen => {
            const isDisabled = Boolean(activeOriginId) && origen.id !== activeOriginId
            return (
              <div key={origen.id} className={`${styles.optionCard} ${isDisabled ? styles.optionCardDisabled : ''}`}>
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>{origen.title}</span>
                  <span className={styles.optionDescription}>{origen.description}</span>
                </div>
                <button
                  className={styles.optionArrow}
                  onClick={() => onSelect(origen)}
                  disabled={isDisabled}
                  aria-label={`Seleccionar ${origen.title}`}
                  title={`Seleccionar ${origen.title}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </>
  )
}
