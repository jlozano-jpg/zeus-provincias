export const CONTROL_PREPARACIONES = [
  {
    id: 1,
    fecha: '23/06/2026',
    comprobante: '00005724',
    sucursal: 'SUCURSAL CENTRAL',
    deposito: '10',
    preparador: '001 - Juan Pérez',
    controlador: '',
    prioridad: 1,
    estado: 'Control Pendiente',
    clientes: [
      {
        codigo: '00022',
        razonSocial: 'RETROBOROS SA',
        controlador: '',
        estado: 'Control Pendiente',
        comprobantes: ['00005724'],
        items: [
          { codigoArticulo: 'ART-001', descripcion: 'TORNILLO HEXAGONAL 1/2"', cantidadPreparada: 100, stockDisponible: 450, ubicaciones: ['ESTANTE 1', 'ESTANTE 2'], lotes: ['LOTE-2024-001', 'LOTE-2024-002'] },
          { codigoArticulo: 'ART-002', descripcion: 'TUERCA AUTOBLOCANTE M12', cantidadPreparada: 50, stockDisponible: 220, ubicaciones: ['ESTANTE 3'], lotes: ['LOTE-2024-003'] },
          { codigoArticulo: 'ART-003', descripcion: 'ARANDELA PLANA 10mm', cantidadPreparada: 200, stockDisponible: 1100, ubicaciones: ['ESTANTE 1'], lotes: ['LOTE-2024-001'] },
        ]
      },
      {
        codigo: '00017',
        razonSocial: 'SPECISM LUCAS',
        controlador: '',
        estado: 'Control Pendiente',
        comprobantes: ['00005725'],
        items: [
          { codigoArticulo: 'ART-010', descripcion: 'CABLE UNIPOLAR 2.5mm', cantidadPreparada: 300, stockDisponible: 1500, ubicaciones: ['DEPOSITO B'], lotes: ['LOTE-2024-010'] },
          { codigoArticulo: 'ART-011', descripcion: 'DISYUNTOR TERMICA 16A', cantidadPreparada: 10, stockDisponible: 45, ubicaciones: ['ESTANTE 5'], lotes: [] },
        ]
      }
    ]
  },
  {
    id: 2,
    fecha: '23/06/2026',
    comprobante: '00005720',
    sucursal: 'SUCURSAL CENTRAL',
    deposito: '10',
    preparador: '002 - María Gómez',
    controlador: 'Lucía Romero',
    prioridad: 2,
    estado: 'Control Pendiente',
    clientes: [
      {
        codigo: '00031',
        razonSocial: 'COMERCIAL NORTE SRL',
        controlador: 'Lucía Romero',
        estado: 'Control Pendiente',
        comprobantes: ['00005720'],
        items: [
          { codigoArticulo: 'ART-020', descripcion: 'PINTURA LÁTEX BLANCO 10L', cantidadPreparada: 20, stockDisponible: 85, ubicaciones: ['DEPOSITO C'], lotes: ['LOTE-2024-020'] },
          { codigoArticulo: 'ART-021', descripcion: 'RODILLO LANA 23cm', cantidadPreparada: 15, stockDisponible: 60, ubicaciones: ['ESTANTE 8'], lotes: [] },
          { codigoArticulo: 'ART-022', descripcion: 'BANDEJA PARA PINTURA', cantidadPreparada: 15, stockDisponible: 120, ubicaciones: ['ESTANTE 8'], lotes: [] },
        ]
      }
    ]
  }
]
