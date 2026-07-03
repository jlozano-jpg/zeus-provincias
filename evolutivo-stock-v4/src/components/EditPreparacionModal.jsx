import { useState } from 'react'
import styles from './EditPreparacionModal.module.css'

const PRIORIDADES = [
  { value: 'Alta',  bg: '#FFE5E5', color: '#C82828' },
  { value: 'Media', bg: '#FFF8E5', color: '#B87400' },
  { value: 'Baja',  bg: '#E5FAE5', color: '#1A7A1A' },
]

export default function EditPreparacionModal({ type, preparacion, operarios, onSave, onClose }) {
  const preparadores = operarios.filter(o => o.preparador)

  const [selectedPreparador, setSelectedPreparador] = useState(preparacion.preparador ?? '')
  const [selectedPrioridad, setSelectedPrioridad]   = useState(preparacion.prioridad  ?? '')

  const canSave = type === 'preparador' ? !!selectedPreparador : !!selectedPrioridad

  const handleSave = () => {
    if (type === 'preparador') onSave(preparacion.id, { preparador: selectedPreparador })
    else                       onSave(preparacion.id, { prioridad:  selectedPrioridad  })
  }

  return (
    <div className={styles.panel} role="dialog" aria-modal="true">
      <div className={styles.header}>
        <h2 className={styles.title}>
          {type === 'preparador' ? 'Editar Preparador' : 'Editar Prioridad'}
        </h2>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaNum}>#{preparacion.numeroPreparacion ?? preparacion.comprobante}</span>
        <span className={styles.metaRazon}>{preparacion.razonSocial}</span>
      </div>

      <div className={styles.body}>
        {type === 'preparador' ? (
          <div className={styles.optionsList}>
            {preparadores.map(op => (
              <label
                key={op.id}
                className={`${styles.option} ${selectedPreparador === op.name ? styles.optionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="preparador"
                  value={op.name}
                  checked={selectedPreparador === op.name}
                  onChange={() => setSelectedPreparador(op.name)}
                  className={styles.radioInput}
                />
                <span className={styles.optionCode}>{op.code}</span>
                <span className={styles.optionName}>{op.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className={styles.prioridadGroup}>
            {PRIORIDADES.map(({ value, bg, color }) => (
              <button
                key={value}
                type="button"
                className={`${styles.prioridadBtn} ${selectedPrioridad === value ? styles.prioridadBtnSelected : ''}`}
                style={selectedPrioridad === value ? { background: bg, color, borderColor: color } : {}}
                onClick={() => setSelectedPrioridad(value)}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!canSave}>Guardar</button>
      </div>
    </div>
  )
}
