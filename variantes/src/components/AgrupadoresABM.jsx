import { useEffect, useRef, useState } from 'react'
import { IconSettings, IconPlus, IconAlertTriangle } from '@tabler/icons-react'
import AgrupadoresGrid from './agrupadores/AgrupadoresGrid'
import AgrupadorPanel from './agrupadores/AgrupadorPanel'
import './agrupadores/agrupadores.css'

const INITIAL_ROWS = [
  {
    id: 'TAL-001',
    name: 'Talles Indumentaria Adulto',
    desc: 'Curva de talles estándar para remeras, buzos y camisas de adulto',
    values: [
      { code: 'XS', name: 'XS' }, { code: 'S', name: 'S' },
      { code: 'M', name: 'M' }, { code: 'L', name: 'L' },
      { code: 'XL', name: 'XL' }, { code: '2XL', name: '2XL' },
    ],
  },
  {
    id: 'TAL-002',
    name: 'Talles Calzado Argentina',
    desc: 'Numeración argentina de calzado',
    values: [
      { code: '35', name: '35' }, { code: '36', name: '36' },
      { code: '37', name: '37' }, { code: '38', name: '38' },
      { code: '39', name: '39' }, { code: '40', name: '40' },
      { code: '41', name: '41' }, { code: '42', name: '42' },
      { code: '43', name: '43' }, { code: '44', name: '44' },
    ],
  },
  {
    id: 'COL-001',
    name: 'Paleta Clásicos',
    desc: 'Colores básicos disponibles todo el año',
    values: [
      { code: 'NEG', name: 'Negro', swatch: '#0f1020' },
      { code: 'BLA', name: 'Blanco', swatch: '#ffffff' },
      { code: 'GRI', name: 'Gris', swatch: '#9295ad' },
      { code: 'AZU', name: 'Azul', swatch: '#2970ff' },
      { code: 'ROJ', name: 'Rojo', swatch: '#f04438' },
    ],
  },
  {
    id: 'COL-002',
    name: 'Paleta Primavera 2026',
    desc: 'Colores de temporada para colección Primavera/Verano',
    values: [
      { code: 'COR', name: 'Coral', swatch: '#ff7a59' },
      { code: 'MEN', name: 'Menta', swatch: '#7ddec0' },
      { code: 'LAV', name: 'Lavanda', swatch: '#bba6ff' },
      { code: 'AMA', name: 'Amarillo', swatch: '#fbbf24' },
    ],
  },
  {
    id: 'VOL-001',
    name: 'Voltajes',
    desc: 'Voltajes admitidos por equipos eléctricos',
    values: [{ code: '110', name: '110V' }, { code: '220', name: '220V' }, { code: '240', name: '240V' }],
  },
  {
    id: 'SAB-001',
    name: 'Sabores Bebidas',
    desc: 'Sabores disponibles para bebidas gasificadas',
    values: [
      { code: 'ORI', name: 'Original' }, { code: 'LIG', name: 'Light' },
      { code: 'ZER', name: 'Zero' }, { code: 'LIM', name: 'Limón' },
    ],
  },
  {
    id: 'PRE-001',
    name: 'Presentaciones',
    desc: 'Tamaños de envase',
    values: [
      { code: '355', name: '355 ml' }, { code: '500', name: '500 ml' },
      { code: '1L', name: '1 L' }, { code: '1.5L', name: '1.5 L' }, { code: '2L', name: '2 L' },
    ],
  },
  {
    id: 'MAT-001',
    name: 'Materiales',
    desc: 'Composiciones textiles',
    values: [{ code: 'ALG', name: 'Algodón' }, { code: 'POL', name: 'Poliéster' }],
  },
]

export default function AgrupadoresABM() {
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [panelMode, setPanelMode] = useState(null)
  const [panelInitial, setPanelInitial] = useState(null)
  const [deletingRow, setDeletingRow] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function openCreate() {
    setSelectedId(null)
    setPanelInitial(null)
    setPanelMode('create')
  }

  function openEdit(row) {
    setSelectedId(row.id)
    setPanelInitial({
      code: row.id,
      name: row.name,
      desc: row.desc,
      values: row.values,
      isColorGroup: row.values.some((v) => v.swatch),
    })
    setPanelMode('edit')
  }

  function openDuplicate(row) {
    setSelectedId(null)
    setPanelInitial({
      code: '',
      name: `${row.name} (copia)`,
      desc: row.desc,
      values: row.values,
      isColorGroup: row.values.some((v) => v.swatch),
    })
    setPanelMode('create')
  }

  function closePanel() {
    setPanelMode(null)
    setPanelInitial(null)
    setSelectedId(null)
  }

  function handleSubmit(data) {
    if (panelMode === 'edit' && selectedId) {
      setRows((rs) => rs.map((r) => (r.id === selectedId ? { id: data.code, name: data.name, desc: data.desc || '', values: data.values } : r)))
    } else {
      setRows((rs) => [{ id: data.code, name: data.name, desc: data.desc || '', values: data.values }, ...rs])
    }
    closePanel()
  }

  function confirmDelete() {
    setRows((rs) => rs.filter((r) => r.id !== deletingRow.id))
    if (selectedId === deletingRow.id) closePanel()
    setDeletingRow(null)
  }

  return (
    <div className="va-app">
      <div className="va-topbar">
        <span className="va-topbar-crumb">Configuración / Productos / Agrupadores</span>
        <button type="button" className="va-topbar-btn" aria-label="Configuración" title="Configuración">
          <IconSettings size={16} stroke={1.75} />
        </button>
      </div>

      <div className={`va-work ${panelMode ? '' : 'is-collapsed'}`}>
        <AgrupadoresGrid
          rows={rows}
          query={query}
          setQuery={setQuery}
          searchInputRef={searchInputRef}
          selectedId={selectedId}
          onNewClick={openCreate}
          onRowClick={openEdit}
          onEdit={openEdit}
          onDuplicate={openDuplicate}
          onDelete={setDeletingRow}
        />
        {panelMode ? (
          <AgrupadorPanel
            key={panelMode === 'edit' ? selectedId : 'create'}
            mode={panelMode}
            initial={panelInitial}
            onClose={closePanel}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>

      {!panelMode ? (
        <button type="button" className="va-btn va-btn-primary va-fab" onClick={openCreate}>
          <IconPlus size={16} stroke={1.6} /> Nuevo agrupador
        </button>
      ) : null}

      {deletingRow ? (
        <div className="va-confirm-overlay" onClick={() => setDeletingRow(null)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="va-confirm-icon va-danger"><IconAlertTriangle size={22} stroke={1.6} /></div>
            <div className="va-confirm-title">¿Eliminar "{deletingRow.name}"?</div>
            <div className="va-confirm-body">Esta acción no se puede deshacer. Los productos que usen este agrupador podrían verse afectados.</div>
            <div className="va-confirm-actions">
              <button type="button" className="va-btn va-btn-secondary" onClick={() => setDeletingRow(null)}>Cancelar</button>
              <button type="button" className="va-btn va-btn-danger" onClick={confirmDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
