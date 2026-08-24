import { useRef, useState } from 'react'
import {
  IconFileSpreadsheet, IconX, IconCheck, IconAlertTriangle,
  IconDownload, IconLoader2,
} from '@tabler/icons-react'

const FIELDS = [
  { key: 'agrupadorCode', label: 'Código agrupador', required: true },
  { key: 'agrupadorName', label: 'Nombre agrupador', required: true },
  { key: 'agrupadorDesc', label: 'Descripción agrupador', required: false },
  { key: 'isColor', label: 'Es color', required: true },
  { key: 'valueCode', label: 'Código de valor', required: true },
  { key: 'valueDesc', label: 'Descripción valor', required: true },
  { key: 'hex', label: 'Código HEX', required: false },
]

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/
const ACCEPTED_EXT = ['.xlsx', '.xls', '.csv']

async function readFile(file) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ACCEPTED_EXT.includes(ext)) {
    throw new Error(`Extensión "${ext || 'desconocida'}" no soportada. Usá un archivo .xlsx, .xls o .csv.`)
  }
  // Carga diferida: la librería de Excel pesa ~380KB, solo se descarga si el usuario importa.
  const XLSX = await import('xlsx')
  const bytes = new Uint8Array(await file.arrayBuffer())
  try {
    // Los .csv son texto plano: los decodificamos como UTF-8 explícitamente para
    // que tildes y "ñ" no se corrompan (XLSX.read con bytes crudos asume codepage).
    const workbook = ext === '.csv'
      ? XLSX.read(new TextDecoder('utf-8').decode(bytes), { type: 'string' })
      : XLSX.read(bytes, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) throw new Error('sin hojas')
    const sheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
    const nonEmpty = json.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    if (nonEmpty.length < 2) throw new Error('sin filas de datos')
    const headers = nonEmpty[0].map((h, i) => String(h ?? '').trim() || `Columna ${i + 1}`)
    const dataRows = nonEmpty.slice(1)
    return { headers, dataRows }
  } catch {
    throw new Error('El archivo está dañado o no tiene un formato compatible. No se procesó ninguna fila.')
  }
}

function runImport(headers, dataRows, mapping, existingRows) {
  const existingCodes = new Set(existingRows.map((r) => r.id.toUpperCase()))
  const seenValueCodesByGroup = {}
  const groups = {}
  const rowResults = []

  const get = (rowArr, key) => {
    const colIdx = mapping[key]
    if (colIdx == null) return ''
    return String(rowArr[colIdx] ?? '').trim()
  }

  dataRows.forEach((rowArr, idx) => {
    const fila = idx + 2
    if (rowArr.every((c) => String(c ?? '').trim() === '')) return

    const agCode = get(rowArr, 'agrupadorCode').toUpperCase()
    const agName = get(rowArr, 'agrupadorName')
    const agDesc = get(rowArr, 'agrupadorDesc')
    const isColorRaw = get(rowArr, 'isColor')
    const valCode = get(rowArr, 'valueCode').toUpperCase()
    const valName = get(rowArr, 'valueDesc')
    const hexRaw = get(rowArr, 'hex')

    if (!agCode || !agName || !isColorRaw || !valCode || !valName) {
      rowResults.push({ fila, estado: 'Error', motivo: 'Faltan datos obligatorios en la fila.' })
      return
    }

    const isColor = isColorRaw === '1'

    if (existingCodes.has(agCode)) {
      rowResults.push({ fila, estado: 'Error', motivo: `El código de agrupador "${agCode}" ya existe.` })
      return
    }

    if (!seenValueCodesByGroup[agCode]) seenValueCodesByGroup[agCode] = new Set()
    if (seenValueCodesByGroup[agCode].has(valCode)) {
      rowResults.push({ fila, estado: 'Error', motivo: `Código de valor "${valCode}" duplicado para el agrupador "${agCode}".` })
      return
    }

    let hex = ''
    if (isColor) {
      if (!hexRaw || !HEX_RE.test(hexRaw)) {
        rowResults.push({ fila, estado: 'Error', motivo: `Código HEX faltante o inválido para agrupador de tipo color (valor "${valCode}").` })
        return
      }
      hex = hexRaw.startsWith('#') ? hexRaw.toUpperCase() : `#${hexRaw.toUpperCase()}`
    }

    seenValueCodesByGroup[agCode].add(valCode)
    if (!groups[agCode]) groups[agCode] = { id: agCode, name: agName, desc: agDesc, values: [] }
    groups[agCode].values.push({ code: valCode, name: valName, ...(hex ? { swatch: hex } : {}) })
    rowResults.push({ fila, estado: 'OK', motivo: '' })
  })

  const newRows = Object.values(groups).filter((g) => g.values.length > 0)
  const valuesCount = newRows.reduce((sum, g) => sum + g.values.length, 0)
  return { newRows, rowResults, summary: { groupsCount: newRows.length, valuesCount } }
}

async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const headers = FIELDS.map((f) => f.label)
  const rows = [
    ['TEX', 'Texturas', 'Texturas de acabado', '0', 'MAT', 'Mate', ''],
    ['TEX', 'Texturas', 'Texturas de acabado', '0', 'BRI', 'Brillante', ''],
    ['TEX', 'Texturas', 'Texturas de acabado', '0', 'SAT', 'Satinado', ''],
    ['TON', 'Paleta de Ejemplo', 'Colores de muestra para la plantilla', '1', 'NEG', 'Negro', '#0F1020'],
    ['TON', 'Paleta de Ejemplo', 'Colores de muestra para la plantilla', '1', 'BLA', 'Blanco', '#FFFFFF'],
    ['TON', 'Paleta de Ejemplo', 'Colores de muestra para la plantilla', '1', 'ROJ', 'Rojo', '#F04438'],
  ]
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  sheet['!cols'] = headers.map((h) => ({ wch: Math.max(h.length, 20) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Agrupadores')
  XLSX.writeFile(workbook, 'plantilla_importacion_agrupadores.xlsx')
}

function downloadResults(rowResults) {
  const header = 'Fila,Estado,Motivo\n'
  const lines = rowResults.map((r) => `${r.fila},${r.estado},"${(r.motivo || '').replace(/"/g, '""')}"`)
  const csv = header + lines.join('\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resultado_importacion_agrupadores.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ImportWizard({ existingRows, onClose, onImportComplete }) {
  const [step, setStep] = useState('file')
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [parsed, setParsed] = useState(null)
  const [mapping, setMapping] = useState({})
  const [mappingError, setMappingError] = useState('')
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileName(file.name)
    setFileError('')
    setParsed(null)
    try {
      const { headers, dataRows } = await readFile(file)
      setParsed({ headers, dataRows })
      const auto = {}
      FIELDS.forEach((f) => {
        const idx = headers.findIndex((h) => h.toLowerCase().replace(/[^a-z]/g, '') === f.label.toLowerCase().replace(/[^a-z]/g, ''))
        if (idx >= 0) auto[f.key] = idx
      })
      setMapping(auto)
    } catch (err) {
      setFileError(err.message)
    }
  }

  function handleConfirmMapping() {
    const missing = FIELDS.filter((f) => f.required && mapping[f.key] == null)
    if (missing.length > 0) {
      setMappingError(`Faltan mapear los campos obligatorios: ${missing.map((f) => f.label).join(', ')}.`)
      return
    }
    setMappingError('')
    setStep('processing')
    setTimeout(() => {
      const { newRows, rowResults, summary } = runImport(parsed.headers, parsed.dataRows, mapping, existingRows)
      setResult({ rowResults, summary })
      onImportComplete(newRows)
      setStep('result')
    }, 500)
  }

  return (
    <aside className="va-panel">
      <div className="va-panel-head">
        <div className="va-ico"><IconFileSpreadsheet size={18} stroke={1.6} /></div>
        <div className="va-grow">
          <div className="va-eyebrow">Importar</div>
          <div className="va-title">Carga masiva de agrupadores</div>
        </div>
        {step !== 'processing' && (
          <button type="button" className="va-btn-icon va-close" onClick={onClose} aria-label="Cerrar">
            <IconX size={18} stroke={1.6} />
          </button>
        )}
      </div>

      <div className="va-panel-body">
          {step === 'file' && (
            <>
              <div className="va-import-dropzone" onClick={() => fileInputRef.current?.click()}>
                <IconFileSpreadsheet size={28} stroke={1.4} />
                <div className="va-ttl">{fileName || 'Hacé clic para elegir un archivo'}</div>
                <div className="va-sub">Formatos soportados: .xlsx, .xls, .csv</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button type="button" className="va-link-btn" onClick={downloadTemplate}>
                <IconDownload size={13} stroke={1.6} /> Descargar plantilla de ejemplo (.xlsx)
              </button>
              {fileError ? (
                <div className="va-alert warn" style={{ marginTop: 14 }}>
                  <IconAlertTriangle size={14} stroke={1.6} className="va-ico" />
                  <div>{fileError}</div>
                </div>
              ) : null}
            </>
          )}

          {step === 'mapping' && parsed && (
            <>
              <p className="va-import-hint">Indicá qué columna del archivo corresponde a cada campo.</p>
              <div className="va-mapping-list">
                {FIELDS.map((f) => (
                  <div className="va-mapping-row" key={f.key}>
                    <div className="va-mapping-label">
                      {f.label} {f.required ? <span className="va-req">*</span> : <span className="va-hint">opcional</span>}
                    </div>
                    <select
                      className="va-input"
                      value={mapping[f.key] ?? ''}
                      onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value === '' ? null : Number(e.target.value) }))}
                    >
                      <option value="">{f.required ? '— Seleccionar columna —' : '— No mapear —'}</option>
                      {parsed.headers.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {mappingError ? (
                <div className="va-alert warn" style={{ marginTop: 14 }}>
                  <IconAlertTriangle size={14} stroke={1.6} className="va-ico" />
                  <div>{mappingError}</div>
                </div>
              ) : null}
            </>
          )}

          {step === 'processing' && (
            <div className="va-import-processing">
              <IconLoader2 size={28} stroke={1.6} className="va-spin" />
              <div className="va-ttl">Procesando archivo…</div>
            </div>
          )}

          {step === 'result' && result && (
            <>
              <div className={`va-import-stat ${result.rowResults.some((r) => r.estado === 'Error') ? 'is-warn' : 'is-ready'}`}>
                <IconCheck size={16} stroke={1.8} />
                <span><b>{result.summary.groupsCount}</b> agrupadores y <b>{result.summary.valuesCount}</b> valores importados correctamente.</span>
              </div>
              {result.rowResults.filter((r) => r.estado === 'Error').length > 0 && (
                <>
                  <div className="va-import-stat is-warn" style={{ marginTop: 8 }}>
                    <IconAlertTriangle size={16} stroke={1.8} />
                    <span>{result.rowResults.filter((r) => r.estado === 'Error').length} fila(s) con error.</span>
                  </div>
                  <div className="va-import-errors">
                    <table className="va-grid">
                      <thead>
                        <tr><th style={{ width: 70 }}>Fila</th><th>Motivo</th></tr>
                      </thead>
                      <tbody>
                        {result.rowResults.filter((r) => r.estado === 'Error').map((r, i) => (
                          <tr key={i}><td>{r.fila}</td><td>{r.motivo}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="va-panel-foot">
          {step === 'file' && (
            <>
              <div />
              <div className="va-actions">
                <button type="button" className="va-btn va-btn-ghost" onClick={onClose}>Cancelar</button>
                <button type="button" className="va-btn va-btn-primary" disabled={!parsed} onClick={() => setStep('mapping')}>Continuar</button>
              </div>
            </>
          )}
          {step === 'mapping' && (
            <>
              <div />
              <div className="va-actions">
                <button type="button" className="va-btn va-btn-ghost" onClick={() => { setStep('file'); setMappingError('') }}>Atrás</button>
                <button type="button" className="va-btn va-btn-primary" onClick={handleConfirmMapping}>Iniciar importación</button>
              </div>
            </>
          )}
          {step === 'result' && (
            <>
              <button
                type="button"
                className="va-btn va-btn-secondary"
                disabled={!result?.rowResults?.length}
                onClick={() => downloadResults(result.rowResults)}
              >
                <IconDownload size={15} stroke={1.6} /> Descargar resultados
              </button>
              <div className="va-actions">
                <button type="button" className="va-btn va-btn-primary" onClick={onClose}>Cerrar</button>
              </div>
            </>
          )}
        </div>
    </aside>
  )
}
