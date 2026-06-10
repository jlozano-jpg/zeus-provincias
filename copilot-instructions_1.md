# Copilot Instructions — Zeus Evolution

## Producto y contexto

Estás trabajando en **ZEUS ERP & POS**, una plataforma empresarial de uso intensivo orientada a gestión operativa, administrativa y comercial.

**Zeus Evolution** es su evolución visual, funcional y estructural. Todo código generado debe respetar estos criterios sin excepción.

---

## Principios que siempre debes respetar

- Consistencia entre módulos: una misma acción no se resuelve de formas distintas.
- Reutilización antes que reinvención: revisar si ya existe un componente o patrón antes de crear uno nuevo.
- Retrocompatibilidad: no eliminar funcionalidades ni modificar comportamientos sin redefinición formal.
- Comportamiento predecible: el usuario debe poder anticipar qué ocurre después de cada acción.
- Diseño para uso intensivo: eficiente, legible y cómodo para uso diario prolongado. No es una landing page.
- Criterio humano sobre automatización: no inventar funcionalidades no solicitadas.

---

## Stack técnico

- Framework: **React** (componentes funcionales con hooks).
- Estilos: **CSS Modules** (nunca estilos inline).
- Componentes: nombrar en **PascalCase**, archivos con el mismo nombre.
- Tipografía: **Inter** (Regular, Medium, Semibold, Bold).
- Grilla base: múltiplos de **8px**.
- Sin backend: toda la lógica es del lado del cliente.

---

## Paleta de colores Zeus Evolution

Usar únicamente estos tokens. No usar colores externos sin validación.

### Violeta (acciones principales)
| Token | HEX |
|---|---|
| Color-Violeta-100 | `#6A00A7` |
| Color-Violeta-80 | `#8833B8` |
| Color-Violeta-10 | `#F0E5F6` |

### Azul Bold (texto)
| Token | HEX |
|---|---|
| Color-Azul-Bold-100 | `#002955` |
| Color-Azul-Bold-80 | `#335477` |
| Color-Azul-Bold-60 | `#667F99` |

### Azul (acciones secundarias)
| Token | HEX |
|---|---|
| Color-Azul-100 | `#004C97` |
| Color-Azul-80 | `#3370AC` |

### Turquesa (foco, acentos, positivo)
| Token | HEX |
|---|---|
| Color-Turquesa-100 | `#00CDCD` |
| Color-Turquesa-10 | `#E5FAFA` |

### Gris (fondos, bordes)
| Token | HEX |
|---|---|
| Color-Gris-100 | `#C2D6D8` |
| Color-Gris-20 | `#F3F7F7` |
| Color-Gris-5 | `#FCFDFD` |

### Reglas de color
- Texto principal → `Azul-Bold-100`
- Texto secundario → `Azul-Bold-80` o `Azul-Bold-70`
- Acciones principales → `Violeta-80` o `Violeta-100`
- Foco / indicadores positivos → `Turquesa-100`
- Fondos → `Gris-5`, `Gris-10`, `Azul-5` o `Turquesa-10`
- No depender solo del color para comunicar estados.
- Validar contraste antes de aprobar combinaciones.

---

## Tipografía

| Uso               | Tamaño  |
| ----------------- | ------- |
| Título principal  | 18–20px |
| Título de sección | 16–18px |
| Texto base        | 12–14px |
| Labels            | 12–13px |
| Texto secundario  | 11–12px |
| Microcopy         | 10–11px |

- No usar textos menores a 10px.
- Usar peso tipográfico para marcar jerarquía, no exceso de color.
- Evitar mayúsculas sostenidas en textos largos.

---

## Componentes y estados

Todo componente debe contemplar estos estados cuando corresponda:
- Default
- Hover
- Focus (visible, accesible)
- Active
- Disabled
- Loading
- Error
- Empty

---

## Grillas (tablas/listados)

- Scroll infinito, sin paginado.
- Acceso directo a acciones sobre cada registro.
- Configurables por usuario: columnas, orden, tamaño, visibilidad, nombres.
- Configuración persistente por usuario con opción de guardar, cancelar y restablecer.
- Visualización: 1 click. Edición / Eliminación / Copiar: acción explícita con botón.
- Nuevo registro: acción explícita con botón.
- Filtros: selección única o múltiple según el caso.
- Búsqueda por texto.
- Columnas ordenadas por importancia. Alineación según tipo de dato.

---

## Formularios

- Panel lateral derecho para: Alta, Edición y Visualización.
- Los selectores anidados se abren superpuestos.
- Cancelar vuelve atrás sin perder contexto (salvo en la primera capa).
- Si hay datos cargados al cancelar, solicitar confirmación.
- Campos obligatorios: si faltan al guardar, posicionar automáticamente en el campo.
- Foco inicial siempre en el primer campo.
- Navegable completamente con teclado.
- Siempre mostrar Código + Descripción al referenciar registros de otro ABM.

---

## Selectores

- Panel lateral.
- Filtros y búsqueda por texto.
- Marcar el registro para seleccionar.
- Acciones disponibles según el caso: Crear, Editar, Visualizar, Eliminar.

---

## Navegación por teclado

- Tab: avanzar entre campos editables.
- Shift+Tab: retroceder.
- Flechas: navegar entre registros (grillas) u opciones (campos).
- Enter: confirmar (guardar, seleccionar).
- Ctrl+Enter: confirmar en casos ambiguos.
- Esc: cancelar acción actual / cerrar paneles, modales o selectores / disparar confirmación si hay cambios sin guardar.
- Ctrl+C / X / V / Z / Y: comportamiento estándar de edición.
- Mensajes de confirmación: foco inicial en "Confirmar", con posibilidad de moverse a la otra opción.

---

## Estilos que debes evitar

- Glassmorphism extremo.
- Neumorphism.
- Sombras exageradas.
- Contrastes agresivos.
- Decoración sin función.
- Interfaces recargadas.
- Colores fuera de la paleta.
- Estilos experimentales difíciles de implementar.
- Diseños que dependan solo de la estética.

---

## Accesibilidad

- Contraste suficiente en todas las combinaciones de color.
- Foco visible en todos los elementos interactivos.
- No depender solo del color para comunicar estados.
- Áreas interactivas con tamaño adecuado (mínimo 40px de target).
- Botones de solo ícono deben tener tooltip.
- aria-labels donde corresponda.

---

## Comunicación y microcopy

- Tono claro, profesional, sin regionalismos.
- La marca se escribe siempre como: **ZEUS**, **Zeus Evolution**, **ZEUS ERP & POS**.
- Los botones deben describir la acción: "Guardar cliente", no solo "Guardar".
- Los mensajes de error deben ayudar a resolver el problema.
- Evitar abreviaturas innecesarias.
- Evitar mayúsculas sostenidas en textos largos.

---

## Configurabilidad

Cuando corresponda, los elementos deben ser configurables por usuario o tenant:
- Columnas visibles, orden y tamaño.
- Nombres visibles de campos.
- Ubicación de elementos en pantalla.
- Íconos.
- Vistas disponibles.
- Preferencias persistentes sujetas a permisos de seguridad.
- Siempre debe existir una configuración por defecto restablecible.

---

## Checklist antes de generar cualquier componente o pantalla

- [ ] Usa Inter como tipografía.
- [ ] Usa solo colores de la paleta Zeus Evolution.
- [ ] Respeta grilla de 8px.
- [ ] El componente es reutilizable.
- [ ] Contempla todos los estados necesarios.
- [ ] Se puede navegar con teclado.
- [ ] El contraste es suficiente.
- [ ] No agrega funcionalidades no solicitadas.
- [ ] No usa estilos experimentales.
- [ ] Es viable en React con CSS Modules.
- [ ] Los textos son claros y profesionales.
- [ ] Los botones de ícono tienen tooltip.
