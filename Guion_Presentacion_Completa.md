# Guion de la presentación completa (11 slides, ~10 minutos)

> Cubre todo el deck actual. Las partes que no son tuyas (slides compartidas,
> `beq`, `lbu`) están en versión corta, solo para que sepas el hilo completo
> y puedas seguir si alguien se traba. Tu parte fuerte (`sb`) tiene el detalle
> completo en `Guion_QA_sb.md` — acá va la versión resumida para no repetir.

**Tiempo sugerido total: ~9 minutos**, dejando 1 minuto de colchón para
transiciones o que el profe interrumpa con una pregunta.

---

## Slide 1 — Portada (≈10 seg)

> "Buenos días/tardes. Somos Rodrigo, Wladimir e Ignacio, y vamos a presentar
> el laboratorio de Assembler MIPS: un conversor de minúsculas a mayúsculas,
> con su mapeo en el datapath."

---

## Slide 2 — MIPS (≈35 seg)

> "MIPS es una arquitectura de 32 bits, con instrucciones simples y de largo
> fijo. En nuestro algoritmo usamos los tres formatos: tipo R, como `move`;
> tipo I, que es la mayoría — `lbu`, `beq`, `slti`, `bne`, `addi`, `sb`, `la`;
> y tipo J, los saltos directos como `j` y `jal`. O sea, entre todas las
> instrucciones se cubren prácticamente todos los componentes del datapath."

---

## Slide 3 — Datapath (componentes) (≈35 seg)

> "Antes de entrar al detalle, esta es la lista de componentes del datapath
> y para qué sirve cada uno: el PC guarda la dirección de la instrucción
> actual; la memoria de instrucciones la entrega; la unidad de Control decodifica
> el opcode y prende las señales; el banco de registros lee y escribe datos;
> la ALU hace las operaciones; la memoria de datos lee y escribe bytes del
> string; Sign-Extend estira el inmediato a 32 bits; y los MUX seleccionan
> entre distintas fuentes según las señales de control."

---

## Slide 4 — Señales de control (≈35 seg)

> "Estas señales las prende la unidad de Control según el opcode. Cada una
> tiene un rol puntual: RegDst elige el registro destino, ALUSrc elige si el
> segundo operando de la ALU es un registro o un inmediato, MemRead y
> MemWrite habilitan lectura o escritura en memoria, RegWrite habilita
> escritura en un registro, MemtoReg elige si el dato viene de la ALU o de
> memoria, Branch habilita la evaluación de saltos, y ALUOp le dice a la ALU
> qué operación hacer. Estas mismas señales son las que vamos a prender y
> apagar en cada instrucción que mapeamos."

---

## Slide 5 — Etapas del procesador monociclo (≈40 seg)

> "Toda instrucción, sin excepción, pasa por 5 etapas en un mismo ciclo de
> reloj: Fetch, donde se busca la instrucción en memoria usando el PC;
> Decode, donde Control interpreta el opcode y se leen los registros;
> Execute, donde la ALU hace su operación; Memory Access, que solo aplica
> si la instrucción lee o escribe memoria; y Write Back, donde se actualiza
> el registro destino si corresponde. En las siguientes slides van a ver
> exactamente qué pasa en cada etapa para tres instrucciones distintas."

---

## Slide 6 — Código HLL (Python) (≈40 seg)

> "Este es el algoritmo en alto nivel, en Python. Recorre la palabra
> carácter por carácter, obtiene su valor ASCII, y si está entre 97 y 122
> (o sea, es una letra minúscula), le resta 32 para convertirla en mayúscula.
> Si ya está en mayúscula o es otro símbolo, se deja igual."

---

## Slide 7 — Código LLL (Ensamblador) (≈45 seg)

> "Y este es el mismo algoritmo, pero en ensamblador MIPS. `main` llama a la
> función `transformar`, que recorre la cadena con un puntero (`$t0`). En
> cada vuelta del bucle: se carga el carácter con `lbu`, se verifica con dos
> `slti` si está en el rango de una minúscula, y si lo está, se le resta 32
> con `addi` y se guarda de vuelta con `sb`. Después se avanza al siguiente
> byte y se repite, hasta encontrar el carácter nulo que marca el final del
> texto."

*(Si te preguntan algo más específico del código completo, tienes el detalle
en `Explicacion_Codigo_Completo.md` — registro por registro, con un ejemplo
trazado con la palabra "hola".)*

---

## Slide 8 — Datapath `beq` (≈1 min 30 seg, para quien la presente)

> "La instrucción es `beq $t1, $zero, fin`: compara si `$t1` es igual a cero,
> y si es así, salta a la etiqueta `fin`. El opcode `000100` prende `Branch`
> y pone `ALUOp` en `01` (resta), porque la ALU calcula `$t1 - $zero` y usa
> la señal Zero para decidir si son iguales. No hay escritura en memoria ni
> en registros — `beq` solo compara y decide si saltar. Por eso todo el
> camino de arriba (el cálculo de la dirección de salto con Shift-left-2 y
> el sumador de branch) está activo, junto con la compuerta AND que combina
> Branch con Zero para decidir el próximo PC."

---

## Slide 9 — Datapath `lbu` (≈1 min 30 seg, para quien la presente)

> "La instrucción es `lbu $t1, 0($t0)`: carga el byte en la dirección `$t0`
> y lo guarda en `$t1`. El opcode `100100` prende `MemRead` y `RegWrite`, y
> `MemtoReg`, porque el dato que se escribe en el registro viene de memoria,
> no de la ALU. Es exactamente el camino contrario al de `sb`: acá el dato
> **sale** de memoria y **entra** a un registro."

---

## Slide 10 — Datapath `sb` — TU PARTE (≈1 min 45 seg)

> "Mi instrucción es `sb`, que guarda un dato en la memoria: guarda lo que
> hay en el registro **te uno**, en la dirección que apunta el registro
> **te cero**. Con el opcode `101000`, Control prende la escritura en
> memoria y el selector (para usar el inmediato, no otro registro), y apaga
> la escritura en un registro, porque un guardado nunca cambia un registro.
>
> El camino: se leen te cero y te uno del banco de registros, el inmediato
> pasa por Sign-extend, la ALU suma te cero más cero para obtener la
> dirección, y en paralelo el valor de te uno entra directo a la memoria
> como el dato a guardar. Como la señal de escritura está prendida, la
> memoria guarda ese byte ahí. No hay write-back, porque un guardado no
> cambia registros."

*(Guion completo, con Q&A y frases de apoyo, en `Guion_QA_sb.md`.)*

---

## Slide 11 — Conclusiones (≈30 seg)

> "En resumen: este laboratorio nos permitió consolidar el uso de
> instrucciones condicionales, lógicas y llamadas al sistema en
> ensamblador, entendiendo lo estricto que es el orden de ejecución. Y el
> estudio del datapath nos dio una visión clara de que cada línea de código
> activa compuertas, multiplexores y registros físicos reales — no es solo
> texto, es hardware funcionando. Muchas gracias."

---

## Notas de tiempo

- Si van sumando los tiempos sugeridos da **~9 minutos**, dejando margen.
- Las slides 8 y 9 (`beq`, `lbu`) están resumidas porque no son tu parte —
  no hace falta que te las aprendas al detalle, solo para que entiendas el
  hilo si alguien pregunta algo cruzado ("¿en qué se parece tu instrucción a
  la de tu compañero?").
- Si el profe corta a mitad de una slide con una pregunta, no pasa nada:
  respondan y retomen donde quedaron.
