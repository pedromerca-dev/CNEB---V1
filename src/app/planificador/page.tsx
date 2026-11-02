'use client';

/**
 * @file src/app/planificador/page.tsx
 * @description Planificador Curricular CNEB — Educación Primaria (R.M. N.° 649-2016-MINEDU).
 * Experiencia conversacional natural estilo ChatGPT / Gemini con:
 * - Árbol de Proyectos PCA por ramas (PCA Matriz Maestra -> Unidades 1..8 -> Sesiones 1..N)
 * - Navegación libre desde cualquier rama del árbol con continuidad contextual (Unidad padre + Sesiones previas)
 * - Control de bloqueo de multitarea mientras `isGenerating` es true con Toast de aviso
 * - Pantalla de carga interactiva con recomendaciones CNEB rotando cada 5 segundos
 * - Tono conversacional directo, empático y natural orientado al docente
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  PanelLeft,
  Send,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import {
  AREAS_CURRICULARES_CNEB,
  DocumentoCurricularCNEB,
  ESCENARIOS_PEDAGOGICOS_PERU,
  GRADOS_CNEB,
  ParametrosPlanificacionCNEB,
  SesionSugeridaItem,
} from '../../lib/prompts';
import {
  descargarDocumentoCurricularPDF,
  generarNombreArchivoPorDefectoPDF,
  normalizarNombreArchivoPDF,
} from '../../lib/pdf-generator';
import {
  DOCUMENTO_EJEMPLO_INICIAL_CNEB,
  SESION_2_EJEMPLO_INICIAL_CNEB,
  SESION_EJEMPLO_INICIAL_CNEB,
  UNIDAD_2_EJEMPLO_INICIAL_CNEB,
  UNIDAD_EJEMPLO_INICIAL_CNEB,
} from '../../lib/cneb-initial-data';
import {
  cargarEspacioTrabajo,
  descargarProyectoComoArchivoJSON,
  guardarEspacioTrabajo,
  importarProyectoDesdeJson,
  limpiarEspacioTrabajoActual,
  obtenerOCrearWorkspaceId,
} from '../../lib/workspace-storage';
import {
  EstadoRetroalimentacionObligatoria,
  GOOGLE_FORMS_FEEDBACK_URL,
  TEXTO_AVISO_VERSION_BETA,
  cargarEstadoAvisoBetaDescartado,
  cargarEstadoRetroalimentacionObligatoria,
  confirmarRetroalimentacionEnviada,
  estaGeneracionBloqueadaPorRetroalimentacion,
  guardarEstadoAvisoBetaDescartado,
  registrarAperturaFormularioRetroalimentacion,
  registrarDocumentoCurricularGenerado,
} from '../../lib/feedback-config';
import {
  ConversacionPlanificacion,
  MensajeChatCNEB,
  SidebarArbolProyectos,
  construirArbolDeRamas,
} from './components/SidebarArbolProyectos';
import { TarjetaDocumentoRama } from './components/TarjetaDocumentoRama';
import { ModalEditorCurricular } from './components/ModalEditorCurricular';
import { ModalRetroalimentacionBeta } from './components/ModalRetroalimentacionBeta';
import { ModalRetroalimentacionObligatoria } from './components/ModalRetroalimentacionObligatoria';

const MENSAJE_BLOQUEO_MULTITAREA =
  'Hay una generación en curso. Por favor espera unos segundos a que finalice para cambiar de proyecto o sección.';

const MENSAJE_BLOQUEO_RETROALIMENTACION =
  'Has generado 3 documentos curriculares. Por favor envía tu retroalimentación y pulsa «Ya envié mi retroalimentación» para continuar generando.';

const MENSAJE_ALTA_DEMANDA_503 =
  'Todos los proveedores de IA se encuentran saturados. Por favor, reintenta en unos segundos.';

/**
 * Recomendaciones pedagógicas dinámicas que rotan cada 5 segundos durante la carga (loading)
 */
const RECOMENDACIONES_CNEB_CARGA: string[] = [
  'Tip CNEB: Asegúrate de que las evidencias de aprendizaje respondan a los criterios definidos.',
  'Sugerencia: Para este ciclo se recomienda priorizar el uso de material concreto.',
  'Tip CNEB: Comunica el propósito de la sesión y los criterios de evaluación en un lenguaje claro y cercano para los niños y niñas al inicio de la clase.',
  'Sugerencia: En la retroalimentación por descubrimiento (R.V.M. N.° 094-2020-MINEDU), formula preguntas reflexivas para que el estudiante identifique por sí mismo cómo mejorar su trabajo.',
  'Tip CNEB: Toda Situación Significativa en Primaria parte de un contexto real o cercano a los estudiantes e incluye un reto abierto formulado como pregunta.',
  'Sugerencia: Articula secuencialmente los procesos didácticos del área durante el Inicio, Desarrollo y Cierre junto con los acuerdos de convivencia del aula.',
];

const PARAMETROS_POR_DEFECTO: ParametrosPlanificacionCNEB =
  ESCENARIOS_PEDAGOGICOS_PERU[0]?.datos || {
    tipoDocumento: 'PCA',
    nivel: 'Primaria',
    grado: '5.° de Primaria',
    area: 'Comunicación',
    periodo: 'Año Lectivo 2026 (I al IV Bimestre — 8 Unidades Didácticas)',
    diagnostico:
      'De acuerdo con las actas del SIAGIE y la Evaluación Diagnóstica de Entrada, el 70% de los niños y niñas de 5.° grado localiza información explícita en textos narrativos, pero solo el 36% logra realizar inferencias de causa-efecto y reflexionar críticamente sobre textos expositivos y argumentativos discontinuos.',
    contexto:
      'Estudiantes de 10 a 11 años de la I.E. N.° 1145 República de Colombia en San Juan de Lurigancho (Lima). En los patios escolares y alrededores se observa acumulación de residuos plásticos tras el recreo.',
    institucion: 'I.E. N.° 1145 República de Colombia',
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    docente: 'Lic. María Elena Paredes Rengifo',
    director: 'Dr. Jorge Luis Mendoza Castro',
  };

function formatearGradoCorto(grado: string): string {
  const num = grado.match(/\d+/)?.[0] || '5';
  return `${num}.º Primaria`;
}

function construirTituloProyectoPCA(grado: string, area: string): string {
  return `Proyecto PCA ${formatearGradoCorto(grado)} — ${area}`;
}

function construirConversacionEjemploPorDefecto(): ConversacionPlanificacion {
  return {
    id: 'proyecto-pca-5to-comunicacion-2026',
    tituloSidebar: construirTituloProyectoPCA(
      PARAMETROS_POR_DEFECTO.grado,
      PARAMETROS_POR_DEFECTO.area
    ),
    fechaActualizacion: 'Hoy, 08:38 AM',
    parametrosBase: PARAMETROS_POR_DEFECTO,
    mensajes: [
      {
        id: 'msg-user-init-1',
        rol: 'user',
        contenidoTexto: `Generar Matriz Maestra de Planificación Curricular Anual (PCA) para ${PARAMETROS_POR_DEFECTO.grado} en el área de ${PARAMETROS_POR_DEFECTO.area}.`,
        fecha: 'Hoy, 08:30 AM',
      },
      {
        id: 'msg-assistant-pca-1',
        rol: 'assistant',
        contenidoTexto:
          'Aquí tienes la Matriz Maestra de tu Planificación Curricular Anual (PCA) de Comunicación para 5.° de Primaria, organizada en 8 Unidades Didácticas con sus Sesiones Sugeridas listas para trabajar en el aula.',
        fecha: 'Hoy, 08:31 AM',
        documento: DOCUMENTO_EJEMPLO_INICIAL_CNEB,
        etiquetaRama: 'PCA Anual (Matriz Maestra)',
      },
      {
        id: 'msg-assistant-unidad-1',
        rol: 'assistant',
        contenidoTexto:
          'Aquí tienes la Unidad Didáctica 1 articulada con el diagnóstico de tu aula y tu Matriz PCA. Incluye los propósitos de aprendizaje, criterios de evaluación y la secuencia ordenada de sesiones.',
        fecha: 'Hoy, 08:33 AM',
        documento: UNIDAD_EJEMPLO_INICIAL_CNEB,
        parentDocumentoId: DOCUMENTO_EJEMPLO_INICIAL_CNEB.id,
        etiquetaRama: 'Unidad Didáctica 1',
        unidadNumero: 1,
      },
      {
        id: 'msg-assistant-sesion-1-u1',
        rol: 'assistant',
        contenidoTexto:
          'Aquí tienes la Sesión de Aprendizaje 1 de la Unidad Didáctica 1, estructurada en sus momentos de Inicio, Desarrollo y Cierre con procesos didácticos y criterios de evaluación formativa.',
        fecha: 'Hoy, 08:35 AM',
        documento: SESION_EJEMPLO_INICIAL_CNEB,
        parentDocumentoId: UNIDAD_EJEMPLO_INICIAL_CNEB.id,
        etiquetaRama: 'Sesión 1',
        unidadNumero: 1,
        sesionNumero: 1,
      },
      {
        id: 'msg-assistant-sesion-2-u1',
        rol: 'assistant',
        contenidoTexto:
          'Aquí tienes la Sesión de Aprendizaje 2 de la Unidad Didáctica 1, dando continuidad directa a lo trabajado en la primera sesión para consolidar los aprendizajes del grupo.',
        fecha: 'Hoy, 08:36 AM',
        documento: SESION_2_EJEMPLO_INICIAL_CNEB,
        parentDocumentoId: UNIDAD_EJEMPLO_INICIAL_CNEB.id,
        etiquetaRama: 'Sesión 2',
        unidadNumero: 1,
        sesionNumero: 2,
      },
      {
        id: 'msg-assistant-unidad-2',
        rol: 'assistant',
        contenidoTexto:
          'Aquí tienes la Unidad Didáctica 2 vinculada a tu Matriz Maestra PCA. Puedes continuar generando su Sesión 1 cuando lo necesites.',
        fecha: 'Hoy, 08:38 AM',
        documento: UNIDAD_2_EJEMPLO_INICIAL_CNEB,
        parentDocumentoId: DOCUMENTO_EJEMPLO_INICIAL_CNEB.id,
        etiquetaRama: 'Unidad Didáctica 2',
        unidadNumero: 2,
      },
    ],
    ultimoDocumento: SESION_2_EJEMPLO_INICIAL_CNEB,
  };
}

export default function PlanificadorCurricularPage() {
  // Inicialización aislada por navegador desde localStorage (sin proyectos globales compartidos)
  const [estadoInicialWorkspace] = useState(() => cargarEspacioTrabajo());
  const [workspaceId, setWorkspaceId] = useState<string>(() =>
    estadoInicialWorkspace.workspaceId || obtenerOCrearWorkspaceId()
  );

  // 1. Estado del Sidebar (Escritorio vs Cajón Móvil), Beta y Retroalimentación
  const [sidebarAbierto, setSidebarAbierto] = useState<boolean>(true);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState<boolean>(false);
  const [avisoBetaDescartado, setAvisoBetaDescartado] = useState<boolean>(() =>
    cargarEstadoAvisoBetaDescartado()
  );
  const [modalFeedbackAbierto, setModalFeedbackAbierto] = useState<boolean>(false);
  const [estadoFeedbackObligatorio, setEstadoFeedbackObligatorio] =
    useState<EstadoRetroalimentacionObligatoria>(() =>
      cargarEstadoRetroalimentacionObligatoria()
    );
  const bloqueoRetroalimentacionActivo = estaGeneracionBloqueadaPorRetroalimentacion(
    estadoFeedbackObligatorio
  );
  const [historial, setHistorial] = useState<ConversacionPlanificacion[]>(
    () => estadoInicialWorkspace.historial
  );
  const [conversacionActivaId, setConversacionActivaId] = useState<string | null>(
    () => estadoInicialWorkspace.conversacionActivaId
  );
  const [proyectosExpandidos, setProyectosExpandidos] = useState<Record<string, boolean>>(
    () => estadoInicialWorkspace.proyectosExpandidos
  );
  const [documentoEnfocadoId, setDocumentoEnfocadoId] = useState<string | null>(
    () => estadoInicialWorkspace.documentoEnfocadoId
  );

  // 2. Estado del Formulario Inicial y Parámetros del Proyecto PCA
  const [grado, setGrado] = useState<string>(
    () => estadoInicialWorkspace.parametrosFormulario.grado
  );
  const [area, setArea] = useState<string>(
    () => estadoInicialWorkspace.parametrosFormulario.area
  );
  const [periodo, setPeriodo] = useState<string>(
    () =>
      estadoInicialWorkspace.parametrosFormulario.periodo ||
      'Año Lectivo 2026 (I al IV Bimestre — 8 Unidades Didácticas)'
  );
  const [diagnostico, setDiagnostico] = useState<string>(
    () => estadoInicialWorkspace.parametrosFormulario.diagnostico
  );
  const [contexto, setContexto] = useState<string>(
    () => estadoInicialWorkspace.parametrosFormulario.contexto
  );
  const [institucion, setInstitucion] = useState<string>(
    () =>
      estadoInicialWorkspace.parametrosFormulario.institucion ||
      'I.E. N.° 1145 República de Colombia'
  );
  const [dre, setDre] = useState<string>(
    () => estadoInicialWorkspace.parametrosFormulario.dre || 'DRE Lima Metropolitana'
  );
  const [ugel, setUgel] = useState<string>(
    () =>
      estadoInicialWorkspace.parametrosFormulario.ugel ||
      'UGEL 05 San Juan de Lurigancho'
  );
  const [docente, setDocente] = useState<string>(
    () =>
      estadoInicialWorkspace.parametrosFormulario.docente ||
      'Lic. María Elena Paredes Rengifo'
  );
  const [director, setDirector] = useState<string>(
    () =>
      estadoInicialWorkspace.parametrosFormulario.director ||
      'Dr. Jorge Luis Mendoza Castro'
  );

  // Opción A ('solo_pca') vs Opción B ('proyecto_completo')
  const [modoGeneracionProyecto, setModoGeneracionProyecto] = useState<
    'solo_pca' | 'proyecto_completo'
  >('solo_pca');

  // 3. Estado Conversacional, Carga Interactiva (isGenerating) y Control de Multitarea
  const [promptChatInput, setPromptChatInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progresoLoteTexto, setProgresoLoteTexto] = useState<string | null>(null);
  const [indiceRecomendacionCarga, setIndiceRecomendacionCarga] = useState<number>(0);
  const [alertaMultitarea, setAlertaMultitarea] = useState<string | null>(null);
  const [errorNotificacion, setErrorNotificacion] = useState<string | null>(null);
  const [debugErrorDetalle, setDebugErrorDetalle] = useState<string | null>(null);
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [mostrarAjustesContexto, setMostrarAjustesContexto] = useState<boolean>(false);

  // 4. Estado del Modal de Edición / Descarga PDF
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [pestanaModal, setPestanaModal] = useState<'descargar' | 'formulario' | 'json'>(
    'descargar'
  );
  const [mensajeIdEnModal, setMensajeIdEnModal] = useState<string | null>(null);
  const [documentoBorrador, setDocumentoBorrador] = useState<DocumentoCurricularCNEB | null>(
    null
  );
  const [nombreArchivoPDF, setNombreArchivoPDF] = useState<string>('');
  const [jsonBorrador, setJsonBorrador] = useState<string>('');
  const [errorJsonBorrador, setErrorJsonBorrador] = useState<string | null>(null);
  const [avisoGuardadoExito, setAvisoGuardadoExito] = useState<string | null>(null);
  const [instruccionRegeneracionModal, setInstruccionRegeneracionModal] = useState<string>('');

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);

  // Rotación automática de recomendaciones pedagógicas CNEB cada 5 segundos mientras isGenerating sea true
  useEffect(() => {
    if (!isGenerating) {
      setIndiceRecomendacionCarga(0);
      return;
    }
    const intervalId = setInterval(() => {
      setIndiceRecomendacionCarga((prev) => (prev + 1) % RECOMENDACIONES_CNEB_CARGA.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isGenerating]);

  // Desplazar suavemente hacia la burbuja de carga cuando se inicia una generación
  useEffect(() => {
    if (isGenerating && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isGenerating]);

  // Persistir automáticamente el espacio de trabajo completo en el localStorage de este navegador
  useEffect(() => {
    guardarEspacioTrabajo({
      workspaceId,
      conversacionActivaId,
      documentoEnfocadoId,
      proyectosExpandidos,
      parametrosFormulario: {
        tipoDocumento: 'PCA',
        nivel: 'Primaria',
        grado,
        area,
        periodo,
        diagnostico,
        contexto,
        institucion,
        dre,
        ugel,
        docente,
        director,
      },
      historial,
    });
  }, [
    workspaceId,
    conversacionActivaId,
    documentoEnfocadoId,
    proyectosExpandidos,
    grado,
    area,
    periodo,
    diagnostico,
    contexto,
    institucion,
    dre,
    ugel,
    docente,
    director,
    historial,
  ]);

  const mostrarAvisoBloqueoMultitarea = () => {
    setAlertaMultitarea(MENSAJE_BLOQUEO_MULTITAREA);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setAlertaMultitarea(null);
    }, 4500);
  };

  const mostrarAvisoBloqueoRetroalimentacion = () => {
    setAlertaMultitarea(MENSAJE_BLOQUEO_RETROALIMENTACION);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setAlertaMultitarea(null);
    }, 4500);
  };

  const registrarDocumentoNuevoConControlFeedback = (
    doc: DocumentoCurricularCNEB
  ): boolean => {
    const actualizado = registrarDocumentoCurricularGenerado({
      id: doc.id,
      tipoDocumento: doc.tipoDocumento,
      esNuevoDocumento: true,
    });
    setEstadoFeedbackObligatorio(actualizado);
    return estaGeneracionBloqueadaPorRetroalimentacion(actualizado);
  };

  const handleAbrirFormularioFeedback = () => {
    const actualizado = registrarAperturaFormularioRetroalimentacion();
    setEstadoFeedbackObligatorio(actualizado);
  };

  const handleConfirmarRetroalimentacionObligatoria = () => {
    const actualizado = confirmarRetroalimentacionEnviada();
    setEstadoFeedbackObligatorio(actualizado);
    setAlertaMultitarea(null);
    setAvisoExito(
      'Confirmación registrada localmente. ¡Muchas gracias por ayudarnos a mejorar el Planificador Curricular CNEB!'
    );
    setTimeout(() => setAvisoExito(null), 4500);
  };

  const conversacionActiva =
    historial.find((c) => c.id === conversacionActivaId) || null;

  const arbolProyectoActivo = conversacionActiva
    ? construirArbolDeRamas(conversacionActiva)
    : { pcaPrincipal: null, unidades: [] };

  // Identificar el mensaje/documento actualmente seleccionado en el árbol (Rama Activa)
  const mensajeRamaActiva = conversacionActiva
    ? conversacionActiva.mensajes.find(
        (m) => m.rol === 'assistant' && m.documento?.id === documentoEnfocadoId
      ) ||
      [...conversacionActiva.mensajes]
        .reverse()
        .find((m) => m.rol === 'assistant' && Boolean(m.documento)) ||
      null
    : null;

  const docRamaActiva = mensajeRamaActiva?.documento || null;

  const handleSeleccionarProyecto = (proyectoId: string, docIdOpcional?: string) => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    const conv = historial.find((c) => c.id === proyectoId);
    if (!conv) return;
    setConversacionActivaId(conv.id);
    setProyectosExpandidos((prev) => ({ ...prev, [conv.id]: true }));
    setGrado(conv.parametrosBase.grado);
    setArea(conv.parametrosBase.area);
    setPeriodo(conv.parametrosBase.periodo);
    setDiagnostico(conv.parametrosBase.diagnostico);
    setContexto(conv.parametrosBase.contexto);
    setInstitucion(conv.parametrosBase.institucion || '');
    setDre(conv.parametrosBase.dre || '');
    setUgel(conv.parametrosBase.ugel || '');
    setDocente(conv.parametrosBase.docente || '');
    setDirector(conv.parametrosBase.director || '');
    setErrorNotificacion(null);

    if (docIdOpcional) {
      setDocumentoEnfocadoId(docIdOpcional);
      setTimeout(() => {
        const el = document.getElementById(`doc-card-${docIdOpcional}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    } else if (conv.ultimoDocumento) {
      setDocumentoEnfocadoId(conv.ultimoDocumento.id);
    }
  };

  const handleNavegarARama = (proyectoId: string, documentoId: string) => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    if (conversacionActivaId !== proyectoId) {
      handleSeleccionarProyecto(proyectoId, documentoId);
      return;
    }
    setDocumentoEnfocadoId(documentoId);
    const conv = historial.find((c) => c.id === proyectoId);
    const msg = conv?.mensajes.find((m) => m.documento?.id === documentoId);
    if (msg?.documento) {
      setAvisoExito(
        `Rama activa seleccionada: ${
          msg.etiquetaRama || msg.documento.tituloDocumento
        }. Puedes continuar desde este punto con total continuidad pedagógica.`
      );
      setTimeout(() => setAvisoExito(null), 3500);
    }
    setTimeout(() => {
      const el = document.getElementById(`doc-card-${documentoId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleToggleExpandirProyecto = (proyectoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    setProyectosExpandidos((prev) => ({
      ...prev,
      [proyectoId]: !(prev[proyectoId] ?? true),
    }));
  };

  const handleNuevaPlanificacion = () => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    setConversacionActivaId(null);
    setDocumentoEnfocadoId(null);
    setPromptChatInput('');
    setErrorNotificacion(null);
  };

  const handleEliminarProyecto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    const filtrado = historial.filter((c) => c.id !== id);
    setHistorial(filtrado);
    if (conversacionActivaId === id) {
      const siguiente = filtrado.length > 0 ? filtrado[0] : null;
      setConversacionActivaId(siguiente ? siguiente.id : null);
      setDocumentoEnfocadoId(siguiente?.ultimoDocumento?.id || null);
    }
  };

  /**
   * Actualiza y persiste un parámetro institucional del proyecto activo tanto en el estado
   * del formulario como en `parametrosBase` y `datosInformativos` del proyecto en curso.
   */
  const actualizarParametroProyectoActivo = (
    campo: 'institucion' | 'ugel' | 'docente' | 'dre' | 'director',
    valor: string
  ) => {
    if (campo === 'institucion') setInstitucion(valor);
    if (campo === 'ugel') setUgel(valor);
    if (campo === 'docente') setDocente(valor);
    if (campo === 'dre') setDre(valor);
    if (campo === 'director') setDirector(valor);

    if (!conversacionActivaId) return;

    setHistorial((prev) =>
      prev.map((c) => {
        if (c.id !== conversacionActivaId) return c;
        const nuevosParametros: ParametrosPlanificacionCNEB = {
          ...c.parametrosBase,
          [campo]: valor,
        };
        const mensajesActualizados = c.mensajes.map((m) => {
          if (!m.documento) return m;
          return {
            ...m,
            documento: {
              ...m.documento,
              datosInformativos: {
                ...m.documento.datosInformativos,
                ...(campo === 'institucion' ? { institucionEducativa: valor } : {}),
                ...(campo === 'ugel' ? { ugel: valor } : {}),
                ...(campo === 'docente' ? { docenteResponsable: valor } : {}),
                ...(campo === 'dre' ? { dre: valor } : {}),
                ...(campo === 'director' ? { directorIE: valor } : {}),
              },
            },
          };
        });
        return {
          ...c,
          parametrosBase: nuevosParametros,
          mensajes: mensajesActualizados,
        };
      })
    );
  };

  /**
   * Limpia por completo el espacio de trabajo actual del navegador.
   */
  const handleLimpiarEspacioTrabajo = () => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    const estadoLimpio = limpiarEspacioTrabajoActual();
    setWorkspaceId(estadoLimpio.workspaceId);
    setHistorial(estadoLimpio.historial);
    setConversacionActivaId(estadoLimpio.conversacionActivaId);
    setDocumentoEnfocadoId(estadoLimpio.documentoEnfocadoId);
    setProyectosExpandidos(estadoLimpio.proyectosExpandidos);
    setGrado(estadoLimpio.parametrosFormulario.grado);
    setArea(estadoLimpio.parametrosFormulario.area);
    setPeriodo(
      estadoLimpio.parametrosFormulario.periodo ||
        'Año Lectivo 2026 (I al IV Bimestre — 8 Unidades Didácticas)'
    );
    setDiagnostico(estadoLimpio.parametrosFormulario.diagnostico);
    setContexto(estadoLimpio.parametrosFormulario.contexto);
    setInstitucion(
      estadoLimpio.parametrosFormulario.institucion ||
        'I.E. N.° 1145 República de Colombia'
    );
    setDre(estadoLimpio.parametrosFormulario.dre || 'DRE Lima Metropolitana');
    setUgel(
      estadoLimpio.parametrosFormulario.ugel || 'UGEL 05 San Juan de Lurigancho'
    );
    setDocente(
      estadoLimpio.parametrosFormulario.docente ||
        'Lic. María Elena Paredes Rengifo'
    );
    setDirector(
      estadoLimpio.parametrosFormulario.director ||
        'Dr. Jorge Luis Mendoza Castro'
    );
    setErrorNotificacion(null);
    setDebugErrorDetalle(null);
    setAvisoExito(
      'Espacio de trabajo local limpiado correctamente. Puedes crear un nuevo proyecto PCA o importar un archivo .json.'
    );
    setTimeout(() => setAvisoExito(null), 4000);
  };

  /**
   * Exporta el proyecto indicado (o el activo) a un archivo `.json` descargable.
   */
  const handleExportarProyectoJson = (proyectoId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const idObjetivo = proyectoId || conversacionActivaId;
    const proyecto =
      (idObjetivo ? historial.find((c) => c.id === idObjetivo) : null) ||
      conversacionActiva ||
      historial[0] ||
      null;

    if (!proyecto) {
      setErrorNotificacion('No hay ningún proyecto activo para exportar a JSON.');
      return;
    }

    const { nombreArchivo } = descargarProyectoComoArchivoJSON(proyecto, workspaceId);
    setAvisoExito(`Proyecto exportado exitosamente como "${nombreArchivo}".`);
    setTimeout(() => setAvisoExito(null), 4000);
  };

  /**
   * Importa un proyecto completo desde un archivo `.json` seleccionado por el usuario.
   */
  const handleImportarProyectoJson = async (archivo: File) => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    try {
      const texto = await archivo.text();
      const resultado = importarProyectoDesdeJson(texto, historial);
      if (resultado.valido === false) {
        setErrorNotificacion(resultado.error);
        return;
      }

      const proyectoImportado = resultado.proyecto;
      setHistorial((prev) => {
        const existe = prev.some((c) => c.id === proyectoImportado.id);
        if (existe) {
          return prev.map((c) =>
            c.id === proyectoImportado.id ? proyectoImportado : c
          );
        }
        return [proyectoImportado, ...prev];
      });

      setConversacionActivaId(proyectoImportado.id);
      setProyectosExpandidos((prev) => ({
        ...prev,
        [proyectoImportado.id]: true,
      }));
      setDocumentoEnfocadoId(proyectoImportado.ultimoDocumento?.id || null);

      setGrado(proyectoImportado.parametrosBase.grado);
      setArea(proyectoImportado.parametrosBase.area);
      setPeriodo(proyectoImportado.parametrosBase.periodo);
      setDiagnostico(proyectoImportado.parametrosBase.diagnostico);
      setContexto(proyectoImportado.parametrosBase.contexto);
      setInstitucion(proyectoImportado.parametrosBase.institucion || '');
      setDre(proyectoImportado.parametrosBase.dre || '');
      setUgel(proyectoImportado.parametrosBase.ugel || '');
      setDocente(proyectoImportado.parametrosBase.docente || '');
      setDirector(proyectoImportado.parametrosBase.director || '');
      setErrorNotificacion(null);
      setDebugErrorDetalle(null);

      setAvisoExito(
        resultado.reemplazoExistente
          ? `Proyecto "${proyectoImportado.tituloSidebar}" actualizado desde el archivo JSON.`
          : `Proyecto "${proyectoImportado.tituloSidebar}" importado y restaurado en tu espacio de trabajo.`
      );
      setTimeout(() => setAvisoExito(null), 4500);
    } catch {
      setErrorNotificacion(
        'No se pudo leer el archivo seleccionado. Asegúrate de seleccionar un archivo .json válido.'
      );
    }
  };

  /**
   * Permite cargar bajo demanda un proyecto demostrativo local dentro del espacio
   * de trabajo aislado del navegador si el docente desea explorar un ejemplo.
   */
  const handleCargarProyectoDemostrativo = () => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    const baseDemo = construirConversacionEjemploPorDefecto();
    const demoLocal: ConversacionPlanificacion = {
      ...baseDemo,
      id: `demo-local-${workspaceId}-${Date.now()}`,
      fechaActualizacion: 'Ejemplo demostrativo',
    };
    setHistorial((prev) => [demoLocal, ...prev]);
    setConversacionActivaId(demoLocal.id);
    setProyectosExpandidos((prev) => ({ ...prev, [demoLocal.id]: true }));
    setDocumentoEnfocadoId(demoLocal.ultimoDocumento?.id || null);
    setAvisoExito(
      'Proyecto demostrativo cargado en tu espacio de trabajo local.'
    );
    setTimeout(() => setAvisoExito(null), 3500);
  };

  /**
   * Llamada resiliente al endpoint /api/generar-documento con AbortController
   * y desbloqueo inmediato de `isGenerating` ante errores 503/429.
   */
  const invocarMotorCurricularAPI = async (
    payload: ParametrosPlanificacionCNEB
  ): Promise<DocumentoCurricularCNEB> => {
    const clientAbortController = new AbortController();
    const clientTimeoutId = setTimeout(() => {
      clientAbortController.abort();
    }, 160_000);

    try {
      const response = await fetch('/api/generar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: clientAbortController.signal,
      });

      let result: {
        ok?: boolean;
        success?: boolean;
        documento?: DocumentoCurricularCNEB;
        data?: DocumentoCurricularCNEB;
        error?: string;
        message?: string;
        debugError?: string;
        diagnosticoClaves?: {
          GEMINI: string;
          GROQ: string;
          OPENROUTER: string;
        };
        detalles?: string[];
      };

      try {
        result = await response.json();
      } catch {
        setIsGenerating(false);
        setProgresoLoteTexto(null);
        throw new Error(MENSAJE_ALTA_DEMANDA_503);
      }

      if (result.debugError) {
        setDebugErrorDetalle(result.debugError);
      }

      if (response.status === 503 || response.status === 429) {
        setIsGenerating(false);
        setProgresoLoteTexto(null);
        throw new Error(result.error || result.message || MENSAJE_ALTA_DEMANDA_503);
      }

      const docRecibido = result.documento || result.data;
      if (!response.ok || (!result.ok && !result.success) || !docRecibido) {
        setIsGenerating(false);
        setProgresoLoteTexto(null);
        throw new Error(
          result.error ||
            result.message ||
            result.detalles?.join(' ') ||
            MENSAJE_ALTA_DEMANDA_503
        );
      }

      setDebugErrorDetalle(null);
      return docRecibido;
    } catch (error: unknown) {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.toUpperCase().includes('ABORT'))
      ) {
        throw new Error(MENSAJE_ALTA_DEMANDA_503);
      }
      throw error instanceof Error ? error : new Error(MENSAJE_ALTA_DEMANDA_503);
    } finally {
      clearTimeout(clientTimeoutId);
    }
  };

  /**
   * Construye el contexto pedagógico de continuidad de rama:
   * Incluye los datos de la Matriz PCA, la Unidad Didáctica padre y el listado
   * de las Sesiones previas (1..X-1) de esa Unidad para garantizar coherencia total.
   */
  const construirContextoContinuidadDeRama = (
    conv: ConversacionPlanificacion,
    unidadNum: number,
    sesionNum?: number
  ): {
    pcaDoc?: DocumentoCurricularCNEB;
    unidadExistente?: DocumentoCurricularCNEB;
    itemUnidadEnPCA?: DocumentoCurricularCNEB['secuenciaDidactica'][number];
    sesionesSugeridasContexto?: SesionSugeridaItem[];
    sesionSugeridaActual?: SesionSugeridaItem;
    contextoContinuidadRama: string;
  } => {
    const arbol = construirArbolDeRamas(conv);
    const pcaDoc = arbol.pcaPrincipal?.documento;
    const nodoUnidad = arbol.unidades.find((u) => u.unidadNumero === unidadNum);
    const unidadExistente = nodoUnidad?.documento;

    const itemUnidadEnPCA =
      pcaDoc?.secuenciaDidactica.find((it, idx) => idx + 1 === unidadNum) ||
      pcaDoc?.secuenciaDidactica[0];

    const sesionesSugeridasContexto: SesionSugeridaItem[] | undefined =
      unidadExistente?.secuenciaDidactica.map((s, idx) => ({
        numero: `Sesión ${idx + 1}`,
        titulo: s.titulo,
        proposito: s.proposito || s.actividadesEstrategicas.join(' '),
        duracion: s.duracion || '90 minutos',
      })) || itemUnidadEnPCA?.sesionesSugeridas;

    const sesionSugeridaActual = sesionNum
      ? sesionesSugeridasContexto?.[sesionNum - 1]
      : undefined;

    const bloquesContexto: string[] = [];

    if (pcaDoc) {
      bloquesContexto.push(
        `PROYECTO PCA PRINCIPAL: "${pcaDoc.tituloDocumento}" (${pcaDoc.datosInformativos.gradoYSeccion} - ${pcaDoc.datosInformativos.areaCurricular}).`
      );
    }

    if (unidadExistente) {
      bloquesContexto.push(
        `UNIDAD DIDÁCTICA PADRE (Unidad ${unidadNum}): "${unidadExistente.tituloDocumento}". Reto de la Unidad: ${unidadExistente.situacionSignificativa.retoPedagogico}. Producto integrador: ${unidadExistente.situacionSignificativa.productoIntegrador}.`
      );
    } else if (itemUnidadEnPCA) {
      bloquesContexto.push(
        `UNIDAD DIDÁCTICA PADRE EN MATRIZ PCA (Unidad ${unidadNum}): "${itemUnidadEnPCA.titulo}". Propósito: ${
          itemUnidadEnPCA.proposito || itemUnidadEnPCA.actividadesEstrategicas.join(' ')
        }. Producto previsto: ${itemUnidadEnPCA.productoOEvidencia}.`
      );
    }

    // Si estamos generando una Sesión X, incluir las sesiones previas (1..X-1) ya creadas en el árbol
    if (sesionNum && nodoUnidad && nodoUnidad.sesionesHijas.length > 0) {
      const previas = nodoUnidad.sesionesHijas.filter((s) => s.sesionNumero < sesionNum);
      if (previas.length > 0) {
        const resumenPrevias = previas
          .map(
            (p) =>
              `- Sesión ${p.sesionNumero} ("${p.documento.tituloDocumento}"): Producto/Evidencia trabajada: ${p.documento.situacionSignificativa.productoIntegrador}`
          )
          .join('\n');
        bloquesContexto.push(
          `SESIONES PREVIAS YA DESARROLLADAS EN ESTA UNIDAD ${unidadNum} (mantener progresión didáctica sin repetir actividades):\n${resumenPrevias}`
        );
      }
    }

    // Si hay unidades previas creadas y estamos generando la Unidad N+1
    if (!sesionNum && arbol.unidades.length > 0) {
      const unidadesPrevias = arbol.unidades.filter((u) => u.unidadNumero < unidadNum);
      if (unidadesPrevias.length > 0) {
        const resumenUnidades = unidadesPrevias
          .map((u) => `- Unidad ${u.unidadNumero}: "${u.documento.tituloDocumento}"`)
          .join('\n');
        bloquesContexto.push(
          `UNIDADES DIDÁCTICAS PREVIAS DEL PROYECTO:\n${resumenUnidades}`
        );
      }
    }

    return {
      pcaDoc,
      unidadExistente,
      itemUnidadEnPCA,
      sesionesSugeridasContexto,
      sesionSugeridaActual,
      contextoContinuidadRama: bloquesContexto.join('\n\n'),
    };
  };

  /**
   * Crear un Nuevo Proyecto PCA desde el formulario inicial:
   * - Opción A ('solo_pca'): Genera la Matriz Maestra PCA Anual.
   * - Opción B ('proyecto_completo'): Genera en lote continuo la PCA + Unidades + Sesiones integradas.
   */
  const handleCrearNuevoProyectoPCA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueoRetroalimentacionActivo) {
      mostrarAvisoBloqueoRetroalimentacion();
      return;
    }
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }

    setIsGenerating(true);
    setErrorNotificacion(null);
    setProgresoLoteTexto('Diseñando la Matriz Maestra de tu PCA Anual con las 8 Unidades Didácticas...');

    const payloadBase: ParametrosPlanificacionCNEB = {
      tipoDocumento: 'PCA',
      nivel: 'Primaria',
      grado,
      area,
      periodo,
      diagnostico:
        diagnostico.trim() ||
        'Los estudiantes requieren fortalecer competencias del área mediante actividades retadoras y trabajo colaborativo con materiales del Minedu.',
      contexto:
        contexto.trim() ||
        'Contexto escolar urbano-comunitario con participación activa de las familias y saberes locales.',
      institucion: institucion.trim() || 'I.E. N.° 1145 República de Colombia',
      dre: dre.trim() || 'DRE Lima Metropolitana',
      ugel: ugel.trim() || 'UGEL 05',
      docente: docente.trim() || 'Docente de Aula de Educación Primaria',
      director: director.trim() || 'Director(a) de la I.E.',
      modoLoteRapido: modoGeneracionProyecto === 'proyecto_completo',
    };

    try {
      const docPCA = await invocarMotorCurricularAPI(payloadBase);
      const nuevoProyectoId = `proj-pca-${Date.now()}`;
      const horaActual = new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const msgUsuario: MensajeChatCNEB = {
        id: `msg-u-${Date.now()}`,
        rol: 'user',
        contenidoTexto:
          modoGeneracionProyecto === 'proyecto_completo'
            ? `Generar Proyecto Completo en 1 Clic (PCA Matriz Maestra + Unidades + Sesiones integradas) para ${grado} en el área de ${area}.`
            : `Generar Matriz Maestra de Planificación Curricular Anual (PCA) para ${grado} en el área de ${area}.`,
        fecha: `Hoy, ${horaActual}`,
      };

      const msgPCA: MensajeChatCNEB = {
        id: `msg-a-pca-${Date.now() + 1}`,
        rol: 'assistant',
        contenidoTexto: `Aquí tienes la Matriz Maestra de tu Planificación Curricular Anual (PCA) de ${area} para ${grado}, con el catálogo completo de las 8 Unidades Didácticas y sus Sesiones Sugeridas.`,
        fecha: `Hoy, ${horaActual}`,
        documento: docPCA,
        etiquetaRama: 'PCA Anual (Matriz Maestra)',
      };

      const mensajesAcumulados: MensajeChatCNEB[] = [msgUsuario, msgPCA];
      let ultimoDocGenerado: DocumentoCurricularCNEB = docPCA;

      const nuevaConvInicial: ConversacionPlanificacion = {
        id: nuevoProyectoId,
        tituloSidebar: construirTituloProyectoPCA(grado, area),
        fechaActualizacion: `Hoy, ${horaActual}`,
        parametrosBase: payloadBase,
        mensajes: mensajesAcumulados,
        ultimoDocumento: ultimoDocGenerado,
      };

      setHistorial((prev) => [nuevaConvInicial, ...prev]);
      setConversacionActivaId(nuevoProyectoId);
      setProyectosExpandidos((prev) => ({ ...prev, [nuevoProyectoId]: true }));
      setDocumentoEnfocadoId(docPCA.id);

      const bloqueadoTrasPCA = registrarDocumentoNuevoConControlFeedback(docPCA);
      if (bloqueadoTrasPCA) {
        return;
      }

      // Si eligió Opción B ("Generar Proyecto Completo en 1 Clic"), generar en lote continuo las Unidades y Sesiones
      if (modoGeneracionProyecto === 'proyecto_completo') {
        const unidadesCatalogo = docPCA.secuenciaDidactica.slice(0, 8);

        for (let i = 0; i < unidadesCatalogo.length; i++) {
          const itemU = unidadesCatalogo[i];
          const numU = i + 1;
          setProgresoLoteTexto(
            `Estructurando Unidad Didáctica ${numU} de ${unidadesCatalogo.length}: "${itemU.titulo}"...`
          );

          const docUnidad = await invocarMotorCurricularAPI({
            ...payloadBase,
            tipoDocumento: 'UNIDAD',
            unidadNumero: numU,
            periodo: `${itemU.faseOMomento || 'Bimestre'} — Unidad Didáctica ${numU} (${itemU.duracion})`,
            sesionesSugeridasContexto: itemU.sesionesSugeridas,
            modoLoteRapido: true,
            tituloPersonalizado: `Unidad Didáctica N.° ${numU}: ${itemU.titulo} — Propósito: ${
              itemU.proposito || itemU.actividadesEstrategicas.join(' ')
            }`,
          });

          const docUnidadConRama: DocumentoCurricularCNEB = {
            ...docUnidad,
            unidadNumero: numU,
          };

          const msgUnidad: MensajeChatCNEB = {
            id: `msg-a-u${numU}-${Date.now()}`,
            rol: 'assistant',
            contenidoTexto: `Aquí tienes la Unidad Didáctica ${numU} (${docUnidadConRama.tituloDocumento}), alineada con tu Matriz PCA.`,
            fecha: `Hoy, ${horaActual}`,
            documento: docUnidadConRama,
            parentDocumentoId: docPCA.id,
            etiquetaRama: `Unidad Didáctica ${numU}`,
            unidadNumero: numU,
          };

          mensajesAcumulados.push(msgUnidad);
          ultimoDocGenerado = docUnidadConRama;

          setHistorial((prev) =>
            prev.map((c) =>
              c.id === nuevoProyectoId
                ? {
                    ...c,
                    mensajes: [...mensajesAcumulados],
                    ultimoDocumento: ultimoDocGenerado,
                  }
                : c
            )
          );
          setDocumentoEnfocadoId(docUnidadConRama.id);

          const bloqueadoTrasUnidad = registrarDocumentoNuevoConControlFeedback(docUnidadConRama);
          if (bloqueadoTrasUnidad) {
            return;
          }

          // Generar Sesiones iniciales para las primeras Unidades del lote
          if (numU <= 2) {
            const sesionesParaLote = (itemU.sesionesSugeridas || []).slice(0, 2);
            for (let sIdx = 0; sIdx < sesionesParaLote.length; sIdx++) {
              const itemS = sesionesParaLote[sIdx];
              const numS = sIdx + 1;
              setProgresoLoteTexto(
                `Desarrollando Sesión ${numS} de la Unidad Didáctica ${numU}: "${itemS.titulo}"...`
              );

              const docSesion = await invocarMotorCurricularAPI({
                ...payloadBase,
                tipoDocumento: 'SESION',
                unidadNumero: numU,
                sesionNumero: numS,
                periodo: `Unidad ${numU} — Sesión ${numS} (${itemS.duracion || '90 minutos'})`,
                modoLoteRapido: true,
                tituloPersonalizado: `Sesión de Aprendizaje N.° ${numS} (Unidad ${numU}): ${itemS.titulo} — Propósito: ${itemS.proposito}`,
              });

              const docSesionConRama: DocumentoCurricularCNEB = {
                ...docSesion,
                unidadNumero: numU,
                sesionNumero: numS,
              };

              const msgSesion: MensajeChatCNEB = {
                id: `msg-a-u${numU}-s${numS}-${Date.now()}`,
                rol: 'assistant',
                contenidoTexto: `Aquí tienes la Sesión de Aprendizaje ${numS} de la Unidad Didáctica ${numU}, lista con su secuencia de Inicio, Desarrollo y Cierre.`,
                fecha: `Hoy, ${horaActual}`,
                documento: docSesionConRama,
                parentDocumentoId: docUnidadConRama.id,
                etiquetaRama: `Sesión ${numS}`,
                unidadNumero: numU,
                sesionNumero: numS,
              };

              mensajesAcumulados.push(msgSesion);
              ultimoDocGenerado = docSesionConRama;

              setHistorial((prev) =>
                prev.map((c) =>
                  c.id === nuevoProyectoId
                    ? {
                        ...c,
                        mensajes: [...mensajesAcumulados],
                        ultimoDocumento: ultimoDocGenerado,
                      }
                    : c
                )
              );
              setDocumentoEnfocadoId(docSesionConRama.id);

              const bloqueadoTrasSesion = registrarDocumentoNuevoConControlFeedback(docSesionConRama);
              if (bloqueadoTrasSesion) {
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      setErrorNotificacion(
        err instanceof Error ? err.message : MENSAJE_ALTA_DEMANDA_503
      );
    } finally {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
    }
  };

  /**
   * Generar o Regenerar in-place una Unidad Didáctica específica (1 a 8)
   * usando la Matriz Maestra PCA y el contexto de unidades previas.
   */
  const handleGenerarORegenerarUnidad = async (
    unidadNumero: number,
    instruccionOpcional?: string
  ): Promise<boolean> => {
    if (!conversacionActiva) return false;
    if (bloqueoRetroalimentacionActivo) {
      mostrarAvisoBloqueoRetroalimentacion();
      return false;
    }
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return false;
    }

    setIsGenerating(true);
    setErrorNotificacion(null);
    setProgresoLoteTexto(
      `Desarrollando la Unidad Didáctica ${unidadNumero} con sus propósitos de aprendizaje y secuencia de sesiones...`
    );

    const { pcaDoc, unidadExistente, itemUnidadEnPCA, contextoContinuidadRama } =
      construirContextoContinuidadDeRama(conversacionActiva, unidadNumero);

    const esRegeneracion = Boolean(unidadExistente);
    const horaActual = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const msgUsuarioId = `msg-u-${Date.now()}`;
    const msgUsuario: MensajeChatCNEB = {
      id: msgUsuarioId,
      rol: 'user',
      contenidoTexto: esRegeneracion
        ? `Actualizar la Unidad Didáctica ${unidadNumero}${
            instruccionOpcional ? `: "${instruccionOpcional}"` : ''
          }.`
        : `Generar la Unidad Didáctica ${unidadNumero}${
            itemUnidadEnPCA ? ` ("${itemUnidadEnPCA.titulo}")` : ''
          } a partir de la Matriz Maestra PCA.`,
      fecha: `Hoy, ${horaActual}`,
    };

    setHistorial((prev) =>
      prev.map((c) =>
        c.id === conversacionActiva.id
          ? { ...c, mensajes: [...c.mensajes, msgUsuario] }
          : c
      )
    );

    try {
      const payloadDerivado: ParametrosPlanificacionCNEB = {
        ...conversacionActiva.parametrosBase,
        tipoDocumento: 'UNIDAD',
        unidadNumero,
        periodo: itemUnidadEnPCA
          ? `${itemUnidadEnPCA.faseOMomento} — Unidad Didáctica ${unidadNumero} (${itemUnidadEnPCA.duracion})`
          : `Unidad Didáctica ${unidadNumero} (4 a 5 semanas)`,
        sesionesSugeridasContexto: itemUnidadEnPCA?.sesionesSugeridas,
        contextoContinuidadRama,
        instruccionRegeneracion: esRegeneracion
          ? instruccionOpcional ||
            `Actualizar y profundizar la Unidad Didáctica ${unidadNumero} manteniendo coherencia con la PCA.`
          : undefined,
        tituloPersonalizado: itemUnidadEnPCA
          ? `Unidad Didáctica N.° ${unidadNumero}: ${itemUnidadEnPCA.titulo}. Propósito: ${
              itemUnidadEnPCA.proposito || itemUnidadEnPCA.actividadesEstrategicas.join(' ')
            }. Producto integrador: ${itemUnidadEnPCA.productoOEvidencia}. ${
              instruccionOpcional || ''
            }`
          : `Unidad Didáctica N.° ${unidadNumero}. ${instruccionOpcional || ''}`,
      };

      const nuevoDoc = await invocarMotorCurricularAPI(payloadDerivado);
      const docFinal: DocumentoCurricularCNEB = {
        ...nuevoDoc,
        id: unidadExistente ? unidadExistente.id : nuevoDoc.id,
        unidadNumero,
      };

      setHistorial((prev) =>
        prev.map((c) => {
          if (c.id !== conversacionActiva.id) return c;

          if (esRegeneracion && unidadExistente) {
            const mensajesActualizados = c.mensajes.map((m) =>
              m.documento?.id === unidadExistente.id
                ? {
                    ...m,
                    contenidoTexto: `Aquí tienes la Unidad Didáctica ${unidadNumero} actualizada con los ajustes solicitados.`,
                    fecha: `Hoy, ${horaActual}`,
                    documento: docFinal,
                  }
                : m
            );
            return {
              ...c,
              fechaActualizacion: `Hoy, ${horaActual}`,
              mensajes: mensajesActualizados,
              ultimoDocumento: docFinal,
            };
          } else {
            const nuevoMsgAsistente: MensajeChatCNEB = {
              id: `msg-a-u${unidadNumero}-${Date.now()}`,
              rol: 'assistant',
              contenidoTexto: `Aquí tienes la Unidad Didáctica ${unidadNumero} articulada con tu Proyecto PCA. Cuando gustes, puedes continuar generando la Sesión 1 de esta unidad.`,
              fecha: `Hoy, ${horaActual}`,
              documento: docFinal,
              parentDocumentoId: pcaDoc?.id,
              etiquetaRama: `Unidad Didáctica ${unidadNumero}`,
              unidadNumero,
            };
            return {
              ...c,
              fechaActualizacion: `Hoy, ${horaActual}`,
              mensajes: [...c.mensajes, nuevoMsgAsistente],
              ultimoDocumento: docFinal,
            };
          }
        })
      );

      setDocumentoEnfocadoId(docFinal.id);
      if (!esRegeneracion) {
        registrarDocumentoNuevoConControlFeedback(docFinal);
      }
      setTimeout(() => {
        const el = document.getElementById(`doc-card-${docFinal.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return true;
    } catch (err) {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
      setHistorial((prev) =>
        prev.map((c) =>
          c.id === conversacionActiva.id
            ? { ...c, mensajes: c.mensajes.filter((m) => m.id !== msgUsuarioId) }
            : c
        )
      );
      const msgError =
        err instanceof Error ? err.message : MENSAJE_ALTA_DEMANDA_503;
      setErrorNotificacion(msgError);
      return false;
    } finally {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
    }
  };

  /**
   * Generar o Regenerar in-place una Sesión de Aprendizaje X perteneciente a la Unidad N,
   * inyectando el contexto de la Unidad padre y las Sesiones previas (1..X-1).
   */
  const handleGenerarORegenerarSesion = async (
    unidadNumero: number,
    sesionNumero: number,
    instruccionOpcional?: string
  ): Promise<boolean> => {
    if (!conversacionActiva) return false;
    if (bloqueoRetroalimentacionActivo) {
      mostrarAvisoBloqueoRetroalimentacion();
      return false;
    }
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return false;
    }

    setIsGenerating(true);
    setErrorNotificacion(null);
    setProgresoLoteTexto(
      `Diseñando la Sesión de Aprendizaje ${sesionNumero} (Unidad ${unidadNumero}) con momentos de Inicio, Desarrollo y Cierre...`
    );

    const arbol = construirArbolDeRamas(conversacionActiva);
    const nodoUnidad = arbol.unidades.find((u) => u.unidadNumero === unidadNumero);
    const sesionExistente = nodoUnidad?.sesionesHijas.find(
      (s) => s.sesionNumero === sesionNumero
    )?.documento;

    const {
      pcaDoc,
      unidadExistente,
      itemUnidadEnPCA,
      sesionSugeridaActual,
      contextoContinuidadRama,
    } = construirContextoContinuidadDeRama(conversacionActiva, unidadNumero, sesionNumero);

    const esRegeneracion = Boolean(sesionExistente);
    const horaActual = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const msgUsuarioId = `msg-u-${Date.now()}`;
    const msgUsuario: MensajeChatCNEB = {
      id: msgUsuarioId,
      rol: 'user',
      contenidoTexto: esRegeneracion
        ? `Actualizar la Sesión ${sesionNumero} de la Unidad Didáctica ${unidadNumero}${
            instruccionOpcional ? `: "${instruccionOpcional}"` : ''
          }.`
        : `Generar la Sesión de Aprendizaje ${sesionNumero}${
            sesionSugeridaActual ? ` ("${sesionSugeridaActual.titulo}")` : ''
          } de la Unidad Didáctica ${unidadNumero}.`,
      fecha: `Hoy, ${horaActual}`,
    };

    setHistorial((prev) =>
      prev.map((c) =>
        c.id === conversacionActiva.id
          ? { ...c, mensajes: [...c.mensajes, msgUsuario] }
          : c
      )
    );

    try {
      const payloadDerivado: ParametrosPlanificacionCNEB = {
        ...conversacionActiva.parametrosBase,
        tipoDocumento: 'SESION',
        unidadNumero,
        sesionNumero,
        periodo: `Unidad ${unidadNumero} — Sesión ${sesionNumero} (${
          sesionSugeridaActual?.duracion || '90 minutos'
        })`,
        contextoContinuidadRama,
        instruccionRegeneracion: esRegeneracion
          ? instruccionOpcional ||
            `Reajustar la Sesión ${sesionNumero} de la Unidad ${unidadNumero} fortaleciendo los procesos didácticos.`
          : undefined,
        tituloPersonalizado: `Sesión de Aprendizaje N.° ${sesionNumero} de la Unidad Didáctica ${unidadNumero} ("${
          unidadExistente?.tituloDocumento || itemUnidadEnPCA?.titulo || `Unidad ${unidadNumero}`
        }"). ${
          sesionSugeridaActual
            ? `Título sugerido en catálogo: "${sesionSugeridaActual.titulo}". Propósito específico de la sesión: "${sesionSugeridaActual.proposito}". Duración: ${sesionSugeridaActual.duracion}.`
            : ''
        } ${instruccionOpcional || ''}`,
      };

      const nuevoDoc = await invocarMotorCurricularAPI(payloadDerivado);
      const parentId = unidadExistente?.id || pcaDoc?.id;
      const docFinal: DocumentoCurricularCNEB = {
        ...nuevoDoc,
        id: sesionExistente ? sesionExistente.id : nuevoDoc.id,
        unidadNumero,
        sesionNumero,
      };

      setHistorial((prev) =>
        prev.map((c) => {
          if (c.id !== conversacionActiva.id) return c;

          if (esRegeneracion && sesionExistente) {
            const mensajesActualizados = c.mensajes.map((m) =>
              m.documento?.id === sesionExistente.id
                ? {
                    ...m,
                    contenidoTexto: `Aquí tienes la Sesión ${sesionNumero} de la Unidad Didáctica ${unidadNumero} actualizada según tus indicaciones.`,
                    fecha: `Hoy, ${horaActual}`,
                    documento: docFinal,
                  }
                : m
            );
            return {
              ...c,
              fechaActualizacion: `Hoy, ${horaActual}`,
              mensajes: mensajesActualizados,
              ultimoDocumento: docFinal,
            };
          } else {
            const nuevoMsgAsistente: MensajeChatCNEB = {
              id: `msg-a-u${unidadNumero}-s${sesionNumero}-${Date.now()}`,
              rol: 'assistant',
              contenidoTexto: `Aquí tienes la Sesión de Aprendizaje ${sesionNumero} de la Unidad Didáctica ${unidadNumero}, articulada con la unidad y las sesiones previas de tu programación.`,
              fecha: `Hoy, ${horaActual}`,
              documento: docFinal,
              parentDocumentoId: parentId,
              etiquetaRama: `Sesión ${sesionNumero}`,
              unidadNumero,
              sesionNumero,
            };
            return {
              ...c,
              fechaActualizacion: `Hoy, ${horaActual}`,
              mensajes: [...c.mensajes, nuevoMsgAsistente],
              ultimoDocumento: docFinal,
            };
          }
        })
      );

      setDocumentoEnfocadoId(docFinal.id);
      if (!esRegeneracion) {
        registrarDocumentoNuevoConControlFeedback(docFinal);
      }
      setTimeout(() => {
        const el = document.getElementById(`doc-card-${docFinal.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return true;
    } catch (err) {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
      setHistorial((prev) =>
        prev.map((c) =>
          c.id === conversacionActiva.id
            ? { ...c, mensajes: c.mensajes.filter((m) => m.id !== msgUsuarioId) }
            : c
        )
      );
      const msgError =
        err instanceof Error ? err.message : MENSAJE_ALTA_DEMANDA_503;
      setErrorNotificacion(msgError);
      return false;
    } finally {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
    }
  };

  /**
   * Regenerar in-place cualquier documento (PCA, Unidad o Sesión) desde su tarjeta o modal.
   */
  const handleRegenerarDocumentoActual = async (
    mensajeId: string,
    docActual: DocumentoCurricularCNEB,
    instruccion: string
  ): Promise<boolean> => {
    if (!conversacionActiva) return false;
    if (bloqueoRetroalimentacionActivo) {
      mostrarAvisoBloqueoRetroalimentacion();
      return false;
    }
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return false;
    }

    if (docActual.tipoDocumento === 'UNIDAD') {
      return await handleGenerarORegenerarUnidad(docActual.unidadNumero || 1, instruccion);
    }

    if (docActual.tipoDocumento === 'SESION') {
      return await handleGenerarORegenerarSesion(
        docActual.unidadNumero || 1,
        docActual.sesionNumero || 1,
        instruccion
      );
    }

    // Regenerar PCA Matriz Maestra in-place
    setIsGenerating(true);
    setErrorNotificacion(null);
    setProgresoLoteTexto('Actualizando la Matriz Maestra de tu PCA Anual...');
    const horaActual = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const nuevoPCA = await invocarMotorCurricularAPI({
        ...conversacionActiva.parametrosBase,
        tipoDocumento: 'PCA',
        instruccionRegeneracion: instruccion,
      });

      const docFinal: DocumentoCurricularCNEB = {
        ...nuevoPCA,
        id: docActual.id,
      };

      setHistorial((prev) =>
        prev.map((c) => {
          if (c.id !== conversacionActiva.id) return c;
          return {
            ...c,
            fechaActualizacion: `Hoy, ${horaActual}`,
            ultimoDocumento: docFinal,
            mensajes: c.mensajes.map((m) =>
              m.id === mensajeId
                ? {
                    ...m,
                    contenidoTexto:
                      'Aquí tienes la Matriz Maestra de tu PCA Anual actualizada y sincronizada con los ajustes indicados.',
                    fecha: `Hoy, ${horaActual}`,
                    documento: docFinal,
                  }
                : m
            ),
          };
        })
      );
      return true;
    } catch (err) {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
      setErrorNotificacion(
        err instanceof Error ? err.message : MENSAJE_ALTA_DEMANDA_503
      );
      return false;
    } finally {
      setIsGenerating(false);
      setProgresoLoteTexto(null);
    }
  };

  /**
   * Enviar mensaje en el chat inferior tomando como punto de partida la Rama Activa seleccionada
   * en el Sidebar Tree View.
   * Si la API devuelve 503, `isGenerating` pasa a false y se conserva el texto para poder volver a presionar "Enviar".
   */
  const handleEnviarMensajeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueoRetroalimentacionActivo) {
      mostrarAvisoBloqueoRetroalimentacion();
      return;
    }
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    if (!conversacionActiva) return;

    const instruccion = promptChatInput.trim();

    // Determinar la Unidad y Sesión de contexto según la Rama Activa seleccionada en el Árbol
    const unidadContextoRamaActiva =
      docRamaActiva?.unidadNumero ??
      mensajeRamaActiva?.unidadNumero ??
      conversacionActiva.ultimoDocumento?.unidadNumero ??
      1;

    const sesionContextoRamaActiva =
      docRamaActiva?.sesionNumero ??
      mensajeRamaActiva?.sesionNumero ??
      1;

    // Si el docente presiona "Enviar" sin texto escrito, ejecutar continuación directa de la rama activa
    if (!instruccion) {
      if (docRamaActiva?.tipoDocumento === 'SESION') {
        await handleGenerarORegenerarSesion(
          unidadContextoRamaActiva,
          sesionContextoRamaActiva + 1
        );
      } else if (docRamaActiva?.tipoDocumento === 'UNIDAD') {
        await handleGenerarORegenerarSesion(unidadContextoRamaActiva, 1);
      } else {
        await handleGenerarORegenerarUnidad(1);
      }
      return;
    }

    const matchUnidad = instruccion.match(/unidad\s*(?:did[aá]ctica)?\s*(\d+)/i);
    const matchSesion = instruccion.match(/sesi[oó]n\s*(?:de\s*aprendizaje)?\s*(\d+)/i);
    const pideSiguienteSesion = /siguiente\s+sesi[oó]n/i.test(instruccion);
    const pideSiguienteUnidad = /siguiente\s+unidad/i.test(instruccion);

    let exito = false;

    if (pideSiguienteSesion) {
      const numU = matchUnidad
        ? Math.min(8, Math.max(1, parseInt(matchUnidad[1], 10)))
        : unidadContextoRamaActiva;
      const numS =
        docRamaActiva?.tipoDocumento === 'SESION' ? sesionContextoRamaActiva + 1 : 1;
      exito = await handleGenerarORegenerarSesion(numU, numS, instruccion);
    } else if (pideSiguienteUnidad) {
      const numU = Math.min(8, unidadContextoRamaActiva + 1);
      exito = await handleGenerarORegenerarUnidad(numU, instruccion);
    } else if (matchSesion) {
      const numS = Math.max(1, parseInt(matchSesion[1], 10));
      const numU = matchUnidad
        ? Math.min(8, Math.max(1, parseInt(matchUnidad[1], 10)))
        : unidadContextoRamaActiva;
      exito = await handleGenerarORegenerarSesion(numU, numS, instruccion);
    } else if (matchUnidad) {
      const numU = Math.min(8, Math.max(1, parseInt(matchUnidad[1], 10)));
      exito = await handleGenerarORegenerarUnidad(numU, instruccion);
    } else if (mensajeRamaActiva && docRamaActiva) {
      // Si es una instrucción de ajuste sobre el documento actualmente enfocado en el árbol
      exito = await handleRegenerarDocumentoActual(
        mensajeRamaActiva.id,
        docRamaActiva,
        instruccion
      );
    }

    if (exito) {
      setPromptChatInput('');
    }
  };

  /**
   * Abrir modal de edición o descarga PDF
   */
  const abrirModalDocumento = (
    mensajeId: string,
    doc: DocumentoCurricularCNEB,
    modoInicial: 'descargar' | 'formulario' | 'json'
  ) => {
    if (isGenerating) {
      mostrarAvisoBloqueoMultitarea();
      return;
    }
    const copiaDoc = JSON.parse(JSON.stringify(doc)) as DocumentoCurricularCNEB;
    setMensajeIdEnModal(mensajeId);
    setDocumentoBorrador(copiaDoc);
    setNombreArchivoPDF(generarNombreArchivoPorDefectoPDF(copiaDoc));
    setJsonBorrador(JSON.stringify(copiaDoc, null, 2));
    setErrorJsonBorrador(null);
    setAvisoGuardadoExito(null);
    setInstruccionRegeneracionModal('');
    setPestanaModal(modoInicial);
    setModalAbierto(true);
  };

  /**
   * Guardar edición manual del modal y sincronizar datos institucionales en todas las ramas
   */
  const handleGuardarCambiosModal = (): DocumentoCurricularCNEB | null => {
    if (!documentoBorrador || !mensajeIdEnModal || !conversacionActivaId) return null;

    let docFinal = documentoBorrador;
    if (pestanaModal === 'json') {
      try {
        docFinal = JSON.parse(jsonBorrador) as DocumentoCurricularCNEB;
        setErrorJsonBorrador(null);
        setDocumentoBorrador(docFinal);
      } catch (e) {
        setErrorJsonBorrador(
          e instanceof Error ? e.message : 'El formato JSON ingresado no es válido.'
        );
        return null;
      }
    }

    setHistorial((prev) =>
      prev.map((c) => {
        if (c.id !== conversacionActivaId) return c;
        const mensajesSincronizados = c.mensajes.map((m) => {
          if (m.id === mensajeIdEnModal) {
            return { ...m, documento: docFinal };
          }
          if (m.documento) {
            return {
              ...m,
              documento: {
                ...m.documento,
                datosInformativos: {
                  ...m.documento.datosInformativos,
                  institucionEducativa: docFinal.datosInformativos.institucionEducativa,
                  dre: docFinal.datosInformativos.dre,
                  ugel: docFinal.datosInformativos.ugel,
                  docenteResponsable: docFinal.datosInformativos.docenteResponsable,
                  directorIE: docFinal.datosInformativos.directorIE,
                },
              },
            };
          }
          return m;
        });

        return {
          ...c,
          mensajes: mensajesSincronizados,
          ultimoDocumento:
            c.ultimoDocumento?.id === docFinal.id ? docFinal : c.ultimoDocumento,
        };
      })
    );

    setJsonBorrador(JSON.stringify(docFinal, null, 2));
    setAvisoGuardadoExito('Cambios guardados y sincronizados en las ramas del proyecto.');
    setTimeout(() => setAvisoGuardadoExito(null), 3000);
    return docFinal;
  };

  const handleConfirmarExportacionPDF = () => {
    const docActualizado = handleGuardarCambiosModal() || documentoBorrador;
    if (!docActualizado) return;
    const nombreLimpio = normalizarNombreArchivoPDF(nombreArchivoPDF, docActualizado);
    descargarDocumentoCurricularPDF(docActualizado, undefined, nombreLimpio);
    setModalAbierto(false);
  };

  const handleRegenerarEnMismaRamaModal = async () => {
    if (!documentoBorrador || !mensajeIdEnModal) return;
    const instruccion =
      instruccionRegeneracionModal.trim() ||
      'Profundizar las estrategias didácticas y criterios de evaluación manteniendo la coherencia del proyecto.';
    setModalAbierto(false);
    await handleRegenerarDocumentoActual(mensajeIdEnModal, documentoBorrador, instruccion);
  };

  // Calcular etiquetas de continuidad rápida para la barra inferior según la Rama Activa seleccionada
  const unidadActivaBarra =
    docRamaActiva?.unidadNumero ?? mensajeRamaActiva?.unidadNumero ?? 1;
  const sesionActivaBarra =
    docRamaActiva?.sesionNumero ?? mensajeRamaActiva?.sesionNumero ?? 1;

  const recomendacionActual =
    RECOMENDACIONES_CNEB_CARGA[indiceRecomendacionCarga % RECOMENDACIONES_CNEB_CARGA.length];

  return (
    <div className="h-screen w-full flex bg-white text-slate-900 overflow-hidden font-sans relative">
      {/* Selector oculto de archivo .json para importar proyectos en cualquier vista */}
      <input
        ref={mainFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) {
            handleImportarProyectoJson(file);
          }
        }}
        className="hidden"
      />

      {/* TOAST FLOTANTE DE CONTROL DE BLOQUEO Y AVISO DE MULTITAREA */}
      {alertaMultitarea && (
        <div
          role="alert"
          className="fixed top-16 right-6 z-50 max-w-md bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 text-xs animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">{alertaMultitarea}</div>
          <button
            type="button"
            onClick={() => setAlertaMultitarea(null)}
            className="text-slate-300 hover:text-white font-semibold shrink-0 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* SIDEBAR IZQUIERDO: ÁRBOL DESPLEGABLE DE PROYECTOS PCA (TREE VIEW EN ESCRITORIO Y CAJÓN EN MÓVIL) */}
      <SidebarArbolProyectos
        abierto={sidebarAbierto}
        abiertoMovil={sidebarMovilAbierto}
        onCerrarMovil={() => setSidebarMovilAbierto(false)}
        workspaceId={workspaceId}
        historial={historial}
        conversacionActivaId={conversacionActivaId}
        proyectosExpandidos={proyectosExpandidos}
        documentoEnfocadoId={documentoEnfocadoId}
        isGenerating={isGenerating}
        onIntentoAccionDuranteCarga={mostrarAvisoBloqueoMultitarea}
        onNuevaPlanificacion={handleNuevaPlanificacion}
        onSeleccionarProyecto={handleSeleccionarProyecto}
        onToggleExpandirProyecto={handleToggleExpandirProyecto}
        onNavegarARama={handleNavegarARama}
        onEliminarProyecto={handleEliminarProyecto}
        onExportarProyectoJson={(proyecto, e) => handleExportarProyectoJson(proyecto.id, e)}
        onSolicitarImportarJson={() => mainFileInputRef.current?.click()}
        onLimpiarEspacioTrabajo={handleLimpiarEspacioTrabajo}
        onAbrirRetroalimentacion={handleAbrirFormularioFeedback}
      />

      {/* ÁREA PRINCIPAL CONVERSACIONAL */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-full bg-white">
        {/* TOPBAR INSTITUCIONAL RESPONSIVE */}
        <header className="min-h-14 border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0 bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {/* Botón para abrir/cerrar cajón del árbol en móvil (<768px) */}
            <button
              type="button"
              onClick={() => setSidebarMovilAbierto((prev) => !prev)}
              aria-expanded={sidebarMovilAbierto}
              className="md:hidden min-h-[38px] px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Abrir o cerrar el árbol de proyectos PCA"
            >
              <PanelLeft className="w-4 h-4 text-[#991B1B]" />
              <span>Árbol</span>
            </button>

            {/* Botón para ocultar/mostrar panel lateral en escritorio (>=768px) */}
            <button
              type="button"
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className="hidden md:inline-flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={sidebarAbierto ? 'Ocultar árbol de proyectos' : 'Mostrar árbol de proyectos'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#991B1B] text-white tracking-wide shrink-0">
                MINEDU · CNEB
              </span>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shrink-0"
                title="Versión Beta en fase de prueba y mejora continua"
              >
                BETA
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-editorial">
                {conversacionActiva
                  ? conversacionActiva.tituloSidebar
                  : 'Planificador Curricular CNEB — Educación Primaria'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={GOOGLE_FORMS_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAbrirFormularioFeedback}
              className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Enviar retroalimentación sobre los documentos generados o el funcionamiento de la herramienta (se abre en una nueva pestaña)"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
              <span className="hidden lg:inline">Enviar retroalimentación</span>
              <span className="hidden sm:inline lg:hidden">Retroalimentación</span>
            </a>

            {conversacionActiva && (
              <>
                <button
                  type="button"
                  onClick={(e) => handleExportarProyectoJson(conversacionActiva.id, e)}
                  className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Exportar este proyecto completo (PCA, Unidades y Sesiones) a un archivo .json"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="hidden md:inline">Exportar .json</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarAjustesContexto(!mostrarAjustesContexto)}
                  className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    mostrarAjustesContexto
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Configurar parámetros institucionales del proyecto"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Parámetros</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* AVISO INFORMATIVO DESCARTABLE DE VERSIÓN BETA */}
        {!avisoBetaDescartado && (
          <div
            role="region"
            aria-label="Aviso de versión Beta"
            className="bg-amber-50/90 border-b border-amber-200 px-3 sm:px-6 py-2 flex items-start sm:items-center justify-between gap-3 text-[11px] sm:text-xs text-amber-950 shrink-0"
          >
            <p className="leading-snug flex-1 min-w-0">
              <span className="font-mono font-bold uppercase tracking-wider text-[#991B1B] mr-1.5">
                [BETA]
              </span>
              {TEXTO_AVISO_VERSION_BETA}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={GOOGLE_FORMS_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleAbrirFormularioFeedback}
                className="hidden sm:inline-flex text-[11px] font-semibold text-[#991B1B] hover:underline cursor-pointer"
              >
                Enviar retroalimentación
              </a>
              <button
                type="button"
                onClick={() => {
                  setAvisoBetaDescartado(true);
                  guardarEstadoAvisoBetaDescartado(true);
                }}
                className="min-h-[28px] px-2 py-0.5 rounded bg-white/80 hover:bg-white border border-amber-300 text-amber-950 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                title="Ocultar este aviso informativo"
              >
                <span>Entendido</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* PANEL DESPLEGABLE DE PARÁMETROS DEL PROYECTO ACTIVO */}
        {conversacionActiva && mostrarAjustesContexto && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Institución Educativa
                </label>
                <input
                  type="text"
                  value={institucion}
                  onChange={(e) =>
                    actualizarParametroProyectoActivo('institucion', e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">UGEL</label>
                <input
                  type="text"
                  value={ugel}
                  onChange={(e) =>
                    actualizarParametroProyectoActivo('ugel', e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Docente Responsable
                </label>
                <input
                  type="text"
                  value={docente}
                  onChange={(e) =>
                    actualizarParametroProyectoActivo('docente', e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* BANNER DE NOTIFICACIONES / ERRORES FORMATEADOS (503 / ALTA DEMANDA + DEBUG DE CLAVES) */}
        {errorNotificacion && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex flex-col gap-2 text-xs text-red-900 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span className="font-semibold">{errorNotificacion}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorNotificacion(null);
                  setDebugErrorDetalle(null);
                }}
                className="text-red-700 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            {debugErrorDetalle && (
              <div className="bg-white/90 border border-red-200 rounded-lg px-3 py-2 text-[11px] font-mono text-red-950 space-y-1">
                <div className="font-sans font-bold text-red-800 uppercase tracking-wider text-[10px]">
                  Diagnóstico de Proveedores de IA (debugError):
                </div>
                {debugErrorDetalle.split(' | ').map((item, idx) => (
                  <div key={idx} className="break-words leading-relaxed">
                    • {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {avisoExito && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{avisoExito}</span>
            </div>
          </div>
        )}

        {/* CONTENIDO CENTRAL: FORMULARIO DE NUEVO PROYECTO O FLUJO CONVERSACIONAL DE RAMAS */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {!conversacionActiva ? (
            /* VISTA DE CREACIÓN DE NUEVO PROYECTO PCA (OPCIÓN A MANUAL VS OPCIÓN B 1 CLIC) */
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#991B1B] mb-1">
                    Programa Curricular de Educación Primaria · R.M. N.° 649-2016-MINEDU
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 font-editorial">
                    Nuevo Proyecto de Planificación Curricular Anual (PCA)
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Configura los datos de tu aula para estructurar la Matriz Maestra con las 8 Unidades Didácticas del año escolar y sus Sesiones Sugeridas.
                  </p>
                </div>

                {/* Acciones rápidas de importación JSON o carga de ejemplo local */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => mainFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Importar proyecto (.json)</span>
                  </button>
                  {historial.length === 0 && (
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleCargarProyectoDemostrativo}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Ver proyecto de ejemplo
                    </button>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleCrearNuevoProyectoPCA}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5"
              >
                {/* Selector de Modalidad de Generación: Opción A vs Opción B */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Modalidad de Generación del Proyecto Curricular
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setModoGeneracionProyecto('solo_pca')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        modoGeneracionProyecto === 'solo_pca'
                          ? 'border-[#991B1B] bg-[#991B1B]/5 ring-1 ring-[#991B1B]/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          [ Opción A ] Generar solo PCA Anual
                        </span>
                        <FileText className="w-4 h-4 text-[#991B1B]" />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Crea la Matriz Maestra con las 8 Unidades y permite ir generando manualmente cada Unidad y Sesión a tu propio ritmo en cascada.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setModoGeneracionProyecto('proyecto_completo')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        modoGeneracionProyecto === 'proyecto_completo'
                          ? 'border-[#991B1B] bg-[#991B1B]/5 ring-1 ring-[#991B1B]/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          [ Opción B ] Generar Proyecto Completo en 1 Clic
                        </span>
                        <Layers className="w-4 h-4 text-[#991B1B]" />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Genera en lote continuo la Matriz PCA + sus Unidades Didácticas + Sesiones vinculadas y organiza todo automáticamente en el árbol lateral.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Grado y Área Curricular */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Grado de Educación Primaria
                    </label>
                    <select
                      value={grado}
                      disabled={isGenerating}
                      onChange={(e) => setGrado(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#991B1B] disabled:opacity-60"
                    >
                      {GRADOS_CNEB.map((g) => (
                        <option key={g.valor} value={g.valor}>
                          {g.etiqueta} ({g.edadesReferencia})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Área Curricular Oficial (CNEB)
                    </label>
                    <select
                      value={area}
                      disabled={isGenerating}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#991B1B] disabled:opacity-60"
                    >
                      {AREAS_CURRICULARES_CNEB.map((a) => (
                        <option key={a.area} value={a.area}>
                          {a.area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Datos Institucionales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institución Educativa (I.E.)
                    </label>
                    <input
                      type="text"
                      disabled={isGenerating}
                      value={institucion}
                      onChange={(e) => setInstitucion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UGEL
                    </label>
                    <input
                      type="text"
                      disabled={isGenerating}
                      value={ugel}
                      onChange={(e) => setUgel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Docente Responsable
                    </label>
                    <input
                      type="text"
                      disabled={isGenerating}
                      value={docente}
                      onChange={(e) => setDocente(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Diagnóstico y Contexto Sociocultural */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Diagnóstico de Aprendizajes del Aula (SIAGIE / Evaluación Diagnóstica)
                    </label>
                    <textarea
                      rows={3}
                      disabled={isGenerating}
                      value={diagnostico}
                      onChange={(e) => setDiagnostico(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Caracterización del Contexto Escolar / Local y Problemática
                    </label>
                    <textarea
                      rows={3}
                      disabled={isGenerating}
                      value={contexto}
                      onChange={(e) => setContexto(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isGenerating || bloqueoRetroalimentacionActivo}
                    className="px-5 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{progresoLoteTexto || 'Estructurando Proyecto PCA...'}</span>
                      </>
                    ) : modoGeneracionProyecto === 'proyecto_completo' ? (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Generar Proyecto Completo en 1 Clic</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Generar Matriz Maestra PCA Anual</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Burbuja de carga interactiva con recomendaciones CNEB durante creación inicial */}
              {isGenerating && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-900">
                    <Loader2 className="w-4 h-4 animate-spin text-[#991B1B] shrink-0" />
                    <span>
                      {progresoLoteTexto ||
                        'Elaborando tu planificación curricular alineada al CNEB...'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-slate-800 transition-all duration-300">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Recomendación Pedagógica CNEB ({indiceRecomendacionCarga + 1}/
                        {RECOMENDACIONES_CNEB_CARGA.length})
                      </span>
                      <p className="leading-relaxed">{recomendacionActual}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FLUJO CONVERSACIONAL ESTILO CHATGPT / GEMINI POR RAMAS */
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
              {conversacionActiva.mensajes.map((msg) => {
                if (msg.rol === 'user') {
                  /* MENSAJE DEL USUARIO: Alineado a la derecha, fondo oscuro/azul */
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-2xl bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-2xs">
                        <p className="text-xs leading-relaxed">{msg.contenidoTexto}</p>
                        <span className="block text-[10px] text-slate-400 mt-1 text-right">
                          Docente · {msg.fecha}
                        </span>
                      </div>
                    </div>
                  );
                }

                /* MENSAJE DEL ASISTENTE CON DOCUMENTO CURRICULAR: Alineado a la izquierda, avatar minimalista CNEB */
                if (msg.documento) {
                  return (
                    <TarjetaDocumentoRama
                      key={msg.id}
                      msg={msg}
                      doc={msg.documento}
                      estaEnfocado={documentoEnfocadoId === msg.documento.id}
                      arbolProyecto={arbolProyectoActivo}
                      cargandoIA={isGenerating || bloqueoRetroalimentacionActivo}
                      onIntentoAccionDuranteCarga={
                        bloqueoRetroalimentacionActivo
                          ? mostrarAvisoBloqueoRetroalimentacion
                          : mostrarAvisoBloqueoMultitarea
                      }
                      onAbrirArbolMovil={() => setSidebarMovilAbierto(true)}
                      onAbrirModal={abrirModalDocumento}
                      onNavegarADocumento={(docId) =>
                        handleNavegarARama(conversacionActiva.id, docId)
                      }
                      onGenerarORegenerarUnidad={handleGenerarORegenerarUnidad}
                      onGenerarORegenerarSesion={handleGenerarORegenerarSesion}
                      onRegenerarDocumentoActual={handleRegenerarDocumentoActual}
                    />
                  );
                }

                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="h-7 px-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center shrink-0 mt-1 font-mono font-bold text-[10px] tracking-wider">
                      CNEB
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800">
                      {msg.contenidoTexto}
                    </div>
                  </div>
                );
              })}

              {/* PANTALLA DE CARGA INTERACTIVA CON RECOMENDACIONES CNEB ROTANDO CADA 5 SEGUNDOS */}
              {isGenerating && (
                <div className="flex items-start gap-3.5">
                  <div className="hidden sm:flex h-7 px-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 items-center justify-center shrink-0 mt-1 font-mono font-bold text-[10px] tracking-wider">
                    CNEB
                  </div>
                  <div className="flex-1 max-w-2xl bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-[#991B1B] shrink-0" />
                        <span>
                          {progresoLoteTexto ||
                            'Elaborando documento curricular alineado al CNEB y sincronizando con el árbol del proyecto...'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        Máx. 30s
                      </span>
                    </div>

                    {/* Recomendación pedagógica dinámica que rota cada 5 segundos */}
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-slate-800 transition-all duration-300">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          Recomendación CNEB en espera ({indiceRecomendacionCarga + 1}/
                          {RECOMENDACIONES_CNEB_CARGA.length})
                        </span>
                        <p className="leading-relaxed">{recomendacionActual}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </main>

        {/* BARRA INFERIOR CONVERSACIONAL CON CONTEXTO DE LA RAMA SELECCIONADA EN EL ÁRBOL */}
        {conversacionActiva && (
          <footer className="border-t border-slate-200 bg-white px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Indicador de Rama Activa + Botones de Continuidad Inmediata desde el nodo seleccionado */}
              {docRamaActiva && (
                <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSidebarMovilAbierto(true)}
                      className="md:hidden px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Abrir árbol de proyectos"
                    >
                      <FolderOpen className="w-3 h-3 text-[#991B1B]" />
                      <span>Árbol</span>
                    </button>
                    <FolderOpen className="hidden md:block w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                    <span className="hidden sm:inline text-slate-500">Rama:</span>
                    <span className="font-bold text-slate-900 truncate">
                      {mensajeRamaActiva?.etiquetaRama || docRamaActiva.tituloDocumento}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {docRamaActiva.tipoDocumento === 'SESION' && (
                      <>
                        <button
                          type="button"
                          aria-disabled={isGenerating || bloqueoRetroalimentacionActivo}
                          onClick={() =>
                            handleGenerarORegenerarSesion(
                              unidadActivaBarra,
                              sesionActivaBarra + 1
                            )
                          }
                          className={`min-h-[32px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors flex items-center gap-1 ${
                            isGenerating || bloqueoRetroalimentacionActivo
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="sm:hidden">+ Sesión {sesionActivaBarra + 1}</span>
                          <span className="hidden sm:inline">
                            + Generar Sesión {sesionActivaBarra + 1} de esta Unidad
                          </span>
                        </button>
                        {unidadActivaBarra < 8 && (
                          <button
                            type="button"
                            aria-disabled={isGenerating || bloqueoRetroalimentacionActivo}
                            onClick={() =>
                              handleGenerarORegenerarUnidad(unidadActivaBarra + 1)
                            }
                            className={`min-h-[32px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold rounded-md transition-colors flex items-center gap-1 ${
                              isGenerating || bloqueoRetroalimentacionActivo
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                          >
                            <FileSpreadsheet className="w-3 h-3 text-[#991B1B] shrink-0" />
                            <span className="sm:hidden">+ Unidad {unidadActivaBarra + 1}</span>
                            <span className="hidden sm:inline">
                              + Crear Siguiente Unidad Didáctica
                            </span>
                          </button>
                        )}
                      </>
                    )}

                    {docRamaActiva.tipoDocumento === 'UNIDAD' && (
                      <>
                        <button
                          type="button"
                          aria-disabled={isGenerating || bloqueoRetroalimentacionActivo}
                          onClick={() =>
                            handleGenerarORegenerarSesion(unidadActivaBarra, 1)
                          }
                          className={`min-h-[32px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors flex items-center gap-1 ${
                            isGenerating || bloqueoRetroalimentacionActivo
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="sm:hidden">+ Sesión 1 (U{unidadActivaBarra})</span>
                          <span className="hidden sm:inline">
                            + Generar Sesión 1 de la Unidad {unidadActivaBarra}
                          </span>
                        </button>
                        {unidadActivaBarra < 8 && (
                          <button
                            type="button"
                            aria-disabled={isGenerating || bloqueoRetroalimentacionActivo}
                            onClick={() =>
                              handleGenerarORegenerarUnidad(unidadActivaBarra + 1)
                            }
                            className={`min-h-[32px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold rounded-md transition-colors flex items-center gap-1 ${
                              isGenerating || bloqueoRetroalimentacionActivo
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                          >
                            <FileSpreadsheet className="w-3 h-3 text-[#991B1B] shrink-0" />
                            <span className="sm:hidden">+ Unidad {unidadActivaBarra + 1}</span>
                            <span className="hidden sm:inline">
                              + Generar Unidad {unidadActivaBarra + 1}
                            </span>
                          </button>
                        )}
                      </>
                    )}

                    {docRamaActiva.tipoDocumento === 'PCA' && (
                      <button
                        type="button"
                        aria-disabled={isGenerating || bloqueoRetroalimentacionActivo}
                        onClick={() => handleGenerarORegenerarUnidad(1)}
                        className={`min-h-[32px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors flex items-center gap-1 ${
                          isGenerating || bloqueoRetroalimentacionActivo
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        <FileSpreadsheet className="w-3 h-3 shrink-0" />
                        <span>+ Generar Unidad Didáctica 1</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Input de Instrucción / Continuación Conversacional */}
              <form onSubmit={handleEnviarMensajeChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={promptChatInput}
                  onChange={(e) => setPromptChatInput(e.target.value)}
                  disabled={isGenerating || bloqueoRetroalimentacionActivo}
                  placeholder={
                    bloqueoRetroalimentacionActivo
                      ? 'Completa la retroalimentación pendiente en el modal para seguir generando...'
                      : isGenerating
                      ? 'Generación en curso... espera unos segundos.'
                      : docRamaActiva?.tipoDocumento === 'SESION'
                      ? `Continuar desde ${
                          mensajeRamaActiva?.etiquetaRama || 'esta Sesión'
                        } (ej. "Generar Sesión ${
                          sesionActivaBarra + 1
                        }", "Usa material concreto")...`
                      : docRamaActiva?.tipoDocumento === 'UNIDAD'
                      ? `Continuar desde Unidad ${unidadActivaBarra} (ej. "Generar Sesión 1", "Ajusta el reto")...`
                      : 'Escribe una instrucción (ej. "Genera la Unidad 3" o "Ajusta la situación significativa")...'
                  }
                  className="flex-1 min-w-0 min-h-[40px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#991B1B] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isGenerating || bloqueoRetroalimentacionActivo}
                  className="min-h-[40px] px-3.5 sm:px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </footer>
        )}
      </div>

      {/* MODAL DE DESCARGA PDF PERSONALIZADA Y EDICIÓN SINCRONIZADA */}
      <ModalEditorCurricular
        abierto={modalAbierto}
        documentoBorrador={documentoBorrador}
        setDocumentoBorrador={setDocumentoBorrador}
        pestanaModal={pestanaModal}
        setPestanaModal={setPestanaModal}
        nombreArchivoPDF={nombreArchivoPDF}
        setNombreArchivoPDF={setNombreArchivoPDF}
        jsonBorrador={jsonBorrador}
        setJsonBorrador={setJsonBorrador}
        errorJsonBorrador={errorJsonBorrador}
        avisoGuardadoExito={avisoGuardadoExito}
        instruccionRegeneracionModal={instruccionRegeneracionModal}
        setInstruccionRegeneracionModal={setInstruccionRegeneracionModal}
        cargandoIA={isGenerating || bloqueoRetroalimentacionActivo}
        onCerrar={() => setModalAbierto(false)}
        onGuardarCambios={handleGuardarCambiosModal}
        onConfirmarExportacionPDF={handleConfirmarExportacionPDF}
        onRegenerarEnMismaRama={handleRegenerarEnMismaRamaModal}
      />

      {/* MODAL DE RETROALIMENTACIÓN DE LA VERSIÓN BETA */}
      <ModalRetroalimentacionBeta
        abierto={modalFeedbackAbierto}
        tipoDocumentoActivo={docRamaActiva?.tipoDocumento || 'PCA'}
        onCerrar={() => setModalFeedbackAbierto(false)}
      />

      {/* MODAL OBLIGATORIO DE RETROALIMENTACIÓN AL COMPLETAR 3 DOCUMENTOS GENERADOS */}
      <ModalRetroalimentacionObligatoria
        abierto={bloqueoRetroalimentacionActivo}
        documentosGeneradosCount={estadoFeedbackObligatorio.documentosGeneradosCount}
        formularioAbierto={estadoFeedbackObligatorio.formularioAbierto}
        tituloUltimoDocumento={
          docRamaActiva?.tituloDocumento ||
          conversacionActiva?.ultimoDocumento?.tituloDocumento
        }
        onAbrirFormulario={handleAbrirFormularioFeedback}
        onConfirmarRetroalimentacionEnviada={handleConfirmarRetroalimentacionObligatoria}
      />
    </div>
  );
}
