// Genera un libro de movimientos de stock de ejemplo, determinístico por
// código de producto (misma semilla → siempre el mismo resultado), para no
// tener que autorar a mano un dataset por cada artículo del catálogo.

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

const SUCURSALES = ['Suc 1', 'Suc 1', 'Suc 1', 'Suc 2']
const MOV_TEMPLATES = [
  { tipo: 'FC-COMPRA', comprobante: 'A - 0656', desc: '—' },
  { tipo: 'FC-COMPRA', comprobante: 'A - 0712', desc: '—' },
  { tipo: 'FC-VENTA', comprobante: 'A - 0001', desc: 'VENTA MOSTRADOR' },
  { tipo: 'FC-VENTA', comprobante: 'A - 0001', desc: '—' },
  { tipo: 'AJUSTE', comprobante: 'AJ - 0001', desc: 'AJUSTE POR INVENTARIO' },
  { tipo: 'TRANSF', comprobante: 'T - 0001', desc: 'TRANSFERENCIA ENTRE DEPÓSITOS' },
]

function pad(n, len) {
  return String(n).padStart(len, '0')
}

function formatFecha(day) {
  const d = new Date(2026, 3, 19 + day)
  return `${pad(d.getDate(), 2)}/${pad(d.getMonth() + 1, 2)}/${d.getFullYear()}`
}

function variantCombos(producto, agrupadores) {
  const seleccion = producto?.variantes?.seleccion || []
  if (seleccion.length === 0) return []
  const dims = seleccion.map((s) => {
    const master = agrupadores.find((a) => a.id === s.agrupadorId)
    if (!master) return []
    return master.values.filter((v) => s.valuesSelected.includes(v.code))
  }).filter((d) => d.length > 0)
  if (dims.length === 0) return []
  return dims.reduce((acc, dim) => {
    if (acc.length === 0) return dim.map((v) => [v])
    const next = []
    acc.forEach((combo) => dim.forEach((v) => next.push([...combo, v])))
    return next
  }, [])
}

export function buildStockLedger(producto, agrupadores) {
  const seed = hashCode(producto.codigo)
  const rnd = mulberry32(seed)
  const combos = variantCombos(producto, agrupadores)
  const esBase = combos.length > 0

  function generate(count, useVariants) {
    let saldo = 0
    let day = 1
    const rows = []
    for (let i = 0; i < count; i++) {
      day += 1 + Math.floor(rnd() * 4)
      const tpl = MOV_TEMPLATES[Math.floor(rnd() * MOV_TEMPLATES.length)]
      const isIngreso = tpl.tipo === 'FC-COMPRA' || (tpl.tipo === 'AJUSTE' && rnd() > 0.5)
      const cantidad = Math.round((3 + rnd() * 15))
      const ingreso = isIngreso ? cantidad : null
      const egreso = !isIngreso ? cantidad : null
      saldo += isIngreso ? cantidad : -cantidad
      if (saldo < 0) saldo = cantidad
      rows.push({
        fecha: formatFecha(day),
        hora: `${pad(8 + Math.floor(rnd() * 9), 2)}:${pad(Math.floor(rnd() * 60), 2)}:${pad(Math.floor(rnd() * 60), 2)}`,
        tipo: tpl.tipo,
        sucursal: SUCURSALES[Math.floor(rnd() * SUCURSALES.length)],
        comprobante: `${tpl.comprobante} - ${pad(Math.floor(rnd() * 99999), 8)}`,
        descripcion: tpl.desc,
        ingreso,
        egreso,
        saldo,
        deposito: 1 + Math.floor(rnd() * 2),
        variante: useVariants && combos.length > 0 ? combos[Math.floor(rnd() * combos.length)] : null,
      })
    }
    return rows
  }

  const movimientosBase = generate(4 + Math.floor(rnd() * 4), false)
  const movimientosVariante = esBase ? generate(6 + Math.floor(rnd() * 6), true) : []

  const stockTotalBase = movimientosBase.length ? movimientosBase[movimientosBase.length - 1].saldo : 0
  const comprometidoBase = 2 + Math.floor(rnd() * 8)
  const acopiadoBase = Math.floor(rnd() * 5)
  const enTransitoBase = rnd() > 0.7 ? 1 + Math.floor(rnd() * 4) : 0

  const stockTotalVariante = movimientosVariante.length ? movimientosVariante[movimientosVariante.length - 1].saldo + stockTotalBase : stockTotalBase
  const comprometidoVariante = comprometidoBase + Math.floor(rnd() * 12)
  const acopiadoVariante = acopiadoBase + Math.floor(rnd() * 4)

  return {
    esBase,
    combos,
    base: {
      movimientos: movimientosBase,
      stockTotal: stockTotalBase,
      comprometido: comprometidoBase,
      acopiado: acopiadoBase,
      enTransito: enTransitoBase,
      disponible: Math.max(0, stockTotalBase - comprometidoBase - acopiadoBase),
    },
    variante: esBase ? {
      movimientos: movimientosVariante,
      stockTotal: stockTotalVariante,
      comprometido: comprometidoVariante,
      acopiado: acopiadoVariante,
      enTransito: enTransitoBase,
      disponible: Math.max(0, stockTotalVariante - comprometidoVariante - acopiadoVariante),
    } : null,
  }
}
