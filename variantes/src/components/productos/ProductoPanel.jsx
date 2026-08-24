import { useState } from 'react'
import {
  IconPackage, IconSettings, IconX, IconId, IconPhoto, IconTruck, IconVersions,
  IconBriefcase, IconFileDescription, IconTag, IconStack2, IconFileImport,
  IconBox, IconNote, IconBuildingStore, IconShoppingCart, IconPlus, IconTrash,
  IconTool,
} from '@tabler/icons-react'
import VariantesTab from './VariantesTab'
import { TIPOS_IVA } from '../../data/productosSeed'

const NAV = [
  { id: 'principal', label: 'Principal', icon: IconId },
  { id: 'imagenes', label: 'Imágenes', icon: IconPhoto },
  { id: 'proveedores', label: 'Proveedores', icon: IconTruck },
  { id: 'variantes', label: 'Variantes', icon: IconVersions, badge: 'Nuevo' },
  { id: 'comercial', label: 'Comercial', icon: IconBriefcase },
  { id: 'especificaciones', label: 'Especificaciones', icon: IconFileDescription },
  { id: 'precios', label: 'Precios', icon: IconTag },
  { id: 'stock', label: 'Stock', icon: IconStack2 },
  { id: 'importaciones', label: 'Importaciones', icon: IconFileImport },
  { id: 'lotes', label: 'Lotes', icon: IconBox },
  { id: 'notas', label: 'Notas', icon: IconNote },
  { id: 'sucursales', label: 'Sucursales', icon: IconBuildingStore },
  { id: 'ecommerce', label: 'E-Commerce', icon: IconShoppingCart },
]

const PRODUCTO_VACIO = {
  codigo: '', descripcion: '', descripcionAdicional: '', tipoIva: '',
  inactivo: false, codigosBarra: [], paisOrigen: '', familia: '',
  variantes: { seleccion: [], priceMode: 'base', adicionales: {} },
}

export default function ProductoPanel({ mode, initial, agrupadores, onClose, onSubmit }) {
  const isEdit = mode === 'edit'
  const base = initial ?? PRODUCTO_VACIO

  const [activeTab, setActiveTab] = useState('principal')
  const [codigo, setCodigo] = useState(base.codigo)
  const [descripcion, setDescripcion] = useState(base.descripcion)
  const [descripcionAdicional, setDescripcionAdicional] = useState(base.descripcionAdicional)
  const [tipoIva, setTipoIva] = useState(base.tipoIva)
  const [inactivo, setInactivo] = useState(base.inactivo)
  const [codigosBarra, setCodigosBarra] = useState(base.codigosBarra)
  const [paisOrigen, setPaisOrigen] = useState(base.paisOrigen)
  const [familia, setFamilia] = useState(base.familia)
  const [variantes, setVariantes] = useState(base.variantes)

  const hasVariantErrors = variantes.seleccion.some((s) => s.valuesSelected.length === 0)
  const variantesOk = variantes.seleccion.length === 0 || !hasVariantErrors
  const totalCombos = variantes.seleccion.length > 0 && !hasVariantErrors
    ? variantes.seleccion.reduce((acc, s) => acc * s.valuesSelected.length, 1)
    : 0
  const isValid = !!(codigo.trim() && tipoIva.trim() && variantesOk)

  function addBarcode() { setCodigosBarra((bs) => [...bs, '']) }
  function updateBarcode(idx, value) { setCodigosBarra((bs) => bs.map((b, i) => (i === idx ? value : b))) }
  function removeBarcode(idx) { setCodigosBarra((bs) => bs.filter((_, i) => i !== idx)) }

  function handleSubmit() {
    if (!isValid) return
    onSubmit({
      codigo: codigo.trim().toUpperCase(),
      descripcion,
      descripcionAdicional,
      tipoIva,
      inactivo,
      codigosBarra: codigosBarra.filter((b) => b.trim()),
      paisOrigen,
      familia,
      variantes,
    })
  }

  let footStatus
  let footIsWarn = false
  if (!codigo.trim() || !tipoIva.trim()) {
    footStatus = 'Completá código de producto y tipo de IVA'
    footIsWarn = true
  } else if (!variantesOk) {
    footStatus = 'Hay agrupadores sin valores seleccionados en Variantes'
    footIsWarn = true
  } else if (totalCombos > 0) {
    footStatus = <>Se generarán <b>{totalCombos}</b> variantes al guardar</>
  } else {
    footStatus = 'Listo para guardar'
  }

  return (
    <div className="pr-editor">
      <div className="pr-editor-head">
        <div className="pr-title">
          <div className="pr-title-ico"><IconPackage size={16} stroke={1.6} /></div>
          <span>{isEdit ? 'Editar' : 'Nuevo'} <strong>Producto</strong></span>
          {isEdit && <span className="pr-subtitle">{codigo} - {descripcion}</span>}
        </div>
        <div className="pr-actions">
          <button type="button" className="va-btn-icon" aria-label="Configuración"><IconSettings size={17} stroke={1.6} /></button>
          <button type="button" className="va-btn-icon" onClick={onClose} aria-label="Cerrar"><IconX size={18} stroke={1.6} /></button>
        </div>
      </div>

      <div className="pr-editor-body">
        <nav className="pr-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`pr-nav-item ${activeTab === n.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(n.id)}
            >
              <n.icon size={16} stroke={1.6} />
              <span>{n.label}</span>
              {n.badge && <span className="pr-nav-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="pr-content">
          {activeTab === 'principal' && (
            <PrincipalTab
              codigo={codigo} setCodigo={setCodigo} isEdit={isEdit}
              descripcion={descripcion} setDescripcion={setDescripcion}
              descripcionAdicional={descripcionAdicional} setDescripcionAdicional={setDescripcionAdicional}
              tipoIva={tipoIva} setTipoIva={setTipoIva}
              inactivo={inactivo} setInactivo={setInactivo}
              codigosBarra={codigosBarra} onAddBarcode={addBarcode} onUpdateBarcode={updateBarcode} onRemoveBarcode={removeBarcode}
              paisOrigen={paisOrigen} setPaisOrigen={setPaisOrigen}
              familia={familia} setFamilia={setFamilia}
            />
          )}
          {activeTab === 'variantes' && (
            <VariantesTab agrupadores={agrupadores} variantes={variantes} setVariantes={setVariantes} />
          )}
          {!['principal', 'variantes'].includes(activeTab) && (
            <PlaceholderTab label={NAV.find((n) => n.id === activeTab)?.label} />
          )}
        </div>
      </div>

      <div className="pr-editor-foot">
        <div className={`pr-foot-status ${footIsWarn ? 'is-warn' : ''}`}>{footStatus}</div>
        <button type="button" className="va-btn va-btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="button" className="va-btn va-btn-primary" disabled={!isValid} onClick={handleSubmit}>
          Guardar Producto
        </button>
      </div>
    </div>
  )
}

function PrincipalTab({
  codigo, setCodigo, isEdit, descripcion, setDescripcion, descripcionAdicional, setDescripcionAdicional,
  tipoIva, setTipoIva, inactivo, setInactivo, codigosBarra, onAddBarcode, onUpdateBarcode, onRemoveBarcode,
  paisOrigen, setPaisOrigen, familia, setFamilia,
}) {
  return (
    <div>
      <div className="pr-toggle-row">
        <div className="pr-section-title" style={{ marginBottom: 0 }}>Datos del Producto</div>
        <label className="va-toggle">
          <input type="checkbox" checked={inactivo} onChange={(e) => setInactivo(e.target.checked)} />
          <span className="va-track" />
          <span>Inactivo</span>
        </label>
      </div>

      <div className="va-fields">
        <div className="va-field">
          <label>Código de Producto <span className="va-req">*</span></label>
          <input
            className={`va-input ${isEdit ? 'is-readonly' : ''}`}
            value={codigo}
            readOnly={isEdit}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ej: REM-001"
          />
        </div>
        <div className="va-field">
          <label>Tipo de IVA <span className="va-req">*</span></label>
          <select className="va-input" value={tipoIva} onChange={(e) => setTipoIva(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {TIPOS_IVA.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="va-fields va-cols-1" style={{ marginTop: 14 }}>
        <div className="va-field">
          <label>Descripción</label>
          <input className="va-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción del producto" />
        </div>
      </div>

      <div className="va-fields va-cols-1" style={{ marginTop: 14 }}>
        <div className="va-field">
          <label>Descripción Adicional</label>
          <textarea
            className="va-textarea"
            value={descripcionAdicional}
            onChange={(e) => setDescripcionAdicional(e.target.value)}
            placeholder="Ingresá la Descripción Adicional"
          />
        </div>
      </div>

      <div className="va-card" style={{ padding: 16, marginTop: 20 }}>
        <div className="va-section-head" style={{ marginBottom: codigosBarra.length ? 12 : 4 }}>
          <div className="va-section-title" style={{ color: 'var(--va-violet-700)' }}>Códigos de Barra</div>
          <button type="button" className="va-btn va-btn-soft va-btn-sm" onClick={onAddBarcode}>
            <IconPlus size={14} stroke={1.8} /> Agregar
          </button>
        </div>
        {codigosBarra.length === 0 ? (
          <div className="va-sub" style={{ color: 'var(--va-ink-500)', fontSize: 12.5 }}>Sin códigos de barra.</div>
        ) : (
          <div className="col-12" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {codigosBarra.map((b, i) => (
              <div className="pr-barcode-row" key={i}>
                <input
                  className="va-input"
                  value={b}
                  onChange={(e) => onUpdateBarcode(i, e.target.value)}
                  placeholder="Código de barra"
                />
                <button type="button" className="va-btn-icon va-danger" onClick={() => onRemoveBarcode(i)} aria-label="Quitar">
                  <IconTrash size={15} stroke={1.6} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="va-section-title" style={{ color: 'var(--va-violet-700)', marginBottom: 12 }}>Atributos</div>
        <div className="pr-attr-grid">
          <div className="va-field">
            <label>País Origen</label>
            <input className="va-input" value={paisOrigen} onChange={(e) => setPaisOrigen(e.target.value)} placeholder="Ej: Argentina" />
          </div>
          <div className="va-field">
            <label>Familia</label>
            <input className="va-input" value={familia} onChange={(e) => setFamilia(e.target.value)} placeholder="Ej: Indumentaria" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderTab({ label }) {
  return (
    <div className="va-values-empty" style={{ padding: '44px 24px' }}>
      <div className="va-glyph"><IconTool size={20} stroke={1.6} /></div>
      <div className="va-ttl">Sección "{label}" en construcción</div>
      <div className="va-sub">Esta parte del ABM de Productos todavía no está disponible en este prototipo.</div>
    </div>
  )
}
