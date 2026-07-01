import { useState } from 'react'
import styles from './Sidebar.module.css'

const MENU_ITEMS = [
  {
    id: 'operarios-stock',
    label: 'Operadores de Stock'
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    children: [
      {
        id: 'tablas-productos',
        label: 'Tablas de Productos',
        children: [
          { id: 'ubicaciones', label: 'Ubicaciones' }
        ]
      },
      {
        id: 'tablas-generales',
        label: 'Tablas Generales',
        children: [
          { id: 'prioridades', label: 'Prioridades' }
        ]
      }
    ]
  },
  {
    id: 'stock',
    label: 'Stock',
    children: [
      {
        id: 'preparaciones',
        label: 'Preparaciones',
        children: [
          { id: 'preparacion', label: 'Preparación' },
          { id: 'control-preparaciones', label: 'Control de Preparaciones' },
          { id: 'despacho', label: 'Despacho' }
        ]
      }
    ]
  }
]

export default function Sidebar({ activeView, onSelectView }) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set())

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderMenuItems = (items, level = 0) => (
    items.map(item => {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0
      const isExpanded = expandedIds.has(item.id)

      return (
        <div key={item.id}>
          <button
            className={`${styles.menuItem} ${!hasChildren && activeView === item.id ? styles.menuItemActive : ''}`}
            style={{ paddingLeft: `${20 + level * 16}px` }}
            onClick={() => hasChildren ? toggleExpanded(item.id) : onSelectView(item.id)}
            title={item.label}
            aria-current={!hasChildren && activeView === item.id ? 'page' : undefined}
            aria-expanded={hasChildren ? isExpanded : undefined}
          >
            {hasChildren && (
              <svg
                className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            <span className={styles.menuLabel}>{item.label}</span>
          </button>
          {hasChildren && isExpanded && renderMenuItems(item.children, level + 1)}
        </div>
      )
    })
  )

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button
          className={styles.menuToggle}
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        {!collapsed && (
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <rect x="2" y="2" width="20" height="9" rx="2" fill="#8833B8" />
                <rect x="2" y="13" width="20" height="9" rx="2" fill="#6A00A7" />
              </svg>
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>ZEUS</span>
              <span className={styles.brandTag}>ERP &amp; POS</span>
            </span>
          </div>
        )}
      </div>

      <nav className={styles.menu} aria-label="Menú principal">
        {renderMenuItems(MENU_ITEMS)}
      </nav>
    </aside>
  )
}
