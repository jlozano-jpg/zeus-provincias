import { useMemo, useState } from 'react'
import {
  IconX, IconCheck, IconArrowLeft, IconMapPin, IconAlertTriangle,
} from '@tabler/icons-react'
import { buildArbolConStock } from '../../data/ubicacionesData'
import UbicacionCantidadRows, { filasIniciales, filasCompletas, sumaFilas } from './UbicacionCantidadRows'
import VariantChips from './VariantChips'
import { fmt } from './format'

const PASOS = [
  { id: 1, label: 'Origen' },
  { id: 2, label: 'Destino' },
]

export default function DistribuirUbicacionesWizard({
  art, dep, distStockBase, distTotal, variantes, groupers, onCancel, onConfirm,
}) {
  const origenInfo = useMemo(
    () => buildArbolConStock(art.codigo, dep.id, distStockBase),
    [art.codigo, dep.id, distStockBase]
  )
  const origenUnica = origenInfo.sugerencias.length <= 1
  const origenUbicacionUnica = origenInfo.sugerencias[0] || null

  // Si el artículo base tiene stock en una única ubicación de origen, no hay
  // nada que decidir en ese paso: se descuenta de ahí sí o sí y el wizard
  // arranca directo en Destino.
  const [paso, setPaso] = useState(origenUnica ? 2 : 1)
  const [intentoContinuar, setIntentoContinuar] = useState(false)
  const [intentoConfirmar, setIntentoConfirmar] = useState(false)
  const [origenFilas, setOrigenFilas] = useState(() => filasIniciales(distTotal, origenInfo.sugerencias))

  const destinoInfo = useMemo(
    () => Object.fromEntries(
      variantes.map((v) => [v.id, buildArbolConStock(v.codigo, dep.id, v.stockEnDeposito)])
    ),
    [variantes, dep.id]
  )
  const [destinoFilas, setDestinoFilas] = useState(() => Object.fromEntries(
    variantes.map((v) => [v.id, filasIniciales(v.cantidad, destinoInfo[v.id].sugerencias)])
  ))

  const origenValido = origenUnica || filasCompletas(origenFilas, distTotal)
  const destinoValido = variantes.every((v) => filasCompletas(destinoFilas[v.id], v.cantidad))

  function irADestino() {
    if (!origenValido) { setIntentoContinuar(true); return }
    setPaso(2)
  }

  function volverAOrigen() {
    setPaso(1)
  }

  function confirmar() {
    if (!destinoValido) { setIntentoConfirmar(true); return }
    onConfirm()
  }

  return (
    <aside className="vg-wizard-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconMapPin size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">{art.codigo} · {dep.nombre}</div>
          <div className="va-title">Ubicaciones de la distribución</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onCancel} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      {!origenUnica && (
        <div className="vg-wizard-steps">
          {PASOS.map((p) => (
            <div key={p.id} className={`vg-wizard-step ${paso === p.id ? 'is-active' : ''} ${paso > p.id ? 'is-done' : ''}`}>
              <span className="vg-wizard-step-dot">{paso > p.id ? <IconCheck size={12} stroke={2.4} /> : p.id}</span>
              {p.label}
            </div>
          ))}
        </div>
      )}

      <div className="vg-wizard-body">
        {paso === 1 && (
          <div className="vg-wizard-content">
            <div className="vg-wizard-content-intro">
              De qué ubicación del depósito <b>{dep.nombre}</b> se descuentan las <b>{fmt(distTotal)}</b> unidades del artículo base.
            </div>
            {origenUnica ? (
              <div className="vg-ubic-info">
                El artículo tiene stock en una única ubicación. Las <b>{fmt(distTotal)}</b> u. se descontarán
                automáticamente de <b>{dep.nombre} · {origenUbicacionUnica ? origenUbicacionUnica.label : 'Ubicación general'}</b>.
              </div>
            ) : (
              <>
                <UbicacionCantidadRows
                  pasillos={origenInfo.pasillos}
                  sugerenciaPrincipalId={origenInfo.sugerencias[0]?.id ?? null}
                  total={distTotal}
                  filas={origenFilas}
                  onChange={setOrigenFilas}
                  agregarLabel="Agregar ubicación de origen"
                />
                <div className={`vg-ubic-resumen ${sumaFilas(origenFilas) === distTotal ? 'is-ok' : ''}`}>
                  {fmt(distTotal)} u. a descontar · {sumaFilas(origenFilas) === distTotal ? 'completo' : `restan ${fmt(distTotal - sumaFilas(origenFilas))}`}
                </div>
                {intentoContinuar && !origenValido && (
                  <div className="vg-alert vg-alert-danger">
                    <IconAlertTriangle size={15} stroke={1.9} />
                    Completá la ubicación y cantidad para las {fmt(distTotal)} u. a descontar antes de continuar.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="vg-wizard-content">
            {origenUnica && (
              <div className="vg-ubic-info">
                Se descuentan <b>{fmt(distTotal)}</b> u. de <b>{dep.nombre} · {origenUbicacionUnica ? origenUbicacionUnica.label : 'Ubicación general'}</b>, la única ubicación donde el artículo base tiene stock.
              </div>
            )}
            {variantes.map((v) => {
              const filas = destinoFilas[v.id]
              const suma = sumaFilas(filas)
              const restante = v.cantidad - suma
              const completo = restante === 0
              const bloqueValido = filasCompletas(filas, v.cantidad)
              return (
                <div className="vg-dest-bloque" key={v.id}>
                  <div className="vg-dest-bloque-head">
                    <VariantChips groupers={groupers} vals={v.vals} />
                    <span className={`vg-dest-bloque-total ${completo ? 'is-ok' : ''}`}>
                      {fmt(v.cantidad)} u. a ingresar · {completo ? 'completo' : `restan ${fmt(Math.max(restante, 0))}`}
                    </span>
                  </div>
                  <UbicacionCantidadRows
                    pasillos={destinoInfo[v.id].pasillos}
                    sugerenciaPrincipalId={destinoInfo[v.id].sugerencias[0]?.id ?? null}
                    total={v.cantidad}
                    filas={filas}
                    onChange={(next) => setDestinoFilas((prev) => ({ ...prev, [v.id]: next }))}
                    agregarLabel="Agregar otra ubicación"
                  />
                  {intentoConfirmar && !bloqueValido && (
                    <div className="vg-alert vg-alert-danger">
                      <IconAlertTriangle size={15} stroke={1.9} />
                      Completá la ubicación y cantidad para las {fmt(v.cantidad)} u. de esta variante antes de confirmar.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="va-panel-foot">
        {paso === 2 && !origenUnica ? (
          <button type="button" className="va-btn va-btn-secondary" onClick={volverAOrigen}>
            <IconArrowLeft size={14} stroke={1.8} /> Atrás
          </button>
        ) : (
          <button type="button" className="va-btn va-btn-secondary" onClick={onCancel}>Cancelar</button>
        )}
        {paso === 1 ? (
          <button type="button" className="va-btn va-btn-primary" onClick={irADestino}>
            Continuar
          </button>
        ) : (
          <button type="button" className="va-btn va-btn-primary" onClick={confirmar}>
            <IconCheck size={15} stroke={2} /> Confirmar distribución
          </button>
        )}
      </div>
    </aside>
  )
}
