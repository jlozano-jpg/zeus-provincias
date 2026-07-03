import styles from './HomeScreen.module.css'
import zeusLogo from '../assets/logo-zeus-2.svg'

export default function HomeScreen() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <img src={zeusLogo} alt="Zeus" className={styles.logo} />
        <p className={styles.stage}>Etapa 11 - Evolutivo de Stock</p>
      </div>
    </div>
  )
}
