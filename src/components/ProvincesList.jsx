import { useState, useRef } from 'react'
import styles from './ProvincesList.module.css'

export default function ProvincesList({ provinces, searchTerm, onSearchChange, onView, onEdit, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const scrollContainerRef = useRef(null)

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Provincias</h1>
        <p className={styles.subtitle}>Gestión de provincias argentinas</p>
      </header>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          autoFocus
          aria-label="Buscar provincias"
        />
      </div>

      <div className={styles.tableContainer} ref={scrollContainerRef}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Provincia</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {provinces.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.empty}>
                  No se encontraron provincias
                </td>
              </tr>
            ) : (
              provinces.map((province) => (
                <tr
                  key={province.id}
                  className={hoveredId === province.id ? styles.rowHovered : ''}
                  onMouseEnter={() => setHoveredId(province.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td className={styles.code}>{String(province.code).padStart(2, '0')}</td>
                  <td className={styles.name}>{province.name}</td>
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
                            Ver
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => {
                              onEdit(province)
                              setOpenMenuId(null)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className={`${styles.dropdownItem} ${styles.deleteItem}`}
                            onClick={() => {
                              onDelete(province)
                              setOpenMenuId(null)
                            }}
                          >
                            Eliminar
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
        <p>{provinces.length} provincias encontradas</p>
      </div>
    </div>
  )
}
