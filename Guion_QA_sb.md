# Guion de exposición y Q&A — instrucción `sb $t1, 0($t0)`

> Preparado para la evaluación presencial. Escrito con palabras simples para que
> te salga natural al hablar, no como si estuvieras leyendo un libro.

---

## 0. Cómo se dicen las cosas raras (no te trabes con esto)

No hay que sonar "técnico" — se puede hablar simple. Guía rápida:

| Se escribe | Se dice (en voz alta) |
|---|---|
| `$t0` | **"te cero"** (el signo `$` no se dice, es solo parte de cómo se escribe) |
| `$t1` | **"te uno"** |
| `sb $t1, 0($t0)` | **"ese-be, te uno, coma, cero de te cero"** — o más fácil: **"la instrucción que guarda te uno en la dirección de te cero"** |
| ALU | se dice tal cual, **"a-ele-u"**, o simplemente "la ALU" |
| MUX | puedes decir **"el selector"** en vez de MUX — significa lo mismo y es más fácil |
| opcode | **"código de operación"** (así, en español, si prefieres no decir "opcode") |
| ALUOp | **"ALU-op"**, o simplemente "la señal que le dice a ALU control qué hacer" |
| ALUSrc | **"ALU-Sers"**, o simplemente "la señal del selector" |
| Sign-extend | **"el bloque que estira el número a 32 bits"** — no hace falta decir "Sign-extend" si no te sale cómodo |
| write-back | **"escribir de vuelta en un registro"** — evita el término en inglés si no te acomoda |

**Tip:** si te trabas con un nombre técnico, dilo en español simple ("el selector", "la memoria", "el registro te uno") — el profe entiende igual y te va a sonar más natural que leer.

---

## 1. Guion principal (lo que dices en voz alta)

> "Mi instrucción es `sb`, que guarda un dato en la memoria. Guarda lo que hay en
> el registro **te uno**, en la dirección que apunta el registro **te cero**, sin
> sumarle nada (el offset es 0).
>
> Es una instrucción tipo **I**, o sea, con un número (inmediato) adentro. Sus 32
> bits se separan así:
> - Los primeros 6 bits son el **código de operación**: `101000`. Con esto, la
>   unidad de Control ya sabe que es un guardado (store).
> - Los siguientes 5 bits dicen qué registro es la base: `01000`, que es **te cero**.
> - Los siguientes 5 bits dicen qué dato se guarda: `01001`, que es **te uno**.
> - Los últimos 16 bits son el número que se suma (el offset): puro cero.
>
> Con solo leer el código de operación, Control prende dos señales: **prende la
> escritura en memoria**, y **prende el selector** (para usar el número, no otro
> registro). Y apaga la señal de **escribir en un registro**, porque un guardado
> nunca cambia un registro.
>
> Ahora el camino, paso a paso:
> 1. El PC (el contador de programa) apunta a la memoria de instrucciones y ahí
>    se leen los 32 bits.
> 2. Del banco de registros se leen dos valores: el de **te cero** (la dirección)
>    y el de **te uno** (el dato a guardar).
> 3. El offset (puro cero) pasa por el bloque que lo estira a 32 bits.
> 4. Como el selector está prendido, se elige ese número estirado, y no el otro
>    registro, para sumarlo.
> 5. La ALU suma **te cero más cero**, y ese resultado es la dirección donde se
>    va a escribir.
> 6. Esa dirección entra a la memoria. Al mismo tiempo, el valor de **te uno**
>    entra directo a la memoria también, pero como el dato a guardar — sin pasar
>    por la ALU.
> 7. Como la señal de escritura está prendida, la memoria guarda ese byte ahí.
> 8. No se escribe nada de vuelta en ningún registro, porque esa señal está
>    apagada. Un guardado no cambia registros.
> 9. Y en paralelo, como siempre, el programa avanza a la siguiente instrucción."

---

## 2. Señales de control, una por una

| Señal | Valor | Por qué (en palabras simples) |
|---|---|---|
| RegDst | no importa | No se va a escribir en ningún registro, así que da lo mismo. |
| Branch | apagada (0) | Esto no es un salto. |
| MemRead | apagada (0) | No se lee la memoria, se escribe. |
| MemtoReg | no importa | Solo sirve si se va a escribir en un registro — y acá no se escribe. |
| ALUOp | suma (00) | Le dice a ALU control "quiero que sumes", fijo, sin mirar nada más. |
| MemWrite | prendida (1) | Esta es la señal clave: dice "esto es un guardado". |
| ALUSrc (selector) | prendido (1) | La ALU va a sumar con el número (offset), no con otro registro. |
| RegWrite | apagada (0) | Un guardado no cambia ningún registro. |

---

## 3. Preguntas típicas del profe (con respuesta corta y simple)

**¿Por qué no se escribe en ningún registro?**
Porque esta instrucción guarda un dato en memoria — no trae nada de vuelta a un registro.

**¿Por qué el selector está prendido?**
Porque la ALU tiene que sumar el registro **te cero** con el número que viene en la instrucción (el offset), no con otro registro.

**¿Qué calcula la ALU acá?**
Solo la dirección: **te cero más el offset** (que es cero). Ese resultado es dónde se va a guardar el dato.

**¿Y el valor de te uno, por dónde pasa?**
No pasa por la ALU. Va directo a la memoria como el dato que se va a guardar.

**¿Por qué se manda algo a ALU control si esta instrucción no lo necesita?**
Porque el cableado es siempre el mismo, para todas las instrucciones. Esos bits se mandan siempre, pero acá no importan, porque la otra señal (la del "quiero sumar") ya le dice a ALU control qué hacer sin mirar esos bits. Esos bits sí importan en otro tipo de instrucciones (las que hacen operaciones entre dos registros).

**¿Qué le manda ALU control a la ALU?**
Un código que en este caso significa "suma". Esa señal entra a la ALU junto con los dos números que va a sumar.

**¿Por qué no sale nada de la memoria?**
Porque no se está leyendo, se está escribiendo. Leer memoria es lo que hace la instrucción contraria a esta (la que carga un dato desde memoria a un registro).

**¿En qué se diferencia de la instrucción de tu compañero (la que carga datos)?**
Es exactamente al revés: la de él trae un dato de la memoria y lo guarda en un registro. La mía toma un dato de un registro y lo guarda en la memoria. Por eso casi todas las señales están invertidas entre las dos.

**¿Por qué el programa sigue avanzando si esto no es un salto?**
Porque avanzar al programa pasa siempre, en toda instrucción. Un salto es la excepción, no la regla — y acá no hay salto.

---

## 4. Frases cortas para no quedarte en blanco

- "Esto guarda un dato en memoria, no lo trae de vuelta."
- "El selector está prendido porque sumo con el número, no con otro registro."
- "La señal de escritura en memoria es la que define que esto es un guardado."
- "No se escribe en ningún registro — por eso esa señal está apagada."
- "Con el código de operación alcanza para prender la escritura en memoria y el selector, y apagar la escritura en registro."
