import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconUpload, IconFileDownload, IconAlertCircle, IconCircleCheck, IconLoader2, IconDownload } from '@tabler/icons-react'
import { validarFormato, existeCodigoDuplicado } from '../utils/gtin'
import TipoCodigoBadge from './TipoCodigoBadge'
import styles from './ImportarCodigosPanel.module.css'

const TIPOS_IMPORTABLES = ['GTIN-13', 'GTIN-14', 'MANUAL']

const ETIQUETA_TIPO_ARCHIVO = { 'GTIN-13': 'GTIN-13', 'GTIN-14': 'GTIN-14', MANUAL: 'CODE-128' }

function normalizarTipoImportado(valor) {
  const v = (valor || '').trim().toUpperCase()
  if (v === 'GTIN-13') return 'GTIN-13'
  if (v === 'GTIN-14') return 'GTIN-14'
  if (v === 'CODE-128' || v === 'MANUAL') return 'MANUAL'
  if (v === 'GS1-128') return 'GS1-128'
  return null
}

const MOCK_FILAS_IMPORTACION = [
  { sku: 'ART-002', codigo: '7791234500000', tipo: 'GTIN-13', cantidad: '5' },
  { sku: 'ART-030', codigo: '10779123400017', tipo: 'GTIN-14', cantidad: '50' },
  { sku: 'ART-030', codigo: 'INT-777888', tipo: 'CODE-128', cantidad: '24' },
  { sku: 'SKU-999', codigo: '1234567890128', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'ART-002', codigo: '7791234567890', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'ART-020', codigo: '', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'ART-020', codigo: '00177912345679999', tipo: 'GS1-128', cantidad: '1' },
  { sku: 'ART-010', codigo: '999', tipo: 'GTIN-14', cantidad: '10' },
  { sku: 'ART-001', codigo: '10779123499999', tipo: 'GTIN-14', cantidad: '' },
]

export const MOCK_FILAS_IMPORTACION_FORMULAS = [
  { sku: 'FOR-1002', codigo: '7791234509003', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'FOR-1004', codigo: 'INT-555000', tipo: 'CODE-128', cantidad: '24' },
  { sku: 'SKU-999', codigo: '1234567890128', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'FOR-1002', codigo: '7791234501001', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'FOR-1003', codigo: '', tipo: 'GTIN-13', cantidad: '1' },
  { sku: 'FOR-1003', codigo: '00177912345679999', tipo: 'GS1-128', cantidad: '1' },
  { sku: 'FOR-1004', codigo: '999', tipo: 'GTIN-14', cantidad: '10' },
  { sku: 'FOR-1002', codigo: '10779123400099', tipo: 'GTIN-14', cantidad: '' },
]

export const EJEMPLO_LINEAS_FORMULAS = [
  'FOR-1001;7791234501001;GTIN-13;1',
  'FOR-1004;10779123400505;GTIN-14;50',
  'FOR-1002;INT-777888;CODE-128;24',
]

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function procesarImportacion(articulos, filas, entidadLabel, entidadFemenino) {
  const exitosos = []
  const errores = []
  filas.forEach((fila) => {
    const texto = fila.codigo.trim()
    const articulo = articulos.find((a) => a.codigo === fila.sku)
    if (!articulo) {
      errores.push({ codigo: fila.sku, motivo: `${capitalizar(entidadLabel)} no encontrad${entidadFemenino ? 'a' : 'o'}.` })
      return
    }
    if (!texto) {
      errores.push({ codigo: fila.sku, motivo: 'Código de barras vacío.' })
      return
    }
    const tipo = normalizarTipoImportado(fila.tipo)
    if (tipo === 'GS1-128') {
      errores.push({ codigo: fila.sku, motivo: 'GS1-128 no se puede importar por este medio.' })
      return
    }
    if (!tipo) {
      errores.push({ codigo: fila.sku, motivo: 'Tipo de código no reconocido.' })
      return
    }
    const cantidadTexto = (fila.cantidad ?? '').toString().trim()
    if (tipo !== 'GTIN-13' && !cantidadTexto) {
      errores.push({ codigo: fila.sku, motivo: 'Cantidad no informada.' })
      return
    }
    if (existeCodigoDuplicado(articulos, texto)) {
      errores.push({ codigo: fila.sku, motivo: `Este código ya está asignado a ${entidadFemenino ? 'otra' : 'otro'} ${entidadLabel}.` })
      return
    }
    if (!validarFormato(tipo, texto)) {
      errores.push({ codigo: fila.sku, motivo: `El código no es válido para ${ETIQUETA_TIPO_ARCHIVO[tipo]}.` })
      return
    }
    const cantidad = tipo === 'GTIN-13' ? 1 : Number(cantidadTexto)
    exitosos.push({
      articuloId: articulo.id,
      codigo: { id: `c${Date.now()}-${exitosos.length}`, tipo, codigo: texto, cantidad },
    })
  })
  return { exitosos, errores }
}

function descargarTexto(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ImportarCodigosPanel({
  articulos,
  onImportar,
  onClose,
  mockFilas = MOCK_FILAS_IMPORTACION,
  entidadLabel = 'artículo',
  entidadFemenino = false,
  columnaIdLabel = 'Código de artículo',
  ejemploLineas = [
    'ART-001;7791234567890;GTIN-13;1',
    'ART-010;10779123400017;GTIN-14;50',
    'ART-030;INT-777888;CODE-128;24',
  ],
}) {
  const [archivoNombre, setArchivoNombre] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDrop = (event) => {
    event.preventDefault()
    setArrastrando(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setArchivoNombre(file.name)
  }

  const descargarEjemplo = () => {
    descargarTexto(
      'ejemplo-importar-codigos.csv',
      `${columnaIdLabel};Código de barras;Tipo de código;Cantidad\n${ejemploLineas.map((l) => `${l}\n`).join('')}`,
      'text/csv;charset=utf-8;'
    )
  }

  const descargarErrores = () => {
    const encabezado = `${columnaIdLabel};Motivo\n`
    const filasCsv = resultado.errores.map((err) => `${err.codigo};${err.motivo}`).join('\n')
    descargarTexto('errores-importacion-codigos.csv', encabezado + filasCsv, 'text/csv;charset=utf-8;')
  }

  const handleContinuar = () => {
    setProcesando(true)
    setTimeout(() => {
      const res = procesarImportacion(articulos, mockFilas, entidadLabel, entidadFemenino)
      onImportar(res.exitosos)
      setResultado(res)
      setProcesando(false)
    }, 700)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.headerWithBack}>
            {resultado && (
              <button className={styles.backBtn} onClick={() => setResultado(null)} aria-label="Volver">
                <IconChevronLeft size={18} />
              </button>
            )}
            <div>
              <p className={styles.eyebrow}>Importar códigos</p>
              <h2 className={styles.title}>{resultado ? 'Resultado' : 'Cargar archivo'}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)">
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {!resultado ? (
            <>
              <div className={styles.formSection}>
                <label className={styles.label}>Archivo</label>
                <div
                  className={`${styles.dropzone} ${arrastrando ? styles.dropzoneActive : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('ic-file-input').click()}
                >
                  <IconUpload size={24} className={styles.dropzoneIcon} />
                  <p className={styles.dropzoneText}>
                    {archivoNombre || 'Arrastrá un archivo o hacé clic para seleccionarlo'}
                  </p>
                  <input
                    id="ic-file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt"
                    className={styles.hiddenInput}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setArchivoNombre(f.name) }}
                  />
                </div>
                <p className={styles.helperText}>
                  Se aceptan archivos Excel, TXT y CSV. El archivo debe tener una columna para el código de {entidadLabel}, otra para el código de barras, otra para el tipo de código y otra para la cantidad.
                </p>
                <p className={styles.helperText}>
                  La columna Cantidad es obligatoria para códigos GTIN-14 y Code-128. Para GTIN-13, la cantidad será siempre 1.
                </p>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>Tipos de código admitidos</label>
                <div className={styles.tiposBadgeRow}>
                  {TIPOS_IMPORTABLES.map((tipo) => <TipoCodigoBadge key={tipo} tipo={tipo} />)}
                </div>
              </div>

              <button type="button" className={styles.exampleBtn} onClick={descargarEjemplo}>
                <IconFileDownload size={16} />
                Descargar archivo de ejemplo
              </button>
            </>
          ) : (
            <>
              <div className={styles.resumenOk}>
                <IconCircleCheck size={28} className={styles.resumenIcon} />
                <p className={styles.resumenText}>Se importaron {resultado.exitosos.length} códigos correctamente.</p>
              </div>
              {resultado.errores.length > 0 && (
                <div className={styles.formSection}>
                  <div className={styles.erroresHeader}>
                    <label className={styles.label}>Errores durante la importación</label>
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
        </div>

        <div className={styles.footer}>
          {!resultado ? (
            <button className={styles.primaryBtn} onClick={handleContinuar} disabled={!archivoNombre || procesando}>
              {procesando ? (<><IconLoader2 size={16} className={styles.spinner} /> Procesando...</>) : 'Continuar'}
            </button>
          ) : (
            <button className={styles.primaryBtn} onClick={onClose}>Finalizar</button>
          )}
        </div>
      </aside>
    </>
  )
}
