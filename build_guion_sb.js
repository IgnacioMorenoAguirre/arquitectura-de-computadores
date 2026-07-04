const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber
} = require("docx");

const CW = 9360; // content width (US Letter, 1" margins)
const FILL_HEAD = "D6E4F0";
const FILL_ALT = "F3F3F3";
const FILL_Q = "E8EEF7";
const FILL_TIP = "FFF6DD";
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
function cell(text, w, {bold:b=false, fill=null, align=AlignmentType.LEFT, size=22}={}){
  return new TableCell({
    borders, width:{size:w, type:WidthType.DXA},
    shading: fill?{ type:ShadingType.CLEAR, fill }:undefined,
    margins:{ top:100, bottom:100, left:120, right:120 },
    children:[ new Paragraph({ alignment:align, spacing:{line:300}, children:[ new TextRun({ text, bold:b, size }) ] }) ]
  });
}
function table(headers, rows, widths){
  const headerRow = new TableRow({ tableHeader:true, children:
    headers.map((hh,i)=>cell(hh, widths[i], {bold:true, fill:FILL_HEAD})) });
  const bodyRows = rows.map((r,ri) => new TableRow({ children:
    r.map((c,i)=>cell(c, widths[i], {fill: ri%2? FILL_ALT : null, bold: i<2})) }));
  return new Table({ width:{size:CW, type:WidthType.DXA}, columnWidths:widths,
    rows:[headerRow, ...bodyRows] });
}

const children = [];

// ---------- PORTADA ----------
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:60},
    children:[ new TextRun({ text:"Guion de exposición y Q&A", bold:true, size:40 }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:40},
    children:[ new TextRun({ text:"Instrucción sb $t1, 0($t0)", bold:true, size:32, color:"2E5496" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:400},
    children:[ new TextRun({ text:"Laboratorio Assembler MIPS — Arquitectura de Computadores (INF60500) — Ignacio Moreno", italics:true, size:22, color:"666666" }) ] }),
  p([ new TextRun({ italics:true, color:"555555", size:22,
    text:"Preparado para la evaluación presencial. Escrito con palabras simples para que te salga natural al hablar, no como si estuvieras leyendo un libro." }) ], {after:200})
);

// ---------- 0. PRONUNCIACIÓN ----------
children.push(h1("0. Cómo se dicen las cosas raras"));
children.push(p("No hay que sonar “técnico” — se puede hablar simple. Guía rápida:"));
children.push(table(
  ["Se escribe", "Se dice (en voz alta)"],
  [
    ["$t0", "“te cero” — el signo $ no se dice, es solo parte de cómo se escribe."],
    ["$t1", "“te uno”."],
    ["sb $t1, 0($t0)", "más fácil: “la instrucción que guarda te uno en la dirección de te cero”."],
    ["ALU", "tal cual, “a-ele-u”, o simplemente “la ALU”."],
    ["MUX", "puedes decir “el selector” en vez de MUX — significa lo mismo y es más fácil."],
    ["opcode", "“código de operación”, si prefieres no decir “opcode”."],
    ["ALUOp", "“ALU-op”, o “la señal que le dice a ALU control qué hacer”."],
    ["ALUSrc", "o simplemente “la señal del selector”."],
    ["Sign-extend", "“el bloque que estira el número a 32 bits” — no hace falta decir el nombre en inglés."],
    ["write-back", "“escribir de vuelta en un registro”."],
  ],
  [2400, 6960]
));
children.push(new Paragraph({ spacing:{before:200}, children:[] }));
children.push(box([ new TextRun({ bold:true, text:"Tip: " }),
  new TextRun("si te trabas con un nombre técnico, dilo en español simple (“el selector”, “la memoria”, “el registro te uno”) — el profe entiende igual y te va a sonar más natural que leer.") ],
  FILL_TIP));

// ---------- 1. GUION PRINCIPAL ----------
children.push(h1("1. Guion principal"));
children.push(p([ new TextRun({italics:true, color:"666666", text:"Léelo en este orden, apoyándote en la slide 6."}) ]));

children.push(p([
  plain('Mi instrucción es '), bold('sb'), plain(', que guarda un dato en la memoria. Guarda lo que hay en el registro '),
  bold('te uno'), plain(', en la dirección que apunta el registro '), bold('te cero'),
  plain(', sin sumarle nada (el offset es 0).')
]));

children.push(p([
  plain('Es una instrucción tipo '), bold('I'), plain(', o sea, con un número (inmediato) adentro. Sus 32 bits se separan así:')
], {after:120}));
children.push(bullet([plain('Los primeros 6 bits son el '), bold('código de operación'), plain(': '), bold('101000'), plain('. Con esto, la unidad de Control ya sabe que es un guardado (store).')]));
children.push(bullet([plain('Los siguientes 5 bits dicen qué registro es la base: '), bold('01000'), plain(', que es '), bold('te cero'), plain('.')]));
children.push(bullet([plain('Los siguientes 5 bits dicen qué dato se guarda: '), bold('01001'), plain(', que es '), bold('te uno'), plain('.')]));
children.push(bullet([plain('Los últimos 16 bits son el número que se suma (el offset): puro cero.')]));

children.push(p([
  plain('Con solo leer el código de operación, Control prende dos señales: '),
  bold('prende la escritura en memoria'), plain(', y '), bold('prende el selector'),
  plain(' (para usar el número, no otro registro). Y apaga la señal de '),
  bold('escribir en un registro'), plain(', porque un guardado nunca cambia un registro.')
]));

children.push(p([bold('Ahora el camino, paso a paso:')], {after:120}));
children.push(num("El PC (el contador de programa) apunta a la memoria de instrucciones y ahí se leen los 32 bits."));
children.push(num([plain('Del banco de registros se leen dos valores: el de '), bold('te cero'), plain(' (la dirección) y el de '), bold('te uno'), plain(' (el dato a guardar).')]));
children.push(num("El offset (puro cero) pasa por el bloque que lo estira a 32 bits."));
children.push(num("Como el selector está prendido, se elige ese número estirado, y no el otro registro, para sumarlo."));
children.push(num([plain('La ALU suma '), bold('te cero más cero'), plain(', y ese resultado es la dirección donde se va a escribir.')]));
children.push(num([plain('Esa dirección entra a la memoria. Al mismo tiempo, el valor de '), bold('te uno'), plain(' entra directo a la memoria también, pero como el dato a guardar — sin pasar por la ALU.')]));
children.push(num("Como la señal de escritura está prendida, la memoria guarda ese byte ahí."));
children.push(num("No se escribe nada de vuelta en ningún registro, porque esa señal está apagada. Un guardado no cambia registros."));
children.push(num("Y en paralelo, como siempre, el programa avanza a la siguiente instrucción."));

// ---------- 2. TABLA DE SEÑALES ----------
children.push(h1("2. Señales de control, una por una"));
children.push(table(
  ["Señal", "Valor", "Por qué (en palabras simples)"],
  [
    ["RegDst", "no importa", "No se va a escribir en ningún registro, así que da lo mismo."],
    ["Branch", "apagada (0)", "Esto no es un salto."],
    ["MemRead", "apagada (0)", "No se lee la memoria, se escribe."],
    ["MemtoReg", "no importa", "Solo sirve si se va a escribir en un registro — y acá no se escribe."],
    ["ALUOp", "suma (00)", "Le dice a ALU control “quiero que sumes”, fijo, sin mirar nada más."],
    ["MemWrite", "prendida (1)", "Esta es la señal clave: dice “esto es un guardado”."],
    ["ALUSrc (selector)", "prendido (1)", "La ALU va a sumar con el número (offset), no con otro registro."],
    ["RegWrite", "apagada (0)", "Un guardado no cambia ningún registro."],
  ],
  [1900, 1300, 6160]
));

// ---------- 3. PREGUNTAS TÍPICAS ----------
children.push(h1("3. Preguntas típicas del profe"));
children.push(p([ new TextRun({italics:true, color:"666666", text:"Con respuesta corta y simple, lista para decir en voz alta."}) ], {after:60}));

children.push(...pregunta(
  "¿Por qué no se escribe en ningún registro?",
  "Porque esta instrucción guarda un dato en memoria — no trae nada de vuelta a un registro."
));
children.push(...pregunta(
  "¿Por qué el selector está prendido?",
  "Porque la ALU tiene que sumar el registro te cero con el número que viene en la instrucción (el offset), no con otro registro."
));
children.push(...pregunta(
  "¿Qué calcula la ALU acá?",
  "Solo la dirección: te cero más el offset (que es cero). Ese resultado es dónde se va a guardar el dato."
));
children.push(...pregunta(
  "¿Y el valor de te uno, por dónde pasa?",
  "No pasa por la ALU. Va directo a la memoria como el dato que se va a guardar."
));
children.push(...pregunta(
  "¿Por qué se manda algo a ALU control si esta instrucción no lo necesita?",
  "Porque el cableado es siempre el mismo, para todas las instrucciones. Esos bits se mandan siempre, pero acá no importan, porque la otra señal (la del “quiero sumar”) ya le dice a ALU control qué hacer sin mirar esos bits. Esos bits sí importan en otro tipo de instrucciones (las que hacen operaciones entre dos registros)."
));
children.push(...pregunta(
  "¿Qué le manda ALU control a la ALU?",
  "Un código que en este caso significa “suma”. Esa señal entra a la ALU junto con los dos números que va a sumar."
));
children.push(...pregunta(
  "¿Por qué no sale nada de la memoria?",
  "Porque no se está leyendo, se está escribiendo. Leer memoria es lo que hace la instrucción contraria a esta (la que carga un dato desde memoria a un registro)."
));
children.push(...pregunta(
  "¿En qué se diferencia de la instrucción de tu compañero (la que carga datos)?",
  "Es exactamente al revés: la de él trae un dato de la memoria y lo guarda en un registro. La mía toma un dato de un registro y lo guarda en la memoria. Por eso casi todas las señales están invertidas entre las dos."
));
children.push(...pregunta(
  "¿Por qué el programa sigue avanzando si esto no es un salto?",
  "Porque avanzar al programa pasa siempre, en toda instrucción. Un salto es la excepción, no la regla — y acá no hay salto."
));

// ---------- 4. FRASES CORTAS ----------
children.push(h1("4. Frases cortas para no quedarte en blanco"));
children.push(bullet('"Esto guarda un dato en memoria, no lo trae de vuelta."'));
children.push(bullet('"El selector está prendido porque sumo con el número, no con otro registro."'));
children.push(bullet('"La señal de escritura en memoria es la que define que esto es un guardado."'));
children.push(bullet('"No se escribe en ningún registro — por eso esa señal está apagada."'));
children.push(bullet('"Con el código de operación alcanza para prender la escritura en memoria y el selector, y apagar la escritura en registro."'));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:32, bold:true, font:"Arial", color:"1F3864" },
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
  fs.writeFileSync("Guion_QA_sb.docx", buf);
  console.log("OK guion generado:", buf.length, "bytes");
});
