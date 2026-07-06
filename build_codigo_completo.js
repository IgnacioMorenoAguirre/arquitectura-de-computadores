const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber
} = require("docx");

const CW = 9360;
const FILL_HEAD = "D6E4F0";
const FILL_ALT = "F3F3F3";
const FILL_Q = "E8EEF7";
const FILL_TIP = "FFF6DD";
const FILL_CODE = "F3F3F3";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)],
  pageBreakBefore:true }); }
function p(runs, opts={}){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ alignment: AlignmentType.LEFT, spacing:{after:opts.after||200, line:340}, children });
}
function bold(t){ return new TextRun({ text:t, bold:true }); }
function plain(t){ return new TextRun(t); }
function mono(t){ return new TextRun({ text:t, font:"Consolas", size:20 }); }
function bullet(runs){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ numbering:{reference:"vi", level:0}, spacing:{after:140, line:320},
    alignment: AlignmentType.LEFT, children });
}
function num(runs){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ numbering:{reference:"no", level:0}, spacing:{after:180, line:320},
    alignment: AlignmentType.LEFT, children });
}
function box(runs, fill){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Table({
    width:{size:CW, type:WidthType.DXA},
    rows:[ new TableRow({ children:[ new TableCell({
      borders: noBorders, width:{size:CW, type:WidthType.DXA},
      shading:{ type:ShadingType.CLEAR, fill },
      margins:{ top:110, bottom:110, left:180, right:180 },
      children:[ new Paragraph({ spacing:{line:320}, children }) ]
    }) ] }) ]
  });
}
function pregunta(q, a){
  return [
    new Paragraph({ spacing:{before:260}, children:[] }),
    box([ new TextRun({ text:"P: "+q, bold:true, size:24, color:"1F3864" }) ], FILL_Q),
    new Paragraph({ indent:{left:220}, spacing:{before:100, after:80, line:320},
      children:[ new TextRun({ text:"R: ", bold:true, color:"3C7A3C" }), new TextRun(a) ] })
  ];
}
function cell(runs, w, {bold:b=false, fill=null, align=AlignmentType.LEFT, size=22}={}){
  const children = Array.isArray(runs) ? runs : [new TextRun({ text:runs, bold:b, size })];
  return new TableCell({
    borders, width:{size:w, type:WidthType.DXA},
    shading: fill?{ type:ShadingType.CLEAR, fill }:undefined,
    margins:{ top:100, bottom:100, left:120, right:120 },
    children:[ new Paragraph({ alignment:align, spacing:{line:300}, children }) ]
  });
}
function table(headers, rows, widths){
  const headerRow = new TableRow({ tableHeader:true, children:
    headers.map((hh,i)=>cell(hh, widths[i], {bold:true, fill:FILL_HEAD})) });
  const bodyRows = rows.map((r,ri) => new TableRow({ children:
    r.map((c,i)=>cell(c, widths[i], {fill: ri%2? FILL_ALT : null})) }));
  return new Table({ width:{size:CW, type:WidthType.DXA}, columnWidths:widths,
    rows:[headerRow, ...bodyRows] });
}
function code(src){
  return src.split("\n").map(line => new Paragraph({
    spacing:{after:0, line:240},
    shading:{ type: ShadingType.CLEAR, fill: FILL_CODE },
    children:[new TextRun({ text: line.length?line:" ", font:"Consolas", size:18 })]
  }));
}
function codeCell(text, w){
  return new TableCell({ borders, width:{size:w, type:WidthType.DXA},
    margins:{top:100,bottom:100,left:120,right:120},
    children:[ new Paragraph({ children:[ new TextRun({ text, font:"Consolas", size:20 }) ] }) ] });
}
function monoTable(headers, rows, widths, monoCols){
  const headerRow = new TableRow({ tableHeader:true, children:
    headers.map((hh,i)=>cell(hh, widths[i], {bold:true, fill:FILL_HEAD})) });
  const bodyRows = rows.map((r,ri) => new TableRow({ children:
    r.map((c,i)=> monoCols.includes(i) ? codeCell(c, widths[i]) :
      cell(c, widths[i], {fill: ri%2? FILL_ALT : null})) }));
  return new Table({ width:{size:CW, type:WidthType.DXA}, columnWidths:widths,
    rows:[headerRow, ...bodyRows] });
}

const children = [];

// ---------- PORTADA ----------
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:60},
    children:[ new TextRun({ text:"Explicación completa del código", bold:true, size:38 }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:40},
    children:[ new TextRun({ text:"Conversor de minúsculas a mayúsculas (MIPS)", bold:true, size:28, color:"2E5496" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:400},
    children:[ new TextRun({ text:"Laboratorio Assembler MIPS — Arquitectura de Computadores (INF60500) — Ignacio Moreno", italics:true, size:22, color:"666666" }) ] }),
  p([ new TextRun({ italics:true, color:"555555", size:22,
    text:"Por si el profe o un compañero te pide explicar el programa completo, no solo el mapeo de sb." }) ], {after:200})
);

// ---------- 0. QUE HACE ----------
children.push(h1("0. Qué hace el programa, en una frase"));
children.push(box([ new TextRun({ text:"Recibe un texto y lo convierte todo a mayúsculas, letra por letra, dejando el resto de los caracteres (números, mayúsculas, símbolos) sin tocar.", size:24 }) ], FILL_TIP));

// ---------- 1. REGISTROS ----------
children.push(h1("1. Para qué sirve cada registro"));
children.push(table(
  ["Registro", "Para qué se usa", "Se dice"],
  [
    ["$a0", "Al principio guarda la dirección del texto completo (el parámetro que recibe la función).", "“a-cero”"],
    ["$t0", "El puntero: la dirección del carácter que se está mirando. Avanza de a uno en cada vuelta del bucle.", "“te cero”"],
    ["$t1", "El carácter actual: el byte leído en la dirección de $t0. Si es minúscula, se modifica antes de guardarlo.", "“te uno”"],
    ["$t3", "Una bandera temporal: guarda 1 o 0 según el resultado de una comparación. Se usa y se descarta enseguida.", "“te tres”"],
    ["$v0", "El código que le dice al sistema qué operación hacer (imprimir, terminar el programa, etc.).", "“ve-cero”"],
    ["$ra", "La dirección a la que hay que volver cuando termina la función.", "“ere-a”"],
    ["$zero", "Siempre vale 0. Se usa para comparar.", "“registro cero”"],
  ],
  [1300, 6560, 1500]
));
children.push(new Paragraph({ spacing:{before:160}, children:[] }));
children.push(box([ new TextRun({ bold:true, text:"La idea clave: " }),
  new TextRun("$t0 recorre el texto de principio a fin (avanza de a un byte), y $t1 es el dato que se lee, se revisa, y a veces se cambia, en cada posición por la que pasa $t0.") ],
  FILL_TIP));

// ---------- 2. CODIGO LINEA POR LINEA ----------
children.push(h1("2. El código, línea por línea"));
children.push(...code(
`main:
    la   $a0, mensaje      # $a0 = direccion donde empieza el texto
    jal  transformar       # llama a la funcion que hace el trabajo
    li   $v0, 4            # codigo de "imprimir texto"
    syscall
    li   $v0, 10           # codigo de "terminar programa"
    syscall

transformar:
    move $t0, $a0          # $t0 = copia de la direccion (para no perder $a0)
bucle:
    lbu  $t1, 0($t0)       # $t1 = el byte que esta en la direccion de $t0
    beq  $t1, $zero, fin   # si ese byte es 0 (fin del texto), termina
    slti $t3, $t1, 97      # $t3 = 1 si $t1 es menor que 'a' (97)
    bne  $t3, $zero, continuar   # si es menor que 'a', no es minuscula: saltar
    slti $t3, $t1, 123     # $t3 = 1 si $t1 es menor que 123 (una mas que 'z')
    beq  $t3, $zero, continuar   # si NO es menor que 123, no es minuscula: saltar
    addi $t1, $t1, -32     # es minuscula: restarle 32 la convierte en mayuscula
    sb   $t1, 0($t0)       # guardar el byte ya modificado
continuar:
    addi $t0, $t0, 1       # avanzar el puntero al siguiente byte
    j    bucle             # repetir con el siguiente caracter
fin:
    jr   $ra               # terminar y volver a main`
));
children.push(new Paragraph({ spacing:{before:200}, children:[] }));
children.push(p([bold("En palabras simples, el bucle hace esto en cada vuelta:")], {after:100}));
children.push(num("Lee un carácter."));
children.push(num("Si es el final del texto, termina."));
children.push(num("Si el carácter no está entre 'a' y 'z', lo deja igual."));
children.push(num("Si sí está entre 'a' y 'z', le resta 32 (eso lo convierte en mayúscula) y lo vuelve a guardar en el mismo lugar."));
children.push(num("Avanza al siguiente carácter y repite."));

// ---------- 3. EJEMPLO ----------
children.push(h1("3. Ejemplo con una palabra: recorriendo “hola”"));
children.push(table(
  ["Vuelta", "$t0 apunta a", "$t1 (leído)", "¿Minúscula?", "Qué pasa", "Se guarda"],
  [
    ["1", "posición 0", "h (104)", "sí", "104 − 32 = 72", "H"],
    ["2", "posición 1", "o (111)", "sí", "111 − 32 = 79", "O"],
    ["3", "posición 2", "l (108)", "sí", "108 − 32 = 76", "L"],
    ["4", "posición 3", "a (97)", "sí", "97 − 32 = 65", "A"],
    ["5", "posición 4", "\\0 (0)", "—", "carácter nulo → beq salta a fin", "(nada)"],
  ],
  [900, 1500, 1400, 1300, 2800, 1460]
));
children.push(new Paragraph({ spacing:{before:160}, children:[] }));
children.push(p([bold('Resultado: '), plain('"hola" → "HOLA".')]));
children.push(box([
  new TextRun({ bold:true, text:"Si el carácter ya fuera mayúscula o un símbolo " }),
  new TextRun("(por ejemplo 'C' = 67, o '!' = 33), la comparación slti $t3, $t1, 97 daría $t3=1 (porque 67 y 33 son menores que 97), así que bne saltaría directo a continuar sin tocar el dato — por eso el programa no daña lo que ya está en mayúscula.")
], FILL_TIP));

// ---------- 4. GLOSARIO ----------
children.push(h1("4. Mini-glosario de instrucciones usadas"));
children.push(monoTable(
  ["Instrucción", "Qué hace"],
  [
    ["la $a0, mensaje", "Carga la dirección (load address) de la variable mensaje en $a0."],
    ["jal transformar", "Llama a la función transformar (jump and link): salta ahí y guarda en $ra la dirección a la que hay que volver."],
    ["li $v0, 4 / syscall", "Carga el número 4 en $v0 (código de “imprimir string”) y ejecuta la llamada al sistema."],
    ["move $t0, $a0", "Copia el valor de $a0 a $t0 (para tener una copia que se pueda modificar sin perder $a0)."],
    ["lbu $t1, 0($t0)", "Carga un byte sin signo desde la dirección $t0 (más 0 de offset) en $t1."],
    ["beq $t1, $zero, fin", "Si $t1 es igual a 0, salta a la etiqueta fin."],
    ["slti $t3, $t1, 97", "Pone $t3 = 1 si $t1 < 97, si no $t3 = 0."],
    ["bne $t3, $zero, continuar", "Si $t3 no es 0, salta a continuar."],
    ["addi $t1, $t1, -32", "Le suma −32 a $t1 (equivale a restarle 32)."],
    ["sb $t1, 0($t0)", "Guarda el byte de $t1 en la dirección $t0 (esta es la instrucción que mapeaste en el datapath)."],
    ["j bucle", "Salta directo (jump) a la etiqueta bucle, sin condición."],
    ["jr $ra", "Salta a la dirección guardada en $ra (vuelve de la función)."],
  ],
  [3200, 6160],
  [0]
));

// ---------- 5. PREGUNTAS ----------
children.push(h1("5. Preguntas típicas sobre el código completo"));
children.push(...pregunta(
  "¿Por qué se usa addi $t1, $t1, -32 y no una resta directa?",
  "Porque en el set de instrucciones que usamos no hay una instrucción subi (restar un número fijo), así que sumar un número negativo hace exactamente lo mismo: sumar −32 es igual a restar 32."
));
children.push(...pregunta(
  "¿Por qué se compara dos veces (slti ... 97 y slti ... 123) en vez de una sola vez?",
  "Porque hay que revisar un rango: que el carácter sea mayor o igual que 'a' y menor o igual que 'z'. Una sola comparación no alcanza para verificar un rango completo, así que se necesitan dos: una para el límite de abajo y otra para el límite de arriba."
));
children.push(...pregunta(
  "¿Qué significa que $t3 sea una “bandera”?",
  "Que no representa un dato del programa (como sí lo hacen $t0 o $t1), sino solo el resultado de una pregunta de sí/no (¿es menor que 97?). Se usa inmediatamente después y no importa su valor en el resto del programa."
));
children.push(...pregunta(
  "¿Cómo sabe el programa cuándo termina el texto?",
  "Los strings en este estilo terminan con un byte en 0 (el carácter nulo). Por eso el beq $t1, $zero, fin corta el bucle apenas se lee ese 0."
));
children.push(...pregunta(
  "¿Qué pasaría si la palabra ya viene en mayúsculas?",
  "Nada cambia: cada letra falla la comparación slti $t3, $t1, 97 (porque una mayúscula vale menos de 97 en ASCII), así que el programa salta a continuar sin modificarla."
));
children.push(...pregunta(
  "¿Por qué $t0 se copia de $a0 en vez de usar $a0 directamente?",
  "Por costumbre/orden: $a0 es el parámetro de entrada de la función, y es más prolijo dejarlo sin tocar y trabajar con una copia ($t0) que sí se va a ir modificando en el bucle."
));
children.push(...pregunta(
  "¿Cuántas veces se ejecuta sb?",
  "Una vez por cada letra minúscula del texto — no una vez por cada carácter. Los caracteres que no son minúsculas nunca llegan a la línea del sb porque el bne/beq los saltan antes."
));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:30, bold:true, font:"Arial", color:"1F3864" },
        paragraph:{ spacing:{before:0, after:220}, outlineLevel:0,
          border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:"2E5496", space:6 } } } },
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
  fs.writeFileSync("Explicacion_Codigo_Completo.docx", buf);
  console.log("OK codigo completo generado:", buf.length, "bytes");
});
