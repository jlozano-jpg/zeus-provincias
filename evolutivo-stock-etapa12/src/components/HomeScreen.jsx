import logo from '../assets/zeus-logo.svg'
import styles from './HomeScreen.module.css'

export default function HomeScreen() {
  return (
    <div className={styles.wrapper}>
      <img src={logo} alt="Zeus" className={styles.logo} />
      <p className={styles.stage}>Etapa 12 - Evolutivo de stock</p>
    </div>
  )
}
