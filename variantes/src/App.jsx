import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomeScreen from './components/HomeScreen'
import AgrupadoresABM from './components/AgrupadoresABM'
import ProductosABM from './components/ProductosABM'
import FichaStockGeneral from './components/stock/FichaStockGeneral'
import GestionVariantes from './components/variantes/GestionVariantes'
import DistribuirStockWindow from './components/variantes/DistribuirStockWindow'
import { usePersistentState } from './hooks/usePersistentState'
import { AGRUPADORES_SEED } from './data/agrupadoresMaestro'
import { PRODUCTOS_SEED } from './data/productosSeed'
import styles from './App.module.css'

const VISTAS = {
  agrupadores: AgrupadoresABM,
  'gestion-productos': ProductosABM,
  'ficha-stock-general': FichaStockGeneral,
  'gestion-variantes': GestionVariantes,
}

export default function App() {
  const [activeId, setActiveId] = useState('inicio')
  const [agrupadores, setAgrupadores] = usePersistentState('zeus-variantes:agrupadores', AGRUPADORES_SEED)
  const [productos, setProductos] = usePersistentState('zeus-variantes:productos', PRODUCTOS_SEED)

  const params = new URLSearchParams(window.location.search)
  if (params.get('view') === 'distribuir-stock') {
    return <DistribuirStockWindow />
  }

  const Vista = VISTAS[activeId] ?? HomeScreen

  return (
    <div className={styles.app}>
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <Vista
        onNavigateHome={() => setActiveId('inicio')}
        agrupadores={agrupadores}
        setAgrupadores={setAgrupadores}
        productos={productos}
        setProductos={setProductos}
      />
    </div>
  )
}
