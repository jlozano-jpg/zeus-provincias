import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomeScreen from './components/HomeScreen'
import PlaceholderScreen from './components/PlaceholderScreen'
import CodigosBarraList from './components/CodigosBarraList'
import styles from './App.module.css'

export default function App() {
  const [activeView, setActiveView] = useState(null)

  return (
    <div className={styles.app}>
      <Sidebar activeView={activeView} onSelectView={setActiveView} onSelectHome={() => setActiveView(null)} />
      <div className={styles.container}>
        {activeView === null && <HomeScreen />}
        {activeView === 'configuracion' && <PlaceholderScreen title="Configuración" />}
        {activeView === 'tablas-productos' && <PlaceholderScreen title="Tablas de productos" />}
        {activeView === 'codigos-barra' && <CodigosBarraList />}
      </div>
    </div>
  )
}
