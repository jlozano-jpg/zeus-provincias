import { useState } from 'react'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'
import ProductosGrid from './productos/ProductosGrid'
import ProductoPanel from './productos/ProductoPanel'
import { PRODUCTOS_SEED } from '../data/productosSeed'
import './agrupadores/agrupadores.css'
import './productos/productos.css'

export default function ProductosABM({ onNavigateHome, agrupadores }) {
  const [productos, setProductos] = useState(PRODUCTOS_SEED)
  const [query, setQuery] = useState('')
  const [selectedCodigo, setSelectedCodigo] = useState(null)
  const [panelMode, setPanelMode] = useState(null)
  const [deletingProducto, setDeletingProducto] = useState(null)

  const activeProducto = selectedCodigo ? productos.find((p) => p.codigo === selectedCodigo) ?? null : null

  function openCreate() {
    setSelectedCodigo(null)
    setPanelMode('create')
  }

  function openEdit(producto) {
    setSelectedCodigo(producto.codigo)
    setPanelMode('edit')
  }

  function closePanel() {
    setPanelMode(null)
    setSelectedCodigo(null)
  }

  function handleSubmit(data) {
    if (panelMode === 'edit' && selectedCodigo) {
      setProductos((ps) => ps.map((p) => (p.codigo === selectedCodigo ? data : p)))
    } else {
      setProductos((ps) => [data, ...ps])
    }
    closePanel()
  }

  function confirmDelete() {
    setProductos((ps) => ps.filter((p) => p.codigo !== deletingProducto.codigo))
    if (selectedCodigo === deletingProducto.codigo) closePanel()
    setDeletingProducto(null)
  }

  return (
    <div className="va-app">
      <div className="va-tabbar">
        <button type="button" className="va-tab" onClick={onNavigateHome}>
          <span className="va-dot" /> Inicio
        </button>
        <button type="button" className="va-tab is-active" onClick={onNavigateHome}>
          <span className="va-dot" /> Gestión de Productos
          <span className="va-tab-close" onClick={(e) => { e.stopPropagation(); onNavigateHome?.() }}>
            <IconX size={11} stroke={2} />
          </span>
        </button>
      </div>

      <div className="va-work">
        <ProductosGrid
          productos={productos}
          query={query}
          setQuery={setQuery}
          onNewClick={openCreate}
          onRowClick={openEdit}
          onEdit={openEdit}
          onDelete={setDeletingProducto}
        />
        {(panelMode === 'create' || panelMode === 'edit') ? (
          <ProductoPanel
            key={panelMode === 'edit' ? selectedCodigo : 'create'}
            mode={panelMode}
            initial={activeProducto}
            agrupadores={agrupadores}
            onClose={closePanel}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>

      {deletingProducto ? (
        <div className="va-confirm-overlay" onClick={() => setDeletingProducto(null)}>
          <div className="va-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="va-confirm-icon va-danger"><IconAlertTriangle size={22} stroke={1.6} /></div>
            <div className="va-confirm-title">¿Eliminar "{deletingProducto.codigo}"?</div>
            <div className="va-confirm-body">Esta acción no se puede deshacer.</div>
            <div className="va-confirm-actions">
              <button type="button" className="va-btn va-btn-secondary" onClick={() => setDeletingProducto(null)}>Cancelar</button>
              <button type="button" className="va-btn va-btn-danger" onClick={confirmDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
