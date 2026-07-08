import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconUpload, IconAlertTriangle, IconAlertCircle, IconCircleCheck, IconLoader2 } from '@tabler/icons-react'
import { TIPOS_CODIGO, tipoInfo, FAMILIAS, PROVEEDORES, MOCK_EXCEL_SKUS } from '../data/codigosBarra'
import { generarCodigo } from '../utils/gtin'
import styles from './GeneracionMasivaPanel.module.css'

const TIPOS_DISPONIBLES = TIPOS_CODIGO.filter((t) => t.value !== 'GTIN-128')

function construirFilasPorFiltros(articulos, tipo, familia, proveedor) {
  return articulos
    .filter((a) => (!familia || a.familia === familia) && (!proveedor || a.proveedor === proveedor))
    .map((a) => ({
      key: a.id,
      articuloId: a.id,
      codigo: a.codigo,
      descripcion: a.descripcion,
      cantidad: '1',
      estado: a.codigos.some((c) => c.tipo === tipo) ? 'duplicado' : 'nuevo',
      incluido: true,
    }))
}

function construirFilasPorExcel(articulos, tipo) {
  return MOCK_EXCEL_SKUS.map((sku) => {
    const articulo = articulos.find((a) => a.codigo === sku)
    if (!articulo) {
      return { key: sku, articuloId: null, codigo: sku, descripcion: '—', cantidad: '1', estado: 'error', incluido: false }
    }
    return {
      key: articulo.id,
      articuloId: articulo.id,
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      cantidad: '1',
      estado: articulo.codigos.some((c) => c.tipo === tipo) ? 'duplicado' : 'nuevo',
      incluido: true,
    }
  })
}

function ejecutarGeneracion(filas, tipo, prefijo) {
  const incluidas = filas.filter((f) => f.incluido && f.estado !== 'error')
  const exitosos = []
  const errores = []
  incluidas.forEach((fila, index) => {
    const esFallaSimulada = incluidas.length > 1 && index === incluidas.length - 1
    if (esFallaSimulada) {
      errores.push({ codigo: fila.codigo, motivo: 'Conflicto detectado en el servidor durante la generación.' })
      return
    }
    const cantidad = tipo === 'GTIN-14' ? (Number(fila.cantidad) || 1) : 1
    exitosos.push({
      articuloId: fila.articuloId,
      codigo: { id: `c${Date.now()}-${index}`, tipo, codigo: generarCodigo(tipo, { prefijo }), cantidad },
    })
  })
  return { exitosos, errores }
}

export default function GeneracionMasivaPanel({ articulos, onClose, onGenerar }) {
  const [layer, setLayer] = useState(1)
  const [tipo, setTipo] = useState('GTIN-13')
  const [metodo, setMetodo] = useState('filtros')
  const [familia, setFamilia] = useState('')
  const [proveedor, setProveedor] = useState('')
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

  const info = tipoInfo(tipo)

  const handleContinuarLayer2 = () => {
    const nuevasFilas = metodo === 'filtros'
      ? construirFilasPorFiltros(articulos, tipo, familia, proveedor)
      : construirFilasPorExcel(articulos, tipo)
    setFilas(nuevasFilas)
    setLayer(3)
  }

  const toggleFila = (key) => {
    setFilas((prev) => prev.map((f) => (f.key === key && f.estado !== 'error' ? { ...f, incluido: !f.incluido } : f)))
  }

  const cambiarCantidadFila = (key, cantidad) => {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, cantidad } : f)))
  }

  const handleGenerar = () => {
    setGenerando(true)
    setTimeout(() => {
      const res = ejecutarGeneracion(filas, tipo, info.prefijoGs1)
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

  const seleccionados = filas.filter((f) => f.incluido).length

  const titulos = {
    1: 'Tipo de código',
    2: 'Selección de artículos',
    3: 'Previsualización',
    4: 'Resultado',
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.headerWithBack}>
            {layer > 1 && layer < 4 && (
              <button className={styles.backBtn} onClick={() => setLayer((l) => l - 1)} aria-label="Volver">
                <IconChevronLeft size={18} />
              </button>
            )}
            <div>
              <p className={styles.eyebrow}>Generación masiva</p>
              <h2 className={styles.title}>{titulos[layer]}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {layer === 1 && (
            <div className={styles.formSection}>
              <label className={styles.label}>Tipo de código a generar</label>
              <select className={styles.select} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_DISPONIBLES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className={styles.helperText}>
                GTIN-128 no está disponible en este flujo: depende de seleccionar un lote por artículo, se resuelve solo en la asignación individual.
              </p>
            </div>
          )}

          {layer === 2 && (
            <>
              <div className={styles.formSection}>
                <div className={styles.segmented}>
                  <button type="button" className={`${styles.segmentedBtn} ${metodo === 'filtros' ? styles.segmentedBtnActive : ''}`} onClick={() => setMetodo('filtros')}>
                    Filtros
                  </button>
                  <button type="button" className={`${styles.segmentedBtn} ${metodo === 'excel' ? styles.segmentedBtnActive : ''}`} onClick={() => setMetodo('excel')}>
                    Cargar Excel
                  </button>
                </div>
              </div>

              {metodo === 'filtros' ? (
                <>
                  <div className={styles.formSection}>
                    <label className={styles.label}>Familia</label>
                    <select className={styles.select} value={familia} onChange={(e) => setFamilia(e.target.value)}>
                      <option value="">Todas</option>
                      {FAMILIAS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className={styles.formSection}>
                    <label className={styles.label}>Proveedor</label>
                    <select className={styles.select} value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                      <option value="">Todos</option>
                      {PROVEEDORES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
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
                      accept=".xlsx,.xls,.csv"
                      className={styles.hiddenInput}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) setArchivoNombre(f.name) }}
                    />
                  </div>
                  <p className={styles.helperText}>
                    Columna de SKU obligatoria. Columna de cantidad opcional (solo aplica si el tipo elegido es GTIN-14).
                  </p>
                </div>
              )}
            </>
          )}

          {layer === 3 && (
            <>
              <div className={styles.infoBar}>
                {info.prefijoGs1 ? `Prefijo GS1: ${info.prefijoGs1}` : 'Sin prefijo (código interno)'}
              </div>
              <p className={styles.counter}>{seleccionados} de {filas.length} artículos seleccionados para generar</p>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.checkboxCell} />
                      <th>Artículo</th>
                      {tipo === 'GTIN-14' && <th>Cantidad</th>}
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.length === 0 ? (
                      <tr>
                        <td colSpan={tipo === 'GTIN-14' ? 4 : 3} className={styles.empty}>No hay artículos para esta selección</td>
                      </tr>
                    ) : (
                      filas.map((fila) => (
                        <tr key={fila.key} className={fila.estado === 'error' ? styles.rowDisabled : ''}>
                          <td className={styles.checkboxCell}>
                            <input type="checkbox" checked={fila.incluido} disabled={fila.estado === 'error'} onChange={() => toggleFila(fila.key)} />
                          </td>
                          <td>
                            <div className={styles.articuloCell}>
                              <span className={styles.articuloCodigo}>{fila.codigo}</span>
                              <span className={styles.articuloDescripcion}>{fila.descripcion}</span>
                            </div>
                          </td>
                          {tipo === 'GTIN-14' && (
                            <td>
                              <input
                                type="number"
                                min="1"
                                className={styles.cantidadInput}
                                value={fila.cantidad}
                                disabled={fila.estado === 'error'}
                                onChange={(e) => cambiarCantidadFila(fila.key, e.target.value)}
                              />
                            </td>
                          )}
                          <td>
                            {fila.estado === 'nuevo' && <span className={styles.estadoNuevo}>Nuevo</span>}
                            {fila.estado === 'duplicado' && (
                              <span className={styles.estadoDuplicado}><IconAlertTriangle size={14} /> Ya tiene código</span>
                            )}
                            {fila.estado === 'error' && (
                              <span className={styles.estadoError}><IconAlertCircle size={14} /> SKU no encontrado</span>
                            )}
                          </td>
                        </tr>
                      ))
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
                  <label className={styles.label}>Errores durante la generación</label>
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
        </div>

        <div className={styles.footer}>
          {layer === 1 && (
            <button className={styles.primaryBtn} onClick={() => setLayer(2)}>Continuar</button>
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
