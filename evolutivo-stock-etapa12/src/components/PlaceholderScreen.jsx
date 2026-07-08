import { IconTool } from '@tabler/icons-react'
import styles from './PlaceholderScreen.module.css'

export default function PlaceholderScreen({ title }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <IconTool size={28} className={styles.icon} />
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>Esta sección todavía no está disponible.</p>
      </div>
    </div>
  )
}
