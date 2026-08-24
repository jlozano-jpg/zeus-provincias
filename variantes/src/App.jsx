import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomeScreen from './components/HomeScreen'
import AgrupadoresABM from './components/AgrupadoresABM'
import styles from './App.module.css'

const VISTAS = {
  agrupadores: AgrupadoresABM,
}

export default function App() {
  const [activeId, setActiveId] = useState('inicio')
  const Vista = VISTAS[activeId] ?? HomeScreen

  return (
    <div className={styles.app}>
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <Vista onNavigateHome={() => setActiveId('inicio')} />
    </div>
  )
}
