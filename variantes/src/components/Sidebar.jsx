import { useState } from 'react'
import {
  IconHome, IconChartLine, IconShoppingCart, IconUsers, IconBuildingBank,
  IconTags, IconBuildingWarehouse, IconStack2, IconShoppingBag, IconTruck,
  IconCalculator, IconReceiptTax, IconDownload, IconPuzzle, IconSettings,
  IconApps, IconUserCircle, IconSearch, IconChevronDown, IconChevronUp,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react'
import logo from '../assets/zeus-erp-logo.png'
import styles from './Sidebar.module.css'

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: IconHome },
  { id: 'tableros', label: 'Tableros', icon: IconChartLine },
  { id: 'ventas', label: 'Ventas', icon: IconShoppingCart, children: [] },
  { id: 'crm', label: 'CRM', icon: IconUsers, children: [] },
  { id: 'tesoreria', label: 'Tesorería', icon: IconBuildingBank, children: [] },
  {
    id: 'productos',
    label: 'Productos',
    icon: IconTags,
    children: [
      { id: 'gestion-productos', label: 'Gestión de Productos', badge: 'Nuevo' },
      { id: 'gestion-variantes', label: 'Gestión de Variantes', badge: 'Nuevo' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: IconStack2,
    children: [
      {
        id: 'fichas-stock',
        label: 'Fichas de Stock',
        children: [
          { id: 'ficha-stock-general', label: 'General' },
        ],
      },
    ],
  },
  { id: 'wms', label: 'WMS', icon: IconBuildingWarehouse, children: [] },
  { id: 'compras', label: 'Compras', icon: IconShoppingBag, children: [] },
  { id: 'proveedores', label: 'Proveedores', icon: IconTruck, children: [] },
  { id: 'contabilidad', label: 'Contabilidad', icon: IconCalculator, children: [] },
  { id: 'impuestos', label: 'Impuestos', icon: IconReceiptTax, children: [] },
  { id: 'importador', label: 'Importador', icon: IconDownload, children: [] },
  { id: 'complementos', label: 'Complementos', icon: IconPuzzle },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: IconSettings,
    badge: 'Nuevo',
    children: [
      { id: 'general', label: 'General', badge: 'Nuevo', children: [] },
      {
        id: 'config-productos',
        label: 'Productos',
        children: [
          { id: 'agrupadores', label: 'Agrupadores' },
          { id: 'depositos', label: 'Depósitos', disabled: true },
        ],
      },
    ],
  },
]

function NavRow({ item, depth, activeId, expanded, onToggle, onSelect }) {
  const Icon = item.icon
  const hasChildren = Array.isArray(item.children)
  const isExpanded = expanded.has(item.id)
  const isActive = activeId === item.id

  const handleClick = () => {
    if (item.disabled) return
    if (hasChildren) onToggle(item.id)
    else onSelect(item.id)
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.navRow} ${isActive ? styles.navRowActive : ''} ${item.disabled ? styles.navRowDisabled : ''}`}
        style={{ paddingLeft: 16 + depth * 20 }}
        onClick={handleClick}
        disabled={item.disabled}
      >
        {Icon ? <Icon size={18} className={styles.navIcon} stroke={1.75} /> : <span className={styles.navIconSpacer} />}
        <span className={styles.navLabel}>{item.label}</span>
        {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
        {hasChildren && item.children.length > 0 && (
          isExpanded
            ? <IconChevronUp size={15} className={styles.navChevron} />
            : <IconChevronDown size={15} className={styles.navChevron} />
        )}
        {hasChildren && item.children.length === 0 && !item.badge && (
          <IconChevronDown size={15} className={styles.navChevron} />
        )}
      </button>
      {hasChildren && isExpanded && item.children.map((child) => (
        <NavRow
          key={child.id}
          item={child}
          depth={depth + 1}
          activeId={activeId}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

export default function Sidebar({ activeId = 'inicio', onSelect = () => {} }) {
  const [expanded, setExpanded] = useState(() => new Set(['configuracion', 'config-productos']))
  const [searchTerm, setSearchTerm] = useState('')

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <img src={logo} alt="Zeus ERP" className={styles.logo} />
        <button type="button" className={styles.collapseBtn} aria-label="Contraer menú" title="Contraer menú">
          <IconLayoutSidebarLeftCollapse size={18} stroke={1.75} />
        </button>
      </div>

      <label className={styles.searchField}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className={styles.searchInput}
          aria-label="Buscar"
        />
        <button type="button" className={styles.searchBtn} aria-label="Buscar">
          <IconSearch size={15} stroke={1.75} />
        </button>
      </label>

      <nav className={styles.nav}>
        {NAV.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            depth={0}
            activeId={activeId}
            expanded={expanded}
            onToggle={toggle}
            onSelect={onSelect}
          />
        ))}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.appsRow}>
          <IconApps size={18} stroke={1.75} />
          <span>Mis aplicaciones</span>
        </button>
        <div className={styles.userRow}>
          <span className={styles.userAvatar}>
            <IconUserCircle size={20} stroke={1.6} />
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>test DesarrolloReview...</span>
            <span className={styles.userMeta}>1 EMPRESA 1</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
