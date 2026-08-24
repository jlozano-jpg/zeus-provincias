// Datos maestros de Agrupadores de Variantes. Se comparten entre la pantalla
// de Configuración > Productos > Agrupadores y la solapa Variantes del ABM
// de Productos: ambas leen/editan la misma fuente (levantada en App.jsx).
export const AGRUPADORES_SEED = [
  {
    id: 'TAL-001',
    name: 'Talles Indumentaria Adulto',
    desc: 'Curva de talles estándar para remeras, buzos y camisas de adulto',
    values: [
      { code: 'XS', name: 'XS' }, { code: 'S', name: 'S' },
      { code: 'M', name: 'M' }, { code: 'L', name: 'L' },
      { code: 'XL', name: 'XL' }, { code: '2XL', name: '2XL' },
    ],
  },
  {
    id: 'TAL-002',
    name: 'Talles Calzado Argentina',
    desc: 'Numeración argentina de calzado',
    values: [
      { code: '35', name: '35' }, { code: '36', name: '36' },
      { code: '37', name: '37' }, { code: '38', name: '38' },
      { code: '39', name: '39' }, { code: '40', name: '40' },
      { code: '41', name: '41' }, { code: '42', name: '42' },
      { code: '43', name: '43' }, { code: '44', name: '44' },
    ],
  },
  {
    id: 'COL-001',
    name: 'Paleta Clásicos',
    desc: 'Colores básicos disponibles todo el año',
    values: [
      { code: 'NEG', name: 'Negro', swatch: '#0f1020' },
      { code: 'BLA', name: 'Blanco', swatch: '#ffffff' },
      { code: 'GRI', name: 'Gris', swatch: '#9295ad' },
      { code: 'AZU', name: 'Azul', swatch: '#2970ff' },
      { code: 'ROJ', name: 'Rojo', swatch: '#f04438' },
    ],
    productsCount: 6,
  },
  {
    id: 'COL-002',
    name: 'Paleta Primavera 2026',
    desc: 'Colores de temporada para colección Primavera/Verano',
    values: [
      { code: 'COR', name: 'Coral', swatch: '#ff7a59' },
      { code: 'MEN', name: 'Menta', swatch: '#7ddec0' },
      { code: 'LAV', name: 'Lavanda', swatch: '#bba6ff' },
      { code: 'AMA', name: 'Amarillo', swatch: '#fbbf24' },
    ],
  },
  {
    id: 'VOL-001',
    name: 'Voltajes',
    desc: 'Voltajes admitidos por equipos eléctricos',
    values: [{ code: '110', name: '110V' }, { code: '220', name: '220V' }, { code: '240', name: '240V' }],
  },
  {
    id: 'SAB-001',
    name: 'Sabores Bebidas',
    desc: 'Sabores disponibles para bebidas gasificadas',
    values: [
      { code: 'ORI', name: 'Original' }, { code: 'LIG', name: 'Light' },
      { code: 'ZER', name: 'Zero' }, { code: 'LIM', name: 'Limón' },
    ],
  },
  {
    id: 'PRE-001',
    name: 'Presentaciones',
    desc: 'Tamaños de envase',
    values: [
      { code: '355', name: '355 ml' }, { code: '500', name: '500 ml' },
      { code: '1L', name: '1 L' }, { code: '1.5L', name: '1.5 L' }, { code: '2L', name: '2 L' },
    ],
  },
  {
    id: 'MAT-001',
    name: 'Materiales',
    desc: 'Composiciones textiles',
    values: [{ code: 'ALG', name: 'Algodón' }, { code: 'POL', name: 'Poliéster' }],
  },
]
