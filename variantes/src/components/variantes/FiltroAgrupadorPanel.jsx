import { IconX, IconFilter } from '@tabler/icons-react'

export default function FiltroAgrupadorPanel({ groupers, filtros, toggleFiltro, onClear, onClose }) {
  const hasFiltros = Object.values(filtros).some((v) => v.length > 0)

  return (
    <aside className="vg-side-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconFilter size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">Filtrar</div>
          <div className="va-title">Por agrupador</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="va-panel-body" style={{ gap: 20 }}>
        {groupers.map((g) => (
          <div key={g.id}>
            <div className="st-vf-label" style={{ marginBottom: 8 }}>{g.nombre}</div>
            <div className="st-vf-chips">
              {g.valores.map((v) => (
                <button
                  type="button"
                  key={v.code}
                  className={`st-vf-chip ${(filtros[g.id] || []).includes(v.code) ? 'is-active' : ''}`}
                  onClick={() => toggleFiltro(g.id, v.code)}
                >
                  {v.swatch ? <span className="st-vf-sw" style={{ background: v.swatch }} /> : null}
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="va-panel-foot">
        <span className="pr-foot-status">{hasFiltros ? 'Filtros activos' : 'Sin filtros aplicados'}</span>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClear} disabled={!hasFiltros}>
          Limpiar filtros
        </button>
        <button type="button" className="va-btn va-btn-primary" onClick={onClose}>Listo</button>
      </div>
    </aside>
  )
}
