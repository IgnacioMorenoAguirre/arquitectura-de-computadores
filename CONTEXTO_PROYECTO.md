# Contexto y estado del proyecto — Laboratorio MIPS (Arquitectura de Computadores, UTEM)

> Documento de traspaso para continuar desde otro dispositivo. Resume TODO lo hecho,
> las decisiones tomadas y lo que falta. Última actualización: junio 2026.

---

## 1. Qué es el trabajo

Laboratorio de **Assembler MIPS (INF60500)**, profesores Salgado, Elgueta y Bravo.
Trabajo grupal (3 integrantes: Ignacio Moreno + 2 compañeros que coordinan por WhatsApp).

**Problema del grupo:** un programa que convierte una cadena de minúsculas a mayúsculas
(`"holaComoEstas"` → `"HOLACOMOESTAS"`), restando 32 al código ASCII de cada minúscula.

**Entregables y ponderación:**
- Algoritmo en alto nivel (C/Python) + MIPS en MARS = 10%.
- Presentación de 10 min con el mapeo del datapath = 30%.
- Ambas notas (3ª y 4ª evaluación) = 40% del curso.
- Hay **informe de desarrollo** y **preguntas individuales en vivo** (cada integrante
  puede sacar nota distinta).

**Regla clave del profe (por WhatsApp):** en la evaluación presencial, **cada integrante
mapea 1 instrucción distinta** de su código, mostrando lo que está activo y por qué, y lo
que está inactivo y por qué. El profe decide qué preguntar.

---

## 2. Estado de cada entregable

| Entregable | Estado |
|---|---|
| Algoritmo en C y Python | ✅ hecho (`conversor_HLL.c`, `conversor_HLL.py`) |
| Código MIPS (MARS) | ✅ verificado (`conversor.asm`) |
| Mapeo del datapath (base + 6 grupos + tabla señales + traza) | ✅ (`Mapeo_Datapath.md`, `PROYECTO_COMPLETO.md`, figuras en `figuras/`) |
| Informe en Word | ✅ (`Informe_Laboratorio_MIPS.docx`) — ver nota abajo |
| **Slide de `sb` para la Canva (slide 6)** | 🔄 **EN PROCESO** (ver sección 3) |
| Presentación Canva completa | ⏳ pendiente |
| Preparación Q&A individual | ⏳ pendiente |

**Nota sobre el informe:** dice como "mejora sugerida" agregar un `print`, pero los
compañeros **ya lo agregaron** al código (`li $v0,4; syscall`). Falta actualizar el
informe para que diga que el programa **sí imprime**.

---

## 3. LO QUE ESTOY HACIENDO AHORA: la slide de `sb`

A Ignacio le toca mapear la instrucción **`sb $t1, 0($t0)`** (store byte) en la slide 6
de la Canva (que está vacía). `sb` es el **espejo exacto de `lbu`** (que ya hizo un
compañero en la slide 5).

**DECISIÓN IMPORTANTE:** se usa el **estilo P&H** (el diagrama del libro que usan los
compañeros, con líneas verdes trazadas y valores en rojo), **NO** el X-Ray de MARS,
para mantener la consistencia del deck.

**Plan acordado:**
1. Se genera una imagen base estilo P&H con las flechas ya dibujadas (`figuras/slide_sb_PH.png`,
   se genera con `gen_sb_v3.py`).
2. Si no gusta el resultado, se hace colaborativo: se le indica flecha por flecha dónde va,
   Ignacio las dibuja en Paint sobre la base, y **guarda el archivo en la carpeta** (no
   pantallazo) para revisarlo con calidad.
3. Cuando esté lista, se sube a la slide 6 de la Canva.

---

## 4. DATOS EXACTOS DE `sb $t1, 0($t0)` (confirmados con MARS X-Ray)

Tipo: **I-type** (STORE). Es el espejo de `lbu` (load): la memoria **escribe** en vez de
leer, y **NO hay write-back**.

**Campos (32 bits):**
| Campo | Bits | Valor binario | Qué es |
|---|---|---|---|
| opcode | 31–26 | `101000` | le dice a Control que es store |
| rs | 25–21 | `01000` | `$t0` (dirección base) |
| rt | 20–16 | `01001` | `$t1` (el dato a guardar) |
| inmediato | 15–0 | `0000000000000000` | offset 0 |

**Señales de control:**
- **Activas:** `ALUSrc=1` (usa el inmediato), `MemWrite=1` (escribe memoria).
- **Inactivas:** `MemRead=0`, `RegWrite=0` (**sin write-back**), `Branch=0`.
- **Don't care:** `RegDst=X`, `MemtoReg=X`.
- `ALUOp=00` → la ALU control manda `0010` (sumar) → la ALU calcula `$t0 + 0 = dirección`.

**Ruta activa (lo que se pinta en verde):**
1. PC → Memoria de instrucciones (fetch).
2. Se reparten los 32 bits: opcode→Control; rs(`$t0`)→Read register 1; rt(`$t1`)→Read register 2; offset→Sign-extend.
3. Read data 1 (`$t0`) → ALU (primer operando).
4. Sign-extend (offset 0) → MUX ALUSrc (elegido, ALUSrc=1) → ALU (segundo operando).
5. ALU suma → **Memoria de datos (Address)**.
6. Read data 2 (`$t1`) → **Memoria de datos (Write data)** → se escribe el byte (MemWrite=1).
7. PC+4 en paralelo para la siguiente instrucción (Branch=0).
8. **NO** hay retorno a los registros (write-back apagado).

**Guion para explicarlo (lo que el profe quiere oír):** "El opcode 101000 le dice a la
unidad de control que es un store, por eso enciende MemWrite y ALUSrc, y deja RegWrite en
0. rs es $t0 (la dirección base) y rt es $t1 (el dato). El sign-extend lleva el offset 0 a
32 bits, la ALU suma base+offset para obtener la dirección, y en la memoria de datos se
escribe el byte de $t1. No hay write-back porque no se modifica ningún registro."

---

## 5. El video patrón del profe (hallazgos)

El profe compartió un video de 24 min ("Laboratorio Patron 2023 sem1 DataPath MARS.mp4",
en su Drive; **NO está en el repo por su tamaño**). Es la **presentación MODELO** de un
grupo (registro de maratón), el ejemplo a imitar. Transcripción completa en
`Transcripcion_Video_Patron.txt`.

**Estructura a imitar:** contexto del código → HLL en C (señalar cada sentencia exigida)
→ MIPS → **MAPEO (1 instrucción por integrante)**, cada una mostrada **a mano en Paint
sobre el diagrama P&H** Y con la herramienta **MARS X-Ray** (dijeron "nos dio igualito")
→ conclusión + reflexión.

**Al explicar cada instrucción:** descomponen los 32 bits en campos con sus bits en
BINARIO, dicen qué señal de control va en 1/0 y por qué, qué MUX está prendido/apagado,
el código que recibe la ALU control, y el camino del PC+4.

---

## 6. MARS y el X-Ray

- MARS 4.5 está en `Mars4_5.jar` (se abre con doble clic; requiere Java, ya instalado).
- Trae la herramienta **Tools → MIPS X-Ray**, que dibuja el datapath y resalta la ruta
  activa automáticamente. **Soporta `sb` y `lbu`** (confirmado).
- **Cómo usarla:** abrir `conversor.asm` → Run → Assemble (F3) → Tools → MIPS X-Ray →
  "Connect to MIPS" → Step (F7) hasta la línea `sb` → el X-Ray muestra "STORE TYPE INSTRUCTION".
- Se decidió NO usar la imagen del X-Ray en la slide (rompe el estilo de los compañeros),
  pero sirve para **verificar los valores** de `sb`.

---

## 7. Estado de la Canva (design DAHNysCZkxc)

Slides existentes:
- 1: Portada (integrantes Rodrigo y Wladimir) — **falta agregar a Ignacio**.
- 2: Código HLL (Python). 3: Código MIPS. 4: Datapath `beq`. 5: Datapath `lbu`. 7: Datapath `addi`. (hechas por los compañeros, estilo P&H verde)
- **6: VACÍA** → aquí va el `sb` de Ignacio.
- **8: tiene un título de OTRO trabajo** ("Una Metodología de Planificación... E-Business") → **corregir**.
- **9: Conclusiones vacías** ("……") → **redactar**.

---

## 8. Archivos en la carpeta `arqui`

| Archivo | Qué es |
|---|---|
| `CONTEXTO_PROYECTO.md` | Este documento (traspaso). |
| `PROYECTO_COMPLETO.md` | Todo el proyecto en un solo doc. |
| `Mapeo_Datapath.md` | Fuente de verdad del mapeo. |
| `Informe_Laboratorio_MIPS.docx` | Informe en Word. |
| `conversor.asm` | Código MIPS (igual al de la Canva, para MARS). |
| `conversor_HLL.c` / `.py` | Algoritmo en alto nivel. |
| `Transcripcion_Video_Patron.txt` | Transcripción del video del profe. |
| `figuras/` | Diagramas (base P&H, 6 grupos, y `slide_sb_PH.png`). |
| `datapath_base_PH.png` | Diagrama base P&H (para dibujar encima). |
| `gen_sb_v3.py` | Genera la imagen de `sb` estilo P&H. |
| `generate_figuras.py` / `build_informe.js` | Generan figuras / informe. |
| `Mars4_5.jar` | Simulador MARS (con X-Ray). |

**NO en el repo:** el video `.mp4` (179 MB, supera el límite de GitHub) → descargar del
Drive del profe si se necesita.

---

## 9. Cómo continuar en otro dispositivo

1. `git clone https://github.com/IgnacioMorenoAguirre/arquitectura-de-computadores.git`
2. Para regenerar la imagen de `sb`: `python gen_sb_v3.py` (necesita `pip install pillow`).
3. Para MARS: doble clic en `Mars4_5.jar` (o descargarlo de nuevo si hace falta).
4. Retomar la slide de `sb` (sección 3).

---

## 10. Próximos pasos (en orden)

1. **Terminar la slide de `sb`** (imagen P&H) y subirla a la slide 6 de la Canva.
2. **Corregir la slide 8** de la Canva (título de otro trabajo).
3. **Redactar las conclusiones** (slide 9).
4. **Agregar a Ignacio** en la portada.
5. **Actualizar el informe** (el programa ya imprime).
6. **Preparar el Q&A** de `sb` (usar el guion de la sección 4).
