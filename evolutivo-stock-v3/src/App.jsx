import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import OperariosList from './components/OperariosList'
import OperarioPanel from './components/OperarioPanel'
import PreparacionesList from './components/PreparacionesList'
import PreparacionOrigenPanel from './components/PreparacionOrigenPanel'
import PreparacionDocumentoPanel from './components/PreparacionDocumentoPanel'
import PreparacionAreasPanel from './components/PreparacionAreasPanel'
import PreparacionAsignacionPanel from './components/PreparacionAsignacionPanel'
import PreparacionVistaPanel from './components/PreparacionVistaPanel'
import ControlPreparacionesList from './components/ControlPreparacionesList'
import DespachoList from './components/DespachoList'
import PrioridadesList from './components/PrioridadesList'
import PrioridadPanel from './components/PrioridadPanel'
import ControlPanel from './components/ControlPanel'
import ControlClientePanel from './components/ControlClientePanel'
import EditPreparacionModal from './components/EditPreparacionModal'
import Ubicaciones from './components/Ubicaciones'
import { ORIGENES_CONFIG } from './data/preparacionDocumentos'
import { CONTROL_PREPARACIONES } from './data/controlPreparaciones'
import styles from './App.module.css'


const INITIAL_OPERARIOS = [
  { id: 1, code: '001', name: 'Juan Pérez', usuarioZeus: 'U001 - jperez', inicioActividades: '2020-03-02', fechaNacimiento: '1990-05-20', preparador: true, controlador: false, deposito: 'D01 - Depósito Central', area: '01 - Depósito Central', apto: true, articulosPromedio: 28, tiempoPromedio: '1.4 min' },
  { id: 2, code: '002', name: 'María Gómez', usuarioZeus: 'U002 - mgomez', inicioActividades: '2019-11-15', fechaNacimiento: '1988-02-11', preparador: false, controlador: true, deposito: 'D02 - Sucursal Norte', area: '', apto: false, articulosPromedio: null, tiempoPromedio: null },
  { id: 3, code: '003', name: 'Carlos Fernández', usuarioZeus: 'U003 - cfernandez', inicioActividades: '2021-06-01', fechaNacimiento: '1995-09-30', preparador: true, controlador: true, deposito: 'D01 - Depósito Central', area: '02 - Depósito Norte', apto: true, articulosPromedio: 22, tiempoPromedio: '2.1 min' },
  { id: 4, code: '004', name: 'Lucía Romero', usuarioZeus: 'U004 - lromero', inicioActividades: '2022-01-10', fechaNacimiento: '1992-12-05', preparador: false, controlador: true, deposito: 'D03 - Sucursal Sur', area: '', apto: false, articulosPromedio: null, tiempoPromedio: null },
  { id: 5, code: '005', name: 'Diego Sosa', usuarioZeus: 'U005 - dsosa', inicioActividades: '2018-08-22', fechaNacimiento: '1985-07-18', preparador: true, controlador: false, deposito: 'D03 - Sucursal Sur', area: '03 - Depósito Sur', apto: true, articulosPromedio: 35, tiempoPromedio: '0.9 min' },
  { id: 6, code: '006', name: 'Ana Torres', usuarioZeus: 'U006 - atorres', inicioActividades: '2023-02-14', fechaNacimiento: '1998-04-23', preparador: true, controlador: true, deposito: 'D02 - Sucursal Norte', area: '04 - Recepción', apto: false, articulosPromedio: 19, tiempoPromedio: '1.8 min' },
]

const INITIAL_PREPARACIONES = [
  {
    id: 101, fecha: '12/06/2026', origen: 'Pedido de venta', comprobante: '00001234', numeroPreparacion: '00001234',
    sucursal: 'SUCURSAL CENTRAL', deposito: '10', codigo: '00022', razonSocial: 'RETROBOROS SA',
    preparador: 'Juan Pérez', controlador: '', prioridad: 'Alta', estado: 'Pendiente',
    avance: 0, transporte: '', zona: 'A', localidad: 'BUENOS AIRES',
    comprobantesIncluidos: ['00001234'],
    clientes: [{ razonSocial: 'RETROBOROS SA', comprobantes: ['00001234'], items: [
      { codigo: 'ART-001', descripcion: 'TORNILLO HEXAGONAL 1/2"', cantidad: 100 },
      { codigo: 'ART-002', descripcion: 'TUERCA AUTOBLOCANTE M12', cantidad: 50 },
      { codigo: 'ART-003', descripcion: 'ARANDELA PLANA 10mm', cantidad: 200 },
    ]}],
  },
  {
    id: 102, fecha: '13/06/2026', origen: 'Sugerencia de compra', comprobante: '00001235', numeroPreparacion: '00001235',
    sucursal: 'SUCURSAL NORTE', deposito: '20', codigo: '00017', razonSocial: 'DISTRIBUIDORA DEL SUR SA',
    preparador: 'María Gómez', controlador: 'Lucía Romero', prioridad: 'Media', estado: 'En Proceso',
    avance: 40, transporte: 'Transporte 1', zona: 'B', localidad: 'CÓRDOBA',
    comprobantesIncluidos: ['00001235', '00001238'],
    clientes: [{ razonSocial: 'DISTRIBUIDORA DEL SUR SA', comprobantes: ['00001235', '00001238'], items: [
      { codigo: 'ART-010', descripcion: 'CABLE UNIPOLAR 2.5mm', cantidad: 300 },
      { codigo: 'ART-011', descripcion: 'DISYUNTOR TERMICA 16A', cantidad: 10 },
    ]}],
  },
  {
    id: 103, fecha: '14/06/2026', origen: 'Factura de acopio', comprobante: '00001236', numeroPreparacion: '00001236',
    sucursal: 'SUCURSAL SUR', deposito: '30', codigo: '00031', razonSocial: 'COMERCIAL NORTE SRL',
    preparador: 'Carlos Fernández', controlador: 'Ana Torres', prioridad: 'Baja', estado: 'Control Pendiente',
    avance: 100, transporte: 'Transporte 2', zona: 'C', localidad: 'ROSARIO',
    comprobantesIncluidos: ['00001236'],
    clientes: [{ razonSocial: 'COMERCIAL NORTE SRL', comprobantes: ['00001236'], items: [
      { codigo: 'ART-020', descripcion: 'PINTURA LÁTEX BLANCO 10L', cantidad: 20 },
      { codigo: 'ART-021', descripcion: 'RODILLO LANA 23cm', cantidad: 15 },
      { codigo: 'ART-022', descripcion: 'BANDEJA PARA PINTURA', cantidad: 15 },
    ]}],
  },
  {
    id: 104, fecha: '15/06/2026', origen: 'Pedido de venta', comprobante: '00001237', numeroPreparacion: '00001237',
    sucursal: 'SUCURSAL CENTRAL', deposito: '10', codigo: '00045', razonSocial: 'IMPORTADORA ATLANTICA',
    preparador: 'Diego Sosa', controlador: 'María Gómez', prioridad: 'Alta', estado: 'Finalizado',
    avance: 100, transporte: '', zona: 'A', localidad: 'BUENOS AIRES',
    comprobantesIncluidos: ['00001237'],
    clientes: [{ razonSocial: 'IMPORTADORA ATLANTICA', comprobantes: ['00001237'], items: [
      { codigo: 'ART-030', descripcion: 'NOTEBOOK CORE I5 16GB', cantidad: 5 },
      { codigo: 'ART-031', descripcion: 'MOUSE INALÁMBRICO', cantidad: 5 },
    ]}],
  },
  {
    id: 105, fecha: '23/06/2026', origen: 'Pedido de venta', comprobante: '00001238', numeroPreparacion: '00001238',
    sucursal: 'SUCURSAL CENTRAL', deposito: '10', codigo: '00022', razonSocial: 'RETROBOROS SA',
    preparador: 'Ana Torres', controlador: '', prioridad: 'Alta', estado: 'Pendiente',
    avance: 0, transporte: 'ANDREANI', zona: 'A', localidad: 'BUENOS AIRES',
    comprobantesIncluidos: ['00001238'],
    clientes: [{ razonSocial: 'RETROBOROS SA', comprobantes: ['00001238'], items: [
      { codigo: 'ART-040', descripcion: 'VÁLVULA ESFÉRICA 1"', cantidad: 30 },
      { codigo: 'ART-041', descripcion: 'CODO PVC 90° 110mm', cantidad: 50 },
    ]}],
  },
  {
    id: 106, fecha: '23/06/2026', origen: 'Sugerencia de compra', comprobante: '00001239', numeroPreparacion: '00001239',
    sucursal: 'SUCURSAL NORTE', deposito: '20', codigo: '00017', razonSocial: 'DISTRIBUIDORA DEL SUR SA',
    preparador: 'Carlos Fernández', controlador: '', prioridad: 'Media', estado: 'En Proceso',
    avance: 25, transporte: 'OCA', zona: 'B', localidad: 'CÓRDOBA',
    comprobantesIncluidos: ['00001239'],
    clientes: [{ razonSocial: 'DISTRIBUIDORA DEL SUR SA', comprobantes: ['00001239'], items: [
      { codigo: 'ART-050', descripcion: 'LLAVE TÉRMICA 32A', cantidad: 20 },
      { codigo: 'ART-051', descripcion: 'TABLERO EMBUTIR 12 MOD', cantidad: 8 },
    ]}],
  },
  {
    id: 107, fecha: '23/06/2026', origen: 'Pedido de venta', comprobante: '00001240', numeroPreparacion: '00001240',
    sucursal: 'SUCURSAL SUR', deposito: '30', codigo: '00031', razonSocial: 'COMERCIAL NORTE SRL',
    preparador: 'Juan Pérez', controlador: '', prioridad: 'Baja', estado: 'Pendiente',
    avance: 0, transporte: 'VIA CARGO', zona: 'C', localidad: 'ROSARIO',
    comprobantesIncluidos: ['00001240'],
    clientes: [{ razonSocial: 'COMERCIAL NORTE SRL', comprobantes: ['00001240'], items: [
      { codigo: 'ART-060', descripcion: 'MEMBRANA ASFÁLTICA 4mm', cantidad: 10 },
      { codigo: 'ART-061', descripcion: 'PINTURA EXTERIOR 20L', cantidad: 6 },
    ]}],
  },
]

const INITIAL_PRIORIDADES = [
  { id: 1, codigo: 1, descripcion: 'PRIORIDAD ALTA',  color: '#D32F2F' },
  { id: 2, codigo: 2, descripcion: 'PRIORIDAD MEDIA', color: '#FFC107' },
  { id: 3, codigo: 3, descripcion: 'PRIORIDAD BAJA',  color: '#4CAF50' },
]

const INICIO_TAB = { id: 'inicio', label: 'Inicio', closable: false }

export default function App() {
  const [operarios, setOperarios] = useState(INITIAL_OPERARIOS)
  const [selectedOperario, setSelectedOperario] = useState(null)
  const [panelMode, setPanelMode] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('operarios-stock')

  const [preparaciones, setPreparaciones] = useState(INITIAL_PREPARACIONES)
  const [preparacionSearchTerm, setPreparacionSearchTerm] = useState('')
  const [showPreparacionOrigenModal, setShowPreparacionOrigenModal] = useState(false)
  const [showDocumentoPanel, setShowDocumentoPanel] = useState(false)
  const [articulosSinArea, setArticulosSinArea] = useState([])
  const [showAreasPanel, setShowAreasPanel] = useState(false)
  const [showAsignacionPanel, setShowAsignacionPanel] = useState(false)
  const [selectedOrigenId, setSelectedOrigenId] = useState(null)
  const [pedidoVentaSeleccion, setPedidoVentaSeleccion] = useState(null)
  const [preparacionVista, setPreparacionVista] = useState(null)
  const [preparacionVistaMode, setPreparacionVistaMode] = useState('view')

  const [prioridades, setPrioridades] = useState(INITIAL_PRIORIDADES)
  const [prioridadPanel, setPrioridadPanel] = useState(null)

  const [controlPreparaciones] = useState(CONTROL_PREPARACIONES)
  const [controlPanelData, setControlPanelData] = useState(null)
  const [controlClienteData, setControlClienteData] = useState(null)
  const [controlPreparacionesSearchTerm, setControlPreparacionesSearchTerm] = useState('')

  const [tabs, setTabs] = useState([INICIO_TAB])
  const [activeTab, setActiveTab] = useState('inicio')

  const filteredOperarios = operarios.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.code).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const nextPreparacionId = preparaciones.length > 0 ? Math.max(...preparaciones.map(p => p.id)) + 1 : 1
  const nextNumeroPreparacion = String(nextPreparacionId).padStart(4, '0')

  const filteredPreparaciones = preparaciones.filter(p =>
    String(p.codigo ?? '').toLowerCase().includes(preparacionSearchTerm.toLowerCase()) ||
    String(p.razonSocial ?? '').toLowerCase().includes(preparacionSearchTerm.toLowerCase()) ||
    String(p.comprobante ?? '').toLowerCase().includes(preparacionSearchTerm.toLowerCase())
  )

  const filteredControlPreparaciones = controlPreparaciones.filter(p => {
    const term = controlPreparacionesSearchTerm.toLowerCase()
    return String(p.comprobante ?? '').toLowerCase().includes(term) ||
      String(p.preparador ?? '').toLowerCase().includes(term) ||
      (p.clientes ?? []).some(c => String(c.razonSocial ?? '').toLowerCase().includes(term))
  })

  const handleViewOperario = (operario) => {
    setSelectedOperario(operario)
    setPanelMode('view')
  }

  const handleEditOperario = (operario) => {
    setSelectedOperario({ ...operario })
    setPanelMode('edit')
  }

  const handleCreateOperario = () => {
    setSelectedOperario({
      code: '',
      usuarioZeus: '',
      name: '',
      inicioActividades: '',
      fechaNacimiento: '',
      preparador: false,
      controlador: false,
      deposito: '',
      area: '',
      apto: false,
      articulosPromedio: null,
      tiempoPromedio: null,
    })
    setPanelMode('create')
  }

  const handleDeleteOperario = (operario) => {
    if (confirm(`¿Eliminar al operario ${operario.name || operario.code}?`)) {
      setOperarios(operarios.filter(o => o.id !== operario.id))
    }
  }

  const handleSave = (updatedOperario) => {
    if (panelMode === 'edit') {
      setOperarios(operarios.map(o => o.id === updatedOperario.id ? updatedOperario : o))
    } else if (panelMode === 'create') {
      const nextId = operarios.length > 0 ? Math.max(...operarios.map(o => o.id)) + 1 : 1
      setOperarios([...operarios, { ...updatedOperario, id: nextId }])
    }
    closePanelAndResetSearch()
  }

  const handleCancel = () => {
    closePanelAndResetSearch()
  }

  const closePanelAndResetSearch = () => {
    setSelectedOperario(null)
    setPanelMode(null)
    setSearchTerm('')
  }

  const handleViewDetallePreparacion = (preparacion) => {
    setPreparacionVista(preparacion)
    setPreparacionVistaMode('view')
  }

  const handleSaveEdit = (preparacionId, changes) => {
    setPreparaciones(prev => prev.map(p => p.id === preparacionId ? { ...p, ...changes } : p))
  }

  const handlePrintReport = (preparacion) => {
    alert(`Imprimiendo reporte de la preparación ${preparacion.numeroPreparacion ?? preparacion.id}`)
  }

  const handleCloseDetallePreparacion = () => {
    setPreparacionVista(null)
  }

  const handleSaveDetallePreparacion = (updatedPreparacion) => {
    setPreparaciones(preparaciones.map(p => p.id === updatedPreparacion.id ? updatedPreparacion : p))
    setPreparacionVista(null)
  }

  const handleCreatePreparacion = () => {
    setShowPreparacionOrigenModal(true)
  }

  const handleSelectPreparacionOrigen = (origen) => {
    if (!ORIGENES_CONFIG[origen.id]) return

    setSelectedOrigenId(origen.id)
    setShowDocumentoPanel(true)
  }

  const handleCancelPreparacionOrigen = () => {
    setShowPreparacionOrigenModal(false)
    setShowDocumentoPanel(false)
    setShowAreasPanel(false)
    setShowAsignacionPanel(false)
    setArticulosSinArea([])
    setSelectedOrigenId(null)
    setPedidoVentaSeleccion(null)
  }

  const handleBackFromDocumento = () => {
    setShowDocumentoPanel(false)
  }

  const buildNuevaPreparacion = ({ pedido, prioridad, deposito, transporte, zona, metodologiaPickeo, modoEjecucion, origenLabel }, preparador, areasSolicitadas) => {
    const nextId = preparaciones.length > 0 ? Math.max(...preparaciones.map(p => p.id)) + 1 : 1

    return {
      id: nextId,
      numeroPreparacion: String(nextId).padStart(4, '0'),
      fecha: pedido.fecha.replaceAll('/', '-'),
      origen: origenLabel,
      comprobante: pedido.pedido,
      comprobantesIncluidos: [pedido.pedido],
      sucursal: '1',
      deposito,
      codigo: pedido.pedido,
      razonSocial: pedido.razonSocial,
      preparador,
      prioridad,
      estado: 'Pendiente',
      avance: 0,
      transporte: transporte || '',
      zona: zona || '',
      localidad: '',
      metodologiaPickeo,
      modoEjecucion,
      areasSolicitadas,
      clientes: [
        {
          razonSocial: pedido.razonSocial,
          comprobantes: [pedido.pedido],
          items: pedido.detalle.map(item => ({
            codigo: item.codigoProducto,
            descripcion: item.descripcion,
            cantidad: item.cantidad
          }))
        }
      ]
    }
  }

  const handleConfirmDocumento = (seleccion) => {
    const seleccionConOrigen = { ...seleccion, origenLabel: ORIGENES_CONFIG[selectedOrigenId].badgeLabel }
    setPedidoVentaSeleccion(seleccionConOrigen)

    if (seleccion.modoEjecucion === 'Picking por Áreas') {
      const sinArea = seleccion.pedido.detalle
        .filter(item => !item.area)
        .map(item => ({ codigoArticulo: item.codigoProducto, descripcion: item.descripcion, ubicacion: item.ubicacion ?? '' }))
      setArticulosSinArea(sinArea)
      setShowAreasPanel(true)
      return
    }

    setShowAsignacionPanel(true)
  }

  const handleBackFromAreas = () => setShowAreasPanel(false)

  const handleBackFromAsignacion = () => setShowAsignacionPanel(false)

  const resetCrearPreparacion = () => {
    setShowAreasPanel(false)
    setShowAsignacionPanel(false)
    setArticulosSinArea([])
    setShowDocumentoPanel(false)
    setShowPreparacionOrigenModal(false)
    setSelectedOrigenId(null)
    setPedidoVentaSeleccion(null)
  }

  const handleConfirmAsignacion = ({ preparador, prioridad }) => {
    const nuevaPreparacion = buildNuevaPreparacion({ ...pedidoVentaSeleccion, prioridad }, preparador, [])
    setPreparaciones([...preparaciones, nuevaPreparacion])
    resetCrearPreparacion()
  }

  const handleConfirmAreas = (asignaciones, articuloResponsables, prioridad) => {
    const preparador = Object.entries(asignaciones)
      .map(([area, prep]) => `${area}: ${prep}`)
      .join(' | ')

    const areasSolicitadas = Object.entries(asignaciones).map(([area, prep]) => ({
      area,
      preparador: prep,
      avance: 0,
      estado: 'Pendiente'
    }))

    const nuevaPreparacion = buildNuevaPreparacion({ ...pedidoVentaSeleccion, prioridad }, preparador, areasSolicitadas)
    setPreparaciones([...preparaciones, nuevaPreparacion])
    resetCrearPreparacion()
  }

  const handleDeletePreparacion = (preparacion) => {
    if (confirm(`¿Eliminar la preparación ${preparacion.codigo || ''}?`)) {
      setPreparaciones(preparaciones.filter(p => p.id !== preparacion.id))
    }
  }

  const handleGenerateReport = (preparacion) => {
    alert(`Generando reporte para la preparación ${preparacion.codigo || preparacion.id}...`)
  }

  const handleCrearPrioridad = () => setPrioridadPanel({ mode: 'create', data: null })
  const handleVisualizarPrioridad = (p) => setPrioridadPanel({ mode: 'view', data: p })
  const handleEditarPrioridad = (p) => setPrioridadPanel({ mode: 'edit', data: p })
  const handleEliminarPrioridad = (p) => {
    if (confirm(`¿Eliminar "${p.descripcion}"?`)) {
      setPrioridades(prev => prev.filter(x => x.id !== p.id))
    }
  }
  const handleGuardarPrioridad = (data) => {
    if (prioridadPanel.mode === 'create') {
      const nextId = prioridades.length > 0 ? Math.max(...prioridades.map(p => p.id)) + 1 : 1
      setPrioridades(prev => [...prev, { ...data, id: nextId, codigo: data.codigo || nextId }])
    } else {
      setPrioridades(prev => prev.map(p => p.id === data.id ? data : p))
    }
    setPrioridadPanel(null)
  }
  const handleCancelarPrioridad = () => setPrioridadPanel(null)

  const handleRotulos = () => { alert('Generando rótulos...') }
  const handleImprimirHojaRuta = () => { alert('Imprimiendo hoja de ruta...') }

  const handleIniciarControl = (preparacion) => {
    if (!preparacion) return
    const clientes = preparacion.clientes ?? []
    if (clientes.length === 1) {
      setControlPanelData({ preparacion, item: clientes[0] })
    } else {
      setControlClienteData(preparacion)
    }
  }

  const handleSelectCliente = (preparacion, cliente) => {
    setControlClienteData(null)
    setControlPanelData({ preparacion, item: cliente })
  }

  const handleCloseControlPanel = () => setControlPanelData(null)

  const handleConfirmControl = ({ controlador, cantidades, preparacion, item }) => {
    setControlPanelData(null)
  }

  const handleModificarControl = ({ item }) => {
    alert(`Modificar control de ${item?.codigo} - ${item?.razonSocial}...`)
  }

  const handleLiberarControl = () => {
    alert('Liberando preparaciones...')
  }

  const handleNavigate = (viewId) => {
    setActiveView(viewId)

    if (viewId === 'operarios-stock') {
      setActiveTab('inicio')
      return
    }

    if (viewId === 'preparacion') {
      setTabs(prev => prev.some(tab => tab.id === 'preparacion')
        ? prev
        : [...prev, { id: 'preparacion', label: 'Preparación', closable: true }])
      setActiveTab('preparacion')
      return
    }

    if (viewId === 'control-preparaciones') {
      setTabs(prev => prev.some(tab => tab.id === 'control-preparaciones')
        ? prev
        : [...prev, { id: 'control-preparaciones', label: 'Control de Preparaciones', closable: true }])
      setActiveTab('control-preparaciones')
      return
    }

    if (viewId === 'despacho') {
      setTabs(prev => prev.some(tab => tab.id === 'despacho')
        ? prev
        : [...prev, { id: 'despacho', label: 'Despacho', closable: true }])
      setActiveTab('despacho')
      return
    }

    if (viewId === 'prioridades') {
      setTabs(prev => prev.some(tab => tab.id === 'prioridades')
        ? prev
        : [...prev, { id: 'prioridades', label: 'Prioridades', closable: true }])
      setActiveTab('prioridades')
      return
    }

    if (viewId === 'ubicaciones') {
      setTabs(prev => prev.some(tab => tab.id === 'ubicaciones')
        ? prev
        : [...prev, { id: 'ubicaciones', label: 'Ubicaciones', closable: true }])
      setActiveTab('ubicaciones')
      return
    }
  }

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    setActiveView(tabId === 'inicio' ? 'operarios-stock' : tabId)
  }

  const handleCloseTab = (tabId) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTab === tabId) {
      setActiveTab('inicio')
      setActiveView('operarios-stock')
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar activeView={activeView} onSelectView={handleNavigate} />
      <div className={styles.container}>
        <Tabs tabs={tabs} activeTab={activeTab} onSelectTab={handleSelectTab} onCloseTab={handleCloseTab} />

        {activeTab === 'inicio' && (
          <OperariosList
            operarios={filteredOperarios}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onView={handleViewOperario}
            onEdit={handleEditOperario}
            onDelete={handleDeleteOperario}
            onCreate={handleCreateOperario}
          />
        )}

        {activeTab === 'preparacion' && (
          <PreparacionesList
            preparaciones={filteredPreparaciones}
            searchTerm={preparacionSearchTerm}
            onSearchChange={setPreparacionSearchTerm}
            operarios={operarios}
            onSaveEdit={handleSaveEdit}
            onView={handleViewDetallePreparacion}
            onCreate={handleCreatePreparacion}
            onDelete={handleDeletePreparacion}
            onGenerateReport={handleGenerateReport}
            onPrintReport={handlePrintReport}
            onRowClick={handleViewDetallePreparacion}
            prioridades={prioridades}
          />
        )}

        {activeTab === 'prioridades' && (
          <PrioridadesList
            prioridades={prioridades}
            onCrear={handleCrearPrioridad}
            onVisualizar={handleVisualizarPrioridad}
            onEditar={handleEditarPrioridad}
            onEliminar={handleEliminarPrioridad}
          />
        )}

        {activeTab === 'ubicaciones' && (
          <Ubicaciones />
        )}

        {activeTab === 'despacho' && (
          <DespachoList
            onRotulos={handleRotulos}
            onImprimirHojaRuta={handleImprimirHojaRuta}
            prioridades={prioridades}
          />
        )}

        {activeTab === 'control-preparaciones' && (
          <ControlPreparacionesList
            preparaciones={filteredControlPreparaciones}
            searchTerm={controlPreparacionesSearchTerm}
            onSearchChange={setControlPreparacionesSearchTerm}
            onIniciarControl={handleIniciarControl}
            onModificar={handleModificarControl}
            onLiberar={handleLiberarControl}
            prioridades={prioridades}
          />
        )}
      </div>

      {panelMode && (
        <OperarioPanel
          mode={panelMode}
          operario={selectedOperario}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {showAreasPanel && pedidoVentaSeleccion ? (
        <PreparacionAreasPanel
          pedido={pedidoVentaSeleccion.pedido}
          operarios={operarios}
          preparaciones={preparaciones}
          prioridades={prioridades}
          numeroPreparacion={nextNumeroPreparacion}
          articulosSinArea={articulosSinArea}
          onBack={handleBackFromAreas}
          onCancel={handleCancelPreparacionOrigen}
          onConfirm={handleConfirmAreas}
        />
      ) : showAsignacionPanel && pedidoVentaSeleccion ? (
        <PreparacionAsignacionPanel
          operarios={operarios}
          preparaciones={preparaciones}
          prioridades={prioridades}
          numeroPreparacion={nextNumeroPreparacion}
          onBack={handleBackFromAsignacion}
          onCancel={handleCancelPreparacionOrigen}
          onConfirm={handleConfirmAsignacion}
        />
      ) : showDocumentoPanel ? (
        <PreparacionDocumentoPanel
          origenId={selectedOrigenId}
          preparaciones={preparaciones}
          onBack={handleBackFromDocumento}
          onCancel={handleCancelPreparacionOrigen}
          onConfirm={handleConfirmDocumento}
        />
      ) : showPreparacionOrigenModal ? (
        <PreparacionOrigenPanel
          onSelect={handleSelectPreparacionOrigen}
          onCancel={handleCancelPreparacionOrigen}
          activeOriginId={selectedOrigenId}
        />
      ) : null}

      {preparacionVista && (
        <PreparacionVistaPanel
          preparacion={preparacionVista}
          onClose={handleCloseDetallePreparacion}
        />
      )}

      {prioridadPanel && (
        <PrioridadPanel
          mode={prioridadPanel.mode}
          prioridad={prioridadPanel.data}
          onSave={handleGuardarPrioridad}
          onCancel={handleCancelarPrioridad}
          onEdit={handleEditarPrioridad}
        />
      )}

      {controlClienteData && (
        <ControlClientePanel
          preparacion={controlClienteData}
          onSelect={handleSelectCliente}
          onClose={() => setControlClienteData(null)}
        />
      )}

      {controlPanelData && (
        <ControlPanel
          preparacion={controlPanelData.preparacion}
          item={controlPanelData.item}
          operarios={operarios}
          onClose={handleCloseControlPanel}
          onConfirm={handleConfirmControl}
        />
      )}

    </div>
  )
}
