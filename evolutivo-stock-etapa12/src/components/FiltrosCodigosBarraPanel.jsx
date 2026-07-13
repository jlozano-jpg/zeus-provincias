import { useEffect, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { FAMILIAS, PROVEEDORES, SUCURSALES, GRUPOS, MARCAS, CATEGORIAS } from '../data/codigosBarra'
import styles from './FiltrosCodigosBarraPanel.module.css'

export function filtrosVacios() {
  return {
    sucursal: '',
    familia: '',
    proveedor: '',
    codigoFabricante: '',
    grupo: '',
    marca: '',
    categoria: '',
    soloSinCodigo: false,
  }
}

export function hayFiltrosActivos(filtros) {
  const vacios = filtrosVacios()
  return Object.keys(vacios).some((key) => filtros[key] !== vacios[key])
}

export default function FiltrosCodigosBarraPanel({ filtros, onApply, onClose }) {
  const [form, setForm] = useState(filtros)

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const handleApply = () => {
    onApply(form)
    onClose()
  }

  const handleClear = () => {
    const vacios = filtrosVacios()
    setForm(vacios)
    onApply(vacios)
    onClose()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>Filtros</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar filtros" title="Cerrar">
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formSection}>
            <label className={styles.label}>Sucursal</label>
            <select className={styles.select} value={form.sucursal} onChange={(e) => update({ sucursal: e.target.value })}>
              <option value="">Todas</option>
              {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Familia</label>
            <select className={styles.select} value={form.familia} onChange={(e) => update({ familia: e.target.value })}>
              <option value="">Todas</option>
              {FAMILIAS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Proveedor</label>
            <select className={styles.select} value={form.proveedor} onChange={(e) => update({ proveedor: e.target.value })}>
              <option value="">Todos</option>
              {PROVEEDORES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Código de fabricante</label>
            <input
              type="text"
              className={styles.input}
              value={form.codigoFabricante}
              onChange={(e) => update({ codigoFabricante: e.target.value })}
              placeholder="Ej: FAB-1001"
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Grupo</label>
            <select className={styles.select} value={form.grupo} onChange={(e) => update({ grupo: e.target.value })}>
              <option value="">Todos</option>
              {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Marca</label>
            <select className={styles.select} value={form.marca} onChange={(e) => update({ marca: e.target.value })}>
              <option value="">Todas</option>
              {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className={styles.formSection}>
            <label className={styles.label}>Categoría</label>
            <select className={styles.select} value={form.categoria} onChange={(e) => update({ categoria: e.target.value })}>
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label className={styles.toggleRow}>
            <span className={styles.label}>Sin código de barras asignado</span>
            <span
              className={`${styles.toggle} ${form.soloSinCodigo ? styles.toggleActive : ''}`}
              role="switch"
              aria-checked={form.soloSinCodigo}
              tabIndex={0}
              onClick={() => update({ soloSinCodigo: !form.soloSinCodigo })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  update({ soloSinCodigo: !form.soloSinCodigo })
                }
              }}
            >
              <span className={styles.toggleKnob} />
            </span>
          </label>
        </div>

        <div className={styles.footer}>
          <button className={styles.clearBtn} type="button" onClick={handleClear}>Limpiar</button>
          <button className={styles.applyBtn} type="button" onClick={handleApply}>Aplicar</button>
        </div>
      </aside>
    </>
  )
}
