import { useState, useMemo } from 'react'
import {
  IconAdjustmentsHorizontal, IconX, IconDroplet, IconLayoutRows, IconWand,
  IconPlus, IconTags, IconInfoCircle, IconAlertTriangle, IconCheck,
} from '@tabler/icons-react'
import ColorPicker from './ColorPicker'

let uid = 0
function nextId() { uid += 1; return `v${uid}` }

function emptyValueRow() { return { id: nextId(), code: '', name: '', hex: '' } }

export default function AgrupadorPanel({ mode, initial, onClose, onSubmit }) {
  const isEdit = mode === 'edit'
  const codeReadOnly = isEdit

  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [desc, setDesc] = useState(initial?.desc ?? '')
  const [isColorGroup, setIsColorGroup] = useState(initial?.isColorGroup ?? false)
  const [seg, setSeg] = useState('manual')
  const [values, setValues] = useState(() => {
    if (initial?.values?.length) {
      return initial.values.map((v) => ({ id: nextId(), code: v.code, name: v.name, hex: v.swatch || '' }))
    }
    return [emptyValueRow()]
  })
  const [bulkText, setBulkText] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [pickerFor, setPickerFor] = useState(null)

  const [initialSnapshot] = useState(() => JSON.stringify({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    desc: initial?.desc ?? '',
    values: (initial?.values || []).map((v) => ({ code: v.code, name: v.name, hex: v.swatch || '' })),
  }))

  function updateValue(id, patch) { setValues((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v))) }
  function addValue() { setValues((vs) => [...vs, emptyValueRow()]) }
  function removeValue(id) { setValues((vs) => vs.filter((v) => v.id !== id)) }

  const bulkParsed = useMemo(() => {
    if (!bulkText.trim()) return []
    const items = bulkText.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)
    const seenCodes = {}
    const seenNames = {}
    return items.map((item) => {
      const m = item.match(/^([A-Za-z0-9]+)\s*-\s*(.+)$/)
      let cd
      let nm
      let err = null
      if (m) { cd = m[1].toUpperCase(); nm = m[2].trim() } else { cd = ''; nm = item; err = 'Formato inválido (usá COD-VALOR)' }
      if (!err) {
        if (seenCodes[cd]) err = `Código "${cd}" repetido`
        else if (seenNames[nm.toLowerCase()]) err = `Valor "${nm}" repetido`
        else { seenCodes[cd] = true; seenNames[nm.toLowerCase()] = true }
      }
      return { code: cd, name: nm, err }
    })
  }, [bulkText])

  const bulkErrors = bulkParsed.filter((p) => p.err)

  const manualErrors = useMemo(() => {
    const codes = {}
    const names = {}
    const errs = {}
    values.forEach((v) => {
      const cd = v.code.trim().toUpperCase()
      const nm = v.name.trim().toLowerCase()
      if (cd) { if (codes[cd]) errs[v.id] = `Código "${cd}" repetido`; codes[cd] = true }
      if (nm) { if (names[nm]) errs[v.id] = errs[v.id] || `Valor "${v.name}" repetido`; names[nm] = true }
    })
    return errs
  }, [values])

  const valuesCount = seg === 'manual'
    ? values.filter((v) => v.name.trim() && v.code.trim()).length
    : bulkParsed.filter((p) => !p.err).length

  const hasErrors = seg === 'manual' ? Object.keys(manualErrors).length > 0 : bulkErrors.length > 0
  const isValid = !!(code.trim() && name.trim() && valuesCount > 0 && !hasErrors)
  const currentSnapshot = JSON.stringify({
    code,
    name,
    desc,
    values: values.filter((v) => v.code || v.name).map((v) => ({ code: v.code, name: v.name, hex: v.hex || '' })),
  })
  const isDirty = currentSnapshot !== initialSnapshot || !!bulkText

  function handleCancel() { if (isDirty) setConfirmCancel(true); else onClose() }

  function handleSubmit() {
    if (!isValid) return
    const finalValues = seg === 'manual'
      ? values.filter((v) => v.name && v.code).map((v) => ({
          code: v.code.toUpperCase(),
          name: v.name,
          ...(isColorGroup && v.hex ? { swatch: v.hex } : {}),
        }))
      : bulkParsed.filter((p) => !p.err)
    onSubmit({ code: code.toUpperCase(), name, desc, values: finalValues })
  }

  const pickerValue = values.find((v) => v.id === pickerFor)

  return (
    <aside className="va-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconAdjustmentsHorizontal size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">{isEdit ? 'Edición' : 'Alta'}</div>
          <div className="va-title">{isEdit ? 'Editar agrupador' : 'Nuevo agrupador'}</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={handleCancel} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="va-panel-body">
        <div className="va-section">
          <div className="va-section-head">
            <div className="va-section-title"><span className="va-num">1</span> Datos generales</div>
          </div>
          <div className="va-fields">
            <div className="va-field">
              <label>Código <span className="va-req">*</span></label>
              <input
                className={`va-input ${codeReadOnly ? 'is-readonly' : ''}`}
                placeholder="Ej. VOL"
                value={code}
                maxLength={12}
                readOnly={codeReadOnly}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="va-field">
              <label>Nombre del agrupador <span className="va-req">*</span></label>
              <input
                className="va-input"
                placeholder="Ej. Voltajes, Sabores, Materiales"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="va-fields va-cols-1" style={{ marginTop: 14 }}>
            <div className="va-field">
              <label>Descripción <span className="va-hint">opcional</span></label>
              <textarea
                className="va-textarea"
                placeholder="Descripción opcional para identificar este agrupador"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="va-section">
          <div className="va-section-head">
            <div className="va-section-title">
              <span className="va-num">2</span>
              Valores disponibles
              <span className="va-values-counter"><b>{valuesCount}</b></span>
            </div>
            <label className="va-toggle">
              <input type="checkbox" checked={isColorGroup} onChange={(e) => setIsColorGroup(e.target.checked)} />
              <span className="va-track" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <IconDroplet size={13} stroke={1.6} /> Son colores
              </span>
            </label>
          </div>

          <div className="va-seg-row">
            <div className="va-seg" role="tablist">
              <button type="button" className={`va-seg-btn ${seg === 'manual' ? 'is-active' : ''}`} onClick={() => setSeg('manual')}>
                <IconLayoutRows size={14} stroke={1.6} /> Uno a uno
              </button>
              <button type="button" className={`va-seg-btn ${seg === 'bulk' ? 'is-active' : ''}`} onClick={() => setSeg('bulk')}>
                <IconWand size={14} stroke={1.6} /> Carga masiva
              </button>
            </div>
          </div>

          {seg === 'manual' ? (
            <ManualEditor
              values={values}
              errors={manualErrors}
              isColorGroup={isColorGroup}
              updateValue={updateValue}
              removeValue={removeValue}
              addValue={addValue}
              openPicker={(id) => setPickerFor(id)}
            />
          ) : (
            <BulkEditor
              text={bulkText}
              setText={setBulkText}
              parsed={bulkParsed}
              isColorGroup={isColorGroup}
              onApply={() => {
                const newRows = bulkParsed.filter((p) => !p.err).map((p) => ({ id: nextId(), code: p.code, name: p.name, hex: '' }))
                if (newRows.length) { setValues(newRows); setSeg('manual'); setBulkText('') }
              }}
            />
          )}
        </div>
      </div>

      <PanelFoot
        valuesCount={valuesCount}
        nameOk={!!name.trim()}
        codeOk={!!code.trim()}
        hasErrors={hasErrors}
        isValid={isValid}
        isEdit={isEdit}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      {confirmCancel ? (
        <div className="va-confirm-overlay" onClick={() => setConfirmCancel(false)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="va-confirm-icon"><IconAlertTriangle size={22} stroke={1.6} /></div>
            <div className="va-confirm-title">¿Estás seguro que querés cancelar?</div>
            <div className="va-confirm-body">Se perderán los datos cargados de este agrupador.</div>
            <div className="va-confirm-actions">
              <button type="button" className="va-btn va-btn-secondary" onClick={() => setConfirmCancel(false)}>Seguir editando</button>
              <button type="button" className="va-btn va-btn-danger" onClick={onClose}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      ) : null}

      {pickerFor && pickerValue ? (
        <ColorPicker
          initialHex={pickerValue.hex}
          onConfirm={(hex) => { updateValue(pickerFor, { hex }); setPickerFor(null) }}
          onClose={() => setPickerFor(null)}
        />
      ) : null}
    </aside>
  )
}

function PanelFoot({ valuesCount, nameOk, codeOk, hasErrors, isValid, isEdit, onCancel, onSubmit }) {
  let status
  let statusClass
  if (hasErrors) { status = 'Hay valores con errores o duplicados'; statusClass = 'is-warn' } else if (!codeOk || !nameOk) { status = 'Completá código y nombre'; statusClass = 'is-warn' } else if (!valuesCount) { status = 'Agregá al menos un valor'; statusClass = 'is-warn' } else { status = `Listo: ${valuesCount} ${valuesCount === 1 ? 'valor' : 'valores'} a guardar`; statusClass = 'is-ready' }
  return (
    <div className="va-panel-foot">
      <div className={`va-status ${statusClass}`}><span className="va-dot" />{status}</div>
      <div className="va-actions">
        <button type="button" className="va-btn va-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" disabled={!isValid} onClick={onSubmit}>
          <IconCheck size={16} stroke={1.6} /> {isEdit ? 'Guardar cambios' : 'Crear agrupador'}
        </button>
      </div>
    </div>
  )
}

function ManualEditor({ values, errors, isColorGroup, updateValue, removeValue, addValue, openPicker }) {
  if (values.length === 0) {
    return (
      <div className="va-values-empty">
        <div className="va-glyph"><IconTags size={20} stroke={1.6} /></div>
        <div className="va-ttl">Aún no hay valores cargados</div>
        <div className="va-sub">Agregá al menos un valor para que el agrupador pueda usarse al crear variantes.</div>
        <button type="button" className="va-btn va-btn-soft va-btn-sm" onClick={addValue} style={{ marginTop: 8 }}>
          <IconPlus size={14} stroke={1.6} /> Agregar primer valor
        </button>
      </div>
    )
  }
  return (
    <>
      {isColorGroup ? (
        <div className="va-values-list-header">
          <span>Código</span>
          <span>Nombre</span>
          <span>HEX</span>
        </div>
      ) : null}
      <div className="va-values-list">
        {values.map((v, idx) => (
          <ValueRow
            key={v.id}
            value={v}
            idx={idx}
            error={errors[v.id]}
            isColorGroup={isColorGroup}
            onChangeName={(name) => updateValue(v.id, { name })}
            onChangeCode={(code) => updateValue(v.id, { code: code.toUpperCase().slice(0, 8) })}
            onChangeHex={(hex) => updateValue(v.id, { hex })}
            onRemove={() => removeValue(v.id)}
            onOpenPicker={() => openPicker(v.id)}
          />
        ))}
      </div>
      <button type="button" className="va-add-value-btn" onClick={addValue} style={{ marginTop: 10 }}>
        <IconPlus size={14} stroke={1.6} /> Agregar valor
      </button>
    </>
  )
}

function ValueRow({ value, idx, error, isColorGroup, onChangeName, onChangeCode, onChangeHex, onRemove, onOpenPicker }) {
  return (
    <div>
      <div className={`va-value-row ${isColorGroup ? 'is-color' : ''} ${!value.name ? 'is-empty' : ''} ${error ? 'has-error' : ''}`}>
        <input className="va-vcode" value={value.code} onChange={(e) => onChangeCode(e.target.value)} placeholder="COD" title="Código" />
        <input
          className="va-vname"
          value={value.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={isColorGroup ? `Color ${idx + 1}` : `Valor ${idx + 1}`}
          autoFocus={idx === 0 && !value.name}
        />
        {isColorGroup ? (
          <div className="va-vhex-wrap">
            <button type="button" className="va-vswatch" onClick={onOpenPicker} title="Abrir selector de color" style={{ background: value.hex || '#e3e4ec' }} />
            <input className="va-vhex" value={value.hex} onChange={(e) => onChangeHex(e.target.value.toUpperCase())} placeholder="#______" maxLength={7} />
          </div>
        ) : null}
        <button type="button" className="va-btn-icon va-vremove" onClick={onRemove} title="Quitar">
          <IconX size={14} stroke={1.6} />
        </button>
      </div>
      {error ? <div className="va-row-error"><IconAlertTriangle size={12} stroke={1.6} /> {error}</div> : null}
    </div>
  )
}

function BulkEditor({ text, setText, parsed, isColorGroup, onApply }) {
  const errCount = parsed.filter((p) => p.err).length
  const okCount = parsed.length - errCount
  return (
    <div className="va-bulk">
      <div className="va-alert info">
        <IconInfoCircle size={14} stroke={1.6} className="va-ico" />
        <div>
          <b>Formato:</b> <code>COD-VALOR, COD-VALOR</code><br />
          Separá pares con coma o salto de línea. No se permiten códigos ni valores duplicados.
          {isColorGroup ? <><br /><b>Tip:</b> después de confirmar vas a poder asignar el HEX a cada color desde la lista.</> : null}
        </div>
      </div>
      <textarea
        className="va-textarea va-bulk-textarea"
        placeholder={'110-110V, 220-220V, 240-240V\n\no uno por línea:\nORI-Original\nLIG-Light\nZER-Zero'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="va-bulk-preview">
        <div className="va-ph">
          <span>
            Vista previa <b>({parsed.length})</b>
            {okCount > 0 ? <span style={{ color: 'var(--va-success-700)' }}> · {okCount} válido{okCount > 1 ? 's' : ''}</span> : null}
            {errCount > 0 ? <span style={{ color: 'var(--va-danger-700)' }}> · {errCount} con error</span> : null}
          </span>
          {okCount > 0 && errCount === 0 ? (
            <button type="button" className="va-btn va-btn-soft va-btn-xs" onClick={onApply}>
              <IconCheck size={12} stroke={1.6} /> Confirmar y editar
            </button>
          ) : null}
        </div>
        {parsed.length === 0 ? (
          <div className="va-bulk-empty">A medida que escribís vas a ver aquí cómo quedan los valores.</div>
        ) : (
          <div className="va-bulk-chips">
            {parsed.map((p, i) => (
              <span key={i} className={`va-bulk-chip ${p.err ? 'is-dup' : ''}`} title={p.err || `${p.code} — ${p.name}`}>
                {p.code ? <span className="va-vcode-mini">{p.code}</span> : null}
                <span>{p.name}</span>
                {p.err ? <IconAlertTriangle size={11} stroke={1.6} /> : null}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
