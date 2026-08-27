import { useState } from 'react'
import { IconSearch, IconChevronRight, IconMapPin } from '@tabler/icons-react'

export default function UbicacionTreeSelector({ pasillos, sugeridaId, onSelect }) {
  const [q, setQ] = useState('')
  const [expandidos, setExpandidos] = useState(() => {
    const init = {}
    pasillos.forEach((p) => {
      if (sugeridaId && p.hijos.some((h) => h.id === sugeridaId)) init[p.id] = true
    })
    return init
  })

  const qLower = q.trim().toLowerCase()
  const matchLabel = (label) => label.toLowerCase().includes(qLower)

  return (
    <div className="vg-ubic-tree">
      <div className="vg-ubic-tree-search">
        <IconSearch size={14} stroke={1.8} />
        <input
          placeholder="Buscar ubicación…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div className="vg-ubic-tree-body">
        {pasillos.map((p) => {
          const pasilloMatch = !qLower || matchLabel(p.label)
          const hijosVisibles = p.hijos.filter((h) => !qLower || pasilloMatch || matchLabel(h.label))
          if (qLower && !pasilloMatch && hijosVisibles.length === 0) return null
          const abierto = qLower ? true : !!expandidos[p.id]
          return (
            <div className="vg-ubic-pasillo" key={p.id}>
              <button
                type="button"
                className="vg-ubic-pasillo-head"
                onClick={() => setExpandidos((e) => ({ ...e, [p.id]: !e[p.id] }))}
              >
                <IconChevronRight size={13} stroke={2.2} className={`vg-ubic-chevron ${abierto ? 'is-open' : ''}`} />
                {p.label}
              </button>
              {abierto && (
                <div className="vg-ubic-estantes">
                  {(qLower ? hijosVisibles : p.hijos).map((h) => (
                    <button
                      type="button"
                      key={h.id}
                      className={`vg-ubic-hoja ${h.id === sugeridaId ? 'is-suggested' : ''}`}
                      onClick={() => onSelect(h)}
                    >
                      <IconMapPin size={12} stroke={1.8} />
                      {h.label}
                      <span className="vg-ubic-hoja-stock">(Stock: {h.stock})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
