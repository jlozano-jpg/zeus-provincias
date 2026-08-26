import { useEffect, useMemo, useState } from 'react'
import {
  IconX, IconBox, IconSearch, IconTrash, IconChevronDown, IconBuildingWarehouse,
  IconArrowRight, IconSparkles, IconCheck, IconVersions, IconUpload, IconPlus,
} from '@tabler/icons-react'
import { buildVariantesArticulo } from '../../data/variantesGeneratorData'
import { fmt, money } from './format'
import VariantChips from './VariantChips'
import DepositoPanel from './DepositoPanel'
import GenerarVariantesPanel from './GenerarVariantesPanel'
import DistribuirStockPanel from './DistribuirStockPanel'
import '../agrupadores/agrupadores.css'
import '../productos/productos.css'
import '../stock/stock.css'
import './gestionVariantes.css'

const DEPOSITOS = [
  { id: 'todos', nombre: 'Todos los depósitos', mult: 1 },
  { id: 1, nombre: 'Casa Central', mult: 0.6 },
  { id: 2, nombre: 'Depósito Sur', mult: 0.4 },
]

function applyOverrides(base, ov) {
  if (!ov) return base
  return {
    ...base,
    stockBase: ov.stockBase ?? base.stockBase,
    variants: base.variants.map((v) => (ov.variants?.[v.id] ? { ...v, ...ov.variants[v.id] } : v)),
  }
}

export default function GestionVariantes({ onNavigateHome, agrupadores, productos }) {
  const articulos = useMemo(
    () => productos.filter((p) => (p.variantes?.seleccion?.length ?? 0) > 0),
    [productos]
  )

  const [articuloId, setArticuloId] = useState(articulos[0]?.codigo ?? '')
  const [overrides, setOverrides] = useState({})
  const [filtros, setFiltros] = useState({})
  const [q, setQ] = useState('')
  const [depId, setDepId] = useState('todos')
  const [depPanelOpen, setDepPanelOpen] = useState(false)
  const [selVarId, setSelVarId] = useState(null)
  const [genFiltro, setGenFiltro] = useState('no')
  const [genSel, setGenSel] = useState([])
  const [generarOpen, setGenerarOpen] = useState(false)
  const [distFiltros, setDistFiltros] = useState({})
  const [distAsig, setDistAsig] = useState({})
  const [distribuirOpen, setDistribuirOpen] = useState(false)
  const [confirmDeleteVar, setConfirmDeleteVar] = useState(null)
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    if (!flash) return undefined
    const t = setTimeout(() => setFlash(null), 4200)
    return () => clearTimeout(t)
  }, [flash])

  const producto = productos.find((p) => p.codigo === articuloId) ?? articulos[0]
  const base = useMemo(
    () => (producto ? buildVariantesArticulo(producto, agrupadores) : null),
    [producto, agrupadores]
  )
  const art = useMemo(() => (base ? applyOverrides(base, overrides[base.id]) : null), [base, overrides])

  function selectArticulo(codigo) {
    setArticuloId(codigo)
    setFiltros({})
    setQ('')
    setSelVarId(null)
    setGenFiltro('no')
    setGenSel([])
    setGenerarOpen(false)
    setDistFiltros({})
    setDistAsig({})
    setDistribuirOpen(false)
  }

  if (!art) {
    return (
      <div className="va-app">
        <div className="va-tabbar">
          <button type="button" className="va-tab" onClick={onNavigateHome}>
            <span className="va-dot" /> Inicio
          </button>
          <button type="button" className="va-tab is-active" onClick={onNavigateHome}>
            <span className="va-dot" /> Gestión de Variantes
          </button>
        </div>
        <div className="va-main">
          <div className="va-values-empty" style={{ padding: '48px 24px' }}>
            <div className="va-glyph"><IconVersions size={20} stroke={1.6} /></div>
            <div className="va-ttl">Ningún producto tiene variantes configuradas</div>
            <div className="va-sub">Agregá agrupadores a un producto desde Ventas &gt; Gestión de Productos &gt; solapa Variantes.</div>
          </div>
        </div>
      </div>
    )
  }

  const gen = art.variants.filter((v) => v.status === 'gen')
  const no = art.variants.filter((v) => v.status === 'no')
  const dep = DEPOSITOS.find((d) => d.id === depId) ?? DEPOSITOS[0]

  function depStock(v) {
    return depId === 'todos' ? v.stock : Math.round(v.stock * dep.mult)
  }

  function toggleFiltro(agrupadorId, code) {
    setFiltros((f) => {
      const cur = f[agrupadorId] || []
      const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
      return { ...f, [agrupadorId]: next }
    })
  }

  function toggleDistFiltro(agrupadorId, code) {
    setDistFiltros((f) => {
      const cur = f[agrupadorId] || []
      const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
      return { ...f, [agrupadorId]: next }
    })
  }

  const hasFiltros = Object.values(filtros).some((v) => v.length > 0)

  const qLower = q.trim().toLowerCase()
  const rows = gen
    .filter((v) => art.groupers.every((g) => {
      const sel = filtros[g.id] || []
      return sel.length === 0 || sel.includes(v.vals[g.id].code)
    }))
    .filter((v) => !qLower
      || v.codigo.toLowerCase().includes(qLower)
      || art.groupers.some((g) => v.vals[g.id].name.toLowerCase().includes(qLower)))

  const selVar = gen.find((v) => v.id === selVarId) || null

  function setPrecioAdic(v, raw) {
    const num = raw === '' || raw === '-' ? 0 : Number(raw)
    if (Number.isNaN(num)) return
    setOverrides((prev) => {
      const cur = prev[art.id] ?? {}
      const variants = { ...(cur.variants || {}) }
      variants[v.id] = { ...(variants[v.id] || {}), precioAdic: num }
      return { ...prev, [art.id]: { ...cur, variants } }
    })
  }

  function eliminarVariante(v) {
    setOverrides((prev) => {
      const cur = prev[art.id] ?? {}
      const variants = { ...(cur.variants || {}) }
      variants[v.id] = { status: 'no', stock: 0, precioAdic: 0, codBarras: [] }
      return { ...prev, [art.id]: { ...cur, variants } }
    })
    if (selVarId === v.id) setSelVarId(null)
    setConfirmDeleteVar(null)
    setFlash(`Se eliminó la variante ${v.codigo}.`)
  }

  function generarSeleccionadas() {
    if (!genSel.length) return
    setOverrides((prev) => {
      const cur = prev[art.id] ?? {}
      const variants = { ...(cur.variants || {}) }
      genSel.forEach((id) => { variants[id] = { status: 'gen', stock: 0 } })
      return { ...prev, [art.id]: { ...cur, variants } }
    })
    setFlash(`${genSel.length} variante${genSel.length === 1 ? '' : 's'} generada${genSel.length === 1 ? '' : 's'} con stock 0. Asignale unidades desde Distribuir stock.`)
    setGenSel([])
    setGenFiltro('gen')
    setGenerarOpen(false)
  }

  const distRows = art.variants.filter((v) => v.status === 'gen' && art.groupers.every((g) => {
    const sel = distFiltros[g.id] || []
    return sel.length === 0 || sel.includes(v.vals[g.id].code)
  }))
  const distTotal = distRows.reduce((s, v) => s + Number(distAsig[v.id] || 0), 0)
  const distRestante = art.stockBase - distTotal
  const distOver = distRestante < 0

  function setAsig(v, n) {
    const val = Math.max(0, Math.round(Number(n) || 0))
    setDistAsig((prev) => ({ ...prev, [v.id]: val }))
  }

  function confirmarDistribucion() {
    if (distTotal <= 0 || distOver) return
    setOverrides((prev) => {
      const cur = prev[art.id] ?? {}
      const variants = { ...(cur.variants || {}) }
      Object.entries(distAsig).forEach(([id, n]) => {
        const num = Number(n || 0)
        if (num <= 0) return
        const current = art.variants.find((v) => v.id === id)
        variants[id] = { ...(variants[id] || {}), stock: (current?.stock ?? 0) + num }
      })
      return { ...prev, [art.id]: { ...cur, variants, stockBase: art.stockBase - distTotal } }
    })
    setFlash(`Se distribuyeron ${fmt(distTotal)} unidades de ${art.codigo} entre sus variantes.`)
    setDistAsig({})
    setDistribuirOpen(false)
  }

  return (
    <div className="va-app">
      <div className="va-tabbar">
        <button type="button" className="va-tab" onClick={onNavigateHome}>
          <span className="va-dot" /> Inicio
        </button>
        <button type="button" className="va-tab is-active" onClick={onNavigateHome}>
          <span className="va-dot" /> Gestión de Variantes
          <span className="va-tab-close" onClick={(e) => { e.stopPropagation(); onNavigateHome?.() }}>
            <IconX size={11} stroke={2} />
          </span>
        </button>
      </div>

      <div className="va-main">
        <div className="st-selector">
          <div className="va-search" style={{ width: '100%' }}>
            <IconSearch size={16} stroke={1.6} className="va-ico" />
            <select
              className="va-input"
              style={{ paddingLeft: 38, appearance: 'none' }}
              value={art.codigo}
              onChange={(e) => selectArticulo(e.target.value)}
            >
              {articulos.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.codigo} — {p.descripcion}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="vg-header-card">
          <div className="vg-header-ico"><IconBox size={22} stroke={1.6} /></div>
          <div className="vg-header-info">
            <span className="vg-header-eyebrow">Artículo base</span>
            <div className="vg-header-row">
              <span className="vg-header-codigo">{art.codigo}</span>
              <span className="vg-header-nombre">{art.nombre}</span>
            </div>
            <div className="vg-header-meta">
              {art.rubro} · Precio base <b>{money(art.precioBase)}</b> · Stock base sin asignar{' '}
              <b className="vg-accent">{fmt(art.stockBase)} u.</b>
            </div>
          </div>
          <button type="button" className="va-btn va-btn-secondary" onClick={() => setDistribuirOpen(true)}>
            <IconArrowRight size={15} stroke={1.8} /> Distribuir stock
          </button>
        </div>

        {art.groupers.length > 0 && (
          <div className="st-variant-filter">
            <div className="st-variant-filter-head">
              <span className="st-vf-icon">V</span>
              Filtrar por agrupador
              {hasFiltros && (
                <button type="button" className="vg-clear-link" onClick={() => setFiltros({})}>Limpiar filtros</button>
              )}
            </div>
            {art.groupers.map((g) => (
              <div className="st-vf-row" key={g.id}>
                <span className="st-vf-label">{g.nombre}</span>
                <div className="st-vf-chips">
                  {g.valores.map((v) => (
                    <button
                      type="button"
                      key={v.code}
                      className={`st-vf-chip ${(filtros[g.id] || []).includes(v.code) ? 'is-active' : ''}`}
                      onClick={() => toggleFiltro(g.id, v.code)}
                    >
                      {v.swatch ? <span className="st-vf-sw" style={{ background: v.swatch }} /> : null}
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="st-filter-row">
          <div className="va-search" style={{ width: 260 }}>
            <IconSearch size={15} stroke={1.6} className="va-ico" />
            <input placeholder="Buscar por talle, color, código…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" className="st-filter-btn" onClick={() => setDepPanelOpen(true)}>
            <IconBuildingWarehouse size={14} stroke={1.6} /> {dep.nombre} <IconChevronDown size={12} stroke={1.8} />
          </button>
          <div className="st-filter-spacer" />
          <span className="vg-count vg-count-ok">{fmt(gen.length)} Generadas</span>
          <span className="vg-count vg-count-warn">{fmt(no.length)} No generadas</span>
          <button type="button" className="va-btn va-btn-secondary">
            <IconUpload size={15} stroke={1.8} /> Carga masiva
          </button>
          <button type="button" className="va-btn va-btn-primary" onClick={() => setGenerarOpen(true)}>
            <IconPlus size={15} stroke={1.8} /> Generar variantes
          </button>
        </div>

        <div className="va-card st-table-card">
          <div className="st-table-head">
            <span>Variantes generadas · <b>{rows.length}</b> de {gen.length}</span>
          </div>
          <div className="va-card-scroll">
            <table className="va-grid">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Variante</th>
                  <th style={{ textAlign: 'right' }}>Stock · {dep.nombre}</th>
                  <th style={{ textAlign: 'right' }}>Precio adicional</th>
                  <th>Código de barras</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => {
                  const s = depStock(v)
                  return (
                    <tr
                      key={v.id}
                      className={v.id === selVarId ? 'is-selected' : ''}
                      onClick={() => setSelVarId(v.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="pr-cell-strong vg-mono">{v.codigo}</td>
                      <td><VariantChips groupers={art.groupers} vals={v.vals} /></td>
                      <td className="st-num" style={{ textAlign: 'right' }}>
                        <span className={s === 0 ? 'st-egreso' : 'pr-cell-strong'}>{fmt(s)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="vg-precio-input-wrap">
                          <span className="vg-precio-sign">$</span>
                          <input
                            type="number"
                            className="vg-precio-input"
                            value={v.precioAdic}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setPrecioAdic(v, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="pr-cell-muted vg-mono">{v.codBarras[0] || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="va-btn-icon va-danger"
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteVar(v) }}
                          title="Eliminar variante"
                        >
                          <IconTrash size={15} stroke={1.6} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="va-empty-cell">No hay variantes generadas para el filtro seleccionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selVar && (
        <aside className="vg-detail-panel">
          <div className="va-panel-head">
            <div className="va-grow">
              <div className="va-eyebrow">Detalle de variante</div>
              <div className="va-title">{art.nombre}</div>
              <div className="pr-cell-muted vg-mono" style={{ fontSize: 11, marginTop: 3 }}>{selVar.codigo}</div>
            </div>
            <button type="button" className="va-btn-icon va-close" onClick={() => setSelVarId(null)} aria-label="Cerrar">
              <IconX size={18} stroke={1.6} />
            </button>
          </div>

          <div className="va-panel-body">
            <div className="va-section">
              <div className="vg-detail-label">Variante</div>
              <div className="vg-detail-vals">
                {art.groupers.map((g) => {
                  const val = selVar.vals[g.id]
                  return (
                    <div className="vg-detail-val" key={g.id}>
                      <span className="vg-detail-val-label">{g.nombre}</span>
                      <span className="vg-detail-val-value">
                        {val.swatch ? <span className="st-vf-sw" style={{ background: val.swatch }} /> : null}
                        {val.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="va-section">
              <div className="vg-detail-label">Stock por depósito</div>
              <div className="vg-dep-stock-list">
                {DEPOSITOS.filter((d) => d.id !== 'todos').map((d) => {
                  const s = Math.round(selVar.stock * d.mult)
                  return (
                    <div className="vg-dep-stock-row" key={d.id}>
                      <span>{d.nombre}</span>
                      <span className={s === 0 ? 'st-egreso' : 'pr-cell-strong'}>{fmt(s)}</span>
                    </div>
                  )
                })}
                <div className="vg-dep-stock-row vg-dep-stock-total">
                  <span>Total</span>
                  <span>{fmt(selVar.stock)}</span>
                </div>
              </div>
            </div>

            <div className="va-section">
              <div className="vg-detail-label">Precios</div>
              <div className="vg-price-box">
                <div className="vg-price-row"><span>Precio base</span><span>{money(art.precioBase)}</span></div>
                <div className="vg-price-row">
                  <span>Precio adicional</span>
                  <span>{selVar.precioAdic ? `${selVar.precioAdic > 0 ? '+ ' : '- '}${money(Math.abs(selVar.precioAdic))}` : money(0)}</span>
                </div>
                <div className="vg-price-row vg-price-total">
                  <span>Precio total</span>
                  <span>{money(art.precioBase + selVar.precioAdic)}</span>
                </div>
              </div>
            </div>

            <div className="va-section">
              <div className="vg-detail-label">Códigos de barras</div>
              {selVar.codBarras.length === 0 ? (
                <div className="pr-cell-muted" style={{ fontSize: 12.5 }}>Sin código de barras asignado</div>
              ) : (
                selVar.codBarras.map((c, i) => (
                  <div key={c} className="vg-barcode-row">
                    <span className="vg-barcode-code">{c}</span>
                    {i === 0 && <span className="vg-barcode-badge">Principal</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="va-panel-foot">
            <button
              type="button"
              className="va-btn va-btn-secondary"
              title="Eliminar variante"
              onClick={() => setConfirmDeleteVar(selVar)}
            >
              <IconTrash size={14} stroke={1.6} /> Eliminar
            </button>
          </div>
        </aside>
      )}

      {generarOpen && (
        <GenerarVariantesPanel
          art={art}
          gen={gen}
          no={no}
          genFiltro={genFiltro}
          setGenFiltro={setGenFiltro}
          genSel={genSel}
          setGenSel={setGenSel}
          onGenerar={generarSeleccionadas}
          onClose={() => setGenerarOpen(false)}
        />
      )}

      {distribuirOpen && (
        <DistribuirStockPanel
          art={art}
          distFiltros={distFiltros}
          toggleDistFiltro={toggleDistFiltro}
          clearDistFiltros={() => setDistFiltros({})}
          distRows={distRows}
          distAsig={distAsig}
          setAsig={setAsig}
          distTotal={distTotal}
          distRestante={distRestante}
          distOver={distOver}
          onConfirm={confirmarDistribucion}
          onClose={() => setDistribuirOpen(false)}
        />
      )}

      {depPanelOpen && (
        <DepositoPanel
          depositos={DEPOSITOS}
          selectedId={depId}
          onSelect={setDepId}
          onClose={() => setDepPanelOpen(false)}
        />
      )}

      {confirmDeleteVar && (
        <div className="va-confirm-overlay" onClick={() => setConfirmDeleteVar(null)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="va-confirm-icon va-danger"><IconTrash size={20} stroke={1.6} /></div>
            <div className="va-confirm-title">Eliminar variante {confirmDeleteVar.codigo}</div>
            <div className="va-confirm-body">
              Esta acción no se puede deshacer. La variante vuelve a la lista de no generadas y pierde su código de barras asignado.
              {confirmDeleteVar.stock > 0 && (
                <> También se pierden las <b>{fmt(confirmDeleteVar.stock)}</b> unidades de stock que tenía asignadas.</>
              )}
            </div>
            <div className="va-confirm-actions">
              <button type="button" className="va-btn va-btn-secondary" onClick={() => setConfirmDeleteVar(null)}>Cancelar</button>
              <button type="button" className="va-btn va-btn-danger" onClick={() => eliminarVariante(confirmDeleteVar)}>
                <IconTrash size={14} stroke={1.6} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {flash && (
        <div className="vg-flash">
          <IconCheck size={15} stroke={2.4} />
          <span>{flash}</span>
          <button type="button" className="vg-flash-close" onClick={() => setFlash(null)} aria-label="Cerrar aviso">
            <IconX size={11} stroke={2.4} />
          </button>
        </div>
      )}
    </div>
  )
}
