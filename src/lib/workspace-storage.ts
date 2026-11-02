/**
 * @file src/lib/workspace-storage.ts
 * @description Gestión de aislamiento de sesiones de trabajo por navegador y persistencia local
 * para el Planificador Curricular CNEB.
 *
 * Garantiza que:
 * 1. Cada navegador posea un identificador único de espacio de trabajo (`workspaceId`).
 * 2. Los proyectos PCA, unidades didácticas, sesiones de aprendizaje, documentos editados
 *    y parámetros del proyecto se persistan exclusivamente en el almacenamiento local
 *    (`localStorage`) del navegador correspondiente.
 * 3. Al recargar la página se restaure íntegramente el estado del navegador (incluso si el
 *    espacio de trabajo está vacío, sin inyectar proyectos compartidos de otros usuarios).
 * 4. Se pueda exportar cualquier proyecto completo a un archivo `.json` e importar proyectos
 *    desde archivos `.json` válidos verificando su integridad estructural.
 */

import {
  DocumentoCurricularCNEB,
  ESCENARIOS_PEDAGOGICOS_PERU,
  ParametrosPlanificacionCNEB,
  sanitizarDocumentoCurricular,
} from './prompts';
import type {
  ConversacionPlanificacion,
  MensajeChatCNEB,
} from '../app/planificador/components/SidebarArbolProyectos';

export const WORKSPACE_ID_STORAGE_KEY = 'cneb_workspace_id_v1';
export const WORKSPACE_STATE_STORAGE_PREFIX = 'cneb_workspace_state_v1_';
export const FORMATO_EXPORTACION_PROYECTO = 'CNEB_PROYECTO_CURRICULAR_V1' as const;

export interface EstadoEspacioTrabajoCNEB {
  version: 1;
  workspaceId: string;
  ultimaActualizacionISO: string;
  conversacionActivaId: string | null;
  documentoEnfocadoId: string | null;
  proyectosExpandidos: Record<string, boolean>;
  parametrosFormulario: ParametrosPlanificacionCNEB;
  historial: ConversacionPlanificacion[];
}

export interface ArchivoExportacionProyectoCNEB {
  formato: typeof FORMATO_EXPORTACION_PROYECTO;
  version: 1;
  fechaExportacionISO: string;
  workspaceOrigenId: string;
  proyecto: ConversacionPlanificacion;
}

export type ResultadoImportacionProyectoCNEB =
  | {
      valido: true;
      proyecto: ConversacionPlanificacion;
      reemplazoExistente: boolean;
    }
  | {
      valido: false;
      error: string;
    };

export const PARAMETROS_INICIALES_POR_DEFECTO: ParametrosPlanificacionCNEB =
  ESCENARIOS_PEDAGOGICOS_PERU[0]?.datos || {
    tipoDocumento: 'PCA',
    nivel: 'Primaria',
    grado: '5.° de Primaria',
    area: 'Comunicación',
    periodo: 'Año Lectivo 2026 (I al IV Bimestre — 8 Unidades Didácticas)',
    diagnostico:
      'De acuerdo con las actas del SIAGIE y la Evaluación Diagnóstica de Entrada, el 70% de los niños y niñas de 5.° grado localiza información explícita en textos narrativos, pero solo el 36% logra realizar inferencias de causa-efecto y reflexionar críticamente sobre textos expositivos y argumentativos discontinuos.',
    contexto:
      'Estudiantes de 10 a 11 años de Educación Primaria. En los patios escolares y alrededores se observa acumulación de residuos plásticos tras el recreo.',
    institucion: 'I.E. N.° 1145 República de Colombia',
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    docente: 'Lic. María Elena Paredes Rengifo',
    director: 'Dr. Jorge Luis Mendoza Castro',
  };

function obtenerStorageSeguro(storageExplicito?: Storage): Storage | null {
  if (storageExplicito) return storageExplicito;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Genera un identificador único de espacio de trabajo para el navegador.
 */
export function generarWorkspaceIdUnico(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ws_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  const randomPart2 = Math.random().toString(36).substring(2, 11);
  return `ws_${timestamp}_${randomPart}_${randomPart2}`;
}

/**
 * Obtiene el `workspaceId` conservado en el navegador o genera y persiste uno nuevo.
 */
export function obtenerOCrearWorkspaceId(storageExplicito?: Storage): string {
  const storage = obtenerStorageSeguro(storageExplicito);
  if (!storage) {
    return generarWorkspaceIdUnico();
  }

  try {
    const existente = storage.getItem(WORKSPACE_ID_STORAGE_KEY);
    if (existente && typeof existente === 'string' && existente.trim().startsWith('ws_')) {
      return existente.trim();
    }
    const nuevoId = generarWorkspaceIdUnico();
    storage.setItem(WORKSPACE_ID_STORAGE_KEY, nuevoId);
    return nuevoId;
  } catch {
    return generarWorkspaceIdUnico();
  }
}

export function construirClaveStorageWorkspace(workspaceId: string): string {
  return `${WORKSPACE_STATE_STORAGE_PREFIX}${workspaceId}`;
}

function clonarParametros(params?: Partial<ParametrosPlanificacionCNEB>): ParametrosPlanificacionCNEB {
  const base = PARAMETROS_INICIALES_POR_DEFECTO;
  return {
    tipoDocumento:
      params?.tipoDocumento === 'PCA' ||
      params?.tipoDocumento === 'UNIDAD' ||
      params?.tipoDocumento === 'SESION'
        ? params.tipoDocumento
        : base.tipoDocumento,
    nivel: 'Primaria',
    grado:
      typeof params?.grado === 'string' && params.grado.trim().length > 0
        ? params.grado.trim()
        : base.grado,
    area:
      typeof params?.area === 'string' && params.area.trim().length > 0
        ? params.area.trim()
        : base.area,
    periodo:
      typeof params?.periodo === 'string' && params.periodo.trim().length > 0
        ? params.periodo.trim()
        : base.periodo,
    diagnostico:
      typeof params?.diagnostico === 'string' && params.diagnostico.trim().length > 0
        ? params.diagnostico
        : base.diagnostico,
    contexto:
      typeof params?.contexto === 'string' && params.contexto.trim().length > 0
        ? params.contexto
        : base.contexto,
    institucion:
      typeof params?.institucion === 'string' ? params.institucion : base.institucion,
    dre: typeof params?.dre === 'string' ? params.dre : base.dre,
    ugel: typeof params?.ugel === 'string' ? params.ugel : base.ugel,
    docente: typeof params?.docente === 'string' ? params.docente : base.docente,
    director: typeof params?.director === 'string' ? params.director : base.director,
  };
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return Boolean(valor && typeof valor === 'object' && !Array.isArray(valor));
}

function normalizarDocumentoParaRestauracion(
  rawDoc: Record<string, unknown>,
  params: ParametrosPlanificacionCNEB & { unidadNumero?: number; sesionNumero?: number }
): DocumentoCurricularCNEB | null {
  if (
    typeof rawDoc.tituloDocumento !== 'string' ||
    !Array.isArray(rawDoc.propositosAprendizaje) ||
    !Array.isArray(rawDoc.secuenciaDidactica)
  ) {
    return null;
  }

  const datosInfoRaw = esObjetoPlano(rawDoc.datosInformativos)
    ? rawDoc.datosInformativos
    : {};
  const situacionRaw = esObjetoPlano(rawDoc.situacionSignificativa)
    ? rawDoc.situacionSignificativa
    : {};
  const matRaw = esObjetoPlano(rawDoc.materialesYBibliografia)
    ? rawDoc.materialesYBibliografia
    : {};

  const docBase: DocumentoCurricularCNEB = {
    id:
      typeof rawDoc.id === 'string' && rawDoc.id.trim().length > 0
        ? rawDoc.id.trim()
        : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tipoDocumento:
      rawDoc.tipoDocumento === 'PCA' ||
      rawDoc.tipoDocumento === 'UNIDAD' ||
      rawDoc.tipoDocumento === 'SESION'
        ? rawDoc.tipoDocumento
        : params.tipoDocumento ?? 'PCA',
    codigoNormativo:
      typeof rawDoc.codigoNormativo === 'string'
        ? rawDoc.codigoNormativo
        : 'R.M. N.° 649-2016-MINEDU / R.M. N.° 587-2023-MINEDU',
    tituloDocumento: rawDoc.tituloDocumento,
    fechaGeneracion:
      typeof rawDoc.fechaGeneracion === 'string'
        ? rawDoc.fechaGeneracion
        : new Date().toLocaleDateString('es-PE'),
    unidadNumero: params.unidadNumero,
    sesionNumero: params.sesionNumero,
    datosInformativos: {
      dre:
        typeof datosInfoRaw.dre === 'string'
          ? datosInfoRaw.dre
          : params.dre || 'DRE Lima Metropolitana',
      ugel:
        typeof datosInfoRaw.ugel === 'string'
          ? datosInfoRaw.ugel
          : params.ugel || 'UGEL 05 San Juan de Lurigancho',
      institucionEducativa:
        typeof datosInfoRaw.institucionEducativa === 'string'
          ? datosInfoRaw.institucionEducativa
          : params.institucion || 'I.E. N.° 1145 República de Colombia',
      nivel: 'Primaria',
      ciclo:
        datosInfoRaw.ciclo === 'Ciclo III' ||
        datosInfoRaw.ciclo === 'Ciclo IV' ||
        datosInfoRaw.ciclo === 'Ciclo V'
          ? datosInfoRaw.ciclo
          : 'Ciclo V',
      gradoYSeccion:
        typeof datosInfoRaw.gradoYSeccion === 'string'
          ? datosInfoRaw.gradoYSeccion
          : params.grado,
      areaCurricular:
        typeof datosInfoRaw.areaCurricular === 'string'
          ? datosInfoRaw.areaCurricular
          : params.area,
      periodoLectivo:
        typeof datosInfoRaw.periodoLectivo === 'string'
          ? datosInfoRaw.periodoLectivo
          : params.periodo,
      duracionEstimada:
        typeof datosInfoRaw.duracionEstimada === 'string'
          ? datosInfoRaw.duracionEstimada
          : '36 semanas lectivas (4 bimestres)',
      docenteResponsable:
        typeof datosInfoRaw.docenteResponsable === 'string'
          ? datosInfoRaw.docenteResponsable
          : params.docente || 'Docente de Aula',
      directorIE:
        typeof datosInfoRaw.directorIE === 'string'
          ? datosInfoRaw.directorIE
          : params.director || 'Dirección de la I.E.',
    },
    descripcionGeneralYCaracterizacion:
      typeof rawDoc.descripcionGeneralYCaracterizacion === 'string'
        ? rawDoc.descripcionGeneralYCaracterizacion
        : params.diagnostico,
    situacionSignificativa: {
      contextoReal:
        typeof situacionRaw.contextoReal === 'string'
          ? situacionRaw.contextoReal
          : params.contexto,
      retoPedagogico:
        typeof situacionRaw.retoPedagogico === 'string'
          ? situacionRaw.retoPedagogico
          : '¿Cómo podemos responder a este desafío desde nuestra aula?',
      productoIntegrador:
        typeof situacionRaw.productoIntegrador === 'string'
          ? situacionRaw.productoIntegrador
          : 'Producción integradora del estudiante',
    },
    propositosAprendizaje:
      rawDoc.propositosAprendizaje as DocumentoCurricularCNEB['propositosAprendizaje'],
    competenciasTransversales: Array.isArray(rawDoc.competenciasTransversales)
      ? (rawDoc.competenciasTransversales as DocumentoCurricularCNEB['competenciasTransversales'])
      : [],
    enfoquesTransversales: Array.isArray(rawDoc.enfoquesTransversales)
      ? (rawDoc.enfoquesTransversales as DocumentoCurricularCNEB['enfoquesTransversales'])
      : [],
    secuenciaDidactica:
      rawDoc.secuenciaDidactica as DocumentoCurricularCNEB['secuenciaDidactica'],
    orientacionesEvaluacion: Array.isArray(rawDoc.orientacionesEvaluacion)
      ? (rawDoc.orientacionesEvaluacion as DocumentoCurricularCNEB['orientacionesEvaluacion'])
      : [],
    materialesYBibliografia: {
      paraElDocente: Array.isArray(matRaw.paraElDocente)
        ? (matRaw.paraElDocente as string[])
        : ['Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU)'],
      paraElEstudiante: Array.isArray(matRaw.paraElEstudiante)
        ? (matRaw.paraElEstudiante as string[])
        : ['Cuaderno de trabajo Minedu'],
    },
  };

  return sanitizarDocumentoCurricular(docBase);
}

function sanitizarMensajeChat(
  rawMsg: unknown,
  parametrosBase: ParametrosPlanificacionCNEB,
  idxFallback: number
): MensajeChatCNEB | null {
  if (!esObjetoPlano(rawMsg)) return null;

  const rol = rawMsg.rol === 'user' || rawMsg.rol === 'assistant' ? rawMsg.rol : 'assistant';
  const id =
    typeof rawMsg.id === 'string' && rawMsg.id.trim().length > 0
      ? rawMsg.id.trim()
      : `msg-${Date.now()}-${idxFallback}`;
  const contenidoTexto =
    typeof rawMsg.contenidoTexto === 'string' ? rawMsg.contenidoTexto : '';
  const fecha =
    typeof rawMsg.fecha === 'string' && rawMsg.fecha.trim().length > 0
      ? rawMsg.fecha.trim()
      : 'Hoy';

  let documentoSanitizado: DocumentoCurricularCNEB | undefined;
  if (esObjetoPlano(rawMsg.documento)) {
    const rawDoc = rawMsg.documento;
    const tipoDoc =
      rawDoc.tipoDocumento === 'PCA' ||
      rawDoc.tipoDocumento === 'UNIDAD' ||
      rawDoc.tipoDocumento === 'SESION'
        ? rawDoc.tipoDocumento
        : parametrosBase.tipoDocumento;

    const unidadNum =
      typeof rawDoc.unidadNumero === 'number'
        ? rawDoc.unidadNumero
        : typeof rawMsg.unidadNumero === 'number'
        ? rawMsg.unidadNumero
        : undefined;
    const sesionNum =
      typeof rawDoc.sesionNumero === 'number'
        ? rawDoc.sesionNumero
        : typeof rawMsg.sesionNumero === 'number'
        ? rawMsg.sesionNumero
        : undefined;

    const docNormalizado = normalizarDocumentoParaRestauracion(rawDoc, {
      ...parametrosBase,
      tipoDocumento: tipoDoc,
      unidadNumero: unidadNum,
      sesionNumero: sesionNum,
    });

    if (docNormalizado) {
      documentoSanitizado = {
        ...docNormalizado,
        id:
          typeof rawDoc.id === 'string' && rawDoc.id.trim().length > 0
            ? rawDoc.id.trim()
            : docNormalizado.id,
        unidadNumero: unidadNum,
        sesionNumero: sesionNum,
      };
    }
  }

  return {
    id,
    rol,
    contenidoTexto,
    fecha,
    ...(documentoSanitizado ? { documento: documentoSanitizado } : {}),
    ...(typeof rawMsg.parentDocumentoId === 'string' && rawMsg.parentDocumentoId.trim().length > 0
      ? { parentDocumentoId: rawMsg.parentDocumentoId.trim() }
      : {}),
    ...(typeof rawMsg.etiquetaRama === 'string' && rawMsg.etiquetaRama.trim().length > 0
      ? { etiquetaRama: rawMsg.etiquetaRama.trim() }
      : {}),
    ...(typeof rawMsg.unidadNumero === 'number'
      ? { unidadNumero: rawMsg.unidadNumero }
      : documentoSanitizado?.unidadNumero !== undefined
      ? { unidadNumero: documentoSanitizado.unidadNumero }
      : {}),
    ...(typeof rawMsg.sesionNumero === 'number'
      ? { sesionNumero: rawMsg.sesionNumero }
      : documentoSanitizado?.sesionNumero !== undefined
      ? { sesionNumero: documentoSanitizado.sesionNumero }
      : {}),
  };
}

function sanitizarConversacionProyecto(
  rawConv: unknown,
  idxFallback: number
): ConversacionPlanificacion | null {
  if (!esObjetoPlano(rawConv)) return null;

  const parametrosBase = clonarParametros(
    esObjetoPlano(rawConv.parametrosBase)
      ? (rawConv.parametrosBase as Partial<ParametrosPlanificacionCNEB>)
      : undefined
  );

  if (!Array.isArray(rawConv.mensajes)) return null;

  const mensajesSanitizados = rawConv.mensajes
    .map((m, idx) => sanitizarMensajeChat(m, parametrosBase, idx))
    .filter((m): m is MensajeChatCNEB => m !== null);

  const mensajesConDocumento = mensajesSanitizados.filter(
    (m): m is MensajeChatCNEB & { documento: DocumentoCurricularCNEB } =>
      m.rol === 'assistant' && Boolean(m.documento)
  );

  if (mensajesConDocumento.length === 0) {
    return null;
  }

  const id =
    typeof rawConv.id === 'string' && rawConv.id.trim().length > 0
      ? rawConv.id.trim()
      : `proj-pca-${Date.now()}-${idxFallback}`;

  const gradoNum = parametrosBase.grado.match(/\d+/)?.[0] || '5';
  const tituloPorDefecto = `Proyecto PCA ${gradoNum}.º Primaria — ${parametrosBase.area}`;
  const tituloSidebar =
    typeof rawConv.tituloSidebar === 'string' && rawConv.tituloSidebar.trim().length > 0
      ? rawConv.tituloSidebar.trim()
      : tituloPorDefecto;

  const fechaActualizacion =
    typeof rawConv.fechaActualizacion === 'string' && rawConv.fechaActualizacion.trim().length > 0
      ? rawConv.fechaActualizacion.trim()
      : 'Hoy';

  let ultimoDocumento = mensajesConDocumento[mensajesConDocumento.length - 1].documento;
  const rawUltimoDoc = rawConv.ultimoDocumento;
  if (esObjetoPlano(rawUltimoDoc) && typeof rawUltimoDoc.id === 'string') {
    const ultimoId = rawUltimoDoc.id;
    const coincidencia = mensajesConDocumento.find(
      (m) => m.documento.id === ultimoId
    );
    if (coincidencia) {
      ultimoDocumento = coincidencia.documento;
    }
  }

  return {
    id,
    tituloSidebar,
    fechaActualizacion,
    parametrosBase,
    mensajes: mensajesSanitizados,
    ultimoDocumento,
  };
}

/**
 * Crea un estado inicial limpio para un navegador nuevo.
 */
export function crearEstadoEspacioTrabajoLimpio(
  workspaceId: string
): EstadoEspacioTrabajoCNEB {
  return {
    version: 1,
    workspaceId,
    ultimaActualizacionISO: new Date().toISOString(),
    conversacionActivaId: null,
    documentoEnfocadoId: null,
    proyectosExpandidos: {},
    parametrosFormulario: clonarParametros(PARAMETROS_INICIALES_POR_DEFECTO),
    historial: [],
  };
}

/**
 * Carga el espacio de trabajo correspondiente a este navegador desde `localStorage`.
 * Si el navegador aún no tiene un espacio de trabajo guardado, inicializa y persiste
 * uno propio y vacío para evitar que distintos usuarios compartan un mismo proyecto por defecto.
 */
export function cargarEspacioTrabajo(
  storageExplicito?: Storage
): EstadoEspacioTrabajoCNEB {
  const storage = obtenerStorageSeguro(storageExplicito);
  const workspaceId = obtenerOCrearWorkspaceId(storageExplicito);
  const estadoLimpio = crearEstadoEspacioTrabajoLimpio(workspaceId);

  if (!storage) {
    return estadoLimpio;
  }

  const clave = construirClaveStorageWorkspace(workspaceId);

  try {
    const raw = storage.getItem(clave);
    if (!raw) {
      storage.setItem(clave, JSON.stringify(estadoLimpio));
      return estadoLimpio;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!esObjetoPlano(parsed)) {
      storage.setItem(clave, JSON.stringify(estadoLimpio));
      return estadoLimpio;
    }

    const historialRaw = Array.isArray(parsed.historial) ? parsed.historial : [];
    const historial = historialRaw
      .map((item, idx) => sanitizarConversacionProyecto(item, idx))
      .filter((item): item is ConversacionPlanificacion => item !== null);

    let conversacionActivaId: string | null =
      typeof parsed.conversacionActivaId === 'string' ? parsed.conversacionActivaId : null;

    if (
      conversacionActivaId &&
      !historial.some((c) => c.id === conversacionActivaId)
    ) {
      conversacionActivaId = historial.length > 0 ? historial[0].id : null;
    }

    const convActiva = historial.find((c) => c.id === conversacionActivaId) || null;

    let documentoEnfocadoId: string | null =
      typeof parsed.documentoEnfocadoId === 'string' ? parsed.documentoEnfocadoId : null;

    if (convActiva) {
      const existeDoc = convActiva.mensajes.some(
        (m) => m.documento?.id === documentoEnfocadoId
      );
      if (!existeDoc) {
        documentoEnfocadoId = convActiva.ultimoDocumento?.id || null;
      }
    } else {
      documentoEnfocadoId = null;
    }

    const proyectosExpandidos: Record<string, boolean> = {};
    if (esObjetoPlano(parsed.proyectosExpandidos)) {
      for (const [k, v] of Object.entries(parsed.proyectosExpandidos)) {
        if (typeof v === 'boolean') {
          proyectosExpandidos[k] = v;
        }
      }
    }
    if (conversacionActivaId && proyectosExpandidos[conversacionActivaId] === undefined) {
      proyectosExpandidos[conversacionActivaId] = true;
    }

    const parametrosFormulario = convActiva
      ? clonarParametros(convActiva.parametrosBase)
      : clonarParametros(
          esObjetoPlano(parsed.parametrosFormulario)
            ? (parsed.parametrosFormulario as Partial<ParametrosPlanificacionCNEB>)
            : undefined
        );

    const estadoRestaurado: EstadoEspacioTrabajoCNEB = {
      version: 1,
      workspaceId,
      ultimaActualizacionISO:
        typeof parsed.ultimaActualizacionISO === 'string'
          ? parsed.ultimaActualizacionISO
          : new Date().toISOString(),
      conversacionActivaId,
      documentoEnfocadoId,
      proyectosExpandidos,
      parametrosFormulario,
      historial,
    };

    return estadoRestaurado;
  } catch {
    return estadoLimpio;
  }
}

/**
 * Guarda automáticamente el estado completo del espacio de trabajo del navegador.
 */
export function guardarEspacioTrabajo(
  datos: {
    workspaceId: string;
    conversacionActivaId: string | null;
    documentoEnfocadoId: string | null;
    proyectosExpandidos: Record<string, boolean>;
    parametrosFormulario: ParametrosPlanificacionCNEB;
    historial: ConversacionPlanificacion[];
  },
  storageExplicito?: Storage
): EstadoEspacioTrabajoCNEB {
  const storage = obtenerStorageSeguro(storageExplicito);
  const estado: EstadoEspacioTrabajoCNEB = {
    version: 1,
    workspaceId: datos.workspaceId,
    ultimaActualizacionISO: new Date().toISOString(),
    conversacionActivaId: datos.conversacionActivaId,
    documentoEnfocadoId: datos.documentoEnfocadoId,
    proyectosExpandidos: datos.proyectosExpandidos,
    parametrosFormulario: clonarParametros(datos.parametrosFormulario),
    historial: datos.historial,
  };

  if (storage) {
    try {
      storage.setItem(WORKSPACE_ID_STORAGE_KEY, datos.workspaceId);
      storage.setItem(
        construirClaveStorageWorkspace(datos.workspaceId),
        JSON.stringify(estado)
      );
    } catch {
      // Ignorar errores de cuota de almacenamiento
    }
  }

  return estado;
}

/**
 * Crea un espacio de trabajo nuevo o limpia el espacio de trabajo actual del navegador,
 * eliminando sus proyectos locales y restableciendo los parámetros iniciales.
 */
export function limpiarEspacioTrabajoActual(
  storageExplicito?: Storage,
  generarNuevoId: boolean = true
): EstadoEspacioTrabajoCNEB {
  const storage = obtenerStorageSeguro(storageExplicito);
  const workspaceAnteriorId = obtenerOCrearWorkspaceId(storageExplicito);
  const nuevoWorkspaceId = generarNuevoId
    ? generarWorkspaceIdUnico()
    : workspaceAnteriorId;
  const estadoLimpio = crearEstadoEspacioTrabajoLimpio(nuevoWorkspaceId);

  if (storage) {
    try {
      storage.removeItem(construirClaveStorageWorkspace(workspaceAnteriorId));
      storage.setItem(WORKSPACE_ID_STORAGE_KEY, nuevoWorkspaceId);
      storage.setItem(
        construirClaveStorageWorkspace(nuevoWorkspaceId),
        JSON.stringify(estadoLimpio)
      );
    } catch {
      // Ignorar errores de almacenamiento
    }
  }

  return estadoLimpio;
}

/**
 * Genera un nombre de archivo `.json` descriptivo y seguro para exportar un proyecto PCA.
 */
export function generarNombreArchivoProyectoJSON(
  proyecto: ConversacionPlanificacion
): string {
  const baseTitulo = (proyecto.tituloSidebar || 'Proyecto_PCA_CNEB')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const fecha = new Date().toISOString().slice(0, 10);
  return `${baseTitulo || 'Proyecto_PCA_CNEB'}_${fecha}.json`;
}

/**
 * Serializa un proyecto curricular completo (PCA + Unidades + Sesiones + Ediciones + Parámetros)
 * en formato `.json` listo para exportar.
 */
export function exportarProyectoComoJson(
  proyecto: ConversacionPlanificacion,
  workspaceId: string
): {
  contenidoJson: string;
  nombreArchivo: string;
  payload: ArchivoExportacionProyectoCNEB;
} {
  const payload: ArchivoExportacionProyectoCNEB = {
    formato: FORMATO_EXPORTACION_PROYECTO,
    version: 1,
    fechaExportacionISO: new Date().toISOString(),
    workspaceOrigenId: workspaceId,
    proyecto: JSON.parse(JSON.stringify(proyecto)) as ConversacionPlanificacion,
  };

  return {
    contenidoJson: JSON.stringify(payload, null, 2),
    nombreArchivo: generarNombreArchivoProyectoJSON(proyecto),
    payload,
  };
}

/**
 * Descarga en el navegador el archivo `.json` del proyecto activo.
 */
export function descargarProyectoComoArchivoJSON(
  proyecto: ConversacionPlanificacion,
  workspaceId: string
): { nombreArchivo: string } {
  const { contenidoJson, nombreArchivo } = exportarProyectoComoJson(
    proyecto,
    workspaceId
  );

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([contenidoJson], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return { nombreArchivo };
}

/**
 * Valida e importa un proyecto curricular desde el contenido de un archivo `.json`.
 * Soporta tanto el sobre `ArchivoExportacionProyectoCNEB` como un objeto directo
 * `ConversacionPlanificacion` o un `DocumentoCurricularCNEB` individual.
 */
export function importarProyectoDesdeJson(
  contenidoJsonRaw: string,
  historialExistente: ConversacionPlanificacion[] = []
): ResultadoImportacionProyectoCNEB {
  if (!contenidoJsonRaw || typeof contenidoJsonRaw !== 'string') {
    return {
      valido: false,
      error: 'El archivo seleccionado está vacío o no contiene texto JSON válido.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contenidoJsonRaw.trim());
  } catch {
    return {
      valido: false,
      error: 'El archivo no tiene un formato JSON válido. Verifica que sea un archivo .json exportado desde el Planificador CNEB.',
    };
  }

  if (!esObjetoPlano(parsed)) {
    return {
      valido: false,
      error: 'El contenido JSON debe representar un objeto de proyecto curricular CNEB.',
    };
  }

  // Caso 1: Formato envuelto `ArchivoExportacionProyectoCNEB` ({ formato, proyecto })
  let candidatoProyecto: unknown = parsed;
  if (esObjetoPlano(parsed.proyecto)) {
    candidatoProyecto = parsed.proyecto;
  } else if (
    // Caso 2: Documento curricular individual exportado desde el editor JSON
    typeof parsed.tituloDocumento === 'string' &&
    Array.isArray(parsed.propositosAprendizaje) &&
    Array.isArray(parsed.secuenciaDidactica)
  ) {
    const datosInfo = esObjetoPlano(parsed.datosInformativos)
      ? parsed.datosInformativos
      : {};
    const gradoDoc =
      typeof datosInfo.gradoYSeccion === 'string' && datosInfo.gradoYSeccion.trim()
        ? datosInfo.gradoYSeccion.trim()
        : PARAMETROS_INICIALES_POR_DEFECTO.grado;
    const areaDoc =
      typeof datosInfo.areaCurricular === 'string' && datosInfo.areaCurricular.trim()
        ? datosInfo.areaCurricular.trim()
        : PARAMETROS_INICIALES_POR_DEFECTO.area;

    const paramsDoc: ParametrosPlanificacionCNEB = clonarParametros({
      tipoDocumento:
        parsed.tipoDocumento === 'PCA' ||
        parsed.tipoDocumento === 'UNIDAD' ||
        parsed.tipoDocumento === 'SESION'
          ? parsed.tipoDocumento
          : 'PCA',
      grado: gradoDoc,
      area: areaDoc,
      institucion:
        typeof datosInfo.institucionEducativa === 'string'
          ? datosInfo.institucionEducativa
          : undefined,
      dre: typeof datosInfo.dre === 'string' ? datosInfo.dre : undefined,
      ugel: typeof datosInfo.ugel === 'string' ? datosInfo.ugel : undefined,
      docente:
        typeof datosInfo.docenteResponsable === 'string'
          ? datosInfo.docenteResponsable
          : undefined,
      director:
        typeof datosInfo.directorIE === 'string' ? datosInfo.directorIE : undefined,
    });

    const docSanitizado = normalizarDocumentoParaRestauracion(parsed, paramsDoc);
    if (!docSanitizado) {
      return {
        valido: false,
        error:
          'El documento JSON no contiene los campos obligatorios de un DocumentoCurricularCNEB.',
      };
    }

    candidatoProyecto = {
      id: `proj-import-${Date.now()}`,
      tituloSidebar: `Proyecto PCA ${gradoDoc.match(/\d+/)?.[0] || '5'}.º Primaria — ${areaDoc}`,
      fechaActualizacion: 'Importado hoy',
      parametrosBase: paramsDoc,
      mensajes: [
        {
          id: `msg-import-u-${Date.now()}`,
          rol: 'user',
          contenidoTexto: `Proyecto importado desde archivo JSON (${docSanitizado.tituloDocumento}).`,
          fecha: 'Importado hoy',
        },
        {
          id: `msg-import-a-${Date.now() + 1}`,
          rol: 'assistant',
          contenidoTexto: 'Documento curricular restaurado desde archivo JSON.',
          fecha: 'Importado hoy',
          documento: docSanitizado,
          etiquetaRama:
            docSanitizado.tipoDocumento === 'PCA'
              ? 'PCA Anual (Matriz Maestra)'
              : docSanitizado.tipoDocumento === 'UNIDAD'
              ? `Unidad Didáctica ${docSanitizado.unidadNumero || 1}`
              : `Sesión ${docSanitizado.sesionNumero || 1}`,
          unidadNumero: docSanitizado.unidadNumero,
          sesionNumero: docSanitizado.sesionNumero,
        },
      ],
      ultimoDocumento: docSanitizado,
    };
  }

  const proyectoValidado = sanitizarConversacionProyecto(candidatoProyecto, 0);
  if (!proyectoValidado) {
    return {
      valido: false,
      error:
        'El archivo JSON no contiene una estructura válida de Proyecto PCA, Unidades o Sesiones CNEB.',
    };
  }

  const reemplazoExistente = historialExistente.some(
    (c) => c.id === proyectoValidado.id
  );

  return {
    valido: true,
    proyecto: proyectoValidado,
    reemplazoExistente,
  };
}
