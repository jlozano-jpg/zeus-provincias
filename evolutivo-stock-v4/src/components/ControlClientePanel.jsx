import { useState } from 'react'
import styles from './ControlClientePanel.module.css'

const ESTADO_COLORS = {
  'Control Pendiente': '#E65100',
  'Control en Proceso': '#3370AC',
  'Control Finalizado': '#00A3A3',
}

export default function ControlClientePanel({ preparacion, onSelect, onClose }) {
  const [selectedIdx, setSelectedIdx] = useState(null)
  const clientes = preparacion.clientes ?? []

  const handleEfectuar = () => {
    if (selectedIdx == null) return
    onSelect(preparacion, clientes[selectedIdx])
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Control de Preparación</h2>
            <span className={styles.comprobante}>Comprobante {preparacion.comprobante}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>FECHA</span>
            <span className={styles.infoValue}>{preparacion.fecha}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>SUCURSAL</span>
            <span className={styles.infoValue}>{preparacion.sucursal}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>DEPÓSITO</span>
            <span className={styles.infoValue}>{preparacion.deposito}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>PREPARADOR</span>
            <span className={styles.infoValue}>{preparacion.preparador}</span>
          </div>
        </div>

        <div className={styles.clientesHeader}>
          <span className={styles.clientesTitle}>CLIENTES DE LA PREPARACIÓN</span>
          <span className={styles.clientesBadge}>{clientes.length}</span>
        </div>

        <div className={styles.clientesList}>
          {clientes.map((c, i) => {
            const isSelected = selectedIdx === i
            const estadoColor = ESTADO_COLORS[c.estado] ?? '#667F99'
            return (
              <label
                key={i}
                className={`${styles.clienteRow} ${isSelected ? styles.clienteRowSelected : ''}`}
                onClick={() => setSelectedIdx(i)}
              >
                <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`}>
                  {isSelected && <div className={styles.radioDot} />}
                </div>
                <div className={styles.clienteInfo}>
                  <span className={styles.clienteCodigo}>Cód. {c.codigo}</span>
                  <span className={styles.clienteNombre}>{c.razonSocial}</span>
                  <div className={styles.clienteMeta}>
                    <span className={styles.clienteEstado} style={{ color: estadoColor }}>● {c.estado}</span>
                    <span className={styles.clienteControlador}>Controlador: {c.controlador || 'Sin asignar'}</span>
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.efectuarBtn}
            type="button"
            disabled={selectedIdx == null}
            onClick={handleEfectuar}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Efectuar control
          </button>
        </div>
      </div>
    </>
  )
}
