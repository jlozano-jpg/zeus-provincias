import { useState } from 'react'
import { IconX } from '@tabler/icons-react'

export default function FiltroSelectorPanel({
  icon, eyebrow, title, columns, rows, selectedIds, onApply, onClose,
}) {
  const [selected, setSelected] = useState(selectedIds)

  function toggle(id) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  return (
    <aside className="st-side-panel">
      <div className="va-panel-head">
        <div className="va-ico">{icon}</div>
        <div className="va-grow">
          <div className="va-eyebrow">{eyebrow}</div>
          <div className="va-title">{title}</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="st-side-panel-body" style={{ padding: '18px 22px 22px' }}>
        <div className="va-card">
          <table className="va-grid st-selector-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const checked = selected.includes(r.id)
                return (
                  <tr key={r.id} className={checked ? 'is-selected' : ''} onClick={() => toggle(r.id)}>
                    {columns.map((c, i) => (
                      <td key={c.key} className={i === 0 ? 'pr-cell-strong' : 'pr-cell-muted'}>{r[c.key]}</td>
                    ))}
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="va-empty-cell">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="va-panel-foot">
        <div className="st-foot-status">
          {selected.length > 0 ? `${selected.length} seleccionada${selected.length === 1 ? '' : 's'}` : 'Todas'}
        </div>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" onClick={() => { onApply(selected); onClose() }}>
          Aplicar{selected.length > 0 ? ` (${selected.length})` : ''}
        </button>
      </div>
    </aside>
  )
}
