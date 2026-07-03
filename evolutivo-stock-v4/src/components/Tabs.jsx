import styles from './Tabs.module.css'

export default function Tabs({ tabs, activeTab, onSelectTab, onCloseTab }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.gradientBar} aria-hidden="true" />
      <div className={styles.tabsRow} role="tablist" aria-label="Pestañas abiertas">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.closable && (
              <span
                className={styles.closeBtn}
                role="button"
                tabIndex={0}
                aria-label={`Cerrar pestaña ${tab.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onCloseTab(tab.id)
                  }
                }}
              >
                ✕
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
