import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './DespachoList.module.css'
import RotulosPanel from './RotulosPanel'

const CONFIGURABLE_COLS = [
  { key: 'fecha',             label: 'Fecha',                   defaultWidth: 100 },
  { key: 'numeroPreparacion', label: 'Número de preparación',   defaultWidth: 170 },
  { key: 'remito',            label: 'Remito',                  defaultWidth: 100 },
  { key: 'codigo',            label: 'Código',                  defaultWidth: 80  },
  { key: 'razonSocial',       label: 'Razón Social',            defaultWidth: 180 },
  { key: 'prioridad',         label: 'Prioridad',               defaultWidth: 90  },
  { key: 'transporte',        label: 'Transporte',              defaultWidth: 110 },
  { key: 'zona',              label: 'Zona',                    defaultWidth: 90  },
  { key: 'localidad',         label: 'Localidad',               defaultWidth: 130 },
  { key: 'bulto',             label: 'Bulto',                   defaultWidth: 80  },
  { key: 'orden',             label: 'Orden',                   defaultWidth: 70  },
]

const DEFAULT_VISIBLE = Object.fromEntries(CONFIGURABLE_COLS.map(c => [c.key, true]))
const DEFAULT_WIDTHS  = Object.fromEntries(CONFIGURABLE_COLS.map(c => [c.key, c.defaultWidth]))

const INICIAL = [
  { id: 1, fecha: '02/06/2026', numeroPreparacion: 38, remito: '0001-30', codigo: '0002', razonSocial: 'CHRCER S.A.',       prioridad: 'Alta', transporte: '', zona: '', localidad: 'BAHIA BLANCA', orden: 1, domicilio: 'O HIGGINS 1331',  codigoPostal: '8000' },
  { id: 2, fecha: '02/06/2026', numeroPreparacion: 40, remito: '0001-31', codigo: '0004', razonSocial: 'MARIANO LOPEZ',      prioridad: 'Alta', transporte: '', zona: '', localidad: 'MAR DEL PLATA', orden: 2, domicilio: 'AV COLÓN 1234',   codigoPostal: '7600' },
  { id: 3, fecha: '02/06/2026', numeroPreparacion: 41, remito: '0001-32', codigo: '0001', razonSocial: 'CONSUMIDOR FINAL',   prioridad: 'Alta', transporte: '', zona: '', localidad: 'MAR DEL PLATA', orden: 3, domicilio: 'SAN MARTÍN 456',  codigoPostal: '7600' },
  { id: 4, fecha: '03/06/2026', numeroPreparacion: 42, remito: '0001-33', codigo: '0004', razonSocial: 'MARIANO LOPEZ',      prioridad: 'Alta', transporte: '', zona: '', localidad: 'MAR DEL PLATA', orden: 4, domicilio: 'MITRE 789',        codigoPostal: '7600' },
]

const resolvePrioridad = (valor, prioridades) => {
  if (valor == null || valor === '') return null
  const byCode = prioridades.find(p => String(p.codigo) === String(valor))
  if (byCode) return byCode
  const v = String(valor).toUpperCase()
  return prioridades.find(p => p.descripcion.toUpperCase().includes(v)) ?? null
}

const GEAR_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export default function DespachoList({ onRotulos, onImprimirHojaRuta, prioridades = [] }) {
  const [items, setItems] = useState(INICIAL)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bultos, setBultos] = useState(
    () => INICIAL.reduce((acc, item) => { acc[item.id] = ''; return acc }, {})
  )
  const [dragOverId, setDragOverId] = useState(null)
  const [colsVisible, setColsVisible] = useState(DEFAULT_VISIBLE)
  const [colsMenuOpen, setColsMenuOpen] = useState(false)
  const [colWidths, setColWidths] = useState(DEFAULT_WIDTHS)
  const [showRotulos, setShowRotulos] = useState(false)

  const dragId    = useRef(null)
  const gearRef   = useRef(null)
  const resizeRef = useRef(null)

  useEffect(() => {
    if (!colsMenuOpen) return
    const handler = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) setColsMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [colsMenuOpen])

  const handleResizeStart = useCallback((e, key) => {
    e.preventDefault()
    resizeRef.current = { key, startX: e.clientX, startWidth: colWidths[key] }

    const onMove = (e) => {
      if (!resizeRef.current) return
      const delta = e.clientX - resizeRef.current.startX
      const newW  = Math.max(50, resizeRef.current.startWidth + delta)
      setColWidths(prev => ({ ...prev, [resizeRef.current.key]: newW }))
    }
    const onUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [colWidths])

  const toggleCol = (key) => setColsVisible(prev => ({ ...prev, [key]: !prev[key] }))
  const vis = (key) => colsVisible[key]
  const w   = (key) => ({ width: colWidths[key], minWidth: colWidths[key] })

  const filtered = items.filter(item =>
    item.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.numeroPreparacion).includes(searchTerm) ||
    item.remito.includes(searchTerm) ||
    item.codigo.includes(searchTerm)
  )

  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id))

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map(i => i.id)))

  const handleDragStart = (id) => { dragId.current = id }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    setDragOverId(id)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const from = dragId.current
    const to = dragOverId
    if (!from || from === to) { dragId.current = null; setDragOverId(null); return }
    const next = [...items]
    const fi = next.findIndex(i => i.id === from)
    const ti = next.findIndex(i => i.id === to)
    const [moved] = next.splice(fi, 1)
    next.splice(ti, 0, moved)
    setItems(next.map((item, idx) => ({ ...item, orden: idx + 1 })))
    dragId.current = null
    setDragOverId(null)
  }

  const handleDragEnd = () => { dragId.current = null; setDragOverId(null) }

  const ResizeHandle = ({ colKey }) => (
    <div className={styles.resizeHandle} onMouseDown={e => handleResizeStart(e, colKey)} />
  )

  return (
    <>
    <div className={styles.wrapper}>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="Buscar despacho"
          />
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.filterBtn} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/>
              <line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/>
              <line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/>
              <line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/>
              <line x1="16" x2="16" y1="18" y2="22"/>
            </svg>
            Filtros
          </button>
          <button className={styles.refreshBtn} type="button" aria-label="Actualizar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
          <div className={styles.toolbarSep} />
          <button
            className={styles.rotulosBtn}
            type="button"
            onClick={() => selectedIds.size > 0 ? setShowRotulos(true) : null}
            disabled={selectedIds.size === 0}
            title={selectedIds.size === 0 ? 'Seleccioná al menos una línea' : 'Generar rótulos'}
          >Rótulos</button>
          <button className={styles.imprimirBtn} type="button" onClick={onImprimirHojaRuta}>Imprimir hoja de ruta</button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className={styles.tableContainer}>
        <table className={styles.table} style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className={styles.checkCol}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" />
              </th>
              <th className={styles.handleCol}></th>

              {vis('fecha') && (
                <th style={w('fecha')}>
                  Fecha<ResizeHandle colKey="fecha" />
                </th>
              )}
              {vis('numeroPreparacion') && (
                <th style={w('numeroPreparacion')}>
                  Número de preparación<ResizeHandle colKey="numeroPreparacion" />
                </th>
              )}
              {vis('remito') && (
                <th style={w('remito')}>
                  Remito<ResizeHandle colKey="remito" />
                </th>
              )}
              {vis('codigo') && (
                <th style={w('codigo')}>
                  Código<ResizeHandle colKey="codigo" />
                </th>
              )}
              {vis('razonSocial') && (
                <th style={w('razonSocial')}>
                  Razón Social<ResizeHandle colKey="razonSocial" />
                </th>
              )}
              {vis('prioridad') && (
                <th style={w('prioridad')}>
                  Prioridad<ResizeHandle colKey="prioridad" />
                </th>
              )}
              {vis('transporte') && (
                <th style={w('transporte')}>
                  Transporte<ResizeHandle colKey="transporte" />
                </th>
              )}
              {vis('zona') && (
                <th style={w('zona')}>
                  Zona<ResizeHandle colKey="zona" />
                </th>
              )}
              {vis('localidad') && (
                <th style={w('localidad')}>
                  Localidad<ResizeHandle colKey="localidad" />
                </th>
              )}
              {vis('bulto') && (
                <th className={styles.bultoCol} style={w('bulto')}>
                  Bulto<ResizeHandle colKey="bulto" />
                </th>
              )}
              {vis('orden') && (
                <th className={styles.ordenCol} style={w('orden')}>
                  Orden<ResizeHandle colKey="orden" />
                </th>
              )}

              <th className={styles.gearCol} ref={gearRef}>
                <button
                  type="button"
                  className={styles.gearBtn}
                  onClick={() => setColsMenuOpen(o => !o)}
                  title="Configurar columnas"
                  aria-label="Configurar columnas visibles"
                  aria-expanded={colsMenuOpen}
                >
                  {GEAR_SVG}
                </button>
                {colsMenuOpen && (
                  <div className={styles.colsMenu} role="menu">
                    <div className={styles.colsMenuHeader}>Columnas visibles</div>
                    {CONFIGURABLE_COLS.map(col => (
                      <label key={col.key} className={styles.colsMenuItem}>
                        <input
                          type="checkbox"
                          checked={colsVisible[col.key]}
                          onChange={() => toggleCol(col.key)}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={CONFIGURABLE_COLS.length + 3} className={styles.empty}>No se encontraron registros</td>
              </tr>
            ) : filtered.map(item => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={e => handleDragOver(e, item.id)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={[
                  selectedIds.has(item.id) ? styles.rowSelected : '',
                  dragOverId === item.id ? styles.rowDragOver : ''
                ].join(' ')}
              >
                <td className={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    aria-label={`Seleccionar ${item.razonSocial}`}
                  />
                </td>
                <td className={styles.handleCol}>
                  <span className={styles.dragHandle} title="Arrastrar para reordenar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="3" y1="8" x2="21" y2="8"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="16" x2="21" y2="16"/>
                    </svg>
                  </span>
                </td>
                {vis('fecha')             && <td>{item.fecha}</td>}
                {vis('numeroPreparacion') && <td>{item.numeroPreparacion}</td>}
                {vis('remito')            && <td>{item.remito}</td>}
                {vis('codigo')            && <td className={styles.codeCell}>{item.codigo}</td>}
                {vis('razonSocial')       && <td>{item.razonSocial}</td>}
                {vis('prioridad') && (
                  <td>
                    {(() => {
                      const p = resolvePrioridad(item.prioridad, prioridades)
                      if (!p) return item.prioridad ?? null
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
                    })()}
                  </td>
                )}
                {vis('transporte') && <td>{item.transporte}</td>}
                {vis('zona')       && <td>{item.zona}</td>}
                {vis('localidad')  && <td>{item.localidad}</td>}
                {vis('bulto') && (
                  <td className={styles.bultoCol}>
                    <input
                      type="number"
                      className={styles.bultoInput}
                      value={bultos[item.id] ?? ''}
                      onChange={e => setBultos(p => ({ ...p, [item.id]: e.target.value }))}
                      min="0"
                      placeholder="0"
                      aria-label={`Bulto ${item.remito}`}
                    />
                  </td>
                )}
                {vis('orden') && <td className={styles.ordenCol}>{item.orden}</td>}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

    {showRotulos && (
      <RotulosPanel
        items={items.filter(i => selectedIds.has(i.id))}
        bultos={bultos}
        onClose={() => setShowRotulos(false)}
        onImprimir={() => setShowRotulos(false)}
      />
    )}
    </>
  )
}
