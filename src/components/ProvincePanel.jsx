import { useState, useEffect, useRef } from 'react'
import styles from './ProvincePanel.module.css'

const AVAILABLE_IIBB = [
  'Buenos Aires',
  'Catamarca',
  'Córdoba',
  'Corrientes',
  'Chaco',
  'Chubut',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
  'CABA'
]

export default function ProvincePanel({ mode, province, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    ...province,
    porcentajeIIBB: province?.porcentajeIIBB ?? 0.0,
    leyendaComprobante: province?.leyendaComprobante ?? ''
  }))
  const [hasChanges, setHasChanges] = useState(false)
  const firstInputRef = useRef(null)

  useEffect(() => {
    setFormData({
      ...province,
      porcentajeIIBB: province?.porcentajeIIBB ?? 0.0,
      leyendaComprobante: province?.leyendaComprobante ?? ''
    })
    setHasChanges(false)
  }, [province])

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [mode])

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      setHasChanges(true)
      return updated
    })
  }

  const handleCheckChange = (field) => {
    handleChange(field, !formData[field])
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('El nombre de la provincia es requerido')
      return
    }
    onSave(formData)
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Hay cambios sin guardar. ¿Descartar cambios?')) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'view' ? 'Ver Provincia' : 'Editar Provincia'}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={handleCancel}
            aria-label="Cerrar panel"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Código</label>
            <div className={styles.codeDisplay}>
              {String(formData.code).padStart(2, '0')}
            </div>
            <p className={styles.helperText}>No editable</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              type="text"
              value={formData.name}
              disabled
              className={styles.input}
              aria-label="Nombre de provincia"
            />
            <p className={styles.helperText}>No editable</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Configuración Impositiva</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Jurisdicción IIBB *</label>
              <select
                ref={firstInputRef}
                value={formData.iibb}
                onChange={(e) => handleChange('iibb', e.target.value)}
                disabled={mode === 'view'}
                onKeyDown={handleKeyDown}
                className={styles.select}
                aria-label="Jurisdicción de IIBB"
              >
                <option value="">Seleccionar IIBB...</option>
                {AVAILABLE_IIBB.map(iibb => (
                  <option key={iibb} value={iibb}>{iibb}</option>
                ))}
              </select>
              <p className={styles.helperText}>Jurisdicción de Ingresos Brutos asociada a la provincia</p>
            </div>

            <label className={styles.toggleGroup}>
              <input
                type="checkbox"
                checked={formData.percibeAlways}
                onChange={() => handleCheckChange('percibeAlways')}
                disabled={mode === 'view'}
                className={styles.toggleInput}
                aria-label="Percibe Siempre"
              />
              <span className={styles.toggleSwitch} aria-hidden="true" />
              <span className={styles.toggleLabel}>Percibe Siempre</span>
            </label>

            <label className={styles.toggleGroup}>
              <input
                type="checkbox"
                checked={formData.permiteDevolución}
                onChange={() => handleCheckChange('permiteDevolución')}
                disabled={mode === 'view'}
                className={styles.toggleInput}
                aria-label="Permite Devolución de Percepción Fuera de Mes"
              />
              <span className={styles.toggleSwitch} aria-hidden="true" />
              <span className={styles.toggleLabel}>Permite Devolución de Percepción Fuera de Mes</span>
            </label>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Criterio de Devolución en Notas de Crédito Automáticas</h3>

            <div className={styles.radioGroup}>
              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="anulacion"
                  name="devolucionPercepciones"
                  value="anulacion"
                  checked={formData.devolucionPercepciones === 'anulacion'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Anulación"
                />
                <div className={styles.radioContent}>
                  <label htmlFor="anulacion" className={styles.radioLabel}>
                    Anulación
                  </label>
                  <p className={styles.radioDescription}>
                    Se efectuará la devolución de percepciones solo cuando se anule la factura original de manera total.
                  </p>
                </div>
              </div>

              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="parcial"
                  name="devolucionPercepciones"
                  value="parcial"
                  checked={formData.devolucionPercepciones === 'parcial'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Devolución parcial"
                />
                <div className={styles.radioContent}>
                  <label htmlFor="parcial" className={styles.radioLabel}>
                    Devolución parcial
                  </label>
                  <p className={styles.radioDescription}>
                    Se efectuará la devolución de percepciones de manera proporcional a la base imponible de la Nota de Crédito.
                  </p>
                </div>
              </div>

              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="total"
                  name="devolucionPercepciones"
                  value="total"
                  checked={formData.devolucionPercepciones === 'total'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Devolución total"
                />
                <div className={styles.radioContent}>
                  <label htmlFor="total" className={styles.radioLabel}>
                    Devolución total
                  </label>
                  <p className={styles.radioDescription}>
                    Se efectuará la devolución de percepciones de manera total aunque la Nota de Crédito sea parcial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Ley de Transparencia Fiscal</h3>
            
            <p className={styles.sectionDescription}>
              Las leyendas y porcentajes especificados se reflejarán en los comprobantes emitidos a consumidores finales.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alícuota de Ingresos Brutos</label>
              <input
                type="number"
                value={formData.porcentajeIIBB ?? 0.0}
                onChange={(e) => handleChange('porcentajeIIBB', parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
                onKeyDown={handleKeyDown}
                className={styles.input}
                aria-label="Alícuota de Ingresos Brutos"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.0"
              />
              <p className={styles.helperText}>Alicuota de IIBB correspondiente a la actividad principal.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Leyenda para Comprobantes</label>
              <textarea
                value={formData.leyendaComprobante}
                onChange={(e) => handleChange('leyendaComprobante', e.target.value)}
                disabled={mode === 'view'}
                onKeyDown={handleKeyDown}
                className={styles.textarea}
                aria-label="Leyenda para Comprobantes"
                placeholder="Texto a imprimir en el comprobante"
                rows="3"
              />
            </div>

            <label className={styles.toggleGroup}>
              <input
                type="checkbox"
                checked={formData.convenioMultilateral}
                onChange={() => handleCheckChange('convenioMultilateral')}
                disabled={mode === 'view'}
                className={styles.toggleInput}
                aria-label="Convenio Multilateral"
              />
              <span className={styles.toggleSwitch} aria-hidden="true" />
              <span className={styles.toggleLabel}>Convenio Multilateral</span>
            </label>

            <div className={styles.formGroup}>
              <label className={styles.label}>Leyenda Adicional Convenio Multilateral</label>
              <textarea
                value={formData.leyendaConvenio}
                onChange={(e) => handleChange('leyendaConvenio', e.target.value)}
                disabled={mode === 'view' || !formData.convenioMultilateral}
                onKeyDown={handleKeyDown}
                className={styles.textarea}
                placeholder="Texto a imprimir en el comprobante"
                aria-label="Leyenda Adicional Convenio Multilateral"
                rows="3"
              />
            </div>
          </div>
        </div>

        {mode === 'edit' && (
          <div className={styles.footer}>
            <button
              className={`${styles.btn} ${styles.cancelBtn}`}
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              className={`${styles.btn} ${styles.saveBtn}`}
              onClick={handleSave}
            >
              Actualizar
            </button>
          </div>
        )}

        {mode === 'view' && (
          <div className={styles.footer}>
            <button
              className={`${styles.btn} ${styles.closeViewBtn}`}
              onClick={handleCancel}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  )
}
