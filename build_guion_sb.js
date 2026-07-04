const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber
} = require("docx");

const CW = 9360; // content width (US Letter, 1" margins)
const FILL_HEAD = "D6E4F0";
const FILL_ALT = "F3F3F3";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function h2(t){ return new Paragraph({ heading: HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function p(runs, opts={}){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing:{after:opts.after||140, line:276}, children });
}
function bold(t){ return new TextRun({ text:t, bold:true }); }
function plain(t){ return new TextRun(t); }
function bullet(runs){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ numbering:{reference:"vi", level:0}, spacing:{after:80},
    alignment: AlignmentType.JUSTIFIED, children });
}
function num(runs){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ numbering:{reference:"no", level:0}, spacing:{after:80},
    alignment: AlignmentType.JUSTIFIED, children });
}
function pregunta(q, a){
  return [
    new Paragraph({ spacing:{before:120, after:40},
      children:[ new TextRun({ text:q, bold:true, color:"1F3864" }) ] }),
    p(a, {after:120})
  ];
}
function cell(text, w, {bold:b=false, fill=null, align=AlignmentType.LEFT, size=20}={}){
  return new TableCell({
    borders, width:{size:w, type:WidthType.DXA},
    shading: fill?{ type:ShadingType.CLEAR, fill }:undefined,
    margins:{ top:60, bottom:60, left:100, right:100 },
    children:[ new Paragraph({ alignment:align, children:[ new TextRun({ text, bold:b, size }) ] }) ]
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

const children = [];

// ---------- PORTADA ----------
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:40},
    children:[ new TextRun({ text:"Guion de exposición y Q&A", bold:true, size:36 }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:20},
    children:[ new TextRun({ text:"Instrucción sb $t1, 0($t0)", bold:true, size:30, color:"2E5496" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:300},
    children:[ new TextRun({ text:"Laboratorio Assembler MIPS — Arquitectura de Computadores (INF60500) — Ignacio Moreno", italics:true, size:20, color:"666666" }) ] }),
  p([ new TextRun({ italics:true, color:"555555",
    text:"Preparado para la evaluación presencial. El profe puede preguntar cualquier cosa de acá abajo, así que conviene entenderlo, no solo memorizarlo." }) ], {after:200})
);

// ---------- 1. GUION PRINCIPAL ----------
children.push(h1("1. Guion principal (lo que dices en voz alta)"));
children.push(p("Léelo en este orden, apoyándote en la slide 6:"));

children.push(p([
  plain('Mi instrucción es '), bold('sb $t1, 0($t0)'),
  plain(', un store byte: guarda el contenido de $t1 en la memoria, en la dirección $t0 + 0.')
]));

children.push(p([
  plain('Es de tipo '), bold('I'), plain(' (inmediato). Sus 32 bits se dividen así:')
]));
children.push(bullet([bold('opcode = 101000 '), plain('(bits 31-26): le dice a la unidad de Control que es un store.')]));
children.push(bullet([bold('rs = 01000 '), plain('(bits 25-21): registro $t0, la dirección base.')]));
children.push(bullet([bold('rt = 01001 '), plain('(bits 20-16): registro $t1, el dato que se va a guardar.')]));
children.push(bullet([bold('inmediato = 0000000000000000 '), plain('(bits 15-0): el offset, que en este caso es 0.')]));

children.push(p([
  plain('Con el opcode, Control activa '), bold('MemWrite = 1'), plain(' y '), bold('ALUSrc = 1'),
  plain(', y deja '), bold('RegWrite = 0'), plain(' porque un store nunca modifica un registro.')
]));

children.push(p("El camino activo es:"));
children.push(num("El PC entra a Instruction memory y se leen los 32 bits."));
children.push(num("rs ($t0) va a Read register 1, y rt ($t1) va a Read register 2 — el banco de registros entrega Read data 1 = valor de $t0 y Read data 2 = valor de $t1."));
children.push(num("El inmediato pasa por Sign-extend, que lo lleva a 32 bits con signo (sigue siendo 0)."));
children.push(num("Como ALUSrc = 1, el MUX elige la salida de Sign-extend (no Read data 2) como segundo operando de la ALU."));
children.push(num("ALUOp = 00 le dice a ALU control que mande el código de sumar; ALU control manda esa señal a la ALU."));
children.push(num("La ALU suma $t0 + 0 y el resultado es la dirección de memoria."));
children.push(num("Esa dirección entra a Address de Data memory. En paralelo, Read data 2 ($t1) entra directo a Write data — sin pasar por la ALU."));
children.push(num("Como MemWrite = 1, la memoria escribe el byte de $t1 en esa dirección."));
children.push(num("No hay write-back: RegWrite = 0, así que no se toca ningún registro, y por eso Read data de memoria y el MUX final ni se usan."));
children.push(num("En paralelo, PC+4 avanza al programa hacia la siguiente instrucción (Branch = 0, no hay salto)."));

// ---------- 2. TABLA DE SEÑALES ----------
children.push(h1("2. Señales de control, una por una"));
children.push(p("Por si preguntan “¿por qué ese valor?”:"));
children.push(table(
  ["Señal", "Valor", "Por qué"],
  [
    ["RegDst", "X", "No hay escritura a registro, así que da igual qué registro “elegiría” el mux de destino — nunca se usa."],
    ["Branch", "0", "sb no es un salto condicional."],
    ["MemRead", "0", "No se lee memoria, se escribe."],
    ["MemtoReg", "X", "Solo se usa para decidir qué se escribe en el registro — y como RegWrite=0, no aplica."],
    ["ALUOp", "00", "Código fijo que le dice a ALU control “esta es una operación de suma” (para calcular direcciones, siempre se suma)."],
    ["MemWrite", "1", "Es la señal que define que esto es un store: se activa la escritura en memoria."],
    ["ALUSrc", "1", "El segundo operando de la ALU viene del inmediato (Sign-extend), no de un registro."],
    ["RegWrite", "0", "Un store no modifica ningún registro."],
  ],
  [1800, 1200, 6360]
));

// ---------- 3. PREGUNTAS TÍPICAS ----------
children.push(new Paragraph({ children:[], spacing:{before:200} }));
children.push(h1("3. Preguntas típicas que puede hacer el profe (y respuesta corta)"));

children.push(...pregunta(
  "¿Por qué RegWrite es 0?",
  "Porque sb guarda un dato en memoria, no lo trae de vuelta a un registro. No hay write-back."
));
children.push(...pregunta(
  "¿Por qué ALUSrc es 1 y no 0?",
  "Porque la ALU necesita sumar $t0 con el offset inmediato (0 en este caso), no con otro registro. Si fuera una instrucción tipo add $t1,$t2,$t3, ahí sí ALUSrc sería 0 (el segundo operando vendría de Read data 2)."
));
children.push(...pregunta(
  "¿Qué hace la ALU exactamente?",
  "Suma $t0 (dirección base) + el inmediato con signo (0) = dirección de memoria donde se escribe."
));
children.push(...pregunta(
  "¿Qué pasa con Read data 2 si no pasa por la ALU?",
  "Va directo a Write data de Data memory. Es el dato a guardar, no participa en el cálculo de la dirección."
));
children.push(...pregunta(
  "¿Por qué Instruction[5-0] va a ALU control si esta instrucción no es tipo R?",
  "Es una conexión física fija del datapath: esos 6 bits siempre se mandan a ALU control, pero acá no se usan de verdad, porque ALUOp=00 ya le dice a ALU control “suma” sin mirar esos bits. Esos bits importan cuando ALUOp=10 (instrucciones tipo R), ahí sí ALU control mira el funct para decidir entre suma, resta, AND, OR, etc."
));
children.push(...pregunta(
  "¿Qué le dice ALU control a la ALU?",
  "Le manda un código de 4 bits que en este caso significa “suma”. Esa señal entra a la ALU por abajo, junto al segundo operando."
));
children.push(...pregunta(
  "¿Por qué no sale nada de Data memory?",
  "Porque MemRead=0. La memoria solo escribe, no entrega ningún dato de vuelta, y por eso el MUX final (el que elige entre resultado de ALU o dato leído de memoria) tampoco se usa."
));
children.push(...pregunta(
  "¿Qué diferencia hay con lbu (la de tu compañero)?",
  "lbu es la operación espejo: ahí MemRead=1, RegWrite=1, MemtoReg=1 (todo lo que en sb está apagado), y sí sale un dato de Read data de memoria que vuelve a escribirse en un registro. sb es exactamente lo opuesto: los datos van hacia la memoria, no vuelven."
));
children.push(...pregunta(
  "¿Por qué el PC+4 sigue activo si esto no es un salto?",
  "Porque avanzar al programa (PC = PC+4) pasa en toda instrucción, sea cual sea. Es independiente de si hay salto o no — el salto solo cambiaría qué valor entra al MUX final de arriba (PCSrc), pero acá Branch=0 así que siempre se elige PC+4."
));

// ---------- 4. FRASES CLAVE ----------
children.push(new Paragraph({ children:[], spacing:{before:200} }));
children.push(h1("4. Frases clave para no trabarte"));
children.push(bullet('"Es un store, así que los datos van hacia la memoria, no vuelven."'));
children.push(bullet('"ALUSrc=1 porque sumo con el inmediato, no con otro registro."'));
children.push(bullet('"MemWrite=1 es la señal que define que esto es un store."'));
children.push(bullet('"No hay write-back porque RegWrite=0 — no se modifica ningún registro."'));
children.push(bullet('"El opcode 101000 es lo único que Control necesita para prender MemWrite y ALUSrc, y apagar RegWrite."'));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:22 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:28, bold:true, font:"Arial", color:"1F3864" },
        paragraph:{ spacing:{before:280, after:140}, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:24, bold:true, font:"Arial", color:"2E5496" },
        paragraph:{ spacing:{before:200, after:100}, outlineLevel:1 } },
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
