'use client';

/**
 * @file src/app/planificador/components/ModalEditorCurricular.tsx
 * @description Modal de personalización de nombre de archivo PDF y edición/regeneración
 * inteligente de documentos curriculares (PCA, Unidad Didáctica y Sesión de Aprendizaje).
 */

import React from 'react';
import { Check, Code2, Download, Edit3, RefreshCw, X } from 'lucide-react';
import { DocumentoCurricularCNEB } from '../../../lib/prompts';
import {
  generarNombreArchivoPorDefectoPDF,
  normalizarNombreArchivoPDF,
} from '../../../lib/pdf-generator';

export interface ModalEditorCurricularProps {
  abierto: boolean;
  documentoBorrador: DocumentoCurricularCNEB | null;
  setDocumentoBorrador: React.Dispatch<React.SetStateAction<DocumentoCurricularCNEB | null>>;
  pestanaModal: 'descargar' | 'formulario' | 'json';
  setPestanaModal: React.Dispatch<React.SetStateAction<'descargar' | 'formulario' | 'json'>>;
  nombreArchivoPDF: string;
  setNombreArchivoPDF: React.Dispatch<React.SetStateAction<string>>;
  jsonBorrador: string;
  setJsonBorrador: React.Dispatch<React.SetStateAction<string>>;
  errorJsonBorrador: string | null;
  avisoGuardadoExito: string | null;
  instruccionRegeneracionModal: string;
  setInstruccionRegeneracionModal: React.Dispatch<React.SetStateAction<string>>;
  cargandoIA: boolean;
  onCerrar: () => void;
  onGuardarCambios: () => DocumentoCurricularCNEB | null;
  onConfirmarExportacionPDF: () => void;
  onRegenerarEnMismaRama: () => void;
}

export function ModalEditorCurricular({
  abierto,
  documentoBorrador,
  setDocumentoBorrador,
  pestanaModal,
  setPestanaModal,
  nombreArchivoPDF,
  setNombreArchivoPDF,
  jsonBorrador,
  setJsonBorrador,
  errorJsonBorrador,
  avisoGuardadoExito,
  instruccionRegeneracionModal,
  setInstruccionRegeneracionModal,
  cargandoIA,
  onCerrar,
  onGuardarCambios,
  onConfirmarExportacionPDF,
  onRegenerarEnMismaRama,
}: ModalEditorCurricularProps) {
  if (!abierto || !documentoBorrador) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-editorial">
              Edición Inteligente y Exportación PDF Oficial Minedu
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Los cambios guardados actualizan el documento en su misma rama del árbol y sincronizan
              los datos institucionales del proyecto.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nombre Personalizado del Archivo PDF + Selector de Pestañas */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-white space-y-3">
          <div>
            <label
              htmlFor="input-nombre-pdf"
              className="block text-xs font-bold text-slate-800 mb-1"
            >
              Nombre personalizado del archivo PDF:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="input-nombre-pdf"
                type="text"
                value={nombreArchivoPDF}
                onChange={(e) => setNombreArchivoPDF(e.target.value)}
                placeholder="PCA_5to_Primaria_Comunicacion_2026.pdf"
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#991B1B]"
              />
              <button
                type="button"
                onClick={() =>
                  setNombreArchivoPDF(generarNombreArchivoPorDefectoPDF(documentoBorrador))
                }
                className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Restaurar nombre sugerido
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setPestanaModal('descargar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                pestanaModal === 'descargar'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resumen y Regeneración Inteligente</span>
            </button>

            <button
              type="button"
              onClick={() => setPestanaModal('formulario')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                pestanaModal === 'formulario'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Contenido (Formulario)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJsonBorrador(JSON.stringify(documentoBorrador, null, 2));
                setPestanaModal('json');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                pestanaModal === 'json'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor JSON Avanzado</span>
            </button>
          </div>
        </div>

        {/* Cuerpo scrollable del Modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {pestanaModal === 'descargar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-semibold text-[#991B1B]">
                  DOCUMENTO LISTO PARA EXPORTACIÓN OFICIAL MINEDU
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {documentoBorrador.tituloDocumento}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Archivo destino: </span>
                    <span className="font-mono text-slate-900">
                      {normalizarNombreArchivoPDF(nombreArchivoPDF, documentoBorrador)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Grado y Área: </span>
                    {documentoBorrador.datosInformativos.gradoYSeccion} —{' '}
                    {documentoBorrador.datosInformativos.areaCurricular}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Docente: </span>
                    {documentoBorrador.datosInformativos.docenteResponsable}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Director(a) I.E.: </span>
                    {documentoBorrador.datosInformativos.directorIE}
                  </div>
                </div>
              </div>

              {/* Bloque de Regeneración Inteligente In-Place */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <p className="font-bold text-slate-900">
                  Regeneración Inteligente de esta Rama (Sin duplicar en el árbol)
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Indica qué ajuste pedagógico deseas aplicar a este documento (ej. cambiar el
                  producto integrador, priorizar otro material concreto o adaptar las actividades) y
                  se regenerará conservando su misma posición en el árbol del proyecto:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={instruccionRegeneracionModal}
                    onChange={(e) => setInstruccionRegeneracionModal(e.target.value)}
                    placeholder="Ej.: Enfoca las actividades en el uso de regletas de Cuisenaire y trabajo en parejas..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#991B1B]"
                  />
                  <button
                    type="button"
                    disabled={cargandoIA}
                    onClick={onRegenerarEnMismaRama}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cargandoIA ? 'animate-spin' : ''}`} />
                    <span>Regenerar esta Rama</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {pestanaModal === 'formulario' && (
            <div className="space-y-5">
              {/* 1. Título y Firmas */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">
                  1. Título del Documento y Firmas (Se sincronizan en el proyecto)
                </h3>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Título del Documento Curricular
                  </label>
                  <input
                    type="text"
                    value={documentoBorrador.tituloDocumento}
                    onChange={(e) =>
                      setDocumentoBorrador({
                        ...documentoBorrador,
                        tituloDocumento: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Institución Educativa
                    </label>
                    <input
                      type="text"
                      value={documentoBorrador.datosInformativos.institucionEducativa}
                      onChange={(e) =>
                        setDocumentoBorrador({
                          ...documentoBorrador,
                          datosInformativos: {
                            ...documentoBorrador.datosInformativos,
                            institucionEducativa: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Docente Responsable (Firma)
                    </label>
                    <input
                      type="text"
                      value={documentoBorrador.datosInformativos.docenteResponsable}
                      onChange={(e) =>
                        setDocumentoBorrador({
                          ...documentoBorrador,
                          datosInformativos: {
                            ...documentoBorrador.datosInformativos,
                            docenteResponsable: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Director(a) I.E. (Firma V.° B.°)
                    </label>
                    <input
                      type="text"
                      value={documentoBorrador.datosInformativos.directorIE}
                      onChange={(e) =>
                        setDocumentoBorrador({
                          ...documentoBorrador,
                          datosInformativos: {
                            ...documentoBorrador.datosInformativos,
                            directorIE: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Caracterización y Situación Significativa */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">
                  2. Caracterización y Situación Significativa
                </h3>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Descripción General y Caracterización del Estudiante
                  </label>
                  <textarea
                    rows={3}
                    value={documentoBorrador.descripcionGeneralYCaracterizacion}
                    onChange={(e) =>
                      setDocumentoBorrador({
                        ...documentoBorrador,
                        descripcionGeneralYCaracterizacion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Contexto Sociocultural y Realidad Local
                    </label>
                    <textarea
                      rows={3}
                      value={documentoBorrador.situacionSignificativa.contextoReal}
                      onChange={(e) =>
                        setDocumentoBorrador({
                          ...documentoBorrador,
                          situacionSignificativa: {
                            ...documentoBorrador.situacionSignificativa,
                            contextoReal: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reto Pedagógico
                    </label>
                    <textarea
                      rows={3}
                      value={documentoBorrador.situacionSignificativa.retoPedagogico}
                      onChange={(e) =>
                        setDocumentoBorrador({
                          ...documentoBorrador,
                          situacionSignificativa: {
                            ...documentoBorrador.situacionSignificativa,
                            retoPedagogico: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Propósitos de Aprendizaje */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">
                  3. Propósitos de Aprendizaje: Desempeños Precisados y Criterios (1 por línea)
                </h3>
                <div className="space-y-4">
                  {documentoBorrador.propositosAprendizaje.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5"
                    >
                      <div className="font-bold text-[#991B1B]">{prop.competencia}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Desempeños Precisados (1 por línea)
                          </label>
                          <textarea
                            rows={4}
                            value={prop.desempenosPrecisados.join('\n')}
                            onChange={(e) => {
                              const nuevos = [...documentoBorrador.propositosAprendizaje];
                              nuevos[pIdx] = {
                                ...nuevos[pIdx],
                                desempenosPrecisados: e.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              };
                              setDocumentoBorrador({
                                ...documentoBorrador,
                                propositosAprendizaje: nuevos,
                              });
                            }}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Criterios de Evaluación Formativa (1 por línea)
                          </label>
                          <textarea
                            rows={4}
                            value={prop.criteriosEvaluacion.join('\n')}
                            onChange={(e) => {
                              const nuevos = [...documentoBorrador.propositosAprendizaje];
                              nuevos[pIdx] = {
                                ...nuevos[pIdx],
                                criteriosEvaluacion: e.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              };
                              setDocumentoBorrador({
                                ...documentoBorrador,
                                propositosAprendizaje: nuevos,
                              });
                            }}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Secuencia Didáctica (Unidades / Sesiones / Momentos) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">
                  4. Secuencia Didáctica (Catálogo de Unidades / Sesiones / Momentos)
                </h3>
                <div className="space-y-3">
                  {documentoBorrador.secuenciaDidactica.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={sec.titulo}
                          onChange={(e) => {
                            const nuevas = [...documentoBorrador.secuenciaDidactica];
                            nuevas[sIdx] = { ...nuevas[sIdx], titulo: e.target.value };
                            setDocumentoBorrador({
                              ...documentoBorrador,
                              secuenciaDidactica: nuevas,
                            });
                          }}
                          className="sm:col-span-2 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold"
                        />
                        <input
                          type="text"
                          value={sec.duracion}
                          onChange={(e) => {
                            const nuevas = [...documentoBorrador.secuenciaDidactica];
                            nuevas[sIdx] = { ...nuevas[sIdx], duracion: e.target.value };
                            setDocumentoBorrador({
                              ...documentoBorrador,
                              secuenciaDidactica: nuevas,
                            });
                          }}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Actividades estratégicas (1 por línea)
                        </label>
                        <textarea
                          rows={3}
                          value={sec.actividadesEstrategicas.join('\n')}
                          onChange={(e) => {
                            const nuevas = [...documentoBorrador.secuenciaDidactica];
                            nuevas[sIdx] = {
                              ...nuevas[sIdx],
                              actividadesEstrategicas: e.target.value
                                .split('\n')
                                .map((l) => l.trim())
                                .filter(Boolean),
                            };
                            setDocumentoBorrador({
                              ...documentoBorrador,
                              secuenciaDidactica: nuevas,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {pestanaModal === 'json' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Estructura JSON del Documento Curricular (Edición Directa):
              </label>
              <textarea
                rows={18}
                value={jsonBorrador}
                onChange={(e) => setJsonBorrador(e.target.value)}
                className="w-full p-3 font-mono text-[11px] bg-slate-900 text-slate-100 rounded-xl border border-slate-700 leading-relaxed focus:outline-none"
              />
              {errorJsonBorrador && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorJsonBorrador}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="px-3.5 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            {avisoGuardadoExito && (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>{avisoGuardadoExito}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCerrar}
              className="min-h-[38px] px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onGuardarCambios}
              className="min-h-[38px] px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Guardar y Sincronizar</span>
            </button>

            <button
              type="button"
              onClick={onConfirmarExportacionPDF}
              className="min-h-[38px] px-3.5 py-2 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer max-w-full"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Exportar PDF
                <span className="hidden sm:inline">
                  {' '}
                  ({normalizarNombreArchivoPDF(nombreArchivoPDF, documentoBorrador)})
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
