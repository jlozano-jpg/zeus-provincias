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

const DATE_OPTIONS = [
  { value: 'ayer', label: 'Ayer' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'manana', label: 'Mañana' },
]

const createRule = () => ({
  id: `${Date.now()}-${Math.random()}`,
  conditions: [
    { id: `${Date.now()}-${Math.random()}`, attribute: 'fechaEntrega', value: '' }
  ]
})

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
          { id: `${Date.now()}-${Math.random()}`, attribute: 'fechaEntrega', value: '' }
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
                  Cada regla agrupa condiciones por <strong>y</strong>. Las reglas entre sí se combinan con <strong>o</strong>.
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
                            onChange={e => updateCondition(rule.id, condition.id, 'attribute', e.target.value)}
                            disabled={isReadOnly}
                          >
                            {ATTRIBUTE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>

                          {condition.attribute === 'fechaEntrega' && (
                            <select
                              className={styles.select}
                              value={condition.value}
                              onChange={e => updateCondition(rule.id, condition.id, 'value', e.target.value)}
                              disabled={isReadOnly}
                            >
                              <option value="">Seleccionar</option>
                              {DATE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
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
