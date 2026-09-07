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

const DEPOSITO_IDS = [1, 2]

// Reparte un total entre los depósitos con una proporción variable (30%-70%)
// para que cada artículo tenga una distribución distinta pero determinística.
function splitPorDeposito(rnd, total) {
  const ratio = 0.3 + rnd() * 0.4
  const d1 = Math.round(total * ratio)
  const d2 = total - d1
  return { [DEPOSITO_IDS[0]]: d1, [DEPOSITO_IDS[1]]: d2 }
}

// Cruza los agrupadores seleccionados (id + valores habilitados) con el
// maestro de agrupadores y arma todas las combinaciones posibles. Lo usan
// tanto el generador de catálogo de variantes como el wizard de "Agregar
// agrupadores", que necesita previsualizar las combinaciones antes de
// generarlas.
export function buildGroupersYCombos(seleccion, agrupadores) {
  const groupers = (seleccion || [])
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

  return {
    groupers,
    combos: combos.map((vals) => ({ key: groupers.map((g) => vals[g.id].code).join('/'), vals })),
  }
}

export function buildVariantesArticulo(producto, agrupadores) {
  const seed = hashCode(producto.codigo)
  const rnd = mulberry32(seed)

  const { groupers, combos } = buildGroupersYCombos(producto.variantes?.seleccion, agrupadores)

  // Los productos configurados desde el wizard "Agregar agrupadores" traen
  // una lista explícita de combinaciones excluidas por el usuario; el resto
  // arranca generado con stock 0 (recién configurado, sin distribuir). Los
  // productos de demo "de fábrica" (sin este campo) siguen con el esquema
  // aleatorio de siempre, para no cambiarles el aspecto.
  const excluidas = producto.variantes?.excluidas
  const usaExclusionExplicita = Array.isArray(excluidas)
  const excluidasSet = usaExclusionExplicita ? new Set(excluidas) : null

  const priceMode = producto.variantes?.priceMode ?? 'base'
  const adicionalesCfg = producto.variantes?.adicionales ?? {}
  const precioBase = 3000 + Math.floor(rnd() * 34) * 500

  const variants = combos.map(({ key, vals }) => {
    const codigo = `${producto.codigo}-${groupers.map((g) => vals[g.id].code).join('-')}`
    const noGenerada = usaExclusionExplicita ? excluidasSet.has(key) : rnd() < 0.15
    const stock = noGenerada ? 0 : (usaExclusionExplicita ? 0 : Math.floor(rnd() * 40))
    let precioAdic = 0
    if (priceMode === 'adicional') {
      groupers.forEach((g) => {
        const cfg = adicionalesCfg[g.id]
        const val = vals[g.id]
        if (cfg && cfg[val.code] != null) precioAdic += Number(cfg[val.code]) || 0
      })
    }
    // Las variantes generadas desde el wizard "Agregar agrupadores" nacen sin
    // código de barra asignado (se carga después, no se inventa uno solo).
    const codBarras = (noGenerada || usaExclusionExplicita) ? [] : [`779${pad(1000000 + Math.floor(rnd() * 8999999), 7)}`]
    const stockPorDeposito = noGenerada
      ? { [DEPOSITO_IDS[0]]: 0, [DEPOSITO_IDS[1]]: 0 }
      : splitPorDeposito(rnd, stock)
    return {
      id: `${producto.codigo}:${key}`,
      key,
      vals,
      status: noGenerada ? 'no' : 'gen',
      stock,
      stockPorDeposito,
      precioAdic,
      codigo,
      codBarras,
    }
  })

  const stockBase = Math.floor(rnd() * 25)
  const stockBasePorDeposito = splitPorDeposito(rnd, stockBase)

  return {
    id: producto.codigo,
    codigo: producto.codigo,
    nombre: producto.descripcion,
    rubro: producto.familia || 'Sin familia',
    precioBase,
    stockBase,
    stockBasePorDeposito,
    groupers,
    variants,
  }
}
