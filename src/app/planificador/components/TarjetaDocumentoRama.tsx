'use client';

/**
 * @file src/app/planificador/components/TarjetaDocumentoRama.tsx
 * @description Tarjeta conversacional de documento curricular CNEB (PCA Matriz Maestra,
 * Unidad Didáctica o Sesión de Aprendizaje) con catálogo interactivo en cascada,
 * regeneración inteligente in-place y botones sin duplicación de íconos.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Download,
  Edit3,
  FileSpreadsheet,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { DocumentoCurricularCNEB } from '../../../lib/prompts';
import { ArbolProyectoCurricular, MensajeChatCNEB } from './SidebarArbolProyectos';

export interface TarjetaDocumentoRamaProps {
  msg: MensajeChatCNEB;
  doc: DocumentoCurricularCNEB;
  estaEnfocado: boolean;
  arbolProyecto: ArbolProyectoCurricular;
  cargandoIA: boolean;
  onIntentoAccionDuranteCarga?: () => void;
  onAbrirArbolMovil?: () => void;
  onAbrirModal: (
    mensajeId: string,
    doc: DocumentoCurricularCNEB,
    modo: 'descargar' | 'formulario' | 'json'
  ) => void;
  onNavegarADocumento: (docId: string) => void;
  onGenerarORegenerarUnidad: (unidadNumero: number, instruccionOpcional?: string) => void;
  onGenerarORegenerarSesion: (
    unidadNumero: number,
    sesionNumero: number,
    instruccionOpcional?: string
  ) => void;
  onRegenerarDocumentoActual: (
    mensajeId: string,
    doc: DocumentoCurricularCNEB,
    instruccion: string
  ) => void;
}

export function TarjetaDocumentoRama({
  msg,
  doc,
  estaEnfocado,
  arbolProyecto,
  cargandoIA,
  onIntentoAccionDuranteCarga,
  onAbrirArbolMovil,
  onAbrirModal,
  onNavegarADocumento,
  onGenerarORegenerarUnidad,
  onGenerarORegenerarSesion,
  onRegenerarDocumentoActual,
}: TarjetaDocumentoRamaProps) {
  const [mostrarAjusteIA, setMostrarAjusteIA] = useState<boolean>(false);
  const [instruccionAjuste, setInstruccionAjuste] = useState<string>('');

  const ejecutarSiNoEstaCargando = (accion: () => void) => {
    if (cargandoIA) {
      onIntentoAccionDuranteCarga?.();
      return;
    }
    accion();
  };

  const unidadActualNum = doc.unidadNumero ?? msg.unidadNumero ?? 1;
  const sesionActualNum = doc.sesionNumero ?? msg.sesionNumero ?? 1;
  const siguienteUnidadCorrelativa = Math.min(8, unidadActualNum + 1);
  const siguienteSesionCorrelativa = sesionActualNum + 1;

  // Buscar cuál es la siguiente Unidad pendiente (1 a 8) en el árbol
  const numerosUnidadesCreadas = new Set(arbolProyecto.unidades.map((u) => u.unidadNumero));
  let siguienteUnidadPendiente = 1;
  while (numerosUnidadesCreadas.has(siguienteUnidadPendiente) && siguienteUnidadPendiente < 8) {
    siguienteUnidadPendiente++;
  }

  // Buscar cuál es la siguiente Sesión pendiente para la Unidad actual
  const nodoUnidadActual = arbolProyecto.unidades.find(
    (u) => u.unidadNumero === unidadActualNum
  );
  const numerosSesionesCreadasEnUnidad = new Set(
    (nodoUnidadActual?.sesionesHijas || []).map((s) => s.sesionNumero)
  );
  let siguienteSesionPendiente = 1;
  while (
    numerosSesionesCreadasEnUnidad.has(siguienteSesionPendiente) &&
    siguienteSesionPendiente < 6
  ) {
    siguienteSesionPendiente++;
  }

  const handleEjecutarRegeneracionInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (cargandoIA) {
      onIntentoAccionDuranteCarga?.();
      return;
    }
    onRegenerarDocumentoActual(
      msg.id,
      doc,
      instruccionAjuste.trim() ||
        'Profundizar las estrategias metodológicas y precisión de desempeños manteniendo la coherencia del proyecto.'
    );
    setMostrarAjusteIA(false);
    setInstruccionAjuste('');
  };

  return (
    <div
      id={`doc-card-${doc.id}`}
      className="flex items-start gap-2.5 sm:gap-3.5 scroll-mt-6"
    >
      {/* Avatar minimalista "CNEB" en escritorio */}
      <div className="hidden sm:flex h-7 px-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 items-center justify-center shrink-0 mt-1 font-mono font-bold text-[10px] tracking-wider">
        CNEB
      </div>

      <div
        className={`flex-1 min-w-0 bg-white border rounded-2xl p-3.5 sm:p-5 space-y-4 sm:space-y-5 shadow-2xs transition-all ${
          estaEnfocado
            ? 'border-[#991B1B] ring-1 ring-[#991B1B]/20'
            : 'border-slate-200'
        }`}
      >
        {/* Cabecera del mensaje del asistente */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-700 leading-relaxed min-w-0 flex-1">
            <span className="sm:hidden font-mono font-bold text-[10px] text-[#991B1B] mr-1.5">
              [CNEB]
            </span>
            {msg.contenidoTexto}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {msg.etiquetaRama && (
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                Rama: {msg.etiquetaRama}
              </span>
            )}
            {onAbrirArbolMovil && (
              <button
                type="button"
                onClick={onAbrirArbolMovil}
                className="md:hidden min-h-[32px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                title="Abrir árbol de proyectos para cambiar de unidad o sesión"
              >
                <FolderOpen className="w-3 h-3 text-[#991B1B]" />
                <span>Volver al Árbol</span>
              </button>
            )}
            <button
              type="button"
              aria-disabled={cargandoIA}
              onClick={() => ejecutarSiNoEstaCargando(() => onNavegarADocumento(doc.id))}
              className={`min-h-[32px] px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                cargandoIA ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              } ${
                estaEnfocado
                  ? 'bg-[#991B1B] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Seleccionar este nodo del árbol para continuar la conversación desde aquí"
            >
              {estaEnfocado ? 'Rama Activa' : 'Continuar desde aquí'}
            </button>
          </div>
        </div>

        {/* Contenedor Técnico del Documento */}
        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 sm:p-5 space-y-4 sm:space-y-5">
          {/* Encabezado Institucional + Botones de Edición / Regeneración In-Place */}
          <div className="border-b border-slate-200 pb-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-[#991B1B] mb-1 break-words">
                {doc.tipoDocumento === 'PCA'
                  ? 'MATRIZ MAESTRA · PLANIFICACIÓN CURRICULAR ANUAL (PCA)'
                  : doc.tipoDocumento === 'UNIDAD'
                  ? `RAMA DEL PROYECTO · UNIDAD DIDÁCTICA ${unidadActualNum}`
                  : `SUB-RAMA · SESIÓN DE APRENDIZAJE ${doc.sesionNumero || 1} (UNIDAD ${unidadActualNum})`}{' '}
                · {doc.datosInformativos.gradoYSeccion}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-editorial leading-snug break-words">
                {doc.tituloDocumento}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
                <span>Área: {doc.datosInformativos.areaCurricular}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.datosInformativos.ciclo}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.datosInformativos.institucionEducativa}</span>
                <span aria-hidden="true">·</span>
                <span>Docente: {doc.datosInformativos.docenteResponsable}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onAbrirModal(msg.id, doc, 'formulario')}
                className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Editar manualmente el contenido y sincronizar cambios"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>Editar Contenido</span>
              </button>

              <button
                type="button"
                aria-disabled={cargandoIA}
                onClick={() =>
                  ejecutarSiNoEstaCargando(() => setMostrarAjusteIA((prev) => !prev))
                }
                className={`min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="Regenerar o ajustar este documento en su misma rama sin duplicar"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
                <span>Regenerar</span>
              </button>
            </div>
          </div>

          {/* Barra desplegable de Regeneración Inteligente In-Place */}
          {mostrarAjusteIA && (
            <form
              onSubmit={handleEjecutarRegeneracionInline}
              className="p-3 rounded-xl bg-white border border-slate-300 space-y-2"
            >
              <label className="block text-[11px] font-bold text-slate-800">
                Regenerar / Ajustar "{msg.etiquetaRama || doc.tipoDocumento}" en su misma rama del
                árbol:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={instruccionAjuste}
                  onChange={(e) => setInstruccionAjuste(e.target.value)}
                  placeholder="Escribe el cambio deseado (o deja en blanco para regenerar automáticamente)..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#991B1B]"
                />
                <button
                  type="submit"
                  disabled={cargandoIA}
                  className="px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar Rama</span>
                </button>
              </div>
            </form>
          )}

          {/* I. Caracterización / Preparación y Situación Significativa */}
          <div className="space-y-3 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                {doc.tipoDocumento === 'SESION'
                  ? 'I. Justificación Pedagógica y Preparación de la Sesión (¿Qué necesitamos hacer antes de la sesión?)'
                  : 'I. Caracterización y Diagnóstico del Aula'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {doc.descripcionGeneralYCaracterizacion}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200/80 space-y-2">
              <h3 className="font-bold text-[#991B1B]">
                {doc.tipoDocumento === 'SESION'
                  ? 'II. Situación de Aprendizaje, Reto y Evidencia de la Sesión'
                  : 'II. Situación Significativa y Reto Pedagógico'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Contexto: </span>
                {doc.situacionSignificativa.contextoReal}
              </p>
              <p className="text-slate-800 leading-relaxed">
                <span className="font-semibold text-slate-900">Reto: </span>
                {doc.situacionSignificativa.retoPedagogico}
              </p>
              <p className="text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">
                  {doc.tipoDocumento === 'SESION'
                    ? 'Evidencia / Producto de la Sesión: '
                    : 'Producto Integrador: '}
                </span>
                {doc.situacionSignificativa.productoIntegrador}
              </p>
            </div>
          </div>

          {/* III. Matriz de Propósitos de Aprendizaje */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2">
              III. Propósitos de Aprendizaje, Estándares, Criterios y Evidencias (CNEB)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-xs border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-left">
                    <th className="p-2.5 font-semibold border-r border-slate-700 w-[32%]">
                      Competencia, Capacidades y Estándar
                    </th>
                    <th className="p-2.5 font-semibold border-r border-slate-700 w-[40%]">
                      Desempeños y Criterios de Evaluación
                    </th>
                    <th className="p-2.5 font-semibold w-[28%]">Evidencia e Instrumento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 align-top">
                  {doc.propositosAprendizaje.map((p, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 border-r border-slate-200 space-y-2">
                        <div>
                          <p className="font-bold text-slate-900 mb-1">{p.competencia}</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                            {p.capacidades.map((c, cIdx) => (
                              <li key={cIdx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                        {p.estandarCiclo && (
                          <div className="p-2 rounded bg-slate-50 border border-slate-200/80 text-[10.5px] text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-800 block mb-0.5">
                              Estándar de Aprendizaje ({doc.datosInformativos.ciclo}):
                            </span>
                            {p.estandarCiclo}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 space-y-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-900 block mb-0.5">
                            Desempeños precisados:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                            {p.desempenosPrecisados.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-[#991B1B] block mb-0.5">
                            Criterios de evaluación:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                            {p.criteriosEvaluacion.map((cr, crIdx) => (
                              <li key={crIdx}>{cr}</li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td className="p-2.5 text-[11px] space-y-1.5">
                        <div>
                          <span className="font-semibold text-slate-900 block">Evidencia:</span>
                          <span className="text-slate-700">{p.evidenciaAprendizaje}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">Instrumento:</span>
                          <span className="text-slate-600">{p.instrumentoEvaluacion}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IV. SECUENCIA DIDÁCTICA INTERACTIVA SEGÚN EL TIPO DE DOCUMENTO */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2">
              {doc.tipoDocumento === 'PCA'
                ? 'IV. Matriz Maestra: Catálogo de Unidades Didácticas (1 a 8) y Sesiones Sugeridas'
                : doc.tipoDocumento === 'UNIDAD'
                ? `IV. Lista Ordenada de Sesiones Sugeridas — Unidad Didáctica ${unidadActualNum} (Título, Propósito y Duración)`
                : 'IV. Momentos Pedagógicos de la Sesión (Inicio · Desarrollo · Cierre)'}
            </h3>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs bg-white">
              {doc.secuenciaDidactica.map((sec, sIdx) => {
                const numeroItem = sIdx + 1;
                const nodoUnidadExistente =
                  doc.tipoDocumento === 'PCA'
                    ? arbolProyecto.unidades.find((u) => u.unidadNumero === numeroItem)
                    : undefined;
                const nodoSesionExistente =
                  doc.tipoDocumento === 'UNIDAD'
                    ? nodoUnidadActual?.sesionesHijas.find((s) => s.sesionNumero === numeroItem)
                    : undefined;

                return (
                  <div key={sIdx} className="p-3.5 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 block">
                          {sec.numero} ({sec.faseOMomento}) — {sec.titulo}
                        </span>
                        {sec.proposito && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-800">Propósito: </span>
                            {sec.proposito}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 mr-1">
                          {sec.duracion}
                        </span>

                        {/* Acción en Cascada desde la PCA Matriz Maestra para cada Unidad (1 a 8) */}
                        {doc.tipoDocumento === 'PCA' && (
                          <>
                            {nodoUnidadExistente ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-disabled={cargandoIA}
                                  onClick={() =>
                                    ejecutarSiNoEstaCargando(() =>
                                      onNavegarADocumento(nodoUnidadExistente.documento.id)
                                    )
                                  }
                                  className={`px-2 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center gap-1 ${
                                    cargandoIA
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Ver Unidad {numeroItem}</span>
                                </button>
                                <button
                                  type="button"
                                  aria-disabled={cargandoIA}
                                  onClick={() =>
                                    ejecutarSiNoEstaCargando(() =>
                                      onGenerarORegenerarUnidad(numeroItem)
                                    )
                                  }
                                  className={`px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1 ${
                                    cargandoIA
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer'
                                  }`}
                                  title="Regenerar esta Unidad Didáctica en su misma rama"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Regenerar</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                aria-disabled={cargandoIA}
                                onClick={() =>
                                  ejecutarSiNoEstaCargando(() =>
                                    onGenerarORegenerarUnidad(numeroItem)
                                  )
                                }
                                className={`px-2.5 py-1 text-[11px] font-semibold bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded-md transition-colors flex items-center gap-1 ${
                                  cargandoIA
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                }`}
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Generar Unidad {numeroItem}</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* Acción en Cascada desde la Unidad para cada Sesión Sugerida */}
                        {doc.tipoDocumento === 'UNIDAD' && (
                          <>
                            {nodoSesionExistente ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-disabled={cargandoIA}
                                  onClick={() =>
                                    ejecutarSiNoEstaCargando(() =>
                                      onNavegarADocumento(nodoSesionExistente.documento.id)
                                    )
                                  }
                                  className={`px-2 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center gap-1 ${
                                    cargandoIA
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Ver Sesión {numeroItem}</span>
                                </button>
                                <button
                                  type="button"
                                  aria-disabled={cargandoIA}
                                  onClick={() =>
                                    ejecutarSiNoEstaCargando(() =>
                                      onGenerarORegenerarSesion(unidadActualNum, numeroItem)
                                    )
                                  }
                                  className={`px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1 ${
                                    cargandoIA
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer'
                                  }`}
                                  title="Regenerar esta Sesión en su misma sub-rama"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Regenerar</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                aria-disabled={cargandoIA}
                                onClick={() =>
                                  ejecutarSiNoEstaCargando(() =>
                                    onGenerarORegenerarSesion(unidadActualNum, numeroItem)
                                  )
                                }
                                className={`px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center gap-1 ${
                                  cargandoIA
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                }`}
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Generar Sesión {numeroItem}</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actividades estratégicas */}
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                      {sec.actividadesEstrategicas.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>

                    {/* En la PCA: mostrar la lista ordenada de Sesiones Sugeridas de esta Unidad */}
                    {doc.tipoDocumento === 'PCA' &&
                      sec.sesionesSugeridas &&
                      sec.sesionesSugeridas.length > 0 && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="block text-[11px] font-semibold text-slate-800">
                            Lista Ordenada de Sesiones Sugeridas para la {sec.numero}:
                          </span>
                          <div className="space-y-1">
                            {sec.sesionesSugeridas.map((ss, ssIdx) => (
                              <div
                                key={ssIdx}
                                className="text-[11px] text-slate-700 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/60 last:border-b-0 pb-1 last:pb-0"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900">
                                    {ss.numero}: {ss.titulo}
                                  </span>
                                  <span className="block text-slate-600">
                                    Propósito: {ss.proposito}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                  {ss.duracion}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="pt-0.5 space-y-1 text-[11px]">
                      {sec.recursosEducativos && sec.recursosEducativos.length > 0 && (
                        <div className="text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {doc.tipoDocumento === 'SESION'
                              ? '¿Qué recursos o materiales se utilizarán?: '
                              : 'Materiales y recursos: '}
                          </span>
                          {sec.recursosEducativos.join(' · ')}
                        </div>
                      )}
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Producto / Evidencia: </span>
                        {sec.productoOEvidencia}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* V. Enfoques Transversales y Competencias Transversales */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                V. Enfoques Transversales Priorizados (CNEB)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                {doc.enfoquesTransversales.map((enf, eIdx) => (
                  <div
                    key={eIdx}
                    className="p-2.5 rounded-lg bg-white border border-slate-200/80"
                  >
                    <p className="font-bold text-slate-900">
                      {enf.enfoque} ({enf.valor})
                    </p>
                    <p className="text-slate-600 mt-0.5">{enf.actitudesObservables}</p>
                  </div>
                ))}
              </div>
            </div>

            {doc.competenciasTransversales && doc.competenciasTransversales.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 mb-1.5">
                  Competencias Transversales CNEB:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  {doc.competenciasTransversales.map((ct, ctIdx) => (
                    <div
                      key={ctIdx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200/80"
                    >
                      <p className="font-bold text-slate-900">{ct.competencia}</p>
                      <p className="text-[10.5px] font-semibold text-[#991B1B] mt-0.5">
                        Capacidad: {ct.capacidad}
                      </p>
                      <p className="text-slate-600 mt-0.5">{ct.desempenoContextualizado}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* VI. Orientaciones para la Evaluación Formativa y Materiales / Bibliografía */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
            {doc.orientacionesEvaluacion && doc.orientacionesEvaluacion.length > 0 && (
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900">
                  VI. Orientaciones para la Evaluación Formativa (R.V.M. N.° 094-2020-MINEDU)
                </h3>
                <div className="space-y-1.5">
                  {doc.orientacionesEvaluacion.map((oe, oeIdx) => (
                    <div
                      key={oeIdx}
                      className="border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0"
                    >
                      <span className="font-bold text-[#991B1B]">{oe.tipoEvaluacion}: </span>
                      <span className="text-slate-700">{oe.orientacionPedagogica} </span>
                      <span className="text-slate-500 font-medium">
                        (Instrumentos: {oe.tecnicasEInstrumentos})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.materialesYBibliografia && (
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-bold text-slate-900">
                  VII. Materiales Básicos y Recursos a Utilizar (Minedu)
                </h3>
                <div>
                  <span className="font-semibold text-slate-800 block">Para el Docente:</span>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    {doc.materialesYBibliografia.paraElDocente.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Para el Estudiante:</span>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    {doc.materialesYBibliografia.paraElEstudiante.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN Y CONTINUIDAD SECUENCIAL (UN SOLO ÍCONO POR BOTÓN) */}
        <div className="pt-1 space-y-2.5">
          {/* Bloque de Continuidad Secuencial según nivel de documento (PCA, UNIDAD o SESION) */}
          {doc.tipoDocumento === 'UNIDAD' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-700">
                Continuidad secuencial sugerida para la Unidad {unidadActualNum}:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-disabled={cargandoIA}
                  onClick={() =>
                    ejecutarSiNoEstaCargando(() =>
                      onGenerarORegenerarSesion(unidadActualNum, 1)
                    )
                  }
                  className={`px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                    cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    + Generar Sesión 1 de esta Unidad (Unidad {unidadActualNum})
                  </span>
                </button>

                {siguienteSesionPendiente > 1 && (
                  <button
                    type="button"
                    aria-disabled={cargandoIA}
                    onClick={() =>
                      ejecutarSiNoEstaCargando(() =>
                        onGenerarORegenerarSesion(unidadActualNum, siguienteSesionPendiente)
                      )
                    }
                    className={`px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                    <span>+ Generar Sesión {siguienteSesionPendiente} de esta Unidad</span>
                  </button>
                )}

                {unidadActualNum < 8 && (
                  <button
                    type="button"
                    aria-disabled={cargandoIA}
                    onClick={() =>
                      ejecutarSiNoEstaCargando(() =>
                        onGenerarORegenerarUnidad(siguienteUnidadCorrelativa)
                      )
                    }
                    className={`px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#991B1B]" />
                    <span>+ Generar Unidad {siguienteUnidadCorrelativa}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {doc.tipoDocumento === 'SESION' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-700">
                Continuidad secuencial desde Sesión {sesionActualNum} (Unidad {unidadActualNum}):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-disabled={cargandoIA}
                  onClick={() =>
                    ejecutarSiNoEstaCargando(() =>
                      onGenerarORegenerarSesion(unidadActualNum, siguienteSesionCorrelativa)
                    )
                  }
                  className={`px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                    cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    + Generar Sesión {siguienteSesionCorrelativa} de esta Unidad
                  </span>
                </button>

                {unidadActualNum < 8 && (
                  <button
                    type="button"
                    aria-disabled={cargandoIA}
                    onClick={() =>
                      ejecutarSiNoEstaCargando(() =>
                        onGenerarORegenerarUnidad(siguienteUnidadCorrelativa)
                      )
                    }
                    className={`px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#991B1B]" />
                    <span>
                      + Crear Siguiente Unidad Didáctica (Unidad {siguienteUnidadCorrelativa})
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {doc.tipoDocumento === 'PCA' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-700">
                Continuidad secuencial desde la Matriz Maestra PCA:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-disabled={cargandoIA}
                  onClick={() =>
                    ejecutarSiNoEstaCargando(() =>
                      onGenerarORegenerarUnidad(siguienteUnidadPendiente)
                    )
                  }
                  className={`px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                    cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>+ Generar Unidad Didáctica {siguienteUnidadPendiente}</span>
                </button>

                <button
                  type="button"
                  aria-disabled={cargandoIA}
                  onClick={() =>
                    ejecutarSiNoEstaCargando(() =>
                      onGenerarORegenerarSesion(unidadActualNum, siguienteSesionPendiente)
                    )
                  }
                  className={`px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    cargandoIA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                  <span>
                    + Generar Sesión {siguienteSesionPendiente} de la Unidad {unidadActualNum}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Botones de Descarga y Edición */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAbrirModal(msg.id, doc, 'descargar')}
              className="px-3.5 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF Oficial</span>
            </button>

            <button
              type="button"
              onClick={() => onAbrirModal(msg.id, doc, 'formulario')}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#991B1B]" />
              <span>Editar Contenido</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
