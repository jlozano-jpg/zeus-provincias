import { useMemo, useState } from 'react'
import {
  IconX, IconBox, IconChevronsLeft, IconCalendar, IconBuildingWarehouse,
  IconMapPin, IconReceipt2, IconRefresh, IconChevronDown, IconSearch,
} from '@tabler/icons-react'
import { buildStockLedger } from '../../data/stockSeed'
import FiltroSelectorPanel from './FiltroSelectorPanel'
import '../agrupadores/agrupadores.css'
import './stock.css'

const DEPOSITOS = [
  { id: 1, codigo: '1', nombre: 'Casa Central', meta: 'Av. Principal 1234, CABA' },
  { id: 2, codigo: '2', nombre: 'Depósito Sur', meta: 'Ruta 5 Km 12, Quilmes' },
]

const SUCURSAL_OPTIONS = [
  { id: 'Suc 1', codigo: '1', nombre: 'Suc 1' },
  { id: 'Suc 2', codigo: '2', nombre: 'Suc 2' },
]

const TIPOS_COMPROBANTE = [
  { id: 'FC-VENTA', nombre: 'VENTAS' },
  { id: 'FC-COMPRA', nombre: 'COMPRAS' },
  { id: 'REMITO-VENTAS', nombre: 'Remito-VENTAS' },
  { id: 'REMITO-COMPRAS', nombre: 'Remito-COMPRAS' },
  { id: 'REMITO-DEVOLUCION', nombre: 'Remito-DEVOLUCION' },
  { id: 'AJUSTE', nombre: 'AJUSTES' },
  { id: 'TRANSF', nombre: 'TRANSFERENCIAS' },
  { id: 'PRODUCCION', nombre: 'PRODUCCION' },
  { id: 'COMP-ANULADOS', nombre: 'COMP-ANULADOS' },
]

function fmt(n) {
  return (n ?? 0).toFixed(2).replace('.', ',')
}

function parseFechaDMY(str) {
  const [d, m, y] = str.split('/').map(Number)
  return new Date(y, m - 1, d)
}

function dims(producto, agrupadores) {
  return (producto?.variantes?.seleccion || [])
    .map((s) => {
      const master = agrupadores.find((a) => a.id === s.agrupadorId)
      if (!master) return null
      return { master, values: master.values.filter((v) => s.valuesSelected.includes(v.code)) }
    })
    .filter(Boolean)
}

export default function FichaStockGeneral({ onNavigateHome, agrupadores, productos }) {
  const baseArticle = productos.find((p) => p.variantes.seleccion.length > 0) || productos[0]
  const [selectedCodigo, setSelectedCodigo] = useState(baseArticle?.codigo ?? '')
  const [showVariantes, setShowVariantes] = useState(false)
  const [activeTab, setActiveTab] = useState('movimientos')
  const [filtros, setFiltros] = useState({})
  const [desde, setDesde] = useState('2026-04-19')
  const [incluirSaldoAnterior, setIncluirSaldoAnterior] = useState(true)
  const [selectedDepositos, setSelectedDepositos] = useState([1])
  const [depositoPanelOpen, setDepositoPanelOpen] = useState(false)
  const [selectedSucursales, setSelectedSucursales] = useState([])
  const [sucursalPanelOpen, setSucursalPanelOpen] = useState(false)
  const [selectedTipos, setSelectedTipos] = useState([])
  const [tipoPanelOpen, setTipoPanelOpen] = useState(false)

  const producto = productos.find((p) => p.codigo === selectedCodigo) ?? productos[0]
  const ledger = useMemo(() => buildStockLedger(producto, agrupadores), [producto, agrupadores])
  const productDims = useMemo(() => dims(producto, agrupadores), [producto, agrupadores])

  const usingVariantes = ledger.esBase && showVariantes
  const data = usingVariantes ? ledger.variante : ledger.base
  const rows = useMemo(() => {
    let list = data.movimientos
    if (usingVariantes) {
      list = list.filter((m) =>
        productDims.every((d, i) => !filtros[d.master.id] || m.variante[i]?.code === filtros[d.master.id])
      )
    }
    if (selectedDepositos.length) list = list.filter((m) => selectedDepositos.includes(m.deposito))
    if (selectedSucursales.length) list = list.filter((m) => selectedSucursales.includes(m.sucursal))
    if (selectedTipos.length) list = list.filter((m) => selectedTipos.includes(m.tipo))
    if (desde) {
      const desdeDate = new Date(`${desde}T00:00:00`)
      list = list.filter((m) => parseFechaDMY(m.fecha) >= desdeDate)
    }
    if (!incluirSaldoAnterior) {
      let saldo = 0
      list = list.map((m) => {
        saldo += (m.ingreso ?? 0) - (m.egreso ?? 0)
        return { ...m, saldo }
      })
    }
    return list
  }, [data, usingVariantes, filtros, productDims, selectedDepositos, selectedSucursales, selectedTipos, desde, incluirSaldoAnterior])

  function setFiltro(agrupadorId, code) {
    setFiltros((f) => ({ ...f, [agrupadorId]: code }))
  }

  function selectArticle(codigo) {
    setSelectedCodigo(codigo)
    setShowVariantes(false)
    setFiltros({})
    setActiveTab('movimientos')
  }

  const depositosCount = new Set(rows.map((r) => r.deposito)).size
  const comprometidoCount = Math.max(1, Math.round(data.comprometido / 2))
  const acopiadoCount = data.acopiado > 0 ? Math.max(1, Math.round(data.acopiado / 2)) : 0

  const TABS = [
    { id: 'movimientos', label: 'Movimientos', count: rows.length },
    { id: 'deposito', label: 'Stock por depósito', count: depositosCount },
    { id: 'acopiado', label: 'Stock acopiado', count: acopiadoCount },
    { id: 'comprometido', label: 'Stock comprometido', count: comprometidoCount },
    ...(ledger.esBase ? [{ id: 'variante', label: 'Stock por variante', count: ledger.combos.length }] : []),
    { id: 'ubicacion', label: 'Stock por ubicación', count: depositosCount },
  ]

  function handleTabClick(tab) {
    setActiveTab(tab.id)
    if (tab.id === 'variante') setShowVariantes(true)
  }

  function selectorLabel(selectedIds, options, allLabel, plural) {
    if (selectedIds.length === 0) return allLabel
    if (selectedIds.length === 1) return options.find((o) => o.id === selectedIds[0])?.nombre ?? allLabel
    return `${selectedIds.length} ${plural}`
  }

  const depositoBtnLabel = selectorLabel(selectedDepositos, DEPOSITOS, 'Todos los depósitos', 'depósitos')
  const sucursalBtnLabel = selectorLabel(selectedSucursales, SUCURSAL_OPTIONS, 'Todas las sucursales', 'sucursales')
  const tipoBtnLabel = selectorLabel(selectedTipos, TIPOS_COMPROBANTE, 'Todos los tipos de comprobante', 'tipos de comprobante')

  return (
    <div className="va-app">
      <div className="va-tabbar">
        <button type="button" className="va-tab" onClick={onNavigateHome}>
          <span className="va-dot" /> Inicio
        </button>
        <button type="button" className="va-tab is-active" onClick={onNavigateHome}>
          <span className="va-dot" /> Fichas de Stock
          <span className="va-tab-close" onClick={(e) => { e.stopPropagation(); onNavigateHome?.() }}>
            <IconX size={11} stroke={2} />
          </span>
        </button>
      </div>

      <div className="va-main">
        <div className="st-selector">
          <div className="va-search" style={{ width: '100%' }}>
            <IconSearch size={16} stroke={1.6} className="va-ico" />
            <select
              className="va-input"
              style={{ paddingLeft: 38, appearance: 'none' }}
              value={selectedCodigo}
              onChange={(e) => selectArticle(e.target.value)}
            >
              {productos.map((p) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.codigo} — {p.descripcion}{p.variantes.seleccion.length > 0 ? ' (artículo base)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="st-header-card">
          <div className="st-header-ico"><IconBox size={20} stroke={1.6} /></div>
          <div className="st-header-info">
            <div className="st-header-name">{producto.descripcion}</div>
            <div className="st-header-meta">
              <span>{producto.codigo} · {producto.familia || 'Sin familia'}</span>
              {ledger.esBase && (
                <>
                  <span className="st-badge st-badge-base">ARTÍCULO BASE</span>
                  <span className="st-badge st-badge-variantes">{ledger.combos.length} VARIANTES</span>
                </>
              )}
            </div>
          </div>
          <button type="button" className="va-btn-icon" title="Colapsar" aria-label="Colapsar">
            <IconChevronsLeft size={16} stroke={1.6} />
          </button>
        </div>

        {ledger.esBase && (
          <div className="st-toggle-row">
            <label className="va-toggle" style={{ marginRight: 0 }}>
              <input
                type="checkbox"
                checked={showVariantes}
                onChange={(e) => { setShowVariantes(e.target.checked); setFiltros({}) }}
              />
              <span className="va-track" />
            </label>
            <div className="st-toggle-copy">
              <div className="st-toggle-title">Stock por variantes</div>
              <div className="st-toggle-sub">
                {showVariantes ? 'Elegí color y talle para filtrar los movimientos' : 'Estás viendo el stock del producto base'}
              </div>
            </div>
            <div className="st-toggle-value">
              {showVariantes ? <>Variantes: <b>{fmt(ledger.variante.stockTotal)} UN</b></> : <>Base: <b>{fmt(ledger.base.stockTotal)} UN</b></>}
            </div>
          </div>
        )}

        {usingVariantes && productDims.length > 0 && (
          <div className="st-variant-filter">
            <div className="st-variant-filter-head">
              <span className="st-vf-icon">V</span>
              Filtrar por variante
              <span className="muted">· {productDims.map((d) => d.master.name).join(' / ')} · el stock propio del base queda fuera del cálculo</span>
            </div>
            {productDims.map((d) => (
              <div className="st-vf-row" key={d.master.id}>
                <span className="st-vf-label">{d.master.name}</span>
                <div className="st-vf-chips">
                  <button
                    type="button"
                    className={`st-vf-chip ${!filtros[d.master.id] ? 'is-active' : ''}`}
                    onClick={() => setFiltro(d.master.id, null)}
                  >
                    Todos
                  </button>
                  {d.values.map((v) => (
                    <button
                      type="button"
                      key={v.code}
                      className={`st-vf-chip ${filtros[d.master.id] === v.code ? 'is-active' : ''}`}
                      onClick={() => setFiltro(d.master.id, v.code)}
                    >
                      {v.swatch ? <span className="st-vf-sw" style={{ background: v.swatch }} /> : null}
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="st-kpi-row">
          <div className="st-kpi-card st-kpi-total">
            <div className="st-kpi-label">Stock total</div>
            <div className="st-kpi-value">{fmt(data.stockTotal)}</div>
            <div className="st-kpi-sub">UN · todos los depósitos</div>
          </div>
          <div className="st-kpi-card st-kpi-disponible">
            <div className="st-kpi-label">Disponible</div>
            <div className="st-kpi-value">{fmt(data.disponible)}</div>
            <div className="st-kpi-sub">Sobre el mínimo</div>
          </div>
          <div className="st-kpi-card st-kpi-comprometido">
            <div className="st-kpi-label">Comprometido</div>
            <div className="st-kpi-value">{fmt(data.comprometido)}</div>
            <div className="st-kpi-sub">{comprometidoCount} pedidos abiertos</div>
          </div>
          <div className="st-kpi-card st-kpi-acopiado">
            <div className="st-kpi-label">Acopiado</div>
            <div className="st-kpi-value">{fmt(data.acopiado)}</div>
            <div className="st-kpi-sub">En acopio</div>
          </div>
          <div className="st-kpi-card st-kpi-transito">
            <div className="st-kpi-label">En tránsito</div>
            <div className="st-kpi-value">{fmt(data.enTransito)}</div>
            <div className="st-kpi-sub">{data.enTransito > 0 ? 'Transferencia activa' : 'Ninguna transferencia'}</div>
          </div>
        </div>

        <div className="st-filter-row">
          <label className="st-filter-date">
            <IconCalendar size={14} stroke={1.6} />
            <span className="st-filter-date-label">Desde</span>
            <input
              type="date"
              className="st-filter-date-input"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </label>
          <button type="button" className="st-filter-btn" onClick={() => setDepositoPanelOpen(true)}>
            <IconBuildingWarehouse size={14} stroke={1.6} />
            {depositoBtnLabel}
            <IconChevronDown size={12} stroke={1.8} />
          </button>
          <button type="button" className="st-filter-btn" onClick={() => setSucursalPanelOpen(true)}>
            <IconMapPin size={14} stroke={1.6} />
            {sucursalBtnLabel}
            <IconChevronDown size={12} stroke={1.8} />
          </button>
          <button type="button" className="st-filter-btn" onClick={() => setTipoPanelOpen(true)}>
            <IconReceipt2 size={14} stroke={1.6} />
            {tipoBtnLabel}
            <IconChevronDown size={12} stroke={1.8} />
          </button>
          <div className="st-filter-spacer" />
          <label className="va-toggle st-saldo-toggle">
            <input
              type="checkbox"
              checked={incluirSaldoAnterior}
              onChange={(e) => setIncluirSaldoAnterior(e.target.checked)}
            />
            <span className="va-track" />
            <span>Incluir saldo anterior</span>
          </label>
          <button type="button" className="va-btn-icon" title="Actualizar" aria-label="Actualizar"><IconRefresh size={15} stroke={1.6} /></button>
        </div>

        <div className="st-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`st-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.label} <span className="st-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="va-card st-table-card">
          <div className="st-table-head">
            <span>Movimientos · <b>{rows.length}</b> registros{usingVariantes ? <span className="muted"> · todas las variantes, sin el base</span> : null}</span>
            <span className="muted">Saldo acumulado según el alcance elegido</span>
          </div>
          <div className="va-card-scroll">
            <table className="va-grid">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Suc.</th>
                  <th>Comprobante</th>
                  <th>Descripción</th>
                  {usingVariantes && <th>Variante</th>}
                  <th style={{ textAlign: 'right' }}>Ingreso</th>
                  <th style={{ textAlign: 'right' }}>Egreso</th>
                  <th style={{ textAlign: 'right' }}>Saldo</th>
                  <th>Dep</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => (
                  <tr key={i}>
                    <td className="st-num">{m.fecha}</td>
                    <td className="st-num">{m.hora}</td>
                    <td><TypePill tipo={m.tipo} /></td>
                    <td>{m.sucursal}</td>
                    <td className="pr-cell-muted">{m.comprobante}</td>
                    <td className="pr-cell-muted">{m.descripcion}</td>
                    {usingVariantes && (
                      <td>
                        {m.variante ? (
                          <span className="st-variant-cell">
                            {m.variante.map((v) => (
                              <span key={v.code} className="st-variant-chip" title={v.name}>
                                {v.swatch ? <span className="st-vf-sw" style={{ background: v.swatch }} /> : null}
                                {v.name}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </td>
                    )}
                    <td className="st-num" style={{ textAlign: 'right' }}>{m.ingreso != null ? <span className="st-ingreso">+ {fmt(m.ingreso)}</span> : null}</td>
                    <td className="st-num" style={{ textAlign: 'right' }}>{m.egreso != null ? <span className="st-egreso">- {fmt(m.egreso)}</span> : null}</td>
                    <td className="st-saldo" style={{ textAlign: 'right' }}>{fmt(m.saldo)}</td>
                    <td>{m.deposito}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={usingVariantes ? 11 : 10} className="va-empty-cell">No hay movimientos para el filtro seleccionado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {depositoPanelOpen && (
        <FiltroSelectorPanel
          icon={<IconBuildingWarehouse size={18} stroke={1.6} />}
          eyebrow="Filtrar por"
          title="Depósito"
          columns={[
            { key: 'codigo', label: 'Código', width: 70 },
            { key: 'nombre', label: 'Nombre' },
            { key: 'meta', label: 'Dirección' },
          ]}
          rows={DEPOSITOS}
          selectedIds={selectedDepositos}
          onApply={setSelectedDepositos}
          onClose={() => setDepositoPanelOpen(false)}
        />
      )}

      {sucursalPanelOpen && (
        <FiltroSelectorPanel
          icon={<IconMapPin size={18} stroke={1.6} />}
          eyebrow="Filtrar por"
          title="Sucursal"
          columns={[
            { key: 'codigo', label: 'Código', width: 70 },
            { key: 'nombre', label: 'Sucursal' },
          ]}
          rows={SUCURSAL_OPTIONS}
          selectedIds={selectedSucursales}
          onApply={setSelectedSucursales}
          onClose={() => setSucursalPanelOpen(false)}
        />
      )}

      {tipoPanelOpen && (
        <FiltroSelectorPanel
          icon={<IconReceipt2 size={18} stroke={1.6} />}
          eyebrow="Filtrar por"
          title="Tipos de comprobante"
          columns={[
            { key: 'nombre', label: 'Tipo de comprobante' },
          ]}
          rows={TIPOS_COMPROBANTE}
          selectedIds={selectedTipos}
          onApply={setSelectedTipos}
          onClose={() => setTipoPanelOpen(false)}
        />
      )}
    </div>
  )
}

function TypePill({ tipo }) {
  const cls = {
    'FC-COMPRA': 'st-type-compra',
    'FC-VENTA': 'st-type-venta',
    AJUSTE: 'st-type-ajuste',
    TRANSF: 'st-type-transf',
  }[tipo] || 'st-type-ajuste'
  return <span className={`st-type-pill ${cls}`}>{tipo}</span>
}
