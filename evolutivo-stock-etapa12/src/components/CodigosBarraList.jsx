import { useMemo, useState } from 'react'
import { IconSearch, IconDotsVertical, IconEye, IconPencil, IconPlus, IconSettings, IconFilter } from '@tabler/icons-react'
import { ARTICULOS_INICIALES, FORMULAS_INICIALES } from '../data/codigosBarra'
import TipoCodigoBadge from './TipoCodigoBadge'
import CodigoBarraPanel from './CodigoBarraPanel'
import FiltrosCodigosBarraPanel, { filtrosVacios, hayFiltrosActivos } from './FiltrosCodigosBarraPanel'
import GeneracionMasivaPanel from './GeneracionMasivaPanel'
import ImportarCodigosPanel from './ImportarCodigosPanel'
import styles from './CodigosBarraList.module.css'

function tiposAsignados(articulo) {
  const counts = new Map()
  articulo.codigos.forEach((c) => counts.set(c.tipo, (counts.get(c.tipo) || 0) + 1))
  return Array.from(counts.entries())
}

function RowMenu({ articulo, openMenuId, setOpenMenuId, onVisualizar, onEditar, onAgregar }) {
  const isOpen = openMenuId === articulo.id
  const close = () => setOpenMenuId(null)
  return (
    <div className={styles.menuContainer}>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : articulo.id) }}
        title="Opciones"
        aria-label={`Opciones para ${articulo.codigo}`}
      >
        <IconDotsVertical size={18} />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onVisualizar(articulo); close() }}>
            <IconEye size={15} className={styles.dropdownIcon} />
            Visualizar
          </button>
          <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onEditar(articulo); close() }}>
            <IconPencil size={15} className={styles.dropdownIcon} />
            Editar
          </button>
          <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); onAgregar(articulo); close() }}>
            <IconPlus size={15} className={styles.dropdownIcon} />
            Agregar Código
          </button>
        </div>
      )}
    </div>
  )
}

const ENTIDADES = {
  articulo: { label: 'artículo', labelPlural: 'artículos', tabLabel: 'Artículos', femenino: false },
  formula: { label: 'fórmula', labelPlural: 'fórmulas', tabLabel: 'Fórmulas', femenino: true },
}

export default function CodigosBarraList() {
  const [entidadTipo, setEntidadTipo] = useState('articulo')
  const [articulos, setArticulos] = useState(ARTICULOS_INICIALES)
  const [formulas, setFormulas] = useState(FORMULAS_INICIALES)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtros, setFiltros] = useState(filtrosVacios)
  const [showFiltros, setShowFiltros] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [panelState, setPanelState] = useState(null)
  const [showGeneracionMasiva, setShowGeneracionMasiva] = useState(false)
  const [showImportarCodigos, setShowImportarCodigos] = useState(false)

  const esFormula = entidadTipo === 'formula'
  const items = esFormula ? formulas : articulos
  const entidad = ENTIDADES[entidadTipo]

  const cambiarEntidadTipo = (tipo) => {
    setEntidadTipo(tipo)
    setSearchTerm('')
    setFiltros(filtrosVacios())
    setOpenMenuId(null)
  }

  const filtrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return items.filter((a) => {
      if (term && !`${a.codigo} ${a.descripcion}`.toLowerCase().includes(term)) return false
      if (esFormula) return true
      if (filtros.sucursal && a.sucursal !== filtros.sucursal) return false
      if (filtros.familia && a.familia !== filtros.familia) return false
      if (filtros.proveedor && a.proveedor !== filtros.proveedor) return false
      if (filtros.grupo && a.grupo !== filtros.grupo) return false
      if (filtros.marca && a.marca !== filtros.marca) return false
      if (filtros.categoria && a.categoria !== filtros.categoria) return false
      if (filtros.codigoFabricante && !a.codigoFabricante?.toLowerCase().includes(filtros.codigoFabricante.trim().toLowerCase())) return false
      if (filtros.soloSinCodigo && a.codigos.length > 0) return false
      return true
    })
  }, [items, searchTerm, filtros, esFormula])

  const abrirVisualizar = (item) => setPanelState({ entidadTipo, itemId: item.id, layer: 'detalle', soloLectura: true })
  const abrirEditar = (item) => setPanelState({ entidadTipo, itemId: item.id, layer: 'detalle', soloLectura: false })
  const abrirAgregar = (item) => setPanelState({ entidadTipo, itemId: item.id, layer: 'agregar', soloLectura: false })
  const cerrarPanel = () => setPanelState(null)

  const setterPara = (tipo) => (tipo === 'formula' ? setFormulas : setArticulos)

  const agregarCodigo = (itemId, codigo) => {
    setterPara(panelState.entidadTipo)((prev) => prev.map((a) => (a.id === itemId ? { ...a, codigos: [...a.codigos, codigo] } : a)))
  }

  const eliminarCodigo = (itemId, codigoId) => {
    setterPara(panelState.entidadTipo)((prev) => prev.map((a) => (a.id === itemId ? { ...a, codigos: a.codigos.filter((c) => c.id !== codigoId) } : a)))
  }

  const agregarCodigosMasivo = (resultados) => {
    setArticulos((prev) => prev.map((a) => {
      const nuevos = resultados.filter((r) => r.articuloId === a.id).map((r) => r.codigo)
      return nuevos.length ? { ...a, codigos: [...a.codigos, ...nuevos] } : a
    }))
  }

  const itemPanel = panelState
    ? (panelState.entidadTipo === 'formula' ? formulas : articulos).find((a) => a.id === panelState.itemId)
    : null

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerCard}>
        <div>
          <h1 className={styles.title}>Gestión de códigos de barra</h1>
          <p className={styles.subtitle}>Configurá los estándares de código y asignalos a los artículos o a las fórmulas de pintura.</p>
        </div>
      </div>

      <div className={styles.segmented}>
        {Object.entries(ENTIDADES).map(([tipo, cfg]) => (
          <button
            key={tipo}
            type="button"
            className={`${styles.segmentedBtn} ${entidadTipo === tipo ? styles.segmentedBtnActive : ''}`}
            onClick={() => cambiarEntidadTipo(tipo)}
          >
            {cfg.tabLabel}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <IconSearch size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o descripción"
            className={styles.searchInput}
            aria-label={`Buscar ${entidad.label}`}
          />
        </label>

        {!esFormula && (
          <button
            type="button"
            className={`${styles.filterBtn} ${hayFiltrosActivos(filtros) ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFiltros(true)}
            title="Filtros"
            aria-label="Filtros"
          >
            <IconFilter size={18} />
            {hayFiltrosActivos(filtros) && <span className={styles.filterDot} />}
          </button>
        )}

        {!esFormula && (
          <div className={styles.toolbarActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => setShowImportarCodigos(true)}>
              Importar Códigos
            </button>

            <button type="button" className={styles.secondaryBtn} onClick={() => setShowGeneracionMasiva(true)}>
              Generación masiva
            </button>
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Tipos de código asignados</th>
              <th className={styles.menuHeaderCell}><IconSettings size={16} /></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No se encontraron {entidad.labelPlural}</td>
              </tr>
            ) : (
              filtrados.map((item) => (
                <tr key={item.id} className={styles.clickableRow} onClick={() => abrirEditar(item)}>
                  <td className={styles.codigoCell}>{item.codigo}</td>
                  <td>{item.descripcion}</td>
                  <td>
                    <div className={styles.badgeRow}>
                      {tiposAsignados(item).length === 0 ? (
                        <span className={styles.sinCodigo}>Sin código</span>
                      ) : (
                        tiposAsignados(item).map(([tipo, count]) => (
                          <TipoCodigoBadge key={tipo} tipo={tipo} count={count} />
                        ))
                      )}
                    </div>
                  </td>
                  <td className={styles.menuCell} onClick={(e) => e.stopPropagation()}>
                    <RowMenu
                      articulo={item}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onVisualizar={abrirVisualizar}
                      onEditar={abrirEditar}
                      onAgregar={abrirAgregar}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {itemPanel && (
        <CodigoBarraPanel
          articulo={itemPanel}
          articulos={[...articulos, ...formulas]}
          initialLayer={panelState.layer}
          soloLectura={panelState.soloLectura}
          unidadUnica={panelState.entidadTipo === 'formula'}
          entidadLabel={ENTIDADES[panelState.entidadTipo].label}
          entidadFemenino={ENTIDADES[panelState.entidadTipo].femenino}
          onClose={cerrarPanel}
          onAddCodigo={agregarCodigo}
          onDeleteCodigo={eliminarCodigo}
        />
      )}

      {showFiltros && !esFormula && (
        <FiltrosCodigosBarraPanel
          filtros={filtros}
          onApply={setFiltros}
          onClose={() => setShowFiltros(false)}
        />
      )}

      {showGeneracionMasiva && (
        <GeneracionMasivaPanel
          articulos={articulos}
          onGenerar={agregarCodigosMasivo}
          onClose={() => setShowGeneracionMasiva(false)}
        />
      )}

      {showImportarCodigos && (
        <ImportarCodigosPanel
          articulos={articulos}
          onImportar={agregarCodigosMasivo}
          onClose={() => setShowImportarCodigos(false)}
        />
      )}
    </div>
  )
}
