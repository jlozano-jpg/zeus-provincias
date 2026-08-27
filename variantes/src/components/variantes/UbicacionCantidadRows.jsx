import { useState } from 'react'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import UbicacionTreeSelector from './UbicacionTreeSelector'
import { fmt } from './format'

let rowSeq = 0
function nextRowId() {
  rowSeq += 1
  return `ub-row-${rowSeq}`
}

function filaVacia(cantidad = null) {
  return { id: nextRowId(), ubicacionId: null, ubicacionLabel: '', cantidad }
}

// Renglón inicial de un bloque: si el código ya tiene stock en alguna
// ubicación del depósito, se pre-cargan esas ubicaciones repartiendo el
// total a reconciliar; si no, arranca con un único renglón vacío.
export function filasIniciales(total, sugerencias) {
  if (!sugerencias.length || total <= 0) return [filaVacia()]
  const filas = []
  let restante = total
  for (const s of sugerencias) {
    if (restante <= 0) break
    const cant = Math.min(restante, s.cantidad)
    filas.push({ id: nextRowId(), ubicacionId: s.id, ubicacionLabel: s.label, cantidad: cant })
    restante -= cant
  }
  if (restante > 0) filas.push(filaVacia(restante))
  return filas.length ? filas : [filaVacia()]
}

export function sumaFilas(filas) {
  return filas.reduce((s, r) => s + (Number(r.cantidad) || 0), 0)
}

export function filasCompletas(filas, total) {
  return sumaFilas(filas) === total && filas.every((r) => r.ubicacionId && Number(r.cantidad) > 0)
}

export default function UbicacionCantidadRows({
  pasillos, sugerenciaPrincipalId, total, filas, onChange, agregarLabel,
}) {
  const [openRowId, setOpenRowId] = useState(null)

  const suma = sumaFilas(filas)
  const restante = total - suma

  function actualizarFila(idx, patch) {
    const next = filas.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    if (idx === filas.length - 1) {
      const r = next[idx]
      if (r.ubicacionId && Number(r.cantidad) > 0) {
        const restanteNuevo = total - sumaFilas(next)
        if (restanteNuevo > 0) next.push(filaVacia(restanteNuevo))
      }
    }
    onChange(next)
  }

  function elegirUbicacion(idx, hoja) {
    actualizarFila(idx, { ubicacionId: hoja.id, ubicacionLabel: hoja.label })
    setOpenRowId(null)
  }

  function cambiarCantidad(idx, raw) {
    const otras = filas.reduce((s, r, i) => (i === idx ? s : s + (Number(r.cantidad) || 0)), 0)
    const max = Math.max(0, total - otras)
    const val = raw === '' ? null : Math.max(0, Math.min(Math.round(Number(raw) || 0), max))
    actualizarFila(idx, { cantidad: val })
  }

  function eliminarFila(idx) {
    if (filas.length <= 1) return
    onChange(filas.filter((_, i) => i !== idx))
    if (openRowId === filas[idx].id) setOpenRowId(null)
  }

  function agregarFila() {
    onChange([...filas, filaVacia(restante > 0 ? restante : null)])
  }

  return (
    <div className="vg-ubic-rows">
      {filas.map((r, idx) => (
        <div className="vg-ubic-row" key={r.id}>
          <div className="vg-ubic-row-main">
            <button
              type="button"
              className="vg-ubic-field"
              onClick={() => setOpenRowId(openRowId === r.id ? null : r.id)}
            >
              <IconSearch size={13} stroke={1.8} />
              <span className={r.ubicacionLabel ? '' : 'vg-ubic-field-placeholder'}>
                {r.ubicacionLabel || 'Elegir ubicación…'}
              </span>
            </button>
            <input
              type="number"
              className="vg-ubic-cant"
              placeholder="Cant."
              value={r.cantidad ?? ''}
              onChange={(e) => cambiarCantidad(idx, e.target.value)}
            />
            {filas.length > 1 && (
              <button type="button" className="va-btn-icon va-danger" onClick={() => eliminarFila(idx)} title="Quitar ubicación">
                <IconTrash size={14} stroke={1.6} />
              </button>
            )}
          </div>
          {openRowId === r.id && (
            <UbicacionTreeSelector
              pasillos={pasillos}
              sugeridaId={sugerenciaPrincipalId}
              onSelect={(hoja) => elegirUbicacion(idx, hoja)}
            />
          )}
        </div>
      ))}
      {restante > 0 && (
        <button type="button" className="vg-ubic-add" onClick={agregarFila}>
          + {agregarLabel || 'Agregar ubicación'}
        </button>
      )}
    </div>
  )
}
