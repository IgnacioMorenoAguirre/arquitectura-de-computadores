# Guion de exposición y Q&A — instrucción `sb $t1, 0($t0)`

> Preparado para la evaluación presencial. El profe puede preguntar cualquier cosa
> de acá abajo, así que conviene entenderlo, no solo memorizarlo.

---

## 1. Guion principal (lo que dices en voz alta)

Léelo en este orden, apoyándote en la slide 6:

> "Mi instrucción es **`sb $t1, 0($t0)`**, un store byte: guarda el contenido de `$t1`
> en la memoria, en la dirección `$t0 + 0`.
>
> Es de tipo **I** (inmediato). Sus 32 bits se dividen así:
> - **opcode = 101000** (bits 31-26): le dice a la unidad de Control que es un store.
> - **rs = 01000** (bits 25-21): registro `$t0`, la dirección base.
> - **rt = 01001** (bits 20-16): registro `$t1`, el dato que se va a guardar.
> - **inmediato = 0000000000000000** (bits 15-0): el offset, que en este caso es 0.
>
> Con el opcode, Control activa **MemWrite = 1** y **ALUSrc = 1**, y deja
> **RegWrite = 0** porque un store nunca modifica un registro.
>
> El camino activo es:
> 1. El PC entra a Instruction memory y se leen los 32 bits.
> 2. rs (`$t0`) va a Read register 1, y rt (`$t1`) va a Read register 2 — el banco
>    de registros entrega `Read data 1` = valor de `$t0` y `Read data 2` = valor de `$t1`.
> 3. El inmediato pasa por Sign-extend, que lo lleva a 32 bits con signo (sigue siendo 0).
> 4. Como ALUSrc = 1, el MUX elige la salida de Sign-extend (no `Read data 2`) como
>    segundo operando de la ALU.
> 5. ALUOp = 00 le dice a ALU control que mande el código de **sumar**; ALU control
>    manda esa señal a la ALU.
> 6. La ALU suma `$t0 + 0` y el resultado es la **dirección de memoria**.
> 7. Esa dirección entra a `Address` de Data memory. En paralelo, `Read data 2`
>    ($t1) entra directo a `Write data` — sin pasar por la ALU.
> 8. Como MemWrite = 1, la memoria escribe el byte de `$t1` en esa dirección.
> 9. No hay write-back: RegWrite = 0, así que no se toca ningún registro, y por
>    eso `Read data` de memoria y el MUX final ni se usan.
> 10. En paralelo, PC+4 avanza al programa hacia la siguiente instrucción
>     (Branch = 0, no hay salto)."

---

## 2. Señales de control, una por una (por si preguntan "¿por qué ese valor?")

| Señal | Valor | Por qué |
|---|---|---|
| RegDst | X (no importa) | No hay escritura a registro, así que da igual qué registro "elegiría" el mux de destino — nunca se usa. |
| Branch | 0 | `sb` no es un salto condicional. |
| MemRead | 0 | No se lee memoria, se escribe. |
| MemtoReg | X (no importa) | Solo se usa para decidir qué se escribe en el registro — y como RegWrite=0, no aplica. |
| ALUOp | 00 | Código fijo que le dice a ALU control "esta es una operación de suma" (para calcular direcciones, siempre se suma). |
| MemWrite | 1 | Es la señal que define que esto es un store: se **activa** la escritura en memoria. |
| ALUSrc | 1 | El segundo operando de la ALU viene del inmediato (Sign-extend), no de un registro. |
| RegWrite | 0 | Un store no modifica ningún registro. |

---

## 3. Preguntas típicas que puede hacer el profe (y respuesta corta)

**¿Por qué RegWrite es 0?**
Porque `sb` guarda un dato en memoria, no lo trae de vuelta a un registro. No hay write-back.

**¿Por qué ALUSrc es 1 y no 0?**
Porque la ALU necesita sumar `$t0` con el **offset inmediato** (0 en este caso), no con otro registro. Si fuera una instrucción tipo `add $t1,$t2,$t3`, ahí sí ALUSrc sería 0 (el segundo operando vendría de Read data 2).

**¿Qué hace la ALU exactamente?**
Suma `$t0` (dirección base) + el inmediato con signo (0) = dirección de memoria donde se escribe.

**¿Qué pasa con `Read data 2` si no pasa por la ALU?**
Va directo a `Write data` de Data memory. Es el dato a guardar, no participa en el cálculo de la dirección.

**¿Por qué `Instruction[5-0]` va a ALU control si esta instrucción no es tipo R?**
Es una conexión física fija del datapath: esos 6 bits siempre se mandan a ALU control, pero acá **no se usan de verdad**, porque `ALUOp=00` ya le dice a ALU control "suma" sin mirar esos bits. Esos bits importan cuando ALUOp=10 (instrucciones tipo R), ahí sí ALU control mira el funct para decidir entre suma, resta, AND, OR, etc.

**¿Qué le dice ALU control a la ALU?**
Le manda un código de 4 bits que en este caso significa "suma". Esa señal entra a la ALU por abajo, junto al segundo operando.

**¿Por qué no sale nada de Data memory?**
Porque `MemRead=0`. La memoria solo escribe, no entrega ningún dato de vuelta, y por eso el MUX final (el que elige entre resultado de ALU o dato leído de memoria) tampoco se usa.

**¿Qué diferencia hay con `lbu` (la de tu compañero)?**
`lbu` es la operación espejo: ahí `MemRead=1`, `RegWrite=1`, `MemtoReg=1` (todo lo que en `sb` está apagado), y sí sale un dato de `Read data` de memoria que vuelve a escribirse en un registro. `sb` es exactamente lo opuesto: los datos van **hacia** la memoria, no vuelven.

**¿Por qué el PC+4 sigue activo si esto no es un salto?**
Porque avanzar al programa (PC = PC+4) pasa en **toda** instrucción, sea cual sea. Es independiente de si hay salto o no — el salto solo cambiaría qué valor entra al MUX final de arriba (PCSrc), pero acá Branch=0 así que siempre se elige PC+4.

---

## 4. Frases clave para no trabarte

- "Es un **store**, así que los datos van hacia la memoria, no vuelven."
- "`ALUSrc=1` porque sumo con el inmediato, no con otro registro."
- "`MemWrite=1` es la señal que define que esto es un store."
- "No hay write-back porque `RegWrite=0` — no se modifica ningún registro."
- "El opcode `101000` es lo único que Control necesita para prender `MemWrite` y `ALUSrc`, y apagar `RegWrite`."
