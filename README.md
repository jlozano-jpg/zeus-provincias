# Gestión de Provincias — Zeus Evolution

Aplicación React profesional para gestión de provincias argentinas, siguiendo la identidad visual y estándares de **Zeus Evolution**.

## Características

- **Listar provincias**: Tabla completa con 23 provincias argentinas
- **Búsqueda**: Filtro por nombre o código
- **Ver detalle**: Panel lateral para visualizar información completa
- **Editar**: Modificar datos de provincias (código, nombre, región, capital, población)
- **Diseño responsive**: Adaptable a diferentes tamaños de pantalla
- **Navegación por teclado**: Completamente accesible

## Stack Tecnológico

- **React 18** - Framework UI
- **Vite** - Build tool y dev server
- **CSS Modules** - Estilos con scope local
- **Inter** - Tipografía

## Paleta de Colores (Zeus Evolution)

- **Violeta**: #6A00A7, #8833B8, #F0E5F6 (acciones principales)
- **Azul Bold**: #002955, #335477, #667F99 (texto)
- **Turquesa**: #00CDCD, #E5FAFA (foco, positivo)
- **Gris**: #C2D6D8, #F3F7F7, #FCFDFD (fondos, bordes)

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview
```

## Estructura de Archivos

```
src/
  ├── index.jsx           # Punto de entrada
  ├── index.css           # Estilos globales
  ├── App.jsx             # Componente principal
  ├── App.module.css
  └── components/
      ├── ProvincesList.jsx          # Tabla de provincias
      ├── ProvincesList.module.css
      ├── ProvincePanel.jsx          # Panel lateral de edición/vista
      └── ProvincePanel.module.css
public/
  └── index.html          # Template HTML
```

## Componentes

### ProvincesList
- Tabla con scroll infinito
- Búsqueda por nombre/código
- Acciones: Ver, Editar
- Estados hover para mejor UX

### ProvincePanel
- Formulario para edición y visualización
- Validación de campos requeridos
- Confirmación al descartar cambios
- Cierre con Esc
- Navegación completa con Tab/Shift+Tab

## Datos

La app incluye 23 provincias argentinas con datos como:
- Código (2 caracteres)
- Nombre
- Región
- Capital
- Población

## Accesibilidad

✅ Contraste suficiente (WCAG AA)  
✅ Foco visible en todos los elementos interactivos  
✅ aria-labels en botones críticos  
✅ Navegación completa con teclado  
✅ Tamaño mínimo de áreas interactivas (32px)

## Navegación por Teclado

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre elementos |
| `Shift+Tab` | Navegar hacia atrás |
| `Esc` | Cerrar panel o cancelar |
| `Ctrl+Enter` | Guardar cambios (en panel edit) |
| `Enter` | Confirmar búsqueda o selecciones |

## Notas

- No requiere backend — toda la lógica es del lado del cliente
- Los datos se pierden al recargar (se restablecen al estado inicial)
- Completamente responsive para dispositivos móviles
- Sigue 100% los estándares de Zeus Evolution
