import { IconX, IconBuildingWarehouse } from '@tabler/icons-react'

export default function DepositoPanel({ depositos, selectedId, onSelect, onClose }) {
  return (
    <aside className="vg-side-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconBuildingWarehouse size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">Ver stock por</div>
          <div className="va-title">Depósito</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>
      <div className="va-panel-body" style={{ gap: 6 }}>
        {depositos.map((d) => (
          <button
            type="button"
            key={d.id}
            className={`vg-dep-row ${d.id === selectedId ? 'is-selected' : ''}`}
            onClick={() => { onSelect(d.id); onClose() }}
          >
            {d.nombre}
          </button>
        ))}
      </div>
    </aside>
  )
}
