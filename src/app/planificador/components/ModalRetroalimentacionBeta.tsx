'use client';

/**
 * @file src/app/planificador/components/ModalRetroalimentacionBeta.tsx
 * @description Modal accesible en escritorio y móvil para registrar retroalimentación
 * de la versión Beta (Tipo de reporte, Documento relacionado, Valoración 1-5,
 * Descripción y Correo opcional) con integración honesta hacia Google Forms / Google Sheets.
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  MessageSquarePlus,
  Star,
  X,
} from 'lucide-react';
import { DocumentoCurricularCNEB } from '../../../lib/prompts';
import {
  DOCUMENTOS_RELACIONADOS_FEEDBACK,
  DatosRetroalimentacionBeta,
  DocumentoRelacionadoFeedback,
  TIPOS_REPORTE_FEEDBACK,
  TipoReporteFeedback,
  construirUrlGoogleFormsConDatos,
  formatearResumenRetroalimentacion,
  obtenerConfiguracionGoogleForms,
} from '../../../lib/feedback-config';

export type TipoDocumentoCNEB = DocumentoCurricularCNEB['tipoDocumento'];

export interface ModalRetroalimentacionBetaProps {
  abierto: boolean;
  tipoDocumentoActivo?: TipoDocumentoCNEB | null;
  onCerrar: () => void;
}

function mapearTipoDocumentoAFiltro(
  tipo?: TipoDocumentoCNEB | null
): DocumentoRelacionadoFeedback {
  if (tipo === 'PCA') return 'Planificación anual (PCA)';
  if (tipo === 'UNIDAD') return 'Unidad didáctica';
  if (tipo === 'SESION') return 'Sesión de aprendizaje';
  return 'Planificación anual (PCA)';
}

export function ModalRetroalimentacionBeta({
  abierto,
  tipoDocumentoActivo,
  onCerrar,
}: ModalRetroalimentacionBetaProps) {
  const [tipoReporte, setTipoReporte] = useState<TipoReporteFeedback>(
    'Mejora pedagógica o curricular'
  );
  const [documentoRelacionado, setDocumentoRelacionado] =
    useState<DocumentoRelacionadoFeedback>(() =>
      mapearTipoDocumentoAFiltro(tipoDocumentoActivo)
    );
  const [valoracion, setValoracion] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [descripcion, setDescripcion] = useState<string>('');
  const [correoContacto, setCorreoContacto] = useState<string>('');
  const [copiadoExito, setCopiadoExito] = useState<boolean>(false);
  const [intentoSinConfigurar, setIntentoSinConfigurar] = useState<boolean>(false);

  useEffect(() => {
    if (abierto) {
      setDocumentoRelacionado(mapearTipoDocumentoAFiltro(tipoDocumentoActivo));
      setIntentoSinConfigurar(false);
    }
  }, [abierto, tipoDocumentoActivo]);

  if (!abierto) return null;

  const configForms = obtenerConfiguracionGoogleForms();
  const datosActuales: DatosRetroalimentacionBeta = {
    tipoReporte,
    documentoRelacionado,
    valoracion,
    descripcion,
    correoContacto,
  };
  const urlFormularioExterno = construirUrlGoogleFormsConDatos(datosActuales);

  const handleCopiarResumen = async () => {
    const texto = formatearResumenRetroalimentacion(datosActuales);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(texto);
        setCopiadoExito(true);
        setTimeout(() => setCopiadoExito(false), 3000);
      }
    } catch {
      // Silencioso en caso de restricción de permisos de portapapeles
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-retroalimentacion"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Cabecera */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquarePlus className="w-4 h-4 text-[#991B1B] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="titulo-modal-retroalimentacion"
                  className="text-sm sm:text-base font-bold text-slate-900 font-editorial truncate"
                >
                  Enviar retroalimentación
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                  BETA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Ayúdanos a mejorar el Planificador Curricular CNEB para Educación Primaria
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="min-h-[38px] min-w-[38px] p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Cerrar ventana de retroalimentación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* 1. Tipo de reporte */}
          <div>
            <label
              htmlFor="feedback-tipo-reporte"
              className="block font-bold text-slate-800 mb-1.5"
            >
              1. Tipo de reporte
            </label>
            <select
              id="feedback-tipo-reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporteFeedback)}
              className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#991B1B]"
            >
              {TIPOS_REPORTE_FEEDBACK.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Documento relacionado */}
          <div>
            <label
              htmlFor="feedback-documento-relacionado"
              className="block font-bold text-slate-800 mb-1.5"
            >
              2. Documento relacionado
            </label>
            <div
              id="feedback-documento-relacionado"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {DOCUMENTOS_RELACIONADOS_FEEDBACK.map((docItem) => {
                const activo = documentoRelacionado === docItem;
                return (
                  <button
                    key={docItem}
                    type="button"
                    onClick={() => setDocumentoRelacionado(docItem)}
                    className={`min-h-[40px] px-3 py-2 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                      activo
                        ? 'border-[#991B1B] bg-[#991B1B]/10 text-[#991B1B] font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {docItem}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Valoración de la experiencia (1 al 5) */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              3. Valoración de la experiencia (del 1 al 5)
            </label>
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4, 5] as const).map((punto) => {
                const seleccionado = valoracion >= punto;
                const esExacto = valoracion === punto;
                return (
                  <button
                    key={punto}
                    type="button"
                    onClick={() => setValoracion(punto)}
                    aria-label={`Valorar con ${punto} de 5`}
                    aria-pressed={esExacto}
                    className={`flex-1 min-h-[42px] py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      esExacto
                        ? 'border-[#991B1B] bg-[#991B1B] text-white'
                        : seleccionado
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        esExacto
                          ? 'fill-white text-white'
                          : seleccionado
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="font-mono tabular-nums">{punto}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              1 = Necesita muchas mejoras · 5 = Muy útil para mi labor docente
            </p>
          </div>

          {/* 4. Descripción del problema o sugerencia */}
          <div>
            <label
              htmlFor="feedback-descripcion"
              className="block font-bold text-slate-800 mb-1.5"
            >
              4. Descripción del problema o sugerencia
            </label>
            <textarea
              id="feedback-descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué ocurrió, qué elemento curricular debe ajustarse o qué mejora te gustaría ver..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#991B1B]"
            />
          </div>

          {/* 5. Correo electrónico opcional para seguimiento */}
          <div>
            <label
              htmlFor="feedback-correo"
              className="block font-bold text-slate-800 mb-1"
            >
              5. Correo electrónico para seguimiento{' '}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <input
              id="feedback-correo"
              type="email"
              value={correoContacto}
              onChange={(e) => setCorreoContacto(e.target.value)}
              placeholder="docente@minedu.gob.pe (opcional)"
              className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#991B1B]"
            />
          </div>

          {/* Estado real del destino Google Forms + Google Sheets */}
          {!configForms.configurado ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">
                    Destino de Google Forms pendiente de configuración
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    Para centralizar las respuestas en Google Sheets sin backend adicional, el
                    administrador debe definir la variable de entorno{' '}
                    <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">
                      VITE_GOOGLE_FORMS_FEEDBACK_URL
                    </code>{' '}
                    (o la constante en <code className="font-mono">src/lib/feedback-config.ts</code>
                    ). Mientras no esté configurada, los datos no se envían automáticamente.
                  </p>
                  {intentoSinConfigurar && (
                    <p className="text-[11px] font-semibold text-red-800 pt-1">
                      No se ha realizado el envío porque aún no hay una URL de Google Forms
                      configurada. Puedes copiar el resumen inferior para enviarlo manualmente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              Al continuar, se abrirá el formulario oficial en Google Forms (vinculado a Google
              Sheets) en una nueva pestaña para registrar tu respuesta sin interrumpir tu sesión de
              trabajo.
            </div>
          )}
        </div>

        {/* Pie de acciones */}
        <div className="px-4 sm:px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopiarResumen}
            className="min-h-[40px] px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copiar los datos ingresados al portapapeles"
          >
            {copiadoExito ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800">Resumen copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar resumen</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="min-h-[40px] px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {configForms.configurado && urlFormularioExterno ? (
              <a
                href={urlFormularioExterno}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleCopiarResumen();
                }}
                className="min-h-[40px] px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Abrir Google Forms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setIntentoSinConfigurar(true)}
                className="min-h-[40px] px-4 py-2 bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="El administrador debe configurar VITE_GOOGLE_FORMS_FEEDBACK_URL para habilitar el envío directo"
              >
                <span>URL de Google Forms pendiente</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
