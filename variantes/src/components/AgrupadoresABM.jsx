import { useEffect, useRef, useState } from 'react'
import { IconAlertTriangle, IconLock, IconX } from '@tabler/icons-react'
import AgrupadoresGrid from './agrupadores/AgrupadoresGrid'
import AgrupadorPanel from './agrupadores/AgrupadorPanel'
import AgrupadorViewPanel from './agrupadores/AgrupadorViewPanel'
import ImportWizard from './agrupadores/ImportWizard'
import './agrupadores/agrupadores.css'

export default function AgrupadoresABM({ onNavigateHome, agrupadores, setAgrupadores }) {
  const rows = agrupadores
  const setRows = setAgrupadores
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
