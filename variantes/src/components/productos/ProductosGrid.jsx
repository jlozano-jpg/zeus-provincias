import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconSearch, IconPlus, IconArrowsSort, IconArrowUp, IconArrowDown,
  IconAdjustmentsHorizontal, IconLayoutList, IconLayoutGrid, IconDotsVertical,
  IconPencil, IconTrash, IconSettings,
} from '@tabler/icons-react'

const SORTERS = {
  codigo: (p) => p.codigo,
  descripcion: (p) => p.descripcion,
  descripcionAdicional: (p) => p.descripcionAdicional,
}

export default function ProductosGrid({ productos, query, setQuery, searchInputRef, onNewClick, onRowClick, onEdit, onDelete }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [view, setView] = useState('list')

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = !q ? productos : productos.filter((p) =>
      p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)
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
  }, [productos, query, sort])

  return (
    <div className="va-main">
      <div className="va-toolbar">
        <div className="va-search">
          <IconSearch size={16} stroke={1.6} className="va-ico" />
          <input
            ref={searchInputRef}
            placeholder="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="button" className="va-btn-icon va-filter-btn" title="Filtros" aria-label="Filtros">
          <IconAdjustmentsHorizontal size={16} stroke={1.6} />
        </button>
        <div className="pr-view-toggle">
          <button
            type="button"
            className={`pr-view-btn ${view === 'list' ? 'is-active' : ''}`}
            title="Vista en lista"
            aria-label="Vista en lista"
            onClick={() => setView('list')}
          >
            <IconLayoutList size={16} stroke={1.6} />
          </button>
          <button
            type="button"
            className={`pr-view-btn ${view === 'grid' ? 'is-active' : ''}`}
            title="Vista en cuadrícula"
            aria-label="Vista en cuadrícula"
            onClick={() => setView('grid')}
          >
            <IconLayoutGrid size={16} stroke={1.6} />
          </button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button type="button" className="va-btn va-btn-primary" onClick={onNewClick}>
            <IconPlus size={16} stroke={1.6} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="va-card">
        <div className="va-card-scroll">
          <table className="va-grid">
            <thead>
              <tr>
                <th><SortHeader label="Código de Producto" sortKey="codigo" sort={sort} onSort={toggleSort} /></th>
                <th><SortHeader label="Descripción" sortKey="descripcion" sort={sort} onSort={toggleSort} /></th>
                <th><SortHeader label="Descripción Adicional" sortKey="descripcionAdicional" sort={sort} onSort={toggleSort} /></th>
                <th className="va-col-actions">
                  <button type="button" className="va-btn-icon va-header-gear" title="Configurar columnas" aria-label="Configurar columnas">
                    <IconSettings size={15} stroke={1.6} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <Row key={p.codigo} producto={p} onClick={() => onRowClick(p)} onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="va-empty-cell">No se encontraron productos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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

function Row({ producto, onClick, onEdit, onDelete }) {
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
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td className="pr-cell-strong">{producto.codigo}</td>
      <td>{producto.descripcion || '-'}</td>
      <td className="pr-cell-muted">{producto.descripcionAdicional || '-'}</td>
      <td className="va-col-actions">
        <div className="va-row-menu-wrap" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="va-btn-icon" title="Más acciones" aria-label="Más acciones" onClick={() => setMenuOpen((v) => !v)}>
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
