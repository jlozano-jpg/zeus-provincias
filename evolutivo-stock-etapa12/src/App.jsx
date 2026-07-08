import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomeScreen from './components/HomeScreen'
import CodigosBarraList from './components/CodigosBarraList'
import styles from './App.module.css'

export default function App() {
  const [activeView, setActiveView] = useState(null)

  return (
    <div className={styles.app}>
      <Sidebar activeView={activeView} onSelectView={setActiveView} onSelectHome={() => setActiveView(null)} />
      <div className={styles.container}>
        {activeView === null && <HomeScreen />}
        {activeView === 'codigos-barra' && <CodigosBarraList />}
      </div>
    </div>
  )
}
