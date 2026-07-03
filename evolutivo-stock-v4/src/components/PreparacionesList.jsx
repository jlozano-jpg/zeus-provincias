import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import PreparacionesFilterPanel, { buildEmptyFilters } from './PreparacionesFilterPanel'
import styles from './PreparacionesList.module.css'

const COLUMNS = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'origen', label: 'Origen' },
  { key: 'comprobante', label: 'Comprobante' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'preparador', label: 'Preparador' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'estado', label: 'Estado' },
  { key: 'avance', label: 'Avance' },
  { key: 'transporte', label: 'Transporte' },
  { key: 'zona', label: 'Zona' },
]

const KANBAN_COLUMNS = [
  { id: 'Sin Asignar',        color: '#C2D6D8' },
  { id: 'Pendiente',          color: '#8833B8' },
  { id: 'En Proceso',         color: '#00CDCD' },
  { id: 'Control Pendiente',  color: '#F5A623' },
  { id: 'Control en Proceso', color: '#3370AC' },
  { id: 'Control Finalizado', color: '#00A3A3' },
  { id: 'Finalizado',         color: '#335477' },
]

const resolvePrioridad = (valor, prioridades) => {
  if (valor == null || valor === '') return null
  const byCode = prioridades.find(p => String(p.codigo) === String(valor))
  if (byCode) return byCode
  const v = String(valor).toUpperCase()
  return prioridades.find(p => p.descripcion.toUpperCase().includes(v)) ?? null
}

const renderPrioridadPill = (valor, prioridades) => {
  const p = resolvePrioridad(valor, prioridades)
  if (!p) return valor ?? null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '3px 20px', borderRadius: '20px',
      border: `2px solid ${p.color}`, color: p.color,
      fontSize: '12px', fontWeight: '700', background: 'transparent', lineHeight: '1.4',
    }}>
      {p.codigo}
    </span>
  )
}

const GEAR_SVG = (
  <svg className={styles.menuHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Configuración">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const EDIT_PREPARADOR_ESTADOS = new Set(['Sin Asignar', 'Pendiente', 'En Proceso'])
const IMPRIMIR_ESTADOS        = new Set(['En Proceso', 'Control Pendiente'])

function menuVisibility(estado) {
  return {
    editPreparador: EDIT_PREPARADOR_ESTADOS.has(estado),
    editPrioridad:  estado !== 'Finalizado',
    generarReporte: estado === 'Pendiente',
    imprimirReporte: IMPRIMIR_ESTADOS.has(estado),
  }
}

const PRIORIDADES_EDIT = [
  { value: 'Alta',  bg: '#FFE5E5', color: '#C82828' },
  { value: 'Media', bg: '#FFF8E5', color: '#B87400' },
  { value: 'Baja',  bg: '#E5FAE5', color: '#1A7A1A' },
]

function MenuItems({ preparacion, close, operarios, onSaveEdit, onView, onDelete, onGenerateReport, onPrintReport }) {
  const [editMode, setEditMode] = useState(null)
  const [selectedVal, setSelectedVal] = useState('')
  const v = menuVisibility(preparacion.estado)
  const preparadores = (operarios ?? []).filter(o => o.preparador)

  const startEdit = (mode) => {
    setSelectedVal(mode === 'preparador' ? (preparacion.preparador ?? '') : (preparacion.prioridad ?? ''))
    setEditMode(mode)
  }

  const handleSave = (e) => {
    e.stopPropagation()
    onSaveEdit(preparacion.id, editMode === 'preparador' ? { preparador: selectedVal } : { prioridad: selectedVal })
    close()
  }

  if (editMode) {
    return (
      <div className={styles.inlineEdit}>
        <button className={styles.inlineBackBtn} onClick={(e) => { e.stopPropagation(); setEditMode(null) }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          {editMode === 'preparador' ? 'Editar Preparador' : 'Editar Prioridad'}
        </button>

        {editMode === 'preparador' ? (
          <div className={styles.inlineOptionsList}>
            {preparadores.map(op => (
              <label key={op.id} className={`${styles.inlineOption} ${selectedVal === op.name ? styles.inlineOptionSelected : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedVal(op.name) }}>
                <input type="radio" name="prep-inline" value={op.name} checked={selectedVal === op.name} onChange={() => setSelectedVal(op.name)} className={styles.inlineRadio} />
                <span className={styles.inlineCode}>{op.code}</span>
                <span className={styles.inlineName}>{op.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className={styles.inlinePrioridadGroup}>
            {PRIORIDADES_EDIT.map(({ value, bg, color }) => (
              <button key={value} type="button"
                className={`${styles.inlinePrioridadBtn} ${selectedVal === value ? styles.inlinePrioridadBtnActive : ''}`}
                style={selectedVal === value ? { background: bg, color, borderColor: color } : {}}
                onClick={(e) => { e.stopPropagation(); setSelectedVal(value) }}
              >
                {value}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inlineFooter}>
          <button className={styles.inlineCancelBtn} onClick={(e) => { e.stopPropagation(); setEditMode(null) }}>Cancelar</button>
          <button className={styles.inlineSaveBtn} onClick={handleSave} disabled={!selectedVal}>Guardar</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onView(preparacion); close() }}>
        <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
        </svg>
        Visualizar
      </button>

      {v.editPreparador && (
        <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); startEdit('preparador') }}>
          <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          Editar Preparador
        </button>
      )}

      {v.editPrioridad && (
        <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); startEdit('prioridad') }}>
          <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
          Editar Prioridad
        </button>
      )}

      <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={(e) => { e.stopPropagation(); onDelete(preparacion); close() }}>
        <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6M14 11v6" />
        </svg>
        Eliminar
      </button>

      {v.generarReporte && (
        <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onGenerateReport(preparacion); close() }}>
          <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
          </svg>
          Generar Reporte
        </button>
      )}

      {v.imprimirReporte && (
        <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onPrintReport(preparacion); close() }}>
          <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
            <rect x="6" y="14" width="12" height="8" rx="1"/>
          </svg>
          Imprimir Reporte
        </button>
      )}
    </>
  )
}

function RowMenu({ preparacion, openMenuId, setOpenMenuId, operarios, onSaveEdit, onView, onDelete, onGenerateReport, onPrintReport }) {
  const close = () => setOpenMenuId(null)
  return (
    <div className={styles.menuContainer}>
      <button
        className={styles.menuBtn}
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === preparacion.id ? null : preparacion.id) }}
        title="Opciones"
        aria-label={`Menú de opciones para ${preparacion.codigo || 'preparación'}`}
      >
        ⋮
      </button>
      {openMenuId === preparacion.id && (
        <div className={styles.dropdown}>
          <MenuItems preparacion={preparacion} close={close} operarios={operarios} onSaveEdit={onSaveEdit} onView={onView} onDelete={onDelete} onGenerateReport={onGenerateReport} onPrintReport={onPrintReport} />
        </div>
      )}
    </div>
  )
}

function KanbanCardMenu({ preparacion, openMenuId, setOpenMenuId, operarios, onSaveEdit, onView, onDelete, onGenerateReport, onPrintReport }) {
  const btnRef = useRef(null)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })
  const isOpen = openMenuId === preparacion.id
  const close = () => setOpenMenuId(null)

  const handleToggle = (e) => {
    e.stopPropagation()
    if (isOpen) {
      setOpenMenuId(null)
    } else {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
      setOpenMenuId(preparacion.id)
    }
  }

  return (
    <div className={styles.menuContainer}>
      <button ref={btnRef} className={styles.menuBtn} onClick={handleToggle} title="Opciones">⋮</button>
      {isOpen && createPortal(
        <div
          className={styles.dropdown}
          style={{ position: 'fixed', top: dropPos.top, right: dropPos.right, left: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItems preparacion={preparacion} close={close} operarios={operarios} onSaveEdit={onSaveEdit} onView={onView} onDelete={onDelete} onGenerateReport={onGenerateReport} onPrintReport={onPrintReport} />
        </div>,
        document.body
      )}
    </div>
  )
}

export default function PreparacionesList({ preparaciones, searchTerm, onSearchChange, operarios, onSaveEdit, onView, onDelete, onCreate, onGenerateReport, onPrintReport, onRowClick, prioridades = [] }) {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState(buildEmptyFilters)

  const hasActiveFilters = (() => {
    const defaults = buildEmptyFilters()
    return Object.entries(filters).some(([k, v]) => {
      if (k === 'preparadores') return (v ?? []).length > 0
      if (k === 'fechaDesde' || k === 'fechaHasta') return v !== defaults[k]
      return v !== ''
    })
  })()

  const parseDateDMY = (str) => {
    if (!str) return null
    const [d, m, y] = str.split(/[\/\-]/).map(Number)
    if (!d || !m || !y) return null
    return new Date(y, m - 1, d)
  }

  const filteredByPanel = preparaciones.filter(p => {
    if (filters.fechaDesde) {
      const from = parseDateDMY(filters.fechaDesde)
      const val  = parseDateDMY(p.fecha)
      if (from && val && val < from) return false
    }
    if (filters.fechaHasta) {
      const to  = parseDateDMY(filters.fechaHasta)
      const val = parseDateDMY(p.fecha)
      if (to && val && val > to) return false
    }
    if (filters.origen && String(p.origen ?? '') !== filters.origen) return false
    if (filters.comprobanteDesde) {
      const comp = p.numeroPreparacion ?? p.comprobante ?? ''
      if (comp < filters.comprobanteDesde) return false
    }
    if (filters.comprobanteHasta) {
      const comp = p.numeroPreparacion ?? p.comprobante ?? ''
      if (comp > filters.comprobanteHasta) return false
    }
    if (filters.sucursal && String(p.sucursal ?? '') !== filters.sucursal) return false
    if (filters.deposito && String(p.deposito ?? '') !== filters.deposito) return false
    if ((filters.preparadores ?? []).length > 0) {
      if (!filters.preparadores.some(name => String(p.preparador ?? '').includes(name))) return false
    }
    if (filters.prioridad && String(p.prioridad ?? '').toLowerCase() !== filters.prioridad.toLowerCase()) return false
    if (filters.estado && String(p.estado ?? '') !== filters.estado) return false
    if (filters.transporte && String(p.transporte ?? '') !== filters.transporte) return false
    if (filters.zona && String(p.zona ?? '') !== filters.zona) return false
    if (filters.cliente) {
      const match = (p.clientes ?? []).some(c => c.razonSocial === filters.cliente)
      if (!match) return false
    }
    return true
  })

  const formatCell = (preparacion, column) => {
    if (column.key === 'preparador') return <span className={styles.verDetallePill}>Ver detalle</span>
    if (column.key === 'comprobante') return preparacion.numeroPreparacion ?? preparacion.comprobante ?? ''
    if (column.key === 'prioridad') return renderPrioridadPill(preparacion.prioridad, prioridades)
    const value = preparacion[column.key]
    if (column.key === 'avance') return value === '' || value === null || value === undefined ? '' : `${value}%`
    return value ?? ''
  }

  const menuProps = { openMenuId, setOpenMenuId, operarios, onSaveEdit, onView, onDelete, onGenerateReport, onPrintReport }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar preparación"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            aria-label="Buscar preparación"
          />
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={`${styles.filterBtn} ${hasActiveFilters ? styles.filterBtnActive : ''}`}
            title="Filtros"
            aria-label="Filtros"
            onClick={() => setShowFilterPanel(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
              <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
              <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
              <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
            </svg>
            {hasActiveFilters && <span className={styles.filterDot} />}
          </button>

          <div className={styles.viewToggleGroup} role="group" aria-label="Cambiar vista">
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista lista"
              aria-label="Vista lista"
              aria-pressed={viewMode === 'list'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'kanban' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Vista Kanban"
              aria-label="Vista Kanban"
              aria-pressed={viewMode === 'kanban'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="5" height="18" rx="1" />
                <rect x="9.5" y="3" width="5" height="18" rx="1" />
                <rect x="17" y="3" width="5" height="18" rx="1" />
              </svg>
            </button>
          </div>

          <button type="button" className={styles.newBtn} onClick={onCreate}>
            <svg className={styles.newIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva Preparación
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map(column => <th key={column.key}>{column.label}</th>)}
                <th>{GEAR_SVG}</th>
              </tr>
            </thead>
            <tbody>
              {filteredByPanel.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className={styles.empty}>
                    No hay preparaciones para mostrar
                  </td>
                </tr>
              ) : (
                filteredByPanel.map(preparacion => (
                  <tr key={preparacion.id} className={styles.clickableRow} onClick={() => onRowClick?.(preparacion)}>
                    {COLUMNS.map(column => <td key={column.key}>{formatCell(preparacion, column)}</td>)}
                    <td className={styles.menuCell} onClick={(e) => e.stopPropagation()}>
                      <RowMenu preparacion={preparacion} {...menuProps} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className={styles.kanbanContainer}>
          {KANBAN_COLUMNS.map(col => {
            const cards = filteredByPanel.filter(p => (p.estado ?? 'Sin Asignar') === col.id)
            return (
              <div key={col.id} className={styles.kanbanColumn}>
                <div className={styles.kanbanColumnHeader} style={{ borderLeftColor: col.color }}>
                  <span>{col.id}</span>
                  <span className={styles.kanbanColumnCount}>{cards.length}</span>
                </div>
                <div className={styles.kanbanColumnBody}>
                  {cards.length === 0 ? (
                    <div className={styles.kanbanEmpty}>Sin preparaciones</div>
                  ) : (
                    cards.map(prep => {
                      const avance = prep.avance ?? 0
                      return (
                        <div
                          key={prep.id}
                          className={styles.kanbanCard}
                        >
                          <div className={styles.kanbanCardHeader}>
                            <span className={styles.kanbanCardNum}>
                              #{prep.numeroPreparacion ?? prep.comprobante}
                            </span>
                            <KanbanCardMenu preparacion={prep} {...menuProps} />
                          </div>
                          <span className={styles.kanbanCardFecha}>{prep.fecha}</span>
                          {prep.origen && (
                            <span className={styles.kanbanCardOrigen}>{prep.origen}</span>
                          )}
                          <div className={styles.kanbanCardFooter}>
                            {prep.prioridad && renderPrioridadPill(prep.prioridad, prioridades)}
                            <span className={styles.kanbanCardAvance}>{avance}%</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showFilterPanel && (
        <PreparacionesFilterPanel
          filters={filters}
          allPreparaciones={preparaciones}
          operarios={operarios}
          onApply={setFilters}
          onClose={() => setShowFilterPanel(false)}
        />
      )}
    </div>
  )
}
