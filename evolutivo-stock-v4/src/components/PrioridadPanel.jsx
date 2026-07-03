import { useState, useEffect, useRef } from 'react'
import styles from './PrioridadPanel.module.css'

const ATTRIBUTE_OPTIONS = [
  { value: 'fechaEntrega', label: 'Fecha de entrega' },
  { value: 'tipoCliente', label: 'Tipo de cliente' },
  { value: 'cantidadArticulos', label: 'Cantidad de artículos' },
]

const CLIENT_TYPES = [
  { value: 'VIP', label: 'VIP' },
  { value: 'Frecuente', label: 'Frecuente' },
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'Consumidor final', label: 'Consumidor final' },
]

const createRule = () => ({
  id: `${Date.now()}-${Math.random()}`,
  conditions: [
    { id: `${Date.now()}-${Math.random()}`, attribute: 'fechaEntrega', operator: 'ultimos', dias: 5 }
  ]
})

// ── Fecha de entrega helpers ──────────────────────────────────────────────────

function calcFechaEjemplo(deltaDays) {
  const base = new Date(2000, 6, 3) // 03/07 fija
  base.setDate(base.getDate() + deltaDays)
  const dd = String(base.getDate()).padStart(2, '0')
  const mm = String(base.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

function FechaHelper({ operator, dias }) {
  if (operator === 'hoy') {
    return <p className={styles.helperText}>La regla aplica a comprobantes cuya fecha de entrega es igual a la fecha actual.</p>
  }
  const n = dias
  if (operator === 'proximos') {
    return <p className={styles.helperText}>Ejemplo: si la fecha actual es 03/07 y se configuran {n} días, la regla aplica a comprobantes con fecha de entrega entre el 03/07 y el {calcFechaEjemplo(n)}.</p>
  }
  if (operator === 'vencida') {
    return <p className={styles.helperText}>Ejemplo: si la fecha actual es 03/07 y se configuran {n} días, la regla aplica a comprobantes con fecha de entrega anterior al {calcFechaEjemplo(-n)}.</p>
  }
  // ultimos (default)
  return <p className={styles.helperText}>Ejemplo: si la fecha actual es 03/07 y se configuran {n} días, la regla aplica a comprobantes con fecha de entrega entre el {calcFechaEjemplo(-n)} y el 03/07.</p>
}

export default function PrioridadPanel({ mode, prioridad, onSave, onCancel, onEdit }) {
  const isReadOnly = mode === 'view'
  const [form, setForm] = useState({
    id: prioridad?.id ?? null,
    codigo: prioridad?.codigo ?? '',
    descripcion: prioridad?.descripcion ?? '',
    color: prioridad?.color ?? '#D32F2F',
  })
  const [hexInput, setHexInput] = useState(prioridad?.color ?? '#D32F2F')
  const [rules, setRules] = useState(prioridad?.rules ?? [])
  const colorRef = useRef(null)

  useEffect(() => {
    setForm({
      id: prioridad?.id ?? null,
      codigo: prioridad?.codigo ?? '',
      descripcion: prioridad?.descripcion ?? '',
      color: prioridad?.color ?? '#D32F2F',
    })
    setHexInput(prioridad?.color ?? '#D32F2F')
    setRules(prioridad?.rules ?? [])
  }, [prioridad])

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleColorChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, color: val }))
    setHexInput(val)
  }

  const handleHexInput = (e) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setForm(f => ({ ...f, color: val }))
    }
  }

  const handleHexBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(form.color)
    }
  }

  const addRule = () => setRules(prev => [...prev, createRule()])

  const addCondition = (ruleId) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule
      return {
        ...rule,
        conditions: [
          ...rule.conditions,
          { id: `${Date.now()}-${Math.random()}`, attribute: 'fechaEntrega', operator: 'ultimos', dias: 5 }
        ]
      }
    }))
  }

  const updateCondition = (ruleId, conditionId, key, value) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule
      return {
        ...rule,
        conditions: rule.conditions.map(cond => cond.id !== conditionId ? cond : { ...cond, [key]: value })
      }
    }))
  }

  const removeCondition = (ruleId, conditionId) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule
      return {
        ...rule,
        conditions: rule.conditions.filter(cond => cond.id !== conditionId)
      }
    }))
  }

  const removeRule = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const handleSave = () => {
    if (!form.descripcion.trim()) return
    onSave({
      ...form,
      rules,
    })
  }

  return (
    <>
      <div className={styles.overlay} onClick={onCancel} role="presentation" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Panel de prioridad" onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.sectionLabel}>{mode === 'create' ? 'Nueva prioridad' : mode === 'view' ? 'Ver prioridad' : 'Editar prioridad'}</div>
            <h2 className={styles.title}>{mode === 'create' ? 'Nueva prioridad' : mode === 'view' ? 'Ver prioridad' : 'Editar prioridad'}</h2>
          </div>
          <div className={styles.headerActions}>
            {isReadOnly && onEdit && (
              <button className={styles.secondaryBtn} type="button" onClick={() => onEdit(prioridad)}>Editar</button>
            )}
            <button className={styles.closeBtn} onClick={onCancel} aria-label="Cerrar panel">✕</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pri-codigo">Código</label>
            <input
              id="pri-codigo"
              type="text"
              className={styles.input}
              value={form.codigo || ''}
              onChange={e => updateForm('codigo', e.target.value)}
              readOnly={mode !== 'create'}
              placeholder={mode === 'create' ? 'Ej: 001' : ''}
              aria-readonly={mode !== 'create'}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pri-desc">Descripción</label>
            <input
              id="pri-desc"
              type="text"
              className={styles.input}
              value={form.descripcion}
              onChange={e => updateForm('descripcion', e.target.value)}
              placeholder="Ej: PRIORIDAD ALTA"
              disabled={isReadOnly}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pri-color">Color</label>
            <div className={styles.colorField}>
              <input
                ref={colorRef}
                id="pri-color"
                type="color"
                className={styles.colorNative}
                value={form.color}
                onChange={handleColorChange}
                disabled={isReadOnly}
                aria-label="Selector de color"
              />
              <input
                type="text"
                className={styles.colorHexInput}
                value={hexInput}
                onChange={handleHexInput}
                onBlur={handleHexBlur}
                disabled={isReadOnly}
                maxLength={7}
                placeholder="#000000"
                aria-label="Código hexadecimal del color"
              />
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionLabel}>Reglas de asignación automática</div>
                <p className={styles.sectionDescription}>
                  Dentro de una regla, todas las condiciones deben cumplirse en conjunto. Entre distintas reglas, con que se cumpla una alcanza para aplicar la prioridad.
                </p>
              </div>
              {!isReadOnly && (
                <button className={styles.addRuleBtn} type="button" onClick={addRule}>Agregar regla</button>
              )}
            </div>

            {rules.length === 0 ? (
              <div className={styles.emptyState}>
                Si ningún comprobante coincide con una regla de prioridad, el campo de prioridad en la preparación queda en blanco y puede completarse manualmente.
              </div>
            ) : rules.map((rule, index) => (
              <div key={rule.id} className={styles.ruleWrapper}>
                {index > 0 && <div className={styles.orBadge}>o</div>}
                <div className={styles.ruleCard}>
                  <div className={styles.ruleHeader}>
                    <span className={styles.ruleTitle}>Regla {index + 1}</span>
                    {!isReadOnly && rules.length > 1 && (
                      <button className={styles.deleteRuleBtn} type="button" onClick={() => removeRule(rule.id)}>Eliminar regla</button>
                    )}
                  </div>
                  <div className={styles.conditions}>
                    {rule.conditions.map((condition, idx) => (
                      <div key={condition.id} className={styles.conditionRow}>
                        <label className={styles.conditionLabel} htmlFor={`attr-${condition.id}`}>Condición</label>
                        <div className={styles.conditionFields}>
                          <select
                            id={`attr-${condition.id}`}
                            className={styles.select}
                            value={condition.attribute}
                            onChange={e => {
                              const newAttr = e.target.value
                              setRules(prev => prev.map(r => {
                                if (r.id !== rule.id) return r
                                return {
                                  ...r,
                                  conditions: r.conditions.map(c => {
                                    if (c.id !== condition.id) return c
                                    if (newAttr === 'fechaEntrega') {
                                      return { id: c.id, attribute: newAttr, operator: 'ultimos', dias: 5 }
                                    }
                                    return { id: c.id, attribute: newAttr, value: '' }
                                  })
                                }
                              }))
                            }}
                            disabled={isReadOnly}
                          >
                            {ATTRIBUTE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>

                          {condition.attribute === 'fechaEntrega' && (
                            <div>
                              <div className={styles.fechaRow}>
                                <select
                                  className={styles.selectFecha}
                                  value={condition.operator ?? 'ultimos'}
                                  onChange={e => updateCondition(rule.id, condition.id, 'operator', e.target.value)}
                                  disabled={isReadOnly}
                                >
                                  <option value="ultimos">Dentro de los últimos</option>
                                  <option value="proximos">Dentro de los próximos</option>
                                  <option value="vencida">Vencida hace más de</option>
                                  <option value="hoy">Hoy</option>
                                </select>
                                <input
                                  type="number"
                                  className={styles.diasInput}
                                  value={condition.dias ?? 5}
                                  min={1}
                                  max={365}
                                  step={1}
                                  disabled={isReadOnly || (condition.operator ?? 'ultimos') === 'hoy'}
                                  onChange={e => updateCondition(rule.id, condition.id, 'dias', Number(e.target.value))}
                                  onBlur={e => {
                                    let v = parseInt(e.target.value, 10)
                                    if (isNaN(v) || v < 1) v = 1
                                    if (v > 365) v = 365
                                    updateCondition(rule.id, condition.id, 'dias', v)
                                  }}
                                />
                                <span className={`${styles.diasSuffix}${(condition.operator ?? 'ultimos') === 'hoy' ? ` ${styles.diasSuffixDisabled}` : ''}`}>días</span>
                              </div>
                              <FechaHelper operator={condition.operator ?? 'ultimos'} dias={condition.dias ?? 5} />
                            </div>
                          )}

                          {condition.attribute === 'tipoCliente' && (
                            <select
                              className={styles.select}
                              value={condition.value}
                              onChange={e => updateCondition(rule.id, condition.id, 'value', e.target.value)}
                              disabled={isReadOnly}
                            >
                              <option value="">Seleccionar</option>
                              {CLIENT_TYPES.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          )}

                          {condition.attribute === 'cantidadArticulos' && (
                            <div className={styles.numberField}>
                              <input
                                type="number"
                                min="0"
                                className={styles.input}
                                value={condition.value}
                                onChange={e => updateCondition(rule.id, condition.id, 'value', e.target.value)}
                                disabled={isReadOnly}
                              />
                              <span className={styles.infoIcon} title="Aplica si la cantidad es igual o mayor a este valor">i</span>
                            </div>
                          )}
                        </div>
                        {!isReadOnly && rule.conditions.length > 1 && (
                          <button className={styles.removeConditionBtn} type="button" onClick={() => removeCondition(rule.id, condition.id)}>Eliminar</button>
                        )}
                        {idx < rule.conditions.length - 1 && <div className={styles.andLabel}>y</div>}
                      </div>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <div className={styles.ruleFooter}>
                      <button className={styles.addConditionBtn} type="button" onClick={() => addCondition(rule.id)}>Agregar condición</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          {isReadOnly ? (
            <button className={styles.saveBtn} type="button" onClick={onCancel}>Cerrar</button>
          ) : (
            <>
              <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancelar</button>
              <button className={styles.saveBtn} type="button" onClick={handleSave} disabled={!form.descripcion.trim()}>Guardar</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
