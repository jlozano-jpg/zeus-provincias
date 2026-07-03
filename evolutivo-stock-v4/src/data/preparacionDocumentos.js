export const PEDIDOS = [
  {
    id: 1,
    pedido: 'PD A-0001-0004447',
    codigoCliente: '0000001',
    razonSocial: 'JAVIER LOZANO',
    fecha: '2026/06/12',
    detalle: [
      { deposito: '10', codigoProducto: 'JDL COMUN', descripcion: 'JDL COMUN 1', cantidad: 1, area: 'Área 1', ubicacion: '1-A1-P1' },
      { deposito: '10', codigoProducto: 'JDL COMUN 2', descripcion: 'JDL COMUN 2', cantidad: 1, area: 'Área 2', ubicacion: '1-B2-P1' },
      { deposito: '10', codigoProducto: 'JDL COMUN 3', descripcion: 'JDL COMUN 3', cantidad: 1, area: null, ubicacion: '1-Z1-P1' }
    ]
  }
]

export const SUGERENCIAS_COMPRA = [
  {
    id: 1,
    pedido: 'SC A-0001-0000123',
    codigoCliente: '0000050',
    razonSocial: 'DISTRIBUIDORA DEL SUR SA',
    fecha: '2026/06/10',
    detalle: [
      { deposito: '10', codigoProducto: 'INS-001', descripcion: 'Insumo de reposición A', cantidad: 12, area: 'Área 1' },
      { deposito: '10', codigoProducto: 'INS-002', descripcion: 'Insumo de reposición B', cantidad: 6, area: 'Área 2' },
      { deposito: '10', codigoProducto: 'INS-003', descripcion: 'Insumo de reposición C', cantidad: 4, area: 'Área 4' }
    ]
  }
]

export const FACTURAS_ACOPIO = [
  {
    id: 1,
    pedido: 'FA A-0001-0000456',
    codigoCliente: '0000010',
    razonSocial: 'COMERCIAL NORTE SRL',
    fecha: '2026/06/11',
    detalle: [
      { deposito: '10', codigoProducto: 'ACP-001', descripcion: 'Producto en acopio A', cantidad: 25, area: 'Área 3' },
      { deposito: '10', codigoProducto: 'ACP-002', descripcion: 'Producto en acopio B', cantidad: 15, area: 'Área 1' }
    ]
  }
]

export const ORIGENES_CONFIG = {
  'pedidos-venta': {
    badgeLabel: 'Pedido de venta',
    columnaDocumento: 'Pedido',
    columnaEntidad: 'Código de Cliente',
    documentos: PEDIDOS
  },
  'sugerencias-compra': {
    badgeLabel: 'Sugerencia de compra',
    columnaDocumento: 'Sugerencia',
    columnaEntidad: 'Código de Proveedor',
    documentos: SUGERENCIAS_COMPRA
  },
  'facturas-acopio': {
    badgeLabel: 'Factura de acopio',
    columnaDocumento: 'Factura',
    columnaEntidad: 'Código de Cliente',
    documentos: FACTURAS_ACOPIO
  }
}
