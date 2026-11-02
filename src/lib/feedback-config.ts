/**
 * @file src/lib/feedback-config.ts
 * @description Configuración centralizada del estado Beta y del enlace de retroalimentación
 * hacia Google Forms para el Planificador Curricular CNEB.
 *
 * No requiere claves de API ni nuevas variables de entorno: el botón «Enviar retroalimentación»
 * abre directamente `GOOGLE_FORMS_FEEDBACK_URL` en una nueva pestaña.
 */

export type TipoReporteFeedback =
  | 'Error en el documento generado'
  | 'Problema técnico'
  | 'Mejora pedagógica o curricular'
  | 'Sugerencia de funcionalidad';

export type DocumentoRelacionadoFeedback =
  | 'Planificación anual (PCA)'
  | 'Unidad didáctica'
  | 'Sesión de aprendizaje'
  | 'Otro apartado';

export interface DatosRetroalimentacionBeta {
  tipoReporte: TipoReporteFeedback;
  documentoRelacionado: DocumentoRelacionadoFeedback;
  valoracion: 1 | 2 | 3 | 4 | 5;
  descripcion: string;
  correoContacto?: string;
}

export const TIPOS_REPORTE_FEEDBACK: TipoReporteFeedback[] = [
  'Error en el documento generado',
  'Problema técnico',
  'Mejora pedagógica o curricular',
  'Sugerencia de funcionalidad',
];

export const DOCUMENTOS_RELACIONADOS_FEEDBACK: DocumentoRelacionadoFeedback[] = [
  'Planificación anual (PCA)',
  'Unidad didáctica',
  'Sesión de aprendizaje',
  'Otro apartado',
];

/**
 * Constante de configuración con el enlace oficial del formulario de retroalimentación
 * de Google Forms para el Planificador Curricular CNEB.
 * Si en el futuro cambia el formulario, basta con actualizar esta constante.
 */
export const GOOGLE_FORMS_FEEDBACK_URL = 'https://forms.gle/YyvNDmc56f2wrWhh6';

/**
 * Alias de compatibilidad para utilidades internas de configuración del formulario.
 */
export const GOOGLE_FORMS_FEEDBACK_URL_FALLBACK = GOOGLE_FORMS_FEEDBACK_URL;

/**
 * Clave de localStorage para recordar si el docente ya descartó el aviso informativo Beta
 */
export const STORAGE_KEY_AVISO_BETA_DESCARTADO = 'cneb_primaria_beta_notice_dismissed_v1';

/**
 * Clave de localStorage para persistir el conteo de documentos generados y el estado
 * de la solicitud obligatoria de retroalimentación tras generar 3 documentos.
 */
export const STORAGE_KEY_RETROALIMENTACION_OBLIGATORIA =
  'cneb_primaria_mandatory_feedback_state_v1';

/**
 * Número de documentos curriculares nuevos generados correctamente tras los cuales
 * se solicita obligatoriamente la retroalimentación del docente.
 */
export const UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA = 3;

/**
 * Título oficial del modal obligatorio de retroalimentación al alcanzar 3 documentos.
 */
export const TITULO_MODAL_RETROALIMENTACION_OBLIGATORIA =
  '¡Ayúdanos a mejorar el planificador!';

export type TipoDocumentoCurricularContable = 'PCA' | 'UNIDAD' | 'SESION';

export interface EstadoRetroalimentacionObligatoria {
  version: 1;
  /** Cantidad acumulada de documentos nuevos generados correctamente (PCA, UNIDAD o SESION) */
  documentosGeneradosCount: number;
  /** IDs de documentos ya contabilizados para evitar contar regeneraciones in-place o ediciones */
  documentosContabilizadosIds: string[];
  /** Indica si la solicitud obligatoria está pendiente de confirmación por haber alcanzado 3 documentos */
  solicitudPendiente: boolean;
  /** Indica si el docente ha abierto el enlace de Google Forms en una nueva pestaña */
  formularioAbierto: boolean;
  /** Indica si el docente confirmó haber enviado su retroalimentación */
  retroalimentacionCompletada: boolean;
  /** Marca temporal ISO de la confirmación del usuario */
  fechaConfirmacionISO: string | null;
}

/**
 * Texto orientativo oficial del aviso de versión Beta
 */
export const TEXTO_AVISO_VERSION_BETA =
  'Estamos en versión beta. Esta herramienta está en fase de prueba y mejora continua. Los documentos generados pueden requerir correcciones; revísalos y adáptalos antes de utilizarlos oficialmente.';

function leerEnvVite(clave: string): string {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    if (metaEnv && typeof metaEnv[clave] === 'string') {
      return metaEnv[clave]!.trim();
    }
  } catch {
    // Entorno Node / SSR seguro
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[clave] === 'string') {
    return process.env[clave]!.trim();
  }
  return '';
}

/**
 * Verifica si una cadena corresponde a una URL HTTP/HTTPS real de formulario y no a un placeholder.
 */
export function esUrlFormularioValida(urlCandidate: string | undefined | null): boolean {
  if (!urlCandidate || typeof urlCandidate !== 'string') return false;
  const limpia = urlCandidate.trim();
  if (!limpia || limpia === 'MY_GOOGLE_FORMS_URL' || limpia === 'PENDIENTE') return false;
  try {
    const parsed = new URL(limpia);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Obtiene la configuración efectiva del formulario de Google Forms para retroalimentación.
 * Permite pasar un `urlOverride` opcional para pruebas funcionales.
 */
export function obtenerConfiguracionGoogleForms(urlOverride?: string): {
  configurado: boolean;
  urlBase: string;
  entryIds: {
    tipo: string;
    documento: string;
    valoracion: string;
    descripcion: string;
    correo: string;
  };
} {
  const candidata =
    urlOverride !== undefined
      ? urlOverride.trim()
      : leerEnvVite('VITE_GOOGLE_FORMS_FEEDBACK_URL') || GOOGLE_FORMS_FEEDBACK_URL_FALLBACK.trim();

  const configurado = esUrlFormularioValida(candidata);

  return {
    configurado,
    urlBase: configurado ? candidata : '',
    entryIds: {
      tipo: leerEnvVite('VITE_GOOGLE_FORMS_ENTRY_TIPO'),
      documento: leerEnvVite('VITE_GOOGLE_FORMS_ENTRY_DOCUMENTO'),
      valoracion: leerEnvVite('VITE_GOOGLE_FORMS_ENTRY_VALORACION'),
      descripcion: leerEnvVite('VITE_GOOGLE_FORMS_ENTRY_DESCRIPCION'),
      correo: leerEnvVite('VITE_GOOGLE_FORMS_ENTRY_CORREO'),
    },
  };
}

/**
 * Construye la URL final hacia Google Forms. Si el administrador configuró los IDs de entrada
 * (`VITE_GOOGLE_FORMS_ENTRY_*`), añade los parámetros `usp=pp_url&entry.X=...` para pre-rellenar
 * automáticamente el formulario al abrirlo en una pestaña nueva.
 */
export function construirUrlGoogleFormsConDatos(
  datos: DatosRetroalimentacionBeta,
  urlOverride?: string
): string | null {
  const config = obtenerConfiguracionGoogleForms(urlOverride);
  if (!config.configurado || !config.urlBase) {
    return null;
  }

  try {
    const url = new URL(config.urlBase);
    const { entryIds } = config;
    const tieneAlgunEntry =
      Boolean(entryIds.tipo) ||
      Boolean(entryIds.documento) ||
      Boolean(entryIds.valoracion) ||
      Boolean(entryIds.descripcion) ||
      Boolean(entryIds.correo);

    if (tieneAlgunEntry) {
      url.searchParams.set('usp', 'pp_url');
      if (entryIds.tipo) url.searchParams.set(entryIds.tipo, datos.tipoReporte);
      if (entryIds.documento) {
        url.searchParams.set(entryIds.documento, datos.documentoRelacionado);
      }
      if (entryIds.valoracion) {
        url.searchParams.set(entryIds.valoracion, String(datos.valoracion));
      }
      if (entryIds.descripcion && datos.descripcion.trim()) {
        url.searchParams.set(entryIds.descripcion, datos.descripcion.trim());
      }
      if (entryIds.correo && datos.correoContacto?.trim()) {
        url.searchParams.set(entryIds.correo, datos.correoContacto.trim());
      }
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Construye un resumen estructurado en texto plano de la retroalimentación registrada,
 * útil para copiar al portapapeles y pegar rápidamente en Google Forms.
 */
export function formatearResumenRetroalimentacion(datos: DatosRetroalimentacionBeta): string {
  const lineas = [
    '=== RETROALIMENTACIÓN BETA — PLANIFICADOR CURRICULAR CNEB ===',
    `1. Tipo de reporte: ${datos.tipoReporte}`,
    `2. Documento relacionado: ${datos.documentoRelacionado}`,
    `3. Valoración de la experiencia (1-5): ${datos.valoracion} / 5`,
    `4. Descripción o sugerencia: ${datos.descripcion.trim() || '(Sin descripción)'}`,
    `5. Correo de contacto (opcional): ${datos.correoContacto?.trim() || 'No especificado'}`,
  ];
  return lineas.join('\n');
}

export function cargarEstadoAvisoBetaDescartado(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_AVISO_BETA_DESCARTADO) === 'true';
  } catch {
    return false;
  }
}

export function guardarEstadoAvisoBetaDescartado(descartado: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (descartado) {
      window.localStorage.setItem(STORAGE_KEY_AVISO_BETA_DESCARTADO, 'true');
    } else {
      window.localStorage.removeItem(STORAGE_KEY_AVISO_BETA_DESCARTADO);
    }
  } catch {
    // Ignorar errores de cuota o modo privado
  }
}

function obtenerStorageFeedback(storageExplicito?: Storage): Storage | null {
  if (storageExplicito) return storageExplicito;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Crea el estado inicial limpio para el control de retroalimentación obligatoria.
 */
export function crearEstadoRetroalimentacionInicial(): EstadoRetroalimentacionObligatoria {
  return {
    version: 1,
    documentosGeneradosCount: 0,
    documentosContabilizadosIds: [],
    solicitudPendiente: false,
    formularioAbierto: false,
    retroalimentacionCompletada: false,
    fechaConfirmacionISO: null,
  };
}

/**
 * Verifica si un tipo de documento corresponde a los 3 tipos curriculares válidos:
 * - Planificación Curricular Anual ('PCA')
 * - Unidad didáctica ('UNIDAD')
 * - Sesión de aprendizaje ('SESION')
 */
export function esTipoDocumentoContable(
  tipo: unknown
): tipo is TipoDocumentoCurricularContable {
  return tipo === 'PCA' || tipo === 'UNIDAD' || tipo === 'SESION';
}

/**
 * Carga y normaliza el estado de retroalimentación obligatoria desde `localStorage`.
 */
export function cargarEstadoRetroalimentacionObligatoria(
  storageExplicito?: Storage
): EstadoRetroalimentacionObligatoria {
  const storage = obtenerStorageFeedback(storageExplicito);
  const inicial = crearEstadoRetroalimentacionInicial();
  if (!storage) return inicial;

  try {
    const raw = storage.getItem(STORAGE_KEY_RETROALIMENTACION_OBLIGATORIA);
    if (!raw) return inicial;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return inicial;
    }

    const obj = parsed as Record<string, unknown>;
    const ids = Array.isArray(obj.documentosContabilizadosIds)
      ? obj.documentosContabilizadosIds.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
      : [];

    const countRaw =
      typeof obj.documentosGeneradosCount === 'number' &&
      Number.isFinite(obj.documentosGeneradosCount) &&
      obj.documentosGeneradosCount >= 0
        ? Math.floor(obj.documentosGeneradosCount)
        : ids.length;

    const documentosGeneradosCount = Math.max(countRaw, ids.length);
    const retroalimentacionCompletada = obj.retroalimentacionCompletada === true;
    const formularioAbierto = obj.formularioAbierto === true;
    const fechaConfirmacionISO =
      typeof obj.fechaConfirmacionISO === 'string' && obj.fechaConfirmacionISO.trim().length > 0
        ? obj.fechaConfirmacionISO.trim()
        : null;

    const solicitudPendiente =
      !retroalimentacionCompletada &&
      (obj.solicitudPendiente === true ||
        documentosGeneradosCount >= UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA);

    return {
      version: 1,
      documentosGeneradosCount,
      documentosContabilizadosIds: ids,
      solicitudPendiente,
      formularioAbierto,
      retroalimentacionCompletada,
      fechaConfirmacionISO,
    };
  } catch {
    return inicial;
  }
}

/**
 * Persiste el estado de retroalimentación obligatoria en `localStorage`.
 */
export function guardarEstadoRetroalimentacionObligatoria(
  estado: EstadoRetroalimentacionObligatoria,
  storageExplicito?: Storage
): EstadoRetroalimentacionObligatoria {
  const storage = obtenerStorageFeedback(storageExplicito);
  const estadoNormalizado: EstadoRetroalimentacionObligatoria = {
    version: 1,
    documentosGeneradosCount: Math.max(
      0,
      Math.floor(estado.documentosGeneradosCount),
      estado.documentosContabilizadosIds.length
    ),
    documentosContabilizadosIds: [...new Set(estado.documentosContabilizadosIds)],
    solicitudPendiente:
      !estado.retroalimentacionCompletada &&
      (estado.solicitudPendiente ||
        estado.documentosGeneradosCount >= UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA),
    formularioAbierto: Boolean(estado.formularioAbierto),
    retroalimentacionCompletada: Boolean(estado.retroalimentacionCompletada),
    fechaConfirmacionISO: estado.fechaConfirmacionISO || null,
  };

  if (storage) {
    try {
      storage.setItem(
        STORAGE_KEY_RETROALIMENTACION_OBLIGATORIA,
        JSON.stringify(estadoNormalizado)
      );
    } catch {
      // Ignorar errores de cuota de localStorage
    }
  }

  return estadoNormalizado;
}

/**
 * Registra un documento curricular generado exitosamente.
 * Reglas estrictas:
 * - Solo cuenta si `esNuevoDocumento` es `true` (excluye regeneraciones in-place y ediciones).
 * - Solo cuenta si `tipoDocumento` es `'PCA'`, `'UNIDAD'` o `'SESION'`.
 * - No vuelve a contar un `id` de documento que ya haya sido registrado previamente.
 * - Al llegar a 3 documentos generados correctamente (si aún no se completó la retroalimentación),
 *   activa `solicitudPendiente = true`.
 */
export function registrarDocumentoCurricularGenerado(
  params: {
    id: string;
    tipoDocumento: unknown;
    esNuevoDocumento: boolean;
  },
  storageExplicito?: Storage
): EstadoRetroalimentacionObligatoria {
  const actual = cargarEstadoRetroalimentacionObligatoria(storageExplicito);

  if (!params.esNuevoDocumento) {
    return actual;
  }

  if (!esTipoDocumentoContable(params.tipoDocumento)) {
    return actual;
  }

  const docId = typeof params.id === 'string' ? params.id.trim() : '';
  if (!docId || actual.documentosContabilizadosIds.includes(docId)) {
    return actual;
  }

  const nuevosIds = [...actual.documentosContabilizadosIds, docId];
  const nuevoConteo = Math.max(actual.documentosGeneradosCount + 1, nuevosIds.length);
  const activarSolicitud =
    !actual.retroalimentacionCompletada &&
    nuevoConteo >= UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA;

  return guardarEstadoRetroalimentacionObligatoria(
    {
      ...actual,
      documentosGeneradosCount: nuevoConteo,
      documentosContabilizadosIds: nuevosIds,
      solicitudPendiente: activarSolicitud,
    },
    storageExplicito
  );
}

/**
 * Registra que el docente pulsó el botón «Enviar retroalimentación» para abrir el Google Form.
 */
export function registrarAperturaFormularioRetroalimentacion(
  storageExplicito?: Storage
): EstadoRetroalimentacionObligatoria {
  const actual = cargarEstadoRetroalimentacionObligatoria(storageExplicito);
  return guardarEstadoRetroalimentacionObligatoria(
    {
      ...actual,
      formularioAbierto: true,
    },
    storageExplicito
  );
}

/**
 * Registra la confirmación honesta del docente («Ya envié mi retroalimentación»),
 * desbloqueando las acciones de generación y guardando el estado localmente.
 */
export function confirmarRetroalimentacionEnviada(
  storageExplicito?: Storage
): EstadoRetroalimentacionObligatoria {
  const actual = cargarEstadoRetroalimentacionObligatoria(storageExplicito);
  return guardarEstadoRetroalimentacionObligatoria(
    {
      ...actual,
      solicitudPendiente: false,
      retroalimentacionCompletada: true,
      fechaConfirmacionISO: new Date().toISOString(),
    },
    storageExplicito
  );
}

/**
 * Determina si las acciones principales de generación deben estar bloqueadas
 * porque la solicitud obligatoria de retroalimentación está pendiente de respuesta.
 */
export function estaGeneracionBloqueadaPorRetroalimentacion(
  estado: EstadoRetroalimentacionObligatoria
): boolean {
  if (estado.retroalimentacionCompletada) {
    return false;
  }
  return (
    estado.solicitudPendiente ||
    estado.documentosGeneradosCount >= UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA
  );
}

