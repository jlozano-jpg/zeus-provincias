import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconTrash, IconBarcodeOff, IconPlus } from '@tabler/icons-react'
import { TIPOS_CODIGO, tipoInfo } from '../data/codigosBarra'
import { generarCodigo, validarFormato, mensajeFormatoInvalido, existeCodigoDuplicado, maxPrefijoGs1 } from '../utils/gtin'
import TipoCodigoBadge from './TipoCodigoBadge'
import styles from './CodigoBarraPanel.module.css'

function defaultForm(articulo) {
  return {
    origen: 'nuevo',
    tipo: 'GTIN-13',
    cantidad: '1',
    loteId: articulo.lotes[0]?.id ?? '',
    codigoTexto: '',
    usarPrefijoGs1: false,
    prefijoGs1: '',
    error: '',
  }
}

function extraInfo(codigo) {
  if (codigo.tipo === 'GTIN-128') {
    return `Lote ${codigo.loteId ?? '--'} · vence ${codigo.vencimiento ?? '--'}`
  }
  return `Cantidad: ${codigo.cantidad}`
}

export default function CodigoBarraPanel({ articulo, articulos, initialLayer, soloLectura = false, onClose, onAddCodigo, onDeleteCodigo }) {
  const [layer, setLayer] = useState(initialLayer)
  const [form, setForm] = useState(() => defaultForm(articulo))

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch, error: '' }))

  const handleTipoChange = (tipo) => {
    const info = tipoInfo(tipo)
    updateForm({
      tipo,
      cantidad: info.cantidadFija ? String(info.cantidadFija) : '1',
      loteId: tipo === 'GTIN-128' ? (articulo.lotes[0]?.id ?? '') : '',
      usarPrefijoGs1: tipo === 'MANUAL' ? false : form.usarPrefijoGs1,
      prefijoGs1: form.prefijoGs1.slice(0, maxPrefijoGs1(tipo)),
    })
  }

  const irAAgregar = () => {
    setForm(defaultForm(articulo))
    setLayer('agregar')
  }

  const volverADetalle = () => setLayer('detalle')

  const handleSubmit = () => {
    const info = tipoInfo(form.tipo)
    const loteSeleccionado = form.tipo === 'GTIN-128' ? articulo.lotes.find((l) => l.id === form.loteId) : null

    if (form.tipo === 'GTIN-128' && !loteSeleccionado) {
      updateForm({ error: 'Seleccioná un lote.' })
      return
    }
    if (!info.cantidadFija) {
      const cantidadNum = Number(form.cantidad)
      if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
        setForm((prev) => ({ ...prev, error: 'Ingresá una cantidad válida.' }))
        return
      }
    }

    let codigoFinal
    if (form.origen === 'existente') {
      const texto = form.codigoTexto.trim()
      if (!validarFormato(form.tipo, texto)) {
        setForm((prev) => ({ ...prev, error: mensajeFormatoInvalido(form.tipo) }))
        return
      }
      if (existeCodigoDuplicado(articulos, texto)) {
        setForm((prev) => ({ ...prev, error: 'Este código ya está asignado a otro artículo.' }))
        return
      }
      codigoFinal = texto
    } else {
      if (form.usarPrefijoGs1) {
        const max = maxPrefijoGs1(form.tipo)
        if (!/^\d+$/.test(form.prefijoGs1) || form.prefijoGs1.length > max) {
          setForm((prev) => ({ ...prev, error: `Ingresá un prefijo GS1 numérico de hasta ${max} dígitos.` }))
          return
        }
      }
      codigoFinal = generarCodigo(form.tipo, { lote: loteSeleccionado, prefijo: form.usarPrefijoGs1 ? form.prefijoGs1 : undefined })
    }

    onAddCodigo(articulo.id, {
      id: `c${Date.now()}`,
      tipo: form.tipo,
      codigo: codigoFinal,
      cantidad: info.cantidadFija ?? Number(form.cantidad),
      ...(form.tipo === 'GTIN-128' ? { loteId: loteSeleccionado.lote, vencimiento: loteSeleccionado.vencimiento } : {}),
    })
    setLayer('detalle')
  }

  const info = tipoInfo(form.tipo)

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        {layer === 'detalle' ? (
          <>
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>{articulo.codigo}</p>
                <h2 className={styles.title}>{articulo.descripcion}</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
                <IconX size={18} />
              </button>
            </div>

            <div className={styles.content}>
              {articulo.codigos.length === 0 ? (
                <div className={styles.emptyState}>
                  <IconBarcodeOff size={32} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Este artículo todavía no tiene códigos asignados.</p>
                  {!soloLectura && (
                    <button className={styles.primaryBtn} onClick={irAAgregar}>
                      <IconPlus size={16} />
                      Agregar el primero
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.codeList}>
                  {articulo.codigos.map((codigo) => (
                    <div key={codigo.id} className={styles.codeRow}>
                      <div className={styles.codeRowMain}>
                        <TipoCodigoBadge tipo={codigo.tipo} />
                        <span className={styles.codeValue}>{codigo.codigo}</span>
                        <span className={styles.codeExtra}>{extraInfo(codigo)}</span>
                      </div>
                      {!soloLectura && (
                        <button
                          className={styles.deleteRowBtn}
                          onClick={() => onDeleteCodigo(articulo.id, codigo.id)}
                          aria-label={`Eliminar código ${codigo.codigo}`}
                          title="Eliminar"
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!soloLectura && articulo.codigos.length > 0 && (
              <div className={styles.footer}>
                <button className={styles.primaryBtn} onClick={irAAgregar}>
                  <IconPlus size={16} />
                  Agregar código
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.headerWithBack}>
                <button className={styles.backBtn} onClick={volverADetalle} aria-label="Volver">
                  <IconChevronLeft size={18} />
                </button>
                <div>
                  <p className={styles.eyebrow}>{articulo.codigo}</p>
                  <h2 className={styles.title}>Agregar código</h2>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
                <IconX size={18} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.formSection}>
                <label className={styles.label}>Origen del código</label>
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${form.origen === 'nuevo' ? styles.segmentedBtnActive : ''}`}
                    onClick={() => updateForm({ origen: 'nuevo', codigoTexto: '' })}
                  >
                    Generar nuevo
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${form.origen === 'existente' ? styles.segmentedBtnActive : ''}`}
                    onClick={() => updateForm({ origen: 'existente' })}
                  >
                    Ingresar existente
                  </button>
                </div>
              </div>

              {form.origen === 'nuevo' && form.tipo !== 'MANUAL' && (
                <div className={styles.formSection}>
                  <label className={styles.toggleRow}>
                    <span className={styles.label}>Prefijo GS1</span>
                    <span
                      className={`${styles.toggle} ${form.usarPrefijoGs1 ? styles.toggleActive : ''}`}
                      role="switch"
                      aria-checked={form.usarPrefijoGs1}
                      tabIndex={0}
                      onClick={() => updateForm({ usarPrefijoGs1: !form.usarPrefijoGs1 })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          updateForm({ usarPrefijoGs1: !form.usarPrefijoGs1 })
                        }
                      }}
                    >
                      <span className={styles.toggleKnob} />
                    </span>
                  </label>
                  {form.usarPrefijoGs1 && (
                    <>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`${styles.input} ${styles.mono}`}
                        value={form.prefijoGs1}
                        onChange={(e) => updateForm({ prefijoGs1: e.target.value.replace(/\D/g, '').slice(0, maxPrefijoGs1(form.tipo)) })}
                        placeholder="Ej: 779"
                      />
                      <p className={styles.helperText}>Hasta {maxPrefijoGs1(form.tipo)} dígitos para {tipoInfo(form.tipo).label}.</p>
                    </>
                  )}
                </div>
              )}

              <div className={styles.formSection}>
                <label className={styles.label}>Tipo de código</label>
                <select className={styles.select} value={form.tipo} onChange={(e) => handleTipoChange(e.target.value)}>
                  {TIPOS_CODIGO.map((t) => (
                    <option key={t.value} value={t.value} disabled={t.requiereLotes && !articulo.manejaLotes}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {!articulo.manejaLotes && (
                  <p className={styles.helperText}>GTIN-128 no disponible: este artículo no gestiona lotes.</p>
                )}
              </div>

              {info.cantidadFija ? (
                <p className={styles.staticInfo}>Cantidad que representa este código: {info.cantidadFija} (fija)</p>
              ) : form.tipo === 'GTIN-128' ? (
                <>
                  <div className={styles.formSection}>
                    <label className={styles.label}>Lote</label>
                    <select className={styles.select} value={form.loteId} onChange={(e) => updateForm({ loteId: e.target.value })}>
                      <option value="">Seleccionar lote...</option>
                      {articulo.lotes.map((l) => (
                        <option key={l.id} value={l.id}>{l.lote}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formSection}>
                      <label className={styles.label}>Vencimiento</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={articulo.lotes.find((l) => l.id === form.loteId)?.vencimiento ?? ''}
                        disabled
                        readOnly
                      />
                    </div>
                    <div className={styles.formSection}>
                      <label className={styles.label}>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        className={styles.input}
                        value={form.cantidad}
                        onChange={(e) => updateForm({ cantidad: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.formSection}>
                  <label className={styles.label}>Cantidad que representa este código</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.input}
                    value={form.cantidad}
                    onChange={(e) => updateForm({ cantidad: e.target.value })}
                  />
                </div>
              )}

              {form.origen === 'existente' && (
                <div className={styles.formSection}>
                  <label className={styles.label}>Código</label>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.mono}`}
                    value={form.codigoTexto}
                    onChange={(e) => updateForm({ codigoTexto: e.target.value })}
                    placeholder={form.tipo === 'MANUAL' ? 'Ej: INT-00458' : 'Escaneá o tipeá el código'}
                  />
                </div>
              )}

              {form.error && <p className={styles.errorText}>{form.error}</p>}
            </div>

            <div className={styles.footer}>
              <button className={styles.primaryBtn} onClick={handleSubmit}>
                Agregar código
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
