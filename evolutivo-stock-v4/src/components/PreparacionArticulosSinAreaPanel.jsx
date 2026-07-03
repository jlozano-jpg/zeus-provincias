import styles from './PreparacionArticulosSinAreaPanel.module.css'

export default function PreparacionArticulosSinAreaPanel({ articulosSinArea, onBack, onCancel, onContinuar, rightOffset = 0, inactive = false }) {
  const handleDownloadExcel = () => {
    const rows = articulosSinArea.map(a =>
      `      <Row>
        <Cell><Data ss:Type="String">${a.codigoArticulo}</Data></Cell>
        <Cell><Data ss:Type="String">${a.descripcion}</Data></Cell>
        <Cell><Data ss:Type="String">${a.ubicacion}</Data></Cell>
      </Row>`
    ).join('\n')

    const xlsContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Artículos sin área">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Código de artículo</Data></Cell>
        <Cell><Data ss:Type="String">Descripción</Data></Cell>
        <Cell><Data ss:Type="String">Ubicación del artículo</Data></Cell>
      </Row>
${rows}
    </Table>
  </Worksheet>
</Workbook>`

    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'articulos_sin_area.xls'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={`${styles.panel} ${inactive ? styles.panelInactive : ''}`}
      style={{ right: rightOffset }}
      role="dialog"
      aria-modal="true"
      aria-label="Artículos sin configuración de áreas"
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Volver" title="Volver">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className={styles.title}>Artículos sin configuración de áreas</h2>
        </div>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Cerrar panel" title="Cerrar (Esc)">✕</button>
      </div>

      <div className={styles.content}>
        <div className={styles.warningBox}>
          <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className={styles.warningText}>
            Los siguientes artículos se encuentran en una ubicación que no posee un área configurada. Los mismos no serán incluidos en la preparación. Puede configurar un área para las ubicaciones identificadas y volver a iniciar el proceso.
          </p>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <span className={styles.tableSectionTitle}>Detalle de artículos</span>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownloadExcel}
              title="Descargar en formato Excel"
              aria-label="Descargar Excel"
            >
              <svg className={styles.downloadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar Detalle
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código de artículo</th>
                  <th>Descripción</th>
                  <th>Ubicación del artículo</th>
                </tr>
              </thead>
              <tbody>
                {articulosSinArea.map((item, index) => (
                  <tr key={index}>
                    <td>{item.codigoArticulo}</td>
                    <td>{item.descripcion}</td>
                    <td className={styles.ubicacionCell}>{item.ubicacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
        <button className={styles.confirmBtn} onClick={onContinuar}>Continuar</button>
      </div>
    </div>
  )
}
