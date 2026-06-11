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
            <label className={styles.label}>Provincia *</label>
            <input
              type="text"
              ref={firstInputRef}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={mode === 'view'}
              onKeyDown={handleKeyDown}
              className={styles.input}
              aria-label="Nombre de provincia"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>IIBB *</label>
            <select
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

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Impuestos</h3>
            
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="percibeAlways"
                checked={formData.percibeAlways}
                onChange={() => handleCheckChange('percibeAlways')}
                disabled={mode === 'view'}
                className={styles.checkbox}
                aria-label="Percibe siempre"
              />
              <label htmlFor="percibeAlways" className={styles.checkboxLabel}>
                Percibe siempre
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="permiteDevolución"
                checked={formData.permiteDevolución}
                onChange={() => handleCheckChange('permiteDevolución')}
                disabled={mode === 'view'}
                className={styles.checkbox}
                aria-label="Permite devolución de percepción fuera de mes"
              />
              <label htmlFor="permiteDevolución" className={styles.checkboxLabel}>
                Permite devolución de percepción fuera de mes
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Devolución de Percepciones de Ingresos Brutos en Notas de Crédito Automáticas</h3>
            
            <div className={styles.radioGroup}>
              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="igual"
                  name="devolucionPercepciones"
                  value="igual"
                  checked={formData.devolucionPercepciones === 'igual'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Solo si la factura y la nota de crédito poseen la misma base imponible"
                />
                <label htmlFor="igual" className={styles.radioLabel}>
                  Solo si la factura y la nota de crédito poseen la misma base imponible.
                </label>
              </div>

              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="siempre"
                  name="devolucionPercepciones"
                  value="siempre"
                  checked={formData.devolucionPercepciones === 'siempre'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Devolver siempre el total de las percepciones en la nota de crédito"
                />
                <label htmlFor="siempre" className={styles.radioLabel}>
                  Devolver siempre el total de las percepciones en la nota de crédito.
                </label>
              </div>

              <div className={styles.radioItem}>
                <input
                  type="radio"
                  id="proporcional"
                  name="devolucionPercepciones"
                  value="proporcional"
                  checked={formData.devolucionPercepciones === 'proporcional'}
                  onChange={(e) => handleChange('devolucionPercepciones', e.target.value)}
                  disabled={mode === 'view'}
                  className={styles.radio}
                  aria-label="Devolver las percepciones de manera proporcional a la base imponible de la nota de crédito"
                />
                <label htmlFor="proporcional" className={styles.radioLabel}>
                  Devolver las percepciones de manera proporcional a la base imponible de la nota de crédito.
                </label>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Ley de Transparencia Fiscal</h3>
            
            <p className={styles.sectionDescription}>
              Las leyendas y porcentajes especificados se reflejarán en los comprobantes emitidos a consumidores finales.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Porcentaje de IIBB</label>
              <input
                type="number"
                value={formData.porcentajeIIBB ?? 0.0}
                onChange={(e) => handleChange('porcentajeIIBB', parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
                onKeyDown={handleKeyDown}
                className={styles.input}
                aria-label="Porcentaje de IIBB"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.0"
              />
              <p className={styles.helperText}>Alicuota de IIBB correspondiente a la actividad principal.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Leyenda a mostrar en comprobantes</label>
              <textarea
                value={formData.leyendaComprobante}
                onChange={(e) => handleChange('leyendaComprobante', e.target.value)}
                disabled={mode === 'view'}
                onKeyDown={handleKeyDown}
                className={styles.textarea}
                aria-label="Leyenda a mostrar en comprobantes"
                placeholder="Texto a imprimir en el comprobante"
                rows="3"
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="convenioMultilateral"
                checked={formData.convenioMultilateral}
                onChange={() => handleCheckChange('convenioMultilateral')}
                disabled={mode === 'view'}
                className={styles.checkbox}
                aria-label="Convenio Multilateral"
              />
              <label htmlFor="convenioMultilateral" className={styles.checkboxLabel}>
                Convenio Multilateral
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Leyenda a mostrar</label>
              <textarea
                value={formData.leyendaConvenio}
                onChange={(e) => handleChange('leyendaConvenio', e.target.value)}
                disabled={mode === 'view' || !formData.convenioMultilateral}
                onKeyDown={handleKeyDown}
                className={styles.textarea}
                placeholder="Texto a imprimir en el comprobante"
                aria-label="Leyenda para Convenio Multilateral"
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
              Guardar Provincia
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
