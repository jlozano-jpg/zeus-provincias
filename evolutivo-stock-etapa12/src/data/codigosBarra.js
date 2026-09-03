export const FAMILIAS = ['Ferretería', 'Eléctrico', 'Farmacia', 'EPP']

export const PROVEEDORES = [
  'Retroboros SA',
  'Distribuidora del Sur SA',
  'Droguería Central',
  'Seguridad Total SA',
]

export const SUCURSALES = ['Sucursal Central', 'Sucursal Norte', 'Sucursal Sur']

export const GRUPOS = ['Insumos', 'Consumo', 'Repuestos']

export const MARCAS = ['Marca A', 'Marca B', 'Marca C', 'Marca D']

export const CATEGORIAS = ['Categoría 1', 'Categoría 2', 'Categoría 3']

export const TIPOS_CODIGO = [
  { value: 'GTIN-8', label: 'GTIN-8', digits: 8, cantidadFija: 1, color: '#3370AC' },
  { value: 'GTIN-13', label: 'GTIN-13', digits: 13, cantidadFija: 1, color: '#7f72ba' },
  { value: 'GTIN-14', label: 'GTIN-14', digits: 14, color: '#00A3A3' },
  { value: 'GS1-128', label: 'GS1-128', requiereLotes: true, color: '#C87F0A' },
  { value: 'MANUAL', label: 'code-128', color: '#64748b' },
]

export function tipoInfo(value) {
  return TIPOS_CODIGO.find((t) => t.value === value)
}

export const TIPOS_CODIGO_SIN_GTIN8 = TIPOS_CODIGO.filter((t) => t.value !== 'GTIN-8')

export const DESCRIPCION_TIPO = {
  'GTIN-13': '13 dígitos. Identifica de forma única un artículo para venta al público.',
  'GTIN-14': '14 dígitos. Sirve para referenciar variantes de cantidad de un mismo artículo, como cajas o packs.',
  'GS1-128': 'Aplica solo a artículos con gestión de lotes: combina el código del artículo con el lote y su vencimiento. Los artículos sin lotes quedan excluidos automáticamente.',
  MANUAL: 'Código interno generado por Zeus; no sigue un estándar GS1.',
}

export const CATEGORIAS_FORMULA = [
  { value: 'hogar-obra', label: 'Fórmulas Hogar y Obra' },
  { value: 'automotor', label: 'Fórmulas Automotor' },
]

// Cada fila es una combinación fórmula + base (una fórmula puede tener varias
// bases/presentaciones). El código de barra no se asigna a mano: es siempre
// la concatenación de `formula` + `base`.
export const FORMULAS_INICIALES = [
  {
    id: 'FRM-0001',
    formula: 'SOLAN-0002',
    base: 'AFRVTXNM30',
    descripcion: 'Italflex RAL 9023 x 30',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0002',
    formula: 'CI0479',
    base: 'SIC3E1BB01',
    descripcion: 'CI 0479 - CB Multiaccion 3en1 Brillante B 0,9LT',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0003',
    formula: 'CI0479',
    base: 'SIC3E1BB04',
    descripcion: 'CI 0479 - CB Multiaccion 3en1 Brillante B 3,6LT',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0004',
    formula: 'CI0479',
    base: 'SIC3E1SBB01',
    descripcion: 'CI 0479 - CB Multiaccion 3en1 Sat B 0,9LT',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0005',
    formula: 'CI0479',
    base: 'SIC3E1SBB04',
    descripcion: 'CI 0479 - CB Multiaccion 3en1 Sat B 3,6LT',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0006',
    formula: 'CI0479',
    base: 'SICCFPBB01',
    descripcion: 'CI 0479 - Casaseca Frentes Poliur. Base B 1,18 KGS',
    categoria: 'hogar-obra',
  },
  {
    id: 'FRM-0007',
    formula: 'CI0479',
    base: 'SICPFHRBB01',
    descripcion: 'CI 0479 - CB Performance Hidrorepelente B 0,9LT',
    categoria: 'hogar-obra',
  },
  // Las fórmulas Automotor no tienen base: cada una es una única fila.
  {
    id: 'FRM-0101',
    formula: 'AUT-3050',
    descripcion: 'Repintado Automotor Negro Brillante',
    categoria: 'automotor',
  },
  {
    id: 'FRM-0102',
    formula: 'AUT-3112',
    descripcion: 'Repintado Automotor Blanco Mate',
    categoria: 'automotor',
  },
  {
    id: 'FRM-0103',
    formula: 'AUT-4201',
    descripcion: 'Repintado Automotor Gris Metalizado',
    categoria: 'automotor',
  },
]

export const MOCK_EXCEL_SKUS = ['ART-001', 'ART-030', 'SKU-999']

export const ARTICULOS_INICIALES = [
  {
    id: 'ART-001',
    codigo: 'ART-001',
    descripcion: 'Tornillo hexagonal 1/2"',
    familia: 'Ferretería',
    proveedor: 'Retroboros SA',
    sucursal: 'Sucursal Central',
    grupo: 'Insumos',
    marca: 'Marca A',
    categoria: 'Categoría 1',
    codigoFabricante: 'FAB-1001',
    manejaLotes: false,
    lotes: [],
    codigos: [
      { id: 'c1', tipo: 'GTIN-13', codigo: '7791234567890', cantidad: 1 },
    ],
  },
  {
    id: 'ART-002',
    codigo: 'ART-002',
    descripcion: 'Tuerca autoblocante M12',
    familia: 'Ferretería',
    proveedor: 'Retroboros SA',
    sucursal: 'Sucursal Central',
    grupo: 'Insumos',
    marca: 'Marca A',
    categoria: 'Categoría 1',
    codigoFabricante: 'FAB-1002',
    manejaLotes: false,
    lotes: [],
    codigos: [],
  },
  {
    id: 'ART-010',
    codigo: 'ART-010',
    descripcion: 'Cable unipolar 2.5mm',
    familia: 'Eléctrico',
    proveedor: 'Distribuidora del Sur SA',
    sucursal: 'Sucursal Norte',
    grupo: 'Consumo',
    marca: 'Marca B',
    categoria: 'Categoría 2',
    codigoFabricante: 'FAB-2010',
    manejaLotes: false,
    lotes: [],
    codigos: [
      { id: 'c2', tipo: 'GTIN-14', codigo: '17791234567897', cantidad: 10 },
      { id: 'c3', tipo: 'GTIN-14', codigo: '17791234567904', cantidad: 25 },
      { id: 'c4', tipo: 'GTIN-13', codigo: '7791234567906', cantidad: 1 },
    ],
  },
  {
    id: 'ART-020',
    codigo: 'ART-020',
    descripcion: 'Amoxicilina 500mg x30',
    familia: 'Farmacia',
    proveedor: 'Droguería Central',
    sucursal: 'Sucursal Norte',
    grupo: 'Consumo',
    marca: 'Marca C',
    categoria: 'Categoría 3',
    codigoFabricante: 'FAB-3020',
    manejaLotes: true,
    lotes: [
      { id: 'L1', lote: 'L2024-08', vencimiento: '2026-08-31' },
      { id: 'L2', lote: 'L2024-11', vencimiento: '2026-11-30' },
    ],
    codigos: [
      { id: 'c5', tipo: 'GTIN-13', codigo: '7791234567913', cantidad: 1 },
      { id: 'c6', tipo: 'GS1-128', codigo: '00177912345679135310241231', cantidad: 30, loteId: 'L1', vencimiento: '2026-08-31' },
    ],
  },
  {
    id: 'ART-030',
    codigo: 'ART-030',
    descripcion: 'Guante nitrilo talle M',
    familia: 'EPP',
    proveedor: 'Seguridad Total SA',
    sucursal: 'Sucursal Sur',
    grupo: 'Repuestos',
    marca: 'Marca D',
    categoria: 'Categoría 2',
    codigoFabricante: 'FAB-4030',
    manejaLotes: false,
    lotes: [],
    codigos: [
      { id: 'c7', tipo: 'MANUAL', codigo: 'INT-00456', cantidad: 12 },
    ],
  },
]
