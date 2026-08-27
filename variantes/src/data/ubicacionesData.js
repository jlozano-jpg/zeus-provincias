// Genera, de forma determinística por artículo/variante + depósito, la
// estructura de ubicaciones (Pasillo → Estante) de un depósito y en qué
// ubicación(es) de ese depósito ya tiene stock un código dado. Consumido por
// el wizard de Origen/Destino de Distribuir stock.

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h >>> 0
}

function mulberry32(seed) {
  let s = seed
  return function random() {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PASILLOS_POR_DEPOSITO = 3
const ESTANTES_POR_PASILLO = 3

function buildPasillos(depositoId) {
  const pasillos = []
  for (let p = 1; p <= PASILLOS_POR_DEPOSITO; p++) {
    const hijos = []
    for (let e = 1; e <= ESTANTES_POR_PASILLO; e++) {
      hijos.push({
        id: `dep${depositoId}-p${p}-e${e}`,
        label: `E${e} - Estante ${e}`,
        esHoja: true,
        stock: 0,
      })
    }
    pasillos.push({
      id: `dep${depositoId}-p${p}`,
      label: `P${p} - Pasillo ${p}`,
      esHoja: false,
      hijos,
    })
  }
  return pasillos
}

function hojasDe(pasillos) {
  return pasillos.flatMap((p) => p.hijos)
}

// Ubicaciones donde un código (artículo base o variante) ya tiene stock
// dentro de un depósito, determinístico por código+depósito. Reparte `total`
// entre 1 y 3 estantes.
export function stockUbicacionesDe(codigo, depositoId, total) {
  const totalNum = Math.round(Number(total) || 0)
  if (totalNum <= 0) return []

  const todasHojas = hojasDe(buildPasillos(depositoId))
  const rnd = mulberry32(hashCode(`${codigo}#dep${depositoId}`))
  const nUbic = totalNum <= 4 ? 1 : (rnd() < 0.5 ? 1 : (rnd() < 0.8 ? 2 : 3))

  const barajadas = [...todasHojas].sort(() => rnd() - 0.5)
  const elegidas = barajadas.slice(0, Math.min(nUbic, todasHojas.length))

  let restante = totalNum
  const partes = elegidas.map((h, i) => {
    if (i === elegidas.length - 1) return { id: h.id, label: h.label, cantidad: restante }
    const parte = Math.max(1, Math.round(restante * (0.4 + rnd() * 0.4)))
    restante -= parte
    return { id: h.id, label: h.label, cantidad: parte }
  })

  return partes.sort((a, b) => b.cantidad - a.cantidad)
}

// Árbol de pasillos/estantes de un depósito con el stock actual de `codigo`
// anotado en cada estante, más la lista de ubicaciones sugeridas (donde ya
// tiene stock), ordenada de mayor a menor cantidad.
export function buildArbolConStock(codigo, depositoId, total) {
  const pasillos = buildPasillos(depositoId)
  const sugerencias = stockUbicacionesDe(codigo, depositoId, total)
  const stockPorHoja = new Map(sugerencias.map((s) => [s.id, s.cantidad]))
  const pasillosConStock = pasillos.map((p) => ({
    ...p,
    hijos: p.hijos.map((h) => ({ ...h, stock: stockPorHoja.get(h.id) ?? 0 })),
  }))
  return { pasillos: pasillosConStock, sugerencias }
}
