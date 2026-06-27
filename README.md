# Laboratorio de Assembler MIPS — Arquitectura de Computadores (INF60500)

Universidad Tecnológica Metropolitana. Trabajo de laboratorio sobre MIPS/MARS y el
mapeo de las instrucciones en el **datapath de ciclo único**.

Este repositorio es el respaldo del proyecto (para trabajarlo desde varios
dispositivos) y sirve como bitácora de lo que se hizo.

## El problema

Un programa que recorre la cadena `"holaComoEstas"` y convierte cada letra
minúscula a mayúscula restando 32 a su código ASCII. Resultado: `HOLACOMOESTAS`.

## Archivos del proyecto

| Archivo | Qué es |
|---|---|
| `Informe_Laboratorio_MIPS.docx` | Informe de desarrollo completo (portada, marco teórico, mapeo, figuras, análisis crítico). |
| `Mapeo_Datapath.md` | Fuente de verdad del mapeo: tabla de señales, recorrido por instrucción y traza. |
| `conversor_HLL.c` / `conversor_HLL.py` | Versión del algoritmo en alto nivel (referencia exigida por el enunciado). |
| `figuras/` | Diagramas del datapath en PNG (base + una por grupo de instrucción). |
| `generate_figuras.py` | Script que genera las figuras (matplotlib). |
| `build_informe.js` | Script que arma el informe en Word (docx-js). |
| Enunciado, Rúbrica, Apuntes, Clases | Material del curso, para referencia. |

## Estado

- [x] Algoritmo en alto nivel (C y Python).
- [x] Código MIPS verificado en MARS.
- [x] Mapeo del datapath completo (diagrama base + 6 rutas + tabla de señales + traza).
- [x] Informe de desarrollo en Word.
- [ ] Presentación en Canva (10 min).
- [ ] Preparación para las preguntas individuales del profesor.

## Cómo regenerar los archivos

```bash
# Figuras del datapath
python generate_figuras.py

# Informe en Word (requiere: npm install docx)
node build_informe.js
```

## Decisiones del grupo

- Se usa **solo MARS** (no DrMIPS). El algoritmo trabaja con bytes y cadenas, que no
  calzan bien con el conjunto de instrucciones de DrMIPS.
- La versión en alto nivel se incluye porque el enunciado la exige (parte del 10%).
