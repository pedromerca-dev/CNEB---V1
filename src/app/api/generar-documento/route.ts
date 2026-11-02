/**
 * @file src/app/api/generar-documento/route.ts
 * @description API Route (Next.js 14+ App Router & Express Server Handler) restringida
 * exclusivamente a EDUCACIÓN PRIMARIA (1.° a 6.° Grado — Ciclos III, IV y V)
 * alineada al Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU).
 * Soporta:
 * - PCA como Matriz Maestra de 8 Unidades Didácticas con lista ordenada de Sesiones Sugeridas.
 * - Generación manual en cascada y generación de Proyecto Completo en 1 Clic (lote continuo).
 * - Regeneración inteligente contextualizada por rama (PCA, Unidad o Sesión).
 * - Manejo de errores 503 (UNAVAILABLE), retry con delay y fallback automático de modelos.
 */

import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import OpenAI from 'openai';
import {
  AREAS_CURRICULARES_CNEB,
  buildMasterPedagogicalPrompt,
  ENFOQUES_TRANSVERSALES_OFICIALES_CNEB,
  GRADOS_CNEB,
  sanitizarDocumentoCurricular,
  seleccionarCompetenciaParaSesion,
} from '../../../lib/prompts.ts';
import type {
  DocumentoCurricularCNEB,
  ParametrosPlanificacionCNEB,
  SesionSugeridaItem,
  TipoDocumentoCurricular,
} from '../../../lib/prompts.ts';

export interface ValidacionResultado {
  valido: boolean;
  errores: string[];
  datos?: ParametrosPlanificacionCNEB;
}

/**
 * Configuración del Sistema de Respaldo Inteligente Multi-Proveedor (5 Prioridades):
 * - Prioridad 1 (Google Gemini): Máximo 30 segundos (30000ms) con "gemini-3.8-flash"
 * - Prioridad 2 (Groq API): Máximo 15 segundos por modelo (15000ms) en "https://api.groq.com/openai/v1" con "openai/gpt-oss-120b" y "openai/gpt-oss-20b"
 * - Prioridad 3 (OpenRouter API): Máximo 20 segundos (20000ms) con "openrouter/free" y headers 'HTTP-Referer' y 'X-Title': 'CNEB Planificador'
 * - Prioridad 4 (OpenAI API - Último recurso de IA): ÚNICAMENTE modelo "gpt-5.4-mini" con máximo 25 segundos (25000ms), sin reintentos ante insufficient_quota / saldo insuficiente
 * - Prioridad 5 (Contingencia Local CNEB): Generación estructurada local alineada al CNEB si todos los proveedores externos fallan.
 */
export const MODELO_PRINCIPAL_GEMINI = 'gemini-3.8-flash';
export const MODELOS_GEMINI_NIVEL_1 = ['gemini-3.8-flash'] as const;

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const MODELO_GROQ_PRINCIPAL = 'openai/gpt-oss-120b';
export const MODELO_GROQ_SECUNDARIO = 'openai/gpt-oss-20b';
export const MODELO_GROQ_LLAMA = MODELO_GROQ_PRINCIPAL;
export const MODELO_GROQ_RESPALDO = MODELO_GROQ_SECUNDARIO;
export const MODELOS_GROQ_NIVEL_2 = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
] as const;

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const MODELO_OPENROUTER_PRINCIPAL = 'openrouter/free';
export const MODELOS_OPENROUTER_NIVEL_3 = [
  'openrouter/free',
] as const;

export const OPENAI_MODEL = 'gpt-5.4-mini';
export const MODELO_OPENAI_PRINCIPAL = 'gpt-5.4-mini';
export const MODELOS_OPENAI_NIVEL_4 = ['gpt-5.4-mini'] as const;

export const TIMEOUT_GEMINI_NIVEL_1_MS = 30_000;
export const TIMEOUT_GROQ_POR_MODELO_MS = 15_000;
export const TIMEOUT_PROVEEDOR_SECUNDARIO_MS = 15_000;
export const TIMEOUT_OPENROUTER_MS = 20_000;
export const TIMEOUT_OPENAI_MS = 25_000;
export const OPENAI_TIMEOUT_MS = 25_000;
export const TIMEOUT_GLOBAL_GENERACION_MS = 105_000;

/**
 * Estado en memoria para evitar llamadas innecesarias a OpenAI cuando la API reportó
 * previamente `insufficient_quota`, saldo insuficiente o límite de gasto alcanzado.
 */
let openaiSinCreditosDetectado = false;

export function resetEstadoCreditosOpenAI(sinCreditos: boolean = false): void {
  openaiSinCreditosDetectado = sinCreditos;
}

export function obtenerEstadoCreditosOpenAI(): boolean {
  return openaiSinCreditosDetectado;
}

export function esErrorSinCreditosOpenAI(error: unknown): boolean {
  if (!error) return false;
  const errObj = error as {
    status?: number | string;
    code?: number | string;
    type?: string;
    message?: string;
    error?: {
      code?: number | string;
      type?: string;
      message?: string;
    };
  } | null;

  const status = String(errObj?.status ?? '');
  const code = String(errObj?.code ?? errObj?.error?.code ?? '').toLowerCase();
  const type = String(errObj?.type ?? errObj?.error?.type ?? '').toLowerCase();
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof errObj?.message === 'string'
      ? errObj.message
      : typeof errObj?.error?.message === 'string'
      ? errObj.error.message
      : String(error);
  const texto = `${status} ${code} ${type} ${rawMessage}`.toLowerCase();

  return (
    status === '402' ||
    code === 'insufficient_quota' ||
    code === 'billing_hard_limit_reached' ||
    type === 'insufficient_quota' ||
    texto.includes('insufficient_quota') ||
    texto.includes('insufficient credits') ||
    texto.includes('saldo insuficiente') ||
    texto.includes('límite de gasto') ||
    texto.includes('limite de gasto') ||
    texto.includes('billing_hard_limit_reached') ||
    texto.includes('spending limit') ||
    texto.includes('exceeded your current quota') ||
    texto.includes('check your plan and billing details')
  );
}

export const MENSAJE_ALTA_DEMANDA_IA_503 =
  'Todos los proveedores de IA se encuentran saturados. Por favor, reintenta en unos segundos.';

export interface DiagnosticoClavesProveedores {
  GEMINI: string;
  GROQ: string;
  OPENROUTER: string;
  OPENAI?: string;
}

export class ErrorAltaDemandaIA extends Error {
  status: number;
  debugError: string;
  diagnosticoClaves?: DiagnosticoClavesProveedores;
  constructor(
    message: string = MENSAJE_ALTA_DEMANDA_IA_503,
    debugError: string = '',
    diagnosticoClaves?: DiagnosticoClavesProveedores
  ) {
    super(message);
    this.name = 'ErrorAltaDemandaIA';
    this.status = 503;
    this.debugError = debugError;
    this.diagnosticoClaves = diagnosticoClaves;
  }
}

/**
 * Extrae el motivo exacto de fallo de un proveedor (error.status, error.message y causa clasificada)
 * y lo registra como advertencia controlada en la consola del servidor para continuar el flujo de respaldo.
 */
export function registrarErrorProveedorConsola(
  proveedor: 'GEMINI' | 'GROQ' | 'OPENROUTER' | 'OPENAI',
  modelo: string,
  error: unknown
): { status: number | string; message: string; causa: string; resumen: string } {
  const errObj = error as {
    status?: number | string;
    statusCode?: number | string;
    code?: number | string;
    message?: string;
    error?: { message?: string; code?: number | string; status?: string };
  } | null;

  const status =
    errObj?.status ??
    errObj?.statusCode ??
    errObj?.code ??
    errObj?.error?.code ??
    errObj?.error?.status ??
    'SIN_STATUS';

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof errObj?.message === 'string'
      ? errObj.message
      : typeof errObj?.error?.message === 'string'
      ? errObj.error.message
      : String(error);

  const message = rawMessage.replace(/\s+/g, ' ').trim();
  const upper = `${status} ${message}`.toUpperCase();

  let causa = 'error de proveedor';
  if (
    upper.includes('API_KEY_INVALID') ||
    upper.includes('INVALID API KEY') ||
    upper.includes('INVALID_API_KEY') ||
    upper.includes('INCORRECT API KEY') ||
    upper.includes('UNAUTHORIZED') ||
    String(status) === '401' ||
    (String(status) === '400' && upper.includes('KEY'))
  ) {
    causa = 'invalid API key (clave inválida o revocada)';
  } else if (String(status) === '403' || upper.includes('FORBIDDEN') || upper.includes('PERMISSION_DENIED')) {
    causa = 'permission denied / clave sin permisos (403)';
  } else if (
    String(status) === '402' ||
    esErrorSinCreditosOpenAI(error) ||
    upper.includes('INSUFFICIENT_QUOTA') ||
    upper.includes('INSUFFICIENT') ||
    upper.includes('CREDITS') ||
    upper.includes('SALDO INSUFICIENTE') ||
    upper.includes('LIMITE DE GASTO') ||
    upper.includes('LÍMITE DE GASTO') ||
    upper.includes('SPENDING LIMIT') ||
    upper.includes('BILLING_HARD_LIMIT_REACHED')
  ) {
    causa = 'insufficient_quota / saldo insuficiente o límite de gasto';
  } else if (
    String(status) === '429' ||
    upper.includes('QUOTA') ||
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('RATE LIMIT') ||
    upper.includes('RATE_LIMIT')
  ) {
    causa = 'quota exceeded / rate limit alcanzado (429)';
  } else if (String(status) === '404' || upper.includes('NOT FOUND') || upper.includes('NO ENDPOINTS') || upper.includes('DOES NOT EXIST')) {
    causa = 'model not found / endpoint no disponible (404)';
  } else if (
    String(status) === '503' ||
    upper.includes('UNAVAILABLE') ||
    upper.includes('OVERLOADED')
  ) {
    causa = 'service unavailable / servidor saturado (503)';
  }

  console.warn(
    `[CNEB Aviso] Conmutando desde ${proveedor} (modelo: "${modelo}") -> status=${status} | causa=${causa}`
  );

  const resumen = `[${modelo}] status=${status} (${causa}): ${message.slice(0, 180)}`;
  return { status, message, causa, resumen };
}

/**
 * Convierte cualquier error técnico del backend o SDK en un mensaje formateado y comprensible para el docente
 */
export function formatearMensajeErrorAmigable(error: unknown): string {
  if (!error) {
    return MENSAJE_ALTA_DEMANDA_IA_503;
  }
  if (error instanceof ErrorAltaDemandaIA) {
    return error.message;
  }
  const raw = error instanceof Error ? error.message : String(error);
  const upper = raw.toUpperCase();
  if (
    upper.includes('503') ||
    upper.includes('UNAVAILABLE') ||
    upper.includes('OVERLOADED') ||
    upper.includes('429') ||
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('RATE LIMIT') ||
    upper.includes('ABORT') ||
    upper.includes('TIMEOUT')
  ) {
    return MENSAJE_ALTA_DEMANDA_IA_503;
  }
  return MENSAJE_ALTA_DEMANDA_IA_503;
}

/**
 * Utilidad de pausa asíncrona con Exponential Backoff (2000ms -> 4000ms)
 */
export async function esperarDelay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Ejecuta una promesa envuelta con Promise.race y un AbortController individual
 * para aplicar un timeout estricto por proveedor (ej. 10 segundos en Gemini Nivel 1)
 * sin abortar los niveles de respaldo posteriores.
 */
export function ejecutarConTimeout<T>(
  promesa: Promise<T>,
  timeoutMs: number,
  etiquetaProveedor: string = 'Proveedor IA',
  abortController?: AbortController
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const promesaTimeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      if (abortController && !abortController.signal.aborted) {
        abortController.abort();
      }
      const errorTimeout = new Error(
        `Timeout de ${timeoutMs}ms excedido en ${etiquetaProveedor} (503/timeout)`
      ) as Error & { status?: number };
      errorTimeout.status = 503;
      reject(errorTimeout);
    }, timeoutMs);
  });

  return Promise.race([promesa, promesaTimeout]).finally(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });
}

/**
 * Detecta si un error devuelto por el SDK o la red corresponde a un estado 503 (UNAVAILABLE),
 * 429 (RESOURCE_EXHAUSTED), timeout de AbortController o sobrecarga temporal del modelo.
 */
export function esErrorServicioNoDisponible(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof ErrorAltaDemandaIA) return true;
  const textoError =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : JSON.stringify(error);
  const normalizado = textoError.toUpperCase();
  return (
    normalizado.includes('503') ||
    normalizado.includes('UNAVAILABLE') ||
    normalizado.includes('OVERLOADED') ||
    normalizado.includes('429') ||
    normalizado.includes('RESOURCE_EXHAUSTED') ||
    normalizado.includes('RATE LIMIT') ||
    normalizado.includes('TEMPORARILY UNAVAILABLE') ||
    normalizado.includes('ABORT') ||
    normalizado.includes('TIMEOUT') ||
    normalizado.includes('FETCH FAILED')
  );
}

/**
 * Valida rigurosamente que el payload pertenezca a Educación Primaria (1.° a 6.° grado)
 */
export function validarPayloadCurricular(body: unknown): ValidacionResultado {
  const errores: string[] = [];

  if (!body || typeof body !== 'object') {
    return {
      valido: false,
      errores: ['El cuerpo de la solicitud debe ser un objeto JSON válido.'],
    };
  }

  const raw = body as Record<string, unknown>;

  const grado = typeof raw.grado === 'string' ? raw.grado.trim() : '';
  const area = typeof raw.area === 'string' ? raw.area.trim() : '';
  const periodo = typeof raw.periodo === 'string' ? raw.periodo.trim() : '';
  const diagnostico = typeof raw.diagnostico === 'string' ? raw.diagnostico.trim() : '';
  const contexto = typeof raw.contexto === 'string' ? raw.contexto.trim() : '';

  const gradosPrimariaPermitidos = GRADOS_CNEB.map((g) => g.valor);
  if (!grado || !gradosPrimariaPermitidos.includes(grado)) {
    errores.push(
      `El campo "grado" debe pertenecer exclusivamente a Educación Primaria (${gradosPrimariaPermitidos.join(
        ', '
      )}).`
    );
  }

  if (!area || area.length < 3) {
    errores.push('El campo "area" curricular de Educación Primaria es obligatorio.');
  }
  if (!periodo || periodo.length < 3) {
    errores.push('El campo "periodo" lectivo es obligatorio (ej. "Año Lectivo 2026 - I Bimestre").');
  }
  if (!diagnostico || diagnostico.length < 20) {
    errores.push(
      'El campo "diagnostico" debe describir las necesidades de aprendizaje del aula de primaria con al menos 20 caracteres.'
    );
  }
  if (!contexto || contexto.length < 20) {
    errores.push(
      'El campo "contexto" sociocultural debe describirse con al menos 20 caracteres.'
    );
  }

  const tiposPermitidos: TipoDocumentoCurricular[] = ['PCA', 'UNIDAD', 'SESION'];
  const tipoDocumento: TipoDocumentoCurricular =
    typeof raw.tipoDocumento === 'string' &&
    tiposPermitidos.includes(raw.tipoDocumento as TipoDocumentoCurricular)
      ? (raw.tipoDocumento as TipoDocumentoCurricular)
      : 'PCA';

  if (errores.length > 0) {
    return { valido: false, errores };
  }

  let sesionesSugeridasContexto: SesionSugeridasList | undefined;
  type SesionSugeridasList = SesionSugeridaItem[];
  if (Array.isArray(raw.sesionesSugeridasContexto)) {
    sesionesSugeridasContexto = raw.sesionesSugeridasContexto
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, idx) => ({
        numero: typeof item.numero === 'string' ? item.numero : `Sesión ${idx + 1}`,
        titulo: typeof item.titulo === 'string' ? item.titulo : `Sesión de Aprendizaje ${idx + 1}`,
        proposito:
          typeof item.proposito === 'string'
            ? item.proposito
            : 'Desarrollar competencias del área mediante procesos didácticos activos.',
        duracion: typeof item.duracion === 'string' ? item.duracion : '90 minutos',
      }));
  }

  return {
    valido: true,
    errores: [],
    datos: {
      tipoDocumento,
      nivel: 'Primaria',
      grado,
      area,
      periodo,
      diagnostico,
      contexto,
      institucion:
        typeof raw.institucion === 'string' && raw.institucion.trim()
          ? raw.institucion.trim()
          : 'I.E. N.° 1145 República de Colombia',
      dre:
        typeof raw.dre === 'string' && raw.dre.trim()
          ? raw.dre.trim()
          : 'DRE Lima Metropolitana',
      ugel:
        typeof raw.ugel === 'string' && raw.ugel.trim()
          ? raw.ugel.trim()
          : 'UGEL 05',
      docente:
        typeof raw.docente === 'string' && raw.docente.trim()
          ? raw.docente.trim()
          : 'Docente de Aula de Educación Primaria',
      director:
        typeof raw.director === 'string' && raw.director.trim()
          ? raw.director.trim()
          : 'Dirección Pedagógica de Primaria',
      tituloPersonalizado:
        typeof raw.tituloPersonalizado === 'string' && raw.tituloPersonalizado.trim()
          ? raw.tituloPersonalizado.trim()
          : undefined,
      unidadNumero:
        typeof raw.unidadNumero === 'number' && Number.isFinite(raw.unidadNumero)
          ? raw.unidadNumero
          : undefined,
      sesionNumero:
        typeof raw.sesionNumero === 'number' && Number.isFinite(raw.sesionNumero)
          ? raw.sesionNumero
          : undefined,
      instruccionRegeneracion:
        typeof raw.instruccionRegeneracion === 'string' && raw.instruccionRegeneracion.trim()
          ? raw.instruccionRegeneracion.trim()
          : undefined,
      modoLoteRapido: Boolean(raw.modoLoteRapido),
      sesionesSugeridasContexto,
      contextoContinuidadRama:
        typeof raw.contextoContinuidadRama === 'string' && raw.contextoContinuidadRama.trim()
          ? raw.contextoContinuidadRama.trim()
          : undefined,
    },
  };
}

/**
 * Esquema JSON estricto (@google/genai Type) para Educación Primaria
 */
const CNEB_PRIMARIA_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    codigoNormativo: {
      type: Type.STRING,
      description:
        'Referencia normativa oficial de Educación Primaria Minedu (ej. R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU)',
    },
    tituloDocumento: {
      type: Type.STRING,
      description:
        'Título oficial y contextualizado de la PCA, Unidad Didáctica o Sesión de Aprendizaje de Educación Primaria',
    },
    datosInformativos: {
      type: Type.OBJECT,
      properties: {
        dre: { type: Type.STRING },
        ugel: { type: Type.STRING },
        institucionEducativa: { type: Type.STRING },
        nivel: { type: Type.STRING },
        ciclo: { type: Type.STRING },
        gradoYSeccion: { type: Type.STRING },
        areaCurricular: { type: Type.STRING },
        periodoLectivo: { type: Type.STRING },
        duracionEstimada: { type: Type.STRING },
        docenteResponsable: { type: Type.STRING },
        directorIE: { type: Type.STRING },
      },
      required: [
        'dre',
        'ugel',
        'institucionEducativa',
        'nivel',
        'ciclo',
        'gradoYSeccion',
        'areaCurricular',
        'periodoLectivo',
        'duracionEstimada',
        'docenteResponsable',
        'directorIE',
      ],
    },
    descripcionGeneralYCaracterizacion: {
      type: Type.STRING,
      description:
        'Párrafo técnico-pedagógico detallado sobre el enfoque del área en Educación Primaria, desarrollo evolutivo de los niños y niñas del ciclo (III, IV o V), caracterización según el diagnóstico y uso de materiales concretos Minedu.',
    },
    situacionSignificativa: {
      type: Type.OBJECT,
      properties: {
        contextoReal: {
          type: Type.STRING,
          description:
            'Descripción narrativa y situada de la realidad escolar y comunitaria cercana a los niños y niñas de primaria.',
        },
        retoPedagogico: {
          type: Type.STRING,
          description:
            'Preguntas retadoras abiertas formuladas en lenguaje motivador para niños y niñas de primaria.',
        },
        productoIntegrador: {
          type: Type.STRING,
          description:
            'Evidencia o producción tangible e integradora que elaborarán los estudiantes de primaria.',
        },
      },
      required: ['contextoReal', 'retoPedagogico', 'productoIntegrador'],
    },
    propositosAprendizaje: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          competencia: { type: Type.STRING },
          capacidades: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          estandarCiclo: { type: Type.STRING },
          desempenosPrecisados: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          criteriosEvaluacion: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          evidenciaAprendizaje: { type: Type.STRING },
          instrumentoEvaluacion: { type: Type.STRING },
        },
        required: [
          'competencia',
          'capacidades',
          'estandarCiclo',
          'desempenosPrecisados',
          'criteriosEvaluacion',
          'evidenciaAprendizaje',
          'instrumentoEvaluacion',
        ],
      },
    },
    competenciasTransversales: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          competencia: { type: Type.STRING },
          capacidad: { type: Type.STRING },
          desempenoContextualizado: { type: Type.STRING },
        },
        required: ['competencia', 'capacidad', 'desempenoContextualizado'],
      },
    },
    enfoquesTransversales: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          enfoque: { type: Type.STRING },
          valor: { type: Type.STRING },
          actitudesObservables: { type: Type.STRING },
        },
        required: ['enfoque', 'valor', 'actitudesObservables'],
      },
    },
    secuenciaDidactica: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          numero: { type: Type.STRING },
          titulo: { type: Type.STRING },
          duracion: { type: Type.STRING },
          faseOMomento: {
            type: Type.STRING,
            description:
              'Bimestre/Unidad en PCA (Unidad 1 a Unidad 8), Semana/Sesión en Unidad Didáctica, o Momento Pedagógico (INICIO / DESARROLLO / CIERRE) en Sesión de Primaria',
          },
          proposito: {
            type: Type.STRING,
            description:
              'Propósito pedagógico de la Unidad Didáctica (en PCA), de la Sesión (en Unidad) o del Momento (en Sesión)',
          },
          actividadesEstrategicas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          recursosEducativos: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          productoOEvidencia: { type: Type.STRING },
          sesionesSugeridas: {
            type: Type.ARRAY,
            description:
              'En la PCA (Matriz Maestra), lista ordenada de Sesiones Sugeridas para cada Unidad Didáctica con su número, título, propósito y duración.',
            items: {
              type: Type.OBJECT,
              properties: {
                numero: { type: Type.STRING },
                titulo: { type: Type.STRING },
                proposito: { type: Type.STRING },
                duracion: { type: Type.STRING },
              },
              required: ['numero', 'titulo', 'proposito', 'duracion'],
            },
          },
        },
        required: [
          'numero',
          'titulo',
          'duracion',
          'faseOMomento',
          'actividadesEstrategicas',
          'recursosEducativos',
          'productoOEvidencia',
        ],
      },
    },
    orientacionesEvaluacion: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tipoEvaluacion: {
            type: Type.STRING,
            description: 'Diagnóstica, Formativa o Sumativa',
          },
          orientacionPedagogica: { type: Type.STRING },
          tecnicasEInstrumentos: { type: Type.STRING },
        },
        required: ['tipoEvaluacion', 'orientacionPedagogica', 'tecnicasEInstrumentos'],
      },
    },
    materialesYBibliografia: {
      type: Type.OBJECT,
      properties: {
        paraElDocente: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        paraElEstudiante: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['paraElDocente', 'paraElEstudiante'],
    },
  },
  required: [
    'codigoNormativo',
    'tituloDocumento',
    'datosInformativos',
    'descripcionGeneralYCaracterizacion',
    'situacionSignificativa',
    'propositosAprendizaje',
    'competenciasTransversales',
    'enfoquesTransversales',
    'secuenciaDidactica',
    'orientacionesEvaluacion',
    'materialesYBibliografia',
  ],
};

const SYSTEM_INSTRUCTION_PRIMARIA =
  'Actúa como un Asistente Pedagógico experto en Educación Primaria del Ministerio de Educación del Perú (Minedu) y en el Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU) para los Ciclos III, IV y V. Responde siempre de forma directa, empática, clara y natural para el docente de aula, comenzando directamente con el contenido pedagógico solicitado sin introducciones robóticas ni frases como "te habla CNEB". Diseñas Planificaciones Curriculares Anuales (PCA como Matriz Maestra de 8 Unidades con Sesiones Sugeridas), Unidades Didácticas y Sesiones de Aprendizaje con procesos didácticos oficiales, materiales concretos Minedu y evaluación formativa (R.V.M. N.° 094-2020-MINEDU).';

/**
 * Construye el catálogo maestro de 8 Unidades Didácticas con su lista ordenada de Sesiones Sugeridas
 * contextualizadas al área, grado, diagnóstico y contexto del aula.
 */
function construirCatalogo8UnidadesPCA(
  gradoValor: string,
  areaNombre: string,
  procesosTexto: string,
  materialesTexto: string
) {
  const definicionesBase = [
    {
      num: 1,
      bimestre: 'I Bimestre — Unidad 1',
      duracion: '5 semanas',
      titulo: `Nos reencontramos y diagnosticamos nuestros saberes en ${areaNombre} acordando normas de convivencia`,
      proposito: `Diagnosticar el nivel de logro de las competencias de ${areaNombre} en ${gradoValor} y fortalecer la convivencia escolar.`,
      producto: `Portafolio diagnóstico y cartel de compromisos de aprendizaje en ${areaNombre}.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Dialogamos sobre nuestro retorno a clases y exploramos el reto de la unidad en ${areaNombre}`,
          proposito: `Comprender la situación significativa de la unidad, movilizar saberes previos y consensuar acuerdos de convivencia.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Resolvemos situaciones diagnósticas de ${areaNombre} empleando materiales concretos del aula`,
          proposito: `Aplicar estrategias iniciales de ${areaNombre} manipulando material concreto y organizando información relevante.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Elaboramos y revisamos nuestras primeras producciones de ${areaNombre} en equipos colaborativos`,
          proposito: `Construir y mejorar evidencias iniciales de ${areaNombre} aplicando criterios de evaluación formativa.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Socializamos nuestras metas de aprendizaje de ${areaNombre} y evaluamos nuestros acuerdos`,
          proposito: `Sustentar los avances logrados en la unidad y asumir compromisos de mejora continua para el año escolar.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 2,
      bimestre: 'I Bimestre — Unidad 2',
      duracion: '5 semanas',
      titulo: `Cuidamos nuestra salud y el ambiente escolar aplicando competencias de ${areaNombre}`,
      proposito: `Movilizar las capacidades de ${areaNombre} para analizar y proponer acciones de cuidado ambiental en la escuela.`,
      producto: `Propuesta estudiantil ilustrada de ${areaNombre} para el cuidado de los espacios escolares.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Analizamos situaciones reales sobre el cuidado del entorno escolar desde ${areaNombre}`,
          proposito: `Comprender la problemática ambiental del aula y escuela aplicando procesos didácticos de ${areaNombre}.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Organizamos información y aplicamos estrategias de ${areaNombre} con apoyo de fichas Minedu`,
          proposito: `Utilizar recursos estructurados del Minedu para contrastar datos y plantear alternativas de solución.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Diseñamos y revisamos nuestra propuesta de cuidado ambiental en ${areaNombre}`,
          proposito: `Elaborar en equipos el borrador y versión mejorada de la evidencia integradora con retroalimentación descriptiva.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Presentamos nuestras propuestas de cuidado ambiental y evaluamos nuestros avances`,
          proposito: `Comunicar y sustentar los productos elaborados en equipo aplicando criterios de evaluación formativa.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 3,
      bimestre: 'II Bimestre — Unidad 3',
      duracion: '5 semanas',
      titulo: `Valoramos los saberes y prácticas de nuestras familias desarrollando retos de ${areaNombre}`,
      proposito: `Integrar los saberes familiares y comunitarios en experiencias retadoras de ${areaNombre} con material concreto.`,
      producto: `Exposición y producción colaborativa de ${areaNombre} vinculada a los saberes familiares.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Recogemos saberes de nuestras familias vinculados a ${areaNombre}`,
          proposito: `Relacionar las experiencias cotidianas del hogar con las competencias de ${areaNombre}.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Desarrollamos los procesos didácticos de ${areaNombre} manipulando material concreto`,
          proposito: `Elaborar representaciones y estrategias de ${areaNombre} con acompañamiento diferenciado.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Producimos y revisamos nuestras evidencias de ${areaNombre} mediante la coevaluación`,
          proposito: `Verificar el cumplimiento de los criterios de evaluación y mejorar las producciones grupales.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Socializamos nuestras producciones sobre saberes familiares y reflexionamos sobre lo aprendido`,
          proposito: `Exponer los trabajos finales de la unidad y realizar la metacognición del proceso seguido.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 4,
      bimestre: 'II Bimestre — Unidad 4',
      duracion: '5 semanas',
      titulo: `Investigamos la diversidad cultural y natural de nuestra región desde el área de ${areaNombre}`,
      proposito: `Demostrar los avances del primer semestre en el Primer Día del Logro movilizando todas las competencias de ${areaNombre}.`,
      producto: `Feria y presentación de evidencias de ${areaNombre} por el Primer Día del Logro.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Indagamos en diversas fuentes sobre las riquezas de nuestra localidad y región`,
          proposito: `Seleccionar y procesar información relevante sobre la comunidad aplicando estrategias de ${areaNombre}.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Resolvemos retos sobre la diversidad regional con soporte concreto y gráfico en ${areaNombre}`,
          proposito: `Aplicar procedimientos y capacidades de ${areaNombre} vinculados a la realidad regional.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Elaboramos y afinamos nuestro producto integrador de ${areaNombre} para el Día del Logro`,
          proposito: `Construir colaborativamente la evidencia de la unidad atendiendo las necesidades del diagnóstico.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Compartimos nuestros aprendizajes de ${areaNombre} con las familias en el Primer Día del Logro`,
          proposito: `Sustentar con autonomía los procedimientos y aprendizajes logrados en el primer semestre.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 5,
      bimestre: 'III Bimestre — Unidad 5',
      duracion: '5 semanas',
      titulo: `Resolvemos situaciones retadoras sobre historia, patrimonio y emprendimiento local en ${areaNombre}`,
      proposito: `Fortalecer el pensamiento crítico y la resolución de problemas contextualizados en ${gradoValor}.`,
      producto: `Dossier práctico y galería de producciones de ${areaNombre} sobre la comunidad.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Comprendemos el reto de la unidad y planificamos nuestras actividades en ${areaNombre}`,
          proposito: `Establecer la ruta de trabajo colaborativo para abordar la situación significativa del bimestre.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Aplicamos estrategias de ${areaNombre} utilizando el Cuaderno de Fichas Minedu`,
          proposito: `Consolidar los desempeños precisados de ${gradoValor} con mediación docente diferenciada.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Elaboramos y revisamos nuestro dossier de producciones sobre el patrimonio local`,
          proposito: `Sistematizar y corregir las evidencias producidas en equipo aplicando instrumentos formativos.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Socializamos nuestra galería de producciones y evaluamos el impacto en el aula`,
          proposito: `Reflexionar metacognitivamente sobre las estrategias empleadas y los logros alcanzados.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 6,
      bimestre: 'III Bimestre — Unidad 6',
      duracion: '5 semanas',
      titulo: `Promovemos el uso responsable de los recursos y la biodiversidad mediante ${areaNombre}`,
      proposito: `Articular el enfoque ambiental y la indagación escolar con las competencias de ${areaNombre}.`,
      producto: `Maqueta, guía o proyecto aplicativo de ${areaNombre} para la conservación del entorno.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Analizamos casos sobre el uso responsable del agua, energía y áreas verdes`,
          proposito: `Identificar causas y consecuencias del manejo de recursos locales desde ${areaNombre}.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Exploramos estrategias y materiales concretos de ${areaNombre} para proponer soluciones`,
          proposito: `Aplicar secuencialmente los procesos didácticos del área con apoyo de material estructurado Minedu.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Construimos y revisamos nuestro proyecto aplicativo de ${areaNombre} en equipos`,
          proposito: `Integrar los aprendizajes de la unidad en un producto tangible revisado con criterios claros.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Difundimos nuestras recomendaciones y evaluamos nuestro desempeño con rúbrica`,
          proposito: `Presentar evidencias claras y evaluar el progreso grupal e individual.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 7,
      bimestre: 'IV Bimestre — Unidad 7',
      duracion: '5 semanas',
      titulo: `Ejercemos nuestra ciudadanía activa y derechos de la niñez a través de ${areaNombre}`,
      proposito: `Promover la deliberación, argumentación y toma de decisiones orientadas al bien común en ${gradoValor}.`,
      producto: `Asamblea y mural integrador de ${areaNombre} sobre ciudadanía y buen trato.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Reflexionamos sobre los derechos y deberes de los niños y niñas en nuestra escuela`,
          proposito: `Analizar situaciones de convivencia escolar movilizando capacidades de ${areaNombre}.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Indagamos y organizamos argumentos sólidos desde el área de ${areaNombre}`,
          proposito: `Sustentar ideas y soluciones utilizando fuentes confiables, material concreto y representaciones claras.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Elaboramos y revisamos nuestro mural integrador sobre ciudadanía y buen trato`,
          proposito: `Producir colaborativamente textos o representaciones de ${areaNombre} verificando su coherencia.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Participamos en un plenario escolar compartiendo nuestras producciones`,
          proposito: `Deliberar y llegar a consensos democráticos respetando la diversidad de opiniones.`,
          duracion: '90 minutos',
        },
      ],
    },
    {
      num: 8,
      bimestre: 'IV Bimestre — Unidad 8',
      duracion: '4 semanas',
      titulo: `Sistematizamos y demostramos nuestros logros anuales de ${areaNombre} en el Día del Logro`,
      proposito: `Evaluar integralmente el nivel de logro del estándar del ciclo en ${areaNombre} al cierre del año escolar.`,
      producto: `Portafolio final y exposición integral de logros de ${areaNombre} ante la comunidad educativa.`,
      sesiones: [
        {
          numero: 'Sesión 1',
          titulo: `Seleccionamos y organizamos las mejores evidencias de nuestro portafolio de ${areaNombre}`,
          proposito: `Revisar reflexivamente los trabajos realizados durante el año escolar identificando progresos.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: `Resolvemos retos integradores de ${areaNombre} demostrando el logro del estándar del ciclo`,
          proposito: `Consolidar las capacidades de ${areaNombre} mediante actividades integradoras con material concreto.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: `Preparamos y ensayamos nuestra presentación final de ${areaNombre} en equipos`,
          proposito: `Elaborar recursos visuales y materiales de soporte para explicar lo aprendido con claridad.`,
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo: `Exponemos nuestros logros en el Segundo Día del Logro y realizamos el balance anual`,
          proposito: `Comunicar con seguridad los aprendizajes alcanzados en ${gradoValor} y asumir metas futuras.`,
          duracion: '90 minutos',
        },
      ],
    },
  ];

  return definicionesBase.map((u) => ({
    numero: `Unidad ${u.num}`,
    titulo: u.titulo,
    duracion: u.duracion,
    faseOMomento: u.bimestre,
    proposito: u.proposito,
    actividadesEstrategicas: [
      `Aplicación secuencial de los procesos didácticos de ${areaNombre} (${procesosTexto}).`,
      ...u.sesiones.map((s) => `${s.numero}: ${s.titulo} (${s.duracion}) — Propósito: ${s.proposito}`),
    ],
    recursosEducativos: [
      materialesTexto,
      'Cuaderno de Fichas Minedu de Educación Primaria y Biblioteca de Aula',
    ],
    productoOEvidencia: u.producto,
    sesionesSugeridas: u.sesiones,
  }));
}

/**
 * Generador determinista de respaldo (Contingencia Pedagógica CNEB y Modo Lote Rápido)
 * garantizando que la PCA (8 Unidades con 4 Sesiones Sugeridas), Unidades y Sesiones
 * cumplan rigurosamente la estructura oficial del Minedu y nunca fallen por errores 503.
 */
function construirRespaldoContingenciaCNEB(
  params: ParametrosPlanificacionCNEB
): Omit<DocumentoCurricularCNEB, 'id' | 'fechaGeneracion' | 'tipoDocumento'> {
  const gradoInfo = GRADOS_CNEB.find((g) => g.valor === params.grado) ?? GRADOS_CNEB[4];
  const areaInfo =
    AREAS_CURRICULARES_CNEB.find((a) => a.area === params.area) ?? AREAS_CURRICULARES_CNEB[0];
  const tipo = params.tipoDocumento || 'PCA';
  const numUnidad = params.unidadNumero || 1;
  const numSesion = params.sesionNumero || 1;

  const notaRegeneracion = params.instruccionRegeneracion
    ? ` [Ajuste pedagógico aplicado: ${params.instruccionRegeneracion}]`
    : '';

  const competenciaFocalizadaSesion = seleccionarCompetenciaParaSesion(
    areaInfo,
    numSesion,
    `${params.tituloPersonalizado || ''} ${params.instruccionRegeneracion || ''}`
  );

  const tituloBase =
    params.tituloPersonalizado ||
    (tipo === 'PCA'
      ? `PLANIFICACIÓN CURRICULAR ANUAL DE ${areaInfo.area.toUpperCase()} — ${gradoInfo.valor.toUpperCase()} (${gradoInfo.ciclo.toUpperCase()})`
      : tipo === 'UNIDAD'
      ? `UNIDAD DIDÁCTICA N.° 0${numUnidad}: FORTALECEMOS NUESTRAS COMPETENCIAS EN ${areaInfo.area.toUpperCase()} DESDE NUESTRA COMUNIDAD (${gradoInfo.valor.toUpperCase()})`
      : `SESIÓN DE APRENDIZAJE N.° 0${numSesion} (UNIDAD ${numUnidad}): DESARROLLAMOS LA COMPETENCIA "${competenciaFocalizadaSesion.nombre.toUpperCase()}" CON MATERIAL CONCRETO`);

  const duracionEstimada =
    tipo === 'PCA'
      ? '39 semanas lectivas (I al IV Bimestre — 8 Unidades Didácticas)'
      : tipo === 'UNIDAD'
      ? '5 semanas (30 horas pedagógicas integradas)'
      : '90 minutos (Inicio: 15 min · Desarrollo: 60 min · Cierre: 15 min)';

  const procesosTexto = areaInfo.procesosDidacticosPrimaria.join(' | ');
  const materialesTexto = areaInfo.materialesMineduPrimaria.join(', ');

  const sesionesBaseUnidad4: SesionSugeridaItem[] = [
    {
      numero: 'Sesión 1',
      titulo: `Comprendemos el reto de la Unidad ${numUnidad} y planificamos nuestras actividades en ${areaInfo.area}`,
      proposito: `Dialogar sobre la situación significativa de la Unidad ${numUnidad}, activar saberes previos y consensuar la ruta de trabajo en ${areaInfo.area}.`,
      duracion: '90 minutos',
    },
    {
      numero: 'Sesión 2',
      titulo: `Indagamos y aplicamos estrategias de ${areaInfo.area} manipulando materiales concretos del Minedu`,
      proposito: `Desarrollar los procesos didácticos de ${areaInfo.area} en equipos colaborativos atendiendo las necesidades del diagnóstico del aula.`,
      duracion: '90 minutos',
    },
    {
      numero: 'Sesión 3',
      titulo: `Elaboramos y revisamos colaborativamente nuestras producciones de ${areaInfo.area}`,
      proposito: `Construir el borrador o representación del producto de la unidad y mejorarlo mediante la retroalimentación formativa y coevaluación.`,
      duracion: '90 minutos',
    },
    {
      numero: 'Sesión 4',
      titulo: `Socializamos nuestro producto integrador de la Unidad ${numUnidad} y evaluamos nuestros avances`,
      proposito: `Presentar y sustentar la evidencia final de la Unidad ${numUnidad} contrastándola con los criterios de evaluación del ${gradoInfo.ciclo}.`,
      duracion: '90 minutos',
    },
  ];

  const sesionesDeUnidadFallback: SesionSugeridaItem[] =
    params.sesionesSugeridasContexto && params.sesionesSugeridasContexto.length >= 4
      ? params.sesionesSugeridasContexto
      : params.sesionesSugeridasContexto && params.sesionesSugeridasContexto.length > 0
      ? [
          ...params.sesionesSugeridasContexto,
          ...sesionesBaseUnidad4.slice(params.sesionesSugeridasContexto.length),
        ]
      : sesionesBaseUnidad4;

  const secuenciaDidactica =
    tipo === 'SESION'
      ? [
          {
            numero: 'Momento 1',
            faseOMomento: 'INICIO (15 min)',
            titulo:
              'Motivación vivencial, recojo de saberes previos, propósito de la sesión y acuerdos de convivencia',
            duracion: '15 minutos',
            proposito:
              'Despertar el interés del grupo clase, conectar con la sesión anterior, comunicar el propósito literal y consensuar las normas del día.',
            actividadesEstrategicas: [
              `En grupo clase: La/el docente saluda afectuosamente a los niños y niñas de ${gradoInfo.valor} y dialoga brevemente sobre lo trabajado en la sesión anterior, vinculándolo con el reto de la Unidad ${numUnidad}.`,
              `Presenta una situación desencadenante cercana a la realidad de los estudiantes (${params.contexto.slice(
                0,
                140
              )}...) apoyándose en material concreto (${materialesTexto}).`,
              `Recoge los saberes previos y plantea el conflicto cognitivo mediante preguntas abiertas: "¿Qué observamos en esta situación?, ¿qué sabemos acerca de cómo resolverla?, ¿qué pasos y estrategias de ${areaInfo.area} nos ayudarán a superarla?".`,
              `Comunica literalmente el propósito de la sesión en un cartel visible para todos: "Hoy aprenderemos a movilizar la competencia '${competenciaFocalizadaSesion.nombre}' aplicando estrategias con material concreto para elaborar nuestra evidencia del día y reflexionar sobre nuestros avances", y socializa los criterios de evaluación en lenguaje amigable.`,
              `Acuerda por consenso con los estudiantes dos normas de convivencia específicas para esta sesión: (1) Escuchar con respeto las ideas de los compañeros durante el trabajo en equipo y (2) Cuidar y compartir ordenadamente los materiales concretos del aula.${notaRegeneracion}`,
            ],
            recursosEducativos: [
              'Cartel con el propósito de la sesión y los criterios de evaluación',
              'Cartel de acuerdos de convivencia del aula',
              'Lámina o situación casuística contextualizada',
            ],
            productoOEvidencia:
              'Participación oral activa, comprensión del propósito de la sesión y selección consensuada de 2 acuerdos de convivencia.',
          },
          {
            numero: 'Momento 2',
            faseOMomento: 'DESARROLLO (60 min)',
            titulo: `Gestión y acompañamiento aplicando los procesos didácticos de la competencia "${competenciaFocalizadaSesion.nombre}"`,
            duracion: '60 minutos',
            proposito: `Desarrollar paso a paso los procesos didácticos exclusivos de "${competenciaFocalizadaSesion.nombre}" con mediación docente y manipulación de material concreto Minedu.`,
            actividadesEstrategicas: [
              ...competenciaFocalizadaSesion.procesosDidacticosCompetencia.map(
                (proceso, pIdx) =>
                  `Proceso didáctico (${proceso}): ${
                    pIdx === 0
                      ? `En grupo clase y en equipos colaborativos, los estudiantes analizan la consigna de trabajo vinculada al diagnóstico del aula (${params.diagnostico.slice(
                          0,
                          110
                        )}...) y organizan sus materiales (${materialesTexto}).`
                      : pIdx === 1
                      ? `En equipos pequeños y en parejas, ponen en práctica sus estrategias manipulando ${materialesTexto} y utilizando el Cuaderno de Fichas Minedu de ${gradoInfo.valor}, mientras el/la docente acompaña a cada grupo formulando preguntas socráticas ("¿Por qué eligieron este procedimiento?, ¿de qué otra forma podríamos comprobarlo?").`
                      : `En grupo clase e individualmente, socializan y contrastan sus producciones, reciben retroalimentación por descubrimiento (R.V.M. N.° 094-2020-MINEDU) y sistematizan las ideas fuerza en su cuaderno o portafolio.`
                  }`
              ),
              `Atención diferenciada: El/la docente brinda andamiaje específico con soporte concreto a los niños y niñas que requieren mayor acompañamiento según el diagnóstico del aula.${notaRegeneracion}`,
            ],
            recursosEducativos: [
              `Cuaderno de Fichas de ${areaInfo.area} — ${gradoInfo.valor} (Dotación Minedu)`,
              materialesTexto,
              'Papelotes, plumones, tarjetas metaplan y fichas de trabajo diferenciadas',
            ],
            productoOEvidencia: `Evidencia tangible de los 90 minutos: producción y actuación observable de la competencia "${competenciaFocalizadaSesion.nombre}" revisada con criterios formativos.`,
          },
          {
            numero: 'Momento 3',
            faseOMomento: 'CIERRE (15 min)',
            titulo:
              'Contrastación del propósito, evaluación de acuerdos, metacognición y transferencia familiar',
            duracion: '15 minutos',
            proposito:
              'Verificar el logro del propósito y de los criterios de evaluación, evaluar el cumplimiento de las normas del día y reflexionar metacognitivamente.',
            actividadesEstrategicas: [
              'En grupo clase: Revisan conjuntamente el cartel del propósito de la sesión y los criterios de evaluación, contrastando qué lograron en sus evidencias y qué aspectos pueden seguir mejorando.',
              'Evalúan el cumplimiento de los dos acuerdos de convivencia seleccionados al inicio de la sesión ("¿Nos escuchamos con respeto?, ¿compartimos y cuidamos los materiales?").',
              'Dialogan a partir de preguntas de reflexión metacognitiva: "¿Qué aprendimos hoy?, ¿cómo lo aprendimos y qué materiales nos ayudaron más?, ¿qué dificultades tuvimos y cómo las superamos?, ¿para qué nos sirve lo aprendido en nuestra vida diaria?".',
              'Actividad de extensión / transferencia: Comentan en casa con sus familias lo aprendido hoy y lo aplican en una situación cotidiana sencilla.',
            ],
            recursosEducativos: [
              'Lista de cotejo / Escala de valoración de la sesión',
              'Ficha de autoevaluación y coevaluación estudiantil',
              'Portafolio de evidencias del estudiante',
            ],
            productoOEvidencia:
              'Autoevaluación del propósito y normas del día, y reflexión metacognitiva sobre su proceso de aprendizaje.',
          },
        ]
      : tipo === 'UNIDAD'
      ? sesionesDeUnidadFallback.map((ses, idx) => {
          const compDeEstaSesion = seleccionarCompetenciaParaSesion(
            areaInfo,
            idx + 1,
            `${ses.titulo} ${ses.proposito}`
          );
          const capPrincipal = compDeEstaSesion.capacidades[0] || 'sus capacidades';
          return {
            numero: ses.numero || `Sesión ${idx + 1}`,
            faseOMomento: `Semana ${idx + 1} — Unidad ${numUnidad}`,
            titulo: ses.titulo,
            duracion: ses.duracion || '90 minutos',
            proposito: ses.proposito,
            actividadesEstrategicas: [
              `Competencia y desempeño precisado que moviliza la sesión: "${compDeEstaSesion.nombre}" (${capPrincipal}) — ${ses.proposito}`,
              `Secuencia de actividades según los procesos didácticos de la competencia (${compDeEstaSesion.procesosDidacticosCompetencia.join(
                ' -> '
              )}) manipulando ${materialesTexto}.`,
              `Acompañamiento pedagógico y retroalimentación por descubrimiento atendiendo el diagnóstico del aula, evaluando la evidencia de la sesión con lista de cotejo.${notaRegeneracion}`,
            ],
            recursosEducativos: [
              `Cuaderno de Fichas de ${areaInfo.area} — ${gradoInfo.valor} (Minedu)`,
              materialesTexto,
            ],
            productoOEvidencia: `Evidencia de la ${ses.numero}: producción y actuación en "${compDeEstaSesion.nombre}" evaluada con criterios de la unidad.`,
          };
        })
      : construirCatalogo8UnidadesPCA(
          gradoInfo.valor,
          areaInfo.area,
          procesosTexto,
          materialesTexto
        );

  const competenciasParaPropósitos =
    tipo === 'SESION' ? [competenciaFocalizadaSesion] : areaInfo.competencias;

  const descripcionSegunTipo =
    tipo === 'SESION'
      ? `La presente Sesión de Aprendizaje N.° ${numSesion} (perteneciente a la Unidad Didáctica N.° ${numUnidad}) para ${gradoInfo.valor} (${gradoInfo.ciclo}, ${gradoInfo.edadesReferencia}) desarrolla de manera focalizada la competencia "${competenciaFocalizadaSesion.nombre}" bajo el "${areaInfo.enfoqueArea}" del Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU). Atiende directamente el diagnóstico del aula (${params.diagnostico}) y el contexto local (${params.contexto}). Preparación de la sesión (¿Qué necesitamos hacer antes de la sesión?): 1) Prever y colocar en un lugar visible el cartel con el propósito de la sesión y los criterios de evaluación en lenguaje claro para los estudiantes; 2) Alistar y organizar por equipos los materiales concretos del Minedu (${materialesTexto}) y las páginas correspondientes del Cuaderno de Fichas; 3) Revisar la lista de cotejo / escala de valoración y disponer el mobiliario para el trabajo en grupo clase y en equipos colaborativos.${notaRegeneracion}`
      : `La presente planificación de ${areaInfo.area} para ${gradoInfo.valor} (${gradoInfo.ciclo}, ${gradoInfo.edadesReferencia}) se desarrolla bajo el enfoque "${areaInfo.enfoqueArea}" del Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU). En esta etapa evolutiva (${gradoInfo.descripcionCiclo}), la propuesta atiende de manera pertinente el diagnóstico real del grupo: ${params.diagnostico} Asimismo, articula las vivencias del contexto sociocultural de los estudiantes (${params.contexto}) mediante los procesos didácticos del área (${procesosTexto}), priorizando la manipulación de material concreto Minedu (${materialesTexto}) y la evaluación formativa continua.${notaRegeneracion}`;

  return {
    codigoNormativo:
      'R.M. N.° 649-2016-MINEDU · R.V.M. N.° 094-2020-MINEDU · R.M. N.° 587-2023-MINEDU',
    tituloDocumento: tituloBase,
    unidadNumero: params.unidadNumero,
    sesionNumero: params.sesionNumero,
    datosInformativos: {
      dre: params.dre || 'DRE Lima Metropolitana',
      ugel: params.ugel || 'UGEL 05',
      institucionEducativa: params.institucion || 'I.E. N.° 1145 República de Colombia',
      nivel: 'Educación Primaria',
      ciclo: `${gradoInfo.ciclo} (${gradoInfo.edadesReferencia})`,
      gradoYSeccion: gradoInfo.valor,
      areaCurricular: areaInfo.area,
      periodoLectivo: params.periodo,
      duracionEstimada,
      docenteResponsable: params.docente || 'Docente de Aula de Educación Primaria',
      directorIE: params.director || 'Dirección Pedagógica de Primaria',
    },
    descripcionGeneralYCaracterizacion: descripcionSegunTipo,
    situacionSignificativa: {
      contextoReal: `En la ${
        params.institucion || 'Institución Educativa de Primaria'
      }, los niños y niñas de ${gradoInfo.valor} (${
        gradoInfo.edadesReferencia
      }) vivencian el siguiente contexto sociocultural y escolar: ${
        params.contexto
      } Asimismo, a partir de la evaluación diagnóstica del aula se ha identificado la necesidad prioritaria de fortalecer: ${
        params.diagnostico
      }`,
      retoPedagogico: `Frente a esta situación, nos planteamos los siguientes retos: ¿Cómo podemos movilizar nuestras capacidades de ${areaInfo.area} utilizando materiales concretos y trabajo cooperativo para superar nuestras dificultades de aprendizaje?, ¿qué propuestas y producciones podemos elaborar desde el aula para aportar al bienestar de nuestra escuela y comunidad?${notaRegeneracion}`,
      productoIntegrador:
        tipo === 'SESION'
          ? `Evidencia tangible de la Sesión ${numSesion}: Producción individual y en equipo en la competencia "${competenciaFocalizadaSesion.nombre}" empleando ${materialesTexto}, verificada con lista de cotejo.`
          : `Producción integradora y evidencia tangible de ${areaInfo.area} elaborada colaborativamente por los estudiantes de ${gradoInfo.valor} aplicando los procesos didácticos del área y socializada con criterios de evaluación formativa.`,
    },
    propositosAprendizaje: competenciasParaPropósitos.map((comp) => ({
      competencia: comp.nombre,
      capacidades: comp.capacidades,
      estandarCiclo: comp.estandaresPorCiclo[gradoInfo.ciclo],
      desempenosPrecisados: comp.capacidades.slice(0, 3).map(
        (cap, cIdx) =>
          `Desempeño precisado ${cIdx + 1} (${cap}): Emplea estrategias, recursos y procedimientos pertinentes a ${gradoInfo.valor} al resolver situaciones del contexto local con apoyo de ${materialesTexto}, respondiendo a las necesidades identificadas en el diagnóstico del aula.${notaRegeneracion}`
      ),
      criteriosEvaluacion: comp.capacidades.slice(0, 3).map(
        (cap) =>
          `Aplica y sustenta procedimientos vinculados a "${cap}" al elaborar su evidencia de ${areaInfo.area}, utilizando adecuadamente el material concreto y verificando la coherencia de sus resultados.`
      ),
      evidenciaAprendizaje:
        tipo === 'SESION'
          ? `Producción práctica y ficha de trabajo resuelta en equipo durante los 90 minutos para la competencia "${comp.nombre}".`
          : `Portafolio de producciones, organizadores y evidencias tangibles de "${comp.nombre}" elaboradas con soporte concreto y gráfico.`,
      instrumentoEvaluacion:
        tipo === 'SESION'
          ? 'Lista de cotejo / Escala de valoración de la sesión (AD, A, B, C)'
          : 'Rúbrica analítica por criterios CNEB y Lista de cotejo de evaluación formativa',
    })),
    competenciasTransversales: [
      {
        competencia: 'Gestiona su aprendizaje de manera autónoma',
        capacidad: 'Define metas de aprendizaje y monitorea su desempeño durante el proceso',
        desempenoContextualizado: `Comprende el propósito de aprendizaje, organiza sus acciones en equipo y revisa con ayuda del docente sus avances en ${areaInfo.area} aplicando la retroalimentación recibida.`,
      },
      {
        competencia: 'Se desenvuelve en entornos virtuales generados por las TIC',
        capacidad: 'Gestiona información del entorno virtual y crea objetos digitales',
        desempenoContextualizado:
          'Explora recursos educativos digitales y tabletas Minedu de forma segura y responsable para organizar información y reforzar sus aprendizajes.',
      },
    ],
    enfoquesTransversales: [
      ENFOQUES_TRANSVERSALES_OFICIALES_CNEB[5], // Enfoque de Orientación al Bien Común
      ENFOQUES_TRANSVERSALES_OFICIALES_CNEB[4], // Enfoque Ambiental
      ENFOQUES_TRANSVERSALES_OFICIALES_CNEB[2], // Enfoque Intercultural
    ],
    secuenciaDidactica,
    orientacionesEvaluacion: [
      {
        tipoEvaluacion: 'Diagnóstica',
        orientacionPedagogica:
          'Identificación del nivel real de desarrollo de las competencias y saberes previos al inicio del proceso (Cartilla de Planificación Minedu) para adecuar la mediación docente a las necesidades reales de los niños y niñas.',
        tecnicasEInstrumentos:
          'Observación sistemática, análisis de evidencias diagnósticas, mapa de calor del aula y portafolio.',
      },
      {
        tipoEvaluacion: 'Formativa',
        orientacionPedagogica:
          'Evaluación continua centrada en el progreso del estudiante (R.V.M. N.° 094-2020-MINEDU): socialización oportuna de criterios, retroalimentación descriptiva y por descubrimiento, e inclusión de las Reflexiones sobre el Aprendizaje del docente (¿Qué avances tuvieron los estudiantes?, ¿qué dificultades se observaron?, ¿qué aprendizajes debo reforzar?, ¿qué actividades y materiales funcionaron?).',
        tecnicasEInstrumentos:
          'Lista de cotejo, escala de valoración, guía de observación, autoevaluación y coevaluación entre pares.',
      },
      {
        tipoEvaluacion: 'Sumativa',
        orientacionPedagogica:
          'Valoración integral del nivel de logro alcanzado respecto al estándar del ciclo empleando la escala literal oficial del CNEB (AD: Logro Destacado, A: Logro Esperado, B: En Proceso, C: En Inicio) con conclusiones descriptivas.',
        tecnicasEInstrumentos:
          'Rúbrica analítica de evaluación por criterios CNEB y exposición del producto integrador.',
      },
    ],
    materialesYBibliografia: {
      paraElDocente: [
        'Ministerio de Educación del Perú (2016). Currículo Nacional de la Educación Básica (CNEB - R.M. N.° 281-2016-MINEDU). Lima: Minedu.',
        'Ministerio de Educación del Perú (2016). Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU). Lima: Minedu.',
        'Ministerio de Educación del Perú (2017). Cartilla de Planificación Curricular para Educación Primaria: ¿Cómo planificar el proceso de enseñanza, aprendizaje y evaluación formativa?. Lima: Minedu.',
        'Ministerio de Educación del Perú (2020). Norma que regula la Evaluación de las Competencias de los Estudiantes de la Educación Básica (R.V.M. N.° 094-2020-MINEDU).',
      ],
      paraElEstudiante: [
        `Cuaderno de Fichas y Texto Escolar de ${areaInfo.area} — ${gradoInfo.valor} (Dotación oficial Minedu).`,
        `${materialesTexto} y Biblioteca de Aula de Educación Primaria Minedu.`,
      ],
    },
  };
}

/**
 * Valida si una clave de entorno está realmente configurada y no es un placeholder vacío
 */
function esApiKeyValida(key: string | undefined, placeholder: string): key is string {
  if (!key) return false;
  const limpia = key.trim();
  return limpia.length > 5 && limpia !== placeholder;
}

/**
 * Extrae y parsea de forma segura el objeto JSON devuelto por modelos de IA
 * (Gemini, Groq, OpenRouter, OpenAI), limpiando bloques <think> o delimitadores markdown ```json,
 * y verificando que contenga estructura curricular real antes de darlo por válido.
 */
export function extraerJsonDeRespuestaIA(
  rawText: string
): Partial<Omit<DocumentoCurricularCNEB, 'id' | 'fechaGeneracion' | 'tipoDocumento'>> {
  const sinThinking = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const sinBloquesCodigo = sinThinking
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const primerLlave = sinBloquesCodigo.indexOf('{');
  const ultimaLlave = sinBloquesCodigo.lastIndexOf('}');
  const jsonCandidato =
    primerLlave !== -1 && ultimaLlave !== -1 && ultimaLlave > primerLlave
      ? sinBloquesCodigo.slice(primerLlave, ultimaLlave + 1)
      : sinBloquesCodigo;

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(jsonCandidato);
  } catch {
    const jsonReparado = jsonCandidato.replace(/,\s*([}\]])/g, '$1');
    parsedRaw = JSON.parse(jsonReparado);
  }

  if (!parsedRaw || typeof parsedRaw !== 'object' || Array.isArray(parsedRaw)) {
    throw new Error('La respuesta de IA no es un objeto JSON curricular válido.');
  }

  const obj = parsedRaw as Record<string, unknown>;
  const tieneTitulo =
    typeof obj.tituloDocumento === 'string' && obj.tituloDocumento.trim().length > 0;
  const tienePropositos =
    Array.isArray(obj.propositosAprendizaje) && obj.propositosAprendizaje.length > 0;
  const tieneSecuencia =
    Array.isArray(obj.secuenciaDidactica) && obj.secuenciaDidactica.length > 0;
  const tieneSituacion =
    Boolean(obj.situacionSignificativa && typeof obj.situacionSignificativa === 'object');

  if (!tieneTitulo && !tienePropositos && !tieneSecuencia && !tieneSituacion) {
    throw new Error(
      'La respuesta JSON del proveedor IA está incompleta o no contiene campos de DocumentoCurricularCNEB.'
    );
  }

  return obj as Partial<
    Omit<DocumentoCurricularCNEB, 'id' | 'fechaGeneracion' | 'tipoDocumento'>
  >;
}

/**
 * Verifica explícitamente que un objeto cumpla con todos los campos obligatorios
 * del contrato DocumentoCurricularCNEB que espera el frontend para renderizar sin errores.
 */
export function validarDocumentoCurricularCompleto(
  doc: unknown
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { valido: false, errores: ['El documento curricular no es un objeto válido.'] };
  }

  const d = doc as Partial<DocumentoCurricularCNEB>;
  const esTextoNoVacio = (val: unknown): val is string =>
    typeof val === 'string' && val.trim().length > 0;
  const esArrayTextoNoVacio = (val: unknown): val is string[] =>
    Array.isArray(val) && val.length > 0 && val.every((item) => esTextoNoVacio(item));

  if (!esTextoNoVacio(d.id)) errores.push('Falta campo obligatorio: id');
  if (!esTextoNoVacio(d.fechaGeneracion)) errores.push('Falta campo obligatorio: fechaGeneracion');
  if (!d.tipoDocumento || !['PCA', 'UNIDAD', 'SESION'].includes(d.tipoDocumento)) {
    errores.push('Falta o es inválido el campo obligatorio: tipoDocumento');
  }
  if (!esTextoNoVacio(d.codigoNormativo)) errores.push('Falta campo obligatorio: codigoNormativo');
  if (!esTextoNoVacio(d.tituloDocumento)) errores.push('Falta campo obligatorio: tituloDocumento');
  if (!esTextoNoVacio(d.descripcionGeneralYCaracterizacion)) {
    errores.push('Falta campo obligatorio: descripcionGeneralYCaracterizacion');
  }

  const info = d.datosInformativos;
  if (!info || typeof info !== 'object') {
    errores.push('Falta objeto obligatorio: datosInformativos');
  } else {
    const camposInfo: (keyof DocumentoCurricularCNEB['datosInformativos'])[] = [
      'dre',
      'ugel',
      'institucionEducativa',
      'nivel',
      'ciclo',
      'gradoYSeccion',
      'areaCurricular',
      'periodoLectivo',
      'duracionEstimada',
      'docenteResponsable',
      'directorIE',
    ];
    for (const campo of camposInfo) {
      if (!esTextoNoVacio(info[campo])) {
        errores.push(`Falta campo obligatorio en datosInformativos.${campo}`);
      }
    }
  }

  const sit = d.situacionSignificativa;
  if (!sit || typeof sit !== 'object') {
    errores.push('Falta objeto obligatorio: situacionSignificativa');
  } else {
    if (!esTextoNoVacio(sit.contextoReal)) {
      errores.push('Falta situacionSignificativa.contextoReal');
    }
    if (!esTextoNoVacio(sit.retoPedagogico)) {
      errores.push('Falta situacionSignificativa.retoPedagogico');
    }
    if (!esTextoNoVacio(sit.productoIntegrador)) {
      errores.push('Falta situacionSignificativa.productoIntegrador');
    }
  }

  if (!Array.isArray(d.propositosAprendizaje) || d.propositosAprendizaje.length === 0) {
    errores.push('El arreglo obligatorio propositosAprendizaje está vacío o ausente.');
  } else {
    d.propositosAprendizaje.forEach((p, idx) => {
      if (!esTextoNoVacio(p?.competencia)) {
        errores.push(`propositosAprendizaje[${idx}].competencia vacío`);
      }
      if (!esArrayTextoNoVacio(p?.capacidades)) {
        errores.push(`propositosAprendizaje[${idx}].capacidades vacío o inválido`);
      }
      if (!esTextoNoVacio(p?.estandarCiclo)) {
        errores.push(`propositosAprendizaje[${idx}].estandarCiclo vacío`);
      }
      if (!esArrayTextoNoVacio(p?.desempenosPrecisados)) {
        errores.push(`propositosAprendizaje[${idx}].desempenosPrecisados vacío o inválido`);
      }
      if (!esArrayTextoNoVacio(p?.criteriosEvaluacion)) {
        errores.push(`propositosAprendizaje[${idx}].criteriosEvaluacion vacío o inválido`);
      }
      if (!esTextoNoVacio(p?.evidenciaAprendizaje)) {
        errores.push(`propositosAprendizaje[${idx}].evidenciaAprendizaje vacío`);
      }
      if (!esTextoNoVacio(p?.instrumentoEvaluacion)) {
        errores.push(`propositosAprendizaje[${idx}].instrumentoEvaluacion vacío`);
      }
    });
  }

  if (!Array.isArray(d.competenciasTransversales) || d.competenciasTransversales.length === 0) {
    errores.push('El arreglo obligatorio competenciasTransversales está vacío o ausente.');
  } else {
    d.competenciasTransversales.forEach((ct, idx) => {
      if (!esTextoNoVacio(ct?.competencia)) {
        errores.push(`competenciasTransversales[${idx}].competencia vacío`);
      }
      if (!esTextoNoVacio(ct?.capacidad)) {
        errores.push(`competenciasTransversales[${idx}].capacidad vacío`);
      }
      if (!esTextoNoVacio(ct?.desempenoContextualizado)) {
        errores.push(`competenciasTransversales[${idx}].desempenoContextualizado vacío`);
      }
    });
  }

  if (!Array.isArray(d.enfoquesTransversales) || d.enfoquesTransversales.length === 0) {
    errores.push('El arreglo obligatorio enfoquesTransversales está vacío o ausente.');
  } else {
    d.enfoquesTransversales.forEach((enf, idx) => {
      if (!esTextoNoVacio(enf?.enfoque)) {
        errores.push(`enfoquesTransversales[${idx}].enfoque vacío`);
      }
      if (!esTextoNoVacio(enf?.valor)) {
        errores.push(`enfoquesTransversales[${idx}].valor vacío`);
      }
      if (!esTextoNoVacio(enf?.actitudesObservables)) {
        errores.push(`enfoquesTransversales[${idx}].actitudesObservables vacío`);
      }
    });
  }

  if (!Array.isArray(d.secuenciaDidactica) || d.secuenciaDidactica.length === 0) {
    errores.push('El arreglo obligatorio secuenciaDidactica está vacío o ausente.');
  } else {
    if (d.tipoDocumento === 'PCA' && d.secuenciaDidactica.length < 8) {
      errores.push(
        `secuenciaDidactica para PCA debe tener 8 Unidades Didácticas (tiene ${d.secuenciaDidactica.length}).`
      );
    }
    d.secuenciaDidactica.forEach((sec, idx) => {
      if (!esTextoNoVacio(sec?.numero)) {
        errores.push(`secuenciaDidactica[${idx}].numero vacío`);
      }
      if (!esTextoNoVacio(sec?.titulo)) {
        errores.push(`secuenciaDidactica[${idx}].titulo vacío`);
      }
      if (!esTextoNoVacio(sec?.duracion)) {
        errores.push(`secuenciaDidactica[${idx}].duracion vacío`);
      }
      if (!esTextoNoVacio(sec?.faseOMomento)) {
        errores.push(`secuenciaDidactica[${idx}].faseOMomento vacío`);
      }
      if (!esArrayTextoNoVacio(sec?.actividadesEstrategicas)) {
        errores.push(`secuenciaDidactica[${idx}].actividadesEstrategicas vacío o inválido`);
      }
      if (!esArrayTextoNoVacio(sec?.recursosEducativos)) {
        errores.push(`secuenciaDidactica[${idx}].recursosEducativos vacío o inválido`);
      }
      if (!esTextoNoVacio(sec?.productoOEvidencia)) {
        errores.push(`secuenciaDidactica[${idx}].productoOEvidencia vacío`);
      }
      if (d.tipoDocumento === 'PCA') {
        if (!Array.isArray(sec?.sesionesSugeridas) || sec.sesionesSugeridas.length === 0) {
          errores.push(`secuenciaDidactica[${idx}].sesionesSugeridas vacío en PCA`);
        }
      }
    });
  }

  if (!Array.isArray(d.orientacionesEvaluacion) || d.orientacionesEvaluacion.length === 0) {
    errores.push('El arreglo obligatorio orientacionesEvaluacion está vacío o ausente.');
  } else {
    d.orientacionesEvaluacion.forEach((oe, idx) => {
      if (!esTextoNoVacio(oe?.tipoEvaluacion)) {
        errores.push(`orientacionesEvaluacion[${idx}].tipoEvaluacion vacío`);
      }
      if (!esTextoNoVacio(oe?.orientacionPedagogica)) {
        errores.push(`orientacionesEvaluacion[${idx}].orientacionPedagogica vacío`);
      }
      if (!esTextoNoVacio(oe?.tecnicasEInstrumentos)) {
        errores.push(`orientacionesEvaluacion[${idx}].tecnicasEInstrumentos vacío`);
      }
    });
  }

  const mat = d.materialesYBibliografia;
  if (!mat || typeof mat !== 'object') {
    errores.push('Falta objeto obligatorio: materialesYBibliografia');
  } else {
    if (!esArrayTextoNoVacio(mat.paraElDocente)) {
      errores.push('materialesYBibliografia.paraElDocente vacío o inválido');
    }
    if (!esArrayTextoNoVacio(mat.paraElEstudiante)) {
      errores.push('materialesYBibliografia.paraElEstudiante vacío o inválido');
    }
  }

  return { valido: errores.length === 0, errores };
}

/**
 * Servicio central de generación curricular para Educación Primaria con Respaldo Inteligente Multi-Proveedor:
 * - Prioridad 1: Google Gemini ("gemini-3.8-flash", máx. 30s)
 * - Prioridad 2: Groq API ("openai/gpt-oss-120b", "openai/gpt-oss-20b", máx. 15s por modelo)
 * - Prioridad 3: OpenRouter API ("openrouter/free", máx. 20s)
 * - Prioridad 4: OpenAI API ("gpt-5.4-mini", máx. 25s, último recurso IA sin reintentar ante insufficient_quota)
 * - Prioridad 5: Contingencia Local CNEB existente
 */
export async function generarDocumentoCurricularCore(
  params: ParametrosPlanificacionCNEB
): Promise<DocumentoCurricularCNEB> {
  const gradoInfo = GRADOS_CNEB.find((g) => g.valor === params.grado) ?? GRADOS_CNEB[4];
  const areaInfo =
    AREAS_CURRICULARES_CNEB.find((a) => a.area === params.area) ?? AREAS_CURRICULARES_CNEB[0];
  const baseContingencia = construirRespaldoContingenciaCNEB(params);

  const formatearDocumentoFinal = (
    parsedInput: Partial<Omit<DocumentoCurricularCNEB, 'id' | 'fechaGeneracion' | 'tipoDocumento'>>
  ): DocumentoCurricularCNEB => {
    const tipoFinal = params.tipoDocumento || 'PCA';
    const textoSeguro = (val: unknown, fallback: string): string =>
      typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
    const arrayTextoSeguro = (val: unknown, fallback: string[]): string[] => {
      if (!Array.isArray(val)) return fallback;
      const filtrados = val
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
      return filtrados.length > 0 ? filtrados : fallback;
    };

    const propositosNormalizados =
      Array.isArray(parsedInput.propositosAprendizaje) &&
      parsedInput.propositosAprendizaje.length > 0
        ? parsedInput.propositosAprendizaje.map((item, idx) => {
            const fb =
              baseContingencia.propositosAprendizaje[
                idx % baseContingencia.propositosAprendizaje.length
              ];
            return {
              competencia: textoSeguro(item?.competencia, fb.competencia),
              capacidades: arrayTextoSeguro(item?.capacidades, fb.capacidades),
              estandarCiclo: textoSeguro(item?.estandarCiclo, fb.estandarCiclo),
              desempenosPrecisados: arrayTextoSeguro(
                item?.desempenosPrecisados,
                fb.desempenosPrecisados
              ),
              criteriosEvaluacion: arrayTextoSeguro(
                item?.criteriosEvaluacion,
                fb.criteriosEvaluacion
              ),
              evidenciaAprendizaje: textoSeguro(
                item?.evidenciaAprendizaje,
                fb.evidenciaAprendizaje
              ),
              instrumentoEvaluacion: textoSeguro(
                item?.instrumentoEvaluacion,
                fb.instrumentoEvaluacion
              ),
            };
          })
        : baseContingencia.propositosAprendizaje;

    const transversalesNormalizadas =
      Array.isArray(parsedInput.competenciasTransversales) &&
      parsedInput.competenciasTransversales.length > 0
        ? parsedInput.competenciasTransversales.map((item, idx) => {
            const fb =
              baseContingencia.competenciasTransversales[
                idx % baseContingencia.competenciasTransversales.length
              ];
            return {
              competencia: textoSeguro(item?.competencia, fb.competencia),
              capacidad: textoSeguro(item?.capacidad, fb.capacidad),
              desempenoContextualizado: textoSeguro(
                item?.desempenoContextualizado,
                fb.desempenoContextualizado
              ),
            };
          })
        : baseContingencia.competenciasTransversales;

    const enfoquesNormalizados =
      Array.isArray(parsedInput.enfoquesTransversales) &&
      parsedInput.enfoquesTransversales.length > 0
        ? parsedInput.enfoquesTransversales.map((item, idx) => {
            const fb =
              baseContingencia.enfoquesTransversales[
                idx % baseContingencia.enfoquesTransversales.length
              ];
            return {
              enfoque: textoSeguro(item?.enfoque, fb.enfoque),
              valor: textoSeguro(item?.valor, fb.valor),
              actitudesObservables: textoSeguro(
                item?.actitudesObservables,
                fb.actitudesObservables
              ),
            };
          })
        : baseContingencia.enfoquesTransversales;

    const orientacionesNormalizadas =
      Array.isArray(parsedInput.orientacionesEvaluacion) &&
      parsedInput.orientacionesEvaluacion.length > 0
        ? parsedInput.orientacionesEvaluacion.map((item, idx) => {
            const fb =
              baseContingencia.orientacionesEvaluacion[
                idx % baseContingencia.orientacionesEvaluacion.length
              ];
            const tipoValido =
              item?.tipoEvaluacion === 'Diagnóstica' ||
              item?.tipoEvaluacion === 'Formativa' ||
              item?.tipoEvaluacion === 'Sumativa'
                ? item.tipoEvaluacion
                : fb.tipoEvaluacion;
            return {
              tipoEvaluacion: tipoValido,
              orientacionPedagogica: textoSeguro(
                item?.orientacionPedagogica,
                fb.orientacionPedagogica
              ),
              tecnicasEInstrumentos: textoSeguro(
                item?.tecnicasEInstrumentos,
                fb.tecnicasEInstrumentos
              ),
            };
          })
        : baseContingencia.orientacionesEvaluacion;

    // Si es una PCA y el modelo devolvió menos de 8 unidades o sin sesionesSugeridas, completamos con el catálogo maestro
    let secuenciaNormalizada =
      Array.isArray(parsedInput.secuenciaDidactica) && parsedInput.secuenciaDidactica.length > 0
        ? parsedInput.secuenciaDidactica.map((sec, idx) => {
            const fb =
              baseContingencia.secuenciaDidactica[
                idx % baseContingencia.secuenciaDidactica.length
              ];
            return {
              numero: textoSeguro(sec?.numero, fb.numero),
              titulo: textoSeguro(sec?.titulo, fb.titulo),
              duracion: textoSeguro(sec?.duracion, fb.duracion),
              faseOMomento: textoSeguro(sec?.faseOMomento, fb.faseOMomento),
              proposito: textoSeguro(sec?.proposito, fb.proposito || ''),
              actividadesEstrategicas: arrayTextoSeguro(
                sec?.actividadesEstrategicas,
                fb.actividadesEstrategicas
              ),
              recursosEducativos: arrayTextoSeguro(
                sec?.recursosEducativos,
                fb.recursosEducativos
              ),
              productoOEvidencia: textoSeguro(sec?.productoOEvidencia, fb.productoOEvidencia),
              sesionesSugeridas:
                Array.isArray(sec?.sesionesSugeridas) && sec.sesionesSugeridas.length > 0
                  ? sec.sesionesSugeridas.map((ss, sIdx) => ({
                      numero: textoSeguro(ss?.numero, `Sesión ${sIdx + 1}`),
                      titulo: textoSeguro(ss?.titulo, `Sesión de Aprendizaje ${sIdx + 1}`),
                      proposito: textoSeguro(
                        ss?.proposito,
                        'Desarrollar competencias del área mediante procesos didácticos activos.'
                      ),
                      duracion: textoSeguro(ss?.duracion, '90 minutos'),
                    }))
                  : fb.sesionesSugeridas,
            };
          })
        : baseContingencia.secuenciaDidactica;

    if (tipoFinal === 'PCA') {
      const catalogo8 = construirCatalogo8UnidadesPCA(
        gradoInfo.valor,
        areaInfo.area,
        areaInfo.procesosDidacticosPrimaria.join(' | '),
        areaInfo.materialesMineduPrimaria.join(', ')
      );
      secuenciaNormalizada = catalogo8.map((unidadBase, idx) => {
        const existente = secuenciaNormalizada?.[idx];
        if (!existente) return unidadBase;
        return {
          ...unidadBase,
          ...existente,
          numero: `Unidad ${idx + 1}`,
          titulo: textoSeguro(existente.titulo, unidadBase.titulo),
          duracion: textoSeguro(existente.duracion, unidadBase.duracion),
          faseOMomento: textoSeguro(existente.faseOMomento, unidadBase.faseOMomento),
          proposito: textoSeguro(existente.proposito, unidadBase.proposito),
          actividadesEstrategicas: arrayTextoSeguro(
            existente.actividadesEstrategicas,
            unidadBase.actividadesEstrategicas
          ),
          recursosEducativos: arrayTextoSeguro(
            existente.recursosEducativos,
            unidadBase.recursosEducativos
          ),
          productoOEvidencia: textoSeguro(
            existente.productoOEvidencia,
            unidadBase.productoOEvidencia
          ),
          sesionesSugeridas:
            Array.isArray(existente.sesionesSugeridas) && existente.sesionesSugeridas.length > 0
              ? existente.sesionesSugeridas
              : unidadBase.sesionesSugeridas,
        };
      });
    }

    const docConDatos: DocumentoCurricularCNEB = {
      id: `cneb-primaria-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fechaGeneracion: new Date().toISOString(),
      tipoDocumento: tipoFinal,
      codigoNormativo: textoSeguro(
        parsedInput.codigoNormativo,
        baseContingencia.codigoNormativo
      ),
      tituloDocumento: textoSeguro(
        parsedInput.tituloDocumento,
        baseContingencia.tituloDocumento
      ),
      unidadNumero: params.unidadNumero ?? parsedInput.unidadNumero,
      sesionNumero: params.sesionNumero ?? parsedInput.sesionNumero,
      datosInformativos: {
        dre: textoSeguro(
          params.dre || parsedInput.datosInformativos?.dre,
          baseContingencia.datosInformativos.dre
        ),
        ugel: textoSeguro(
          params.ugel || parsedInput.datosInformativos?.ugel,
          baseContingencia.datosInformativos.ugel
        ),
        institucionEducativa: textoSeguro(
          params.institucion || parsedInput.datosInformativos?.institucionEducativa,
          baseContingencia.datosInformativos.institucionEducativa
        ),
        nivel: 'Educación Primaria',
        ciclo: `${gradoInfo.ciclo} (${gradoInfo.edadesReferencia})`,
        gradoYSeccion: gradoInfo.valor,
        areaCurricular: textoSeguro(
          params.area || parsedInput.datosInformativos?.areaCurricular,
          baseContingencia.datosInformativos.areaCurricular
        ),
        periodoLectivo: textoSeguro(
          params.periodo || parsedInput.datosInformativos?.periodoLectivo,
          baseContingencia.datosInformativos.periodoLectivo
        ),
        duracionEstimada: textoSeguro(
          parsedInput.datosInformativos?.duracionEstimada,
          baseContingencia.datosInformativos.duracionEstimada
        ),
        docenteResponsable: textoSeguro(
          params.docente || parsedInput.datosInformativos?.docenteResponsable,
          baseContingencia.datosInformativos.docenteResponsable
        ),
        directorIE: textoSeguro(
          params.director || parsedInput.datosInformativos?.directorIE,
          baseContingencia.datosInformativos.directorIE
        ),
      },
      descripcionGeneralYCaracterizacion: textoSeguro(
        parsedInput.descripcionGeneralYCaracterizacion,
        baseContingencia.descripcionGeneralYCaracterizacion
      ).replace(/!/g, '→'),
      situacionSignificativa: {
        contextoReal: textoSeguro(
          parsedInput.situacionSignificativa?.contextoReal,
          baseContingencia.situacionSignificativa.contextoReal
        ),
        retoPedagogico: textoSeguro(
          parsedInput.situacionSignificativa?.retoPedagogico,
          baseContingencia.situacionSignificativa.retoPedagogico
        ),
        productoIntegrador: textoSeguro(
          parsedInput.situacionSignificativa?.productoIntegrador,
          baseContingencia.situacionSignificativa.productoIntegrador
        ),
      },
      propositosAprendizaje: propositosNormalizados,
      competenciasTransversales: transversalesNormalizadas,
      enfoquesTransversales: enfoquesNormalizados,
      secuenciaDidactica: secuenciaNormalizada,
      orientacionesEvaluacion: orientacionesNormalizadas,
      materialesYBibliografia: {
        paraElDocente: arrayTextoSeguro(
          parsedInput.materialesYBibliografia?.paraElDocente,
          baseContingencia.materialesYBibliografia.paraElDocente
        ),
        paraElEstudiante: arrayTextoSeguro(
          parsedInput.materialesYBibliografia?.paraElEstudiante,
          baseContingencia.materialesYBibliografia.paraElEstudiante
        ),
      },
    };
    return sanitizarDocumentoCurricular(docConDatos);
  };

  // Si se solicita síntesis rápida en lote continuo (1 Clic) para sub-ramas derivadas de la PCA
  if (params.modoLoteRapido) {
    return formatearDocumentoFinal(baseContingencia);
  }

  const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const groqApiKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const openRouterApiKey = (process.env.OPENROUTER_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const openaiApiKey = (process.env.OPENAI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  const tieneGemini = esApiKeyValida(geminiApiKey, 'MY_GEMINI_API_KEY');
  const tieneGroq = esApiKeyValida(groqApiKey, 'MY_GROQ_API_KEY');
  const tieneOpenRouter = esApiKeyValida(openRouterApiKey, 'MY_OPENROUTER_API_KEY');
  const tieneClaveOpenAI = esApiKeyValida(openaiApiKey, 'MY_OPENAI_API_KEY');
  const openaiCreditosDeshabilitadosPorEnv =
    (process.env.OPENAI_HAS_CREDITS || '').trim().toLowerCase() === 'false' ||
    (process.env.OPENAI_DISABLED || '').trim().toLowerCase() === 'true';
  const tieneOpenAI =
    tieneClaveOpenAI && !openaiSinCreditosDetectado && !openaiCreditosDeshabilitadosPorEnv;

  const diagnosticoClaves: DiagnosticoClavesProveedores = {
    GEMINI: tieneGemini
      ? 'Pendiente de ejecución'
      : 'Clave GEMINI_API_KEY no configurada o vacía en variables de entorno',
    GROQ: tieneGroq
      ? 'Pendiente de ejecución'
      : 'Clave GROQ_API_KEY no configurada o vacía en variables de entorno',
    OPENROUTER: tieneOpenRouter
      ? 'Pendiente de ejecución'
      : 'Clave OPENROUTER_API_KEY no configurada o vacía en variables de entorno',
    OPENAI: !tieneClaveOpenAI
      ? 'Clave OPENAI_API_KEY no configurada o vacía en variables de entorno'
      : openaiSinCreditosDetectado || openaiCreditosDeshabilitadosPorEnv
      ? 'Omitido: API de OpenAI sin créditos disponibles (insufficient_quota / saldo insuficiente)'
      : 'Pendiente de ejecución',
  };

  const construirDebugErrorGlobal = (): string =>
    `GEMINI: ${diagnosticoClaves.GEMINI} | GROQ: ${diagnosticoClaves.GROQ} | OPENROUTER: ${diagnosticoClaves.OPENROUTER} | OPENAI: ${diagnosticoClaves.OPENAI}`;

  // Si ninguna clave de IA está configurada, activar directamente la Prioridad 5 (Contingencia Local CNEB)
  if (!tieneGemini && !tieneGroq && !tieneOpenRouter && !tieneOpenAI) {
    const debugMsg = construirDebugErrorGlobal();
    console.warn(
      `[CNEB Aviso] Ninguna clave de IA configurada (${debugMsg}). Utilizando Prioridad 5 (Contingencia Local CNEB).`
    );
    return formatearDocumentoFinal(baseContingencia);
  }

  const promptMaestro = buildMasterPedagogicalPrompt(params);
  const systemPromptJsonOpenAI = `${SYSTEM_INSTRUCTION_PRIMARIA}
IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido (sin texto adicional ni bloques markdown) que cumpla exactamente con estas propiedades raíz:
- codigoNormativo (string)
- tituloDocumento (string)
- datosInformativos ({ dre, ugel, institucionEducativa, nivel, ciclo, gradoYSeccion, areaCurricular, periodoLectivo, duracionEstimada, docenteResponsable, directorIE })
- descripcionGeneralYCaracterizacion (string)
- situacionSignificativa ({ contextoReal, retoPedagogico, productoIntegrador })
- propositosAprendizaje (array de objetos con { competencia, capacidades, estandarCiclo, desempenosPrecisados, criteriosEvaluacion, evidenciaAprendizaje, instrumentoEvaluacion })
- competenciasTransversales (array de objetos con { competencia, capacidad, desempenoContextualizado })
- enfoquesTransversales (array de objetos con { enfoque, valor, actitudesObservables })
- secuenciaDidactica (array de objetos con { numero, titulo, duracion, faseOMomento, proposito, actividadesEstrategicas, recursosEducativos, productoOEvidencia, sesionesSugeridas })
- orientacionesEvaluacion (array de objetos con { tipoEvaluacion, orientacionPedagogica, tecnicasEInstrumentos })
- materialesYBibliografia ({ paraElDocente, paraElEstudiante })`;

  // ============================================================================
  // FLUJO CONTINUO MULTI-PROVEEDOR (ORDEN OBLIGATORIO DE 5 PRIORIDADES):
  // 1. Gemini ("gemini-3.8-flash") -> Máximo 30 segundos (30000ms)
  // 2. Groq API ("openai/gpt-oss-120b", "openai/gpt-oss-20b") -> Máximo 15 segundos por modelo (15000ms)
  // 3. OpenRouter API ("openrouter/free") -> Máximo 20 segundos (20000ms)
  // 4. OpenAI API (ÚNICAMENTE "gpt-5.4-mini") -> Máximo 25 segundos (25000ms)
  // 5. Contingencia Local CNEB existente
  // ============================================================================

  // ----------------------------------------------------------------------------
  // PRIORIDAD 1: Google Gemini (Máximo 30 segundos / 30000ms)
  // ----------------------------------------------------------------------------
  if (tieneGemini) {
    const geminiAbortController = new AbortController();
    try {
      console.log(
        `[CNEB] Prioridad 1: Intentando con Google Gemini (modelo: "${MODELO_PRINCIPAL_GEMINI}", timeout: ${TIMEOUT_GEMINI_NIVEL_1_MS}ms)...`
      );
      const genAI = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ejecutarConTimeout(
        genAI.models.generateContent({
          model: MODELO_PRINCIPAL_GEMINI,
          contents: promptMaestro,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_PRIMARIA,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: CNEB_PRIMARIA_RESPONSE_SCHEMA,
            abortSignal: geminiAbortController.signal,
          },
        }),
        TIMEOUT_GEMINI_NIVEL_1_MS,
        `Gemini (${MODELO_PRINCIPAL_GEMINI})`,
        geminiAbortController
      );

      const rawText = response.text;
      if (!rawText) {
        throw new Error(
          `El modelo Gemini (${MODELO_PRINCIPAL_GEMINI}) devolvió una respuesta vacía.`
        );
      }

      const parsed = extraerJsonDeRespuestaIA(rawText);
      console.log(`[CNEB] Prioridad 1 (Gemini "${MODELO_PRINCIPAL_GEMINI}") respondió con éxito.`);
      return formatearDocumentoFinal(parsed);
    } catch (errorNivel1: unknown) {
      if (!geminiAbortController.signal.aborted) {
        geminiAbortController.abort();
      }
      const infoError = registrarErrorProveedorConsola(
        'GEMINI',
        MODELO_PRINCIPAL_GEMINI,
        errorNivel1
      );
      diagnosticoClaves.GEMINI = infoError.resumen;
      console.log(
        '[CNEB] Gemini falló o expiró por tiempo (503/429/timeout). Conmutando a Prioridad 2 (Groq)...'
      );
    }
  } else {
    console.log(
      '[CNEB] Prioridad 1 (Gemini) no configurada. Conmutando a Prioridad 2 (Groq)...'
    );
  }

  // ----------------------------------------------------------------------------
  // PRIORIDAD 2: Groq API (Máximo 15 segundos por modelo / 15000ms)
  // Endpoint Base: "https://api.groq.com/openai/v1"
  // ----------------------------------------------------------------------------
  if (tieneGroq) {
    try {
      const groqClient = new OpenAI({
        apiKey: groqApiKey,
        baseURL: GROQ_BASE_URL,
        timeout: TIMEOUT_GROQ_POR_MODELO_MS,
        maxRetries: 0,
        fetch: (...args) => globalThis.fetch(...args),
      });

      const erroresGroq: string[] = [];

      for (const modeloGroq of MODELOS_GROQ_NIVEL_2) {
        const groqAbortController = new AbortController();
        try {
          console.log(
            `[CNEB] Intentando Prioridad 2 con Groq API (modelo: "${modeloGroq}", timeout: ${TIMEOUT_GROQ_POR_MODELO_MS}ms)...`
          );
          const completion = await ejecutarConTimeout(
            groqClient.chat.completions.create(
              {
                model: modeloGroq,
                messages: [
                  { role: 'system', content: systemPromptJsonOpenAI },
                  { role: 'user', content: promptMaestro },
                ],
                temperature: 0.4,
                max_tokens: 8192,
                response_format: { type: 'json_object' },
              },
              { signal: groqAbortController.signal }
            ),
            TIMEOUT_GROQ_POR_MODELO_MS,
            `Groq (${modeloGroq})`,
            groqAbortController
          );

          const rawText = completion.choices?.[0]?.message?.content;
          if (!rawText) {
            throw new Error(`Groq (${modeloGroq}) devolvió una respuesta vacía.`);
          }

          const parsed = extraerJsonDeRespuestaIA(rawText);
          console.log(`[CNEB] Prioridad 2 (Groq "${modeloGroq}") respondió con éxito.`);
          return formatearDocumentoFinal(parsed);
        } catch (errorGroq: unknown) {
          if (!groqAbortController.signal.aborted) {
            groqAbortController.abort();
          }
          const infoError = registrarErrorProveedorConsola('GROQ', modeloGroq, errorGroq);
          erroresGroq.push(infoError.resumen);
          diagnosticoClaves.GROQ = erroresGroq.join(' ; ');
        }
      }
      console.log('[CNEB] Prioridad 2 (Groq) no disponible. Conmutando a Prioridad 3 (OpenRouter)...');
    } catch (errorNivel2Global: unknown) {
      const infoError = registrarErrorProveedorConsola(
        'GROQ',
        MODELO_GROQ_LLAMA,
        errorNivel2Global
      );
      diagnosticoClaves.GROQ = infoError.resumen;
      console.log('[CNEB] Prioridad 2 (Groq) falló. Conmutando a Prioridad 3 (OpenRouter)...');
    }
  } else {
    console.log(`[CNEB] Prioridad 2 (Groq) omitida. Conmutando a Prioridad 3 (OpenRouter)...`);
  }

  // ----------------------------------------------------------------------------
  // PRIORIDAD 3: OpenRouter API (Máximo 20 segundos / 20000ms)
  // - Endpoint Base: "https://openrouter.ai/api/v1"
  // - Headers requeridos: 'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', 'X-Title': 'CNEB Planificador'
  // ----------------------------------------------------------------------------
  if (tieneOpenRouter) {
    try {
      const openRouterHeaders: Record<string, string> = {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'CNEB Planificador',
      };

      const openRouterClient = new OpenAI({
        apiKey: openRouterApiKey,
        baseURL: OPENROUTER_BASE_URL,
        timeout: TIMEOUT_OPENROUTER_MS,
        maxRetries: 0,
        defaultHeaders: openRouterHeaders,
        fetch: (...args) => globalThis.fetch(...args),
      });

      const erroresOpenRouter: string[] = [];
      const inicioOpenRouter = Date.now();

      for (const modelo of MODELOS_OPENROUTER_NIVEL_3) {
        const transcurridoOpenRouter = Date.now() - inicioOpenRouter;
        const tiempoRestanteOpenRouter = TIMEOUT_OPENROUTER_MS - transcurridoOpenRouter;
        if (tiempoRestanteOpenRouter <= 1_000) {
          console.warn(
            `[CNEB Aviso] Tiempo máximo de OpenRouter (${TIMEOUT_OPENROUTER_MS}ms) alcanzado. Abortando OpenRouter...`
          );
          break;
        }

        const openRouterAbortController = new AbortController();
        try {
          console.log(
            `[CNEB] Intentando Prioridad 3 con OpenRouter API (modelo: "${modelo}", timeout: ${tiempoRestanteOpenRouter}ms)...`
          );
          const completion = await ejecutarConTimeout(
            openRouterClient.chat.completions.create(
              {
                model: modelo,
                messages: [
                  { role: 'system', content: systemPromptJsonOpenAI },
                  { role: 'user', content: promptMaestro },
                ],
                temperature: 0.4,
                max_tokens: 4096,
              },
              {
                signal: openRouterAbortController.signal,
                headers: openRouterHeaders,
              }
            ),
            tiempoRestanteOpenRouter,
            `OpenRouter (${modelo})`,
            openRouterAbortController
          );

          const rawText = completion.choices?.[0]?.message?.content;
          if (!rawText) {
            throw new Error(`OpenRouter (${modelo}) devolvió una respuesta vacía.`);
          }

          const parsed = extraerJsonDeRespuestaIA(rawText);
          console.log(`[CNEB] Prioridad 3 (OpenRouter "${modelo}") respondió con éxito.`);
          return formatearDocumentoFinal(parsed);
        } catch (errorOpenRouter: unknown) {
          if (!openRouterAbortController.signal.aborted) {
            openRouterAbortController.abort();
          }
          const infoError = registrarErrorProveedorConsola(
            'OPENROUTER',
            modelo,
            errorOpenRouter
          );
          erroresOpenRouter.push(infoError.resumen);
          diagnosticoClaves.OPENROUTER = erroresOpenRouter.join(' ; ');

          if (
            infoError.causa.includes('invalid API key') ||
            infoError.causa.includes('permission denied') ||
            infoError.causa.includes('insufficient credits') ||
            String(infoError.message).toLowerCase().includes('timeout')
          ) {
            break;
          }
        }
      }
      console.log('[CNEB] Prioridad 3 (OpenRouter) no disponible. Conmutando a Prioridad 4 (OpenAI gpt-5.4-mini)...');
    } catch (errorOpenRouterGlobal: unknown) {
      const infoError = registrarErrorProveedorConsola(
        'OPENROUTER',
        MODELO_OPENROUTER_PRINCIPAL,
        errorOpenRouterGlobal
      );
      diagnosticoClaves.OPENROUTER = infoError.resumen;
    }
  } else {
    console.log(`[CNEB] Prioridad 3 (OpenRouter) omitida. Conmutando a Prioridad 4 (OpenAI gpt-5.4-mini)...`);
  }

  // ----------------------------------------------------------------------------
  // PRIORIDAD 4: OpenAI API — ÚNICAMENTE "gpt-5.4-mini" (Máximo 25 segundos / 25000ms)
  // Solo se ejecuta cuando Gemini, Groq y OpenRouter hayan fallado.
  // No realiza llamadas si OPENAI_API_KEY no está configurada o si la API no tiene créditos disponibles.
  // Si devuelve insufficient_quota, saldo insuficiente o límite de gasto, no reintenta y pasa a la contingencia local.
  // ----------------------------------------------------------------------------
  if (tieneOpenAI) {
    const openaiAbortController = new AbortController();
    try {
      const openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        timeout: TIMEOUT_OPENAI_MS,
        maxRetries: 0,
        fetch: (...args) => globalThis.fetch(...args),
      });

      console.log(
        `[CNEB] Intentando Prioridad 4 (Último recurso IA) con OpenAI (modelo: "${OPENAI_MODEL}", timeout: ${TIMEOUT_OPENAI_MS}ms)...`
      );
      const completion = await ejecutarConTimeout(
        openaiClient.chat.completions.create(
          {
            model: OPENAI_MODEL,
            messages: [
              { role: 'system', content: systemPromptJsonOpenAI },
              { role: 'user', content: promptMaestro },
            ],
            response_format: { type: 'json_object' },
          },
          { signal: openaiAbortController.signal }
        ),
        TIMEOUT_OPENAI_MS,
        `OpenAI (${OPENAI_MODEL})`,
        openaiAbortController
      );

      const rawText = completion.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error(`OpenAI (${OPENAI_MODEL}) devolvió una respuesta vacía.`);
      }

      const parsed = extraerJsonDeRespuestaIA(rawText);
      console.log(`[CNEB] Prioridad 4 (OpenAI "${OPENAI_MODEL}") respondió con éxito.`);
      return formatearDocumentoFinal(parsed);
    } catch (errorOpenAI: unknown) {
      if (!openaiAbortController.signal.aborted) {
        openaiAbortController.abort();
      }
      const sinCreditos = esErrorSinCreditosOpenAI(errorOpenAI);
      if (sinCreditos) {
        openaiSinCreditosDetectado = true;
      }
      const infoError = registrarErrorProveedorConsola(
        'OPENAI',
        OPENAI_MODEL,
        errorOpenAI
      );
      diagnosticoClaves.OPENAI = infoError.resumen;
      if (sinCreditos) {
        console.log(
          `[CNEB] Prioridad 4 (OpenAI "${OPENAI_MODEL}") reportó insufficient_quota / saldo insuficiente o límite de gasto. Sin reintentar, pasando a Prioridad 5 (Contingencia Local)...`
        );
      } else {
        console.log(
          '[CNEB] Prioridad 4 (OpenAI gpt-5.4-mini) falló o expiró por tiempo. Conmutando a Prioridad 5 (Contingencia Local)...'
        );
      }
    }
  } else if (!tieneClaveOpenAI) {
    console.log(
      '[CNEB] Prioridad 4 (OpenAI) omitida (OPENAI_API_KEY no configurada). Conmutando a Prioridad 5 (Contingencia Local)...'
    );
  } else {
    console.log(
      '[CNEB] Prioridad 4 (OpenAI) omitida (API sin créditos disponibles / insufficient_quota). Conmutando a Prioridad 5 (Contingencia Local)...'
    );
  }

  // ----------------------------------------------------------------------------
  // PRIORIDAD 5: Contingencia Local CNEB existente
  // Si todos los proveedores de IA fallaron o alcanzaron sus límites de cuota,
  // garantiza la entrega inmediata del documento curricular estructurado CNEB.
  // ----------------------------------------------------------------------------
  const debugFinal = construirDebugErrorGlobal();
  console.warn(
    `[CNEB Aviso] Proveedores externos no disponibles (${debugFinal}). Activando Prioridad 5: Contingencia Local CNEB.`
  );
  return formatearDocumentoFinal(baseContingencia);
}

/**
 * Handler estándar Next.js 14+ App Router: POST /api/generar-documento
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const validacion = validarPayloadCurricular(body);

    if (!validacion.valido || !validacion.datos) {
      return Response.json(
        {
          ok: false,
          success: false,
          error: 'Datos de planificación de Educación Primaria incompletos o inválidos.',
          detalles: validacion.errores,
        },
        { status: 400 }
      );
    }

    const documento = await generarDocumentoCurricularCore(validacion.datos);
    const verificacionIntegridad = validarDocumentoCurricularCompleto(documento);

    if (!verificacionIntegridad.valido) {
      throw new Error(
        `Documento curricular incompleto: ${verificacionIntegridad.errores.join(' | ')}`
      );
    }

    return Response.json(
      {
        ok: true,
        success: true,
        documento,
        data: documento,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const debugError =
      error instanceof ErrorAltaDemandaIA && error.debugError
        ? error.debugError
        : error instanceof Error
        ? error.message
        : 'Revisar configuración de claves GEMINI_API_KEY, GROQ_API_KEY y OPENROUTER_API_KEY.';
    const diagnosticoClaves =
      error instanceof ErrorAltaDemandaIA ? error.diagnosticoClaves : undefined;

    return Response.json(
      {
        ok: false,
        success: false,
        status: 503,
        error: MENSAJE_ALTA_DEMANDA_IA_503,
        message: MENSAJE_ALTA_DEMANDA_IA_503,
        debugError,
        diagnosticoClaves,
      },
      { status: 503 }
    );
  }
}
