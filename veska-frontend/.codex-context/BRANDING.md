# Veska — Branding Guidelines

**Documento:** `BRANDING.md`  
**Estado:** Base visual definida para revisión de pantallas  
**Versión:** 0.1  
**Proyecto:** Veska  
**Última actualización:** 2026-06-11  

---

# 1. Objetivo del documento

Este archivo define la identidad visual base de Veska y funciona como referencia para implementar y revisar el frontend.

La prioridad es que Veska se perciba como una plataforma empresarial sobria, confiable, ordenada y fácil de usar. La interfaz debe evitar recargarse con cajas, botones innecesarios o elementos decorativos que dificulten la navegación.

Después de esta primera versión, el documento se actualizará progresivamente al revisar cada pantalla del producto y definir ajustes concretos de CSS, distribución y comportamiento responsive.

---

# 2. Identidad general

## 2.1 Personalidad de marca

Veska debe sentirse como una herramienta empresarial sobria, confiable y ordenada.

La marca no busca verse rígida ni excesivamente institucional, pero tampoco como una startup tecnológica llamativa. El punto medio deseado está entre una estética corporativa y una estética moderna equilibrada.

Atributos principales:

- confianza;
- orden;
- claridad;
- precisión;
- seguridad;
- simplicidad;
- modernidad sobria;
- profesionalismo;
- discreción.

## 2.2 Prioridad visual

La sensación principal al entrar a Veska debe ser:

> Orden y claridad.

La seguridad y privacidad deben percibirse como un respaldo constante, sin llenar la interfaz de recursos visuales que intenten demostrarlo de forma explícita.

## 2.3 Tono visual

La interfaz debe ser:

- sobria;
- limpia;
- profesional;
- principalmente plana;
- clara para usuarios no técnicos;
- con sombras muy suaves solo cuando ayuden a separar niveles;
- con degradados sutiles;
- con jerarquías visuales evidentes;
- con colores utilizados con moderación;
- con bastante espacio en blanco.

## 2.4 Regla general para las vistas

Cada pantalla debe cumplir estas reglas:

- evitar llenar la interfaz de cajas;
- usar tarjetas solo cuando agrupen información realmente distinta;
- priorizar espacios, alineación y tipografía antes que bordes;
- reducir botones secundarios innecesarios;
- mantener una acción principal claramente visible;
- evitar que muchos elementos compitan entre sí;
- mantener una navegación entendible sin explicación;
- evitar densidad visual innecesaria;
- utilizar colores sobrios;
- conservar botones claros y visibles.

La interfaz no debe sentirse como un dashboard lleno de módulos, sino como un espacio de trabajo simple y controlado.

## 2.5 Referencias visuales preliminares

Referencias para orientar el estilo, sin copiarlas literalmente:

| Referencia | Aspecto útil |
|---|---|
| Linear | Limpieza visual, jerarquía y sobriedad |
| Stripe | Confianza empresarial y uso controlado del color |
| Notion | Simplicidad y facilidad de uso |
| Dropbox | Relación con archivos sin verse excesivamente técnica |
| Microsoft 365 | Familiaridad para usuarios empresariales |

Veska debería sentirse más sobria que Notion y menos corporativa que Microsoft 365.

## 2.6 Elementos visuales que Veska debe evitar

- demasiadas tarjetas;
- demasiadas cajas compactas;
- sombras fuertes;
- bordes gruesos;
- botones de múltiples colores compitiendo;
- degradados llamativos;
- colores neón;
- fondos oscuros dramáticos;
- estética cyberpunk;
- iconos decorativos sin función;
- exceso de texto;
- animaciones llamativas sin utilidad;
- cerebros, robots o circuitos como símbolos de inteligencia artificial;
- aspecto de plantilla genérica de startup;
- interfaz excesivamente densa.

---

# 3. Logos

## 3.1 Versiones definidas

Veska contará con dos versiones principales del logo.

### Logo horizontal

Composición:

- isotipo en forma de `V`;
- palabra `Veska`;
- degradado sutil;
- esquinas suavemente redondeadas.

Uso recomendado:

- login;
- landing page;
- encabezados amplios;
- documentos comerciales;
- piezas donde exista espacio horizontal suficiente.

### Isotipo compacto

Composición:

- solo la `V`;
- dos tonos azules;
- degradado sutil;
- esquinas suavemente redondeadas.

Uso recomendado:

- sidebar;
- favicon;
- pestaña del navegador;
- móvil;
- avatar de marca;
- espacios reducidos.

## 3.2 Regla de elección

No existe una única versión obligatoria para todos los contextos.

Se utilizará:

- logo horizontal cuando exista espacio suficiente;
- isotipo compacto cuando el espacio sea reducido o se requiera una identificación rápida.

## 3.3 Fondo principal

El logo oficial se utilizará principalmente sobre:

```txt
#FFFFFF
```

No se define todavía una variante oficial para fondos oscuros.

## 3.4 Tratamiento visual

Se deben conservar:

- degradados sutiles;
- esquinas suavemente redondeadas;
- proporciones originales;
- colores oficiales.

Se debe evitar:

- sombras fuertes;
- efectos tridimensionales;
- rotaciones;
- estirar o comprimir el isotipo;
- reemplazar colores sin justificación;
- colocar el logo sobre fondos visualmente cargados;
- agregar bordes o contenedores innecesarios.

## 3.5 Área libre mínima

El margen libre mínimo alrededor del logo debe ser equivalente a la altura del triángulo azul del isotipo.

## 3.6 Tamaños mínimos recomendados

| Versión | Tamaño mínimo |
|---|---:|
| Logo horizontal | 120 px de ancho |
| Isotipo compacto | 24 × 24 px |
| Favicon | 32 × 32 px |

## 3.7 Favicon

El favicon debe usar solamente el isotipo compacto, sin la palabra `Veska`.

## 3.8 Archivos finales pendientes

Antes de implementar producción, recrear y exportar:

```txt
logo-horizontal.svg
logo-horizontal-transparent.png
logo-horizontal-white-background.png
isotipo.svg
isotipo-transparent.png
favicon.png
favicon.ico
```

El archivo SVG debe ser la versión principal para frontend.

---

# 4. Paleta de colores

## 4.1 Colores principales

| Token | Uso | HEX |
|---|---|---:|
| `primary-navy` | Branding, títulos y texto fuerte | `#152436` |
| `primary-blue` | Botones principales, links, foco y estados activos | `#427AC6` |
| `primary-blue-hover` | Hover de botones principales | `#356AAE` |
| `primary-blue-soft` | Fondos suaves de selección o procesamiento | `#EAF2FC` |
| `white` | Fondo principal y texto sobre botones | `#FFFFFF` |

## 4.2 Fondos y superficies

| Token | Uso | HEX |
|---|---|---:|
| `background-main` | Fondo general | `#FFFFFF` |
| `background-secondary` | Sidebar y áreas secundarias | `#F7F9FC` |
| `surface` | Modales, paneles y tarjetas necesarias | `#FFFFFF` |
| `surface-selected` | Elementos activos suaves | `#EEF4FB` |

## 4.3 Bordes

| Token | Uso | HEX |
|---|---|---:|
| `border-default` | Inputs, tablas y divisores | `#D9E1EA` |
| `border-subtle` | Separadores discretos | `#E8EDF3` |
| `border-focus` | Inputs activos | `#427AC6` |

## 4.4 Textos

| Token | Uso | HEX |
|---|---|---:|
| `text-primary` | Títulos y contenido principal | `#152436` |
| `text-secondary` | Descripciones | `#526173` |
| `text-muted` | Metadata y placeholders | `#7D8A99` |
| `text-disabled` | Elementos inactivos | `#A9B4C0` |
| `text-on-primary` | Texto sobre azul | `#FFFFFF` |

## 4.5 Estados del sistema

| Estado | Fondo | Texto o icono |
|---|---:|---:|
| Success | `#EAF7EF` | `#2E7D4F` |
| Warning | `#FFF6E5` | `#A56A12` |
| Error | `#FDECEC` | `#B44545` |
| Processing | `#EAF2FC` | `#427AC6` |
| Neutral | `#F1F4F7` | `#5F6D7A` |

## 4.6 Reglas de uso

- sidebar clara;
- botón principal azul acento;
- fondo general blanco;
- áreas secundarias gris muy claro;
- azul marino reservado principalmente para branding, títulos y texto fuerte;
- uso moderado del azul fuerte;
- evitar grandes superficies azul marino;
- evitar más de un color fuerte compitiendo en una misma pantalla;
- evitar badges de múltiples colores sin necesidad funcional.

---

# 5. Tipografía

## 5.1 Familia principal

```txt
Inter
```

No se utilizará una fuente secundaria por ahora.

## 5.2 Jerarquía tipográfica

| Elemento | Tamaño aproximado | Peso |
|---|---:|---:|
| Título de página | 28–32 px | 600 |
| Título de sección | 20–24 px | 600 |
| Subtítulo | 16–18 px | 500 |
| Texto base | 14–16 px | 400 |
| Botones | 14 px | 500 |
| Labels | 13–14 px | 500 |
| Metadata | 12–13 px | 400 |
| Badges | 12 px | 500 |

## 5.3 Reglas de uso

- usar pocos tamaños;
- evitar negritas excesivas;
- priorizar legibilidad;
- mantener una separación vertical clara;
- reservar peso `600` para títulos relevantes;
- evitar mayúsculas completas salvo casos puntuales;
- mantener una lectura cómoda en chat, tablas y formularios.

---

# 6. Componentes

## 6.1 Principios generales

- mantener pocas cajas;
- separar mediante espacio y jerarquía antes que bordes;
- usar sombras solo en elementos elevados;
- mantener una acción principal visible por vista;
- usar botones secundarios discretos;
- conservar navegación intuitiva.

## 6.2 Botón principal

Uso:

- guardar;
- continuar;
- crear;
- subir documento;
- iniciar acción relevante.

Estilo:

```txt
Fondo: #427AC6
Texto: #FFFFFF
Hover: #356AAE
Altura desktop: 40 px
Altura móvil: 44–48 px
Padding horizontal: 16 px
Border radius: 8 px
Peso tipográfico: 500
```

## 6.3 Botón secundario

Uso:

- cancelar;
- volver;
- abrir configuración;
- acciones complementarias.

Estilo:

```txt
Fondo: #FFFFFF
Texto: #152436
Borde: #D9E1EA
Hover: #F7F9FC
Altura desktop: 40 px
Border radius: 8 px
```

## 6.4 Botón terciario

Uso:

- acciones discretas;
- acciones dentro de tablas;
- acciones compactas del chat.

Estilo:

```txt
Fondo: transparente
Texto: #526173
Sin borde
Hover: #F7F9FC
```

## 6.5 Botón destructivo

Uso:

- eliminar documento;
- desactivar usuario;
- confirmar eliminación;
- cancelar acciones sensibles.

Regla:

- usar texto rojo o botón discreto inicialmente;
- reservar el botón rojo sólido para la confirmación final.

Estilo preliminar:

```txt
Texto: #B44545
Borde opcional: #EBCACA
Hover: #FDECEC
```

## 6.6 Inputs

```txt
Altura: 40 px
Fondo: #FFFFFF
Texto: #152436
Borde: #D9E1EA
Placeholder: #7D8A99
Border radius: 8 px
Foco: borde #427AC6
Sombra de foco: muy sutil
```

Para campos largos, utilizar textarea con la misma lógica visual.

## 6.7 Tarjetas

Usar tarjetas solamente cuando realmente ayuden a agrupar información.

Reglas:

- no envolver cada bloque en una tarjeta;
- preferir espacios y separadores;
- evitar sombras visibles;
- evitar anidar tarjetas innecesariamente.

Estilo:

```txt
Fondo: #FFFFFF
Borde: #E8EDF3
Border radius: 10–12 px
Sombra: ninguna en uso normal
Padding: 16–20 px
```

## 6.8 Tablas

Las tablas se utilizarán en biblioteca documental, usuarios, empresas, errores y administración.

Estilo:

```txt
Fondo: #FFFFFF
Header: #F7F9FC
Texto header: #526173
Texto filas: #152436
Separadores horizontales: #E8EDF3
Hover fila: #F7F9FC
Altura fila: 48–56 px
```

Reglas:

- no usar líneas verticales;
- mantener densidad equilibrada;
- priorizar lectura rápida;
- adaptar en móvil según contexto.

## 6.9 Badges

Los badges deben ser pequeños, discretos y funcionales.

```txt
Tamaño: 12 px
Peso: 500
Padding: 4 px 8 px
Border radius: 999 px
```

Estados:

| Estado | Fondo | Texto |
|---|---:|---:|
| Listo | `#EAF7EF` | `#2E7D4F` |
| Procesando | `#EAF2FC` | `#427AC6` |
| Pendiente | `#F1F4F7` | `#5F6D7A` |
| Advertencia | `#FFF6E5` | `#A56A12` |
| Error | `#FDECEC` | `#B44545` |

## 6.10 Modales

Usarlos solamente para:

- confirmaciones;
- acciones puntuales;
- información que requiera foco.

Estilo:

```txt
Ancho estándar: 440–560 px
Fondo: #FFFFFF
Border radius: 12 px
Padding: 24 px
Sombra: suave
Overlay: negro con opacidad baja
```

Estructura recomendada:

```txt
Título claro
Descripción breve
Contenido necesario
Acción secundaria
Acción principal
```

## 6.11 Sidebar

La sidebar será clara y visible en escritorio, pero colapsable a iconos.

Estilo:

```txt
Fondo: #F7F9FC
Borde derecho: #E8EDF3
Ancho desktop: 240–260 px
Estado activo: fondo #EEF4FB
Hover: #F1F4F7
```

Orden preliminar:

```txt
Logo
Nuevo chat
Chats
Documentos
Espacios
Subir documentos
Administración, si corresponde
Perfil
Reportar problema
```

Los espacios y subespacios deben aparecer en una sección colapsable.

## 6.12 Header

El header debe estar presente en las vistas principales, pero ser discreto.

Estilo:

```txt
Altura: 56–64 px
Fondo: #FFFFFF
Borde inferior: #E8EDF3
```

Composición:

```txt
Título de la vista a la izquierda
Acción principal puntual a la derecha
```

## 6.13 Estados vacíos

Estructura:

```txt
Icono simple
Título breve
Texto de una o dos líneas
Un único botón principal
```

Evitar:

- ilustraciones grandes;
- animaciones excesivas;
- múltiples acciones;
- cajas recargadas.

---

# 7. Chat

## 7.1 Principio general

El chat es la vista central de Veska.

Debe sentirse como una conversación simple y profesional, sin excesivas cajas ni bloques compactos.

## 7.2 Estructura visual

| Elemento | Tratamiento |
|---|---|
| Mensaje del usuario | Burbuja discreta alineada a la derecha |
| Respuesta de Veska | Texto limpio alineado a la izquierda, sin caja |
| Acciones | Iconos visibles y pequeños debajo de la respuesta |
| Fuentes | Botón textual `Ver fuentes` junto a las acciones |
| Input | Barra simple inferior, sin selector de alcance documental |

## 7.3 Mensaje del usuario

```txt
Fondo: #EEF4FB
Texto: #152436
Border radius: 12 px
Ancho máximo: 70–75 %
Padding: 10–14 px
Alineación: derecha
```

## 7.4 Respuesta de Veska

```txt
Fondo: transparente
Texto: #152436
Ancho máximo: 760–820 px
Alineación: izquierda
Sin borde
Sin sombra
```

La respuesta debe sentirse como contenido principal, no como una tarjeta.

## 7.5 Tipografía del chat

| Elemento | Tamaño | Peso |
|---|---:|---:|
| Respuesta principal | 15–16 px | 400 |
| Pregunta del usuario | 14–15 px | 400 |
| Acciones | 12–13 px | 400 |
| Fragmento de fuente | 13–14 px | 400 |
| Nombre de archivo | 13–14 px | 500 |

Interlineado de respuestas:

```txt
1.55–1.65
```

## 7.6 Acciones bajo cada respuesta

Usar iconos simples visibles con tooltip:

```txt
Copiar
Me gusta
No me gusta
Regenerar
Más opciones
Ver fuentes
```

`Ver fuentes` será un botón textual pequeño junto a los iconos.

## 7.7 Despliegue de fuentes

Al pulsar `Ver fuentes`, se abrirá una sección sencilla debajo de la respuesta.

No utilizar:

- bloques compactos;
- tarjetas pequeñas repetidas;
- badges innecesarios;
- cajas anidadas.

Estructura recomendada:

```txt
Fuente 1

Contrato de arriendo 2024.pdf

“Los gastos comunes serán responsabilidad del arrendatario...”

[Ver archivo]
```

Si existen varias fuentes, mostrarlas una debajo de otra con separadores suaves:

```txt
border-top: 1 px solid #E8EDF3
```

Estilo:

```txt
Fondo: transparente o #F7F9FC muy suave
Padding vertical: 12–16 px
Sin sombra
Nombre de archivo destacado
Fragmento textual legible
Botón secundario pequeño: Ver archivo
```

Para planillas:

```txt
Gastos_Comunes_2026.xlsx
Hoja: Gastos 2026 · Rango: A1:D4

“Mes: Enero | Proveedor: Ascensores SPA | Categoría: Mantención...”

[Ver archivo]
```

## 7.8 Input del chat

No se incluirá selector de alcance documental dentro ni fuera del input durante esta revisión visual.

Estilo:

```txt
Fondo: #FFFFFF
Borde: #D9E1EA
Border radius: 12 px
Sombra: muy suave
Padding: 12–16 px
Altura inicial: 52–56 px
Altura máxima: 160–200 px
```

Contenido:

```txt
Campo de texto
Botón enviar
```

Botón enviar:

```txt
Fondo: #427AC6
Icono: #FFFFFF
Forma: círculo
```

## 7.9 Densidad vertical del chat

```txt
24–32 px entre mensajes
8–12 px entre respuesta y acciones
12–16 px entre acciones y fuentes desplegadas
```

## 7.10 Estados especiales

### Mientras responde

Mostrar:

```txt
Buscando en tus documentos...
```

Acompañado de puntos animados discretos en:

```txt
#427AC6
```

### Sin evidencia suficiente

```txt
Fondo: #FFF6E5
Texto: #A56A12
Icono simple de advertencia
Mensaje breve
```

### Error técnico

```txt
Fondo: #FDECEC
Texto: #B44545
Botón secundario: Reintentar
```

---

# 8. Responsive

## 8.1 Desktop

```txt
Sidebar visible y colapsable
Header completo
Contenido centrado con ancho controlado
Tablas completas
Chat amplio
```

## 8.2 Tablet

```txt
Sidebar colapsada por defecto
Header compacto
Tablas con scroll horizontal cuando corresponda
Modales algo más estrechos
Chat con márgenes reducidos
```

## 8.3 Móvil

```txt
Sidebar oculta detrás de menú lateral deslizable
Header con isotipo compacto, título breve y menú
Botones principales de 44–48 px de alto
Input del chat fijo abajo
Fuentes desplegadas en una sola columna
Tablas adaptadas según la vista
```

## 8.4 Regla para tablas móviles

Según la pantalla:

- utilizar scroll horizontal cuando sea más claro;
- convertir filas en listas o tarjetas cuando mejore la lectura;
- evitar forzar tablas anchas ilegibles.

---

# 9. Pendientes

## 9.1 Antes de producción

- recrear logos con geometría limpia;
- exportar archivos SVG;
- exportar PNG transparentes;
- exportar favicon;
- validar contraste y legibilidad final;
- revisar la paleta sobre cada pantalla real;
- revisar consistencia de radios, bordes y espaciado;
- revisar comportamiento responsive en cada vista.

## 9.2 Decisiones todavía abiertas

- variante de logo para fondo oscuro;
- necesidad real de modo oscuro;
- iconografía final;
- tokens de espaciado exactos;
- animaciones y transiciones;
- comportamiento visual exacto de tablas en cada pantalla móvil;
- ubicación futura de controles de alcance documental, si se reintroducen;
- personalización visual por empresa cliente.

## 9.3 Mejoras post-MVP

- modo oscuro;
- variante de logo para fondos oscuros;
- animaciones sutiles;
- sistema completo de iconografía;
- personalización visual por tenant;
- mayor adaptación móvil de tablas complejas;
- componentes específicos para integraciones futuras.

---

# 10. Próxima etapa: revisión pantalla por pantalla

Después de guardar esta versión del documento, revisar cada vista de Veska y actualizar esta fuente con decisiones concretas de CSS y distribución.

Orden sugerido:

1. login;
2. dashboard;
3. sidebar y layout general;
4. biblioteca documental;
5. vista de documento;
6. subida de documentos;
7. chat;
8. perfil;
9. administración de empresa;
10. panel interno de plataforma;
11. setup asistido;
12. estados de error y acceso no autorizado;
13. tablet;
14. móvil.

Durante esa revisión, registrar:

- estructura visual;
- elementos que sobran;
- componentes que faltan;
- jerarquías;
- spacing;
- comportamiento responsive;
- copy visible;
- estados hover, active, disabled y error;
- cambios CSS requeridos.

---

# 11. Resumen ejecutivo

Veska utilizará una identidad visual empresarial sobria, moderna y clara.

La interfaz debe privilegiar:

- orden;
- simplicidad;
- legibilidad;
- navegación intuitiva;
- uso moderado del color;
- pocas cajas;
- acciones principales visibles;
- fuentes verificables presentadas con claridad;
- adaptación responsive progresiva.

La identidad base queda lista para comenzar la revisión de pantallas.
