/**
 * @file src/lib/pdf-generator.ts
 * @description Servicio de generación y exportación de documentos curriculares en PDF
 * utilizando jsPDF y jspdf-autotable con formato técnico-institucional Minedu / CNEB Perú.
 * Incluye el Escudo Nacional del Perú / Isotipo Minedu en Base64 en todas las páginas,
 * encabezado institucional borgoña unificado, sanitización de caracteres y pie de página limpio.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentoCurricularCNEB, sanitizarDocumentoCurricular } from './prompts';

interface AutoTableJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Propiedades y metadatos estándar para reportes educativos (ISO 32000 / Minedu CNEB)
 */
export interface MetadatosPropiedadesPDF {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  creationDate: Date;
  normativaReferencia: string;
}

const COLOR_MINEDU_RED: [number, number, number] = [153, 27, 27]; // #991B1B (Borgoña institucional)
const COLOR_SLATE_DARK: [number, number, number] = [15, 23, 42]; // #0F172A
const COLOR_SLATE_MUTED: [number, number, number] = [71, 85, 105]; // #475569
const COLOR_BG_SOFT: [number, number, number] = [248, 250, 252]; // #F8FAFC
const COLOR_BORDER: [number, number, number] = [203, 213, 225]; // #CBD5E1

/**
 * Imagen en Base64 (PNG 64x64 RGBA) del Escudo Nacional del Perú / Isotipo Institucional Minedu
 * para incrustación directa mediante doc.addImage(ESCUDO_MINEDU_BASE64, 'PNG', x, y, ancho, alto).
 */
export const ESCUDO_MINEDU_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAB4ElEQVR42u2bvU2DQQyGs0SCFGUABqBghmxBQZuF0iBlBRoKNqCgSMMgSIgmaQPK3fnn9c+BLbnN5/ex7/suPt9iUVZWZmmf7w8njf9L0dPCsBKeHsQoYKlNAWIk+mO/VvkIRlrhaACpQHDKHA2gByKdeEsAIRAkLzdLAC0QacR7ATCHoPmseQEwg4D6pnsZHAJF/PHpJsQpEEyyv3q8++FRAH7HAa0CqvhLAPevXywfZXJUcddigUFolf4sAFRLgZP9y4C8AfRiUlUBVTwawOqw7ToVQAuCSfZbAJ53t1cdDQBeBVzxGQBwIBQARPm3XkqRAHpxkpeBJPuZAbCroAAEA5DsA9wB9AKK2AhJ3gMFoAAYAcjQDygABSAQwMtm4+IFIBJAbyMUDSB8JzgK/PttSfICkAGA5O9wNgCirpCmCjwBwLPvsQwQAMzKX9MUpVYBCoBUvKgzTGmLU6tAC4DaC1S1xa2rQPv9N8++5GjMY1PE7QSrT4k5VWANQVv6LifEVhDCxEuWQuvIDCWe8kzogMRoRIYakAQCNes98S5zQr3AJCA4wl3EIyCM+gmI30oxK8gJXuMhg5LUUVlP8annhb2znmJi3GOQctp7A39OeF2ZqUtTdW2uLk6Wlc1vZwY+gt1lh0DHAAAAAElFTkSuQmCC';

/**
 * Sanitiza cualquier texto para el motor de fuentes estándar de jsPDF (WinAnsiEncoding),
 * aplicando primero texto.replace(/!/g, '→') y luego convirtiendo '→' a ' -> ' para evitar
 * que jsPDF trunque el byte superior de Unicode (\u2192 -> 0x21 = '!').
 */
export function limpiarTextoParaMotorPDF(texto: string): string {
  if (!texto || typeof texto !== 'string') return '';
  return texto.replace(/!/g, '→').replace(/→/g, ' -> ');
}

/**
 * Formatea el texto institucional izquierdo del pie de página:
 * "I.E. N.° [Nombre_IE] — UGEL [Numero_UGEL]"
 */
function formatearPieInstitucional(institucionRaw: string, ugelRaw: string): string {
  const ieTrim = (institucionRaw || '').trim();
  const ugelTrim = (ugelRaw || '').trim();

  const textoIE =
    !ieTrim
      ? 'I.E. N.° 1145 República de Colombia'
      : /^I\.?\s*E\.?/i.test(ieTrim)
      ? ieTrim
      : `I.E. N.° ${ieTrim}`;

  const textoUGEL =
    !ugelTrim
      ? 'UGEL 05'
      : /^UGEL/i.test(ugelTrim)
      ? ugelTrim
      : `UGEL ${ugelTrim}`;

  return `${limpiarTextoParaMotorPDF(textoIE)} — ${limpiarTextoParaMotorPDF(textoUGEL)}`;
}

/**
 * Genera el nombre de archivo PDF sugerido por defecto siguiendo el estándar docente:
 * Ejemplo: "PCA_5to_Primaria_Comunicacion_2026.pdf"
 */
export function generarNombreArchivoPorDefectoPDF(
  documento: DocumentoCurricularCNEB
): string {
  const prefijoTipo =
    documento.tipoDocumento === 'PCA'
      ? 'PCA'
      : documento.tipoDocumento === 'UNIDAD'
      ? 'Unidad'
      : 'Sesion';

  const gradoRaw = documento.datosInformativos.gradoYSeccion || '5.° de Primaria';
  const mapaGrados: Record<string, string> = {
    '1': '1ro_Primaria',
    '2': '2do_Primaria',
    '3': '3ro_Primaria',
    '4': '4to_Primaria',
    '5': '5to_Primaria',
    '6': '6to_Primaria',
  };
  const digitoGrado = gradoRaw.match(/[1-6]/)?.[0] || '5';
  const slugGrado = mapaGrados[digitoGrado] || '5to_Primaria';

  const areaLimpia = (documento.datosInformativos.areaCurricular || 'Comunicacion')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const matchAnio = documento.datosInformativos.periodoLectivo?.match(/20\d{2}/);
  const anio = matchAnio ? matchAnio[0] : String(new Date().getFullYear());

  return `${prefijoTipo}_${slugGrado}_${areaLimpia}_${anio}.pdf`;
}

/**
 * Normaliza un nombre de archivo personalizado ingresado por el docente asegurando la extensión .pdf
 */
export function normalizarNombreArchivoPDF(
  nombrePersonalizado: string | undefined,
  documento: DocumentoCurricularCNEB
): string {
  const limpio = (nombrePersonalizado || '').trim().replace(/[\\/:*?"<>|]+/g, '_');
  if (!limpio) {
    return generarNombreArchivoPorDefectoPDF(documento);
  }
  return limpio.toLowerCase().endsWith('.pdf') ? limpio : `${limpio}.pdf`;
}

/**
 * Construye los campos de metadatos institucionales del documento PDF a partir
 * de los datos curriculares de Educación Primaria y permite sobrescrituras personalizadas.
 */
export function construirMetadatosPropiedadesPDF(
  documento: DocumentoCurricularCNEB,
  overrides?: Partial<MetadatosPropiedadesPDF>
): MetadatosPropiedadesPDF {
  const info = documento.datosInformativos;
  const fechaParseada = documento.fechaGeneracion
    ? new Date(documento.fechaGeneracion)
    : new Date();
  const creationDateValida = Number.isNaN(fechaParseada.getTime())
    ? new Date()
    : fechaParseada;

  const etiquetaTipo =
    documento.tipoDocumento === 'PCA'
      ? 'Planificación Curricular Anual (PCA)'
      : documento.tipoDocumento === 'UNIDAD'
      ? 'Unidad Didáctica'
      : 'Sesión de Aprendizaje';

  const defaultTitle = `[${documento.tipoDocumento}] ${info.areaCurricular} — ${info.gradoYSeccion} (${info.institucionEducativa})`;
  const defaultAuthor = `${info.docenteResponsable} · ${info.institucionEducativa} (${info.dre} / ${info.ugel})`;
  const defaultSubject = `${etiquetaTipo} de Educación Primaria (${info.ciclo}) · Área: ${info.areaCurricular} · Periodo: ${info.periodoLectivo} · ${documento.codigoNormativo}`;
  const defaultKeywords = [
    'Minedu Perú',
    'CNEB',
    'Educación Primaria',
    'R.M. 649-2016-MINEDU',
    documento.tipoDocumento,
    info.areaCurricular,
    info.gradoYSeccion,
    info.ciclo,
    info.ugel,
    info.dre,
    'Evaluación Formativa R.V.M. 094-2020-MINEDU',
  ].join(', ');

  const defaultCreator =
    'CNEB Planificador Educación Primaria Perú — Sistema Técnico-Pedagógico Minedu';

  return {
    title: overrides?.title?.trim() || defaultTitle,
    author: overrides?.author?.trim() || defaultAuthor,
    subject: overrides?.subject?.trim() || defaultSubject,
    keywords: overrides?.keywords?.trim() || defaultKeywords,
    creator: overrides?.creator?.trim() || defaultCreator,
    creationDate:
      overrides?.creationDate instanceof Date ? overrides.creationDate : creationDateValida,
    normativaReferencia:
      overrides?.normativaReferencia?.trim() ||
      documento.codigoNormativo ||
      'R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU',
  };
}

/**
 * Inyecta los metadatos estándar (Title, Author, Subject, Keywords, Creator y CreationDate)
 * en el diccionario /Info del binario PDF usando jsPDF para cumplir con los estándares
 * de propiedades documentales de reportes educativos.
 */
export function aplicarMetadatosEducativosPDF(
  doc: jsPDF,
  documento: DocumentoCurricularCNEB,
  overrides?: Partial<MetadatosPropiedadesPDF>
): MetadatosPropiedadesPDF {
  const metadatos = construirMetadatosPropiedadesPDF(documento, overrides);

  doc.setProperties({
    title: metadatos.title,
    subject: metadatos.subject,
    author: metadatos.author,
    keywords: metadatos.keywords,
    creator: metadatos.creator,
  });

  if (typeof doc.setCreationDate === 'function') {
    doc.setCreationDate(metadatos.creationDate);
  }

  return metadatos;
}

/**
 * Construye la instancia de jsPDF con todo el diseño institucional Minedu / CNEB
 * e inyecta los metadatos de propiedades del documento educativo.
 */
export function construirInstanciaPDFCurricular(
  documentoOriginal: DocumentoCurricularCNEB,
  metadataOverrides?: Partial<MetadatosPropiedadesPDF>
): jsPDF {
  // Sanitizamos previamente todos los campos del documento (incluyendo texto.replace(/!/g, '→'))
  const documento = sanitizarDocumentoCurricular(documentoOriginal);

  const isLandscape = documento.tipoDocumento === 'PCA';
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as AutoTableJsPDF;

  // Aplicar propiedades y metadatos del reporte educativo (Title, Author, Subject, Keywords, Creator, CreationDate)
  aplicarMetadatosEducativosPDF(doc, documento, metadataOverrides);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const marginTopPaginasSiguientes = 25; // Evita que los encabezados repetidos en páginas 2, 3... choquen con la cabecera
  const marginBottomPagina = 20;
  const contentWidth = pageWidth - marginX * 2;

  const ensureSpace = (currentY: number, requiredSpace: number): number => {
    if (currentY + requiredSpace > pageHeight - marginBottomPagina) {
      doc.addPage();
      drawInstitutionalTopBar(doc, documento, pageWidth, marginX);
      return marginTopPaginasSiguientes + 2;
    }
    return currentY;
  };

  // 1. Encabezado Institucional en la primera página (incluye franja borgoña con Escudo del Perú + título)
  const headerBottomY = drawInstitutionalHeader(doc, documento, pageWidth, marginX);

  // Garantizamos que la primera tabla comience más abajo del encabezado institucional
  // (mínimo startY >= 32 en portrait / >= 28 en landscape, y con holgura debajo del título del documento)
  const minFirstStartY = isLandscape ? 28 : 32;
  let cursorY = Math.max(minFirstStartY + 8, headerBottomY + 6);

  // 2. Sección I: Datos Informativos (Tabla estructurada)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text('I. DATOS INFORMATIVOS INSTITUCIONALES', marginX, cursorY);
  cursorY += 2.5;

  const firstTableStartY = Math.max(minFirstStartY, cursorY);
  const info = documento.datosInformativos;
  autoTable(doc, {
    startY: firstTableStartY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLOR_BG_SOFT, cellWidth: isLandscape ? 38 : 32 },
      1: { cellWidth: isLandscape ? 96 : 59 },
      2: { fontStyle: 'bold', fillColor: COLOR_BG_SOFT, cellWidth: isLandscape ? 38 : 32 },
      3: { cellWidth: isLandscape ? 97 : 59 },
    },
    body: [
      [
        'DRE / GRE',
        limpiarTextoParaMotorPDF(info.dre),
        'UGEL',
        limpiarTextoParaMotorPDF(info.ugel),
      ],
      [
        'Institución Educativa',
        limpiarTextoParaMotorPDF(info.institucionEducativa),
        'Nivel / Ciclo',
        limpiarTextoParaMotorPDF(`${info.nivel} — ${info.ciclo}`),
      ],
      [
        'Área Curricular',
        limpiarTextoParaMotorPDF(info.areaCurricular),
        'Grado y Sección',
        limpiarTextoParaMotorPDF(info.gradoYSeccion),
      ],
      [
        'Periodo Lectivo',
        limpiarTextoParaMotorPDF(info.periodoLectivo),
        'Duración',
        limpiarTextoParaMotorPDF(info.duracionEstimada),
      ],
      [
        'Docente Responsable',
        limpiarTextoParaMotorPDF(info.docenteResponsable),
        'Director(a) I.E.',
        limpiarTextoParaMotorPDF(info.directorIE),
      ],
    ],
  });

  cursorY = (doc.lastAutoTable?.finalY ?? firstTableStartY + 30) + 7;

  // 3. Sección II: Descripción General / Preparación de la Sesión y Caracterización
  cursorY = ensureSpace(cursorY, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text(
    documento.tipoDocumento === 'SESION'
      ? 'II. JUSTIFICACIÓN PEDAGÓGICA Y PREPARACIÓN DE LA SESIÓN (ANTES DE LA SESIÓN)'
      : 'II. DESCRIPCIÓN GENERAL, DIAGNÓSTICO Y CARACTERIZACIÓN DEL ESTUDIANTE',
    marginX,
    cursorY
  );
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    body: [[limpiarTextoParaMotorPDF(documento.descripcionGeneralYCaracterizacion)]],
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 25) + 7;

  // 4. Sección III: Situación Significativa Contextualizada
  cursorY = ensureSpace(cursorY, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text(
    documento.tipoDocumento === 'SESION'
      ? 'III. SITUACIÓN DE APRENDIZAJE, RETO Y EVIDENCIA DE LA SESIÓN (CNEB)'
      : 'III. SITUACIÓN SIGNIFICATIVA CONTEXTUALIZADA (CNEB)',
    marginX,
    cursorY
  );
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_SLATE_DARK,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLOR_BG_SOFT, cellWidth: isLandscape ? 48 : 38 },
      1: { cellWidth: contentWidth - (isLandscape ? 48 : 38) },
    },
    body: [
      [
        'Contexto Sociocultural y Realidad Local',
        limpiarTextoParaMotorPDF(documento.situacionSignificativa.contextoReal),
      ],
      [
        'Reto Pedagógico (Alta Demanda Cognitiva)',
        limpiarTextoParaMotorPDF(documento.situacionSignificativa.retoPedagogico),
      ],
      [
        documento.tipoDocumento === 'SESION'
          ? 'Evidencia / Producto de la Sesión'
          : 'Producto / Evidencia Integradora',
        limpiarTextoParaMotorPDF(documento.situacionSignificativa.productoIntegrador),
      ],
    ],
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 35) + 7;

  // 5. Sección IV: Matriz de Propósitos de Aprendizaje y Evaluación Formativa
  cursorY = ensureSpace(cursorY, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text(
    'IV. MATRIZ DE PROPÓSITOS DE APRENDIZAJE, CRITERIOS Y EVIDENCIAS (CNEB)',
    marginX,
    cursorY
  );
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_MINEDU_RED,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
      valign: 'top',
    },
    head: [
      [
        'Competencia y Capacidades CNEB',
        'Estándar de Aprendizaje (Ciclo)',
        'Desempeños Precisados',
        'Criterios de Evaluación Formativa',
        'Evidencia e Instrumento',
      ],
    ],
    body: documento.propositosAprendizaje.map((item) => [
      limpiarTextoParaMotorPDF(
        `${item.competencia.toUpperCase()}\n\nCapacidades:\n${item.capacidades
          .map((c) => `• ${c}`)
          .join('\n')}`
      ),
      limpiarTextoParaMotorPDF(item.estandarCiclo),
      limpiarTextoParaMotorPDF(item.desempenosPrecisados.map((d) => `• ${d}`).join('\n\n')),
      limpiarTextoParaMotorPDF(item.criteriosEvaluacion.map((c) => `• ${c}`).join('\n\n')),
      limpiarTextoParaMotorPDF(
        `Evidencia:\n${item.evidenciaAprendizaje}\n\nInstrumento:\n${item.instrumentoEvaluacion}`
      ),
    ]),
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 50) + 7;

  // 6. Sección V: Enfoques Transversales y Competencias Transversales
  cursorY = ensureSpace(cursorY, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text('V. ENFOQUES TRANSVERSALES Y COMPETENCIAS TRANSVERSALES', marginX, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_SLATE_DARK,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    head: [['Enfoque Transversal CNEB', 'Valor Priorizado', 'Actitudes y Acciones Observables']],
    body: documento.enfoquesTransversales.map((e) => [
      limpiarTextoParaMotorPDF(e.enfoque),
      limpiarTextoParaMotorPDF(e.valor),
      limpiarTextoParaMotorPDF(e.actitudesObservables),
    ]),
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 25) + 4;

  if (documento.competenciasTransversales && documento.competenciasTransversales.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: {
        top: marginTopPaginasSiguientes,
        bottom: marginBottomPagina,
        left: marginX,
        right: marginX,
      },
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.2,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.2,
        textColor: COLOR_SLATE_DARK,
        lineColor: COLOR_BORDER,
        lineWidth: 0.2,
      },
      head: [
        [
          'Competencia Transversal CNEB',
          'Capacidad Movilizada',
          'Desempeño Contextualizado en el Área',
        ],
      ],
      body: documento.competenciasTransversales.map((ct) => [
        limpiarTextoParaMotorPDF(ct.competencia),
        limpiarTextoParaMotorPDF(ct.capacidad),
        limpiarTextoParaMotorPDF(ct.desempenoContextualizado),
      ]),
    });
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 20) + 7;
  }

  // 7. Sección VI: Secuencia Didáctica (Unidades / Sesiones / Momentos Pedagógicos)
  cursorY = ensureSpace(cursorY, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);

  const tituloSecuencia =
    documento.tipoDocumento === 'PCA'
      ? 'VI. ORGANIZACIÓN DE LAS UNIDADES DIDÁCTICAS / EXPERIENCIAS DE APRENDIZAJE'
      : documento.tipoDocumento === 'UNIDAD'
      ? 'VI. SECUENCIA LÓGICA DE SESIONES DE APRENDIZAJE'
      : 'VI. SECUENCIA DIDÁCTICA DE LA SESIÓN (INICIO — DESARROLLO — CIERRE)';

  doc.text(tituloSecuencia, marginX, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_MINEDU_RED,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
      valign: 'top',
    },
    head: [
      [
        'N.° / Fase',
        'Título y Duración',
        'Actividades Estratégicas y Procesos Pedagógicos',
        'Recursos y Materiales',
        'Producto / Evidencia',
      ],
    ],
    body: documento.secuenciaDidactica.map((s) => {
      const bloqueProposito = s.proposito ? `Propósito: ${s.proposito}\n\n` : '';
      const bloqueSesionesSugeridas =
        s.sesionesSugeridas && s.sesionesSugeridas.length > 0
          ? `\n\nSesiones Sugeridas:\n${s.sesionesSugeridas
              .map((ss) => `• ${ss.numero}: ${ss.titulo} (${ss.duracion}) — ${ss.proposito}`)
              .join('\n')}`
          : '';
      return [
        limpiarTextoParaMotorPDF(`${s.numero}\n(${s.faseOMomento})`),
        limpiarTextoParaMotorPDF(`${s.titulo}\n\nDuración: ${s.duracion}`),
        limpiarTextoParaMotorPDF(
          `${bloqueProposito}${s.actividadesEstrategicas
            .map((a) => `• ${a}`)
            .join('\n\n')}${bloqueSesionesSugeridas}`
        ),
        limpiarTextoParaMotorPDF(s.recursosEducativos.map((r) => `• ${r}`).join('\n')),
        limpiarTextoParaMotorPDF(s.productoOEvidencia),
      ];
    }),
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 45) + 7;

  // 8. Sección VII: Orientaciones para la Evaluación Formativa y Materiales
  cursorY = ensureSpace(cursorY, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text(
    'VII. ORIENTACIONES PARA LA EVALUACIÓN FORMATIVA (R.V.M. N.° 094-2020-MINEDU)',
    marginX,
    cursorY
  );
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_SLATE_DARK,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    head: [['Tipo de Evaluación', 'Orientación Pedagógica', 'Técnicas e Instrumentos']],
    body: documento.orientacionesEvaluacion.map((oe) => [
      limpiarTextoParaMotorPDF(oe.tipoEvaluacion),
      limpiarTextoParaMotorPDF(oe.orientacionPedagogica),
      limpiarTextoParaMotorPDF(oe.tecnicasEInstrumentos),
    ]),
  });

  cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 25) + 7;

  // 9. Sección VIII: Materiales y Bibliografía
  cursorY = ensureSpace(cursorY, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text('VIII. MATERIALES EDUCATIVOS Y REFERENCIAS BIBLIOGRÁFICAS', marginX, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: {
      top: marginTopPaginasSiguientes,
      bottom: marginBottomPagina,
      left: marginX,
      right: marginX,
    },
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: COLOR_SLATE_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
      valign: 'top',
    },
    head: [['Para el Docente', 'Para el Estudiante']],
    body: [
      [
        limpiarTextoParaMotorPDF(
          documento.materialesYBibliografia.paraElDocente.map((m) => `• ${m}`).join('\n')
        ),
        limpiarTextoParaMotorPDF(
          documento.materialesYBibliografia.paraElEstudiante.map((m) => `• ${m}`).join('\n')
        ),
      ],
    ],
  });

  // 10. Bloque de Firmas Institucionales (Docente y Director)
  const finalY = doc.lastAutoTable?.finalY ?? cursorY;
  const espacioMinimoRequeridoPagina = 45;
  const alturaPieDePagina = 14;

  // Si finalY deja menos de 45mm útiles en la página actual, forzamos un salto de página manual
  let inicioZonaFirmasY = finalY;
  if (
    pageHeight - finalY < espacioMinimoRequeridoPagina ||
    pageHeight - alturaPieDePagina - finalY < espacioMinimoRequeridoPagina
  ) {
    doc.addPage();
    drawInstitutionalTopBar(doc, documento, pageWidth, marginX);
    inicioZonaFirmasY = marginTopPaginasSiguientes;
  }

  // Espacio vertical mínimo de 32mm (>= 30mm) para que el docente y director puedan firmar y sellar
  const ESPACIO_VERTICAL_FIRMA_MM = 32;
  const lineaFirmaY = inicioZonaFirmasY + ESPACIO_VERTICAL_FIRMA_MM;

  const colCenter1 = marginX + contentWidth * 0.25;
  const colCenter2 = marginX + contentWidth * 0.75;

  doc.setDrawColor(...COLOR_SLATE_MUTED);
  doc.setLineWidth(0.35);
  doc.line(colCenter1 - 38, lineaFirmaY, colCenter1 + 38, lineaFirmaY);
  doc.line(colCenter2 - 38, lineaFirmaY, colCenter2 + 38, lineaFirmaY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE_DARK);
  doc.text(limpiarTextoParaMotorPDF(info.docenteResponsable), colCenter1, lineaFirmaY + 5, {
    align: 'center',
  });
  doc.text(limpiarTextoParaMotorPDF(info.directorIE), colCenter2, lineaFirmaY + 5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_SLATE_MUTED);
  doc.text(
    limpiarTextoParaMotorPDF(`Docente de Aula (${info.gradoYSeccion} — ${info.areaCurricular})`),
    colCenter1,
    lineaFirmaY + 9,
    {
      align: 'center',
    }
  );
  doc.text(
    'V.° B.° Dirección / Subdirección de Educación Primaria',
    colCenter2,
    lineaFirmaY + 9,
    {
      align: 'center',
    }
  );

  // 11. Encabezado unificado en páginas secundarias y Pie de página limpio sin código aleatorio
  const textoPieIzquierda = formatearPieInstitucional(info.institucionEducativa, info.ugel);
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      drawInstitutionalTopBar(doc, documento, pageWidth, marginX);
    }
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE_MUTED);
    // [A la izquierda]: "I.E. N.° [Nombre_IE] — UGEL [Numero_UGEL]"
    doc.text(textoPieIzquierda, marginX, pageHeight - 7.5);
    // [A la derecha]: "Página X de Y"
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, pageHeight - 7.5, {
      align: 'right',
    });
  }

  return doc;
}

/**
 * Dibuja la franja superior institucional unificada en color borgoña (RGB: 153, 27, 27)
 * con el Escudo del Perú / Isotipo Minedu en Base64 a la izquierda, el texto oficial
 * "PERÚ | MINEDU — PROGRAMA CURRICULAR DE EDUCACIÓN PRIMARIA" y el Área/Grado a la derecha.
 * Se aplica de manera idéntica en la portada (Página 1) y en todas las páginas siguientes (Páginas 2, 3, etc.).
 */
function drawInstitutionalTopBar(
  doc: jsPDF,
  documento: DocumentoCurricularCNEB,
  pageWidth: number,
  marginX: number
): void {
  const contentWidth = pageWidth - marginX * 2;
  const barY = 9.5;
  const barHeight = 8;

  // Barra delgada color borgoña (RGB: 153, 27, 27)
  doc.setFillColor(...COLOR_MINEDU_RED);
  doc.rect(marginX, barY, contentWidth, barHeight, 'F');

  // Escudo Nacional del Perú / Isotipo Minedu centrado verticalmente a la izquierda
  const escudoWidth = 5.8;
  const escudoHeight = 5.8;
  const escudoX = marginX + 2.2;
  const escudoY = barY + (barHeight - escudoHeight) / 2;

  try {
    doc.addImage(ESCUDO_MINEDU_BASE64, 'PNG', escudoX, escudoY, escudoWidth, escudoHeight);
  } catch {
    // En caso de entorno sin soporte PNG, continúa con el texto alineado
  }

  // Padding izquierdo ajustado para no chocar con el Escudo del Perú
  const textLeftX = escudoX + escudoWidth + 2.4;
  const textBaselineY = barY + 5.1;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'PERÚ | MINEDU — PROGRAMA CURRICULAR DE EDUCACIÓN PRIMARIA',
    textLeftX,
    textBaselineY
  );

  // Área y Grado alineados a la derecha de la franja borgoña
  const areaYGradoDerecha = limpiarTextoParaMotorPDF(
    `${documento.datosInformativos.areaCurricular} · ${documento.datosInformativos.gradoYSeccion}`
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.text(areaYGradoDerecha, pageWidth - marginX - 2.5, textBaselineY, {
    align: 'right',
  });
}

/**
 * Dibuja el encabezado de la portada (Página 1) reutilizando la franja superior unificada
 * con el Escudo del Perú y añadiendo debajo el tipo y título del documento curricular.
 */
function drawInstitutionalHeader(
  doc: jsPDF,
  documento: DocumentoCurricularCNEB,
  pageWidth: number,
  marginX: number
): number {
  const contentWidth = pageWidth - marginX * 2;

  // 1. Franja borgoña unificada con Escudo del Perú + "PERÚ | MINEDU — PROGRAMA CURRICULAR DE EDUCACIÓN PRIMARIA" + Área/Grado
  drawInstitutionalTopBar(doc, documento, pageWidth, marginX);

  // 2. Subtítulo del Tipo de Documento Curricular
  const etiquetaTipo =
    documento.tipoDocumento === 'PCA'
      ? 'PLANIFICACIÓN CURRICULAR ANUAL (PCA) — NIVEL EDUCACIÓN PRIMARIA'
      : documento.tipoDocumento === 'UNIDAD'
      ? 'UNIDAD DIDÁCTICA DE EDUCACIÓN PRIMARIA'
      : 'SESIÓN DE APRENDIZAJE DE EDUCACIÓN PRIMARIA';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_MINEDU_RED);
  doc.text(etiquetaTipo, marginX, 22.5);

  // 3. Título principal del documento con soporte multilínea limpio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_SLATE_DARK);
  const tituloLimpio = limpiarTextoParaMotorPDF(documento.tituloDocumento);
  const splitTitle = doc.splitTextToSize(tituloLimpio, contentWidth);
  doc.text(splitTitle[0] || tituloLimpio, marginX, 27.5);

  if (splitTitle.length > 1) {
    doc.setFontSize(9.5);
    doc.text(splitTitle[1], marginX, 32);
    return 33;
  }

  return 28.5;
}

/**
 * Descarga directamente el archivo PDF en el navegador del docente con metadatos incrustados
 * y soporte para nombre de archivo personalizado (ej. "PCA_5to_Primaria_Comunicacion_2026.pdf").
 */
export function descargarDocumentoCurricularPDF(
  documento: DocumentoCurricularCNEB,
  metadataOverrides?: Partial<MetadatosPropiedadesPDF>,
  nombreArchivoPersonalizado?: string
): void {
  const doc = construirInstanciaPDFCurricular(documento, metadataOverrides);
  const nombreFinal = normalizarNombreArchivoPDF(nombreArchivoPersonalizado, documento);
  doc.save(nombreFinal);
}

/**
 * Genera una URL Blob para previsualizar el PDF embebido dentro de la aplicación
 */
export function generarBlobUrlDocumentoPDF(
  documento: DocumentoCurricularCNEB,
  metadataOverrides?: Partial<MetadatosPropiedadesPDF>
): string {
  const doc = construirInstanciaPDFCurricular(documento, metadataOverrides);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
