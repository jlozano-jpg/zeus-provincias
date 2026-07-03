import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './OperariosList.module.css'

function calcAntiguedad(fechaStr) {
  if (!fechaStr) return '--'
  const start = new Date(fechaStr)
  if (Number.isNaN(start.getTime())) return '--'
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) { years -= 1; months += 12 }
  if (years < 0) return '--'
  if (years === 0 && months === 0) return '< 1m'
  if (years === 0) return `${months}m`
  return `${years}a ${months}m`
}

function parseTimeToSeconds(value) {
  if (!value) return null
  if (typeof value === 'number') return value
  const match = String(value).toLowerCase().match(/(\d+(?:\.\d+)?)\s*(m|min|s|seg|segundos)?/)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2] || 's'
  if (unit.includes('m') || unit.includes('min')) return amount * 60
  return amount
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin información'
  const value = new Date(dateStr)
  if (Number.isNaN(value.getTime())) return 'Sin información'
  return value.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildHeroCards(operarios) {
  const preparadores = operarios.filter((operario) => operario.preparador)
  const controladores = operarios.filter((operario) => operario.controlador)

  const formatOperator = (operario) => (operario ? `${operario.code} · ${operario.name}` : '--')

  const bestPreparadorByArticles = preparadores.reduce((best, current) => {
    const bestValue = Number(best?.articulosPromedio || 0)
    const currentValue = Number(current.articulosPromedio || 0)
    return currentValue > bestValue ? current : best
  }, null)

  const bestPreparadorByTime = preparadores.reduce((best, current) => {
    const bestValue = parseTimeToSeconds(best?.tiempoPromedio) || Number.MAX_SAFE_INTEGER
    const currentValue = parseTimeToSeconds(current.tiempoPromedio) || Number.MAX_SAFE_INTEGER
    return currentValue < bestValue ? current : best
  }, null)

  const bestPreparadorByAntiguedad = preparadores.reduce((best, current) => {
    const bestDate = new Date(best?.inicioActividades || 0)
    const currentDate = new Date(current.inicioActividades || 0)
    return currentDate > bestDate ? current : best
  }, null)

  const bestControladorByArticles = controladores.reduce((best, current) => {
    const bestValue = Number(best?.articulosPromedioControl || 0)
    const currentValue = Number(current.articulosPromedioControl || 0)
    return currentValue > bestValue ? current : best
  }, null)

  const bestControladorByTime = controladores.reduce((best, current) => {
    const bestValue = parseTimeToSeconds(best?.tiempoPromedioControl) || Number.MAX_SAFE_INTEGER
    const currentValue = parseTimeToSeconds(current.tiempoPromedioControl) || Number.MAX_SAFE_INTEGER
    return currentValue < bestValue ? current : best
  }, null)

  const bestControladorByAntiguedad = controladores.reduce((best, current) => {
    const bestDate = new Date(best?.inicioActividades || 0)
    const currentDate = new Date(current.inicioActividades || 0)
    return currentDate > bestDate ? current : best
  }, null)

  const preparadorCards = [
    {
      title: 'Mayor promedio de artículos',
      icon: '📦',
      value: preparadores.length > 0 ? `${Math.max(...preparadores.map((op) => Number(op.articulosPromedio || 0)))} art.` : '--',
      operator: preparadores.length > 0 ? formatOperator(bestPreparadorByArticles) : '--',
      average: preparadores.length > 0 ? `Promedio equipo: ${Math.round(preparadores.reduce((sum, op) => sum + Number(op.articulosPromedio || 0), 0) / preparadores.length)} art.` : 'Promedio equipo: --',
      accent: 'teal',
      operarioRef: bestPreparadorByArticles,
      description: 'Prepara en promedio la mayor cantidad de artículos por preparación.',
    },
    {
      title: 'Mejor tiempo promedio',
      icon: '⏱️',
      value: preparadores.length > 0 ? `${Math.min(...preparadores.map((op) => parseTimeToSeconds(op.tiempoPromedio) || Number.MAX_SAFE_INTEGER)).toString().replace(/\.0$/, '')} s` : '--',
      operator: preparadores.length > 0 ? formatOperator(bestPreparadorByTime) : '--',
      average: preparadores.length > 0 ? `Promedio equipo: ${Math.round(preparadores.reduce((sum, op) => sum + (parseTimeToSeconds(op.tiempoPromedio) || 0), 0) / preparadores.length)} s` : 'Promedio equipo: --',
      accent: 'violet',
      operarioRef: bestPreparadorByTime,
      description: 'Preparador con el menor tiempo promedio de recorrido por ubicación durante la preparación.',
    },
    {
      title: 'Mayor antigüedad',
      icon: '🧭',
      value: preparadores.length > 0 ? calcAntiguedad(preparadores.reduce((best, current) => (new Date(current.inicioActividades || 0) > new Date(best.inicioActividades || 0) ? current : best)).inicioActividades) : '--',
      operator: preparadores.length > 0 ? formatOperator(bestPreparadorByAntiguedad) : '--',
      average: preparadores.length > 0 ? `Promedio equipo: ${calcAntiguedad(preparadores[Math.floor(preparadores.length / 2)]?.inicioActividades || '')}` : 'Promedio equipo: --',
      accent: 'neutral',
      operarioRef: bestPreparadorByAntiguedad,
      description: 'Preparador con más tiempo de antigüedad en el rol, desde su inicio de actividades.',
    },
  ]

  const controladorCards = [
    {
      title: 'Mayor promedio de artículos',
      icon: '✓',
      value: controladores.length > 0 ? `${Math.max(...controladores.map((op) => Number(op.articulosPromedioControl || 0)))} art.` : '--',
      operator: controladores.length > 0 ? formatOperator(bestControladorByArticles) : '--',
      average: controladores.length > 0 ? `Promedio equipo: ${Math.round(controladores.reduce((sum, op) => sum + Number(op.articulosPromedioControl || 0), 0) / controladores.length)} art.` : 'Promedio equipo: --',
      accent: 'violet',
      operarioRef: bestControladorByArticles,
      description: 'Controla en promedio la mayor cantidad de artículos por preparación.',
    },
    {
      title: 'Mejor tiempo promedio',
      icon: '⏱️',
      value: controladores.length > 0 ? `${Math.min(...controladores.map((op) => parseTimeToSeconds(op.tiempoPromedioControl) || Number.MAX_SAFE_INTEGER)).toString().replace(/\.0$/, '')} s` : '--',
      operator: controladores.length > 0 ? formatOperator(bestControladorByTime) : '--',
      average: controladores.length > 0 ? `Promedio equipo: ${Math.round(controladores.reduce((sum, op) => sum + (parseTimeToSeconds(op.tiempoPromedioControl) || 0), 0) / controladores.length)} s` : 'Promedio equipo: --',
      accent: 'teal',
      operarioRef: bestControladorByTime,
      description: 'Controlador con el menor tiempo promedio por control realizado.',
    },
    {
      title: 'Mayor antigüedad',
      icon: '🧭',
      value: controladores.length > 0 ? calcAntiguedad(controladores.reduce((best, current) => (new Date(current.inicioActividades || 0) > new Date(best.inicioActividades || 0) ? current : best)).inicioActividades) : '--',
      operator: controladores.length > 0 ? formatOperator(bestControladorByAntiguedad) : '--',
      average: controladores.length > 0 ? `Promedio equipo: ${calcAntiguedad(controladores[Math.floor(controladores.length / 2)]?.inicioActividades || '')}` : 'Promedio equipo: --',
      accent: 'neutral',
      description: 'Controlador con más tiempo de antigüedad en el rol, desde su inicio de actividades.',
      operarioRef: bestControladorByAntiguedad,
    },
  ]

  return { preparadorCards, controladorCards }
}

export default function OperariosList({ operarios, searchTerm, onSearchChange, onView, onEdit, onCreate, onDelete, selectedOperario, onSelectOperario, onOpenAutoAssign }) {
  const [query, setQuery] = useState(searchTerm ?? '')
  const [openMenuId, setOpenMenuId] = useState(null)
  const detailRef = useRef(null)

  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return (operarios || []).filter((operario) => {
      const hayTexto = [operario.code, operario.name, operario.usuarioZeus].filter(Boolean).join(' ').toLowerCase()
      return hayTexto.includes(term)
    })
  }, [operarios, query])

  useEffect(() => {
    setQuery(searchTerm ?? '')
  }, [searchTerm])

  const selected = selectedOperario && filtered.some((operario) => operario.id === selectedOperario.id)
    ? selectedOperario
    : null

  const { preparadorCards, controladorCards } = buildHeroCards(operarios || [])

  const handleSearchChange = (value) => {
    setQuery(value)
    onSearchChange?.(value)
  }

  const handleHighlightClick = (operario) => {
    if (!operario) return
    handleSearchChange('')
    onSelectOperario?.(operario)
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const roleBadges = (operario) => {
    const badges = []
    if (operario.preparador) badges.push(<span key="prep" className={`${styles.badge} ${styles.badgePreparador}`}>Preparador</span>)
    if (operario.controlador) badges.push(<span key="ctrl" className={`${styles.badge} ${styles.badgeControlador}`}>Controlador</span>)
    return badges.length ? badges : <span className={styles.badgeNeutral}>Sin rol</span>
  }

  const kpiCards = (() => {
    if (!selected) return []
    const cards = []
    cards.push({
      title: 'Antigüedad',
      value: calcAntiguedad(selected.inicioActividades),
      description: 'Tiempo desde inicio de actividades',
      icon: '🧭',
    })
    if (selected.preparador) {
      cards.push({
        title: 'Artículos / preparación',
        value: selected.articulosPromedio != null ? `${selected.articulosPromedio} art.` : '--',
        description: 'Promedio por preparación',
        icon: '📦',
      })
      cards.push({
        title: 'Tiempo / ubicación',
        value: selected.tiempoPromedio || '--',
        description: 'Promedio de recorrido',
        icon: '⏱️',
      })
    }
    if (selected.controlador) {
      cards.push({
        title: 'Artículos / control',
        value: selected.articulosPromedioControl != null ? `${selected.articulosPromedioControl} art.` : '--',
        description: 'Promedio por control',
        icon: '✓',
      })
      cards.push({
        title: 'Tiempo / control',
        value: selected.tiempoPromedioControl || '--',
        description: 'Promedio por control',
        icon: '⏱️',
      })
    }
    return cards
  })()

  const comparisonRows = (() => {
    if (!selected) return []
    const rows = []
    const preparadoresTeam = (operarios || []).filter((op) => op.preparador)
    const controladoresTeam = (operarios || []).filter((op) => op.controlador)

    const buildRow = (label, operatorValue, operatorDisplay, teamValue, teamUnit, higherIsBetter) => {
      const maxValue = Math.max(operatorValue, teamValue, 1)
      const diff = operatorValue - teamValue
      const diffPct = teamValue !== 0 ? Math.round((diff / teamValue) * 100) : 0
      return {
        label,
        operatorValue,
        operatorDisplay,
        teamValue,
        teamDisplay: `${Number.isInteger(teamValue) ? teamValue : teamValue.toFixed(1)} ${teamUnit}`,
        operatorPct: Math.max(4, Math.round((operatorValue / maxValue) * 100)),
        teamPct: Math.max(4, Math.round((teamValue / maxValue) * 100)),
        isBetter: higherIsBetter ? diff > 0 : diff < 0,
        isEqual: diff === 0,
        diffPct: Math.abs(diffPct),
      }
    }

    if (selected.preparador) {
      const teamArticulos = preparadoresTeam.reduce((sum, op) => sum + Number(op.articulosPromedio || 0), 0) / Math.max(1, preparadoresTeam.length)
      rows.push(buildRow(
        'Artículos / preparación',
        Number(selected.articulosPromedio || 0),
        selected.articulosPromedio != null ? `${selected.articulosPromedio} art.` : '--',
        teamArticulos,
        'art.',
        true,
      ))
      const teamTiempo = preparadoresTeam.reduce((sum, op) => sum + (parseTimeToSeconds(op.tiempoPromedio) || 0), 0) / Math.max(1, preparadoresTeam.length)
      rows.push(buildRow(
        'Tiempo / ubicación',
        parseTimeToSeconds(selected.tiempoPromedio) || 0,
        selected.tiempoPromedio || '--',
        teamTiempo,
        's',
        false,
      ))
    }
    if (selected.controlador) {
      const teamArticulosControl = controladoresTeam.reduce((sum, op) => sum + Number(op.articulosPromedioControl || 0), 0) / Math.max(1, controladoresTeam.length)
      rows.push(buildRow(
        'Artículos / control',
        Number(selected.articulosPromedioControl || 0),
        selected.articulosPromedioControl != null ? `${selected.articulosPromedioControl} art.` : '--',
        teamArticulosControl,
        'art.',
        true,
      ))
      const teamTiempoControl = controladoresTeam.reduce((sum, op) => sum + (parseTimeToSeconds(op.tiempoPromedioControl) || 0), 0) / Math.max(1, controladoresTeam.length)
      rows.push(buildRow(
        'Tiempo / control',
        parseTimeToSeconds(selected.tiempoPromedioControl) || 0,
        selected.tiempoPromedioControl || '--',
        teamTiempoControl,
        's',
        false,
      ))
    }
    return rows
  })()

  return (
    <div className={styles.wrapper}>
      <header className={styles.stickyHeader}>
        <div className={styles.headerContent}>
          <div>
            <p className={styles.eyebrow}>Centro de gestión</p>
            <h1 className={styles.pageTitle}>Operadores de Stock</h1>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={onOpenAutoAssign}>
              Asignación Automática
            </button>
            <button type="button" className={styles.newBtn} onClick={onCreate}>
              Nuevo Operador
            </button>
          </div>
        </div>
      </header>

      <section className={styles.highlightSection}>
        <div className={styles.highlightColumn}>
          <div className={styles.highlightPanel}>
            <div className={styles.highlightHeader}>Preparadores</div>
            <div className={styles.highlightGrid}>
              {preparadorCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className={`${styles.highlightCard} ${styles[card.accent]}`}
                  onClick={() => handleHighlightClick(card.operarioRef)}
                  disabled={!card.operarioRef}
                  data-tooltip={card.operarioRef ? card.description : `${card.description} Sin datos disponibles.`}
                >
                  <span className={styles.highlightIcon}>{card.icon}</span>
                  <div className={styles.highlightBody}>
                    <p className={styles.highlightTitle}>{card.title}</p>
                    <p className={styles.highlightValue}>{card.value}</p>
                    <p className={styles.highlightOperator}>{card.operator}</p>
                    <p className={styles.highlightMeta}>{card.average}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.highlightColumn}>
          <div className={styles.highlightPanel}>
            <div className={styles.highlightHeader}>Controladores</div>
            <div className={styles.highlightGrid}>
              {controladorCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className={`${styles.highlightCard} ${styles[card.accent]}`}
                  onClick={() => handleHighlightClick(card.operarioRef)}
                  disabled={!card.operarioRef}
                  data-tooltip={card.operarioRef ? card.description : `${card.description} Sin datos disponibles.`}
                >
                  <span className={styles.highlightIcon}>{card.icon}</span>
                  <div className={styles.highlightBody}>
                    <p className={styles.highlightTitle}>{card.title}</p>
                    <p className={styles.highlightValue}>{card.value}</p>
                    <p className={styles.highlightOperator}>{card.operator}</p>
                    <p className={styles.highlightMeta}>{card.average}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <aside className={styles.listPanel}>
          <div className={styles.listToolbar}>
            <label className={styles.searchField}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Buscar operador"
                className={styles.searchInput}
                aria-label="Buscar operador"
              />
            </label>
          </div>

          <div className={styles.operatorList}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>No se encontraron operadores</div>
            ) : (
              filtered.map((operario) => {
                const isActive = selected?.id === operario.id
                const isMenuOpen = openMenuId === operario.id
                return (
                  <div
                    key={operario.id}
                    className={`${styles.operatorRow} ${isActive ? styles.operatorRowActive : ''}`}
                    onClick={() => onSelectOperario?.(operario)}
                  >
                    <div className={styles.operatorRowMain}>
                      <div className={styles.operatorRowHeading}>
                        <span className={styles.operatorCode}>{operario.code}</span>
                        <span className={styles.operatorName}>{operario.name}</span>
                      </div>
                      <div className={styles.operatorRowMeta}>{roleBadges(operario)}</div>
                    </div>
                    <div className={styles.operatorActions}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenMenuId(isMenuOpen ? null : operario.id)
                        }}
                        aria-label="Acciones del operador"
                      >
                        ⋮
                      </button>
                      {isMenuOpen && (
                        <div className={styles.actionMenu}>
                          <button
                            type="button"
                            className={styles.actionMenuButton}
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenMenuId(null)
                              onEdit?.(operario)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.actionMenuButton}
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenMenuId(null)
                              onDelete?.(operario)
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        <section className={styles.detailPanel} ref={detailRef}>
          {selected ? (
            <div className={styles.detailCard}>
              <div className={styles.detailHero}>
                <div className={styles.detailHeroIdentity}>
                  <div className={styles.avatarCircle}>{selected.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div>
                    <p className={styles.detailEyebrow}>Operador seleccionado</p>
                    <h2 className={styles.detailTitle}>{selected.name}</h2>
                    <div className={styles.detailCodeRow}>
                      <span className={styles.detailCode}>{selected.code}</span>
                      <div className={styles.roleGroup}>{roleBadges(selected)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Inicio de actividades</span>
                  <strong className={styles.metaValue}>{formatDate(selected.inicioActividades)}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Fecha de nacimiento</span>
                  <strong className={styles.metaValue}>{formatDate(selected.fechaNacimiento)}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Depósitos asignados</span>
                  <strong className={styles.metaValue}>{selected.depositos?.length ? selected.depositos.join(', ') : 'Sin depósitos'}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Área</span>
                  <strong className={styles.metaValue}>{selected.preparador ? (selected.area || 'Sin área') : 'No aplica'}</strong>
                </div>
              </div>

              <div className={styles.kpiGrid}>
                {kpiCards.map((card) => (
                  <div key={card.title} className={styles.kpiCard}>
                    <div className={styles.kpiIcon}>{card.icon}</div>
                    <div>
                      <p className={styles.kpiValue}>{card.value}</p>
                      <p className={styles.kpiTitle}>{card.title}</p>
                      <p className={styles.kpiDescription}>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionTitle}>Comparación con el equipo</div>
                <div className={styles.compareList}>
                  {comparisonRows.map((row) => (
                    <div key={row.label} className={styles.compareRow}>
                      <div className={styles.compareRowHeader}>
                        <p className={styles.compareLabel}>{row.label}</p>
                        {row.isEqual ? (
                          <span className={`${styles.compareDelta} ${styles.compareDeltaNeutral}`}>= promedio equipo</span>
                        ) : (
                          <span className={`${styles.compareDelta} ${row.isBetter ? styles.compareDeltaGood : styles.compareDeltaBad}`}>
                            {row.isBetter ? '▲' : '▼'} {row.diffPct}% {row.isBetter ? 'mejor' : 'peor'} que el equipo
                          </span>
                        )}
                      </div>
                      <div className={styles.compareBars}>
                        <div className={styles.compareBarLine}>
                          <span className={styles.compareBarTag}>Operador</span>
                          <div className={styles.compareBarTrack}>
                            <div className={styles.compareBarFillOperator} style={{ width: `${row.operatorPct}%` }} />
                          </div>
                          <span className={styles.compareBarValue}>{row.operatorDisplay}</span>
                        </div>
                        <div className={styles.compareBarLine}>
                          <span className={styles.compareBarTag}>Equipo</span>
                          <div className={styles.compareBarTrack}>
                            <div className={styles.compareBarFillTeam} style={{ width: `${row.teamPct}%` }} />
                          </div>
                          <span className={styles.compareBarValue}>{row.teamDisplay}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.preparador && (
                <div className={styles.sectionCard}>
                  <div className={styles.sectionTitle}>Atributos</div>
                  <div className={styles.attributeList}>
                    {selected.apto ? <span className={styles.attributeChip}>✔ Apto autoelevador</span> : <span className={styles.attributeChipMuted}>Sin atributos destacados</span>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.placeholderCard}>
              <h2 className={styles.placeholderTitle}>Seleccione un operador</h2>
              <p className={styles.placeholderText}>La ficha central mostrará su información, sus indicadores y sus atributos.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
