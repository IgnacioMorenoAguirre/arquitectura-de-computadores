# Explicación completa del código — por si preguntan más que tu instrucción

> Esto es para cuando el profe (o un compañero) te pida explicar el programa
> completo, no solo el mapeo de `sb`. Ejemplos: "¿qué hace este registro en
> todo el programa?", "¿por qué se usa `addi` con -32?", "hazme un ejemplo con
> una palabra".

---

## 0. Qué hace el programa, en una frase

Recibe un texto y lo convierte todo a mayúsculas, letra por letra, dejando el
resto de los caracteres (números, mayúsculas, símbolos) sin tocar.

---

## 1. Para qué sirve cada registro (durante todo el programa)

| Registro | Para qué se usa | Se dice |
|---|---|---|
| `$a0` | Al principio guarda la dirección del texto completo (el parámetro que recibe la función). | "a-cero" |
| `$t0` | El **puntero**: la dirección del carácter que se está mirando en este momento. Avanza de a uno en cada vuelta del bucle. | "te cero" |
| `$t1` | El **carácter actual**: el byte que se leyó de memoria en la dirección de `$t0`. Si es minúscula, se modifica antes de guardarlo. | "te uno" |
| `$t3` | Una **bandera temporal**: guarda 1 o 0 según el resultado de una comparación (¿es menor que tal número?). Se usa y se descarta enseguida. | "te tres" |
| `$v0` | El código que le dice al sistema qué operación hacer (imprimir, terminar el programa, etc.). | "ve-cero" |
| `$ra` | La dirección a la que hay que volver cuando termina la función (return address). | "ere-a" |
| `$zero` | Siempre vale 0. Se usa para comparar. | "registro cero" |

**La idea clave:** `$t0` **recorre** el texto de principio a fin (avanza de a un
byte), y `$t1` es **el dato** que se lee, se revisa, y a veces se cambia, en
cada posición por la que pasa `$t0`.

---

## 2. El código, línea por línea

```asm
main:
    la   $a0, mensaje      # $a0 = dirección donde empieza el texto
    jal  transformar       # llama a la función que hace el trabajo
    li   $v0, 4            # código de "imprimir texto"
    syscall
    li   $v0, 10           # código de "terminar programa"
    syscall

transformar:
    move $t0, $a0          # $t0 = copia de la dirección (para no perder $a0)
bucle:
    lbu  $t1, 0($t0)       # $t1 = el byte que está en la dirección de $t0
    beq  $t1, $zero, fin   # si ese byte es 0 (fin del texto), termina
    slti $t3, $t1, 97      # $t3 = 1 si $t1 es menor que 'a' (97)
    bne  $t3, $zero, continuar   # si es menor que 'a', no es minúscula: saltar
    slti $t3, $t1, 123     # $t3 = 1 si $t1 es menor que 123 (una más que 'z')
    beq  $t3, $zero, continuar   # si NO es menor que 123, no es minúscula: saltar
    addi $t1, $t1, -32     # es minúscula: restarle 32 la convierte en mayúscula
    sb   $t1, 0($t0)       # guardar el byte ya modificado
continuar:
    addi $t0, $t0, 1       # avanzar el puntero al siguiente byte
    j    bucle             # repetir con el siguiente carácter
fin:
    jr   $ra               # terminar y volver a main
```

**En palabras simples, el bucle hace esto en cada vuelta:**
1. Lee un carácter.
2. Si es el final del texto, termina.
3. Si el carácter **no** está entre `'a'` y `'z'`, lo deja igual.
4. Si **sí** está entre `'a'` y `'z'`, le resta 32 (eso lo convierte en mayúscula)
   y lo vuelve a guardar en el mismo lugar.
5. Avanza al siguiente carácter y repite.

---

## 3. Ejemplo con una palabra: recorriendo `"hola"`

| Vuelta | `$t0` apunta a | `$t1` (leído) | ¿Es minúscula? | ¿Qué pasa | Se guarda |
|---|---|---|---|---|---|
| 1 | posición 0 | `h` (104) | sí (97 ≤ 104 < 123) | 104 − 32 = 72 | `H` |
| 2 | posición 1 | `o` (111) | sí | 111 − 32 = 79 | `O` |
| 3 | posición 2 | `l` (108) | sí | 108 − 32 = 76 | `L` |
| 4 | posición 3 | `a` (97) | sí | 97 − 32 = 65 | `A` |
| 5 | posición 4 | `\0` (0) | — | es el carácter nulo → `beq` salta a `fin` | (no se guarda nada) |

Resultado: `"hola"` → `"HOLA"`.

**Si el carácter ya fuera mayúscula o un símbolo** (por ejemplo `'C'` = 67, o
`'!'` = 33), la comparación `slti $t3, $t1, 97` daría `$t3=1` (porque 67 y 33
son menores que 97), así que `bne` saltaría directo a `continuar` **sin tocar
el dato** — por eso el programa no daña lo que ya está en mayúscula.

---

## 4. Mini-glosario de instrucciones usadas (por si preguntan "¿qué hace esta línea?")

| Instrucción | Qué hace |
|---|---|
| `la $a0, mensaje` | Carga la **dirección** (load address) de la variable `mensaje` en `$a0`. |
| `jal transformar` | Llama a la función `transformar` (jump and link): salta ahí y guarda en `$ra` la dirección a la que hay que volver. |
| `li $v0, 4` / `syscall` | Carga el número 4 en `$v0` (código de "imprimir string") y ejecuta la llamada al sistema. |
| `move $t0, $a0` | Copia el valor de `$a0` a `$t0` (para tener una copia que se pueda modificar sin perder `$a0`). |
| `lbu $t1, 0($t0)` | Carga un **byte sin signo** desde la dirección `$t0` (más 0 de offset) en `$t1`. |
| `beq $t1, $zero, fin` | Si `$t1` es igual a 0, salta a la etiqueta `fin`. |
| `slti $t3, $t1, 97` | "Set less than immediate": pone `$t3 = 1` si `$t1 < 97`, si no `$t3 = 0`. |
| `bne $t3, $zero, continuar` | Si `$t3` **no** es 0, salta a `continuar`. |
| `addi $t1, $t1, -32` | Le suma −32 a `$t1` (equivale a restarle 32). |
| `sb $t1, 0($t0)` | Guarda el byte de `$t1` en la dirección `$t0` (esta es la instrucción que mapeaste en el datapath). |
| `j bucle` | Salta directo (jump) a la etiqueta `bucle`, sin condición. |
| `jr $ra` | Salta a la dirección guardada en `$ra` (vuelve de la función). |

---

## 5. Preguntas típicas sobre el código completo

**¿Por qué se usa `addi $t1, $t1, -32` y no una resta directa?**
Porque en el set de instrucciones que usamos no hay una instrucción `subi`
(restar un número fijo), así que sumar un número negativo hace exactamente lo
mismo: sumar −32 es igual a restar 32.

**¿Por qué se compara dos veces (`slti ... 97` y `slti ... 123`) en vez de una sola vez?**
Porque hay que revisar un **rango**: que el carácter sea mayor o igual que `'a'`
**y** menor o igual que `'z'`. Una sola comparación no alcanza para verificar
un rango completo, así que se necesitan dos: una para el límite de abajo y
otra para el límite de arriba.

**¿Qué significa que `$t3` sea una "bandera"?**
Que no representa un dato del programa (como sí lo hacen `$t0` o `$t1`), sino
solo el resultado de una pregunta de sí/no (¿es menor que 97?). Se usa
inmediatamente después y no importa su valor en el resto del programa.

**¿Cómo sabe el programa cuándo termina el texto?**
Los strings en este estilo terminan con un byte en 0 (el carácter nulo, `\0`).
Por eso el `beq $t1, $zero, fin` corta el bucle apenas se lee ese 0.

**¿Qué pasaría si la palabra ya viene en mayúsculas?**
Nada cambia: cada letra falla la comparación `slti $t3, $t1, 97` (porque una
mayúscula vale menos de 97 en ASCII), así que el programa salta a `continuar`
sin modificarla.

**¿Por qué `$t0` se copia de `$a0` en vez de usar `$a0` directamente?**
Por costumbre/orden: `$a0` es el parámetro de entrada de la función, y es más
prolijo dejarlo sin tocar y trabajar con una copia (`$t0`) que sí se va a ir
modificando en el bucle.

**¿Cuántas veces se ejecuta `sb`?**
Una vez por **cada letra minúscula** del texto — no una vez por cada carácter.
Los caracteres que no son minúsculas nunca llegan a la línea del `sb` porque
el `bne`/`beq` los saltan antes.
