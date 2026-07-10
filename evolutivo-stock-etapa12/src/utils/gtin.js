// Estructura de cada estándar tal como fue validada con el PO
// (ver generador_codigos_barra.ts). El dígito verificador usa el
// algoritmo estándar GS1 módulo 10, igual para GTIN-8/13/14.

const LENGTH_BY_TYPE = { 'GTIN-8': 8, 'GTIN-13': 13, 'GTIN-14': 14 }

const MAX_PREFIJO_BY_TYPE = { 'GTIN-8': 6, 'GTIN-13': 11, 'GTIN-14': 11, 'GS1-128': 11 }

export function maxPrefijoGs1(tipo) {
  return MAX_PREFIJO_BY_TYPE[tipo] ?? 0
}

function checkDigit(payload) {
  const digits = payload.split('').reverse().map(Number)
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0)
  const resto = sum % 10
  return resto === 0 ? 0 : 10 - resto
}

// Numeración interna secuencial (usada como referencia de artículo, y como
// reemplazo del prefijo de empresa cuando no hay Prefijo GS1 configurado).
let contadorSecuencial = 1
function siguienteSecuencial() {
  return contadorSecuencial++
}

function numeracionInterna(longitud, secuencial) {
  return String(secuencial).padStart(longitud, '0').slice(-longitud)
}

// GTIN-8: prefijo (config, o 3 dígitos internos) + referencia (completa a 7) + verificador.
// GS1 no permite armar un GTIN-8 libremente: este código es válido en formato,
// pero de uso interno. Un GTIN-8 oficial se carga por "Ingresar existente".
function generarGTIN8(prefijo) {
  const longitudPrefijo = prefijo ? prefijo.length : 3
  const longitudReferencia = 7 - longitudPrefijo
  const prefijoFinal = prefijo || numeracionInterna(longitudPrefijo, 0)
  const referencia = numeracionInterna(longitudReferencia, siguienteSecuencial())
  const base = prefijoFinal + referencia
  return base + checkDigit(base)
}

// GTIN-13: prefijo de empresa (config, o numeración interna de 7) + referencia
// (completa a 12) + verificador.
function generarGTIN13(prefijo) {
  const prefijoFinal = prefijo || numeracionInterna(7, 0)
  const longitudReferencia = 12 - prefijoFinal.length
  const referencia = numeracionInterna(longitudReferencia, siguienteSecuencial())
  const base = prefijoFinal + referencia
  return base + checkDigit(base)
}

// GTIN-14: indicador de variable logística (1-8) + base de 12 dígitos
// (misma lógica que GTIN-13 sin su verificador) + verificador recalculado.
// La cantidad (ej. pack de 6) no se codifica acá, se guarda aparte en Zeus.
function generarGTIN14(prefijo, indicadorLogistico = 1) {
  const prefijoFinal = prefijo || numeracionInterna(7, 0)
  const longitudReferencia = 12 - prefijoFinal.length
  const referencia = numeracionInterna(longitudReferencia, siguienteSecuencial())
  const base = String(indicadorLogistico) + prefijoFinal + referencia
  return base + checkDigit(base)
}

function formatearFechaAI17(vencimientoIso) {
  const [yyyy, mm, dd] = vencimientoIso.split('-')
  return `${yyyy.slice(-2)}${mm}${dd}`
}

// GS1-128: (01) GTIN-14 del artículo + (10) lote + (17) vencimiento (AAMMDD)
// + (30) cantidad representada por este código puntual. Lote y vencimiento
// provienen de un lote ya existente del artículo.
function generarGS1128(prefijo, lote, cantidad) {
  const gtin14Articulo = generarGTIN14(prefijo)
  const ai01 = `(01)${gtin14Articulo}`
  const ai10 = `(10)${lote.lote}`
  const ai17 = `(17)${formatearFechaAI17(lote.vencimiento)}`
  const ai30 = `(30)${cantidad}`
  return ai01 + ai10 + ai17 + ai30
}

function generarCodigoManual(longitud = 10) {
  return numeracionInterna(longitud, siguienteSecuencial())
}

export function generarCodigo(tipo, { lote, prefijo, cantidad, longitud } = {}) {
  if (tipo === 'GTIN-8') return generarGTIN8(prefijo)
  if (tipo === 'GTIN-13') return generarGTIN13(prefijo)
  if (tipo === 'GTIN-14') return generarGTIN14(prefijo)
  if (tipo === 'GS1-128') return generarGS1128(prefijo, lote, cantidad)
  return generarCodigoManual(longitud)
}

export function validarFormato(tipo, codigo) {
  if (tipo === 'MANUAL' || tipo === 'GS1-128') {
    return codigo.trim().length > 0
  }
  const length = LENGTH_BY_TYPE[tipo]
  if (!new RegExp(`^\\d{${length}}$`).test(codigo)) return false
  const payload = codigo.slice(0, -1)
  const digit = Number(codigo.slice(-1))
  return checkDigit(payload) === digit
}

export function mensajeFormatoInvalido(tipo) {
  if (tipo === 'GS1-128') return 'Ingresá el código escaneado.'
  if (tipo === 'MANUAL') return 'Ingresá un código.'
  const length = LENGTH_BY_TYPE[tipo]
  return `Debe tener ${length} dígitos numéricos con dígito verificador válido.`
}

export function existeCodigoDuplicado(articulos, codigo, { excluirArticuloId, excluirCodigoId } = {}) {
  return articulos.some((articulo) =>
    articulo.codigos.some(
      (c) =>
        c.codigo === codigo &&
        !(articulo.id === excluirArticuloId && c.id === excluirCodigoId)
    )
  )
}
