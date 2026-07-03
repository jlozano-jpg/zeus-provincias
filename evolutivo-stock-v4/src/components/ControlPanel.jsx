import { useState } from 'react'
import styles from './ControlPanel.module.css'

const PRIORIDAD_LABEL = { 1: 'PRIORIDAD ALTA', 2: 'PRIORIDAD MEDIA', 3: 'PRIORIDAD BAJA' }
const PRIORIDAD_COLOR = { 1: '#D32F2F', 2: '#E65100', 3: '#1565C0' }

const STEPS = [
  { id: 'conteo', label: 'Conteo' },
  { id: 'validacion', label: 'Validación' },
  { id: 'stock', label: 'Stock' },
  { id: 'confirmacion', label: 'Confirmación' },
]

const IcoConteo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const IcoValidacion = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)
const IcoStock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoConfirmacion = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const STEP_ICONS = [IcoConteo, IcoValidacion, IcoStock, IcoConfirmacion]

export default function ControlPanel({ preparacion, item, operarios, onClose, onConfirm }) {
  const controladores = operarios.filter(o => o.controlador)
  const [step, setStep] = useState(0)
  const [controlador, setControlador] = useState('')
  const [activeItems, setActiveItems] = useState(() =>
    (item.items ?? []).map((art, i) => ({ ...art, _idx: i }))
  )
  const [cantidades, setCantidades] = useState(
    () => (item.items ?? []).reduce((acc, _, i) => { acc[i] = ''; return acc }, {})
  )
  const [ubicacionSel, setUbicacionSel] = useState(
    () => (item.items ?? []).reduce((acc, art, i) => {
      acc[i] = art.ubicaciones?.[0] ?? ''
      return acc
    }, {})
  )
  const [loteSel, setLoteSel] = useState(
    () => (item.items ?? []).reduce((acc, _, i) => { acc[i] = ''; return acc }, {})
  )
  const [ubicacionesOpen, setUbicacionesOpen] = useState(true)
  const [lotesOpen, setLotesOpen] = useState(true)

  const prioridad = preparacion.prioridad
  const prioridadLabel = prioridad ? `${prioridad} - ${PRIORIDAD_LABEL[prioridad] ?? ''}` : ''
  const prioridadColor = PRIORIDAD_COLOR[prioridad] ?? '#667F99'
  const nroComprobantes = item.comprobantes?.length ?? 0

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else {
      onConfirm?.({ controlador, cantidades, ubicacionSel, loteSel, preparacion, item })
      onClose()
    }
  }

  const handleRemove = (idx) => setActiveItems(prev => prev.filter(a => a._idx !== idx))

  return (
    <div className={styles.panel}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Control
        </button>

        <div className={styles.headerTabs}>
          {STEPS.map((s, i) => {
            const StepIcon = STEP_ICONS[i]
            if (i < step) {
              return (
                <button key={s.id} className={styles.stepDoneBtn} onClick={() => setStep(i)} title={`Volver a ${s.label}`}>
                  <span className={styles.stepDoneCircle}>
                    <StepIcon />
                    <span className={styles.stepCheck}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  </span>
                </button>
              )
            }
            if (i === step) {
              return <span key={s.id} className={styles.tabActive}>{s.label}</span>
            }
            return (
              <span key={s.id} className={styles.tabIcon}>
                <StepIcon />
              </span>
            )
          })}
        </div>

        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      {/* ── Info bar ───────────────────────────────────────────── */}
      {step === 3 ? (
        <div className={styles.infoBarCompact}>
          <span className={styles.infoKey}>Controlador:</span>
          <span className={styles.infoVal}>{controlador || '—'}</span>
          <div className={styles.infoSep} />
          <span className={styles.infoKey}>Preparación:</span>
          <span className={styles.infoVal}>{preparacion.id}</span>
          <div className={styles.infoSep} />
          <span className={styles.infoKey}>Cliente:</span>
          <span className={styles.infoVal}>{item.codigo} - {item.razonSocial}</span>
          <div className={styles.infoSep} />
          <span className={styles.infoKey}>Preparador:</span>
          <span className={styles.infoVal}>{preparacion.preparador}</span>
          <div className={styles.infoSep} />
          <span className={styles.infoKey}>Prioridad:</span>
          <span className={styles.prioridadPill} style={{ background: prioridadColor }}>{prioridadLabel}</span>
        </div>
      ) : (
        <div className={styles.infoBar}>
          <div className={styles.controladorSection}>
            <label className={styles.controladorLabel}>Controlador</label>
            <select
              className={styles.controladorSelect}
              value={controlador}
              onChange={e => setControlador(e.target.value)}
              aria-label="Seleccionar controlador"
            >
              <option value="">Selecciona controlador</option>
              {controladores.map(c => (
                <option key={c.id} value={`${c.code} - ${c.name}`}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.infoCols}>
            <div className={styles.infoCol}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Preparación:</span>
                <span className={styles.infoVal}>{preparacion.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Cliente:</span>
                <span className={styles.infoVal}>{item.codigo} - {item.razonSocial}</span>
              </div>
            </div>
            <div className={styles.infoCol}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Preparador:</span>
                <span className={styles.infoVal}>{preparacion.preparador}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Prioridad:</span>
                <span className={styles.prioridadPill} style={{ background: prioridadColor }}>{prioridadLabel}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Step 0: Conteo ──────────────────────────────────────── */}
        {step === 0 && (
          <>
            <div className={styles.comprobantesSection}>
              <div className={styles.comprobantesIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <div className={styles.comprobantesTitle}>Comprobantes incluidos</div>
                <button className={styles.comprobantesLink} type="button">{nroComprobantes} Ver comprobantes</button>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th className={styles.numCol}>Cantidad controlada</th>
                  </tr>
                </thead>
                <tbody>
                  {activeItems.map(art => (
                    <tr key={art._idx}>
                      <td className={styles.codeCell}>{art.codigoArticulo}</td>
                      <td>{art.descripcion}</td>
                      <td className={styles.numCol}>
                        <input
                          type="number"
                          className={styles.cantidadInput}
                          value={cantidades[art._idx] ?? ''}
                          onChange={e => setCantidades(p => ({ ...p, [art._idx]: e.target.value }))}
                          min="0"
                          placeholder="0"
                          aria-label={`Cantidad controlada ${art.codigoArticulo}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Step 1: Validación ──────────────────────────────────── */}
        {step === 1 && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th className={styles.numCol}>Cantidad controlada</th>
                  <th className={styles.numCol}>Cantidad preparación</th>
                  <th className={styles.numCol}>Stock disponible</th>
                  <th className={styles.actionCol}></th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map(art => (
                  <tr key={art._idx}>
                    <td className={styles.codeCell}>{art.codigoArticulo}</td>
                    <td>{art.descripcion}</td>
                    <td className={styles.numCol}>
                      <input
                        type="number"
                        className={styles.cantidadInput}
                        value={cantidades[art._idx] ?? ''}
                        onChange={e => setCantidades(p => ({ ...p, [art._idx]: e.target.value }))}
                        min="0"
                        placeholder="0"
                      />
                    </td>
                    <td className={styles.numCol}>{art.cantidadPreparada}</td>
                    <td className={styles.numCol}>{art.stockDisponible ?? '—'}</td>
                    <td className={styles.actionCol}>
                      <button className={styles.deleteBtn} onClick={() => handleRemove(art._idx)} title="Eliminar artículo" type="button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Step 2: Stock ───────────────────────────────────────── */}
        {step === 2 && (
          <div className={styles.stockContent}>
            <p className={styles.stockIntro}>Complete la información necesaria de los siguientes productos</p>

            {/* Ubicaciones */}
            <div className={styles.stockSection}>
              <div className={styles.stockSectionHeader}>
                <div className={styles.stockSectionLeft}>
                  <div className={styles.stockSectionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.stockSectionTitle}>Ubicaciones</div>
                    <div className={styles.stockSectionSub}>Seleccione una o varias ubicaciones de un mismo producto</div>
                  </div>
                </div>
                <button className={styles.accordionBtn} type="button" onClick={() => setUbicacionesOpen(o => !o)} aria-label={ubicacionesOpen ? 'Colapsar' : 'Expandir'}>
                  <svg className={ubicacionesOpen ? '' : styles.accordionClosed} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
              </div>
              {ubicacionesOpen && (
                <div className={styles.stockTableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Ubicación</th>
                        <th className={styles.numCol}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.map(art => (
                        <tr key={art._idx}>
                          <td className={styles.codeCell}>{art.codigoArticulo}</td>
                          <td>{art.descripcion}</td>
                          <td>
                            <select
                              className={styles.selectorInput}
                              value={ubicacionSel[art._idx] ?? ''}
                              onChange={e => setUbicacionSel(p => ({ ...p, [art._idx]: e.target.value }))}
                              aria-label={`Ubicación ${art.codigoArticulo}`}
                            >
                              {(art.ubicaciones ?? []).map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className={styles.numCol}>{cantidades[art._idx] || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lotes */}
            <div className={styles.stockSection}>
              <div className={styles.stockSectionHeader}>
                <div className={styles.stockSectionLeft}>
                  <div className={styles.stockSectionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      <line x1="12" y1="12" x2="12" y2="16"/>
                      <line x1="10" y1="14" x2="14" y2="14"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.stockSectionTitle}>Lotes</div>
                    <div className={styles.stockSectionSub}>Seleccione uno o varios lotes de un mismo producto</div>
                  </div>
                </div>
                <button className={styles.accordionBtn} type="button" onClick={() => setLotesOpen(o => !o)} aria-label={lotesOpen ? 'Colapsar' : 'Expandir'}>
                  <svg className={lotesOpen ? '' : styles.accordionClosed} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
              </div>
              {lotesOpen && (
                <div className={styles.stockTableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Lotes</th>
                        <th className={styles.numCol}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.map(art => (
                        <tr key={art._idx}>
                          <td className={styles.codeCell}>{art.codigoArticulo}</td>
                          <td>{art.descripcion}</td>
                          <td>
                            <select
                              className={styles.selectorInput}
                              value={loteSel[art._idx] ?? ''}
                              onChange={e => setLoteSel(p => ({ ...p, [art._idx]: e.target.value }))}
                              aria-label={`Lote ${art.codigoArticulo}`}
                            >
                              <option value="">Seleccione lote</option>
                              {(art.lotes ?? []).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </td>
                          <td className={styles.numCol}>{cantidades[art._idx] || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmación ────────────────────────────────── */}
        {step === 3 && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th className={styles.numCol}>Cantidad preparada</th>
                  <th className={styles.numCol}>Cantidad controlada</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map(art => (
                  <tr key={art._idx}>
                    <td className={styles.codeCell}>{art.codigoArticulo}</td>
                    <td>{art.descripcion}</td>
                    <td className={styles.numCol}>{art.cantidadPreparada}</td>
                    <td className={styles.numCol}>{cantidades[art._idx] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onClose} type="button">Cancelar</button>
        <button className={styles.confirmBtn} onClick={handleNext} type="button">Continuar</button>
      </div>
    </div>
  )
}
