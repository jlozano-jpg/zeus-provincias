import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconSearch, IconFileImport, IconPlus,
  IconPencil, IconTrash, IconArrowsSort,
  IconArrowUp, IconArrowDown, IconDotsVertical, IconSettings,
} from '@tabler/icons-react'

const SORTERS = {
  code: (r) => r.id,
  name: (r) => r.name,
}

export default function AgrupadoresGrid({
  rows, query, setQuery, searchInputRef,
  onNewClick, onImportClick, onRowClick, onEdit, onDelete, selectedId,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = !q ? rows : rows.filter((x) =>
      x.id.toLowerCase().includes(q) ||
      x.name.toLowerCase().includes(q) ||
      x.desc.toLowerCase().includes(q)
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
  }, [rows, query, sort])

  return (
    <div className="va-main">
      <div className="va-toolbar">
        <div className="va-search">
          <IconSearch size={16} stroke={1.6} className="va-ico" />
          <input
            ref={searchInputRef}
            placeholder="Buscar por nombre, código o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button type="button" className="va-btn va-btn-secondary" onClick={onImportClick}>
            <IconFileImport size={16} stroke={1.6} /> Importar
          </button>
          <button type="button" className="va-btn va-btn-primary" onClick={onNewClick}>
            <IconPlus size={16} stroke={1.6} /> Nuevo agrupador
          </button>
        </div>
      </div>

      <div className="va-card">
        <div className="va-card-scroll">
          <table className="va-grid">
            <thead>
              <tr>
                <th className="va-col-code"><SortHeader label="Código" sortKey="code" sort={sort} onSort={toggleSort} /></th>
                <th><SortHeader label="Nombre y descripción" sortKey="name" sort={sort} onSort={toggleSort} /></th>
                <th>Valores</th>
                <th className="va-col-actions">
                  <button type="button" className="va-btn-icon va-header-gear" title="Configurar columnas" aria-label="Configurar columnas">
                    <IconSettings size={15} stroke={1.6} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Row
                  key={r.id}
                  row={r}
                  selected={r.id === selectedId}
                  onClick={() => onRowClick(r)}
                  onEdit={() => onEdit(r)}
                  onDelete={() => onDelete(r)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="va-empty-cell">No se encontraron agrupadores</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SortHeader({ label, sortKey, sort, onSort, align }) {
  const isActive = sort.key === sortKey
  const Icon = isActive ? (sort.dir === 'asc' ? IconArrowUp : IconArrowDown) : IconArrowsSort
  return (
    <button
      type="button"
      className={`va-sort-btn ${isActive ? 'is-active' : ''}`}
      style={align === 'right' ? { justifyContent: 'flex-end' } : undefined}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <Icon size={12} stroke={1.8} />
    </button>
  )
}

function Row({ row, onClick, onEdit, onDelete, selected }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <tr onClick={onClick} className={selected ? 'is-selected' : ''} style={{ cursor: 'pointer' }}>
      <td className="va-col-code">{row.id}</td>
      <td className="va-name-cell">
        <div className="va-name">{row.name}</div>
        <div className="va-desc">{row.desc}</div>
      </td>
      <td>
        <ValuesPreview values={row.values} />
      </td>
      <td className="va-col-actions">
        <div className="va-row-menu-wrap" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="va-btn-icon"
            title="Más acciones"
            aria-label="Más acciones"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <IconDotsVertical size={16} stroke={1.6} />
          </button>
          {menuOpen && (
            <div className="va-row-menu">
              <button type="button" className="va-row-menu-item" onClick={() => { setMenuOpen(false); onEdit() }}>
                <IconPencil size={14} stroke={1.6} /> Editar
              </button>
              <button type="button" className="va-row-menu-item va-danger" onClick={() => { setMenuOpen(false); onDelete() }}>
                <IconTrash size={14} stroke={1.6} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function ValuesPreview({ values }) {
  const max = 5
  const shown = values.slice(0, max)
  const rest = values.length - shown.length
  return (
    <div className="va-values">
      {shown.map((v) => (
        <span className="va-v-chip" key={v.code} title={`${v.code} — ${v.name}`}>
          {v.swatch ? <span className="va-swatch" style={{ background: v.swatch }} /> : null}
          {v.name}
        </span>
      ))}
      {rest > 0 ? <span className="va-v-chip va-more">+{rest}</span> : null}
    </div>
  )
}
