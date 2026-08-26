import { IconX, IconCheck, IconSparkles } from '@tabler/icons-react'
import VariantChips from './VariantChips'

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'no', label: 'No generadas' },
  { id: 'gen', label: 'Generadas' },
]

export default function GenerarVariantesPanel({
  art, gen, no, genFiltro, setGenFiltro, genSel, setGenSel, onGenerar, onClose,
}) {
  const genList = art.variants.filter((v) => {
    if (genFiltro === 'todas') return true
    if (genFiltro === 'gen') return v.status === 'gen'
    return v.status === 'no'
  })

  function toggleSel(id) {
    setGenSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <aside className="vg-flow-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconSparkles size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">{art.codigo}</div>
          <div className="va-title">Generar variantes</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="vg-gen-toolbar">
        <div className="pr-view-toggle" style={{ width: 'auto', padding: 3 }}>
          {FILTROS.map((t) => {
            const count = t.id === 'todas' ? art.variants.length : (t.id === 'gen' ? gen.length : no.length)
            return (
              <button
                type="button"
                key={t.id}
                className={`vg-gen-tab ${genFiltro === t.id ? 'is-active' : ''}`}
                onClick={() => setGenFiltro(t.id)}
              >
                {t.label} <span className="vg-gen-tab-count">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="st-filter-spacer" />
        <button
          type="button"
          className="va-btn va-btn-secondary"
          onClick={() => setGenSel((s) => (s.length === no.length ? [] : no.map((v) => v.id)))}
        >
          {genSel.length === no.length && no.length > 0 ? 'Deseleccionar todas' : 'Seleccionar todas las no generadas'}
        </button>
      </div>

      <div className="vg-flow-body">
        <div className="va-card st-table-card">
          <div className="va-card-scroll">
            <table className="va-grid">
              <thead>
                <tr>
                  <th style={{ width: 36 }} />
                  <th>Código</th>
                  <th>Variante</th>
                  <th style={{ width: 140 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {genList.map((v) => {
                  const isNo = v.status === 'no'
                  const selected = genSel.includes(v.id)
                  return (
                    <tr
                      key={v.id}
                      className={selected ? 'is-selected' : ''}
                      style={{ cursor: isNo ? 'pointer' : 'default' }}
                      onClick={() => { if (isNo) toggleSel(v.id) }}
                    >
                      <td>
                        <span className={`vg-checkbox ${selected ? 'is-checked' : ''} ${!isNo ? 'is-disabled' : ''}`}>
                          {selected && <IconCheck size={11} stroke={3} />}
                        </span>
                      </td>
                      <td className="pr-cell-muted vg-mono">{v.codigo}</td>
                      <td><VariantChips groupers={art.groupers} vals={v.vals} /></td>
                      <td>
                        <span className={`vg-estado-pill ${isNo ? 'is-no' : 'is-gen'}`}>
                          <span className="vg-estado-dot" />{isNo ? 'No generada' : 'Generada'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {genList.length === 0 && (
                  <tr><td colSpan={4} className="va-empty-cell">No hay variantes en esta categoría</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="va-panel-foot">
        <span className="pr-foot-status">Las nuevas variantes se crean con stock 0.</span>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" disabled={!genSel.length} onClick={onGenerar}>
          <IconSparkles size={15} stroke={1.8} /> Generar {genSel.length > 0 ? `(${genSel.length})` : ''}
        </button>
      </div>
    </aside>
  )
}
