import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconTrash, IconBarcodeOff, IconPlus } from '@tabler/icons-react'
import { TIPOS_CODIGO_SIN_GTIN8, DESCRIPCION_TIPO, tipoInfo } from '../data/codigosBarra'
import { generarCodigo, validarFormato, mensajeFormatoInvalido, existeCodigoDuplicado, maxPrefijoGs1 } from '../utils/gtin'
import TipoCodigoBadge from './TipoCodigoBadge'
import styles from './CodigoBarraPanel.module.css'

const TIPOS_INGRESABLES = TIPOS_CODIGO_SIN_GTIN8.filter((t) => t.value !== 'GS1-128')

function defaultForm() {
  return {
    tipo: 'GTIN-13',
    cantidad: '1',
    codigoTexto: '',
    modoSugerido: false,
    prefijoGs1: '',
    codigoSugerido: '',
    error: '',
  }
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
  const [form, setForm] = useState(() => defaultForm())

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
      codigoSugerido: '',
    })
  }

  const handleCodigoTextoChange = (value) => {
    let texto = value
    if (form.tipo !== 'MANUAL') {
      const max = tipoInfo(form.tipo).digits
      texto = texto.replace(/\D/g, '')
      if (max) texto = texto.slice(0, max)
    }
    updateForm({ codigoTexto: texto })
  }

  const handlePrefijoChange = (value) => {
    const max = maxPrefijoGs1(form.tipo)
    const prefijo = value.replace(/\D/g, '').slice(0, max)
    const info = tipoInfo(form.tipo)
    const cantidad = unidadUnica ? 1 : info.cantidadFija ?? (Number(form.cantidad) || 1)
    const codigoSugerido = prefijo.length > 0 ? generarCodigo(form.tipo, { prefijo, cantidad }) : ''
    updateForm({ prefijoGs1: prefijo, codigoSugerido })
  }

  const activarSugerido = () => {
    if (form.tipo === 'MANUAL') {
      const codigoSugerido = generarCodigo('MANUAL', { longitud: 10 })
      updateForm({ modoSugerido: true, codigoSugerido, codigoTexto: '' })
    } else {
      updateForm({ modoSugerido: true, prefijoGs1: '', codigoSugerido: '', codigoTexto: '' })
    }
  }

  const irAAgregar = () => {
    setForm(defaultForm())
    setLayer('agregar')
  }

  const volverADetalle = () => setLayer('detalle')

  const handleSubmit = () => {
    const info = tipoInfo(form.tipo)

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
      codigoFinal = form.codigoSugerido
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
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {DESCRIPCION_TIPO[form.tipo] && (
                  <p className={styles.helperText}>{DESCRIPCION_TIPO[form.tipo]}</p>
                )}
              </div>

              {unidadUnica ? (
                <p className={styles.staticInfo}>Cantidad que representa este código: 1 (fija — siempre referido a una unidad)</p>
              ) : info.cantidadFija ? (
                <p className={styles.staticInfo}>Cantidad que representa este código: {info.cantidadFija} (fija)</p>
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
                    placeholder={form.tipo === 'MANUAL' ? 'Ej: 123456' : `Ingresá los ${info.digits} dígitos`}
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
                    <span className={styles.previewValue}>{form.codigoSugerido || '—'}</span>
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
