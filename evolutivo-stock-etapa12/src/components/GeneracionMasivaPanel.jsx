import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconChevronDown, IconCheck, IconUpload, IconAlertTriangle, IconAlertCircle, IconCircleCheck, IconLoader2, IconDownload } from '@tabler/icons-react'
import { TIPOS_CODIGO_SIN_GTIN8, DESCRIPCION_TIPO, FAMILIAS, PROVEEDORES, SUCURSALES, GRUPOS, MARCAS, CATEGORIAS, MOCK_EXCEL_SKUS } from '../data/codigosBarra'
import { generarCodigo, maxPrefijoGs1 } from '../utils/gtin'
import { filtrosVacios } from './FiltrosCodigosBarraPanel'
import styles from './GeneracionMasivaPanel.module.css'

const TIPOS_DISPONIBLES = TIPOS_CODIGO_SIN_GTIN8

const LONGITUD_MANUAL_MIN = 8
const LONGITUD_MANUAL_MAX = 48

const CONFIG_SELECTORES = {
  sucursal: { titulo: 'Sucursal', opciones: SUCURSALES, todas: 'Todas' },
  familia: { titulo: 'Familia', opciones: FAMILIAS, todas: 'Todas' },
  proveedor: { titulo: 'Proveedor', opciones: PROVEEDORES, todas: 'Todos' },
  grupo: { titulo: 'Grupo', opciones: GRUPOS, todas: 'Todos' },
  marca: { titulo: 'Marca', opciones: MARCAS, todas: 'Todas' },
  categoria: { titulo: 'Categoría', opciones: CATEGORIAS, todas: 'Todas' },
}

function coincideFiltros(articulo, filtros) {
  if (filtros.sucursal && articulo.sucursal !== filtros.sucursal) return false
  if (filtros.familia && articulo.familia !== filtros.familia) return false
  if (filtros.proveedor && articulo.proveedor !== filtros.proveedor) return false
  if (filtros.grupo && articulo.grupo !== filtros.grupo) return false
  if (filtros.marca && articulo.marca !== filtros.marca) return false
  if (filtros.categoria && articulo.categoria !== filtros.categoria) return false
  if (filtros.codigoFabricante && !articulo.codigoFabricante?.toLowerCase().includes(filtros.codigoFabricante.trim().toLowerCase())) return false
  if (filtros.soloSinCodigo && articulo.codigos.length > 0) return false
  return true
}

function construirFilasArticulo(articulo, tipo) {
  if (tipo === 'GS1-128') {
    if (!articulo.manejaLotes || articulo.lotes.length === 0) {
      return [{
        key: articulo.id,
        articuloId: articulo.id,
        codigo: articulo.codigo,
        descripcion: articulo.descripcion,
        cantidad: '1',
        loteId: '',
        estado: 'sinLotes',
        incluido: false,
      }]
    }
    return articulo.lotes.map((lote) => {
      const yaExiste = articulo.codigos.some((c) => c.tipo === tipo && (c.loteId === lote.id || c.loteId === lote.lote))
      return {
        key: `${articulo.id}__${lote.id}`,
        articuloId: articulo.id,
        codigo: articulo.codigo,
        descripcion: `${articulo.descripcion} — Lote ${lote.lote}`,
        cantidad: '1',
        loteId: lote.id,
        estado: yaExiste ? 'duplicado' : 'nuevo',
        incluido: true,
      }
    })
  }

  const yaExiste = articulo.codigos.some((c) => c.tipo === tipo)
  return [{
    key: articulo.id,
    articuloId: articulo.id,
    codigo: articulo.codigo,
    descripcion: articulo.descripcion,
    cantidad: '1',
    estado: yaExiste ? 'duplicado' : 'nuevo',
    incluido: true,
  }]
}

function construirFilasPorFiltros(articulos, tipo, filtros) {
  return articulos.filter((a) => coincideFiltros(a, filtros)).flatMap((a) => construirFilasArticulo(a, tipo))
}

function construirFilasPorExcel(articulos, tipo, mockSkus) {
  return mockSkus.flatMap((sku) => {
    const articulo = articulos.find((a) => a.codigo === sku)
    if (!articulo) {
      return [{ key: sku, articuloId: null, codigo: sku, descripcion: '—', cantidad: '1', estado: 'error', incluido: false }]
    }
    return construirFilasArticulo(articulo, tipo)
  })
}

function ejecutarGeneracion(filas, tipo, prefijo, articulos, longitud) {
  const incluidas = filas.filter((f) => f.incluido && f.estado !== 'error' && f.estado !== 'sinLotes')
  const exitosos = []
  const errores = []
  incluidas.forEach((fila, index) => {
    const esFallaSimulada = incluidas.length > 1 && index === incluidas.length - 1
    if (esFallaSimulada) {
      errores.push({ codigo: fila.codigo, motivo: 'Conflicto detectado en el servidor durante la generación.' })
      return
    }
    const requiereCantidad = tipo === 'GTIN-14' || tipo === 'GS1-128'
    const cantidad = requiereCantidad ? (Number(fila.cantidad) || 1) : 1
    let loteSeleccionado = null
    if (tipo === 'GS1-128') {
      const articulo = articulos.find((a) => a.id === fila.articuloId)
      loteSeleccionado = articulo?.lotes.find((l) => l.id === fila.loteId)
    }
    exitosos.push({
      articuloId: fila.articuloId,
      codigo: {
        id: `c${Date.now()}-${index}`,
        tipo,
        codigo: generarCodigo(tipo, { prefijo, cantidad, lote: loteSeleccionado, longitud }),
        cantidad,
        ...(tipo === 'GS1-128' && loteSeleccionado ? { loteId: loteSeleccionado.lote, vencimiento: loteSeleccionado.vencimiento } : {}),
      },
    })
  })
  return { exitosos, errores }
}

export default function GeneracionMasivaPanel({
  articulos,
  onClose,
  onGenerar,
  tiposDisponibles = TIPOS_DISPONIBLES,
  mockSkusArchivo = MOCK_EXCEL_SKUS,
  mostrarFiltrosCategoricos = true,
  entidadLabelPlural = 'artículos',
  entidadFemenino = false,
}) {
  const [layer, setLayer] = useState(1)
  const [tipo, setTipo] = useState('GTIN-13')
  const [prefijoGs1, setPrefijoGs1] = useState('')
  const [longitudManual, setLongitudManual] = useState('12')
  const [metodo, setMetodo] = useState('filtros')
  const [filtros, setFiltros] = useState(filtrosVacios)
  const [selectorActivo, setSelectorActivo] = useState(null)
  const [archivoNombre, setArchivoNombre] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const [filas, setFilas] = useState([])
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const updateFiltro = (patch) => setFiltros((prev) => ({ ...prev, ...patch }))

  const seleccionarOpcionFiltro = (campo, valor) => {
    updateFiltro({ [campo]: valor })
    setSelectorActivo(null)
  }

  const handleTipoChange = (nuevoTipo) => {
    setTipo(nuevoTipo)
    setPrefijoGs1((prev) => prev.slice(0, maxPrefijoGs1(nuevoTipo)))
  }

  const prefijoInvalido = tipo !== 'MANUAL' && (!/^\d+$/.test(prefijoGs1) || prefijoGs1.length === 0 || prefijoGs1.length > maxPrefijoGs1(tipo))
  const longitudManualInvalida = tipo === 'MANUAL' && (
    !Number.isInteger(Number(longitudManual)) ||
    Number(longitudManual) < LONGITUD_MANUAL_MIN ||
    Number(longitudManual) > LONGITUD_MANUAL_MAX
  )

  const handleContinuarLayer2 = () => {
    const nuevasFilas = metodo === 'filtros'
      ? construirFilasPorFiltros(articulos, tipo, filtros)
      : construirFilasPorExcel(articulos, tipo, mockSkusArchivo)
    setFilas(nuevasFilas)
    setLayer(3)
  }

  const toggleFila = (key) => {
    setFilas((prev) => prev.map((f) => (f.key === key && f.estado !== 'error' && f.estado !== 'sinLotes' ? { ...f, incluido: !f.incluido } : f)))
  }

  const cambiarCantidadFila = (key, cantidad) => {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, cantidad } : f)))
  }

  const handleGenerar = () => {
    setGenerando(true)
    setTimeout(() => {
      const res = ejecutarGeneracion(filas, tipo, tipo !== 'MANUAL' ? prefijoGs1 : undefined, articulos, Number(longitudManual))
      onGenerar(res.exitosos)
      setResultado(res)
      setGenerando(false)
      setLayer(4)
    }, 700)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setArrastrando(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setArchivoNombre(file.name)
  }

  const descargarErrores = () => {
    const encabezado = 'Código;Motivo\n'
    const filasCsv = resultado.errores.map((err) => `${err.codigo};${err.motivo}`).join('\n')
    const blob = new Blob([encabezado + filasCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'errores-generacion-masiva.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const seleccionados = filas.filter((f) => f.incluido).length
  const mostrarCantidad = tipo === 'GTIN-14' || tipo === 'GS1-128'
  const columnas = 3 + (mostrarCantidad ? 1 : 0)

  const titulos = {
    1: 'Tipo de código',
    2: `Selección de ${entidadLabelPlural}`,
    3: 'Previsualización',
    4: 'Resultado',
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.headerWithBack}>
            {(selectorActivo || (layer > 1 && layer < 4)) && (
              <button
                className={styles.backBtn}
                onClick={() => (selectorActivo ? setSelectorActivo(null) : setLayer((l) => l - 1))}
                aria-label="Volver"
              >
                <IconChevronLeft size={18} />
              </button>
            )}
            <div>
              <p className={styles.eyebrow}>Generación masiva</p>
              <h2 className={styles.title}>{selectorActivo ? CONFIG_SELECTORES[selectorActivo].titulo : titulos[layer]}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {selectorActivo ? (
            <div className={styles.selectorList}>
              <button
                type="button"
                className={`${styles.selectorOption} ${!filtros[selectorActivo] ? styles.selectorOptionActive : ''}`}
                onClick={() => seleccionarOpcionFiltro(selectorActivo, '')}
              >
                {CONFIG_SELECTORES[selectorActivo].todas}
                {!filtros[selectorActivo] && <IconCheck size={16} />}
              </button>
              {CONFIG_SELECTORES[selectorActivo].opciones.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`${styles.selectorOption} ${filtros[selectorActivo] === op ? styles.selectorOptionActive : ''}`}
                  onClick={() => seleccionarOpcionFiltro(selectorActivo, op)}
                >
                  {op}
                  {filtros[selectorActivo] === op && <IconCheck size={16} />}
                </button>
              ))}
            </div>
          ) : (
          <>
          {layer === 1 && (
            <>
              <div className={styles.formSection}>
                <label className={styles.label}>Tipo de código a generar</label>
                <select className={styles.select} value={tipo} onChange={(e) => handleTipoChange(e.target.value)}>
                  {tiposDisponibles.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {DESCRIPCION_TIPO[tipo] && (
                  <p className={styles.helperText}>{DESCRIPCION_TIPO[tipo]}</p>
                )}
              </div>

              {tipo !== 'MANUAL' && (
                <div className={styles.formSection}>
                  <label className={styles.label}>Prefijo GS1</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`${styles.input} ${styles.mono}`}
                    value={prefijoGs1}
                    onChange={(e) => setPrefijoGs1(e.target.value.replace(/\D/g, '').slice(0, maxPrefijoGs1(tipo)))}
                    placeholder="Ej: 779"
                  />
                  <p className={styles.helperText}>
                    Prefijo de empresa suministrado por GS1: se incluirá en todos los códigos generados en esta tanda. Hasta {maxPrefijoGs1(tipo)} dígitos.
                  </p>
                </div>
              )}

              {tipo === 'MANUAL' && (
                <div className={styles.formSection}>
                  <label className={styles.label}>Cantidad de caracteres</label>
                  <input
                    type="number"
                    min={LONGITUD_MANUAL_MIN}
                    max={LONGITUD_MANUAL_MAX}
                    className={styles.input}
                    value={longitudManual}
                    onChange={(e) => setLongitudManual(e.target.value)}
                  />
                  <p className={styles.helperText}>
                    Definí cuántos caracteres va a tener cada código interno generado, entre {LONGITUD_MANUAL_MIN} y {LONGITUD_MANUAL_MAX}.
                  </p>
                </div>
              )}
            </>
          )}

          {layer === 2 && (
            <>
              <div className={styles.formSection}>
                <div className={styles.segmented}>
                  <button type="button" className={`${styles.segmentedBtn} ${metodo === 'filtros' ? styles.segmentedBtnActive : ''}`} onClick={() => setMetodo('filtros')}>
                    Filtros
                  </button>
                  <button type="button" className={`${styles.segmentedBtn} ${metodo === 'excel' ? styles.segmentedBtnActive : ''}`} onClick={() => setMetodo('excel')}>
                    Cargar Archivo
                  </button>
                </div>
              </div>

              {metodo === 'filtros' ? (
                <>
                  {mostrarFiltrosCategoricos && (
                    <>
                      <div className={styles.formRow}>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Sucursal</label>
                          <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('sucursal')}>
                            <span className={!filtros.sucursal ? styles.selectTriggerPlaceholder : undefined}>
                              {filtros.sucursal || CONFIG_SELECTORES.sucursal.todas}
                            </span>
                            <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                          </button>
                        </div>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Familia</label>
                          <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('familia')}>
                            <span className={!filtros.familia ? styles.selectTriggerPlaceholder : undefined}>
                              {filtros.familia || CONFIG_SELECTORES.familia.todas}
                            </span>
                            <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Proveedor</label>
                          <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('proveedor')}>
                            <span className={!filtros.proveedor ? styles.selectTriggerPlaceholder : undefined}>
                              {filtros.proveedor || CONFIG_SELECTORES.proveedor.todas}
                            </span>
                            <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                          </button>
                        </div>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Código de fabricante</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={filtros.codigoFabricante}
                            onChange={(e) => updateFiltro({ codigoFabricante: e.target.value })}
                            placeholder="Ej: FAB-1001"
                          />
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Grupo</label>
                          <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('grupo')}>
                            <span className={!filtros.grupo ? styles.selectTriggerPlaceholder : undefined}>
                              {filtros.grupo || CONFIG_SELECTORES.grupo.todas}
                            </span>
                            <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                          </button>
                        </div>
                        <div className={styles.formSection}>
                          <label className={styles.label}>Marca</label>
                          <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('marca')}>
                            <span className={!filtros.marca ? styles.selectTriggerPlaceholder : undefined}>
                              {filtros.marca || CONFIG_SELECTORES.marca.todas}
                            </span>
                            <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.formSection}>
                        <label className={styles.label}>Categoría</label>
                        <button type="button" className={styles.selectTrigger} onClick={() => setSelectorActivo('categoria')}>
                          <span className={!filtros.categoria ? styles.selectTriggerPlaceholder : undefined}>
                            {filtros.categoria || CONFIG_SELECTORES.categoria.todas}
                          </span>
                          <IconChevronDown size={16} className={styles.selectTriggerIcon} />
                        </button>
                      </div>
                    </>
                  )}

                  <label className={styles.toggleRow}>
                    <span className={styles.label}>Sin código de barras asignado</span>
                    <span
                      className={`${styles.toggle} ${filtros.soloSinCodigo ? styles.toggleActive : ''}`}
                      role="switch"
                      aria-checked={filtros.soloSinCodigo}
                      tabIndex={0}
                      onClick={() => updateFiltro({ soloSinCodigo: !filtros.soloSinCodigo })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          updateFiltro({ soloSinCodigo: !filtros.soloSinCodigo })
                        }
                      }}
                    >
                      <span className={styles.toggleKnob} />
                    </span>
                  </label>
                </>
              ) : (
                <div className={styles.formSection}>
                  <label className={styles.label}>Archivo</label>
                  <div
                    className={`${styles.dropzone} ${arrastrando ? styles.dropzoneActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('gm-file-input').click()}
                  >
                    <IconUpload size={24} className={styles.dropzoneIcon} />
                    <p className={styles.dropzoneText}>
                      {archivoNombre || 'Arrastrá un archivo o hacé clic para seleccionarlo'}
                    </p>
                    <input
                      id="gm-file-input"
                      type="file"
                      accept=".xlsx,.xls,.csv,.txt"
                      className={styles.hiddenInput}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) setArchivoNombre(f.name) }}
                    />
                  </div>
                  <p className={styles.helperText}>
                    Se aceptan archivos Excel, TXT y CSV. Columna de SKU obligatoria. Columna de cantidad opcional (aplica si el tipo elegido es GTIN-14 o GS1-128).
                  </p>
                </div>
              )}
            </>
          )}

          {layer === 3 && (
            <>
              <div className={styles.infoBar}>
                {tipo !== 'MANUAL' ? `Prefijo GS1: ${prefijoGs1}` : 'Sin prefijo (código interno)'}
              </div>
              <p className={styles.counter}>
                {seleccionados} de {filas.length} {entidadLabelPlural} seleccionad{entidadFemenino ? 'as' : 'os'} para generar
              </p>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCell} />
                      <th>{entidadFemenino ? 'Fórmula' : 'Artículo'}</th>
                      {mostrarCantidad && <th>Cantidad</th>}
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.length === 0 ? (
                      <tr>
                        <td colSpan={columnas} className={styles.empty}>No hay {entidadLabelPlural} para esta selección</td>
                      </tr>
                    ) : (
                      filas.map((fila) => {
                        const noIncluible = fila.estado === 'error' || fila.estado === 'sinLotes'
                        return (
                          <tr key={fila.key} className={noIncluible ? styles.rowDisabled : ''}>
                            <td className={styles.checkboxCell}>
                              <input type="checkbox" checked={fila.incluido} disabled={noIncluible} onChange={() => toggleFila(fila.key)} />
                            </td>
                            <td>
                              <div className={styles.articuloCell}>
                                <span className={styles.articuloCodigo}>{fila.codigo}</span>
                                <span className={styles.articuloDescripcion}>{fila.descripcion}</span>
                              </div>
                            </td>
                            {mostrarCantidad && (
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  className={styles.cantidadInput}
                                  value={fila.cantidad}
                                  disabled={noIncluible}
                                  onChange={(e) => cambiarCantidadFila(fila.key, e.target.value)}
                                />
                              </td>
                            )}
                            <td>
                              {fila.estado === 'nuevo' && <span className={styles.estadoNuevo}>Sin código</span>}
                              {fila.estado === 'duplicado' && (
                                <span className={styles.estadoDuplicado}><IconAlertTriangle size={14} /> Ya tiene código</span>
                              )}
                              {fila.estado === 'sinLotes' && (
                                <span className={styles.estadoSinLotes}><IconAlertCircle size={14} /> No gestiona lotes</span>
                              )}
                              {fila.estado === 'error' && (
                                <span className={styles.estadoError}><IconAlertCircle size={14} /> SKU no encontrado</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {layer === 4 && resultado && (
            <>
              <div className={styles.resumenOk}>
                <IconCircleCheck size={28} className={styles.resumenIcon} />
                <p className={styles.resumenText}>Se generaron {resultado.exitosos.length} códigos correctamente.</p>
              </div>
              {resultado.errores.length > 0 && (
                <div className={styles.formSection}>
                  <div className={styles.erroresHeader}>
                    <label className={styles.label}>Errores durante la generación</label>
                    <button
                      type="button"
                      className={styles.downloadBtn}
                      onClick={descargarErrores}
                      title="Descargar detalle de errores"
                      aria-label="Descargar detalle de errores"
                    >
                      <IconDownload size={16} />
                    </button>
                  </div>
                  <div className={styles.erroresList}>
                    {resultado.errores.map((err, i) => (
                      <div key={i} className={styles.erroresItem}>
                        <IconAlertCircle size={15} className={styles.erroresIcon} />
                        <span><strong>{err.codigo}</strong> — {err.motivo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          </>
          )}
        </div>

        <div className={styles.footer}>
          {layer === 1 && (
            <button className={styles.primaryBtn} onClick={() => setLayer(2)} disabled={prefijoInvalido || longitudManualInvalida}>Continuar</button>
          )}
          {layer === 2 && (
            <button className={styles.primaryBtn} onClick={handleContinuarLayer2} disabled={metodo === 'excel' && !archivoNombre}>
              Continuar
            </button>
          )}
          {layer === 3 && (
            <button className={styles.primaryBtn} onClick={handleGenerar} disabled={seleccionados === 0 || generando}>
              {generando ? (<><IconLoader2 size={16} className={styles.spinner} /> Generando...</>) : 'Generar códigos'}
            </button>
          )}
          {layer === 4 && (
            <button className={styles.primaryBtn} onClick={onClose}>Finalizar</button>
          )}
        </div>
      </aside>
    </>
  )
}
