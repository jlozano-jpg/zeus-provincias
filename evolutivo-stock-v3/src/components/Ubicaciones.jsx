import { useState, useEffect, useRef } from 'react'
import styles from './Ubicaciones.module.css'

function makeDeposito(num) {
  const d = `dep-${num}`
  return {
    id: d, codigo: `D${num}`, nombre: `Depósito ${num}`, tipo: 'deposito',
    children: [1, 2].map(z => ({
      id: `${d}-z${z}`, codigo: `Z${z}`, nombre: `Zona ${z}`, tipo: 'zona',
      children: [1, 2].map(p => ({
        id: `${d}-z${z}-p${p}`, codigo: `P${p}`, nombre: `Pasillo ${p}`, tipo: 'pasillo',
        children: [1, 2].map(c => ({
          id: `${d}-z${z}-p${p}-c${c}`, codigo: `C${c}`, nombre: `Casillero ${c}`, tipo: 'casillero',
          children: []
        }))
      }))
    }))
  }
}

const DATA = [1, 2, 3, 4, 5].map(makeDeposito)

function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function getAncestors(nodes, targetId, path = []) {
  for (const node of nodes) {
    const next = [...path, node]
    if (node.id === targetId) return next
    if (node.children?.length) {
      const found = getAncestors(node.children, targetId, next)
      if (found) return found
    }
  }
  return null
}

// ── Icons ──────────────────────────────────────────────────────────────────

function IconDeposito() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconZona() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconPasillo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="5" rx="1.5" />
      <rect x="3" y="10" width="18" height="5" rx="1.5" />
      <rect x="3" y="17" width="18" height="4" rx="1.5" />
    </svg>
  )
}

function IconCasillero() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

const TIPO_ICONS = {
  deposito: IconDeposito,
  zona: IconZona,
  pasillo: IconPasillo,
  casillero: IconCasillero,
}

// ── Tree Node ──────────────────────────────────────────────────────────────

function TreeNode({ node, selectedId, expandedIds, onSelect, onToggle, level }) {
  const hasChildren = node.children?.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id

  const handleChevronClick = (e) => {
    e.stopPropagation()
    if (hasChildren) onToggle(node.id)
  }

  return (
    <div>
      <button
        className={`${styles.treeNode} ${isSelected ? styles.treeNodeSelected : ''}`}
        style={{ paddingLeft: `${10 + level * 14}px` }}
        onClick={() => onSelect(node)}
      >
        <span
          className={`${styles.treeChevron} ${!hasChildren ? styles.treeChevronHidden : ''} ${isExpanded ? styles.treeChevronOpen : ''}`}
          onClick={handleChevronClick}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
        <span className={styles.treeCode}>{node.codigo}</span>
        <span className={styles.treeName}>{node.nombre}</span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────

function UbicacionCard({ node, onOpen, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const Icon = TIPO_ICONS[node.tipo] || IconDeposito
  const hasChildren = node.children?.length > 0

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className={styles.card} onClick={() => hasChildren && onOpen(node)}>
      {/* Menú 3 puntos */}
      <div
        className={styles.cardMenuWrap}
        ref={menuRef}
        onClick={e => e.stopPropagation()}
      >
        <button
          className={styles.cardMenuBtn}
          onClick={() => setMenuOpen(m => !m)}
          title="Opciones"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className={styles.cardDropdown}>
            <button
              className={styles.cardDropdownItem}
              onClick={() => { setMenuOpen(false); onEdit(node) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              className={`${styles.cardDropdownItem} ${styles.cardDropdownDelete}`}
              onClick={() => { setMenuOpen(false); onDelete(node) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardIconWrap}>
          <Icon />
        </div>
        <span className={styles.cardBadge}>{node.codigo}</span>
        <span className={styles.cardName}>{node.nombre}</span>
      </div>
      <div className={styles.cardFooter}>
        {hasChildren ? (
          <span className={styles.cardAbrirBtn}>
            Abrir <span className={styles.cardArrow}>→</span>
          </span>
        ) : (
          <span className={styles.cardLeafLabel}>Casillero</span>
        )}
      </div>
    </div>
  )
}

// ── Edit Panel ─────────────────────────────────────────────────────────────

const AREAS = ['Pinturería', 'Ferretería', 'Eléctrica', 'Herramientas', 'Plomería', 'Maderas', 'Construcción']

function IconAltura() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M5 9l7-7 7 7" />
      <path d="M5 20h14" />
    </svg>
  )
}

function EditUbicacionPanel({ node, parentName, onClose }) {
  const [codigo, setCodigo] = useState(node.codigo)
  const [descripcion, setDescripcion] = useState(node.nombre)
  const [area, setArea] = useState('')
  const [enAltura, setEnAltura] = useState(false)

  return (
    <div className={styles.editPanel}>
      <div className={styles.editPanelHeader}>
        <div className={styles.editPanelMeta}>
          <span className={styles.editPanelLabel}>GESTIÓN DE UBICACIONES</span>
          <span className={styles.editPanelTitle}>Editar ubicación</span>
          {parentName && (
            <span className={styles.editPanelSubtitle}>Ubicada en: {parentName}</span>
          )}
        </div>
        <button className={styles.editPanelClose} onClick={onClose} title="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className={styles.editPanelBody}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Código <span className={styles.formRequired}>*</span>
          </label>
          <input
            className={styles.formInput}
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder={node.codigo}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Descripción <span className={styles.formRequired}>*</span>
          </label>
          <input
            className={styles.formInput}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Área</label>
          <select
            className={styles.formSelect}
            value={area}
            onChange={e => setArea(e.target.value)}
          >
            <option value="">Seleccionar área...</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Toggle ubicación en altura */}
        <button
          className={`${styles.toggleRow} ${enAltura ? styles.toggleRowActive : ''}`}
          onClick={() => setEnAltura(v => !v)}
        >
          <div className={`${styles.toggleIcon} ${enAltura ? styles.toggleIconActive : ''}`}>
            <IconAltura />
          </div>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Ubicación en altura</span>
            <span className={styles.toggleDesc}>
              Requiere operario apto autoelevador para preparar. Se prioriza al final del recorrido.
            </span>
          </div>
          <div className={`${styles.toggleSwitch} ${enAltura ? styles.toggleSwitchOn : ''}`}>
            <div className={styles.toggleThumb} />
          </div>
        </button>
      </div>

      <div className={styles.editPanelFooter}>
        <button className={styles.editCancelBtn} onClick={onClose}>Cancelar</button>
        <button className={styles.editSaveBtn}>Actualizar</button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Ubicaciones() {
  const [selectedId, setSelectedId] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid')
  const [editingNode, setEditingNode] = useState(null)

  const toggleExpand = (nodeId) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  const handleSelect = (node) => {
    setSelectedId(node.id)
    if (node.children?.length) {
      setExpandedIds(prev => new Set([...prev, node.id]))
    }
  }

  const handleEdit = (node) => setEditingNode(node)
  const handleDelete = (node) => {
    if (confirm(`¿Eliminar "${node.nombre}"?`)) {
      // sin funcionalidad real por ahora
    }
  }

  const selectedNode = selectedId ? findNode(DATA, selectedId) : null
  const cards = selectedNode ? (selectedNode.children ?? []) : DATA
  const breadcrumb = selectedId ? getAncestors(DATA, selectedId) ?? [] : []
  const parentName = selectedNode?.nombre ?? null

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <span className={styles.title}>Ubicaciones</span>
      </div>

      <div className={styles.body}>
        {/* ── Árbol lateral ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Depósitos</div>
          <div className={styles.treeRoot}>
            {DATA.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={handleSelect}
                onToggle={toggleExpand}
                level={0}
              />
            ))}
          </div>
        </aside>

        {/* ── Cards ── */}
        <div className={styles.cardsArea}>
          <div className={styles.toolbar}>
            <div className={styles.breadcrumb}>
              <button className={styles.bcBtn} onClick={() => setSelectedId(null)}>
                Inicio
              </button>
              {breadcrumb.map((node, i) => (
                <span key={node.id} className={styles.bcItem}>
                  <span className={styles.bcSep}>/</span>
                  {i < breadcrumb.length - 1 ? (
                    <button className={styles.bcBtn} onClick={() => handleSelect(node)}>
                      {node.nombre}
                    </button>
                  ) : (
                    <span className={styles.bcCurrent}>{node.nombre}</span>
                  )}
                </span>
              ))}
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista de tarjetas"
                >
                  <IconGrid />
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <IconList />
                </button>
              </div>
              <button className={styles.newBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva ubicación
              </button>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {cards.length === 0 ? (
              <div className={styles.emptyState}>Sin subdivisiones</div>
            ) : (
              cards.map(node => (
                <UbicacionCard
                  key={node.id}
                  node={node}
                  onOpen={handleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Panel de edición ── */}
        {editingNode && (
          <EditUbicacionPanel
            node={editingNode}
            parentName={parentName}
            onClose={() => setEditingNode(null)}
          />
        )}
      </div>
    </div>
  )
}
