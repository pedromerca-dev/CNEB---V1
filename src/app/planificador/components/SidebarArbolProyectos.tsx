'use client';

/**
 * @file src/app/planificador/components/SidebarArbolProyectos.tsx
 * @description Sidebar lateral con historial de "Proyectos PCA" ordenados en árbol desplegable (Tree View):
 * Proyecto PCA -> Unidad Didáctica 1..8 -> Sesión 1..N
 */

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  MessageSquarePlus,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
  ExternalLink,
} from 'lucide-react';
import { DocumentoCurricularCNEB, ParametrosPlanificacionCNEB } from '../../../lib/prompts';
import { GOOGLE_FORMS_FEEDBACK_URL } from '../../../lib/feedback-config';

export interface MensajeChatCNEB {
  id: string;
  rol: 'user' | 'assistant';
  contenidoTexto: string;
  fecha: string;
  documento?: DocumentoCurricularCNEB;
  parentDocumentoId?: string;
  etiquetaRama?: string;
  unidadNumero?: number;
  sesionNumero?: number;
}

export interface ConversacionPlanificacion {
  id: string;
  tituloSidebar: string; // Formato: "Proyecto PCA 5.º Primaria — Comunicación"
  fechaActualizacion: string;
  parametrosBase: ParametrosPlanificacionCNEB;
  mensajes: MensajeChatCNEB[];
  ultimoDocumento?: DocumentoCurricularCNEB;
}

export interface NodoRamaUnidad {
  mensajeId: string;
  unidadNumero: number;
  etiqueta: string;
  documento: DocumentoCurricularCNEB;
  sesionesHijas: {
    mensajeId: string;
    sesionNumero: number;
    etiqueta: string;
    documento: DocumentoCurricularCNEB;
  }[];
}

export interface ArbolProyectoCurricular {
  pcaPrincipal: {
    mensajeId: string;
    etiqueta: string;
    documento: DocumentoCurricularCNEB;
  } | null;
  unidades: NodoRamaUnidad[];
}

export function construirArbolDeRamas(
  proyecto: ConversacionPlanificacion
): ArbolProyectoCurricular {
  const mensajesConDoc = proyecto.mensajes.filter(
    (m): m is MensajeChatCNEB & { documento: DocumentoCurricularCNEB } =>
      m.rol === 'assistant' && Boolean(m.documento)
  );

  const pcaMsg = mensajesConDoc.find((m) => m.documento.tipoDocumento === 'PCA') || null;
  const unidadesMsgs = mensajesConDoc.filter((m) => m.documento.tipoDocumento === 'UNIDAD');
  const sesionesMsgs = mensajesConDoc.filter((m) => m.documento.tipoDocumento === 'SESION');

  const unidadesOrdenadas = [...unidadesMsgs].sort((a, b) => {
    const numA = a.unidadNumero ?? a.documento.unidadNumero ?? 99;
    const numB = b.unidadNumero ?? b.documento.unidadNumero ?? 99;
    return numA - numB;
  });

  const unidades: NodoRamaUnidad[] = unidadesOrdenadas.map((uMsg, idx) => {
    const uNum = uMsg.unidadNumero ?? uMsg.documento.unidadNumero ?? idx + 1;
    const etiqueta = uMsg.etiquetaRama || `Unidad Didáctica ${uNum}`;

    const sesionesDeEstaUnidad = sesionesMsgs
      .filter((sMsg) => {
        if (sMsg.parentDocumentoId === uMsg.documento.id) return true;
        const sUnidadNum = sMsg.unidadNumero ?? sMsg.documento.unidadNumero;
        return sUnidadNum === uNum;
      })
      .sort((a, b) => {
        const sA = a.sesionNumero ?? a.documento.sesionNumero ?? 99;
        const sB = b.sesionNumero ?? b.documento.sesionNumero ?? 99;
        return sA - sB;
      })
      .map((sMsg, sIdx) => {
        const sNum = sMsg.sesionNumero ?? sMsg.documento.sesionNumero ?? sIdx + 1;
        return {
          mensajeId: sMsg.id,
          sesionNumero: sNum,
          etiqueta: `Sesión ${sNum}`,
          documento: sMsg.documento,
        };
      });

    return {
      mensajeId: uMsg.id,
      unidadNumero: uNum,
      etiqueta,
      documento: uMsg.documento,
      sesionesHijas: sesionesDeEstaUnidad,
    };
  });

  return {
    pcaPrincipal: pcaMsg
      ? {
          mensajeId: pcaMsg.id,
          etiqueta: 'PCA Anual (Matriz Maestra)',
          documento: pcaMsg.documento,
        }
      : null,
    unidades,
  };
}

export interface SidebarArbolProyectosProps {
  abierto: boolean;
  abiertoMovil?: boolean;
  onCerrarMovil?: () => void;
  workspaceId?: string;
  historial: ConversacionPlanificacion[];
  conversacionActivaId: string | null;
  proyectosExpandidos: Record<string, boolean>;
  documentoEnfocadoId: string | null;
  isGenerating?: boolean;
  onIntentoAccionDuranteCarga?: () => void;
  onNuevaPlanificacion: () => void;
  onSeleccionarProyecto: (proyectoId: string, docId?: string) => void;
  onToggleExpandirProyecto: (proyectoId: string, e: React.MouseEvent) => void;
  onNavegarARama: (proyectoId: string, documentoId: string) => void;
  onEliminarProyecto: (proyectoId: string, e: React.MouseEvent) => void;
  onExportarProyectoJson?: (proyecto: ConversacionPlanificacion, e?: React.MouseEvent) => void;
  onSolicitarImportarJson?: () => void;
  onLimpiarEspacioTrabajo?: () => void;
  onAbrirRetroalimentacion?: () => void;
}

export function SidebarArbolProyectos({
  abierto,
  abiertoMovil = false,
  onCerrarMovil,
  workspaceId,
  historial,
  conversacionActivaId,
  proyectosExpandidos,
  documentoEnfocadoId,
  isGenerating = false,
  onIntentoAccionDuranteCarga,
  onNuevaPlanificacion,
  onSeleccionarProyecto,
  onToggleExpandirProyecto,
  onNavegarARama,
  onEliminarProyecto,
  onExportarProyectoJson,
  onSolicitarImportarJson,
  onLimpiarEspacioTrabajo,
  onAbrirRetroalimentacion,
}: SidebarArbolProyectosProps) {
  const [confirmandoLimpiarEspacio, setConfirmandoLimpiarEspacio] = useState<boolean>(false);

  const manejarClickProtegido = (accion: () => void, e?: React.MouseEvent) => {
    if (isGenerating) {
      if (e) e.stopPropagation();
      onIntentoAccionDuranteCarga?.();
      return;
    }
    accion();
  };

  const proyectoActivo =
    historial.find((p) => p.id === conversacionActivaId) || null;

  const idCortoWorkspace = workspaceId
    ? workspaceId.replace(/^ws_/, '').slice(0, 8)
    : 'local';

  return (
    <>
      {/* Fondo oscuro táctil en móviles cuando el cajón del árbol está abierto */}
      {abiertoMovil && (
        <div
          onClick={onCerrarMovil}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-900/45 backdrop-blur-[1px] md:hidden"
        />
      )}

      <aside
        aria-label="Árbol de proyectos curriculares PCA"
        className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-[320px] bg-slate-50 border-r border-slate-200 shadow-2xl transition-transform duration-200 flex flex-col shrink-0 overflow-hidden ${
          abiertoMovil ? 'translate-x-0' : '-translate-x-full'
        } md:static md:z-auto md:shadow-none md:translate-x-0 md:transition-all ${
          abierto ? 'md:w-80 md:border-r md:border-slate-200' : 'md:w-0 md:border-r-0'
        }`}
      >
        {/* Barra superior exclusiva para móvil para cerrar el árbol fácilmente */}
        <div className="flex md:hidden items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-[#991B1B] shrink-0" />
            <span className="text-xs font-bold text-slate-900 truncate">
              Árbol de Proyectos PCA
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
              BETA
            </span>
          </div>
          <button
            type="button"
            onClick={onCerrarMovil}
            className="min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            aria-label="Cerrar árbol de proyectos"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cerrar</span>
          </button>
        </div>

        {/* Controles del Espacio de Trabajo Local: Nuevo Proyecto, Importar .JSON, Exportar .JSON y Limpiar */}
        <div className="p-3.5 border-b border-slate-200 space-y-2 shrink-0">
          <button
            type="button"
            aria-disabled={isGenerating}
            onClick={(e) =>
              manejarClickProtegido(() => {
                onNuevaPlanificacion();
                onCerrarMovil?.();
              }, e)
            }
            className={`w-full min-h-[40px] py-2.5 px-3.5 bg-[#991B1B] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs whitespace-nowrap ${
              isGenerating
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-[#7F1D1D] cursor-pointer'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto PCA</span>
          </button>

          {/* Acciones de respaldo y gestión del espacio de trabajo (.JSON / Limpiar) */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              aria-disabled={isGenerating}
              onClick={(e) =>
                manejarClickProtegido(() => {
                  onSolicitarImportarJson?.();
                  onCerrarMovil?.();
                }, e)
              }
              className={`min-h-[36px] py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Importar un proyecto desde un archivo .json válido"
            >
              <Upload className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="truncate">Importar</span>
            </button>

            <button
              type="button"
              aria-disabled={isGenerating || !proyectoActivo}
              disabled={!proyectoActivo}
              onClick={(e) =>
                proyectoActivo &&
                manejarClickProtegido(
                  () => onExportarProyectoJson?.(proyectoActivo, e),
                  e
                )
              }
              className={`min-h-[36px] py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                isGenerating || !proyectoActivo
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              title="Exportar el proyecto actual como archivo .json"
            >
              <Download className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="truncate">Exportar</span>
            </button>

            <button
              type="button"
              aria-disabled={isGenerating}
              onClick={(e) =>
                manejarClickProtegido(
                  () => setConfirmandoLimpiarEspacio((prev) => !prev),
                  e
                )
              }
              className={`min-h-[36px] py-1.5 px-2 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Limpiar el espacio de trabajo actual de este navegador"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span className="truncate">Limpiar</span>
            </button>
          </div>

          {/* Confirmación en línea para limpiar el espacio de trabajo (sin usar window.confirm) */}
          {confirmandoLimpiarEspacio && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 space-y-2 text-[11px] text-red-950">
              <p className="font-medium leading-snug">
                ¿Limpiar este espacio de trabajo local? Se eliminarán los proyectos guardados en este navegador.
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmandoLimpiarEspacio(false)}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) =>
                    manejarClickProtegido(() => {
                      setConfirmandoLimpiarEspacio(false);
                      onLimpiarEspacioTrabajo?.();
                      onCerrarMovil?.();
                    }, e)
                  }
                  className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer"
                >
                  Confirmar limpieza
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium leading-tight">
              Generación en curso: cambio de ramas bloqueado temporalmente.
            </div>
          )}
        </div>

        {/* Historial de Proyectos PCA en Árbol Desplegable (Tree View) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Proyectos PCA ({historial.length})</span>
          </div>

          {historial.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-500 bg-white/60 border border-dashed border-slate-200 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-700">
                Tu espacio de trabajo está vacío
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Crea un nuevo Proyecto PCA o importa un archivo <span className="font-mono">.json</span> para comenzar.
              </p>
            </div>
          ) : (
            historial.map((proyecto) => {
              const esProyectoActivo = proyecto.id === conversacionActivaId;
              const expandido = proyectosExpandidos[proyecto.id] ?? true;
              const arbol = construirArbolDeRamas(proyecto);
              const totalSesiones = arbol.unidades.reduce(
                (acc, u) => acc + u.sesionesHijas.length,
                0
              );

              return (
                <div
                  key={proyecto.id}
                  className={`rounded-xl border transition-colors ${
                    esProyectoActivo
                      ? 'bg-white border-slate-300 shadow-2xs'
                      : 'bg-white/70 border-slate-200/80 hover:border-slate-300'
                  } ${isGenerating ? 'opacity-75' : ''}`}
                >
                  {/* Nodo Raíz: Proyecto PCA */}
                  <div
                    onClick={(e) =>
                      manejarClickProtegido(
                        () => {
                          onSeleccionarProyecto(
                            proyecto.id,
                            arbol.pcaPrincipal?.documento.id
                          );
                          onCerrarMovil?.();
                        },
                        e
                      )
                    }
                    className={`group flex items-center justify-between gap-1.5 px-2.5 py-2.5 rounded-t-xl ${
                      isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) =>
                          manejarClickProtegido(
                            () => onToggleExpandirProyecto(proyecto.id, e),
                            e
                          )
                        }
                        className="p-1 rounded hover:bg-slate-200/70 text-slate-500 shrink-0"
                        title={expandido ? 'Contraer árbol' : 'Desplegar árbol'}
                      >
                        {expandido ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <FolderOpen
                        className={`w-4 h-4 shrink-0 ${
                          esProyectoActivo ? 'text-[#991B1B]' : 'text-slate-500'
                        }`}
                      />
                      <div className="truncate">
                        <span className="block text-xs font-bold text-slate-900 truncate">
                          {proyecto.tituloSidebar}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          PCA · {arbol.unidades.length} Unidad(es) · {totalSesiones} Sesión(es)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {onExportarProyectoJson && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            manejarClickProtegido(
                              () => onExportarProyectoJson(proyecto, e),
                              e
                            );
                          }}
                          className="opacity-70 group-hover:opacity-100 text-slate-400 hover:text-slate-800 p-1.5 rounded transition-opacity"
                          title="Exportar proyecto como archivo .json"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) =>
                          manejarClickProtegido(
                            () => onEliminarProyecto(proyecto.id, e),
                            e
                          )
                        }
                        className="opacity-70 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded transition-opacity"
                        title="Eliminar proyecto PCA"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Árbol Desplegable de Ramas */}
                  {expandido && (
                    <div className="px-2.5 pb-2.5 pt-1.5 border-t border-slate-100 space-y-1 text-xs">
                      {/* Matriz Maestra PCA */}
                      {arbol.pcaPrincipal && (
                        <button
                          type="button"
                          aria-disabled={isGenerating}
                          onClick={(e) =>
                            manejarClickProtegido(
                              () => {
                                onNavegarARama(
                                  proyecto.id,
                                  arbol.pcaPrincipal!.documento.id
                                );
                                onCerrarMovil?.();
                              },
                              e
                            )
                          }
                          className={`w-full min-h-[36px] flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                            isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            esProyectoActivo &&
                            documentoEnfocadoId === arbol.pcaPrincipal.documento.id
                              ? 'bg-[#991B1B]/10 text-[#991B1B] font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 text-[#991B1B]" />
                          <span className="truncate">{arbol.pcaPrincipal.etiqueta}</span>
                        </button>
                      )}

                      {/* Ramas de Unidades Didácticas y Sub-ramas de Sesiones */}
                      {arbol.unidades.map((unidad, uIdx) => {
                        const esUltimaUnidad = uIdx === arbol.unidades.length - 1;
                        const conectorUnidad = esUltimaUnidad ? '└──' : '├──';
                        const unidadActiva =
                          esProyectoActivo && documentoEnfocadoId === unidad.documento.id;

                        return (
                          <div key={unidad.documento.id} className="space-y-0.5">
                            <button
                              type="button"
                              aria-disabled={isGenerating}
                              onClick={(e) =>
                                manejarClickProtegido(
                                  () => {
                                    onNavegarARama(proyecto.id, unidad.documento.id);
                                    onCerrarMovil?.();
                                  },
                                  e
                                )
                              }
                              className={`w-full min-h-[36px] flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors ${
                                isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                unidadActiva
                                  ? 'bg-[#991B1B]/10 text-[#991B1B] font-semibold'
                                  : 'text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                {conectorUnidad}
                              </span>
                              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-[#991B1B]" />
                              <span className="truncate">{unidad.etiqueta}</span>
                            </button>

                            {/* Sesiones Hijas de la Unidad */}
                            {unidad.sesionesHijas.length > 0 && (
                              <div className="pl-4 space-y-0.5">
                                {unidad.sesionesHijas.map((sesion, sIdx) => {
                                  const esUltimaSesion =
                                    sIdx === unidad.sesionesHijas.length - 1;
                                  const conectorSesion = esUltimaSesion ? '└──' : '├──';
                                  const sesionActiva =
                                    esProyectoActivo &&
                                    documentoEnfocadoId === sesion.documento.id;

                                  return (
                                    <button
                                      key={sesion.documento.id}
                                      type="button"
                                      aria-disabled={isGenerating}
                                      onClick={(e) =>
                                        manejarClickProtegido(
                                          () => {
                                            onNavegarARama(
                                              proyecto.id,
                                              sesion.documento.id
                                            );
                                            onCerrarMovil?.();
                                          },
                                          e
                                        )
                                      }
                                      className={`w-full min-h-[34px] flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left text-[11px] transition-colors ${
                                        isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'
                                      } ${
                                        sesionActiva
                                          ? 'bg-slate-900 text-white font-semibold'
                                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                      }`}
                                    >
                                      <span className="font-mono text-[10px] opacity-60 shrink-0">
                                        {esUltimaUnidad ? '   ' : '│  '} {conectorSesion}
                                      </span>
                                      <BookOpen className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{sesion.etiqueta}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie del sidebar con botón Enviar retroalimentación e identificador de espacio de trabajo */}
        <div className="p-3 border-t border-slate-200 space-y-2.5 text-[11px] text-slate-500 shrink-0 bg-slate-50">
          <a
            href={GOOGLE_FORMS_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onAbrirRetroalimentacion?.();
              onCerrarMovil?.();
            }}
            className="w-full min-h-[38px] px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            title="Abrir formulario de retroalimentación en una nueva pestaña"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
            <span>Enviar retroalimentación</span>
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
          </a>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                <HardDrive className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                <span>Espacio local de navegador</span>
              </span>
              <span
                className="font-mono text-[10px] text-slate-600"
                title={workspaceId || 'Espacio de trabajo local'}
              >
                #{idCortoWorkspace}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Planificador Curricular CNEB</span>
              <span className="font-mono font-bold text-[#991B1B]">BETA</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
