import { useMemo } from 'react'
import {
  IconChevronRight, IconSearch, IconFileImport, IconPlus, IconCategory2,
  IconPencil, IconCopy, IconTrash, IconChevronLeft, IconChevronDown,
} from '@tabler/icons-react'

export default function AgrupadoresGrid({
  rows, query, setQuery, searchInputRef,
  onNewClick, onRowClick, onEdit, onDuplicate, onDelete, selectedId,
}) {
  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((x) =>
      x.id.toLowerCase().includes(q) ||
      x.name.toLowerCase().includes(q) ||
      x.desc.toLowerCase().includes(q)
    )
  }, [rows, query])

  return (
    <div className="va-main">
      <div className="va-crumbs">
        <span>Tablas de Producto</span>
        <IconChevronRight size={12} stroke={1.6} className="va-sep" />
        <span className="va-crumb-current">Agrupadores de Variantes</span>
      </div>

      <div className="va-page-head">
        <div className="va-page-title-wrap">
          <div className="va-page-icon"><IconCategory2 size={20} stroke={1.6} /></div>
          <div>
            <h1 className="va-page-title">Agrupadores de Variantes</h1>
            <p className="va-page-sub">
              Definí los atributos que utilizarás para la generación de variantes de tus productos.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button type="button" className="va-btn va-btn-secondary">
            <IconFileImport size={16} stroke={1.6} /> Importar
          </button>
          <button type="button" className="va-btn va-btn-primary" onClick={onNewClick}>
            <IconPlus size={16} stroke={1.6} /> Nuevo agrupador
          </button>
        </div>
      </div>

      <div className="va-toolbar">
        <div className="va-search">
          <IconSearch size={16} stroke={1.6} className="va-ico" />
          <input
            ref={searchInputRef}
            placeholder="Buscar por nombre, código o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘K</kbd>
        </div>
      </div>

      <div className="va-card">
        <table className="va-grid">
          <thead>
            <tr>
              <th className="va-col-code">Código</th>
              <th>Nombre y descripción</th>
              <th className="va-col-count">Cantidad</th>
              <th>Valores</th>
              <th className="va-col-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Row
                key={r.id}
                row={r}
                selected={r.id === selectedId}
                onClick={() => onRowClick(r)}
                onEdit={() => onEdit(r)}
                onDuplicate={() => onDuplicate(r)}
                onDelete={() => onDelete(r)}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="va-empty-cell">No se encontraron agrupadores</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="va-grid-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>
              Mostrando <b style={{ color: 'var(--va-ink-800)' }}>{filtered.length}</b> de{' '}
              <b style={{ color: 'var(--va-ink-800)' }}>{rows.length}</b> agrupadores
            </span>
            <button type="button" className="va-select-mini">15 por página <IconChevronDown size={12} stroke={1.6} /></button>
          </div>
          <div className="va-pager">
            <button type="button" className="va-pg" disabled><IconChevronLeft size={14} stroke={1.6} /></button>
            <button type="button" className="va-pg is-active">1</button>
            <button type="button" className="va-pg" disabled><IconChevronRight size={14} stroke={1.6} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ row, onClick, onEdit, onDuplicate, onDelete, selected }) {
  return (
    <tr onClick={onClick} className={selected ? 'is-selected' : ''} style={{ cursor: 'pointer' }}>
      <td className="va-col-code"><span className="va-code-pill">{row.id}</span></td>
      <td className="va-name-cell">
        <div className="va-name">{row.name}</div>
        <div className="va-desc">{row.desc}</div>
      </td>
      <td className="va-col-count">
        <span className="va-count-num">{row.values.length}<span className="va-lbl">val.</span></span>
      </td>
      <td>
        <ValuesPreview values={row.values} />
      </td>
      <td className="va-col-actions">
        <div className="va-row-actions" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="va-btn-icon" title="Editar" onClick={onEdit}>
            <IconPencil size={15} stroke={1.6} />
          </button>
          <button type="button" className="va-btn-icon" title="Duplicar" onClick={onDuplicate}>
            <IconCopy size={15} stroke={1.6} />
          </button>
          <button type="button" className="va-btn-icon va-danger" title="Eliminar" onClick={onDelete}>
            <IconTrash size={15} stroke={1.6} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ValuesPreview({ values }) {
  const max = 5
  const shown = values.slice(0, max)
  const rest = values.length - shown.length
  return (
    <div className="va-values">
      {shown.map((v) => (
        <span className="va-v-chip" key={v.code} title={`${v.code} — ${v.name}`}>
          {v.swatch ? <span className="va-swatch" style={{ background: v.swatch }} /> : null}
          {v.name}
        </span>
      ))}
      {rest > 0 ? <span className="va-v-chip va-more">+{rest}</span> : null}
    </div>
  )
}
