import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomeScreen from './components/HomeScreen'
import AgrupadoresABM from './components/AgrupadoresABM'
import ProductosABM from './components/ProductosABM'
import { AGRUPADORES_SEED } from './data/agrupadoresMaestro'
import styles from './App.module.css'

const VISTAS = {
  agrupadores: AgrupadoresABM,
  'gestion-productos': ProductosABM,
}

export default function App() {
  const [activeId, setActiveId] = useState('inicio')
  const [agrupadores, setAgrupadores] = useState(AGRUPADORES_SEED)
  const Vista = VISTAS[activeId] ?? HomeScreen

  return (
    <div className={styles.app}>
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <Vista
        onNavigateHome={() => setActiveId('inicio')}
        agrupadores={agrupadores}
        setAgrupadores={setAgrupadores}
      />
    </div>
  )
}
