import { useState } from 'react'
import { IconMenu2, IconSettings, IconTable, IconBarcode } from '@tabler/icons-react'
import styles from './Sidebar.module.css'

const MENU_ITEMS = [
  { id: 'configuracion', label: 'Configuración', icon: IconSettings },
  { id: 'tablas-productos', label: 'Tablas de productos', icon: IconTable },
  { id: 'codigos-barra', label: 'Gestión de Códigos de Barra', icon: IconBarcode },
]

export default function Sidebar({ activeView, onSelectView, onSelectHome }) {
  const [collapsed, setCollapsed] = useState(false)

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
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
              onClick={() => onSelectView(item.id)}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={styles.menuIcon} />
              <span className={styles.menuLabel}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
