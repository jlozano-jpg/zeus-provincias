import { useState, useRef, useEffect } from 'react'
import styles from './ProvincesList.module.css'

const CONFIGURABLE_COLS = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Provincia' },
]

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export default function ProvincesList({ provinces, searchTerm, onSearchChange, onView, onEdit, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [sortBy, setSortBy] = useState('code')
  const [sortDirection, setSortDirection] = useState('asc')
  const scrollContainerRef = useRef(null)

  const [columnWidths, setColumnWidths] = useState({ code: 100, name: 320 })
  const resizingRef = useRef(null)
  const onMoveRef = useRef(null)
  const onUpRef = useRef(null)

  const [colsVisible, setColsVisible] = useState({ code: true, name: true })
  const [colsMenuOpen, setColsMenuOpen] = useState(false)
  const gearRef = useRef(null)

  useEffect(() => {
    if (!colsMenuOpen) return
    const handler = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) setColsMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [colsMenuOpen])

  const vis = (key) => colsVisible[key]
  const toggleCol = (key) => setColsVisible(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    return () => {
      if (onMoveRef.current) document.removeEventListener('mousemove', onMoveRef.current)
      if (onUpRef.current) document.removeEventListener('mouseup', onUpRef.current)
      document.body.style.userSelect = 'auto'
    }
  }, [])

  const initResize = (field, e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = columnWidths[field]
    resizingRef.current = { field, startX, startWidth }

    onMoveRef.current = (ev) => {
      if (!resizingRef.current) return
      const { field: f, startX: sX, startWidth: sW } = resizingRef.current
      const delta = ev.clientX - sX
      setColumnWidths((prev) => ({ ...prev, [f]: Math.max(50, Math.round(sW + delta)) }))
    }

    onUpRef.current = () => {
      resizingRef.current = null
      if (onMoveRef.current) document.removeEventListener('mousemove', onMoveRef.current)
      if (onUpRef.current) document.removeEventListener('mouseup', onUpRef.current)
      document.body.style.userSelect = 'auto'
    }

    document.addEventListener('mousemove', onMoveRef.current)
    document.addEventListener('mouseup', onUpRef.current)
    document.body.style.userSelect = 'none'
  }

  const sortedProvinces = [...provinces].sort((a, b) => {
    if (sortBy === 'code') {
      return sortDirection === 'asc'
        ? a.code - b.code
        : b.code - a.code
    }

    const result = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    return sortDirection === 'asc' ? result : -result
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(field)
    setSortDirection('asc')
  }

  const getSortIndicator = (field) => {
    if (sortBy !== field) {
      return '↕'
    }
    return sortDirection === 'asc' ? '▲' : '▼'
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Provincias</h1>
      </header>

      <div className={styles.searchBox}>
        <div className={styles.searchField}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar provincia"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            autoFocus
            aria-label="Buscar provincia"
          />
        </div>
      </div>

      <div className={styles.tableContainer} ref={scrollContainerRef}>
        <table className={styles.table}>
          <thead>
            <tr>
              {vis('code') && (
                <th style={{ width: columnWidths.code }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`${styles.columnHeader} ${sortBy === 'code' ? styles.activeHeader : ''}`}
                      onClick={() => handleSort('code')}
                      aria-sort={sortBy === 'code' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Código <span className={styles.sortIndicator}>{getSortIndicator('code')}</span>
                    </button>
                    <div
                      className={styles.resizer}
                      onMouseDown={(e) => initResize('code', e)}
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Redimensionar columna código"
                    />
                  </div>
                </th>
              )}
              {vis('name') && (
                <th style={{ width: columnWidths.name }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`${styles.columnHeader} ${sortBy === 'name' ? styles.activeHeader : ''}`}
                      onClick={() => handleSort('name')}
                      aria-sort={sortBy === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Provincia <span className={styles.sortIndicator}>{getSortIndicator('name')}</span>
                    </button>
                    <div
                      className={styles.resizer}
                      onMouseDown={(e) => initResize('name', e)}
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Redimensionar columna provincia"
                    />
                  </div>
                </th>
              )}
              <th className={styles.menuCol}>
                <div ref={gearRef} className={styles.gearWrap}>
                  <button
                    type="button"
                    className={styles.gearBtn}
                    onClick={() => setColsMenuOpen(o => !o)}
                    aria-label="Configurar columnas visibles"
                    title="Columnas visibles"
                  >
                    <GearIcon />
                  </button>
                  {colsMenuOpen && (
                    <div className={styles.colsMenu}>
                      <div className={styles.colsMenuHeader}>Columnas visibles</div>
                      {CONFIGURABLE_COLS.map(col => (
                        <label key={col.key} className={styles.colsMenuItem}>
                          <input
                            type="checkbox"
                            checked={colsVisible[col.key]}
                            onChange={() => toggleCol(col.key)}
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProvinces.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.empty}>
                  No se encontraron provincias
                </td>
              </tr>
            ) : (
              sortedProvinces.map((province) => (
                <tr
                  key={province.id}
                  className={hoveredId === province.id ? styles.rowHovered : ''}
                  onMouseEnter={() => setHoveredId(province.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {vis('code') && <td className={styles.code} style={{ width: columnWidths.code }}>{String(province.code).padStart(2, '0')}</td>}
                  {vis('name') && <td className={styles.name} style={{ width: columnWidths.name }}>{province.name}</td>}
                  <td className={styles.menuCell}>
                    <div className={styles.menuContainer}>
                      <button
                        className={styles.menuBtn}
                        onClick={() => setOpenMenuId(openMenuId === province.id ? null : province.id)}
                        title="Opciones"
                        aria-label={`Menú de opciones para ${province.name}`}
                      >
                        ⋮
                      </button>
                      {openMenuId === province.id && (
                        <div className={styles.dropdown}>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => {
                              onView(province)
                              setOpenMenuId(null)
                            }}
                          >
                            <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Visualizar
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => {
                              onEdit(province)
                              setOpenMenuId(null)
                            }}
                          >
                            <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p>{sortedProvinces.length} provincias encontradas</p>
      </div>
    </div>
  )
}
