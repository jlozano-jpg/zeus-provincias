import { IconX, IconMinus, IconPlus, IconCheck, IconAlertTriangle, IconArrowRight } from '@tabler/icons-react'
import VariantChips from './VariantChips'
import { fmt } from './format'

export default function DistribuirStockPanel({
  art, distFiltros, toggleDistFiltro, clearDistFiltros,
  distRows, distAsig, setAsig, distTotal, distRestante, distOver,
  onConfirm, onClose, standalone = false,
}) {
  const hasDistFiltros = Object.values(distFiltros).some((v) => v.length > 0)

  return (
    <aside className={standalone ? 'vg-flow-page' : 'vg-flow-panel'}>
      <div className="va-panel-head">
        <div className="va-ico"><IconArrowRight size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">{art.codigo}</div>
          <div className="va-title">Distribuir stock</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label={standalone ? 'Cerrar ventana' : 'Cerrar'} title={standalone ? 'Cerrar ventana' : 'Cerrar'}>
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="vg-flow-body">
        <div className="st-kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="st-kpi-card st-kpi-total">
            <div className="st-kpi-label">Disponible</div>
            <div className="st-kpi-value">{fmt(art.stockBase)}</div>
            <div className="st-kpi-sub">Stock base sin asignar</div>
          </div>
          <div className="st-kpi-card st-kpi-acopiado">
            <div className="st-kpi-label">Asignado</div>
            <div className="st-kpi-value">{fmt(distTotal)}</div>
            <div className="st-kpi-sub">En esta distribución</div>
          </div>
          <div className={`st-kpi-card ${distOver ? 'st-kpi-comprometido' : 'st-kpi-disponible'}`}>
            <div className="st-kpi-label">{distOver ? 'Excedente' : 'Sin asignar'}</div>
            <div className="st-kpi-value">{fmt(Math.abs(distRestante))}</div>
            <div className="st-kpi-sub">{distOver ? 'Ajustá las cantidades' : 'Del stock disponible'}</div>
          </div>
        </div>

        {art.groupers.length > 0 && (
          <div className="st-variant-filter">
            <div className="st-variant-filter-head">
              <span className="st-vf-icon">V</span>
              Filtrar variantes a distribuir
              {hasDistFiltros && (
                <button type="button" className="vg-clear-link" onClick={clearDistFiltros}>Limpiar filtros</button>
              )}
            </div>
            {art.groupers.map((g) => (
              <div className="st-vf-row" key={g.id}>
                <span className="st-vf-label">{g.nombre}</span>
                <div className="st-vf-chips">
                  {g.valores.map((v) => (
                    <button
                      type="button"
                      key={v.code}
                      className={`st-vf-chip ${(distFiltros[g.id] || []).includes(v.code) ? 'is-active' : ''}`}
                      onClick={() => toggleDistFiltro(g.id, v.code)}
                    >
                      {v.swatch ? <span className="st-vf-sw" style={{ background: v.swatch }} /> : null}
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {distOver && (
          <div className="vg-alert vg-alert-danger">
            <IconAlertTriangle size={15} stroke={1.9} />
            Estás asignando {fmt(Math.abs(distRestante))} unidades más que las disponibles en el artículo base. Ajustá las cantidades para confirmar.
          </div>
        )}
        {art.stockBase === 0 && !distOver && (
          <div className="vg-alert vg-alert-warn">
            <IconAlertTriangle size={15} stroke={1.9} />
            Este artículo base no tiene stock por asignar. Ingresá stock al artículo base o elegí otro de la lista.
          </div>
        )}

        <div className="va-card st-table-card">
          <div className="va-card-scroll">
            <table className="va-grid">
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Código</th>
                  <th style={{ textAlign: 'right' }}>Stock actual</th>
                  <th style={{ textAlign: 'center', width: 180 }}>A asignar</th>
                  <th style={{ textAlign: 'right' }}>Stock resultante</th>
                </tr>
              </thead>
              <tbody>
                {distRows.map((v) => {
                  const a = Number(distAsig[v.id] || 0)
                  return (
                    <tr key={v.id} className={a > 0 ? 'is-selected' : ''}>
                      <td><VariantChips groupers={art.groupers} vals={v.vals} /></td>
                      <td className="pr-cell-muted vg-mono">{v.codigo}</td>
                      <td className="st-num" style={{ textAlign: 'right' }}>{fmt(v.stock)}</td>
                      <td>
                        <div className="vg-stepper">
                          <button type="button" className="vg-stepper-btn" onClick={() => setAsig(v, a - 1)}>
                            <IconMinus size={13} stroke={2.4} />
                          </button>
                          <input value={a} onChange={(e) => setAsig(v, e.target.value)} className="vg-stepper-input" />
                          <button type="button" className="vg-stepper-btn" onClick={() => setAsig(v, a + 1)}>
                            <IconPlus size={13} stroke={2.4} />
                          </button>
                        </div>
                      </td>
                      <td className="st-saldo" style={{ textAlign: 'right' }}>{fmt(v.stock + a)}</td>
                    </tr>
                  )
                })}
                {distRows.length === 0 && (
                  <tr><td colSpan={5} className="va-empty-cell">Ninguna variante generada coincide con los filtros. Generá variantes o quitá filtros para asignar stock.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="va-panel-foot">
        <span className="pr-foot-status">
          {distTotal > 0
            ? `Se asignarán ${fmt(distTotal)} de ${fmt(art.stockBase)} unidades.`
            : 'Cargá cantidades para distribuir el stock base.'}
        </span>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" disabled={distTotal <= 0 || distOver} onClick={onConfirm}>
          <IconCheck size={15} stroke={2} /> Confirmar distribución {distTotal > 0 ? `(${fmt(distTotal)} u.)` : ''}
        </button>
      </div>
    </aside>
  )
}
