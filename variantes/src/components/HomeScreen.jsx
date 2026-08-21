import { useState } from 'react'
import {
  IconSettings, IconArrowUp, IconBuildingBank, IconTag, IconPlus,
  IconPackage, IconChartBar, IconFileInvoice,
} from '@tabler/icons-react'
import styles from './HomeScreen.module.css'

const SUGERENCIAS = [
  { icon: IconBuildingBank, label: 'Como registrar el pago a un proveedor' },
  { icon: IconTag, label: 'Como modificar precios de productos' },
  { icon: IconPlus, label: 'Crear factura' },
  { icon: IconPackage, label: 'Como visualizar el stock disponible' },
  { icon: IconChartBar, label: 'Como acceder a reportes del sistema' },
  { icon: IconFileInvoice, label: 'Como resolver un problema de facturacion' },
]

export default function HomeScreen() {
  const [pregunta, setPregunta] = useState('')

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <span className={styles.breadcrumb}>Inicio</span>
        <button type="button" className={styles.topBarBtn} aria-label="Configuración" title="Configuración">
          <IconSettings size={16} stroke={1.75} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.glow} aria-hidden="true" />

        <h1 className={styles.title}>¿En qué puedo ayudarte hoy?</h1>

        <form className={styles.askForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Pregunta lo que quieras"
            className={styles.askInput}
            aria-label="Pregunta lo que quieras"
          />
          <button type="submit" className={styles.askSubmit} aria-label="Enviar">
            <IconArrowUp size={17} stroke={2} />
          </button>
        </form>

        <div className={styles.suggestions}>
          {SUGERENCIAS.map(({ icon: Icon, label }) => (
            <button key={label} type="button" className={styles.suggestionChip}>
              <Icon size={15} stroke={1.75} className={styles.suggestionIcon} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
