function makeDeposito(num) {
  const d = `dep-${num}`
  return {
    id: d, codigo: `D${num}`, nombre: `Depósito ${num}`, tipo: 'deposito',
    children: [1, 2].map(z => ({
      id: `${d}-z${z}`, codigo: `Z${z}`, nombre: `Zona ${z}`, tipo: 'zona',
      children: [1, 2].map(p => ({
        id: `${d}-z${z}-p${p}`, codigo: `P${p}`, nombre: `Pasillo ${p}`, tipo: 'pasillo',
        children: [1, 2].map(c => ({
          id: `${d}-z${z}-p${p}-c${c}`,
          codigo: `${num}${z}${p}${c}`,
          nombre: `Casillero ${c}`,
          tipo: 'casillero',
          children: []
        }))
      }))
    }))
  }
}

export const UBICACIONES_DATA = [1, 2, 3, 4, 5].map(makeDeposito)

export function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function getAncestors(nodes, targetId, path = []) {
  for (const node of nodes) {
    const next = [...path, node]
    if (node.id === targetId) return next
    if (node.children?.length) {
      const found = getAncestors(node.children, targetId, next)
      if (found) return found
    }
  }
  return null
}

export function getLeafIds(node) {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(getLeafIds)
}

export function getAllLeaves(nodes) {
  const leaves = []
  for (const node of nodes) {
    if (!node.children?.length) leaves.push(node)
    else leaves.push(...getAllLeaves(node.children))
  }
  return leaves
}
