import { useState } from 'react'
import {
  IconSparkles, IconTrash, IconPlus,
  IconAlertTriangle, IconVersions, IconCheck,
} from '@tabler/icons-react'
import AgrupadorSelectorPanel from './AgrupadorSelectorPanel'

function getAgrupador(agrupadores, id) {
  return agrupadores.find((a) => a.id === id)
}

export default function VariantesTab({ agrupadores, variantes, setVariantes }) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [selectorOpen, setSelectorOpen] = useState(false)

  const { seleccion, priceMode } = variantes
  const hasEmpty = seleccion.some((s) => s.valuesSelected.length === 0)
  const isValid = seleccion.length > 0 && !hasEmpty
  const totalCombos = isValid ? seleccion.reduce((acc, s) => acc * s.valuesSelected.length, 1) : 0
  const available = agrupadores.filter((a) => !seleccion.some((s) => s.agrupadorId === a.id))

  function patch(fn) {
    setVariantes((v) => ({ ...v, ...fn(v) }))
  }

  function addAgrupador(agrupadorId) {
    const master = getAgrupador(agrupadores, agrupadorId)
    patch((v) => ({ seleccion: [...v.seleccion, { agrupadorId, valuesSelected: master.values.map((val) => val.code) }] }))
  }

  function addAgrupadores(ids) {
    ids.forEach(addAgrupador)
    setSelectorOpen(false)
  }

  function toggleValor(agrupadorId, code) {
    patch((v) => ({
      seleccion: v.seleccion.map((s) => {
        if (s.agrupadorId !== agrupadorId) return s
        const has = s.valuesSelected.includes(code)
        return { ...s, valuesSelected: has ? s.valuesSelected.filter((c) => c !== code) : [...s.valuesSelected, code] }
      }),
    }))
  }

  function selectAll(agrupadorId) {
    const master = getAgrupador(agrupadores, agrupadorId)
    patch((v) => ({ seleccion: v.seleccion.map((s) => (s.agrupadorId === agrupadorId ? { ...s, valuesSelected: master.values.map((val) => val.code) } : s)) }))
  }

  function clearAll(agrupadorId) {
    patch((v) => ({ seleccion: v.seleccion.map((s) => (s.agrupadorId === agrupadorId ? { ...s, valuesSelected: [] } : s)) }))
  }

  function doDelete() {
    const agrupadorId = confirmDelete.agrupadorId
    patch((v) => {
      const rest = { ...v.adicionales }
      delete rest[agrupadorId]
      return { seleccion: v.seleccion.filter((s) => s.agrupadorId !== agrupadorId), adicionales: rest }
    })
    setConfirmDelete(null)
  }

  function setPriceMode(mode) {
    patch(() => ({ priceMode: mode }))
  }

  return (
    <div>
      <div className="pr-var-head">
        <div>
          <h2>Variantes</h2>
          <p>
            Agregá los <strong>agrupadores</strong> que aplican a este producto. Vienen con todos los valores
            pre-seleccionados; deseleccioná los que no correspondan.
          </p>
        </div>
        {seleccion.length > 0 && isValid && (
          <span className="pr-count-pill">
            <IconSparkles size={14} stroke={1.8} /> {totalCombos} combinaciones posibles
          </span>
        )}
      </div>

      <div className="pr-ag-list">
        {seleccion.length === 0 ? (
          <div className="va-values-empty" style={{ padding: '32px 24px' }}>
            <div className="va-glyph"><IconVersions size={20} stroke={1.6} /></div>
            <div className="va-ttl">Este producto no tiene variantes todavía</div>
            <div className="va-sub">Agregá un agrupador del maestro (Color, Talle…) y elegí qué valores aplican a este producto.</div>
            <button type="button" className="va-btn va-btn-secondary" style={{ marginTop: 12 }} onClick={() => setSelectorOpen(true)}>
              <IconPlus size={15} stroke={1.8} /> Agregar agrupador
            </button>
          </div>
        ) : (
          seleccion.map((sel, idx) => (
            <AgrupadorCard
              key={sel.agrupadorId}
              sel={sel}
              idx={idx}
              master={getAgrupador(agrupadores, sel.agrupadorId)}
              onToggleValor={(code) => toggleValor(sel.agrupadorId, code)}
              onSelectAll={() => selectAll(sel.agrupadorId)}
              onClearAll={() => clearAll(sel.agrupadorId)}
              onDelete={() => setConfirmDelete(sel)}
            />
          ))
        )}

        {seleccion.length > 0 && (
          <button type="button" className="va-btn va-btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => setSelectorOpen(true)}>
            <IconPlus size={15} stroke={1.8} /> Agregar agrupador
          </button>
        )}
      </div>

      {seleccion.length > 0 && (
        <>
          <div className="pr-divider" />
          <div className="pr-var-head" style={{ marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 14 }}>Criterio de precio</h2>
              <p>Cómo se determinará el precio de cada variante generada.</p>
            </div>
          </div>
          <div className="pr-price-options">
            <div className={`pr-radio-card ${priceMode === 'base' ? 'is-selected' : ''}`} onClick={() => setPriceMode('base')}>
              <span className="pr-radio-dot">{priceMode === 'base' && <span className="pr-radio-dot-fill" />}</span>
              <div>
                <div className="pr-radio-title">Precio del producto base</div>
                <div className="pr-radio-desc">Las variantes heredan el precio del producto base.</div>
              </div>
            </div>
            <div className={`pr-radio-card ${priceMode === 'adicional' ? 'is-selected' : ''}`} onClick={() => setPriceMode('adicional')}>
              <span className="pr-radio-dot">{priceMode === 'adicional' && <span className="pr-radio-dot-fill" />}</span>
              <div>
                <div className="pr-radio-title">Precio adicional</div>
                <div className="pr-radio-desc">Importe adicional sobre el precio del producto base.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmDelete ? (
        <div className="va-confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="va-confirm-icon va-danger"><IconTrash size={20} stroke={1.6} /></div>
            <div className="va-confirm-title">Quitar agrupador "{getAgrupador(agrupadores, confirmDelete.agrupadorId)?.name}"</div>
            <div className="va-confirm-body">
              {confirmDelete.valuesSelected.length > 0
                ? `Se quitarán ${confirmDelete.valuesSelected.length} valor${confirmDelete.valuesSelected.length === 1 ? '' : 'es'} seleccionado${confirmDelete.valuesSelected.length === 1 ? '' : 's'}. El agrupador y sus valores siguen existiendo en el maestro.`
                : 'El agrupador se quitará de este producto. Sigue disponible en el maestro.'}
            </div>
            <div className="va-confirm-actions">
              <button type="button" className="va-btn va-btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button type="button" className="va-btn va-btn-danger" onClick={doDelete}><IconTrash size={14} stroke={1.6} /> Quitar</button>
            </div>
          </div>
        </div>
      ) : null}

      {selectorOpen ? (
        <AgrupadorSelectorPanel
          available={available}
          onConfirm={addAgrupadores}
          onClose={() => setSelectorOpen(false)}
        />
      ) : null}
    </div>
  )
}

function AgrupadorCard({ sel, idx, master, onToggleValor, onSelectAll, onClearAll, onDelete }) {
  if (!master) return null
  const selectedCount = sel.valuesSelected.length
  const total = master.values.length
  const hasNoSelection = selectedCount === 0

  return (
    <div className={`va-card pr-ag-card ${hasNoSelection ? 'has-error' : ''}`} style={{ padding: 14 }}>
      <div className="pr-ag-head">
        <div className="pr-ag-num">{idx + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pr-ag-name">{master.name}</div>
          <div className="pr-ag-meta">Agrupador del maestro · {total} valores disponibles</div>
        </div>
        <span className={`pr-ag-count ${hasNoSelection ? 'is-warn' : ''}`}>{selectedCount} / {total} seleccionados</span>
        <button type="button" className="va-btn-icon va-danger" onClick={onDelete} title="Quitar agrupador del producto">
          <IconTrash size={15} stroke={1.6} />
        </button>
      </div>

      <div className="pr-ag-body">
        <div className="pr-ag-values-head">
          <div className="va-field-label" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--va-ink-700)' }}>
            Valores que aplican a este producto <span className="va-req">*</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="va-btn va-btn-ghost va-btn-xs" onClick={onSelectAll} disabled={selectedCount === total} style={{ opacity: selectedCount === total ? 0.4 : 1 }}>Todos</button>
            <button type="button" className="va-btn va-btn-ghost va-btn-xs" onClick={onClearAll} disabled={selectedCount === 0} style={{ opacity: selectedCount === 0 ? 0.4 : 1 }}>Ninguno</button>
          </div>
        </div>
        <div className="pr-ag-values">
          {master.values.map((v) => (
            <ValueChip key={v.code} valor={v} selected={sel.valuesSelected.includes(v.code)} onToggle={() => onToggleValor(v.code)} />
          ))}
        </div>
        {hasNoSelection && (
          <div className="va-row-error" style={{ marginTop: 8 }}>
            <IconAlertTriangle size={12} stroke={1.6} /> Seleccioná al menos un valor para incluir este agrupador
          </div>
        )}
      </div>
    </div>
  )
}

function ValueChip({ valor, selected, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={`pr-vchip ${selected ? 'is-on' : ''}`}>
      {valor.swatch ? <span className="pr-vchip-sw" style={{ background: valor.swatch }} /> : null}
      <span>{valor.name}</span>
      {selected ? <IconCheck size={12} stroke={2.2} /> : <span style={{ width: 10, height: 10, borderRadius: 999, border: '1.5px solid currentColor', display: 'inline-block', opacity: 0.4 }} />}
    </button>
  )
}
