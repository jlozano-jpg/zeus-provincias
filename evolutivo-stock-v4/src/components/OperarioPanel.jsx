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
  'U008 - rgarcia',
]

const AVAILABLE_DEPOSITOS = [
  'D01 - Depósito Central',
  'D02 - Sucursal Norte',
  'D03 - Sucursal Sur',
  'D04 - Almacén Este',
  'D05 - Almacén Oeste',
]

const AVAILABLE_AREAS = [
  '01 - Depósito Central',
  '02 - Depósito Norte',
  '03 - Depósito Sur',
  '04 - Recepción',
  '05 - Expedición',
]

function MultiDepositoSelect({ value = [], onChange, disabled, options }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = options.filter((option) => option.toLowerCase().includes(search.toLowerCase()))
  const toggle = (option) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  const removePill = (option, event) => {
    event.stopPropagation()
    onChange(value.filter((item) => item !== option))
  }

  return (
    <div className={styles.multiSelect} ref={containerRef}>
      <div
        className={[styles.multiSelectTrigger, disabled ? styles.multiSelectDisabled : '', open ? styles.multiSelectOpen : ''].join(' ')}
        onClick={() => !disabled && setOpen((current) => !current)}
        role="combobox"
        aria-expanded={open}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
            event.preventDefault()
            setOpen((current) => !current)
          }
          if (event.key === 'Escape') {
            setOpen(false)
            setSearch('')
          }
        }}
      >
        <div className={styles.multiSelectPills}>
          {value.length === 0 ? (
            <span className={styles.multiSelectPlaceholder}>Seleccionar depósitos...</span>
          ) : (
            value.map((item) => (
              <span key={item} className={styles.pill}>
                {item}
                {!disabled && (
                  <button type="button" className={styles.pillRemove} onClick={(event) => removePill(item, event)} aria-label={`Quitar ${item}`}>
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        {!disabled && (
          <span className={`${styles.multiSelectChevron} ${open ? styles.multiSelectChevronOpen : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        )}
      </div>

      {open && (
        <div className={styles.multiSelectDropdown} role="listbox" aria-multiselectable="true">
          <div className={styles.multiSelectSearchWrap}>
            <svg className={styles.multiSelectSearchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className={styles.multiSelectSearch} placeholder="Buscar depósito..." value={search} onChange={(event) => setSearch(event.target.value)} autoFocus onClick={(event) => event.stopPropagation()} />
            {search && (
              <button type="button" className={styles.multiSelectSearchClear} onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
          <div className={styles.multiSelectList}>
            {filtered.length === 0 ? (
              <div className={styles.multiSelectEmpty}>Sin resultados</div>
            ) : (
              filtered.map((option) => {
                const checked = value.includes(option)
                return (
                  <label key={option} className={`${styles.multiSelectOption} ${checked ? styles.multiSelectOptionChecked : ''}`}>
                    <input type="checkbox" className={styles.multiSelectCheckbox} checked={checked} onChange={() => toggle(option)} />
                    <span className={styles.multiSelectOptionLabel}>{option}</span>
                  </label>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OperarioPanel({ mode, operario, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    code: operario?.code ?? '',
    usuarioZeus: operario?.usuarioZeus ?? '',
    name: operario?.name ?? '',
    inicioActividades: operario?.inicioActividades ?? '',
    fechaNacimiento: operario?.fechaNacimiento ?? '',
    preparador: operario?.preparador ?? false,
    controlador: operario?.controlador ?? false,
    depositos: operario?.depositos ?? [],
    area: operario?.area ?? '',
    apto: operario?.apto ?? false,
    articulosPromedio: operario?.articulosPromedio ?? null,
    tiempoPromedio: operario?.tiempoPromedio ?? null,
    articulosPromedioControl: operario?.articulosPromedioControl ?? null,
    tiempoPromedioControl: operario?.tiempoPromedioControl ?? null,
  }))
  const [hasChanges, setHasChanges] = useState(false)
  const firstInputRef = useRef(null)

  useEffect(() => {
    setFormData({
      code: operario?.code ?? '',
      usuarioZeus: operario?.usuarioZeus ?? '',
      name: operario?.name ?? '',
      inicioActividades: operario?.inicioActividades ?? '',
      fechaNacimiento: operario?.fechaNacimiento ?? '',
      preparador: operario?.preparador ?? false,
      controlador: operario?.controlador ?? false,
      depositos: operario?.depositos ?? [],
      area: operario?.area ?? '',
      apto: operario?.apto ?? false,
      articulosPromedio: operario?.articulosPromedio ?? null,
      tiempoPromedio: operario?.tiempoPromedio ?? null,
      articulosPromedioControl: operario?.articulosPromedioControl ?? null,
      tiempoPromedioControl: operario?.tiempoPromedioControl ?? null,
    })
    setHasChanges(false)
  }, [operario])

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [mode])

  const handleChange = (field, value) => {
    setFormData((previous) => {
      const updated = { ...previous, [field]: value }
      setHasChanges(true)
      return updated
    })
  }

  const handleCheckChange = (field) => {
    handleChange(field, !formData[field])
  }

  const handleSave = () => {
    if (!formData.usuarioZeus) {
      alert('El usuario ZEUS ERP & POS es requerido')
      return
    }
    if (!formData.preparador && !formData.controlador) {
      alert('Debe seleccionar al menos un rol: Preparador o Controlador')
      return
    }

    const normalized = {
      ...formData,
      code: String(formData.code ?? '').trim() || `OP-${String(Date.now()).slice(-4)}`,
    }
    onSave(normalized)
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

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleCancel()
    } else if (event.ctrlKey && event.key === 'Enter') {
      handleSave()
    }
  }

  const isOperador = formData.preparador || formData.controlador
  const titles = {
    view: 'Ver operador',
    edit: 'Editar operador',
    create: 'Nuevo operador',
  }

  return (
    <>
      <div className={styles.overlay} onClick={handleCancel} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Configuración</p>
            <h2 className={styles.title}>{titles[mode]}</h2>
          </div>
          <button className={styles.closeBtn} onClick={handleCancel} aria-label="Cerrar panel" title="Cerrar (Esc)">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>{mode === 'create' ? 'Alta rápida' : 'Actualización del perfil'}</p>
            <h3 className={styles.summaryTitle}>{formData.name || 'Operador sin nombre'}</h3>
            <p className={styles.summaryText}>Ajustá los datos del operador y sus permisos sin salir del flujo de gestión.</p>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Usuario ZEUS ERP &amp; POS</label>
            <select ref={mode !== 'create' ? firstInputRef : undefined} value={formData.usuarioZeus ?? ''} onChange={(event) => handleChange('usuarioZeus', event.target.value)} disabled={mode === 'view'} onKeyDown={handleKeyDown} className={styles.select} aria-label="Usuario ZEUS ERP y POS">
              <option value="">Seleccionar usuario...</option>
              {AVAILABLE_USUARIOS.map((usuario) => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Nombre</label>
            <input type="text" value={formData.name ?? ''} onChange={(event) => handleChange('name', event.target.value)} disabled={mode === 'view'} onKeyDown={handleKeyDown} className={styles.input} aria-label="Nombre" />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Fecha de nacimiento</label>
            <input type="date" value={formData.fechaNacimiento ?? ''} onChange={(event) => handleChange('fechaNacimiento', event.target.value)} disabled={mode === 'view'} onKeyDown={handleKeyDown} className={styles.input} aria-label="Fecha de nacimiento" />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Inicio de actividades</label>
            <input type="date" value={formData.inicioActividades ?? ''} onChange={(event) => handleChange('inicioActividades', event.target.value)} disabled={mode === 'view'} onKeyDown={handleKeyDown} className={styles.input} aria-label="Inicio de actividades" />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Roles</label>
            <div className={styles.toggleList}>
              <label className={styles.toggleGroup}>
                <input type="checkbox" checked={formData.preparador ?? false} onChange={() => handleCheckChange('preparador')} disabled={mode === 'view'} className={styles.toggleInput} aria-label="Preparador" />
                <span className={styles.toggleSwitch} aria-hidden="true" />
                <span className={styles.toggleLabel}>Preparador</span>
              </label>
              <label className={styles.toggleGroup}>
                <input type="checkbox" checked={formData.controlador ?? false} onChange={() => handleCheckChange('controlador')} disabled={mode === 'view'} className={styles.toggleInput} aria-label="Controlador" />
                <span className={styles.toggleSwitch} aria-hidden="true" />
                <span className={styles.toggleLabel}>Controlador</span>
              </label>
            </div>
          </div>

          {isOperador && (
            <>
              <div className={styles.formSection}>
                <label className={styles.label}>Depósitos asignados</label>
                <MultiDepositoSelect value={formData.depositos ?? []} onChange={(value) => handleChange('depositos', value)} disabled={mode === 'view'} options={AVAILABLE_DEPOSITOS} />
              </div>

              {formData.preparador && (
                <>
                  <div className={styles.formSection}>
                    <label className={styles.label}>Área</label>
                    <select value={formData.area ?? ''} onChange={(event) => handleChange('area', event.target.value)} disabled={mode === 'view'} onKeyDown={handleKeyDown} className={styles.select} aria-label="Área">
                      <option value="">Seleccionar área...</option>
                      {AVAILABLE_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formSection}>
                    <label className={styles.label}>Apto autoelevador</label>
                    <label className={styles.toggleGroup}>
                      <input type="checkbox" checked={formData.apto ?? false} onChange={() => handleCheckChange('apto')} disabled={mode === 'view'} className={styles.toggleInput} aria-label="Apto autoelevador" />
                      <span className={styles.toggleSwitch} aria-hidden="true" />
                      <span className={styles.toggleLabel}>Habilitado</span>
                    </label>
                    <p className={styles.helperText}>Habilita preparaciones con ubicaciones en altura o pallets.</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {(mode === 'edit' || mode === 'create') && (
          <div className={styles.footer}>
            <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={handleCancel}>
              Cancelar
            </button>
            <button className={`${styles.btn} ${styles.saveBtn}`} onClick={handleSave}>
              {mode === 'create' ? 'Guardar' : 'Actualizar'}
            </button>
          </div>
        )}

        {mode === 'view' && (
          <div className={styles.footer}>
            <button className={`${styles.btn} ${styles.closeViewBtn}`} onClick={handleCancel}>
              Cerrar
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
