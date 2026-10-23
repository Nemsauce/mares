# Diseño de Mares

Reemplaza a `docs/design/README.md` y `docs/design/guia-web.md`. Va en `docs/DESIGN.md`.

Este documento tiene dos partes. Las **reglas** son pocas y no se negocian. Las
**recomendaciones** son todo lo demás: dicen qué suele funcionar y por qué, para
que decidas con el dato en la mano. Si quieres hacer otra cosa, hazla.

Los valores viven en `docs/design/tokens.json`, que es lo que lee el script que
genera el CSS. Este documento explica cómo usarlos, no los repite.

---

## Las reglas

Son cuatro de accesibilidad y una de paleta. Existen porque sin ellas la tienda
deja de servirle a gente real: a quien compra con el celular al sol, a quien no
distingue ciertos colores, a quien navega con teclado.

**1. Contraste.** Texto normal, 4.5 a 1 contra lo que tenga debajo. Texto de
24px o más, íconos y bordes de controles, 3 a 1. Sobre un degradado o una foto
se mide contra el punto más claro y el más oscuro, y se anotan los dos números.

**2. Área táctil.** Cualquier cosa que se toque, mínimo 44 por 44px. Un enlace
dentro de un párrafo es la excepción.

**3. Foco visible.** Todo control muestra dónde está el foco del teclado. El
anillo usa `--focus-ring-color`, que ya cambia solo dentro de los bloques de
color de línea.

**4. El color nunca va solo.** Un error lleva texto, no solo borde rojo. Una
talla agotada lo dice, no solo se ve gris. Una opción seleccionada tiene una
marca, no solo relleno.

**5. Todo color sale de un token.** Ningún hexadecimal fuera de
`assets/tokens.css`. Si necesitas un color que no existe, se agrega a
`tokens.json` y se regenera. Esto es lo que hace que la tienda se vea como una
sola cosa y no como diez páginas distintas.

Los colores de hilo del configurador son la única excepción: son datos del
negocio, no del diseño.

---

## Color

La base es `bg` (perla) con texto `ink`. El azul `brand` es el color de acción:
botones principales, enlaces, el logo.

Los seis colores de línea pertenecen a su línea y no se mezclan entre sí:

| Línea | Principal | Acento | Suave |
| --- | --- | --- | --- |
| Descanso | sea-glass | lavender | blush |
| Día | turquoise | coral | sun |

**Recomendado:** una línea por página. El inicio, el carrito y el checkout sin
colores de línea, porque son páginas de todas las líneas a la vez.

**Por qué:** cuando dos líneas comparten pantalla, la identidad de cada una se
diluye y el cliente deja de leerlas como dos mundos distintos.

**Ojo con esto:** los seis colores de línea son pastel y ninguno sirve para
texto. `ink` encima de ellos sí funciona en el tema claro. En el tema oscuro no,
por eso existe `--color-on-line`.

Para dar ritmo a una página general, alternar `bg`, `bg-raised` y el perla más
hondo entre secciones funciona bien. Una página entera del mismo color se siente
plana aunque todo lo demás esté bien.

---

## Tipografía

Fraunces para títulos, Nunito para texto. Los tamaños salen de los tokens de
tipo; no se inventan intermedios.

**Recomendado:** cada título lleva su clase de tipo explícita. Los encabezados
heredan el tamaño del cuerpo por defecto, así que uno sin clase se ve igual que
un párrafo.

**Recomendado:** un `h1` por página. Si una sección ya lo trae, las demás bajan
un nivel.

Partir un título en dos colores (la primera parte en `ink` y la segunda en
`brand`) funciona bien para encabezados de sección. La etiqueta pequeña en
mayúsculas encima ayuda a ubicar al lector.

---

## Forma, profundidad y movimiento

Aquí casi todo es tuyo. Lo que sigue es lo que suele funcionar en esta marca.

**Esquinas.** Generosas. `radius-md` en botones y tarjetas, `radius-lg` en
bloques grandes, `radius-pill` en chips y etiquetas.

**Sombras.** Suaves. En reposo sobre tarjetas y superficies elevadas, más honda
al pasar el cursor. **No funcionan bien** en texto, íconos, campos de formulario
ni franjas a todo el ancho, porque ahí leen como suciedad y no como relieve. Y
una sombra nunca debería ser la única señal de un estado: eso choca con la regla
4.

**Degradados.** Funcionan en superficies grandes: el velo sobre una foto, un
bloque de color de línea que pasa de su principal a su acento. **Suelen fallar**
en botones y controles pequeños, donde el ojo lee el cambio de color como un
error de renderizado. Si va texto encima, aplica la regla 1 en los dos extremos.

**Movimiento.** Las secciones que entran al bajar, las transiciones al pasar el
cursor y un zoom leve de la foto dentro de la tarjeta funcionan bien. **Suele
fallar** mover lo que ya está en pantalla al cargar, porque compite con el
contenido que la persona vino a leer, y los carruseles automáticos, porque la
gente casi no ve lo que pasa después de la primera diapositiva.

Pase lo que pase, `prefers-reduced-motion` apaga todo lo que no sea esencial.
Hay gente a la que el movimiento le produce mareo literal.

---

## Rejilla y espacio

| Ancho | Columnas | Margen lateral | Contenido máximo |
| --- | --- | --- | --- |
| 0 a 599px | 4 | space-4 | fluido |
| 600 a 1023px | 8 | space-8 | fluido |
| 1024px o más | 12 | space-8 | 1200px centrado |

Dos puntos de quiebre: 600px y 1024px. **Por qué solo dos:** cada punto de
quiebre extra multiplica lo que hay que probar, y con dos ya se cubre el rango
real de pantallas.

Entre secciones, `space-12` en móvil y `space-16` en escritorio. El hero respira
más.

---

## Componentes

Lo que ya está construido y sus medidas:

| Componente | Medidas |
| --- | --- |
| Botón principal | Fondo `brand`, texto `on-brand`, alto mínimo 48px, `radius-md` |
| Botón secundario | Borde 2px `brand`, fondo transparente, mismas medidas |
| Campo | Fondo `bg-raised`, borde 1px `--control-border`, alto 48px, etiqueta siempre visible |
| Chip | `radius-pill`, mínimo 44px, seleccionado con relleno `brand` y una marca |
| Etiqueta de colección | `radius-pill`, estilo `label`, dentro de una superficie de línea |
| Tarjeta de producto | `bg-raised`, `radius-md`, imagen 4:5, nombre `display-sm`, precio `price` |

**Recomendado:** un botón principal por pantalla. **Por qué:** si todo pesa
igual, nada guía. El resto van secundarios o enlaces.

**Ojo:** un botón secundario sobre un color de línea no pasa contraste. Ahí va
el principal, o texto `ink`.

---

## Bordado e ilustración

El bordado es la firma visual. Trazo de una sola línea, 2px, extremos
redondeados, sin rellenos.

| Línea | Motivos |
| --- | --- |
| Descanso | Ola suave, luna sobre el mar, conchitas nacaradas |
| Día | Estrella de mar, caballito de mar, palmita, sol |

Íconos de interfaz: Lucide, 24px, trazo 2px. Son otra cosa que los motivos y no
se mezclan.

---

## Fotografía

Luz natural, telas dobladas, primeros planos del bordado, fondos claros.

**Recomendado:** el bebé nunca mirando a cámara con expresión forzada. **Por
qué:** la marca habla bajito, y una foto posada rompe ese tono.

Proporción 4:5 en producto, para que la cuadrícula quede pareja.

**Hoy son generadas.** Antes de vender hay que reemplazarlas por fotos reales de
las prendas reales, porque un cliente que compra viendo una foto generada recibe
otra cosa.

---

## Logo

Hasta que llegue el definitivo, la palabra Mares en Fraunces 600 color `brand`.
Cuando llegue, se sube a los archivos de la tienda y se elige en el encabezado.

---

## Modo oscuro

Los tokens ya traen sus valores oscuros. No está encendido y no hace falta para
lanzar.

**Antes de encenderlo** hay que resolver una cosa: los seis colores de línea
tienen un solo valor para los dos temas, así que `ink` encima de ellos falla en
oscuro. El alias `--color-on-line` ya existe para eso, pero hay que revisar cada
superficie de línea y cada anillo de foco dentro de ellas.

---

## Cuando quieras cambiar algo de aquí

Las recomendaciones se cambian sin pedirle permiso a nadie: son tuyas. Las cinco
reglas de arriba conviene no tocarlas, y si las tocas, que sea a sabiendas de
qué se pierde.

Lo que sí hay que hacer siempre: si cambias un valor, cámbialo en
`tokens.json` y regenera. Si cambias una recomendación, escríbela aquí. Un
documento que no refleja lo que hace el código deja de servir y vuelve a aparecer
la confusión.
