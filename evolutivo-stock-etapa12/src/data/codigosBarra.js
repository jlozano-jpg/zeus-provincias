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
  { value: 'GTIN-128', label: 'GTIN-128', requiereLotes: true, color: '#C87F0A' },
  { value: 'MANUAL', label: 'Código manual/interno', color: '#64748b' },
]

export function tipoInfo(value) {
  return TIPOS_CODIGO.find((t) => t.value === value)
}

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
      { id: 'c6', tipo: 'GTIN-128', codigo: '00177912345679135310241231', cantidad: 30, loteId: 'L1', vencimiento: '2026-08-31' },
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
