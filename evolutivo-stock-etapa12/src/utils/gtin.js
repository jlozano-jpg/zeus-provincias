const LENGTH_BY_TYPE = { 'GTIN-8': 8, 'GTIN-13': 13, 'GTIN-14': 14 }

function checkDigit(payload) {
  const digits = payload.split('').reverse().map(Number)
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10
}

function randomDigits(length) {
  let out = ''
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10)
  return out
}

const PAYLOAD_LENGTH_BY_TYPE = { 'GTIN-8': 7, 'GTIN-13': 12, 'GTIN-14': 13, 'GTIN-128': 13 }

export function maxPrefijoGs1(tipo) {
  const payloadLength = PAYLOAD_LENGTH_BY_TYPE[tipo]
  return payloadLength ? payloadLength - 1 : 0
}

function randomPayload(length, prefijo = '') {
  const prefix = prefijo.slice(0, length)
  return prefix + randomDigits(length - prefix.length)
}

export function generarCodigo(tipo, { lote, prefijo } = {}) {
  if (tipo === 'GTIN-8' || tipo === 'GTIN-13') {
    const payload = randomPayload(LENGTH_BY_TYPE[tipo] - 1, prefijo)
    return payload + checkDigit(payload)
  }
  if (tipo === 'GTIN-14') {
    const payload = randomPayload(13, prefijo)
    return payload + checkDigit(payload)
  }
  if (tipo === 'GTIN-128') {
    const gtinPayload = randomPayload(13, prefijo)
    const gtin14 = gtinPayload + checkDigit(gtinPayload)
    const vencimiento = lote?.vencimiento ? lote.vencimiento.slice(2).split('-').reverse().join('') : '260101'
    const loteTexto = (lote?.lote || '').replace(/[^A-Za-z0-9]/g, '')
    return `01${gtin14}17${vencimiento}10${loteTexto}`
  }
  return `INT-${randomDigits(5)}`
}

export function validarFormato(tipo, codigo) {
  if (tipo === 'MANUAL' || tipo === 'GTIN-128') {
    return codigo.trim().length > 0
  }
  const length = LENGTH_BY_TYPE[tipo]
  if (!new RegExp(`^\\d{${length}}$`).test(codigo)) return false
  const payload = codigo.slice(0, -1)
  const digit = Number(codigo.slice(-1))
  return checkDigit(payload) === digit
}

export function mensajeFormatoInvalido(tipo) {
  if (tipo === 'GTIN-128') return 'Ingresá el código escaneado.'
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
