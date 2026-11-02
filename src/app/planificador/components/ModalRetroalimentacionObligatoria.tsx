'use client';

/**
 * @file src/app/planificador/components/ModalRetroalimentacionObligatoria.tsx
 * @description Modal obligatorio centrado que se muestra al completar la generación
 * del tercer documento curricular (PCA, Unidad didáctica o Sesión de aprendizaje).
 *
 * Características:
 * - No incluye botón de cierre (X) ni opción para saltar u omitir la solicitud.
 * - Mantiene visible detrás del modal el documento curricular recién generado.
 * - Botón principal «Enviar retroalimentación»: abre el formulario oficial de Google Forms
 *   en una nueva pestaña.
 * - Botón secundario «Ya envié mi retroalimentación»: registra localmente la confirmación
 *   honesta del docente y desbloquea las acciones de generación sin afirmar que Google Forms
 *   verificó automáticamente el envío.
 */

import React from 'react';
import { CheckCircle2, ExternalLink, MessageSquarePlus } from 'lucide-react';
import {
  GOOGLE_FORMS_FEEDBACK_URL,
  TITULO_MODAL_RETROALIMENTACION_OBLIGATORIA,
  UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA,
} from '../../../lib/feedback-config';

export interface ModalRetroalimentacionObligatoriaProps {
  abierto: boolean;
  documentosGeneradosCount: number;
  formularioAbierto: boolean;
  tituloUltimoDocumento?: string;
  onAbrirFormulario: () => void;
  onConfirmarRetroalimentacionEnviada: () => void;
}

export function ModalRetroalimentacionObligatoria({
  abierto,
  documentosGeneradosCount,
  formularioAbierto,
  tituloUltimoDocumento,
  onAbrirFormulario,
  onConfirmarRetroalimentacionEnviada,
}: ModalRetroalimentacionObligatoriaProps) {
  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-feedback-obligatorio"
      aria-describedby="descripcion-modal-feedback-obligatorio"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-auto">
        {/* Cabecera institucional sin botón de cierre (X) */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#991B1B]/10 border border-[#991B1B]/20 flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-4 h-4 text-[#991B1B]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
              Planificador Curricular CNEB · Fase Beta ({Math.max(
                documentosGeneradosCount,
                UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA
              )}{' '}
              documentos generados)
            </div>
            <h2
              id="titulo-modal-feedback-obligatorio"
              className="text-base sm:text-lg font-bold text-slate-900 font-editorial leading-snug mt-0.5"
            >
              {TITULO_MODAL_RETROALIMENTACION_OBLIGATORIA}
            </h2>
          </div>
        </div>

        {/* Cuerpo explicativo */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p id="descripcion-modal-feedback-obligatorio" className="text-slate-800">
            Has generado{' '}
            <span className="font-bold text-slate-900">
              {Math.max(
                documentosGeneradosCount,
                UMBRAL_DOCUMENTOS_RETROALIMENTACION_OBLIGATORIA
              )}{' '}
              documentos curriculares
            </span>{' '}
            con éxito. Tu opinión como docente nos ayuda directamente a mejorar la calidad
            pedagógica, la coherencia con el CNEB y el funcionamiento técnico de esta herramienta
            para Educación Primaria.
          </p>

          {tituloUltimoDocumento && (
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Documento recién generado conservado en pantalla:
              </span>{' '}
              «{tituloUltimoDocumento}»
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <p className="font-semibold text-amber-900">
              ¿Cómo continuar planificando?
            </p>
            <p className="leading-relaxed text-amber-900/90">
              1. Pulsa <span className="font-semibold">«Enviar retroalimentación»</span> para abrir
              el formulario breve de Google Forms en una nueva pestaña.
            </p>
            <p className="leading-relaxed text-amber-900/90">
              2. Cuando hayas completado el formulario, regresa a esta ventana y pulsa{' '}
              <span className="font-semibold">«Ya envié mi retroalimentación»</span> para
              desbloquear las acciones de generación.
            </p>
          </div>

          {formularioAbierto && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                El formulario de retroalimentación se abrió en una nueva pestaña. Una vez que lo
                completes, confirma pulsando{' '}
                <strong className="font-semibold">«Ya envié mi retroalimentación»</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción obligatorios (sin opción de cerrar o saltar) */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onConfirmarRetroalimentacionEnviada}
            className="min-h-[42px] px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Ya envié mi retroalimentación</span>
          </button>

          <a
            href={GOOGLE_FORMS_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onAbrirFormulario}
            className="min-h-[42px] px-4 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer order-1 sm:order-2"
          >
            <span>Enviar retroalimentación</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
