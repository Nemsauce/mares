# Decisiones del configurador

Respuestas cerradas a las preguntas C-1 a C-17 de `docs/CONFIGURATOR_PLAN.md`.
Va en `docs/content/respuestas-configurador.md`.

Si algo aquí contradice al plan del configurador, manda este archivo.

---

**C-1. La personalización es opcional.**
Se puede comprar la prenda sin nombre y llega con su bordado de catálogo. Si el
cliente no escribe nombre, no se le piden color de hilo ni posición.

**C-2. El motivo se puede cambiar.**
El motivo propio de la prenda viene preseleccionado. El cliente puede cambiarlo
por cualquier otro de su misma línea. El nombre del producto describe el motivo
por defecto, no una obligación.

**C-3. Los seis productos son personalizables.**

**C-4. Largo máximo del nombre, por tipo de prenda.**

| Prenda | Máximo |
| --- | --- |
| Manta | 16 caracteres |
| Pijama, enterizo, body | 12 caracteres |
| Gorro | 8 caracteres |

Provisional. Depende del tamaño de la prenda y de lo que quepa bordado de
verdad. Se ajusta cuando el taller borde el primero.

**C-5. Caracteres permitidos.**
Letras con tildes y ñ, espacio, guion y apóstrofo. Entran "María José",
"Ana-Lucía" y "D'Angela". Sin números, sin emoji, sin otros signos.

**C-6. El nombre se borda tal como se escribe**, con la primera letra en
mayúscula automáticamente. No se fuerza todo a mayúsculas.

**C-7. La paleta de hilos es la de `docs/content/colores-hilo.md`.**
23 colores. Se trabaja con los nombres, sin referencia de marca de hilo por
ahora (ver deudas al final).

**C-8. Los 23 colores se ofrecen en todas las prendas.**
Si más adelante algún color no funciona en cierta tela, se limita entonces.

**C-9. La tipografía del nombre en la vista previa es Fraunces 600,
provisional.** Se decide con una foto de un nombre bordado real.

**C-10. Posiciones con nombre, no arrastre libre.**
El cliente escoge entre los sitios que cada prenda permite:

| Prenda | Posiciones |
| --- | --- |
| Pijama ola suave | Centro del pecho, pecho izquierdo |
| Enterizo caballito de mar | Centro del pecho, pecho izquierdo |
| Body estrella de mar | Centro del pecho, pecho izquierdo |
| Gorro conchitas | Borde |
| Manta luna sobre el mar | Esquina |
| Manta palmita | Esquina |

El nombre va debajo del motivo, más pequeño. El arrastre libre queda como
pregunta de fase 2, cuando se sepa qué piden los clientes.

**C-11. Las fotos de hoy son generadas.**
Las posiciones de la vista previa hay que volver a medirlas cuando lleguen las
fotos reales de las prendas.

**C-12. Los textos del configurador** se escriben en la voz del README, con las
demás respuestas ya cerradas.

**C-13. Los pedidos personalizados demoran al menos 3 días más.**
Eso se dice junto al configurador, antes de agregar al carrito, no en el
checkout. Texto propuesto: "Las prendas personalizadas se bordan a mano y
tardan al menos 3 días más en salir."

**C-14. Cada pedido personalizado se revisa manualmente antes de bordar.**
La página no puede validar del lado del servidor, así que la revisión humana es
el control real sobre lo que llega escrito.

**C-15. Aviso visible más casilla obligatoria.**
Antes de agregar al carrito, el cliente marca que entiende que las prendas
personalizadas no tienen cambio. La casilla deja constancia de que lo leyó.
Pendiente de verificación legal: en Colombia el derecho de retracto tiene
excepciones para bienes hechos a la medida, pero eso lo confirma un abogado,
no este documento.

**C-16. Las claves ocultas sí se envían al pedido.**
No las ve el cliente y le sirven al taller.

**C-17. Un solo campo para nombre o inicial.**
Quien quiera una inicial escribe una letra.

---

## Lo que cambia respecto al plan original

1. Entra una cuarta opción: la posición, con sus chips.
2. El pedido lleva una propiedad más: `Ubicación`.
3. Cada producto necesita saber qué posiciones permite y dónde cae cada una
   sobre su foto.
4. El largo máximo del nombre depende del tipo de prenda, no es uno solo.
5. Si no se escribe nombre, se ocultan color de hilo, posición y la casilla.
6. El aviso de los 3 días va en la página de producto, junto al configurador.

## Deudas, no bloqueos

1. **Los colores no tienen referencia de hilo.** Mientras borde la misma
   persona funciona, porque sabe cuál es su "verde agua". El día que entre
   alguien más al taller, un pedido que diga "verde agua" es ambiguo. Conviene
   anotar la referencia real cuando se compre el hilo.
2. **Los largos máximos son estimados.** Se ajustan con la primera prenda
   bordada de verdad.
3. **Las fotos son generadas**, así que las posiciones de la vista previa son
   aproximadas hasta tener las reales.
4. **La casilla de no cambio no está verificada legalmente.**
