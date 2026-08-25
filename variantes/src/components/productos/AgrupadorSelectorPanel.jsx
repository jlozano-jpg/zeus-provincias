import { useMemo, useState } from 'react'
import { IconSearch, IconX, IconArrowsSort, IconArrowUp, IconArrowDown } from '@tabler/icons-react'

const SORTERS = {
  id: (a) => a.id,
  name: (a) => a.name,
  valuesCount: (a) => a.values.length,
}

function valuesPreview(values) {
  const max = 5
  const shown = values.slice(0, max).map((v) => v.name).join(', ')
  const rest = values.length - max
  return rest > 0 ? `${shown}, +${rest}` : shown
}

export default function AgrupadorSelectorPanel({ available, onConfirm, onClose }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [selectedIds, setSelectedIds] = useState([])

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  function toggleSelected(id) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = !q ? available : available.filter((a) =>
      a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) ||
      a.values.some((v) => v.name.toLowerCase().includes(q))
    )
    if (!sort.key) return base
    const getValue = SORTERS[sort.key]
    const sorted = [...base].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (va < vb) return -1
      if (va > vb) return 1
      return 0
    })
    return sort.dir === 'desc' ? sorted.reverse() : sorted
  }, [available, query, sort])

  return (
    <aside className="pr-selector-panel">
      <div className="va-panel-head">
        <div className="va-grow">
          <div className="va-eyebrow">Seleccionar</div>
          <div className="va-title">Agrupadores</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="pr-selector-search">
        <div className="va-search" style={{ width: '100%' }}>
          <IconSearch size={16} stroke={1.6} className="va-ico" />
          <input
            autoFocus
            placeholder="Buscar por código, nombre o valores"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="pr-selector-body">
        {available.length === 0 ? (
          <div className="va-values-empty" style={{ padding: '32px 24px' }}>
            <div className="va-ttl">No hay más agrupadores disponibles</div>
            <div className="va-sub">Todos los agrupadores del maestro ya están asignados a este producto.</div>
          </div>
        ) : (
          <div className="va-card">
            <table className="va-grid pr-selector-table">
              <thead>
                <tr>
                  <th className="pr-col-codigo"><SortHeader label="Código" sortKey="id" sort={sort} onSort={toggleSort} /></th>
                  <th className="pr-col-nombre"><SortHeader label="Nombre" sortKey="name" sort={sort} onSort={toggleSort} /></th>
                  <th><SortHeader label="Valores" sortKey="valuesCount" sort={sort} onSort={toggleSort} /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const checked = selectedIds.includes(a.id)
                  return (
                    <tr key={a.id} className={checked ? 'is-selected' : ''} onClick={() => toggleSelected(a.id)}>
                      <td className="pr-cell-strong">{a.id}</td>
                      <td>{a.name}</td>
                      <td className="pr-cell-muted pr-valores-cell" title={a.values.map((v) => v.name).join(', ')}>
                        {valuesPreview(a.values)}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="va-empty-cell">No se encontraron agrupadores</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="va-panel-foot">
        <div className="pr-foot-status">{selectedIds.length > 0 ? `${selectedIds.length} agrupador${selectedIds.length === 1 ? '' : 'es'} seleccionado${selectedIds.length === 1 ? '' : 's'}` : ''}</div>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" disabled={selectedIds.length === 0} onClick={() => onConfirm(selectedIds)}>
          Agregar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </button>
      </div>
    </aside>
  )
}

function SortHeader({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey
  const Icon = isActive ? (sort.dir === 'asc' ? IconArrowUp : IconArrowDown) : IconArrowsSort
  return (
    <button type="button" className={`va-sort-btn ${isActive ? 'is-active' : ''}`} onClick={() => onSort(sortKey)}>
      {label}
      <Icon size={12} stroke={1.8} />
    </button>
  )
}
