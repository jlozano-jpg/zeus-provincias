import { useState, useRef, useEffect } from 'react'
import styles from './ProvincesList.module.css'

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

  useEffect(() => {
    return () => {
      // cleanup in case component unmounts while resizing
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
              <th />
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
                  <td className={styles.code} style={{ width: columnWidths.code }}>{String(province.code).padStart(2, '0')}</td>
                  <td className={styles.name} style={{ width: columnWidths.name }}>{province.name}</td>
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
