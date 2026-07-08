import { tipoInfo } from '../data/codigosBarra'
import styles from './TipoCodigoBadge.module.css'

export default function TipoCodigoBadge({ tipo, count }) {
  const info = tipoInfo(tipo)
  if (!info) return null
  return (
    <span className={styles.badge} style={{ borderColor: info.color, color: info.color }}>
      {info.label}
      {count > 1 && <span className={styles.count}>×{count}</span>}
    </span>
  )
}
