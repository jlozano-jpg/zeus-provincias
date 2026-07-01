import { useState } from 'react'
import styles from './PrioridadesList.module.css'

export default function PrioridadesList({ prioridades, onCrear, onVisualizar, onEditar, onEliminar }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  const filtered = prioridades.filter(p =>
    p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.codigo).includes(searchTerm)
  )

  const closeMenu = () => setOpenMenuId(null)

  return (
    <div className={styles.wrapper} onClick={closeMenu}>
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="Buscar prioridad"
          />
        </div>
        <button className={styles.createBtn} type="button" onClick={onCrear}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear Prioridad
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.codeCol}>Código</th>
              <th>Descripción</th>
              <th className={styles.colorCol}>Color</th>
              <th className={styles.menuCol} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No se encontraron prioridades</td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} className={openMenuId === p.id ? styles.rowActive : ''}>
                <td className={`${styles.codeCol} ${styles.codeCell}`}>{p.codigo}</td>
                <td className={styles.descCell}>{p.descripcion}</td>
                <td className={styles.colorCol}>
                  <span className={styles.colorPill} style={{ background: p.color }} aria-label={`Color ${p.color}`} />
                </td>
                <td className={styles.menuCol} onClick={e => e.stopPropagation()}>
                  <div className={styles.menuContainer}>
                    <button
                      className={styles.menuBtn}
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      aria-label={`Opciones para ${p.descripcion}`}
                    >
                      ⋮
                    </button>
                    {openMenuId === p.id && (
                      <div className={styles.dropdown}>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => { onVisualizar(p); closeMenu() }}
                        >
                          Visualizar
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => { onEditar(p); closeMenu() }}
                        >
                          Editar
                        </button>
                        <button
                          className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                          onClick={() => { onEliminar(p); closeMenu() }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
