# Mapeo del datapath — Laboratorio MIPS (MARS)

**Problema:** convertir una cadena de minúsculas a mayúsculas.
**Algoritmo:** se recorre la cadena `"holaComoEstas"` byte a byte; si el carácter
está entre `'a'` (97) y `'z'` (122), se le resta 32 a su código ASCII (lo que lo
convierte en mayúscula) y se vuelve a guardar. Resultado: `HOLACOMOESTAS`.

Este documento es la **fuente de verdad** del mapeo: sirve para el informe y la
presentación. Lo central de la evaluación no es el código, sino explicar **cómo
viaja cada instrucción por los componentes físicos de la CPU (el datapath)** y
qué **señales de control** se activan.

---

## 1. El programa MIPS y el tipo de cada instrucción

```mips
.data
    mensaje: .asciiz "holaComoEstas"
.text
main:
    la   $a0, mensaje        # pseudo -> lui + ori   (cargar dirección)
    jal  transformar         # J-type  (salto y enlace, guarda retorno en $ra)
    li   $v0, 4              # pseudo -> addiu       (código de imprimir cadena)
    syscall                  # llamada al sistema (imprime la cadena ya transformada)
    li   $v0, 10             # pseudo -> addiu       (código de salida)
    syscall                  # llamada al sistema (terminar)

transformar:
    move $t0, $a0            # pseudo -> addu (R-type) copiar puntero

bucle:
    lbu  $t1, 0($t0)         # I-type  LOAD  (leer 1 byte de memoria de datos)
    beq  $t1, $zero, fin     # I-type  BRANCH (si es '\0', terminar)
    slti $t3, $t1, 97        # I-type  ALU-inmediato (¿menor que 'a'?)
    bne  $t3, $zero, continuar
    slti $t3, $t1, 123       # I-type  ALU-inmediato (¿menor que 123, o sea <= 'z'?)
    beq  $t3, $zero, continuar
    addi $t1, $t1, -32       # I-type  ALU-inmediato (restar 32 = a mayúscula)
    sb   $t1, 0($t0)         # I-type  STORE (escribir 1 byte en memoria de datos)
continuar:
    addi $t0, $t0, 1         # I-type  ALU-inmediato (avanzar puntero)
    j    bucle               # J-type  (salto incondicional)
fin:
    jr   $ra                 # R-type  (volver a la rutina llamante)
```

| Tipo | Formato | Instrucciones del programa |
|---|---|---|
| **R-type** | op rs rt rd shamt funct | `move` (→ `addu`), `jr` |
| **I-type** | op rs rt inmediato | `lbu`, `sb`, `beq`, `bne`, `slti`, `addi`, `li` |
| **J-type** | op dirección | `j`, `jal` |

---

## 2. Componentes del datapath (la rúbrica pide **mínimo 6** para nota 5)

| # | Componente | Qué hace en este programa |
|---|---|---|
| 1 | **PC** (Program Counter) | Guarda la dirección de la instrucción actual; se actualiza a PC+4 o al destino de un salto |
| 2 | **Memoria de instrucciones** | Entrega la instrucción de 32 bits que está en la dirección del PC |
| 3 | **Banco de registros** | Lee `$t0`, `$t1`, `$a0`… y escribe resultados (`$t1`, `$t0`, `$t3`) |
| 4 | **ALU** | Suma (`addi`), compara (`slti`, `beq`/`bne`) y calcula direcciones (`lbu`/`sb`) |
| 5 | **Memoria de datos** | `lbu` lee 1 byte; `sb` escribe 1 byte |
| 6 | **Unidad de control** | Decodifica el opcode y activa las señales (RegWrite, ALUSrc, etc.) |

**Componentes de apoyo (suman para el mapeo "de todas las componentes"):**
extensor de signo (extiende el inmediato de 16 a 32 bits), sumadores (PC+4 y
destino de salto), desplazador `<<2`, y multiplexores (RegDst, ALUSrc, MemtoReg,
PCSrc, Jump).

---

## 3. Las 5 etapas del datapath de ciclo único

1. **Fetch** — se lee la instrucción desde la memoria de instrucciones usando el PC (siempre ocurre).
2. **Decode / leer registros** — la unidad de control decodifica el opcode y el banco de registros lee `rs` y `rt`.
3. **Execute (ALU)** — la ALU suma, resta o compara; si hay inmediato, primero se extiende el signo.
4. **Memory** — solo `lbu`/`sb` acceden a la memoria de datos.
5. **Write-back** — el resultado (de la ALU o de la memoria) vuelve al banco de registros.

---

## 4. Tabla maestra de señales de control

`X` = no importa (don't care). ALUOp: `add` suma · `sub` resta · `slt` set-less-than · `funct` lo decide el campo función.

| Grupo (instrucciones) | RegDst | ALUSrc | MemtoReg | RegWrite | MemRead | MemWrite | Branch | Jump | ALUOp |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **R-type** (`move`/`addu`, `jr`) | 1 | 0 | 0 | move:1 / jr:0 | 0 | 0 | 0 | 0 | funct |
| **ALU-inmediato** (`addi`, `slti`, `li`) | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | add / slt |
| **Load** (`lbu`) | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | add |
| **Store** (`sb`) | X | 1 | X | 0 | 0 | 1 | 0 | 0 | add |
| **Branch** (`beq`, `bne`) | X | 0 | X | 0 | 0 | 0 | 1 | 0 | sub |
| **Jump** (`j`, `jal`) | X | X | X | j:0 / jal:1 | 0 | 0 | 0 | 1 | X |

Notas clave para el profe:
- **`bne` = `beq` con la condición invertida**: salta cuando la ALU da Zero = 0.
- **`jal`** además escribe `PC+4` en `$ra` (por eso RegWrite=1).
- **`jr`** no escribe ningún registro (RegWrite=0); solo copia `$ra` al PC — por
  eso el grupo R-type se anota `move:1 / jr:0`, igual que se hizo con `j`/`jal`.
- **`lbu`/`sb`** recorren la misma ruta que `lw`/`sw`; la diferencia (1 byte vs 4) la maneja la memoria de datos.

---

## 5. Recorrido por grupo (qué se "enciende")

**ALU-inmediato — `addi $t1,$t1,-32`, `slti`, `addi $t0,$t0,1`:**
PC → Mem. instrucciones → Registros (lee `rs`) → Extensor de signo (inmediato) →
ALU (`rs` + inmediato, o set-less-than) → Write-back al registro destino (`rt`).
Memoria de datos: no se usa. `ALUSrc=1`, `RegWrite=1`.

**Load — `lbu $t1,0($t0)`:**
PC → Mem. instrucciones → Registros (lee base `$t0`) → Extensor de signo (offset 0)
→ ALU (base + offset = dirección) → **Memoria de datos (lee 1 byte)** → Write-back
a `$t1`. Es la única que activa `MemRead=1` y `MemtoReg=1`.

**Store — `sb $t1,0($t0)`:**
PC → Mem. instrucciones → Registros (lee base `$t0` y dato `$t1`) → ALU (dirección)
→ **Memoria de datos (escribe 1 byte)**. No hay write-back. Única con `MemWrite=1`.

**Branch — `beq $t1,$zero,fin`, `bne $t3,$zero,continuar`:**
PC → Mem. instrucciones → Registros (lee los dos operandos) → ALU (resta para
comparar → señal Zero) → sumador de salto (PC+4 + inmediato·4) → mux PCSrc decide
si el PC salta. `Branch=1`, no escribe registros ni memoria.

**Jump — `j bucle`, `jal transformar`:**
El destino sale de la propia instrucción (dirección·4 concatenada con PC+4). `j`
solo cambia el PC; `jal` además guarda `PC+4` en `$ra`. `Jump=1`.

**R-type — `move`/`addu`, `jr`:**
PC → Mem. instrucciones → Registros (lee `rs`, `rt`) → ALU (operación según `funct`)
→ Write-back al registro destino `rd` (`RegDst=1`). `jr` usa `rs` para cargar el PC.

---

## 6. Traza del recorrido del programa (primeras iteraciones)

| Paso | Instrucción | Qué pasa en el datapath | Componentes activos |
|---|---|---|---|
| 1 | `la $a0,mensaje` | Carga la dirección base de la cadena en `$a0` | PC, Mem.Instr, Registros, ALU |
| 2 | `jal transformar` | Salta a la subrutina y guarda retorno en `$ra` | PC, Mem.Instr, (Jump) |
| 3 | `move $t0,$a0` | Copia el puntero a `$t0` | Registros, ALU |
| 4 | `lbu $t1,0($t0)` | Lee `'h'` (104) de memoria | + **Memoria de datos** |
| 5 | `beq $t1,$zero,fin` | `'h'`≠0 → no salta | ALU (resta), control de salto |
| 6 | `slti $t3,$t1,97` | 104<97? No → `$t3=0` | ALU (slt) |
| 7 | `bne $t3,$zero,continuar` | `$t3=0` → no salta (sí es ≥ 'a') | ALU, salto |
| 8 | `slti $t3,$t1,123` | 104<123? Sí → `$t3=1` | ALU (slt) |
| 9 | `beq $t3,$zero,continuar` | `$t3=1` → no salta (sí es ≤ 'z') | ALU, salto |
| 10 | `addi $t1,$t1,-32` | 104-32 = 72 = `'H'` | ALU (suma), ext. de signo |
| 11 | `sb $t1,0($t0)` | Escribe `'H'` en memoria | **Memoria de datos (escribe)** |
| 12 | `addi $t0,$t0,1` | Avanza al siguiente byte | ALU |
| 13 | `j bucle` | Vuelve al inicio del bucle | PC (Jump) |

Para `'C'` (mayúscula, 67): en el paso 6, `slti $t3,67,97` da `$t3=1` → `bne`
salta a `continuar` y **no** se modifica (se salta el `addi -32` y el `sb`). Así el
programa solo toca las minúsculas.

---

## 7. Pseudo-instrucciones (qué son en realidad)

MARS las traduce a instrucciones reales; el profe puede preguntar esto:
- `la $a0, mensaje` → `lui $at, parte_alta` + `ori $a0, $at, parte_baja` (cargar dirección de 32 bits).
- `li $v0, 10` → `addiu $v0, $zero, 10` (cargar inmediato).
- `move $t0, $a0` → `addu $t0, $zero, $a0` (copiar registro, R-type).

---

## Nota sobre la salida del programa
El programa **sí imprime** el resultado: después de `jal transformar`, `main` hace
`li $v0,4` + `syscall` para imprimir la cadena ya transformada, y recién después
termina con `li $v0,10` + `syscall`. Al ejecutar en MARS con `"holaComoEstas"`,
la consola muestra directamente `HOLACOMOESTAS`.
