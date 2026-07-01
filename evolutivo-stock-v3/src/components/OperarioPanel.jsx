import { useState, useEffect, useRef } from 'react'
import styles from './OperarioPanel.module.css'

const AVAILABLE_USUARIOS = [
  'U001 - jperez',
  'U002 - mgomez',
  'U003 - cfernandez',
  'U004 - lromero',
  'U005 - dsosa',
  'U006 - atorres',
  'U007 - mlopez',
  'U008 - rgarcia'
]

const AVAILABLE_DEPOSITOS = [
  'D01 - Depósito Central',
  'D02 - Sucursal Norte',
  'D03 - Sucursal Sur',
]

const AVAILABLE_AREAS = [
  '01 - Depósito Central',
  '02 - Depósito Norte',
  '03 - Depósito Sur',
  '04 - Recepción',
  '05 - Expedición'
]

function calcAntiguedad(fechaStr) {
  if (!fechaStr) return '--'
  const start = new Date(fechaStr)
  if (isNaN(start.getTime())) return '--'
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years < 0) return '--'
  if (years === 0 && months === 0) return '< 1m'
  if (years === 0) return `${months}m`
  return `${years}a ${months}m`
}

export default function OperarioPanel({ mode, operario, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => ({ ...operario }))
  const [hasChanges, setHasChanges] = useState(false)
  const firstInputRef = useRef(null)

  useEffect(() => {
    setFormData({ ...operario })
    setHasChanges(false)
  }, [operario])

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
    if (!String(formData.code ?? '').trim()) {
      alert('El código es requerido')
      return
    }
    if (!formData.usuarioZeus) {
      alert('El usuario ZEUS ERP & POS es requerido')
      return
    }
    if (!formData.preparador && !formData.controlador) {
      alert('Debe seleccionar al menos un rol: Preparador o Controlador')
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

  const isOperador = formData.preparador || formData.controlador

  const titles = {
    view: 'Ver Operario',
    edit: 'Editar Operario',
    create: 'Nuevo Operario'
  }

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{titles[mode]}</h2>
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
          {/* CÓDIGO */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Código *</label>
            <input
              ref={mode === 'create' ? firstInputRef : undefined}
              type="text"
              value={formData.code ?? ''}
              onChange={(e) => handleChange('code', e.target.value)}
              disabled={mode === 'view' || mode === 'edit'}
              onKeyDown={handleKeyDown}
              className={styles.input}
              aria-label="Código"
            />
            {mode !== 'create' && <p className={styles.helperText}>No editable</p>}
          </div>

          {/* USUARIO */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Usuario ZEUS ERP &amp; POS *</label>
            <select
              ref={mode !== 'create' ? firstInputRef : undefined}
              value={formData.usuarioZeus ?? ''}
              onChange={(e) => handleChange('usuarioZeus', e.target.value)}
              disabled={mode === 'view'}
              onKeyDown={handleKeyDown}
              className={styles.select}
              aria-label="Usuario ZEUS ERP y POS"
            >
              <option value="">Seleccionar usuario...</option>
              {AVAILABLE_USUARIOS.map(usuario => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>
          </div>

          {/* NOMBRE */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              type="text"
              value={formData.name ?? ''}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={mode === 'view'}
              onKeyDown={handleKeyDown}
              className={styles.input}
              aria-label="Nombre"
            />
          </div>

          {/* INICIO DE ACTIVIDADES */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Inicio de Actividades</label>
            <input
              type="date"
              value={formData.inicioActividades ?? ''}
              onChange={(e) => handleChange('inicioActividades', e.target.value)}
              disabled={mode === 'view'}
              onKeyDown={handleKeyDown}
              className={styles.input}
              aria-label="Inicio de actividades"
            />
          </div>

          {/* FECHA DE NACIMIENTO */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha de Nacimiento</label>
            <input
              type="date"
              value={formData.fechaNacimiento ?? ''}
              onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
              disabled={mode === 'view'}
              onKeyDown={handleKeyDown}
              className={styles.input}
              aria-label="Fecha de nacimiento"
            />
          </div>

          {/* ROLES */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Roles *</h3>

            <label className={styles.toggleGroup}>
              <input
                type="checkbox"
                checked={formData.preparador ?? false}
                onChange={() => handleCheckChange('preparador')}
                disabled={mode === 'view'}
                className={styles.toggleInput}
                aria-label="Preparador"
              />
              <span className={styles.toggleSwitch} aria-hidden="true" />
              <span className={styles.toggleLabel}>Preparador</span>
            </label>

            <label className={styles.toggleGroup}>
              <input
                type="checkbox"
                checked={formData.controlador ?? false}
                onChange={() => handleCheckChange('controlador')}
                disabled={mode === 'view'}
                className={styles.toggleInput}
                aria-label="Controlador"
              />
              <span className={styles.toggleSwitch} aria-hidden="true" />
              <span className={styles.toggleLabel}>Controlador</span>
            </label>
          </div>

          {/* Secciones visibles solo cuando hay al menos un rol activo */}
          {isOperador && (
            <>
              {/* DEPÓSITO */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Depósito</label>
                <select
                  value={formData.deposito ?? ''}
                  onChange={(e) => handleChange('deposito', e.target.value)}
                  disabled={mode === 'view'}
                  onKeyDown={handleKeyDown}
                  className={styles.select}
                  aria-label="Depósito"
                >
                  <option value="">Seleccionar depósito...</option>
                  {AVAILABLE_DEPOSITOS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* ÁREA */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Área</label>
                <select
                  value={formData.area ?? ''}
                  onChange={(e) => handleChange('area', e.target.value)}
                  disabled={mode === 'view' || !formData.preparador}
                  onKeyDown={handleKeyDown}
                  className={styles.select}
                  aria-label="Área"
                >
                  <option value="">Seleccionar área...</option>
                  {AVAILABLE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <p className={styles.helperText}>Disponible al activar el rol Preparador</p>
              </div>

              {/* ATRIBUTOS */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Atributos</h3>

                <label className={`${styles.toggleGroup} ${styles.atributoRow}`}>
                  <input
                    type="checkbox"
                    checked={formData.apto ?? false}
                    onChange={() => handleCheckChange('apto')}
                    disabled={mode === 'view'}
                    className={styles.toggleInput}
                    aria-label="Apto autoelevador"
                  />
                  <span className={styles.toggleSwitch} aria-hidden="true" />
                  <span className={styles.atributoTexto}>
                    <span className={styles.atributoNombre}>Apto autoelevador</span>
                    <span className={styles.atributoDesc}>Habilita preparaciones con ubicaciones en altura o pallets pesados.</span>
                  </span>
                </label>
              </div>

              {/* INDICADORES CALCULADOS */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Indicadores Calculados</h3>

                <div className={styles.indicadoresBox}>
                  <div className={styles.indicadorRow}>
                    <span className={styles.indicadorIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                    </span>
                    <span className={styles.indicadorLabel}>Antigüedad en el puesto</span>
                    <span className={styles.indicadorValor}>{calcAntiguedad(formData.inicioActividades)}</span>
                  </div>

                  <div className={styles.indicadorRow}>
                    <span className={styles.indicadorIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                        <polyline points="2 17 12 22 22 17"/>
                        <polyline points="2 12 12 17 22 12"/>
                      </svg>
                    </span>
                    <span className={styles.indicadorLabel}>Artículos promedio / preparación</span>
                    <span className={styles.indicadorValor}>
                      {formData.articulosPromedio != null ? formData.articulosPromedio : '--'}
                    </span>
                  </div>

                  <div className={styles.indicadorRow}>
                    <span className={styles.indicadorIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3.5 2"/>
                      </svg>
                    </span>
                    <span className={styles.indicadorLabel}>Tiempo promedio / ubicación</span>
                    <span className={styles.indicadorValor}>
                      {formData.tiempoPromedio != null ? formData.tiempoPromedio : '--'}
                    </span>
                  </div>
                </div>

                <p className={styles.helperText}>No editable. Calculado en base al historial de preparaciones.</p>
              </div>
            </>
          )}
        </div>

        {(mode === 'edit' || mode === 'create') && (
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
              {mode === 'create' ? 'Guardar' : 'Actualizar'}
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
