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

const CLIENTES = [
  { codigo: '0', nombre: 'CLIENTE EVENTUAL' },
  { codigo: '0000001', nombre: 'JAVIER LOZANO' },
  { codigo: '00001', nombre: 'CONSUMIDOR FINAL' },
  { codigo: '00010', nombre: 'CONSPAPA RUBEN' },
  { codigo: '00011', nombre: 'EVILIC EZEQUIEL' },
  { codigo: '00012', nombre: 'RÓPOLIS GERMÁN' },
  { codigo: '00015', nombre: 'SYNTHESTRE MAXIMILIANO' },
  { codigo: '00017', nombre: 'SPECISM LUCAS' },
  { codigo: '00020', nombre: 'PREBIZ LEONARDO' },
  { codigo: '00022', nombre: 'RETROBOROS SA' },
  { codigo: '0031', nombre: 'TRAMA GABRIEL' },
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

// Listados tipo "Stock Acopiado" / "Stock Comprometido": fecha, sucursal,
// comprobante (factura o pedido), cliente y cantidad.
function generateClienteListado(rnd, count, prefijo, conCantidadUm) {
  let day = 1
  let nro = 400 + Math.floor(rnd() * 9000)
  const rows = []
  for (let i = 0; i < count; i++) {
    day += 1 + Math.floor(rnd() * 6)
    nro += 1 + Math.floor(rnd() * 4)
    const cliente = CLIENTES[Math.floor(rnd() * CLIENTES.length)]
    rows.push({
      fecha: formatFecha(day),
      sucursal: 1 + Math.floor(rnd() * 2),
      comprobante: `${prefijo} - 0001 - ${pad(nro, 8)}`,
      cliente: `${cliente.codigo} - ${cliente.nombre}`,
      cantidad: 1 + Math.floor(rnd() * 5),
      cantidadUm: conCantidadUm ? 0 : undefined,
    })
  }
  return rows
}

function generateUbicaciones(rnd, deposito1Total) {
  const total = Math.max(0, Math.round(deposito1Total))
  if (total === 0) return []
  const count = 1 + Math.floor(rnd() * 2)
  let remaining = total
  const rows = []
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1
    const qty = isLast ? remaining : Math.max(1, Math.round(remaining * (0.3 + rnd() * 0.4)))
    remaining -= qty
    rows.push({ deposito: 1, ubicacion: `1-${1 + Math.floor(rnd() * 200)}`, stock: qty })
  }
  return rows.filter((r) => r.stock > 0)
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
  const enTransitoBase = rnd() > 0.7 ? 1 + Math.floor(rnd() * 4) : 0

  const acopiosBase = generateClienteListado(rnd, Math.floor(rnd() * 5), 'A', false)
  const comprometidosBase = generateClienteListado(rnd, 2 + Math.floor(rnd() * 8), 'B', true)
  const acopiadoBase = acopiosBase.reduce((s, r) => s + r.cantidad, 0)
  const comprometidoBase = comprometidosBase.reduce((s, r) => s + r.cantidad, 0)

  const stockTotalVariante = movimientosVariante.length ? movimientosVariante[movimientosVariante.length - 1].saldo + stockTotalBase : stockTotalBase
  const acopiosVariante = [...acopiosBase, ...generateClienteListado(rnd, Math.floor(rnd() * 4), 'A', false)]
  const comprometidosVariante = [...comprometidosBase, ...generateClienteListado(rnd, Math.floor(rnd() * 10), 'B', true)]
  const acopiadoVariante = acopiosVariante.reduce((s, r) => s + r.cantidad, 0)
  const comprometidoVariante = comprometidosVariante.reduce((s, r) => s + r.cantidad, 0)

  const ubicaciones = generateUbicaciones(rnd, stockTotalBase)

  return {
    esBase,
    combos,
    ubicaciones,
    base: {
      movimientos: movimientosBase,
      stockTotal: stockTotalBase,
      comprometido: comprometidoBase,
      comprometidos: comprometidosBase,
      acopiado: acopiadoBase,
      acopios: acopiosBase,
      enTransito: enTransitoBase,
      disponible: Math.max(0, stockTotalBase - comprometidoBase - acopiadoBase),
    },
    variante: esBase ? {
      movimientos: movimientosVariante,
      stockTotal: stockTotalVariante,
      comprometido: comprometidoVariante,
      comprometidos: comprometidosVariante,
      acopiado: acopiadoVariante,
      acopios: acopiosVariante,
      enTransito: enTransitoBase,
      disponible: Math.max(0, stockTotalVariante - comprometidoVariante - acopiadoVariante),
    } : null,
  }
}
