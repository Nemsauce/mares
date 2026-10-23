# Mares

Mares es ropa de bebé bordada, de alta calidad y a precio justo, hecha con amor para las niñas que más queremos. Este sistema de diseño es la referencia para construir la tienda y todo lo que la rodea. Estado: versión 1, provisional hasta probar materiales reales y definir el logo final.

## Fundamentos de contenido

**Quién habla.** Mares habla como alguien que le cuenta algo bonito a una amiga que va a ser mamá: cálida, tierna y cercana, sin cursilería y sin tecnicismos.

**Idioma.** Español de Colombia, tuteo, frases cortas. Precios en pesos colombianos con punto de miles (`$89.900`), sin decimales.

**Frase de trabajo (provisional).** *Hecha con amor para las que más amamos.*

| Decimos | Evitamos |
| --- | --- |
| "Suave para su piel, bordada con cuidado" | "Tejido premium de alto rendimiento" |
| "Para las que más amamos" | "Compra ya, última oportunidad" |
| "Precio justo, sin recortar en calidad" | "Barata" o "económica" como argumento principal |
| "Hecha con amor" | Diminutivos en cada frase |

Reglas de escritura para la web:

- Títulos en mayúscula inicial solo en la primera palabra: "Pijama ola suave", no "Pijama Ola Suave".
- Una idea por frase. Un botón dice lo que pasa al tocarlo: "Agregar al carrito", "Ver la línea Descanso".
- Nunca urgencia falsa ni descuentos inflados. No prometer materiales o certificaciones que no se puedan demostrar.

## Fundamentos visuales

Mares tiene una sola familia visual con dos momentos del mar.

| Línea | Mar | Colores | Sensación |
| --- | --- | --- | --- |
| Descanso | Mar sereno | `sea-glass`, `lavender`, `blush`, perla (`bg`) | Calma, abrazo, silencio |
| Día | Playa paradisiaca | `turquoise`, `coral`, `sun` | Luz, alegría, juego |

**Color.** La base de toda la tienda es `bg` (perla) con texto `ink`. Los colores de línea (`sea-glass`, `lavender`, `blush`, `turquoise`, `coral`, `sun`) son pastel y sirven para fondos, bloques y detalles, nunca para texto: no cumplen contraste. El azul profundo (`brand`) es el único color de acción y de enlace. Una página usa los colores de una sola línea a la vez; las páginas generales (inicio, carrito, checkout) usan solo `bg`, `bg-raised`, `ink` y `brand`.

**Tipografía.** Títulos en Fraunces (serif suave, peso 600) y texto en Nunito (sans redondeada). Ambas son de Google Fonts: cargar solo los pesos 400, 600 y 700 con `font-display: swap`.

**Forma.** Esquinas redondeadas generosas (`radius-md` en botones y tarjetas, `radius-lg` en bloques grandes).

**Profundidad y movimiento.** *Cambio del 23 de octubre de 2026, por decisión de la persona dueña de la marca. Reemplaza "Sin sombras en reposo; solo `shadow-soft` al pasar el cursor. Sin degradados."* La tienda deja de verse plana: se permiten sombras en reposo, degradados y movimiento marcado, con estos límites.

- **Sombras.** En reposo, una sombra suave y baja en tarjetas (producto, entrada a las líneas) y en superficies elevadas (el panel de texto sobre una foto, imágenes grandes dentro de un bloque). Al pasar el cursor la tarjeta sube y su sombra crece; `shadow-soft` sigue siendo la sombra de hover y de menús desplegables. No van sombras en texto, íconos, campos de formulario ni franjas de sección a todo el ancho, y una sombra nunca es la única señal de un estado (foco, selección, error).
- **Degradados.** Se usan donde ayudan a leer o a dar cuerpo a un bloque grande: el velo sobre la foto del hero (de `bg` a transparente, para fundir la foto con el panel de texto) y los bloques grandes de color de línea (del color principal al acento de esa misma línea). Se arman solo con tokens. No van en botones, controles pequeños, tarjetas de producto ni detrás de texto pequeño, y nunca mezclan las dos líneas: una página sigue usando los colores de una sola línea.
- **Fondos alternos.** Las páginas generales alternan por sección `bg`, `bg-raised` y un perla más hondo (`bg` mezclado con `line`), para que la página tenga ritmo y no sea un solo campo crema. Son tokens generales, así que la regla de las páginas generales se mantiene.
- **Contraste sobre degradados y fondos teñidos.** Cada texto se mide contra el punto más claro y el más oscuro del degradado que tiene debajo, y se anotan los dos números. Las reglas de contraste de "Reglas de uso de tokens" y de la guía web no cambian.
- **Movimiento.** Las secciones entran subiendo y apareciendo una sola vez al llegar a la pantalla; botones, tarjetas y enlaces responden al pasar el cursor y al presionar; la foto de una tarjeta de producto crece apenas dentro de la tarjeta al pasar el cursor. Nada se mueve en el hero ni en lo que se ve al cargar la página, no hay carruseles automáticos ni animaciones en bucle, y si el script no corre el contenido se ve completo. `prefers-reduced-motion` apaga todo este movimiento.

**Bordado como motivo.** El bordado es la firma de la marca: una sola línea fina, sin rellenos. Las ilustraciones y separadores de la web usan ese mismo trazo (2px, extremos redondeados, color `ink-muted` o el color de la línea).

| Línea | Motivos |
| --- | --- |
| Descanso | Ola suave, luna sobre el mar, conchitas nacaradas |
| Día | Estrella de mar, caballito de mar, palmita, sol |

**Fotografía.** Luz natural, telas dobladas, primeros planos del bordado. Fondos claros (`bg` o `blush`). El bebé nunca mira a cámara con expresión forzada.

## Iconografía

Íconos de línea de 2px, extremos redondeados, 24px, color `ink` (o `brand` si son interactivos). Set sugerido: Lucide, por su trazo simple y licencia abierta.

## Logo

El logo actual (opción 4 de la primera exploración) es un placeholder y no está incluido en este sistema. Hasta tener el archivo final, usar la palabra "Mares" en Fraunces 600 color `brand`. Cuando llegue el logo definitivo se agrega en `assets/Logos` con sus reglas de espacio.

## Reglas de uso de tokens

- Texto sobre `bg`: `ink` o `ink-muted`. Texto sobre `brand`: `on-brand`.
- Los colores de línea nunca llevan texto encima, salvo `ink` sobre `sea-glass`, `lavender`, `blush`, `coral` o `sun` (todos superan 4.5:1). Sobre `turquoise` usar solo `ink`, nunca texto blanco.
- Un solo botón principal (`brand`) por pantalla.
- Cada color que se ve en pantalla sale de un token. No escribir hexadecimales sueltos en el código.
- Modo oscuro: los tokens ya traen su valor para el tema oscuro; la tienda puede lanzarse solo en claro y dejar el oscuro para después.
