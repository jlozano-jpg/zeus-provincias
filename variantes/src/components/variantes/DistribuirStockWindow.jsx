import { useMemo, useState } from 'react'
import { buildVariantesArticulo } from '../../data/variantesGeneratorData'
import { usePersistentState } from '../../hooks/usePersistentState'
import { AGRUPADORES_SEED } from '../../data/agrupadoresMaestro'
import { PRODUCTOS_SEED } from '../../data/productosSeed'
import DistribuirStockPanel from './DistribuirStockPanel'
import '../agrupadores/agrupadores.css'
import '../productos/productos.css'
import '../stock/stock.css'
import './gestionVariantes.css'

function applyOverrides(base, ov) {
  if (!ov) return base
  return {
    ...base,
    stockBase: ov.stockBase ?? base.stockBase,
    variants: base.variants.map((v) => (ov.variants?.[v.id] ? { ...v, ...ov.variants[v.id] } : v)),
  }
}

// Ventana independiente (window.open) para distribuir el stock base de un
// artículo entre sus variantes. Lee el catálogo y los cambios de variantes
// desde localStorage — la misma fuente que usa la pestaña de origen — para
// que ambas ventanas queden sincronizadas vía el evento 'storage'.
export default function DistribuirStockWindow() {
  const [agrupadores] = usePersistentState('zeus-variantes:agrupadores', AGRUPADORES_SEED)
  const [productos] = usePersistentState('zeus-variantes:productos', PRODUCTOS_SEED)
  const [overrides, setOverrides] = usePersistentState('zeus-variantes:variantes-overrides', {})
  const [distFiltros, setDistFiltros] = useState({})
  const [distAsig, setDistAsig] = useState({})

  const articuloId = new URLSearchParams(window.location.search).get('articulo')
  const producto = productos.find((p) => p.codigo === articuloId)
  const base = useMemo(
    () => (producto ? buildVariantesArticulo(producto, agrupadores) : null),
    [producto, agrupadores]
  )
  const art = useMemo(() => (base ? applyOverrides(base, overrides[base.id]) : null), [base, overrides])

  if (!art) {
    return (
      <div className="va-app" style={{ minHeight: '100vh' }}>
        <div className="va-main">
          <div className="va-values-empty" style={{ padding: '48px 24px' }}>
            <div className="va-ttl">No se encontró el artículo solicitado</div>
            <div className="va-sub">Volvé a la pestaña de Gestión de Variantes y probá de nuevo.</div>
          </div>
        </div>
      </div>
    )
  }

  function toggleDistFiltro(agrupadorId, code) {
    setDistFiltros((f) => {
      const cur = f[agrupadorId] || []
      const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
      return { ...f, [agrupadorId]: next }
    })
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
    setDistAsig({})
  }

  return (
    <div className="va-app" style={{ minHeight: '100vh' }}>
      <DistribuirStockPanel
        standalone
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
        onClose={() => window.close()}
      />
    </div>
  )
}
