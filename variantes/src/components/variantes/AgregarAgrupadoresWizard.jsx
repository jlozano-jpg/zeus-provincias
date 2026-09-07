import { useMemo, useState } from 'react'
import { IconX, IconCheck, IconArrowLeft, IconVersions } from '@tabler/icons-react'
import { buildGroupersYCombos } from '../../data/variantesGeneratorData'
import VariantesTab from '../productos/VariantesTab'
import VariantChips from './VariantChips'
import { fmt } from './format'

const PASOS = [
  { id: 1, label: 'Agrupadores' },
  { id: 2, label: 'Combinaciones' },
]

function draftInicial(producto) {
  const v = producto.variantes
  return {
    seleccion: v?.seleccion ? v.seleccion.map((s) => ({ ...s, valuesSelected: [...s.valuesSelected] })) : [],
    priceMode: v?.priceMode ?? 'base',
    adicionales: v?.adicionales ? { ...v.adicionales } : {},
  }
}

export default function AgregarAgrupadoresWizard({ producto, agrupadores, onClose, onGenerar }) {
  const [paso, setPaso] = useState(1)
  const [variantes, setVariantes] = useState(() => draftInicial(producto))
  const [excluidas, setExcluidas] = useState(() => new Set(producto.variantes?.excluidas ?? []))

  const hasEmpty = variantes.seleccion.some((s) => s.valuesSelected.length === 0)
  const isValid = variantes.seleccion.length > 0 && !hasEmpty

  const { groupers, combos } = useMemo(
    () => buildGroupersYCombos(variantes.seleccion, agrupadores),
    [variantes.seleccion, agrupadores]
  )

  const incluidas = combos.length - excluidas.size

  function irARevision() {
    if (!isValid) return
    setExcluidas((prev) => new Set([...prev].filter((k) => combos.some((c) => c.key === k))))
    setPaso(2)
  }

  function toggleExcluida(key) {
    setExcluidas((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function confirmar() {
    if (incluidas <= 0) return
    onGenerar({
      seleccion: variantes.seleccion,
      priceMode: variantes.priceMode,
      adicionales: variantes.adicionales,
      excluidas: [...excluidas],
    })
  }

  return (
    <aside className="vg-wizard-panel vg-wizard-panel-wide">
      <div className="va-panel-head">
        <div className="va-ico"><IconVersions size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">{producto.codigo}</div>
          <div className="va-title">Agregar agrupadores</div>
        </div>
        <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
          <IconX size={18} stroke={1.6} />
        </button>
      </div>

      <div className="vg-wizard-steps">
        {PASOS.map((p) => (
          <div key={p.id} className={`vg-wizard-step ${paso === p.id ? 'is-active' : ''} ${paso > p.id ? 'is-done' : ''}`}>
            <span className="vg-wizard-step-dot">{paso > p.id ? <IconCheck size={12} stroke={2.4} /> : p.id}</span>
            {p.label}
          </div>
        ))}
      </div>

      <div className="vg-wizard-body">
        {paso === 1 && (
          <VariantesTab
            agrupadores={agrupadores}
            variantes={variantes}
            setVariantes={setVariantes}
            mostrarCriterioPrecio={false}
          />
        )}

        {paso === 2 && (
          <div className="vg-wizard-content">
            <div className="vg-wizard-content-intro">
              Se generan <b>{fmt(combos.length)}</b> combinaciones a partir de los agrupadores elegidos.
              Destildá las que no querés generar.
            </div>

            <div className="va-card st-table-card">
              <div className="va-card-scroll">
                <table className="va-grid">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }} />
                      <th>Código</th>
                      <th>Variante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map(({ key, vals }) => {
                      const incluida = !excluidas.has(key)
                      const codigo = `${producto.codigo}-${groupers.map((g) => vals[g.id].code).join('-')}`
                      return (
                        <tr
                          key={key}
                          className={incluida ? 'is-selected' : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleExcluida(key)}
                        >
                          <td>
                            <span className={`vg-checkbox ${incluida ? 'is-checked' : ''}`}>
                              {incluida && <IconCheck size={11} stroke={3} />}
                            </span>
                          </td>
                          <td className="pr-cell-muted vg-mono">{codigo}</td>
                          <td><VariantChips groupers={groupers} vals={vals} /></td>
                        </tr>
                      )
                    })}
                    {combos.length === 0 && (
                      <tr><td colSpan={3} className="va-empty-cell">No hay combinaciones para generar</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="va-panel-foot">
        {paso === 2 ? (
          <button type="button" className="va-btn va-btn-secondary" onClick={() => setPaso(1)}>
            <IconArrowLeft size={14} stroke={1.8} /> Atrás
          </button>
        ) : (
          <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        )}
        {paso === 1 ? (
          <button type="button" className="va-btn va-btn-primary" disabled={!isValid} onClick={irARevision}>
            Continuar
          </button>
        ) : (
          <button type="button" className="va-btn va-btn-primary" disabled={incluidas <= 0} onClick={confirmar}>
            <IconCheck size={15} stroke={2} /> Generar {incluidas > 0 ? `(${fmt(incluidas)})` : ''}
          </button>
        )}
      </div>
    </aside>
  )
}
