// Genera, de forma determinística por código de producto, el catálogo de
// variantes (combinaciones agrupador × agrupador) que consume la pantalla
// Gestión de Variantes: cuáles ya están "generadas" (con stock) y cuáles
// quedan pendientes de generar, más un stock base sin distribuir.

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

function pad(n, len) {
  return String(n).padStart(len, '0')
}

export function buildVariantesArticulo(producto, agrupadores) {
  const seed = hashCode(producto.codigo)
  const rnd = mulberry32(seed)

  const groupers = (producto.variantes?.seleccion || [])
    .map((s) => {
      const master = agrupadores.find((a) => a.id === s.agrupadorId)
      if (!master) return null
      return {
        id: s.agrupadorId,
        nombre: master.name,
        valores: master.values.filter((v) => s.valuesSelected.includes(v.code)),
      }
    })
    .filter((g) => g && g.valores.length > 0)

  const combos = groupers.reduce((acc, g) => {
    if (acc.length === 0) return g.valores.map((v) => ({ [g.id]: v }))
    const next = []
    acc.forEach((combo) => g.valores.forEach((v) => next.push({ ...combo, [g.id]: v })))
    return next
  }, [])

  const priceMode = producto.variantes?.priceMode ?? 'base'
  const adicionalesCfg = producto.variantes?.adicionales ?? {}
  const precioBase = 3000 + Math.floor(rnd() * 34) * 500

  const variants = combos.map((vals) => {
    const key = groupers.map((g) => vals[g.id].code).join('/')
    const codigo = `${producto.codigo}-${groupers.map((g) => vals[g.id].code).join('-')}`
    const noGenerada = rnd() < 0.15
    const stock = noGenerada ? 0 : Math.floor(rnd() * 40)
    let precioAdic = 0
    if (priceMode === 'adicional') {
      groupers.forEach((g) => {
        const cfg = adicionalesCfg[g.id]
        const val = vals[g.id]
        if (cfg && cfg[val.code] != null) precioAdic += Number(cfg[val.code]) || 0
      })
    }
    const codBarras = noGenerada ? [] : [`779${pad(1000000 + Math.floor(rnd() * 8999999), 7)}`]
    return {
      id: `${producto.codigo}:${key}`,
      key,
      vals,
      status: noGenerada ? 'no' : 'gen',
      stock,
      precioAdic,
      codigo,
      codBarras,
    }
  })

  const stockBase = Math.floor(rnd() * 25)

  return {
    id: producto.codigo,
    codigo: producto.codigo,
    nombre: producto.descripcion,
    rubro: producto.familia || 'Sin familia',
    precioBase,
    stockBase,
    groupers,
    variants,
  }
}
