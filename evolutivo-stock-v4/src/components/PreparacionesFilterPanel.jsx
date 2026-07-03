import { useState, useRef, useEffect } from 'react'
import styles from './PreparacionesFilterPanel.module.css'

const ESTADOS = ['Pendiente', 'En Proceso', 'Control Pendiente', 'Control en Proceso', 'Control Finalizado', 'Finalizado']
const PRIORIDADES_OPT = ['Alta', 'Media', 'Baja']

function getUniqueValues(preparaciones, key) {
  const values = new Set()
  preparaciones.forEach(p => {
    const v = p[key]
    if (v != null && v !== '') values.add(String(v))
  })
  return [...values].sort()
}

function getUniqueClientes(preparaciones) {
  const map = new Map()
  preparaciones.forEach(p => {
    const code = p.codigo ?? ''
    const razon = p.razonSocial ?? ''
    if (razon && !map.has(razon)) {
      map.set(razon, { codigo: code, razonSocial: razon })
    }
    ;(p.clientes ?? []).forEach(c => {
      if (c.razonSocial && !map.has(c.razonSocial)) {
        map.set(c.razonSocial, { codigo: code, razonSocial: c.razonSocial })
      }
    })
  })
  return [...map.values()].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
}

function dmyToIso(dmy) {
  if (!dmy) return ''
  const [d, m, y] = dmy.split('/')
  if (!d || !m || !y) return ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function isoToDmy(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!d || !m || !y) return ''
  return `${d}/${m}/${y}`
}

function todayStr() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function buildEmptyFilters() {
  const today = todayStr()
  return {
    fechaDesde: today, fechaHasta: today,
    origen: '', comprobanteDesde: '', comprobanteHasta: '',
    sucursal: '', deposito: '', preparadores: [],
    prioridad: '', estado: '', transporte: '', zona: '', cliente: ''
  }
}

function DropdownMulti({ items, selected, onToggle, formatItem }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const summary = selected.length === 0
    ? 'Todos'
    : selected.length === 1
      ? selected[0]
      : `${selected.length} seleccionados`

  return (
    <div ref={ref} className={styles.dropdownWrap}>
      <button type="button" className={`${styles.dropdownBtn} ${open ? styles.dropdownBtnOpen : ''}`} onClick={() => setOpen(o => !o)}>
        <span className={styles.dropdownBtnText}>{summary}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={styles.dropdownList}>
          {items.map((item, i) => {
            const { value, display } = formatItem(item)
            const checked = selected.includes(value)
            return (
              <label key={i} className={`${styles.dropdownItem} ${checked ? styles.dropdownItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={checked} onChange={() => onToggle(value)} />
                {display}
              </label>
            )
          })}
          {items.length === 0 && <div className={styles.dropdownEmpty}>Sin opciones</div>}
        </div>
      )}
    </div>
  )
}

function ClienteSubPanel({ clientes, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = clientes.filter(c =>
    !search ||
    c.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.subPanel}>
      <div className={styles.subHeader}>
        <button className={styles.subBackBtn} onClick={onClose} aria-label="Volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className={styles.subTitle}>Filtrar clientes</h2>
      </div>

      <div className={styles.subSearchWrap}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className={styles.subSearchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar"
          autoFocus
        />
      </div>

      <div className={styles.subTableWrap}>
        <div className={styles.subTableHeader}>
          <span className={styles.subColCodigo}>CÓDIGO</span>
          <span className={styles.subColRazon}>RAZÓN SOCIAL</span>
        </div>
        <div className={styles.subTableBody}>
          {filtered.map(c => (
            <button
              key={c.razonSocial}
              type="button"
              className={`${styles.subRow} ${selected === c.razonSocial ? styles.subRowActive : ''}`}
              onClick={() => { onSelect(c.razonSocial); onClose() }}
            >
              <span className={styles.subColCodigo}>{c.codigo}</span>
              <span className={styles.subColRazon}>{c.razonSocial}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className={styles.subEmpty}>No se encontraron clientes</div>
          )}
        </div>
      </div>

      <div className={styles.subFooter}>
        <button type="button" className={styles.subCancelBtn} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

export default function PreparacionesFilterPanel({ filters, allPreparaciones, operarios = [], onApply, onClose }) {
  const [form, setForm] = useState({ ...filters })
  const [showClientePanel, setShowClientePanel] = useState(false)
  const preparadores = operarios.filter(o => o.preparador)

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const togglePreparador = (name) => {
    setForm(prev => {
      const current = prev.preparadores ?? []
      const next = current.includes(name) ? current.filter(n => n !== name) : [...current, name]
      return { ...prev, preparadores: next }
    })
  }

  const handleApply = () => { onApply(form); onClose() }

  const handleClear = () => {
    const empty = buildEmptyFilters()
    setForm(empty)
    onApply(empty)
    onClose()
  }

  const uniqueOrigen     = getUniqueValues(allPreparaciones, 'origen')
  const uniqueSucursal   = getUniqueValues(allPreparaciones, 'sucursal')
  const uniqueDeposito   = getUniqueValues(allPreparaciones, 'deposito')
  const uniqueTransporte = getUniqueValues(allPreparaciones, 'transporte')
  const uniqueZona       = getUniqueValues(allPreparaciones, 'zona')
  const uniqueClientes   = getUniqueClientes(allPreparaciones)

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true">

        {showClientePanel ? (
          <ClienteSubPanel
            clientes={uniqueClientes}
            selected={form.cliente ?? ''}
            onSelect={v => set('cliente', v)}
            onClose={() => setShowClientePanel(false)}
          />
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Filtros</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar filtros" title="Cerrar">✕</button>
            </div>

            <div className={styles.content}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Fecha</label>
                <div className={styles.rangeRow}>
                  <input type="date" className={styles.inputDate} value={dmyToIso(form.fechaDesde)} onChange={e => set('fechaDesde', isoToDmy(e.target.value))} />
                  <span className={styles.rangeSep}>—</span>
                  <input type="date" className={styles.inputDate} value={dmyToIso(form.fechaHasta)} onChange={e => set('fechaHasta', isoToDmy(e.target.value))} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Origen</label>
                <select className={styles.select} value={form.origen ?? ''} onChange={e => set('origen', e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueOrigen.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Comprobante</label>
                <div className={styles.rangeRow}>
                  <input type="text" className={styles.input} value={form.comprobanteDesde ?? ''} onChange={e => set('comprobanteDesde', e.target.value)} placeholder="Desde" />
                  <span className={styles.rangeSep}>—</span>
                  <input type="text" className={styles.input} value={form.comprobanteHasta ?? ''} onChange={e => set('comprobanteHasta', e.target.value)} placeholder="Hasta" />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Sucursal</label>
                <select className={styles.select} value={form.sucursal ?? ''} onChange={e => set('sucursal', e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueSucursal.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Depósito</label>
                <select className={styles.select} value={form.deposito ?? ''} onChange={e => set('deposito', e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueDeposito.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Preparador</label>
                <DropdownMulti
                  items={preparadores}
                  selected={form.preparadores ?? []}
                  onToggle={togglePreparador}
                  formatItem={p => ({ value: p.name, display: <><span className={styles.ddCode}>{p.code}</span><span className={styles.ddName}>{p.name}</span></> })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Prioridad</label>
                <select className={styles.select} value={form.prioridad ?? ''} onChange={e => set('prioridad', e.target.value)}>
                  <option value="">Todos</option>
                  {PRIORIDADES_OPT.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Estado</label>
                <select className={styles.select} value={form.estado ?? ''} onChange={e => set('estado', e.target.value)}>
                  <option value="">Todos</option>
                  {ESTADOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Transporte</label>
                <select className={styles.select} value={form.transporte ?? ''} onChange={e => set('transporte', e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueTransporte.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Zona</label>
                <select className={styles.select} value={form.zona ?? ''} onChange={e => set('zona', e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueZona.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className={styles.separator} />

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Cliente</label>
                <button type="button" className={styles.clienteBtn} onClick={() => setShowClientePanel(true)}>
                  <span className={styles.clienteBtnText}>{form.cliente || 'Todos'}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.clearBtn} type="button" onClick={handleClear}>Limpiar</button>
              <button className={styles.applyBtn} type="button" onClick={handleApply}>Aplicar</button>
            </div>
          </>
        )}

      </div>
    </>
  )
}
