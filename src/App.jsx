import { useState } from 'react'
import ProvincesList from './components/ProvincesList'
import ProvincePanel from './components/ProvincePanel'
import styles from './App.module.css'

const INITIAL_PROVINCES = [
  { id: 1, code: 2, name: 'Buenos Aires', iibb: 'Buenos Aires', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 5.5, leyendaComprobante: 'Buenos Aires - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral de Coparticipación' },
  { id: 2, code: 3, name: 'Catamarca', iibb: 'Catamarca', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'igual', porcentajeIIBB: 3.0, leyendaComprobante: 'Catamarca - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 3, code: 4, name: 'Córdoba', iibb: 'Córdoba', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'siempre', porcentajeIIBB: 4.5, leyendaComprobante: 'Córdoba - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Contribuyente Acuerdo Multilateral' },
  { id: 4, code: 5, name: 'Corrientes', iibb: 'Corrientes', percibeAlways: false, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 3.5, leyendaComprobante: 'Corrientes - Responsable de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 5, code: 6, name: 'Chaco', iibb: 'Chaco', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'igual', porcentajeIIBB: 2.8, leyendaComprobante: 'Chaco - Contribuyente de IIBB', convenioMultilateral: true, leyendaConvenio: 'Régimen Especial' },
  { id: 6, code: 7, name: 'Chubut', iibb: 'Chubut', percibeAlways: true, permiteDevolución: false, devolucionPercepciones: 'siempre', porcentajeIIBB: 4.0, leyendaComprobante: 'Chubut - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral' },
  { id: 7, code: 8, name: 'Entre Ríos', iibb: 'Entre Ríos', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 4.2, leyendaComprobante: 'Entre Ríos - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Contribuyente Multilateral' },
  { id: 8, code: 9, name: 'Formosa', iibb: 'Formosa', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'igual', porcentajeIIBB: 2.5, leyendaComprobante: 'Formosa - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 9, code: 10, name: 'Jujuy', iibb: 'Jujuy', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'siempre', porcentajeIIBB: 3.8, leyendaComprobante: 'Jujuy - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Provincial' },
  { id: 10, code: 11, name: 'La Pampa', iibb: 'La Pampa', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'proporcional', porcentajeIIBB: 3.2, leyendaComprobante: 'La Pampa - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 11, code: 12, name: 'La Rioja', iibb: 'La Rioja', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'igual', porcentajeIIBB: 3.5, leyendaComprobante: 'La Rioja - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Multilateral' },
  { id: 12, code: 13, name: 'Mendoza', iibb: 'Mendoza', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'siempre', porcentajeIIBB: 4.8, leyendaComprobante: 'Mendoza - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral' },
  { id: 13, code: 14, name: 'Misiones', iibb: 'Misiones', percibeAlways: false, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 3.0, leyendaComprobante: 'Misiones - Responsable de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 14, code: 15, name: 'Neuquén', iibb: 'Neuquén', percibeAlways: true, permiteDevolución: false, devolucionPercepciones: 'igual', porcentajeIIBB: 4.0, leyendaComprobante: 'Neuquén - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Convenio Especial' },
  { id: 15, code: 16, name: 'Río Negro', iibb: 'Río Negro', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'siempre', porcentajeIIBB: 3.3, leyendaComprobante: 'Río Negro - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 16, code: 17, name: 'Salta', iibb: 'Salta', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 4.0, leyendaComprobante: 'Salta - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral' },
  { id: 17, code: 18, name: 'San Juan', iibb: 'San Juan', percibeAlways: false, permiteDevolución: true, devolucionPercepciones: 'igual', porcentajeIIBB: 3.5, leyendaComprobante: 'San Juan - Responsable de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 18, code: 19, name: 'San Luis', iibb: 'San Luis', percibeAlways: true, permiteDevolución: false, devolucionPercepciones: 'siempre', porcentajeIIBB: 3.8, leyendaComprobante: 'San Luis - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Multilateral' },
  { id: 19, code: 20, name: 'Santa Cruz', iibb: 'Santa Cruz', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'proporcional', porcentajeIIBB: 2.9, leyendaComprobante: 'Santa Cruz - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 20, code: 21, name: 'Santa Fe', iibb: 'Santa Fe', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'igual', porcentajeIIBB: 4.5, leyendaComprobante: 'Santa Fe - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral' },
  { id: 21, code: 22, name: 'Santiago del Estero', iibb: 'Santiago del Estero', percibeAlways: false, permiteDevolución: false, devolucionPercepciones: 'siempre', porcentajeIIBB: 3.0, leyendaComprobante: 'Santiago del Estero - Contribuyente de IIBB', convenioMultilateral: false, leyendaConvenio: '' },
  { id: 22, code: 23, name: 'Tierra del Fuego', iibb: 'Tierra del Fuego', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'proporcional', porcentajeIIBB: 5.0, leyendaComprobante: 'Tierra del Fuego - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Especial' },
  { id: 23, code: 24, name: 'Tucumán', iibb: 'Tucumán', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'igual', porcentajeIIBB: 4.3, leyendaComprobante: 'Tucumán - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Multilateral' },
  { id: 24, code: 1, name: 'Ciudad Autónoma de Buenos Aires', iibb: 'CABA', percibeAlways: true, permiteDevolución: true, devolucionPercepciones: 'siempre', porcentajeIIBB: 5.5, leyendaComprobante: 'CABA - Responsable de IIBB', convenioMultilateral: true, leyendaConvenio: 'Acuerdo Multilateral de CABA' }
]

export default function App() {
  const [provinces, setProvinces] = useState(INITIAL_PROVINCES)
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [panelMode, setPanelMode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.code).includes(searchTerm)
  )

  const handleViewProvince = (province) => {
    setSelectedProvince(province)
    setPanelMode('view')
  }

  const handleEditProvince = (province) => {
    setSelectedProvince({ ...province })
    setPanelMode('edit')
  }

  const handleDeleteProvince = (province) => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${province.name}?`)) {
      setProvinces(provinces.filter(p => p.id !== province.id))
    }
  }

  const handleSave = (updatedProvince) => {
    if (panelMode === 'edit') {
      setProvinces(provinces.map(p => p.id === updatedProvince.id ? updatedProvince : p))
    }
    closePanelAndResetSearch()
  }

  const handleCancel = () => {
    closePanelAndResetSearch()
  }

  const closePanelAndResetSearch = () => {
    setSelectedProvince(null)
    setPanelMode(null)
    setSearchTerm('')
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <ProvincesList
          provinces={filteredProvinces}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onView={handleViewProvince}
          onEdit={handleEditProvince}
          onDelete={handleDeleteProvince}
        />
      </div>

      {panelMode && (
        <ProvincePanel
          mode={panelMode}
          province={selectedProvince}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
