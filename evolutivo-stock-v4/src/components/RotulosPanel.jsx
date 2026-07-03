import { useState } from 'react'
import styles from './RotulosPanel.module.css'

const TRANSPORTES = ['ANDREANI', 'CORREO ARGENTINO', 'OCA', 'VIA CARGO', 'TRANSPORTE PROPIO']

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const BarcodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v3M21 16v3M1 5v3M1 16v3"/>
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.22 6.22l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
)

export default function RotulosPanel({ items, bultos = {}, onClose, onImprimir }) {
  const total = items.length
  const [step, setStep] = useState(0)
  const [forms, setForms] = useState(() =>
    items.map(item => ({
      domicilio:    item.domicilio    ?? '',
      localidad:    item.localidad    ?? '',
      codigoPostal: item.codigoPostal ?? '',
      transporte:   item.transporte   ?? '',
      bultos:       String(bultos[item.id] !== undefined && bultos[item.id] !== '' ? bultos[item.id] : 1),
      copias:       '1',
    }))
  )
  const [confirmSearch, setConfirmSearch] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(() => new Set(items.map(i => i.id)))

  const isConfirm = step === total
  const form = !isConfirm ? forms[step] : null
  const item = !isConfirm ? items[step] : null

  const setField = (key, value) =>
    setForms(prev => prev.map((f, i) => i === step ? { ...f, [key]: value } : f))

  const isContinueDisabled = !isConfirm && (
    !form?.domicilio.trim() || !form?.transporte || !form?.bultos || !form?.copias
  )

  const handleContinuar = () => setStep(s => s + 1)
  const handleVolver    = () => setStep(s => s - 1)

  const toggleConfirm = (id) => setConfirmChecked(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filteredConfirm = items.filter(i =>
    !confirmSearch ||
    i.remito.toLowerCase().includes(confirmSearch.toLowerCase()) ||
    i.razonSocial.toLowerCase().includes(confirmSearch.toLowerCase())
  )

  /* ── Confirmación ─────────────────────────────────────────── */
  if (isConfirm) {
    return (
      <div className={styles.overlay}>
        <div className={styles.dialogConfirm}>
          <div className={styles.headerConfirm}>
            <div className={styles.headerLeft}>
              <button className={styles.backBtn} onClick={handleVolver} aria-label="Volver">
                <BackArrow />
              </button>
              <span className={styles.titleConfirm}>Confirmación</span>
              <span className={styles.stepBadge}>{total}/{total}</span>
            </div>
          </div>

          <div className={styles.confirmBody}>
            <div className={styles.confirmSearchWrap}>
              <SearchIcon />
              <input
                type="text"
                className={styles.confirmSearchInput}
                value={confirmSearch}
                onChange={e => setConfirmSearch(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar remito"
              />
            </div>

            <div className={styles.confirmTable}>
              <div className={styles.confirmTableHeader}>
                <span className={styles.confirmCheckCol} />
                <span>REMITO</span>
                <span className={styles.confirmClienteCol}>CLIENTE</span>
                <span className={styles.confirmCopiasCol}>COPIAS</span>
              </div>
              {filteredConfirm.map((it, idx) => (
                <label
                  key={it.id}
                  className={`${styles.confirmRow} ${confirmChecked.has(it.id) ? styles.confirmRowChecked : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.confirmCheckbox}
                    checked={confirmChecked.has(it.id)}
                    onChange={() => toggleConfirm(it.id)}
                  />
                  <span className={styles.confirmRemito}>{it.remito}</span>
                  <span className={styles.confirmCliente}>{it.razonSocial}</span>
                  <span className={styles.confirmCopias}>{forms[idx]?.copias ?? 1}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.footerConfirm}>
            <button className={styles.volverBtn} type="button" onClick={handleVolver}>Volver</button>
            <button className={styles.imprimirBtn} type="button" onClick={() => { onImprimir?.(); onClose() }}>Imprimir</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Formulario por remito ────────────────────────────────── */
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={step === 0 ? onClose : handleVolver} aria-label="Volver">
              <BackArrow />
            </button>
            <span className={styles.title}>Rótulos</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.stepLabel}>Remito</span>
            <span className={styles.stepBadge}>{step + 1}/{total}</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Client section bar */}
          <div className={styles.sectionBar}>
            <div className={styles.sectionBarGroup}>
              <span className={styles.sectionIconWrap}><UserIcon /></span>
              <span className={styles.sectionName}>{item.razonSocial}</span>
            </div>
            <div className={styles.sectionBarGroup}>
              <span className={styles.sectionIconWrap}><BarcodeIcon /></span>
              <span className={styles.sectionText}>Codigo: {item.codigo}</span>
            </div>
            <div className={styles.sectionBarGroup}>
              <span className={styles.sectionIconWrap}><PhoneIcon /></span>
            </div>
          </div>

          {/* Address fields */}
          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Domicilio <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={form.domicilio}
                onChange={e => setField('domicilio', e.target.value)}
                placeholder="Ingrese domicilio"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Localidad</label>
              <select className={styles.select} value={form.localidad} onChange={e => setField('localidad', e.target.value)}>
                <option value="">Seleccione localidad</option>
                <option value={item.localidad}>{item.localidad}</option>
                <option value="BUENOS AIRES">BUENOS AIRES</option>
                <option value="CÓRDOBA">CÓRDOBA</option>
                <option value="ROSARIO">ROSARIO</option>
                <option value="MENDOZA">MENDOZA</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Codigo Postal</label>
              <input
                className={styles.input}
                value={form.codigoPostal}
                onChange={e => setField('codigoPostal', e.target.value)}
                placeholder="Código postal"
              />
            </div>
          </div>

          <div className={styles.sectionGap} />

          {/* Transport section bar */}
          <div className={styles.sectionBar}>
            <div className={styles.sectionBarGroup}>
              <span className={styles.sectionIconWrap}><TruckIcon /></span>
              <span className={styles.sectionName}>Transporte</span>
            </div>
            <div className={styles.sectionBarGroup}>
              <span className={styles.sectionIconWrap}><PhoneIcon /></span>
            </div>
          </div>

          {/* Transport fields */}
          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Transporte <span className={styles.req}>*</span></label>
              <select className={styles.select} value={form.transporte} onChange={e => setField('transporte', e.target.value)}>
                <option value=""></option>
                {TRANSPORTES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bultos <span className={styles.req}>*</span></label>
              <input
                type="number"
                className={styles.input}
                value={form.bultos}
                onChange={e => setField('bultos', e.target.value)}
                min="1"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cantidad de copias <span className={styles.req}>*</span></label>
              <input
                type="number"
                className={styles.input}
                value={form.copias}
                onChange={e => setField('copias', e.target.value)}
                min="1"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} type="button" onClick={onClose}>Cancelar</button>
          <button
            className={styles.continueBtn}
            type="button"
            onClick={handleContinuar}
            disabled={isContinueDisabled}
          >
            Continuar
          </button>
        </div>

      </div>
    </div>
  )
}
