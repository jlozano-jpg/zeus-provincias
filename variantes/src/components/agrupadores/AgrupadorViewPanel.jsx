import { IconEye, IconX, IconPencil } from '@tabler/icons-react'

export default function AgrupadorViewPanel({ row, onClose, onEdit }) {
  return (
    <aside className="va-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconEye size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">Detalle</div>
          <div className="va-title">{row.name}</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="va-panel-body">
        <div className="va-section">
          <div className="va-view-row">
            <span className="va-view-label">Código</span>
            <span className="va-view-value">{row.id}</span>
          </div>
          <div className="va-view-row">
            <span className="va-view-label">Nombre</span>
            <span className="va-view-value">{row.name}</span>
          </div>
          <div className="va-view-row">
            <span className="va-view-label">Descripción</span>
            <span className="va-view-value">{row.desc || '—'}</span>
          </div>
        </div>

        <div className="va-section">
          <div className="va-section-head">
            <div className="va-section-title">
              Valores <span className="va-values-counter"><b>{row.values.length}</b></span>
            </div>
          </div>
          <div className="va-view-values">
            {row.values.map((v) => (
              <span className="va-v-chip" key={v.code} title={`${v.code} — ${v.name}`}>
                {v.swatch ? <span className="va-swatch" style={{ background: v.swatch }} /> : null}
                {v.name}
                <span className="va-view-chip-code">{v.code}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="va-panel-foot">
        <div />
        <div className="va-actions">
          <button type="button" className="va-btn va-btn-ghost" onClick={onClose}>Cerrar</button>
          <button type="button" className="va-btn va-btn-primary" onClick={onEdit}>
            <IconPencil size={16} stroke={1.6} /> Editar
          </button>
        </div>
      </div>
    </aside>
  )
}
