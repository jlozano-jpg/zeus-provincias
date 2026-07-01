import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import styles from './GeneradorEtiquetasModal.module.css'
import { UBICACIONES_DATA, getLeafIds, getAllLeaves } from '../data/ubicaciones'

// ── Helpers ─────────────────────────────────────────────────────────────────

function getCheckState(node, selectedIds) {
  const leaves = getLeafIds(node)
  if (!leaves.length) return 'unchecked'
  const n = leaves.filter(id => selectedIds.has(id)).length
  if (n === 0) return 'unchecked'
  if (n === leaves.length) return 'checked'
  return 'indeterminate'
}

// ── Checkbox SVG ─────────────────────────────────────────────────────────────

function Checkbox({ state, onChange }) {
  return (
    <button className={`${styles.checkbox} ${styles[`checkbox_${state}`]}`} onClick={onChange} type="button">
      {state === 'checked' && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {state === 'indeterminate' && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

// ── Tree Node ─────────────────────────────────────────────────────────────────

function TreeCheckNode({ node, selectedIds, onToggle, level, expandedIds, onToggleExpand }) {
  const hasChildren = node.children?.length > 0
  const isExpanded = expandedIds.has(node.id)
  const state = getCheckState(node, selectedIds)
  const isLeaf = !hasChildren

  const leafIds = useMemo(() => getLeafIds(node), [node])

  const handleCheck = (e) => {
    e.stopPropagation()
    onToggle(leafIds, state !== 'checked')
  }

  const handleExpand = (e) => {
    e.stopPropagation()
    if (hasChildren) onToggleExpand(node.id)
  }

  return (
    <div>
      <div
        className={`${styles.treeRow} ${isLeaf ? styles.treeRowLeaf : ''}`}
        style={{ paddingLeft: `${12 + level * 18}px` }}
      >
        <span
          className={`${styles.treeChevron} ${!hasChildren ? styles.treeChevronHidden : ''} ${isExpanded ? styles.treeChevronOpen : ''}`}
          onClick={handleExpand}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>

        <Checkbox state={state} onChange={handleCheck} />

        <span className={styles.treeCode}>{node.codigo}</span>
        <span className={styles.treeName} onClick={hasChildren ? handleExpand : undefined}>
          {node.nombre}
        </span>
        {isLeaf && <span className={styles.leafPill}>Imprimible</span>}
      </div>

      {hasChildren && isExpanded && node.children.map(child => (
        <TreeCheckNode
          key={child.id}
          node={child}
          selectedIds={selectedIds}
          onToggle={onToggle}
          level={level + 1}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  )
}

// ── QR Preview ────────────────────────────────────────────────────────────────

function QRPreview({ value }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, { width: 120, margin: 1, color: { dark: '#002955', light: '#ffffff' } })
  }, [value])
  return <canvas ref={canvasRef} />
}

function BarcodePreview({ value }) {
  const svgRef = useRef(null)
  useEffect(() => {
    if (!svgRef.current || !value) return
    JsBarcode(svgRef.current, value, {
      format: 'CODE128', width: 2, height: 60, displayValue: false,
      lineColor: '#002955', background: 'transparent',
    })
  }, [value])
  return <svg ref={svgRef} />
}

// ── Etiqueta Preview ──────────────────────────────────────────────────────────

function EtiquetaPreview({ codigo, tipo }) {
  return (
    <div className={styles.etiqueta}>
      <div className={styles.etiquetaCodigo}>
        {tipo === 'qr' ? <QRPreview value={codigo} /> : <BarcodePreview value={codigo} />}
      </div>
      <div className={styles.etiquetaTexto}>{codigo}</div>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────

const LAYOUTS = [
  { value: 1,  label: '1 × hoja' },
  { value: 2,  label: '2 × hoja' },
  { value: 4,  label: '4 × hoja' },
  { value: 6,  label: '6 × hoja' },
  { value: 8,  label: '8 × hoja' },
  { value: 12, label: '12 × hoja' },
]

export default function GeneradorEtiquetasModal({ onClose, preselectedNode = null }) {
  const allLeaves = useMemo(() => getAllLeaves(UBICACIONES_DATA), [])

  const initialSelected = useMemo(() => {
    if (!preselectedNode) return new Set()
    return new Set(getLeafIds(preselectedNode))
  }, [preselectedNode])

  const [selectedIds, setSelectedIds] = useState(initialSelected)
  const [expandedIds, setExpandedIds] = useState(() => {
    if (preselectedNode) return new Set([preselectedNode.id])
    return new Set()
  })
  const [search, setSearch] = useState('')
  const [tipoCodigo, setTipoCodigo] = useState('qr')
  const [layout, setLayout] = useState(4)
  const [copias, setCopias] = useState(1)

  const count = selectedIds.size
  const previewCodigo = count > 0
    ? (allLeaves.find(l => selectedIds.has(l.id))?.codigo ?? allLeaves[0]?.codigo)
    : allLeaves[0]?.codigo ?? 'A4-01-P1-C1'

  const handleToggle = useCallback((leafIds, select) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      leafIds.forEach(id => select ? next.add(id) : next.delete(id))
      return next
    })
  }, [])

  const handleToggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = () => setSelectedIds(new Set(allLeaves.map(l => l.id)))
  const handleDeselectAll = () => setSelectedIds(new Set())

  const handleGenerar = () => {
    // Paso 3: generación PDF — próxima etapa
    alert(`Generando PDF con ${count} etiquetas (${tipoCodigo.toUpperCase()}, ${layout} por hoja, ${copias} copia/s)…`)
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return UBICACIONES_DATA
    const term = search.toLowerCase()
    function filterTree(nodes) {
      return nodes.reduce((acc, node) => {
        const match = node.nombre.toLowerCase().includes(term) || node.codigo.toLowerCase().includes(term)
        const filteredChildren = filterTree(node.children ?? [])
        if (match || filteredChildren.length) {
          acc.push({ ...node, children: filteredChildren })
        }
        return acc
      }, [])
    }
    return filterTree(UBICACIONES_DATA)
  }, [search])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.headerLabel}>GESTIÓN DE UBICACIONES</span>
            <span className={styles.headerTitle}>Generar etiquetas de ubicaciones</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* ── PANEL IZQ: Árbol de selección ── */}
          <div className={styles.treePanel}>
            <div className={styles.treePanelHeader}>
              <span className={styles.treePanelTitle}>Selección de ubicaciones</span>
              <div className={styles.selActions}>
                <button className={styles.selBtn} onClick={handleSelectAll}>Todas</button>
                <button className={styles.selBtn} onClick={handleDeselectAll}>Ninguna</button>
              </div>
            </div>

            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Buscar en el árbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <div className={styles.treeScroll}>
              {filteredData.map(node => (
                <TreeCheckNode
                  key={node.id}
                  node={node}
                  selectedIds={selectedIds}
                  onToggle={handleToggle}
                  level={0}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>

            <div className={styles.counter}>
              <span className={styles.counterNum}>{count}</span>
              <span className={styles.counterLabel}>
                {count === 1 ? 'ubicación seleccionada' : 'ubicaciones seleccionadas'}
              </span>
              <span className={styles.counterTotal}>/ {allLeaves.length} total</span>
            </div>
          </div>

          {/* ── PANEL DER: Configuración + Preview ── */}
          <div className={styles.configPanel}>
            <div className={styles.configSection}>
              <span className={styles.configSectionTitle}>Tipo de código</span>
              <div className={styles.tipoGroup}>
                <button
                  className={`${styles.tipoBtn} ${tipoCodigo === 'qr' ? styles.tipoBtnActive : ''}`}
                  onClick={() => setTipoCodigo('qr')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="5" height="5" rx="0.5" /><rect x="16" y="3" width="5" height="5" rx="0.5" />
                    <rect x="3" y="16" width="5" height="5" rx="0.5" /><rect x="11" y="11" width="3" height="3" />
                    <path d="M16 11h5M16 16h2v5M21 16v5" />
                  </svg>
                  Código QR
                </button>
                <button
                  className={`${styles.tipoBtn} ${tipoCodigo === 'barras' ? styles.tipoBtnActive : ''}`}
                  onClick={() => setTipoCodigo('barras')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14" />
                  </svg>
                  Código de barras
                </button>
              </div>
            </div>

            <div className={styles.configSection}>
              <span className={styles.configSectionTitle}>Etiquetas por hoja A4</span>
              <div className={styles.layoutGrid}>
                {LAYOUTS.map(l => (
                  <button
                    key={l.value}
                    className={`${styles.layoutBtn} ${layout === l.value ? styles.layoutBtnActive : ''}`}
                    onClick={() => setLayout(l.value)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.configSection}>
              <span className={styles.configSectionTitle}>Copias por ubicación</span>
              <div className={styles.copiasWrap}>
                <button
                  className={styles.copiasBtn}
                  onClick={() => setCopias(v => Math.max(1, v - 1))}
                  disabled={copias <= 1}
                >−</button>
                <span className={styles.copiasVal}>{copias}</span>
                <button
                  className={styles.copiasBtn}
                  onClick={() => setCopias(v => Math.min(20, v + 1))}
                  disabled={copias >= 20}
                >+</button>
              </div>
            </div>

            <div className={styles.configSection}>
              <span className={styles.configSectionTitle}>Vista previa de etiqueta</span>
              <div className={styles.previewWrap}>
                <EtiquetaPreview codigo={previewCodigo} tipo={tipoCodigo} />
              </div>
              <p className={styles.previewHint}>
                {count > 0 ? `Mostrando primera ubicación seleccionada` : `Sin selección — vista de ejemplo`}
              </p>
            </div>

            {count > 0 && (
              <div className={styles.resumen}>
                <span>
                  <strong>{count}</strong> ubicación{count !== 1 ? 'es' : ''} ×{' '}
                  <strong>{copias}</strong> copia{copias !== 1 ? 's' : ''} ={' '}
                  <strong>{count * copias}</strong> etiqueta{count * copias !== 1 ? 's' : ''}
                  {' '}en <strong>{Math.ceil(count * copias / layout)}</strong> hoja{Math.ceil(count * copias / layout) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button
            className={styles.generateBtn}
            onClick={handleGenerar}
            disabled={count === 0}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Generar PDF
            {count > 0 && <span className={styles.generateBadge}>{count * copias}</span>}
          </button>
        </div>

      </div>
    </div>
  )
}
