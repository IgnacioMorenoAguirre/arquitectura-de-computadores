const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun,
  Footer, AlignmentType, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber
} = require("docx");

const CW = 9360;
const FILL_TIP = "FFF6DD";
const FILL_SLIDE = "E8EEF7";
const FILL_MINE = "E3F2E3";
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const { Table, TableRow, TableCell } = require("docx");

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function p(runs, opts={}){
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({ alignment: AlignmentType.LEFT, spacing:{after:opts.after||160, line:340}, children });
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
function slide(title, time, fill, quote, note){
  const out = [];
  out.push(new Paragraph({ spacing:{before:280}, children:[] }));
  out.push(new Paragraph({ spacing:{after:80},
    children:[ new TextRun({ text:title, bold:true, size:26, color:"1F3864" }),
      new TextRun({ text:"   ("+time+")", italics:true, size:20, color:"777777" }) ] }));
  out.push(box([ new TextRun({ italics:true, text:quote, size:23 }) ], fill));
  if (note){
    out.push(new Paragraph({ spacing:{before:80}, children:[
      new TextRun({ text:note, italics:true, size:20, color:"666666" }) ] }));
  }
  return out;
}

const children = [];

children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:60},
    children:[ new TextRun({ text:"Guion de la presentación completa", bold:true, size:38 }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:40},
    children:[ new TextRun({ text:"11 slides — ~10 minutos", bold:true, size:28, color:"2E5496" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:300},
    children:[ new TextRun({ text:"Laboratorio Assembler MIPS — Arquitectura de Computadores (INF60500) — Ignacio Moreno", italics:true, size:22, color:"666666" }) ] }),
  box([ new TextRun({ text:"Cubre las slides compartidas y tu parte (sb). Las slides de tus compañeros (beq, lbu) no llevan guion acá — es su instrucción, cada uno arma su propia explicación. Solo se dejan marcadas con el tiempo estimado. Tu parte fuerte (sb) tiene el detalle completo en Guion_QA_sb.md — acá va la versión resumida para no repetir.", size:22 }) ], FILL_TIP)
);

children.push(...slide("Slide 1 — Portada", "≈10 seg", FILL_SLIDE,
  "“Buenos días/tardes. Somos Rodrigo, Wladimir e Ignacio, y vamos a presentar el laboratorio de Assembler MIPS: un conversor de minúsculas a mayúsculas, con su mapeo en el datapath.”"));

children.push(...slide("Slide 2 — MIPS", "≈35 seg", FILL_SLIDE,
  "“MIPS es una arquitectura de 32 bits, con instrucciones simples y de largo fijo. En nuestro algoritmo usamos los tres formatos: tipo R, como move; tipo I, que es la mayoría — lbu, beq, slti, bne, addi, sb, la; y tipo J, los saltos directos como j y jal. O sea, entre todas las instrucciones se cubren prácticamente todos los componentes del datapath.”"));

children.push(...slide("Slide 3 — Datapath (componentes)", "≈35 seg", FILL_SLIDE,
  "“Antes de entrar al detalle, esta es la lista de componentes del datapath y para qué sirve cada uno: el PC guarda la dirección de la instrucción actual; la memoria de instrucciones la entrega; la unidad de Control decodifica el opcode y prende las señales; el banco de registros lee y escribe datos; la ALU hace las operaciones; la memoria de datos lee y escribe bytes del string; Sign-Extend estira el inmediato a 32 bits; y los MUX seleccionan entre distintas fuentes según las señales de control.”"));

children.push(...slide("Slide 4 — Señales de control", "≈35 seg", FILL_SLIDE,
  "“Estas señales las prende la unidad de Control según el opcode. Cada una tiene un rol puntual: RegDst elige el registro destino, ALUSrc elige si el segundo operando de la ALU es un registro o un inmediato, MemRead y MemWrite habilitan lectura o escritura en memoria, RegWrite habilita escritura en un registro, MemtoReg elige si el dato viene de la ALU o de memoria, Branch habilita la evaluación de saltos, y ALUOp le dice a la ALU qué operación hacer. Estas mismas señales son las que vamos a prender y apagar en cada instrucción que mapeamos.”"));

children.push(...slide("Slide 5 — Etapas del procesador monociclo", "≈40 seg", FILL_SLIDE,
  "“Toda instrucción, sin excepción, pasa por 5 etapas en un mismo ciclo de reloj: Fetch, donde se busca la instrucción en memoria usando el PC; Decode, donde Control interpreta el opcode y se leen los registros; Execute, donde la ALU hace su operación; Memory Access, que solo aplica si la instrucción lee o escribe memoria; y Write Back, donde se actualiza el registro destino si corresponde. En las siguientes slides van a ver exactamente qué pasa en cada etapa para tres instrucciones distintas.”"));

children.push(...slide("Slide 6 — Código HLL (Python)", "≈40 seg", FILL_SLIDE,
  "“Este es el algoritmo en alto nivel, en Python. Recorre la palabra carácter por carácter, obtiene su valor ASCII, y si está entre 97 y 122 (o sea, es una letra minúscula), le resta 32 para convertirla en mayúscula. Si ya está en mayúscula o es otro símbolo, se deja igual.”"));

children.push(...slide("Slide 7 — Código LLL (Ensamblador)", "≈45 seg", FILL_SLIDE,
  "“Y este es el mismo algoritmo, pero en ensamblador MIPS. main llama a la función transformar, que recorre la cadena con un puntero ($t0). En cada vuelta del bucle: se carga el carácter con lbu, se verifica con dos slti si está en el rango de una minúscula, y si lo está, se le resta 32 con addi y se guarda de vuelta con sb. Después se avanza al siguiente byte y se repite, hasta encontrar el carácter nulo que marca el final del texto.”",
  "Si te preguntan algo más específico del código completo, tienes el detalle en Explicacion_Codigo_Completo.md — registro por registro, con un ejemplo trazado con la palabra “hola”."));

children.push(...slide("Slide 8 — Datapath beq (la presenta tu compañero)", "≈1 min 30 seg", FILL_SLIDE,
  "(No es tu parte — cada uno arma su propio guion para su instrucción.)"));

children.push(...slide("Slide 9 — Datapath lbu (la presenta tu compañero)", "≈1 min 30 seg", FILL_SLIDE,
  "(No es tu parte — cada uno arma su propio guion para su instrucción.)"));

children.push(...slide("Slide 10 — Datapath sb — TU PARTE", "≈1 min 45 seg", FILL_MINE,
  "“Mi instrucción es sb, que guarda un dato en la memoria: guarda lo que hay en el registro te uno, en la dirección que apunta el registro te cero. Con el opcode 101000, Control prende la escritura en memoria y el selector (para usar el inmediato, no otro registro), y apaga la escritura en un registro, porque un guardado nunca cambia un registro.\n\nEl camino: se leen te cero y te uno del banco de registros, el inmediato pasa por Sign-extend, la ALU suma te cero más cero para obtener la dirección, y en paralelo el valor de te uno entra directo a la memoria como el dato a guardar. Como la señal de escritura está prendida, la memoria guarda ese byte ahí. No hay write-back, porque un guardado no cambia registros.”",
  "Guion completo, con Q&A y frases de apoyo, en Guion_QA_sb.md."));

children.push(...slide("Slide 11 — Conclusiones", "≈30 seg", FILL_SLIDE,
  "“En resumen: este laboratorio nos permitió consolidar el uso de instrucciones condicionales, lógicas y llamadas al sistema en ensamblador, entendiendo lo estricto que es el orden de ejecución. Y el estudio del datapath nos dio una visión clara de que cada línea de código activa compuertas, multiplexores y registros físicos reales — no es solo texto, es hardware funcionando. Muchas gracias.”"));

children.push(new Paragraph({ spacing:{before:300}, children:[] }));
children.push(h1("Notas de tiempo"));
children.push(p("Si van sumando los tiempos sugeridos da ~9 minutos, dejando margen."));
children.push(p("Las slides 8 y 9 (beq, lbu) no llevan guion porque son la instrucción de tus compañeros — cada uno prepara la suya."));
children.push(p("Si el profe corta a mitad de una slide con una pregunta, no pasa nada: respondan y retomen donde quedaron."));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:28, bold:true, font:"Arial", color:"1F3864" },
        paragraph:{ spacing:{before:0, after:160}, outlineLevel:0 } },
    ]
  },
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
  fs.writeFileSync("Guion_Presentacion_Completa.docx", buf);
  console.log("OK guion presentacion completa generado:", buf.length, "bytes");
});
