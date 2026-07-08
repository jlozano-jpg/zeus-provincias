import { useMemo, useState } from 'react'
import { IconSearch, IconDotsVertical, IconEye, IconPencil, IconPlus, IconBarcode, IconFilter } from '@tabler/icons-react'
import { ARTICULOS_INICIALES } from '../data/codigosBarra'
import TipoCodigoBadge from './TipoCodigoBadge'
import CodigoBarraPanel from './CodigoBarraPanel'
import FiltrosCodigosBarraPanel, { filtrosVacios, hayFiltrosActivos } from './FiltrosCodigosBarraPanel'
import GeneracionMasivaPanel from './GeneracionMasivaPanel'
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

export default function CodigosBarraList() {
  const [articulos, setArticulos] = useState(ARTICULOS_INICIALES)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtros, setFiltros] = useState(filtrosVacios)
  const [showFiltros, setShowFiltros] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [panelState, setPanelState] = useState(null)
  const [showGeneracionMasiva, setShowGeneracionMasiva] = useState(false)

  const filtrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return articulos.filter((a) => {
      if (term && !`${a.codigo} ${a.descripcion}`.toLowerCase().includes(term)) return false
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
  }, [articulos, searchTerm, filtros])

  const abrirVisualizar = (articulo) => setPanelState({ articuloId: articulo.id, layer: 'detalle', soloLectura: true })
  const abrirEditar = (articulo) => setPanelState({ articuloId: articulo.id, layer: 'detalle', soloLectura: false })
  const abrirAgregar = (articulo) => setPanelState({ articuloId: articulo.id, layer: 'agregar', soloLectura: false })
  const cerrarPanel = () => setPanelState(null)

  const agregarCodigo = (articuloId, codigo) => {
    setArticulos((prev) => prev.map((a) => (a.id === articuloId ? { ...a, codigos: [...a.codigos, codigo] } : a)))
  }

  const eliminarCodigo = (articuloId, codigoId) => {
    setArticulos((prev) => prev.map((a) => (a.id === articuloId ? { ...a, codigos: a.codigos.filter((c) => c.id !== codigoId) } : a)))
  }

  const agregarCodigosMasivo = (resultados) => {
    setArticulos((prev) => prev.map((a) => {
      const nuevos = resultados.filter((r) => r.articuloId === a.id).map((r) => r.codigo)
      return nuevos.length ? { ...a, codigos: [...a.codigos, ...nuevos] } : a
    }))
  }

  const articuloPanel = panelState ? articulos.find((a) => a.id === panelState.articuloId) : null

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerCard}>
        <div>
          <h1 className={styles.title}>Gestión de códigos de barra</h1>
          <p className={styles.subtitle}>Configurá los estándares de código y asignalos a los artículos.</p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={() => setShowGeneracionMasiva(true)}>
          Generación masiva
        </button>
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
            aria-label="Buscar artículo"
          />
        </label>

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
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Tipos de código asignados</th>
              <th className={styles.menuHeaderCell}><IconBarcode size={16} /></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No se encontraron artículos</td>
              </tr>
            ) : (
              filtrados.map((articulo) => (
                <tr key={articulo.id} className={styles.clickableRow} onClick={() => abrirEditar(articulo)}>
                  <td className={styles.codigoCell}>{articulo.codigo}</td>
                  <td>{articulo.descripcion}</td>
                  <td>
                    <div className={styles.badgeRow}>
                      {tiposAsignados(articulo).length === 0 ? (
                        <span className={styles.sinCodigo}>Sin código</span>
                      ) : (
                        tiposAsignados(articulo).map(([tipo, count]) => (
                          <TipoCodigoBadge key={tipo} tipo={tipo} count={count} />
                        ))
                      )}
                    </div>
                  </td>
                  <td className={styles.menuCell} onClick={(e) => e.stopPropagation()}>
                    <RowMenu
                      articulo={articulo}
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

      {articuloPanel && (
        <CodigoBarraPanel
          articulo={articuloPanel}
          articulos={articulos}
          initialLayer={panelState.layer}
          soloLectura={panelState.soloLectura}
          onClose={cerrarPanel}
          onAddCodigo={agregarCodigo}
          onDeleteCodigo={eliminarCodigo}
        />
      )}

      {showFiltros && (
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
    </div>
  )
}
