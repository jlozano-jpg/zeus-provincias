import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconTrash, IconBarcodeOff, IconPlus } from '@tabler/icons-react'
import { TIPOS_CODIGO_SIN_GTIN8, DESCRIPCION_TIPO, tipoInfo } from '../data/codigosBarra'
import { generarCodigo, validarFormato, mensajeFormatoInvalido, existeCodigoDuplicado, maxPrefijoGs1 } from '../utils/gtin'
import TipoCodigoBadge from './TipoCodigoBadge'
import styles from './CodigoBarraPanel.module.css'

const TIPOS_INGRESABLES = TIPOS_CODIGO_SIN_GTIN8

function defaultForm(articulo) {
  return {
    tipo: 'GTIN-13',
    cantidad: '1',
    codigoTexto: '',
    modoSugerido: false,
    prefijoGs1: '',
    loteId: articulo.lotes?.[0]?.id ?? '',
    codigoSugeridoManual: '',
    error: '',
  }
}

function descripcionTipo(tipo) {
  if (tipo === 'GS1-128') {
    return 'Aplica solo a artículos con gestión de lotes: combina el código del artículo con el lote y su vencimiento.'
  }
  return DESCRIPCION_TIPO[tipo]
}

function extraInfo(codigo) {
  if (codigo.tipo === 'GS1-128') {
    return `Lote ${codigo.loteId ?? '--'} · vence ${codigo.vencimiento ?? '--'}`
  }
  return `Cantidad: ${codigo.cantidad}`
}

export default function CodigoBarraPanel({ articulo, articulos, initialLayer, soloLectura = false, unidadUnica = false, entidadLabel = 'artículo', entidadFemenino = false, onClose, onAddCodigo, onDeleteCodigo }) {
  const demostrativo = entidadFemenino ? 'Esta' : 'Este'
  const indefinidoOtro = entidadFemenino ? 'otra' : 'otro'
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
    updateForm({
      tipo,
      cantidad: '1',
      codigoTexto: '',
      modoSugerido: false,
      prefijoGs1: '',
      loteId: tipo === 'GS1-128' ? (articulo.lotes?.[0]?.id ?? '') : '',
    })
  }

  const handleCodigoTextoChange = (value) => {
    let texto = value
    if (form.tipo !== 'MANUAL' && form.tipo !== 'GS1-128') {
      const max = tipoInfo(form.tipo).digits
      texto = texto.replace(/\D/g, '')
      if (max) texto = texto.slice(0, max)
    }
    updateForm({ codigoTexto: texto })
  }

  const handlePrefijoChange = (value) => {
    const max = maxPrefijoGs1(form.tipo)
    const prefijo = value.replace(/\D/g, '').slice(0, max)
    updateForm({ prefijoGs1: prefijo })
  }

  const activarSugerido = () => {
    if (form.tipo === 'MANUAL') {
      const codigoSugeridoManual = generarCodigo('MANUAL', { longitud: 10 })
      updateForm({ modoSugerido: true, codigoSugeridoManual, codigoTexto: '' })
    } else {
      updateForm({ modoSugerido: true, prefijoGs1: '', codigoTexto: '' })
    }
  }

  const irAAgregar = () => {
    setForm(defaultForm(articulo))
    setLayer('agregar')
  }

  const volverADetalle = () => setLayer('detalle')

  const info = tipoInfo(form.tipo)
  const loteSeleccionado = form.tipo === 'GS1-128' ? (articulo.lotes || []).find((l) => l.id === form.loteId) : null

  const codigoSugerido = (() => {
    if (!form.modoSugerido) return ''
    if (form.tipo === 'MANUAL') return form.codigoSugeridoManual
    if (form.prefijoGs1.length === 0) return ''
    if (form.tipo === 'GS1-128') {
      if (!loteSeleccionado) return ''
      return generarCodigo('GS1-128', { prefijo: form.prefijoGs1, cantidad: Number(form.cantidad) || 1, lote: loteSeleccionado })
    }
    const cantidad = unidadUnica ? 1 : info.cantidadFija ?? (Number(form.cantidad) || 1)
    return generarCodigo(form.tipo, { prefijo: form.prefijoGs1, cantidad })
  })()

  const handleSubmit = () => {
    if (form.tipo === 'GS1-128' && !loteSeleccionado) {
      setForm((prev) => ({ ...prev, error: 'Seleccioná un lote.' }))
      return
    }

    if (!unidadUnica && !info.cantidadFija) {
      const cantidadNum = Number(form.cantidad)
      if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
        setForm((prev) => ({ ...prev, error: 'Ingresá una cantidad válida.' }))
        return
      }
    }

    let codigoFinal
    if (form.modoSugerido) {
      if (form.tipo !== 'MANUAL') {
        const max = maxPrefijoGs1(form.tipo)
        if (!/^\d+$/.test(form.prefijoGs1) || form.prefijoGs1.length === 0 || form.prefijoGs1.length > max) {
          setForm((prev) => ({ ...prev, error: `Ingresá un prefijo GS1 numérico de hasta ${max} dígitos.` }))
          return
        }
      }
      codigoFinal = codigoSugerido
    } else {
      const texto = form.codigoTexto.trim()
      if (!validarFormato(form.tipo, texto)) {
        setForm((prev) => ({ ...prev, error: mensajeFormatoInvalido(form.tipo) }))
        return
      }
      if (existeCodigoDuplicado(articulos, texto)) {
        setForm((prev) => ({ ...prev, error: `Este código ya está asignado a ${indefinidoOtro} ${entidadLabel}.` }))
        return
      }
      codigoFinal = texto
    }

    onAddCodigo(articulo.id, {
      id: `c${Date.now()}`,
      tipo: form.tipo,
      codigo: codigoFinal,
      cantidad: unidadUnica ? 1 : info.cantidadFija ?? Number(form.cantidad),
      ...(form.tipo === 'GS1-128' ? { loteId: loteSeleccionado.lote, vencimiento: loteSeleccionado.vencimiento } : {}),
    })
    setLayer('detalle')
  }

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
                  <p className={styles.emptyText}>{demostrativo} {entidadLabel} todavía no tiene códigos asignados.</p>
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
                  <h2 className={styles.title}>Ingresar código</h2>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
                <IconX size={18} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.formSection}>
                <label className={styles.label}>Tipo de código</label>
                <select className={styles.select} value={form.tipo} onChange={(e) => handleTipoChange(e.target.value)}>
                  {TIPOS_INGRESABLES.map((t) => (
                    <option key={t.value} value={t.value} disabled={t.requiereLotes && !articulo.manejaLotes}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {descripcionTipo(form.tipo) && (
                  <p className={styles.helperText}>{descripcionTipo(form.tipo)}</p>
                )}
                {!articulo.manejaLotes && (
                  <p className={styles.helperText}>GS1-128 no disponible: {demostrativo.toLowerCase()} {entidadLabel} no gestiona lotes.</p>
                )}
              </div>

              {unidadUnica ? (
                <p className={styles.staticInfo}>Cantidad que representa este código: 1 (fija — siempre referido a una unidad)</p>
              ) : info.cantidadFija ? (
                <p className={styles.staticInfo}>Cantidad que representa este código: {info.cantidadFija} (fija)</p>
              ) : form.tipo === 'GS1-128' ? (
                <>
                  <div className={styles.formSection}>
                    <label className={styles.label}>Lote</label>
                    <select className={styles.select} value={form.loteId} onChange={(e) => updateForm({ loteId: e.target.value })}>
                      <option value="">Seleccionar lote...</option>
                      {(articulo.lotes || []).map((l) => (
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
                        value={loteSeleccionado?.vencimiento ?? ''}
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

              <div className={styles.formSection}>
                <label className={styles.label}>
                  {form.modoSugerido && form.tipo !== 'MANUAL' ? 'Prefijo GS1' : 'Código'}
                </label>

                {!form.modoSugerido ? (
                  <input
                    type="text"
                    className={`${styles.input} ${styles.mono}`}
                    value={form.codigoTexto}
                    maxLength={info.digits || undefined}
                    onChange={(e) => handleCodigoTextoChange(e.target.value)}
                    placeholder={
                      form.tipo === 'MANUAL' ? 'Ej: 123456'
                        : form.tipo === 'GS1-128' ? 'Escaneá o tipeá el código'
                          : `Ingresá los ${info.digits} dígitos`
                    }
                  />
                ) : form.tipo !== 'MANUAL' ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`${styles.input} ${styles.mono}`}
                    value={form.prefijoGs1}
                    onChange={(e) => handlePrefijoChange(e.target.value)}
                    placeholder="Ej: 779"
                  />
                ) : null}

                {form.modoSugerido && form.tipo !== 'MANUAL' && (
                  <p className={styles.helperText}>
                    Prefijo de empresa suministrado por GS1: se incluirá en el código generado. Hasta {maxPrefijoGs1(form.tipo)} dígitos para {info.label}.
                  </p>
                )}

                {!form.modoSugerido && (
                  <button type="button" className={styles.secondaryBtn} onClick={activarSugerido}>
                    Sugerir código
                  </button>
                )}

                {form.modoSugerido && (
                  <p className={styles.previewBox}>
                    <span className={styles.previewLabel}>Código a generar</span>
                    <span className={styles.previewValue}>{codigoSugerido || '—'}</span>
                  </p>
                )}
              </div>

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
