import styles from './PreparacionVistaPanel.module.css'

const PRIORIDAD_STYLE = {
  Alta:  { background: '#FFE5E5', color: '#C82828' },
  Media: { background: '#FFF8E5', color: '#B87400' },
  Baja:  { background: '#E5FAE5', color: '#1A7A1A' },
}

const ESTADO_COLOR = {
  'Sin Asignar':        '#667F99',
  'Pendiente':          '#8833B8',
  'En Proceso':         '#00A3A3',
  'Control Pendiente':  '#B87400',
  'Control en Proceso': '#3370AC',
  'Control Finalizado': '#00A3A3',
  'Finalizado':         '#335477',
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{children || '-'}</span>
    </div>
  )
}

export default function PreparacionVistaPanel({ preparacion, onClose }) {
  const prioridadStyle = PRIORIDAD_STYLE[preparacion.prioridad] ?? {}
  const estadoColor = ESTADO_COLOR[preparacion.estado] ?? '#002955'

  const comprobantes = preparacion.comprobantesIncluidos
    ?? (preparacion.comprobante ? [preparacion.comprobante] : [])

  const articulos = preparacion.clientes
    ? preparacion.clientes.flatMap(c => c.items ?? [])
    : []

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Detalle de preparación">
        <div className={styles.header}>
          <h2 className={styles.title}>Detalle de preparación</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar" title="Cerrar">✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.fieldsGrid}>
            <Field label="Número de preparación">{preparacion.numeroPreparacion ?? preparacion.comprobante}</Field>
            <Field label="Fecha">{preparacion.fecha}</Field>
            <Field label="Origen">{preparacion.origen}</Field>
            <Field label="Sucursal">{preparacion.sucursal}</Field>
            <Field label="Depósito">{preparacion.deposito}</Field>
            <Field label="Código">{preparacion.codigo}</Field>
            <Field label="Razón Social">{preparacion.razonSocial}</Field>
            <Field label="Preparador">{preparacion.preparador}</Field>
            <Field label="Controlador">{preparacion.controlador || '-'}</Field>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Prioridad</span>
              {preparacion.prioridad ? (
                <span className={styles.prioridadPill} style={prioridadStyle}>
                  {preparacion.prioridad}
                </span>
              ) : (
                <span className={styles.fieldValue}>-</span>
              )}
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Estado</span>
              <span className={styles.fieldValue} style={{ color: estadoColor, fontWeight: 600 }}>
                {preparacion.estado || '-'}
              </span>
            </div>

            <Field label="Avance">
              {preparacion.avance !== undefined && preparacion.avance !== null
                ? `${preparacion.avance}%`
                : '-'}
            </Field>

            <Field label="Transporte">{preparacion.transporte}</Field>
            <Field label="Zona">{preparacion.zona}</Field>
            <Field label="Localidad">{preparacion.localidad}</Field>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Detalle de artículos incluidos</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {articulos.length === 0 ? (
                    <tr><td colSpan={3} className={styles.empty}>Sin artículos</td></tr>
                  ) : (
                    articulos.map((item, i) => (
                      <tr key={i}>
                        <td>{item.codigo}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Detalle de comprobantes incluidos</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobantes.length === 0 ? (
                    <tr><td colSpan={2} className={styles.empty}>Sin comprobantes</td></tr>
                  ) : (
                    comprobantes.map((c, i) => (
                      <tr key={i}>
                        <td className={styles.compNro}>{i + 1}</td>
                        <td>{c}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeFooterBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </>
  )
}
