import { useState } from 'react'
import { IconMenu2, IconChevronRight } from '@tabler/icons-react'
import styles from './Sidebar.module.css'

const MENU_ITEMS = [
  {
    id: 'configuracion',
    label: 'Configuración',
    children: [
      {
        id: 'tablas-productos',
        label: 'Tablas de productos',
        children: [
          { id: 'codigos-barra', label: 'Gestión de Códigos de Barra' },
        ],
      },
    ],
  },
]

export default function Sidebar({ activeView, onSelectView, onSelectHome }) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedIds, setExpandedIds] = useState(new Set(['configuracion', 'tablas-productos']))

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderMenuItems = (items, level = 0) =>
    items.map((item) => {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0
      const isExpanded = expandedIds.has(item.id)
      const isActive = !hasChildren && activeView === item.id

      return (
        <div key={item.id}>
          <button
            className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
            style={{ paddingLeft: `${20 + level * 16}px` }}
            onClick={() => (hasChildren ? toggleExpanded(item.id) : onSelectView(item.id))}
            title={item.label}
            aria-current={isActive ? 'page' : undefined}
            aria-expanded={hasChildren ? isExpanded : undefined}
          >
            {hasChildren && (
              <IconChevronRight size={14} className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`} />
            )}
            <span className={styles.menuLabel}>{item.label}</span>
          </button>
          {hasChildren && isExpanded && renderMenuItems(item.children, level + 1)}
        </div>
      )
    })

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button
          className={styles.menuToggle}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <IconMenu2 />
        </button>

        {!collapsed && (
          <button className={styles.brand} onClick={onSelectHome} title="Ir al inicio">
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
          </button>
        )}
      </div>

      <nav className={styles.menu} aria-label="Menú principal">
        {renderMenuItems(MENU_ITEMS)}
      </nav>
    </aside>
  )
}
