import { useEffect, useState } from 'react'
import { IconX, IconChevronLeft, IconUpload, IconFileDownload, IconAlertCircle, IconCircleCheck, IconLoader2, IconDownload } from '@tabler/icons-react'
import { validarFormato, existeCodigoDuplicado } from '../utils/gtin'
import styles from './ImportarCodigosPanel.module.css'

const MOCK_FILAS_IMPORTACION = [
  { sku: 'ART-002', codigo: '7791234500000' },
  { sku: 'ART-030', codigo: 'INT-777888' },
  { sku: 'SKU-999', codigo: '1234567890128' },
  { sku: 'ART-002', codigo: '7791234567890' },
  { sku: 'ART-010', codigo: '' },
]

function detectarTipoCodigo(codigo) {
  for (const tipo of ['GTIN-8', 'GTIN-13', 'GTIN-14']) {
    if (validarFormato(tipo, codigo)) return tipo
  }
  return 'MANUAL'
}

function procesarImportacion(articulos) {
  const exitosos = []
  const errores = []
  MOCK_FILAS_IMPORTACION.forEach((fila) => {
    const texto = fila.codigo.trim()
    const articulo = articulos.find((a) => a.codigo === fila.sku)
    if (!articulo) {
      errores.push({ codigo: fila.sku, motivo: 'Artículo no encontrado.' })
      return
    }
    if (!texto) {
      errores.push({ codigo: fila.sku, motivo: 'Código de barras vacío.' })
      return
    }
    if (existeCodigoDuplicado(articulos, texto)) {
      errores.push({ codigo: fila.sku, motivo: 'Este código ya está asignado a otro artículo.' })
      return
    }
    exitosos.push({
      articuloId: articulo.id,
      codigo: { id: `c${Date.now()}-${exitosos.length}`, tipo: detectarTipoCodigo(texto), codigo: texto, cantidad: 1 },
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

export default function ImportarCodigosPanel({ articulos, onImportar, onClose }) {
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
      'Código de artículo;Código de barras\nART-001;7791234567890\nART-002;7791234500000\n',
      'text/csv;charset=utf-8;'
    )
  }

  const descargarErrores = () => {
    const encabezado = 'Código de artículo;Motivo\n'
    const filasCsv = resultado.errores.map((err) => `${err.codigo};${err.motivo}`).join('\n')
    descargarTexto('errores-importacion-codigos.csv', encabezado + filasCsv, 'text/csv;charset=utf-8;')
  }

  const handleContinuar = () => {
    setProcesando(true)
    setTimeout(() => {
      const res = procesarImportacion(articulos)
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
                  Se aceptan archivos Excel, TXT y CSV. Una columna debe corresponder al código de artículo y otra al código de barras.
                </p>
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
