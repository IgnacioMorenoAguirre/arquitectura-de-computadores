const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

const CW = 9360; // content width (US Letter, 1" margins)
const FILL_HEAD = "D6E4F0";
const FILL_CODE = "F3F3F3";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function h2(t){ return new Paragraph({ heading: HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function p(t){ return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing:{after:120, line:276},
  children:[new TextRun(t)] }); }
function center(t, opts={}){ return new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:opts.after||80},
  children:[new TextRun({ text:t, bold:!!opts.bold, size:opts.size||24, italics:!!opts.italics, color:opts.color })] }); }
function bullet(t){ return new Paragraph({ numbering:{reference:"vi", level:0}, spacing:{after:60},
  alignment: AlignmentType.JUSTIFIED, children:[new TextRun(t)] }); }
function num(t){ return new Paragraph({ numbering:{reference:"no", level:0}, spacing:{after:60},
  alignment: AlignmentType.JUSTIFIED, children:[new TextRun(t)] }); }

function code(src){
  return src.split("\n").map(line => new Paragraph({
    spacing:{after:0, line:240},
    shading:{ type: ShadingType.CLEAR, fill: FILL_CODE },
    children:[new TextRun({ text: line.length?line:" ", font:"Consolas", size:18 })]
  }));
}

function figure(file, caption){
  const data = fs.readFileSync(file);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing:{before:120, after:40},
      children:[ new ImageRun({ type:"png", data, transformation:{ width:600, height:218 },
        altText:{ title:caption, description:caption, name:"datapath" } }) ] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:160},
      children:[ new TextRun({ text:caption, italics:true, size:20, color:"555555" }) ] })
  ];
}

function cell(text, w, {bold=false, fill=null, align=AlignmentType.LEFT, size=20}={}){
  return new TableCell({
    borders, width:{size:w, type:WidthType.DXA},
    shading: fill?{ type:ShadingType.CLEAR, fill }:undefined,
    margins:{ top:50, bottom:50, left:90, right:90 },
    children:[ new Paragraph({ alignment:align, children:[ new TextRun({ text, bold, size }) ] }) ]
  });
}

function table(headers, rows, widths, {size=20, headAlign=AlignmentType.CENTER, bodyAlign=null}={}){
  const headerRow = new TableRow({ tableHeader:true, children:
    headers.map((hh,i)=>cell(hh, widths[i], {bold:true, fill:FILL_HEAD, align:headAlign, size})) });
  const bodyRows = rows.map(r => new TableRow({ children:
    r.map((c,i)=>cell(c, widths[i], {align: bodyAlign|| (i===0?AlignmentType.LEFT:AlignmentType.CENTER), size})) }));
  return new Table({ width:{size:CW, type:WidthType.DXA}, columnWidths:widths,
    rows:[headerRow, ...bodyRows] });
}

const codeMIPS =
`.data
    mensaje: .asciiz "holaComoEstas"
.text
main:
    la   $a0, mensaje      # carga la direccion de la cadena
    jal  transformar       # llama a la funcion
    li   $v0, 10           # codigo de salida
    syscall                # termina el programa

transformar:
    move $t0, $a0          # $t0 apunta al inicio de la cadena
bucle:
    lbu  $t1, 0($t0)       # lee un byte (un caracter)
    beq  $t1, $zero, fin   # si es el fin de cadena (\\0), termina
    slti $t3, $t1, 97      # ¿es menor que 'a'?
    bne  $t3, $zero, sigue
    slti $t3, $t1, 123     # ¿es menor o igual que 'z'?
    beq  $t3, $zero, sigue
    addi $t1, $t1, -32     # es minuscula: resta 32 -> mayuscula
    sb   $t1, 0($t0)       # guarda el caracter modificado
sigue:
    addi $t0, $t0, 1       # avanza al siguiente byte
    j    bucle
fin:
    jr   $ra               # vuelve a main`;

const codeC =
`void transformar(char *s) {
    while (*s != '\\0') {              // lee byte y para en fin de cadena
        if (*s >= 'a' && *s <= 'z') {  // ¿esta entre 'a' y 'z'?
            *s = *s - 32;              // resta 32: pasa a mayuscula
        }
        s++;                           // avanza el puntero
    }
}`;

const codePy =
`def transformar(s):
    resultado = []
    for c in s:                   # recorre caracter por caracter
        if 'a' <= c <= 'z':       # ¿es minuscula?
            c = chr(ord(c) - 32)  # resta 32: pasa a mayuscula
        resultado.append(c)
    return ''.join(resultado)

print(transformar("holaComoEstas"))   # -> HOLACOMOESTAS`;

const children = [];

// ---------- PORTADA ----------
children.push(
  center("Universidad Tecnológica Metropolitana", {bold:true, size:26, after:40}),
  center("Facultad de Ingeniería", {size:24, after:20}),
  center("Departamento de Informática y Computación", {size:24, after:600}),
  center("Laboratorio de Assembler MIPS", {bold:true, size:40, after:80}),
  center("Implementación de un conversor de minúsculas a mayúsculas y su mapeo en el datapath",
         {size:26, italics:true, after:600}),
  center("Asignatura: Arquitectura de Computadores (INF60500)", {size:24, after:20}),
  center("Profesores: Patricio Salgado, Juan Pablo Elgueta y Leonardo Bravo", {size:24, after:200}),
  center("Integrante: Ignacio Moreno", {size:24, bold:true, after:20}),
  center("Integrantes del grupo: (completar)", {size:24, after:20}),
  center("Semestre: primer semestre 2026", {size:24, after:20}),
  center("Fecha: junio de 2026", {size:24, after:300}),
  center("Avance del informe elaborado por Ignacio Moreno.", {size:20, italics:true, color:"666666"}),
  new Paragraph({ children:[new PageBreak()] })
);

// ---------- ÍNDICE ----------
children.push(center("Índice", {bold:true, size:28, after:160}));
[
  "1. Introducción",
  "2. Objetivos",
  "3. Marco teórico",
  "4. Descripción del problema y del algoritmo",
  "5. Mapeo de las instrucciones en el datapath",
  "6. Resultados",
  "7. Análisis crítico",
  "8. Conclusiones",
  "9. Referencias"
].forEach(s => children.push(new Paragraph({ spacing:{after:40}, children:[new TextRun({text:s, size:24})] })));
children.push(new Paragraph({ children:[new PageBreak()] }));

// ---------- 1. INTRODUCCIÓN ----------
children.push(h1("1. Introducción"));
children.push(p("Este informe documenta el laboratorio de Assembler MIPS de la asignatura Arquitectura de Computadores. El problema que elegimos es la conversión de una cadena de texto de minúsculas a mayúsculas. Es un problema corto, pero usa las estructuras que pide el enunciado: declaración de datos, asignaciones, una operación aritmética, comparaciones, un ciclo y una función que se invoca."));
children.push(p("El trabajo se hizo en dos niveles. Primero escribimos el algoritmo en un lenguaje de alto nivel, en C y en Python, para dejar clara la lógica. Después lo implementamos en assembler MIPS sobre el simulador MARS. La parte central del informe no es el código, sino el mapeo: mostrar por qué componentes del procesador pasa cada instrucción y qué señales de control se activan. Para eso usamos el modelo del datapath de ciclo único visto en clases."));

// ---------- 2. OBJETIVOS ----------
children.push(h1("2. Objetivos"));
children.push(h2("Objetivo general"));
children.push(p("Implementar un algoritmo propio en assembler MIPS y explicar cómo se ejecuta sobre el camino de datos del procesador, identificando los componentes y las señales de control que intervienen en cada instrucción."));
children.push(h2("Objetivos específicos"));
children.push(bullet("Plantear un problema y resolverlo en alto nivel (C y Python) como referencia de la solución."));
children.push(bullet("Traducir ese algoritmo a assembler MIPS y verificar su funcionamiento en MARS."));
children.push(bullet("Clasificar las instrucciones según su tipo (R, I, J) y agruparlas por la ruta que siguen en el datapath."));
children.push(bullet("Construir la tabla de señales de control de cada grupo de instrucciones."));
children.push(bullet("Describir el recorrido del programa por el procesador y respaldarlo con diagramas."));

// ---------- 3. MARCO TEÓRICO ----------
children.push(h1("3. Marco teórico"));
children.push(h2("3.1 El datapath de ciclo único"));
children.push(p("El datapath de ciclo único es el modelo en el que cada instrucción se ejecuta por completo en un solo ciclo de reloj. La instrucción entra por la izquierda y avanza por una serie de bloques hasta terminar. Se describe en cinco etapas:"));
children.push(num("Búsqueda: el contador de programa (PC) indica la dirección de la instrucción y la memoria de instrucciones la entrega."));
children.push(num("Decodificación: la unidad de control lee el código de operación y decide qué señales activar. A la vez, el banco de registros lee los operandos."));
children.push(num("Ejecución: la ALU realiza la operación, que puede ser una suma, una resta o una comparación."));
children.push(num("Memoria: solo las instrucciones de carga y de almacenamiento acceden a la memoria de datos."));
children.push(num("Escritura: el resultado se guarda de vuelta en el banco de registros."));
children.push(p("No todas las instrucciones usan las cinco etapas. Una suma entre registros no toca la memoria de datos, y un salto casi no usa la ALU. Lo que decide qué bloques se activan son las señales de control."));

children.push(h2("3.2 Componentes principales"));
children.push(p("La rúbrica pide integrar al menos seis componentes del hardware para alcanzar el nivel más alto. El programa los usa todos:"));
children.push(table(
  ["Componente","Función en este programa"],
  [
    ["PC","Guarda la dirección de la instrucción actual. Se actualiza a la siguiente o al destino de un salto."],
    ["Memoria de instrucciones","Entrega la instrucción de 32 bits que está en la dirección del PC."],
    ["Banco de registros","Lee los registros ($t0, $t1, $a0) y escribe los resultados."],
    ["ALU","Suma, compara y calcula direcciones de memoria."],
    ["Memoria de datos","lbu lee un byte y sb escribe un byte."],
    ["Unidad de control","Decodifica el opcode y activa las señales que dirigen el resto."],
  ],
  [2400, 6960],
  {bodyAlign: AlignmentType.LEFT}
));
children.push(p("Además de estos seis, el datapath incluye componentes de apoyo: el extensor de signo, que lleva el valor inmediato de 16 a 32 bits; los sumadores que calculan la siguiente dirección y el destino de un salto; y los multiplexores, que eligen entre dos entradas según la señal de control."));
children.push(...figure("figuras/datapath_base.png", "Figura 1. Datapath de ciclo único con sus componentes principales."));

children.push(h2("3.3 Señales de control"));
children.push(p("Las señales de control son bits que la unidad de control activa o desactiva según la instrucción. Cada una conecta o desconecta una parte del datapath:"));
children.push(bullet("RegDst: elige si el registro de destino es el campo rd o el campo rt."));
children.push(bullet("ALUSrc: elige si el segundo operando de la ALU es un registro (0) o un valor inmediato (1)."));
children.push(bullet("MemRead y MemWrite: habilitan la lectura o la escritura en la memoria de datos."));
children.push(bullet("RegWrite: habilita la escritura en el banco de registros."));
children.push(bullet("MemtoReg: elige si el dato que se escribe viene de la memoria o de la ALU."));
children.push(bullet("Branch y Jump: indican si el PC cambia por un salto."));
children.push(bullet("ALUOp: indica qué operación hace la ALU (sumar, restar o comparar)."));

// ---------- 4. PROBLEMA Y ALGORITMO ----------
children.push(h1("4. Descripción del problema y del algoritmo"));
children.push(h2("4.1 El problema"));
children.push(p("El programa recibe la cadena \"holaComoEstas\" y la recorre carácter por carácter. Si un carácter es una letra minúscula, es decir, si su código ASCII está entre 97 y 122, se le resta 32. En la tabla ASCII las mayúsculas están 32 posiciones antes que las minúsculas, así que restar 32 convierte la letra. Los caracteres que no son minúsculas se dejan igual. El resultado de la cadena de ejemplo es \"HOLACOMOESTAS\"."));

children.push(h2("4.2 Versión en alto nivel (C y Python)"));
children.push(p("Escribimos la lógica primero en C, porque es el lenguaje que más se parece al assembler: el puntero recorre la memoria igual que en MIPS, y la asignación al carácter equivale a guardar un byte. También dejamos una versión en Python, que es más cómoda para ejecutar y mostrar el resultado en pantalla."));
children.push(...code(codeC));
children.push(new Paragraph({spacing:{after:80}, children:[new TextRun({text:" ", size:8})]}));
children.push(...code(codePy));

children.push(h2("4.3 Implementación en MIPS (MARS)"));
children.push(p("La traducción a MIPS sigue la misma idea. El registro $t0 funciona como puntero y $t1 guarda el carácter que se está procesando. La comparación con el rango 'a' a 'z' se hace con dos slti seguidas de un salto condicional. La resta de 32 se hace con addi y un valor negativo, porque MARS no necesita una instrucción de resta inmediata."));
children.push(...code(codeMIPS));
children.push(p("Tres instrucciones del código son pseudo-instrucciones, es decir, atajos que MARS traduce a instrucciones reales: la se convierte en lui más ori para cargar una dirección de 32 bits; li se convierte en addiu; y move se convierte en addu con el registro $zero. Conviene tenerlo claro porque en la evaluación pueden preguntar qué hay detrás de ellas."));

// ---------- 5. MAPEO ----------
children.push(h1("5. Mapeo de las instrucciones en el datapath"));
children.push(h2("5.1 Tipos de instrucción"));
children.push(p("Cada instrucción de MIPS pertenece a uno de tres formatos, y el formato determina qué campos tiene y cómo la lee la unidad de control."));
children.push(table(
  ["Tipo","Formato","Instrucciones del programa"],
  [
    ["R","op rs rt rd shamt funct","move (addu), jr"],
    ["I","op rs rt inmediato","lbu, sb, beq, bne, slti, addi, li"],
    ["J","op dirección","j, jal"],
  ],
  [1400, 3760, 4200],
  {bodyAlign: AlignmentType.LEFT}
));

children.push(h2("5.2 Tabla de señales de control"));
children.push(p("Las dieciséis instrucciones del programa se reducen a seis grupos, porque varias comparten el mismo patrón de señales. La X indica que el valor de esa señal no importa para ese grupo."));
children.push(table(
  ["Grupo","RegDst","ALUSrc","MemtoReg","RegWrite","MemRead","MemWrite","Branch","Jump","ALUOp"],
  [
    ["ALU-inmediato","0","1","0","1","0","0","0","0","add/slt"],
    ["Carga (lbu)","0","1","1","1","1","0","0","0","add"],
    ["Almacenamiento (sb)","X","1","X","0","0","1","0","0","add"],
    ["Salto cond. (beq/bne)","X","0","X","0","0","0","1","0","sub"],
    ["Salto incond. (j/jal)","X","X","X","0/1","0","0","0","1","X"],
    ["R-type (move/jr)","1","0","0","1","0","0","0","0","funct"],
  ],
  [1760,760,760,900,900,840,900,760,660,1120],
  {size:15}
));
children.push(p("La misma idea se puede mirar de forma más directa con tres preguntas por instrucción: qué hace la ALU, si toca la memoria de datos y si escribe en un registro."));
children.push(table(
  ["Grupo","La ALU hace","Memoria de datos","Write-back","Señal que la distingue"],
  [
    ["ALU-inmediato","opera con un número fijo","no","sí","ALUSrc = 1"],
    ["Carga (lbu)","calcula la dirección","lee","sí","MemRead = 1"],
    ["Almacenamiento (sb)","calcula la dirección","escribe","no","MemWrite = 1"],
    ["Salto cond. (beq/bne)","resta para comparar","no","no","Branch = 1"],
    ["Salto incond. (j/jal)","no la usa","no","solo jal","Jump = 1"],
    ["R-type (move/jr)","opera dos registros","no","sí (move)","RegDst = 1"],
  ],
  [1900,2100,1500,1400,2460],
  {size:18, bodyAlign: AlignmentType.LEFT}
));

children.push(h2("5.3 Recorrido por grupo"));
children.push(p("En los diagramas siguientes, el verde marca los componentes y las conexiones que la instrucción usa, y el gris los que quedan apagados."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("Carga (lbu)")]}));
children.push(p("La instrucción de carga usa todo el camino. Lee el registro base $t0, la ALU suma el desplazamiento para obtener la dirección, la memoria de datos entrega el byte y ese byte se guarda en $t1. Es la única instrucción del programa que activa MemRead."));
children.push(...figure("figuras/inst_lbu.png", "Figura 2. Ruta de lbu: lectura de memoria y escritura en registro."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("Almacenamiento (sb)")]}));
children.push(p("El almacenamiento es el caso espejo de la carga. La ALU calcula la dirección igual, pero ahora la memoria de datos escribe el byte de $t1. No hay escritura de registro, así que la ruta de vuelta al banco de registros queda apagada."));
children.push(...figure("figuras/inst_sb.png", "Figura 3. Ruta de sb: escritura en memoria, sin write-back."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("ALU-inmediato (addi y slti)")]}));
children.push(p("Estas instrucciones operan con un valor fijo que pasa por el extensor de signo. No tocan la memoria de datos, pero sí guardan el resultado en un registro. addi suma y slti compara y deja un 1 o un 0. Es el grupo más frecuente del programa."));
children.push(...figure("figuras/inst_addi.png", "Figura 4. Ruta de addi y slti: la ALU opera con un inmediato."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("Salto condicional (beq y bne)")]}));
children.push(p("La ALU resta los dos operandos para compararlos. Si el resultado es cero, los valores son iguales y el PC salta a la etiqueta. bne usa la misma ruta, pero salta en el caso contrario, cuando la resta no da cero. No tocan la memoria ni escriben registros."));
children.push(...figure("figuras/inst_beq.png", "Figura 5. Ruta de beq y bne: la ALU compara y el PC puede saltar."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("Salto incondicional (j y jal)")]}));
children.push(p("El destino del salto sale de la propia instrucción, sin pasar por la ALU ni leer registros. j solo cambia el PC. jal hace lo mismo, pero además guarda la dirección de retorno en $ra, para que después jr pueda volver al punto desde donde se llamó la función."));
children.push(...figure("figuras/inst_jump.png", "Figura 6. Ruta de j y jal: el destino viene de la instrucción."));

children.push(new Paragraph({heading:HeadingLevel.HEADING_3, children:[new TextRun("R-type (move y jr)")]}));
children.push(p("Las instrucciones R-type operan entre dos registros, sin valor inmediato (por eso ALUSrc vale 0). move, que en realidad es addu, escribe el resultado en el registro de destino. jr es un caso especial: no escribe ningún registro, sino que carga $ra en el PC para volver de la función."));
children.push(...figure("figuras/inst_rtype.png", "Figura 7. Ruta de R-type: operación entre dos registros."));

children.push(h2("5.4 Traza de ejecución"));
children.push(p("La siguiente tabla sigue las primeras instrucciones del programa con el primer carácter de la cadena, la letra 'h' (código 104)."));
children.push(table(
  ["Instrucción","Qué ocurre","Componentes activos"],
  [
    ["lbu $t1, 0($t0)","Lee la 'h' (104) desde memoria","PC, mem. instr., registros, ALU, mem. datos"],
    ["beq $t1, $zero, fin","104 no es 0, no salta","ALU (resta)"],
    ["slti $t3, $t1, 97","104 < 97 es falso, $t3 = 0","ALU (slt)"],
    ["bne $t3, $zero, sigue","$t3 = 0, no salta (sí es >= 'a')","ALU"],
    ["slti $t3, $t1, 123","104 < 123 es verdadero, $t3 = 1","ALU (slt)"],
    ["beq $t3, $zero, sigue","$t3 = 1, no salta (sí es <= 'z')","ALU"],
    ["addi $t1, $t1, -32","104 - 32 = 72, la letra 'H'","ALU (suma)"],
    ["sb $t1, 0($t0)","Escribe la 'H' en memoria","mem. datos"],
    ["addi $t0, $t0, 1","Avanza al siguiente byte","ALU"],
    ["j bucle","Vuelve al inicio del ciclo","PC"],
  ],
  [2500, 3560, 3300],
  {size:18, bodyAlign: AlignmentType.LEFT}
));
children.push(p("Cuando el carácter ya es mayúscula, como la 'C' (67), la primera slti deja $t3 en 1 y el bne salta a la etiqueta sigue. Así el programa se salta la resta y el almacenamiento, y la letra queda intacta."));

// ---------- 6. RESULTADOS ----------
children.push(h1("6. Resultados"));
children.push(p("Al ejecutar el programa en MARS con la cadena \"holaComoEstas\", el contenido en memoria cambia a \"HOLACOMOESTAS\". Las letras que ya estaban en mayúscula, la C y la E, no se modifican, porque la comparación las descarta antes de la resta. La versión en Python entrega el mismo resultado al ejecutarla."));
children.push(p("El código actual hace la conversión en memoria y después termina con la llamada al sistema 10. No imprime nada en pantalla, así que para ver el resultado hay que mirar el segmento de datos en MARS. Para una demostración más clara conviene imprimir la cadena antes de terminar, con la llamada al sistema 4:"));
children.push(...code(`    la  $a0, mensaje    # direccion de la cadena ya transformada\n    li  $v0, 4          # llamada 4: imprimir cadena\n    syscall`));

// ---------- 7. ANÁLISIS CRÍTICO ----------
children.push(h1("7. Análisis crítico"));
children.push(p("El diseño cumple con lo que pide la rúbrica. Integra los seis componentes principales del procesador y el uso de cada uno es coherente con el modelo de datapath visto en clases. El algoritmo, aunque es corto, recorre las cinco etapas y obliga a usar memoria, ALU, registros y control."));
children.push(p("Hay una limitación que vale la pena nombrar. MARS ejecuta el programa y muestra los registros y la memoria, pero no dibuja el datapath. Por eso el mapeo de este informe se hizo de forma conceptual, apoyado en los diagramas que preparamos aparte. DrMIPS sí muestra el camino de datos de forma gráfica, pero su conjunto de instrucciones trabaja con palabras completas (lw y sw) y no con bytes ni cadenas, así que este algoritmo en particular no calza directo con esa herramienta. Esa fue la razón para quedarnos en MARS."));
children.push(p("El programa solo procesa minúsculas del alfabeto inglés. Una letra con tilde o la ñ no se convierte con la resta de 32, porque su codificación es distinta. Para el alcance del laboratorio no es un problema, pero conviene tenerlo claro por si preguntan por casos límite."));
children.push(p("Dos detalles más sobre las instrucciones. lbu y sb trabajan a nivel de byte, pero siguen la misma ruta en el datapath que lw y sw; la diferencia está dentro de la memoria de datos, que mueve un solo byte en lugar de una palabra. Y bne comparte la ruta con beq, con la condición invertida: salta cuando la resta de la ALU no da cero."));

// ---------- 8. CONCLUSIONES ----------
children.push(h1("8. Conclusiones"));
children.push(p("El laboratorio cumplió su objetivo: el algoritmo funciona en MARS y quedó explicado cómo recorre el procesador. La parte que más cuesta no es escribir el código, sino seguir cada instrucción por el datapath y justificar qué señales se activan. La regla que nos sirvió para ordenarlo fue responder tres preguntas por instrucción: qué hace la ALU, si toca la memoria de datos y si escribe en un registro. Con eso se arma la ruta de cualquiera de las instrucciones del programa."));
children.push(p("Para la evaluación conviene que cada integrante pueda tomar una instrucción del código y explicar su recorrido por su cuenta, porque las preguntas del profesor son individuales y la nota puede ser distinta para cada uno."));

// ---------- 9. REFERENCIAS ----------
children.push(h1("9. Referencias"));
children.push(p("Patterson, D. A. y Hennessy, J. L. (2014). Organización y diseño de computadores: la interfaz hardware/software. Elsevier."));
children.push(p("Vollmar, K. y Sanderson, P. MARS: MIPS Assembler and Runtime Simulator. Missouri State University."));
children.push(p("Bravo, L. Material del curso INF60500 Arquitectura de Computadores: datapath y simulador DrMIPS. Universidad Tecnológica Metropolitana."));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:30, bold:true, font:"Arial", color:"1F3864" },
        paragraph:{ spacing:{before:280, after:140}, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:"Arial", color:"2E5496" },
        paragraph:{ spacing:{before:200, after:100}, outlineLevel:1 } },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:23, bold:true, font:"Arial", color:"333333" },
        paragraph:{ spacing:{before:140, after:60}, outlineLevel:2 } },
    ]
  },
  numbering: { config: [
    { reference:"vi", levels:[{ level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
    { reference:"no", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
  ]},
  sections: [{
    properties: { page: {
      size:{ width:12240, height:15840 },
      margin:{ top:1440, right:1440, bottom:1440, left:1440 }
    }},
    footers: { default: new Footer({ children:[ new Paragraph({ alignment:AlignmentType.CENTER,
      children:[ new TextRun({ text:"Página ", size:18 }), new TextRun({ children:[PageNumber.CURRENT], size:18 }) ] }) ] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Informe_Laboratorio_MIPS.docx", buf);
  console.log("OK informe generado:", buf.length, "bytes");
});
