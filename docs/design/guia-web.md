# Guía para el desarrollo web

Especificaciones para quien construya la tienda de Mares. Los valores salen de `tokens.json`; si algo aquí contradice un token, manda el token.

## Plataforma y alcance

- Tienda en Shopify, con pasarela de pago colombiana (Wompi, ePayco o Mercado Pago, a definir).
- Mobile first: la mayoría del tráfico vendrá de anuncios en el celular. Diseñar primero a 375px de ancho.
- Fase 1: configurador de personalización sin IA (motivo de bordado, nombre o inicial, color de hilo, vista previa sobre la prenda). La generación con IA queda para una fase 2, con límite de intentos por cliente.

## Rejilla y espaciado

| Punto de quiebre | Ancho | Columnas | Margen lateral | Ancho máximo del contenido |
| --- | --- | --- | --- | --- |
| Móvil | 0 a 599px | 4 | `space-4` (16px) | Fluido |
| Tablet | 600 a 1023px | 8 | `space-8` (32px) | Fluido |
| Escritorio | 1024px o más | 12 | `space-8` (32px) | 1200px centrado |

Separación entre secciones: `space-12` en móvil, `space-16` en escritorio. El hero lleva `space-24` de aire arriba y abajo en escritorio.

## Componentes

| Componente | Especificación |
| --- | --- |
| Botón principal | Fondo `brand`, texto `on-brand`, estilo `button`, radio `radius-md`, alto mínimo 48px, padding `space-3` y `space-6`. Un solo botón principal por pantalla. |
| Botón secundario | Fondo transparente, borde 2px `brand`, texto `brand`, mismas medidas que el principal. |
| Campo de formulario | Fondo `bg-raised`, borde 1px `line`, radio `radius-sm`, alto 48px, texto `body`. Etiqueta visible arriba (`label` o `body-sm`), nunca solo placeholder. |
| Tarjeta de producto | Fondo `bg-raised`, radio `radius-md`, imagen en proporción 4:5 arriba, nombre en `display-sm`, precio en `price`. `shadow-soft` solo al pasar el cursor. |
| Etiqueta de colección | Fondo `sea-glass` (Descanso) o `turquoise` (Día), texto `ink` en estilo `label`, radio `radius-pill`, padding `space-1` y `space-3`. |
| Selector de talla | Chips de `radius-pill`, borde 1px `line`; seleccionado con fondo `brand` y texto `on-brand`. Objetivo táctil mínimo 44px. |
| Encabezado | Fondo `bg`, logo a la izquierda, carrito a la derecha, línea inferior 1px `line`. Altura 64px en móvil. |
| Hero de línea | Bloque `radius-lg` con el color principal de la línea (`sea-glass` o `turquoise`), título `display-xl` (`display-lg` en móvil) en `ink`. |

## Estados interactivos

- Hover (solo escritorio): botón principal oscurece `brand` un 8%; tarjeta de producto gana `shadow-soft`.
- Foco con teclado: anillo de 2px `focus` con 2px de separación, visible en todos los controles.
- Deshabilitado: opacidad 50% y cursor `not-allowed`. Explicar el motivo con texto cerca.
- Error: borde 2px `error` y mensaje de texto debajo del campo; nunca solo color.
- Carga: esqueleto en `line` sobre `bg-raised`, sin animaciones de más de 1.2s.

## Accesibilidad

- Contraste mínimo 4.5:1 para texto normal y 3:1 para texto de 24px o más, íconos y bordes de controles.
- Los colores de línea (`sea-glass`, `lavender`, `blush`, `turquoise`, `coral`, `sun`) no se usan para texto.
- Objetivos táctiles de al menos 44 por 44px.
- Todas las imágenes de producto con texto alternativo descriptivo ("Pijama azul verdoso con ola bordada").
- Respetar `prefers-reduced-motion`: sin animaciones de desplazamiento ni zoom automático.

## Rendimiento

- Imágenes en WebP o AVIF, con `srcset` y `loading="lazy"` salvo la primera imagen visible.
- Fuentes: solo Fraunces 600 y Nunito 400, 600 y 700, con `font-display: swap`.
- Objetivo: LCP menor a 2.5s en móvil con conexión 4G.

## Comercio en Colombia

- Moneda COP, formato `$89.900`, sin decimales.
- Mostrar costo de envío antes del pago y tiempo estimado de entrega.
- Formularios de dirección con departamento y ciudad como listas, y teléfono celular de 10 dígitos.
- Política de cambios y cuidado de la prenda visibles desde la página de producto.

## Pendientes que afectan al diseño

- Logo definitivo (hoy es placeholder).
- Nombre en título, minúscula o mayúscula.
- Fotos reales de prendas bordadas.
- Pasarela de pago elegida (cambia el diseño del checkout).
