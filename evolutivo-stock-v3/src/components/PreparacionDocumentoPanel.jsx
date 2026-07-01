import { Fragment, useEffect, useRef, useState } from 'react'
import { ORIGENES_CONFIG } from '../data/preparacionDocumentos'
import styles from './PreparacionDocumentoPanel.module.css'

const DEPOSITOS = ['DEPÓSITO INTER B', 'DEPÓSITO CENTRAL', 'DEPÓSITO NORTE', 'DEPÓSITO SUR']
const METODOLOGIAS_PICKEO = [
  { value: 'PEPS', label: 'PEPS', description: 'Primero Entrado Primero Salido' },
  { value: 'UEPS', label: 'UEPS', description: 'Último Entrado Primero Salido' },
  { value: 'FEFO', label: 'FEFO', description: 'Primero en Vencer, Primero en Salir' },
  { value: 'Liberar ubicaciones', label: 'Liberar Ubicaciones', description: 'Prioriza ubicaciones con menos stock' }
]
const TRANSPORTES = ['ANDREANI', 'CORREO ARGENTINO', 'OCA', 'VIA CARGO', 'TRANSPORTE PROPIO']
const ZONAS = ['A', 'B', 'C', 'D']
const MODOS_EJECUCION = [
  { value: 'Recorrido Único', label: 'Recorrido Único', description: 'Un preparador recorre todas las ubicaciones del depósito' },
  { value: 'Picking por Áreas', label: 'Picking por Áreas', description: 'Un preparador por área; el pickeo se realiza en simultáneo' },
]

export default function PreparacionDocumentoPanel({ origenId, preparaciones = [], onBack, onCancel, onConfirm, rightOffset = 0, inactive = false }) {
  const config = ORIGENES_CONFIG[origenId]
  const documentos = config.documentos

  const [metodologiaPickeo, setMetodologiaPickeo] = useState('Liberar ubicaciones')
  const [modoEjecucion, setModoEjecucion] = useState('Recorrido Único')
  const [deposito, setDeposito] = useState('DEPÓSITO INTER B')
  const [transporte, setTransporte] = useState('')
  const [zona, setZona] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [selectedDetalleItems, setSelectedDetalleItems] = useState(new Set())
  const [metodologiaOpen, setMetodologiaOpen] = useState(false)
  const [modoOpen, setModoOpen] = useState(false)
  const metodologiaRef = useRef(null)
  const modoRef = useRef(null)

  useEffect(() => {
    if (!metodologiaOpen && !modoOpen) return

    const handleClickOutside = (e) => {
      if (metodologiaOpen && metodologiaRef.current && !metodologiaRef.current.contains(e.target)) {
        setMetodologiaOpen(false)
      }
      if (modoOpen && modoRef.current && !modoRef.current.contains(e.target)) {
        setModoOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [metodologiaOpen, modoOpen])

  const selectedMetodologia = METODOLOGIAS_PICKEO.find(m => m.value === metodologiaPickeo)
  const selectedModo = MODOS_EJECUCION.find(m => m.value === modoEjecucion)

  const toggleSelect = (pedido) => {
    const isSelecting = selectedId !== pedido.id
    setSelectedId(isSelecting ? pedido.id : null)
    setSelectedDetalleItems(prev => {
      const next = new Set(prev)
      pedido.detalle.forEach((_, index) => {
        const key = `${pedido.id}-${index}`
        if (isSelecting) {
          next.add(key)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }

  const toggleExpand = (id) => {
    setExpandedId(current => current === id ? null : id)
  }

  const toggleDetalleItem = (key) => {
    setSelectedDetalleItems(current => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const pedido = documentos.find(p => p.id === selectedId)
    if (!pedido) return
    onConfirm({ pedido, deposito, transporte, zona, metodologiaPickeo, modoEjecucion })
  }

  const isContinueDisabled = selectedId === null

  return (
    <>
      <div className={`${styles.panel} ${inactive ? styles.panelInactive : ''}`} style={{ right: rightOffset }} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={onBack} aria-label="Volver" title="Volver">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h2 className={styles.title}>Crear preparación</h2>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.originBadge}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="12" y2="16" />
              </svg>
              {config.badgeLabel}
            </span>
            <button className={styles.closeBtn} onClick={onCancel} aria-label="Cerrar panel" title="Cerrar (Esc)">✕</button>
          </div>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filterField} ref={metodologiaRef}>
            <label className={styles.filterLabel} id="prep-documento-metodologia-label">Metodología de pickeo</label>
            <button
              type="button"
              className={`${styles.filterSelectBtn} ${metodologiaOpen ? styles.filterSelectBtnOpen : ''}`}
              onClick={() => setMetodologiaOpen(open => !open)}
              aria-haspopup="listbox"
              aria-expanded={metodologiaOpen}
              aria-labelledby="prep-documento-metodologia-label"
            >
              <span>{selectedMetodologia.label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {metodologiaOpen && (
              <div className={styles.metodologiaDropdown} role="listbox">
                {METODOLOGIAS_PICKEO.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={metodologiaPickeo === opt.value}
                    className={`${styles.metodologiaOption} ${metodologiaPickeo === opt.value ? styles.metodologiaOptionActive : ''}`}
                    onClick={() => {
                      setMetodologiaPickeo(opt.value)
                      setMetodologiaOpen(false)
                    }}
                  >
                    <span className={styles.metodologiaOptionTitle}>{opt.label}</span>
                    <span className={styles.metodologiaOptionDescription}>{opt.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.filterField} ref={modoRef}>
            <label className={styles.filterLabel} id="prep-documento-modo-label">Modo de ejecución</label>
            <button
              type="button"
              className={`${styles.filterSelectBtn} ${modoOpen ? styles.filterSelectBtnOpen : ''}`}
              onClick={() => setModoOpen(open => !open)}
              aria-haspopup="listbox"
              aria-expanded={modoOpen}
              aria-labelledby="prep-documento-modo-label"
            >
              <span>{selectedModo.label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {modoOpen && (
              <div className={styles.metodologiaDropdown} role="listbox">
                {MODOS_EJECUCION.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={modoEjecucion === opt.value}
                    className={`${styles.metodologiaOption} ${modoEjecucion === opt.value ? styles.metodologiaOptionActive : ''}`}
                    onClick={() => {
                      setModoEjecucion(opt.value)
                      setModoOpen(false)
                    }}
                  >
                    <span className={styles.metodologiaOptionTitle}>{opt.label}</span>
                    <span className={styles.metodologiaOptionDescription}>{opt.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="prep-documento-transporte">Transporte</label>
            <select
              id="prep-documento-transporte"
              className={styles.filterSelect}
              value={transporte}
              onChange={(e) => setTransporte(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {TRANSPORTES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="prep-documento-zona">Zona</label>
            <select
              id="prep-documento-zona"
              className={styles.filterSelect}
              value={zona}
              onChange={(e) => setZona(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="prep-documento-deposito">Depósito</label>
            <select
              id="prep-documento-deposito"
              className={styles.filterSelect}
              value={deposito}
              onChange={(e) => setDeposito(e.target.value)}
            >
              {DEPOSITOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxHeader} aria-label="Seleccionar" />
                <th>{config.columnaDocumento}</th>
                <th>{config.columnaEntidad}</th>
                <th>Razón Social</th>
                <th>Fecha</th>
                <th className={styles.expandHeader} aria-label="Expandir" />
              </tr>
            </thead>
            <tbody>
              {documentos.map(pedido => {
                const isExpanded = expandedId === pedido.id
                return (
                  <Fragment key={pedido.id}>
                    <tr className={isExpanded ? styles.rowExpanded : ''}>
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          checked={selectedId === pedido.id}
                          onChange={() => toggleSelect(pedido)}
                          aria-label={`Seleccionar ${pedido.pedido}`}
                        />
                      </td>
                      <td>{pedido.pedido}</td>
                      <td>{pedido.codigoCliente}</td>
                      <td>{pedido.razonSocial}</td>
                      <td>{pedido.fecha}</td>
                      <td className={styles.expandCell}>
                        <button
                          type="button"
                          className={styles.expandBtn}
                          onClick={() => toggleExpand(pedido.id)}
                          aria-label={isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                          aria-expanded={isExpanded}
                        >
                          <svg
                            className={isExpanded ? styles.expandIconOpen : styles.expandIcon}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className={styles.detailRow}>
                        <td colSpan={6} className={styles.detailCell}>
                          <table className={styles.detailTable}>
                            <thead>
                              <tr>
                                <th className={styles.detailCheckboxHeader} aria-label="Seleccionar" />
                                <th>Depósito</th>
                                <th>Código de Producto</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.detalle.map((item, index) => {
                                const itemKey = `${pedido.id}-${index}`
                                return (
                                  <tr key={index}>
                                    <td className={styles.detailCheckboxCell}>
                                      <input
                                        type="checkbox"
                                        checked={selectedDetalleItems.has(itemKey)}
                                        onChange={() => toggleDetalleItem(itemKey)}
                                        aria-label={`Seleccionar ${item.descripcion}`}
                                      />
                                    </td>
                                    <td>{item.deposito}</td>
                                    <td>{item.codigoProducto}</td>
                                    <td>{item.descripcion}</td>
                                    <td>{item.cantidad}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isContinueDisabled}>Continuar</button>
        </div>
      </div>
    </>
  )
}
