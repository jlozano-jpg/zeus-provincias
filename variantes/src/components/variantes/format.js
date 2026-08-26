export function fmt(n) {
  return Number(n ?? 0).toLocaleString('es-AR')
}

export function money(n) {
  return `$ ${Number(n ?? 0).toLocaleString('es-AR')}`
}
