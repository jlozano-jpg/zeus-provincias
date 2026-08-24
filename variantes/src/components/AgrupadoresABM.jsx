import { useEffect, useRef, useState } from 'react'
import { IconAlertTriangle, IconLock, IconX } from '@tabler/icons-react'
import AgrupadoresGrid from './agrupadores/AgrupadoresGrid'
import AgrupadorPanel from './agrupadores/AgrupadorPanel'
import AgrupadorViewPanel from './agrupadores/AgrupadorViewPanel'
import ImportWizard from './agrupadores/ImportWizard'
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
    productsCount: 6,
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

export default function AgrupadoresABM({ onNavigateHome }) {
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [panelMode, setPanelMode] = useState(null)
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

  const activeRow = selectedId ? rows.find((r) => r.id === selectedId) ?? null : null
  const panelInitial = activeRow ? {
    code: activeRow.id,
    name: activeRow.name,
    desc: activeRow.desc,
    values: activeRow.values,
    isColorGroup: activeRow.values.some((v) => v.swatch),
  } : null

  function openCreate() {
    setSelectedId(null)
    setPanelMode('create')
  }

  function openView(row) {
    setSelectedId(row.id)
    setPanelMode('view')
  }

  function openEdit(row) {
    setSelectedId(row.id)
    setPanelMode('edit')
  }

  function openImport() {
    setSelectedId(null)
    setPanelMode('import')
  }

  function closePanel() {
    setPanelMode(null)
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
    if (deletingRow.productsCount > 0) return
    setRows((rs) => rs.filter((r) => r.id !== deletingRow.id))
    if (selectedId === deletingRow.id) closePanel()
    setDeletingRow(null)
  }

  return (
    <div className="va-app">
      <div className="va-tabbar">
        <button type="button" className="va-tab" onClick={onNavigateHome}>
          <span className="va-dot" /> Inicio
        </button>
        <button type="button" className="va-tab is-active" onClick={onNavigateHome}>
          <span className="va-dot" /> Agrupadores de Variantes
          <span className="va-tab-close" onClick={(e) => { e.stopPropagation(); onNavigateHome?.() }}>
            <IconX size={11} stroke={2} />
          </span>
        </button>
      </div>

      <div className="va-work">
        <AgrupadoresGrid
          rows={rows}
          query={query}
          setQuery={setQuery}
          searchInputRef={searchInputRef}
          selectedId={selectedId}
          onNewClick={openCreate}
          onImportClick={openImport}
          onRowClick={openView}
          onEdit={openEdit}
          onDelete={setDeletingRow}
        />
        {panelMode === 'view' && activeRow ? (
          <AgrupadorViewPanel row={activeRow} onClose={closePanel} onEdit={() => setPanelMode('edit')} />
        ) : null}
        {(panelMode === 'create' || panelMode === 'edit') ? (
          <AgrupadorPanel
            key={panelMode === 'edit' ? selectedId : 'create'}
            mode={panelMode}
            initial={panelInitial}
            onClose={closePanel}
            onSubmit={handleSubmit}
          />
        ) : null}
        {panelMode === 'import' ? (
          <ImportWizard
            existingRows={rows}
            onClose={closePanel}
            onImportComplete={(newRows) => setRows((rs) => [...newRows, ...rs])}
          />
        ) : null}
      </div>

      {deletingRow ? (
        <div className="va-confirm-overlay" onClick={() => setDeletingRow(null)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            {deletingRow.productsCount > 0 ? (
              <>
                <div className="va-confirm-icon va-danger"><IconLock size={22} stroke={1.6} /></div>
                <div className="va-confirm-title">No se puede eliminar "{deletingRow.name}"</div>
                <div className="va-confirm-body">
                  Está asignado a {deletingRow.productsCount} artículo{deletingRow.productsCount === 1 ? '' : 's'}.
                  Quitalo de {deletingRow.productsCount === 1 ? 'ese artículo' : 'esos artículos'} antes de eliminarlo.
                </div>
                <div className="va-confirm-actions">
                  <button type="button" className="va-btn va-btn-primary" onClick={() => setDeletingRow(null)}>Entendido</button>
                </div>
              </>
            ) : (
              <>
                <div className="va-confirm-icon va-danger"><IconAlertTriangle size={22} stroke={1.6} /></div>
                <div className="va-confirm-title">¿Eliminar "{deletingRow.name}"?</div>
                <div className="va-confirm-body">Esta acción no se puede deshacer.</div>
                <div className="va-confirm-actions">
                  <button type="button" className="va-btn va-btn-secondary" onClick={() => setDeletingRow(null)}>Cancelar</button>
                  <button type="button" className="va-btn va-btn-danger" onClick={confirmDelete}>Sí, eliminar</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
