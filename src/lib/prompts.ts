/**
 * @file src/lib/prompts.ts
 * @description Plantilla del Prompt Maestro Pedagógico exclusivo para EDUCACIÓN PRIMARIA
 * (1.° a 6.° Grado — Ciclos III, IV y V) alineado al Programa Curricular de Educación Primaria
 * (R.M. N.° 649-2016-MINEDU) y al Currículo Nacional de la Educación Básica (CNEB - Minedu Perú).
 * Soporta la Matriz Maestra de PCA (Unidades 1 a 8 con lista ordenada de Sesiones Sugeridas),
 * arquitectura de proyectos por ramas y regeneración inteligente contextualizada.
 */

export type TipoDocumentoCurricular = 'PCA' | 'UNIDAD' | 'SESION';

export type NivelEducativoCNEB = 'Primaria';

export type CicloPrimariaCNEB = 'Ciclo III' | 'Ciclo IV' | 'Ciclo V';

export interface SesionSugeridaItem {
  numero: string; // ej. "Sesión 1", "Sesión 2"
  titulo: string;
  proposito: string;
  duracion: string; // ej. "90 minutos"
}

export interface ParametrosPlanificacionCNEB {
  tipoDocumento?: TipoDocumentoCurricular;
  nivel?: NivelEducativoCNEB;
  grado: string;
  area: string;
  periodo: string;
  diagnostico: string;
  contexto: string;
  institucion?: string;
  dre?: string;
  ugel?: string;
  docente?: string;
  director?: string;
  tituloPersonalizado?: string;
  unidadNumero?: number;
  sesionNumero?: number;
  instruccionRegeneracion?: string;
  modoLoteRapido?: boolean;
  sesionesSugeridasContexto?: SesionSugeridaItem[];
  contextoContinuidadRama?: string;
}

export interface PropositoAprendizajeItem {
  competencia: string;
  capacidades: string[];
  estandarCiclo: string;
  desempenosPrecisados: string[];
  criteriosEvaluacion: string[];
  evidenciaAprendizaje: string;
  instrumentoEvaluacion: string;
}

export interface EnfoqueTransversalItem {
  enfoque: string;
  valor: string;
  actitudesObservables: string;
}

export interface SecuenciaDidacticaItem {
  numero: string;
  titulo: string;
  duracion: string;
  faseOMomento: string;
  proposito?: string;
  actividadesEstrategicas: string[];
  recursosEducativos: string[];
  productoOEvidencia: string;
  sesionesSugeridas?: SesionSugeridaItem[];
}

export interface OrientacionEvaluacionItem {
  tipoEvaluacion: 'Diagnóstica' | 'Formativa' | 'Sumativa';
  orientacionPedagogica: string;
  tecnicasEInstrumentos: string;
}

export interface DocumentoCurricularCNEB {
  id: string;
  fechaGeneracion: string;
  tipoDocumento: TipoDocumentoCurricular;
  codigoNormativo: string;
  tituloDocumento: string;
  unidadNumero?: number;
  sesionNumero?: number;
  datosInformativos: {
    dre: string;
    ugel: string;
    institucionEducativa: string;
    nivel: string;
    ciclo: string;
    gradoYSeccion: string;
    areaCurricular: string;
    periodoLectivo: string;
    duracionEstimada: string;
    docenteResponsable: string;
    directorIE: string;
  };
  descripcionGeneralYCaracterizacion: string;
  situacionSignificativa: {
    contextoReal: string;
    retoPedagogico: string;
    productoIntegrador: string;
  };
  propositosAprendizaje: PropositoAprendizajeItem[];
  competenciasTransversales: {
    competencia: string;
    capacidad: string;
    desempenoContextualizado: string;
  }[];
  enfoquesTransversales: EnfoqueTransversalItem[];
  secuenciaDidactica: SecuenciaDidacticaItem[];
  orientacionesEvaluacion: OrientacionEvaluacionItem[];
  materialesYBibliografia: {
    paraElDocente: string[];
    paraElEstudiante: string[];
  };
}

/**
 * Catálogo exclusivo de Grados de Educación Primaria (1.° a 6.° Grado — Ciclos III, IV y V)
 * según el Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU)
 */
export const GRADOS_CNEB: {
  valor: string;
  etiqueta: string;
  nivel: NivelEducativoCNEB;
  ciclo: CicloPrimariaCNEB;
  edadesReferencia: string;
  descripcionCiclo: string;
}[] = [
  {
    valor: '1.° de Primaria',
    etiqueta: '1.° Grado de Primaria (Ciclo III)',
    nivel: 'Primaria',
    ciclo: 'Ciclo III',
    edadesReferencia: '6 a 7 años',
    descripcionCiclo:
      'Consolidación de la apropiación del sistema de escritura alfabética y noción de número con soporte concreto.',
  },
  {
    valor: '2.° de Primaria',
    etiqueta: '2.° Grado de Primaria (Ciclo III)',
    nivel: 'Primaria',
    ciclo: 'Ciclo III',
    edadesReferencia: '7 a 8 años',
    descripcionCiclo:
      'Afianzamiento de la lectoescritura autónoma, comprensión inferencial inicial y operaciones aditivas con canje.',
  },
  {
    valor: '3.° de Primaria',
    etiqueta: '3.° Grado de Primaria (Ciclo IV)',
    nivel: 'Primaria',
    ciclo: 'Ciclo IV',
    edadesReferencia: '8 a 9 años',
    descripcionCiclo:
      'Complejización hacia operaciones multiplicativas, fracciones usuales, textos expositivos e indagación guiada.',
  },
  {
    valor: '4.° de Primaria',
    etiqueta: '4.° Grado de Primaria (Ciclo IV)',
    nivel: 'Primaria',
    ciclo: 'Ciclo IV',
    edadesReferencia: '9 a 10 años',
    descripcionCiclo:
      'Dominio de relaciones de equivalencia, comprensión crítica de fuentes diversas y producción escrita estructurada.',
  },
  {
    valor: '5.° de Primaria',
    etiqueta: '5.° Grado de Primaria (Ciclo V)',
    nivel: 'Primaria',
    ciclo: 'Ciclo V',
    edadesReferencia: '10 a 11 años',
    descripcionCiclo:
      'Pensamiento formal inicial, argumentación con fuentes confiables, decimales/porcentajes y deliberación ciudadana.',
  },
  {
    valor: '6.° de Primaria',
    etiqueta: '6.° Grado de Primaria (Ciclo V)',
    nivel: 'Primaria',
    ciclo: 'Ciclo V',
    edadesReferencia: '11 a 12 años',
    descripcionCiclo:
      'Consolidación de competencias del Nivel Primaria en transición a Secundaria, proyectos de indagación y liderazgo.',
  },
];

/**
 * Catálogo de los 7 Enfoques Transversales Oficiales del CNEB (R.M. N.° 281-2016-MINEDU / R.M. N.° 649-2016-MINEDU)
 * con sus denominaciones normativas exactas, valores y actitudes observables en Educación Primaria.
 */
export const ENFOQUES_TRANSVERSALES_OFICIALES_CNEB: EnfoqueTransversalItem[] = [
  {
    enfoque: 'Enfoque de Derechos',
    valor: 'Conciencia de derechos, libertad y responsabilidad, diálogo y concertación',
    actitudesObservables:
      'Docente y estudiantes deliberan en asamblea para consensuar acuerdos de convivencia y participan democráticamente respetando los turnos de habla y las opiniones de sus compañeros.',
  },
  {
    enfoque: 'Enfoque Inclusivo o de Atención a la Diversidad',
    valor: 'Respeto por las diferencias, equidad en la enseñanza y confianza en la persona',
    actitudesObservables:
      'Docente y estudiantes demuestran tolerancia, apertura y respeto a todos y cada uno, evitando cualquier forma de discriminación y brindando apoyo diferenciado según los ritmos de aprendizaje.',
  },
  {
    enfoque: 'Enfoque Intercultural',
    valor: 'Respeto a la identidad cultural, justicia y diálogo intercultural',
    actitudesObservables:
      'Docente y estudiantes acogen con respeto los saberes familiares, tradiciones orales y prácticas culturales de su localidad, reconociendo su valor en la construcción de aprendizajes.',
  },
  {
    enfoque: 'Enfoque Igualdad de Género',
    valor: 'Igualdad y dignidad, justicia y empatía',
    actitudesObservables:
      'Docente y estudiantes asumen responsabilidades de liderazgo, organización de materiales y vocería de equipo en igualdad de condiciones entre niñas y niños.',
  },
  {
    enfoque: 'Enfoque Ambiental',
    valor: 'Solidaridad planetaria, justicia y solidaridad, respeto a toda forma de vida',
    actitudesObservables:
      'Docente y estudiantes realizan acciones concretas de segregación de residuos sólidos, uso responsable del agua y conservación de los espacios verdes de la escuela y comunidad.',
  },
  {
    enfoque: 'Enfoque de Orientación al Bien Común',
    valor: 'Equidad y justicia, solidaridad, empatía y responsabilidad',
    actitudesObservables:
      'Los estudiantes comparten solidariamente los materiales concretos del aula y los textos de la Biblioteca de Aula Minedu, apoyándose mutuamente para lograr las metas del equipo.',
  },
  {
    enfoque: 'Enfoque de Búsqueda de la Excelencia',
    valor: 'Flexibilidad y apertura, superación personal',
    actitudesObservables:
      'Docente y estudiantes utilizan sus cualidades y recursos al máximo posible para revisar y mejorar sus borradores y producciones a partir de la retroalimentación formativa.',
  },
];

export interface CompetenciaCurricularPrimaria {
  nombre: string;
  capacidades: string[];
  procesosDidacticosCompetencia: string[];
  estandaresPorCiclo: Record<CicloPrimariaCNEB, string>;
}

/**
 * Catálogo de Áreas Curriculares Oficiales de Educación Primaria (R.M. N.° 649-2016-MINEDU),
 * sus Competencias, Capacidades, Estándares por Ciclo (III, IV y V) y Procesos Didácticos por Competencia.
 */
export const AREAS_CURRICULARES_CNEB: {
  area: string;
  enfoqueArea: string;
  procesosDidacticosPrimaria: string[];
  materialesMineduPrimaria: string[];
  competencias: CompetenciaCurricularPrimaria[];
}[] = [
  {
    area: 'Comunicación',
    enfoqueArea: 'Enfoque comunicativo enmarcado en las prácticas sociales del lenguaje',
    procesosDidacticosPrimaria: [
      'Lectura: Antes de la lectura -> Durante la lectura -> Después de la lectura',
      'Escritura: Planificación -> Textualización -> Revisión y publicación',
      'Oralidad: Antes del discurso -> Durante el discurso -> Después del discurso',
    ],
    materialesMineduPrimaria: [
      'Cuaderno de Fichas de Comunicación Primaria (Dotación Minedu)',
      'Letras móviles, tarjetas léxicas y Biblioteca de Aula Minedu',
    ],
    competencias: [
      {
        nombre: 'Se comunica oralmente en su lengua materna',
        capacidades: [
          'Obtiene información del texto oral',
          'Infiere e interpreta información del texto oral',
          'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada',
          'Utiliza recursos no verbales y paraverbales de forma estratégica',
          'Interactúa estratégicamente con distintos interlocutores',
          'Reflexiona y evalúa la forma, el contenido y contexto del texto oral',
        ],
        procesosDidacticosCompetencia: [
          'Antes del discurso / asamblea (definición del propósito comunicativo, organización de ideas previas y acuerdos de escucha activa)',
          'Durante el discurso / asamblea (participación e intercambio oral expresando ideas con coherencia, recursos paraverbales y respeto por los turnos de habla)',
          'Después del discurso / asamblea (reflexión y evaluación sobre lo expresado y escuchado, acuerdos alcanzados y cumplimiento de normas)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Se comunica oralmente mediante diversos tipos de textos; identifica información explícita, infiere e interpreta hechos y temas. Desarrolla sus ideas manteniéndose, por lo general, en el tema; utiliza algunos conectores, así como vocabulario de uso frecuente. Su pronunciación es entendible y se apoya en recursos no verbales y paraverbales. Reflexiona sobre textos escuchados a partir de sus conocimientos y experiencia. Se expresa adecuándose a su propósito comunicativo, interlocutores y contexto. En un intercambio, participa y responde en forma pertinente a lo que le dicen (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Se comunica oralmente mediante diversos tipos de textos; identifica información explícita; infiere e interpreta hechos, tema y propósito. Organiza y desarrolla sus ideas en torno a un tema y las relaciona mediante el uso de algunos conectores y referentes, así como de un vocabulario variado. Se apoya en recursos no verbales y paraverbales para enfatizar lo que dice. Reflexiona sobre textos escuchados a partir de sus conocimientos y experiencia. Se expresa adecuándose a situaciones comunicativas formales e informales. En un intercambio, comienza a adaptar lo que dice a las necesidades y puntos de vista de quien lo escucha, a través de comentarios y preguntas relevantes (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Se comunica oralmente mediante diversos tipos de textos; infiere el tema, propósito, hechos y conclusiones a partir de información explícita, e interpreta la intención del interlocutor en discursos que contienen ironías. Se expresa adecuándose a situaciones comunicativas formales e informales. Organiza y desarrolla sus ideas en torno a un tema y las relaciona mediante el uso de conectores y algunos referentes, así como de un vocabulario variado y pertinente. Usa recursos no verbales y paraverbales para enfatizar lo que dice. Reflexiona y evalúa los textos escuchados a partir de sus conocimientos y el contexto sociocultural. En un intercambio, hace preguntas y contribuciones relevantes que responden a las ideas y puntos de vista de otros, enriqueciendo el tema tratado (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Lee diversos tipos de textos escritos en su lengua materna',
        capacidades: [
          'Obtiene información del texto escrito',
          'Infiere e interpreta información del texto',
          'Reflexiona y evalúa la forma, el contenido y contexto del texto',
        ],
        procesosDidacticosCompetencia: [
          'Antes de la lectura (establecimiento del propósito lector, activación de saberes previos y formulación de hipótesis/predicciones a partir del título, indicios e ilustraciones)',
          'Durante la lectura (lectura silenciosa y releída guiada, identificación de información explícita, subrayado, sumillado y deducción de relaciones lógicas o significado de palabras por contexto)',
          'Después de la lectura (contrastación de hipótesis iniciales, síntesis en organizadores gráficos y reflexión crítica sobre la forma, contenido y mensaje del texto)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Lee diversos tipos de textos de estructura simple en los que predominan palabras conocidas e ilustraciones que apoyan las ideas centrales. Obtiene información poco evidente distinguiéndola de otra semejante y realiza inferencias locales a partir de información explícita. Interpreta el texto considerando información recurrente para construir su sentido global. Opina sobre sucesos e ideas importantes del texto a partir de su propia experiencia (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Lee diversos tipos de textos que presentan estructura simple con algunos elementos complejos y con vocabulario variado. Obtiene información poco evidente distinguiéndola de otras próximas y semejantes. Realiza inferencias locales a partir de información explícita e implícita. Interpreta el texto considerando información relevante para construir su sentido global. Reflexiona sobre sucesos e ideas importantes del texto y explica la intención de los recursos textuales más comunes a partir de su conocimiento y experiencia (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Lee diversos tipos de textos con varios elementos complejos en su estructura y con vocabulario variado. Obtiene información e integra datos que están en distintas partes del texto. Realiza inferencias locales a partir de información explícita e implícita. Interpreta el texto considerando información relevante y complementaria para construir su sentido global. Reflexiona sobre aspectos variados del texto a partir de su conocimiento y experiencia. Evalúa el uso del lenguaje, la intención de los recursos textuales y el efecto del texto en el lector a partir de su conocimiento y del contexto sociocultural (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Escribe diversos tipos de textos en su lengua materna',
        capacidades: [
          'Adecúa el texto a la situación comunicativa',
          'Organiza y desarrolla las ideas de forma coherente y cohesionada',
          'Utiliza convenciones del lenguaje escrito de forma pertinente',
          'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito',
        ],
        procesosDidacticosCompetencia: [
          'Planificación (definición del propósito comunicativo, destinatario, tema, registro lingüístico y organización de ideas en un cuadro de planificación textual)',
          'Textualización (escritura del primer borrador de acuerdo con lo planificado, empleando conectores, vocabulario pertinente y recursos ortográficos según el grado)',
          'Revisión y publicación (lectura reflexiva del borrador contrastándolo con los criterios de la lista de cotejo, corrección entre pares y edición de la versión final para su socialización)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Escribe diversos tipos de textos de forma reflexiva. Adecúa al propósito y el destinatario a partir de su experiencia previa. Organiza y desarrolla lógicamente las ideas en torno a un tema. Establece relaciones entre ideas a través del uso adecuado de algunos tipos de conectores y emplea vocabulario de uso frecuente. Separa adecuadamente las palabras y utiliza algunos recursos ortográficos básicos para darle claridad y sentido a su texto. Reflexiona sobre las ideas más importantes en el texto que escribe y explica acerca del uso de algunos recursos ortográficos según la situación comunicativa (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Escribe diversos tipos de textos de forma reflexiva. Adecúa su texto al destinatario, propósito y el registro a partir de su experiencia previa y de alguna fuente de información. Organiza y desarrolla lógicamente las ideas en torno a un tema. Establece relaciones entre ideas a través del uso adecuado de algunos tipos de conectores y de referentes; emplea vocabulario variado. Utiliza recursos ortográficos básicos para darle claridad y sentido a su texto. Reflexiona sobre la coherencia y cohesión de las ideas en el texto que escribe, y explica acerca del uso de algunos recursos textuales para reforzar sentidos y producir efectos en el lector según la situación comunicativa (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Escribe diversos tipos de textos de forma reflexiva. Adecúa su texto al destinatario, propósito y el registro, a partir de su experiencia previa y de algunas fuentes de información complementarias. Organiza y desarrolla lógicamente las ideas en torno a un tema y las estructura en párrafos. Establece relaciones entre ideas a través del uso adecuado de algunos tipos de conectores y de referentes; emplea vocabulario variado. Utiliza recursos ortográficos para separar expresiones, ideas y párrafos con la intención de darle claridad y sentido a su texto. Reflexiona y evalúa de manera permanente la coherencia y cohesión de las ideas en el texto que escribe (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Matemática',
    enfoqueArea:
      'Enfoque centrado en la resolución de problemas (mediación Concreto - Pictórico - Simbólico)',
    procesosDidacticosPrimaria: [
      '1. Familiarización con el problema (comprensión de datos e incógnita)',
      '2. Búsqueda y ejecución de estrategias (manipulación de material concreto)',
      '3. Socialización de sus representaciones (vivencial, concreto, pictórico, gráfico y simbólico)',
      '4. Reflexión y formalización (consolidación de conceptos y procedimientos)',
      '5. Planteamiento de otros problemas (transferencia a nuevas situaciones)',
    ],
    materialesMineduPrimaria: [
      'Cuaderno de Fichas de Matemática Primaria (Dotación Minedu)',
      'Material Base Diez, Regletas de Cuisenaire, Geoplano, Tiras de fracciones, Ábaco y Bloques lógicos',
    ],
    competencias: [
      {
        nombre: 'Resuelve problemas de cantidad',
        capacidades: [
          'Traduce cantidades a expresiones numéricas',
          'Comunica su comprensión sobre los números y las operaciones',
          'Usa estrategias y procedimientos de estimación y cálculo',
          'Argumenta afirmaciones sobre las relaciones numéricas y las operaciones',
        ],
        procesosDidacticosCompetencia: [
          '1. Familiarización con el problema (lectura comprensiva de la situación problemática, identificación de datos, condiciones y qué nos pide resolver)',
          '2. Búsqueda y ejecución de estrategias (exploración en equipos manipulando Material Base Diez, regletas de Cuisenaire, tiras de fracciones o ábaco)',
          '3. Socialización de sus representaciones (explicación del tránsito de la representación concreta a la pictórica, gráfica y simbólica)',
          '4. Reflexión y formalización (consolidación de las nociones numéricas u operativas y reflexión sobre los procedimientos empleados)',
          '5. Planteamiento de otros problemas (aplicación y transferencia de lo aprendido a nuevos retos del Cuaderno de Fichas Minedu)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Resuelve problemas referidos a acciones de juntar, separar, agregar, quitar, igualar y comparar cantidades; y las traduce a expresiones de adición y sustracción, doble y mitad. Expresa su comprensión del valor de posición en números de dos cifras y los representa mediante equivalencias entre unidades y decenas. Así también, expresa mediante representaciones su comprensión del doble y mitad de una cantidad; usa lenguaje numérico. Emplea estrategias diversas y procedimientos de cálculo y comparación de cantidades; mide y compara el tiempo y la masa, usando unidades no convencionales. Explica por qué debe sumar o restar en una situación y su proceso de resolución (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Resuelve problemas referidos a una o más acciones de agregar, quitar, igualar, repetir o repartir una cantidad, combinar dos colecciones de objetos, así como partir una unidad en partes iguales; traduciéndolas a expresiones aditivas y multiplicativas con números naturales y expresiones aditivas con fracciones usuales. Expresa su comprensión del valor posicional en números de hasta cuatro cifras y los representa mediante equivalencias, así también la comprensión de las nociones de multiplicación, sus propiedades conmutativa y asociativa y las nociones de división, la noción de fracción como parte – todo y las equivalencias entre fracciones usuales; usando lenguaje numérico y diversas representaciones (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Resuelve problemas referidos a una o más acciones de comparar, igualar, repetir o repartir cantidades, partir y repartir una cantidad en partes iguales; las traduce a expresiones aditivas, multiplicativas y la potenciación cuadrada y cúbica; así como a expresiones de adición, sustracción y multiplicación con fracciones y decimales (hasta el centésimo). Expresa su comprensión del sistema de numeración decimal con números naturales hasta seis cifras, de divisores y múltiplos, y del valor posicional de los números decimales hasta los centésimos; con lenguaje numérico y representaciones diversas (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio',
        capacidades: [
          'Traduce datos y condiciones a expresiones algebraicas y gráficas',
          'Comunica su comprensión sobre las relaciones algebraicas',
          'Usa estrategias y procedimientos para encontrar equivalencias y reglas generales',
          'Argumenta afirmaciones sobre relaciones de cambio y equivalencia',
        ],
        procesosDidacticosCompetencia: [
          '1. Familiarización con el problema (identificación de regularidades, patrones de repetición/aditivos o relaciones de equivalencia en la situación)',
          '2. Búsqueda y ejecución de estrategias (manipulación de regletas de Cuisenaire, balanzas o bloques lógicos para descubrir la regla de formación o equivalencia)',
          '3. Socialización de sus representaciones (presentación de tablas, esquemas gráficos e igualdades simbólicas)',
          '4. Reflexión y formalización (deducción conjunta de la regla general del patrón o propiedad de equivalencia)',
          '5. Planteamiento de otros problemas (creación y resolución de nuevos patrones y situaciones de equivalencia)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Resuelve problemas que presentan equivalencias o regularidades, traduciéndolas a igualdades que contienen operaciones de adición o de sustracción y a patrones de repetición de dos criterios perceptuales y patrones aditivos. Expresa su comprensión de las equivalencias y de cómo es un patrón, usando material concreto y diversas representaciones. Emplea estrategias, la descomposición de números, cálculos sencillos para encontrar equivalencias, o para continuar y crear patrones. Explica las relaciones que encuentra en los patrones y lo que debe hacer para mantener el "equilibrio" o la igualdad, con base en experiencias y ejemplos concretos (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Resuelve problemas que presentan dos equivalencias, regularidades o relación de cambio entre dos magnitudes y expresiones; traduciéndolas a igualdades que contienen operaciones aditivas o multiplicativas, a tablas de valores y a patrones de repetición que combinan criterios y patrones aditivos o multiplicativos. Expresa su comprensión de la regla de formación de un patrón y del signo igual para expresar equivalencias. Así también, describe la relación de cambio entre una magnitud y otra; usando lenguaje matemático y diversas representaciones (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Resuelve problemas de equivalencias, regularidades o relaciones de cambio entre dos magnitudes o entre expresiones; traduciéndolas a ecuaciones que combinan las cuatro operaciones, a expresiones de desigualdad o a relaciones de proporcionalidad directa, y patrones de repetición que combinan criterios geométricos y cuya regla de formación se asocia a la posición de sus elementos. Expresa su comprensión del término general de un patrón, las condiciones de desigualdad expresadas con los signos > y <, así como de la relación proporcional como un cambio constante; usando lenguaje matemático y diversas representaciones (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Resuelve problemas de forma, movimiento y localización',
        capacidades: [
          'Modela objetos con formas geométricas y sus transformaciones',
          'Comunica su comprensión sobre las formas y relaciones geométricas',
          'Usa estrategias y procedimientos para medir y orientarse en el espacio',
          'Argumenta afirmaciones sobre relaciones geométricas',
        ],
        procesosDidacticosCompetencia: [
          '1. Familiarización con el problema (exploración de las características geométricas, medidas o ubicación espacial planteadas en el reto)',
          '2. Búsqueda y ejecución de estrategias (construcción y medición con geoplano, tangram, poliedros desarmables, cuadrículas o cinta métrica)',
          '3. Socialización de sus representaciones (explicación de croquis, planos, dibujos geométricos y medidas halladas)',
          '4. Reflexión y formalización (sistematización de propiedades de las formas bidimensionales/tridimensionales, perímetro, área o desplazamientos)',
          '5. Planteamiento de otros problemas (resolución de nuevos desafíos geométricos y espaciales del entorno)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Resuelve problemas en los que modela las características y datos de ubicación de los objetos del entorno a formas bidimensionales y tridimensionales, sus elementos, posición y desplazamientos. Describe estas formas mediante sus elementos: número de lados, esquinas, lados curvos y rectos; número de puntas caras, formas de sus caras, usando representaciones concretas y dibujos. Así también traza y describe desplazamientos y posiciones, en cuadriculados y puntos de referencia usando algunos términos del lenguaje geométrico (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Resuelve problemas en los que modela características y datos de ubicación de los objetos a formas bidimensionales y tridimensionales, sus elementos, propiedades, su movimiento y ubicación en el plano cartesiano. Describe con lenguaje geométrico, estas formas reconociendo ángulos rectos, número de lados y vértices del polígono, así como líneas paralelas y perpendiculares, identifica formas simétricas y realiza traslaciones, en cuadrículas. Así también elabora croquis, donde traza y describe desplazamientos y posiciones, usando puntos de referencia (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Resuelve problemas en los que modela las características y la ubicación de objetos a formas bidimensionales y tridimensionales, sus propiedades, su ampliación, reducción o rotación. Describe y clasifica prismas rectos, cuadriláteros, triángulos, círculos, por sus elementos: vértices, lados, caras, ángulos, y por sus propiedades; usando lenguaje geométrico. Realiza giros en cuartos y medias vueltas, traslaciones, ampliación y reducción de formas bidimensionales, en el plano cartesiano. Describe recorridos y ubicaciones en planos. Emplea procedimientos e instrumentos para ampliar, reducir, girar y construir formas; así como para estimar o medir la longitud, superficie y capacidad de los objetos (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre',
        capacidades: [
          'Representa datos con gráficos y medidas estadísticas o probabilísticas',
          'Comunica su comprensión de los conceptos estadísticos y probabilísticos',
          'Usa estrategias y procedimientos para recopilar y procesar datos',
          'Sustenta conclusiones o decisiones con base en la información obtenida',
        ],
        procesosDidacticosCompetencia: [
          '1. Familiarización con el problema (comprensión de la necesidad de recoger o analizar información estadística o situaciones de azar en el aula)',
          '2. Búsqueda y ejecución de estrategias (aplicación de encuestas breves, conteo con material concreto y organización en tablas de frecuencia)',
          '3. Socialización de sus representaciones (elaboración y exposición de pictogramas, gráficos de barras simples o dobles y medidas de tendencia central)',
          '4. Reflexión y formalización (interpretación de la moda, media aritmética o probabilidad y formulación de conclusiones sustentadas en los datos)',
          '5. Planteamiento de otros problemas (análisis de nuevas tablas y gráficos estadísticos de su comunidad)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Resuelve problemas relacionados con datos cualitativos en situaciones de su interés, recolecta datos a través de preguntas sencillas, los registra en listas o tablas de conteo simple (frecuencia) y los organiza en pictogramas horizontales y gráficos de barras simples. Lee la información contenida en estas tablas o gráficos identificando el dato o datos que tuvieron mayor o menor frecuencia y explica sus decisiones basándose en la información producida. Expresa la ocurrencia de sucesos cotidianos usando las nociones de posible o imposible y justifica su respuesta (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Resuelve problemas relacionados con datos cualitativos o cuantitativos (discretos) sobre un tema de estudio, recolecta datos a través de encuestas y entrevistas sencillas, registra en tablas de frecuencia simples y los representa en pictogramas, gráficos de barra simple con escala (múltiplos de diez). Interpreta información contenida en gráficos de barras simples y dobles y tablas de doble entrada, comparando frecuencias y usando el significado de la moda de un conjunto de datos; a partir de esta información, elabora algunas conclusiones y toma decisiones. Expresa la ocurrencia de sucesos cotidianos usando las nociones de seguro, más probable, menos probable, y justifica su respuesta (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Resuelve problemas relacionados con temas de estudio, en los que reconoce variables cualitativas o cuantitativas discretas, recolecta datos a través de encuestas y de diversas fuentes de información. Selecciona tablas de doble entrada, gráficos de barras dobles y gráficos de líneas, seleccionando el más adecuado para representar los datos. Usa el significado de la moda para interpretar información contenida en gráficos y en diversas fuentes de información. Realiza experimentos aleatorios, reconoce sus posibles resultados y expresa la probabilidad de un evento relacionando el número de casos favorables y el total de casos posibles (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Personal Social',
    enfoqueArea: 'Enfoque de desarrollo personal y ciudadanía activa',
    procesosDidacticosPrimaria: [
      '1. Problematización (dilemas morales, asuntos públicos o situaciones cotidianas del aula/comunidad)',
      '2. Análisis de información (búsqueda y contrastación en fuentes primarias, secundarias y testimonios)',
      '3. Acuerdo o toma de decisiones (compromisos individuales o colectivos orientados al bien común)',
    ],
    materialesMineduPrimaria: [
      'Cuadernillo de Fichas de Personal Social Primaria Minedu',
      'Láminas históricas, mapas físico-políticos del Perú y fuentes orales de la comunidad',
    ],
    competencias: [
      {
        nombre: 'Construye su identidad',
        capacidades: [
          'Se valora a sí mismo',
          'Autorregula sus emociones',
          'Reflexiona y argumenta éticamente',
          'Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez',
        ],
        procesosDidacticosCompetencia: [
          '1. Problematización (presentación de una vivencia, dilema ético o situación emocional cercana a los niños y niñas para despertar cuestionamientos)',
          '2. Análisis de información (reflexión individual y grupal contrastando sus experiencias con textos del Cuadernillo Minedu, estrategias de autorregulación y saberes culturales)',
          '3. Acuerdo o toma de decisiones (adopción de compromisos personales y colectivos para el fortalecimiento de la autoestima, el autocuidado y el respeto mutuo)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Construye su identidad al tomar conciencia de los aspectos que lo hacen único, cuando se reconoce a sí mismo a partir de sus características físicas, habilidades y gustos. Se da cuenta que es capaz de realizar tareas y aceptar retos. Disfruta de ser parte de su familia, escuela y comunidad. Reconoce y expresa sus emociones y las regula a partir de la interacción con sus compañeros y docente, y de las normas establecidas de manera conjunta (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Construye su identidad al tomar conciencia de los aspectos que lo hacen único, cuando se reconoce a sí mismo a partir de sus características físicas, cualidades, habilidades, intereses y logros y valora su pertenencia familiar y escolar. Distingue sus diversas emociones y comportamientos, menciona las causas y las consecuencias de estos y las regula usando estrategias diversas. Explica con sus propios argumentos por qué considera buenas o malas determinadas acciones (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Construye su identidad al tomar conciencia de los aspectos que lo hacen único, cuando se reconoce a sí mismo a partir de sus características personales, sus capacidades y limitaciones reconociendo el papel de las familias en la formación de dichas características. Aprecia su pertenencia cultural a un país diverso. Explica las causas y consecuencias de sus emociones, y utiliza estrategias para regularlas. Manifiesta su punto de vista frente a situaciones de conflicto moral, en función de cómo estas le afectan a él o a los demás (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Convive y participa democráticamente en la búsqueda del bien común',
        capacidades: [
          'Interactúa con todas las personas',
          'Construye normas y asume acuerdos y leyes',
          'Maneja conflictos de manera constructiva',
          'Delibera sobre asuntos públicos',
          'Participa en acciones que promueven el bien común',
        ],
        procesosDidacticosCompetencia: [
          '1. Problematización (identificación de un asunto público escolar/local o situación de convivencia en el aula que requiere deliberación)',
          '2. Análisis de información (indagación en fuentes diversas, normas escolares y derechos del niño para comprender las causas del problema y los distintos puntos de vista)',
          '3. Acuerdo o toma de decisiones (deliberación democrática, construcción consensuada de acuerdos/normas o diseño de acciones colectivas orientadas al bien común)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Convive y participa democráticamente cuando se relaciona con los demás respetando las diferencias y cumpliendo con sus deberes. Conoce las costumbres y características de las personas de su localidad o región. Construye de manera colectiva acuerdos y normas. Usa estrategias sencillas para resolver conflictos. Realiza acciones específicas para el beneficio de todos a partir de la deliberación sobre asuntos de interés común tomando como fuente sus experiencias previas (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Convive y participa democráticamente cuando se relaciona con los demás respetando las diferencias, expresando su desacuerdo frente a situaciones que vulneran la convivencia y cumpliendo con sus deberes. Conoce las manifestaciones culturales de su localidad, región o país. Construye y evalúa acuerdos y normas tomando en cuenta el punto de vista de los demás. Recurre al diálogo para manejar conflictos. Propone y realiza acciones colectivas orientadas al bien común a partir de la deliberación sobre asuntos de interés público (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Convive y participa democráticamente cuando se relaciona con los demás, respetando las diferencias, los derechos de cada uno, cumpliendo y evaluando sus deberes. Se interesa por relacionarse con personas de culturas distintas y conocer sus costumbres. Construye y evalúa normas de convivencia tomando en cuenta sus derechos. Maneja conflictos utilizando el diálogo y la mediación con base en criterios de igualdad o equidad. Propone, planifica y realiza acciones colectivas orientadas al bien común, la solidaridad, la protección de las personas vulnerables y la defensa de sus derechos. Delibera sobre asuntos de interés público con argumentos basados en fuentes y toma en cuenta la opinión de los demás (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Construye interpretaciones históricas',
        capacidades: [
          'Interpreta críticamente fuentes diversas',
          'Comprende el tiempo histórico',
          'Elabora explicaciones sobre procesos históricos',
        ],
        procesosDidacticosCompetencia: [
          '1. Problematización (planteamiento de preguntas retadoras sobre cambios y permanencias entre el pasado y el presente de la familia, comunidad o el Perú)',
          '2. Análisis de información (observación y contrastación de fuentes primarias, objetos, fotografías, testimonios orales y textos históricos ordenados en líneas de tiempo)',
          '3. Acuerdo o toma de decisiones (elaboración de explicaciones históricas sobre las causas y consecuencias de los hechos y compromisos de valoración del patrimonio cultural)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Construye interpretaciones históricas en las que describe los cambios ocurridos en su familia y comunidad a partir de comparar el presente y el pasado, y de reconocer algunas causas y consecuencias de estos cambios. Obtiene información sobre el pasado de diversos tipos de fuentes, así como expresiones temporales propias de la vida cotidiana. Secuencia hechos o acciones cotidianas ocurridos en periodos de tiempo cortos e identifica acciones simultáneas (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Construye interpretaciones históricas en las que narra hechos y procesos relacionados a la historia de su región, en los que incorpora más de una dimensión y reconoce diversas causas y consecuencias. Utiliza información de diversas fuentes a partir de identificar las más pertinentes para responder sus preguntas. Organiza secuencias para comprender cambios ocurridos a través del tiempo, aplicando términos relacionados al tiempo (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Construye interpretaciones históricas en las que explica, de manera general, procesos históricos peruanos, empleando algunas categorías temporales. Identifica las causas inmediatas y lejanas que desencadenaron dichos procesos, así como las consecuencias cuyos efectos se ven de inmediato o a largo plazo. Ordena cronológicamente procesos históricos peruanos y describe algunos cambios, permanencias y simultaneidades producidos en ellos. Utiliza información de diversas fuentes a partir de identificar su origen y distinguiendo algunas diferencias entre las versiones que dan sobre los procesos históricos (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Gestiona responsablemente el espacio y el ambiente',
        capacidades: [
          'Comprende las relaciones entre los elementos naturales y sociales',
          'Maneja fuentes de información para comprender el espacio geográfico y el ambiente',
          'Genera acciones para conservar el ambiente local y global',
        ],
        procesosDidacticosCompetencia: [
          '1. Problematización (identificación de una problemática socioambiental o riesgo de desastre en la escuela, barrio o región)',
          '2. Análisis de información (lectura de croquis, planos, mapas físico-políticos y fuentes sobre las relaciones entre elementos naturales y sociales)',
          '3. Acuerdo o toma de decisiones (propuesta y ejecución de acciones prácticas de prevención de riesgos y cuidado del ambiente escolar y comunal)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Gestiona responsablemente el espacio y ambiente al desarrollar actividades sencillas frente a los problemas y peligros que lo afectan. Explica de manera sencilla las relaciones directas que se dan entre los elementos naturales y sociales de su espacio cotidiano. Utiliza puntos de referencia para ubicarse, desplazarse y representar su espacio (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Gestiona responsablemente el espacio y ambiente al realizar actividades específicas para su cuidado a partir de reconocer las causas y consecuencias de los problemas ambientales. Reconoce cómo sus acciones cotidianas impactan en el ambiente, en el calentamiento global y en su bienestar, e identifica los lugares vulnerables y seguros de su escuela, frente a riesgos de desastres. Describe las características de los espacios geográficos y el ambiente de su localidad o región (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Gestiona responsablemente el espacio y ambiente al realizar frecuentemente actividades para su cuidado y al disminuir los factores de vulnerabilidad frente al cambio climático y a los riesgos de desastres en su escuela. Utiliza distintas fuentes y herramientas cartográficas y socioculturales para ubicar elementos en el espacio geográfico y el ambiente, y compara estos espacios a diferentes escalas considerando la acción de los actores sociales. Explica las problemáticas ambientales y territoriales a partir de sus causas, consecuencias y sus manifestaciones a diversas escalas (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Gestiona responsablemente los recursos económicos',
        capacidades: [
          'Comprende las relaciones entre los elementos del sistema económico y financiero',
          'Toma decisiones económicas y financieras',
        ],
        procesosDidacticosCompetencia: [
          '1. Problematización (planteamiento de situaciones cotidianas sobre el uso de bienes, servicios, ahorro familiar o consumo responsable en la comunidad)',
          '2. Análisis de información (revisión de fuentes sobre las actividades económicas locales, el valor del trabajo familiar y el presupuesto básico)',
          '3. Acuerdo o toma de decisiones (compromisos de ahorro de recursos escolares/familiares y consumo responsable)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Gestiona responsablemente los recursos económicos al utilizar los bienes y servicios con los que cuenta en su familia y en la escuela, y reconociendo que las personas y las instituciones de su comunidad desarrollan actividades económicas para satisfacer sus necesidades y que contribuyen a su bienestar (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Gestiona responsablemente los recursos económicos al diferenciar entre necesidades y deseos, y al usar los servicios públicos de su espacio cotidiano, reconociendo que tienen un costo. Reconoce que los miembros de su comunidad se vinculan al desempeñar distintas actividades económicas y que estas actividades inciden en su bienestar y en el de las otras personas (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Gestiona responsablemente los recursos económicos al utilizar el dinero y otros recursos como consumidor informado y al realizar acciones de ahorro, inversión y cuidado de ellos. Explica el papel de la publicidad frente a las decisiones de consumo y en la planificación de los presupuestos personales y familiares, así como la importancia de cumplir con el pago de impuestos, tributos y deudas como medio para el bienestar común (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Ciencia y Tecnología',
    enfoqueArea: 'Enfoque de indagación y alfabetización científica y tecnológica',
    procesosDidacticosPrimaria: [
      '1. Planteamiento del problema (pregunta de indagación investigable por niños de primaria)',
      '2. Planteamiento de hipótesis (posibles respuestas desde sus saberes previos)',
      '3. Elaboración del plan de acción (selección de materiales del módulo de ciencias y pasos de experiencia)',
      '4. Recojo de datos y análisis de resultados (comparación con fuentes científicas escolares)',
      '5. Estructuración del saber construido como respuesta al problema',
      '6. Evaluación y comunicación de hallazgos',
    ],
    materialesMineduPrimaria: [
      'Módulo de Ciencia y Tecnología Primaria Minedu (Torso humano, Kit de peso, volumen y medida, Kit de hidroponía)',
      'Cuaderno de experiencias científicas y lupas entomológicas',
    ],
    competencias: [
      {
        nombre: 'Indaga mediante métodos científicos para construir conocimientos',
        capacidades: [
          'Problematiza situaciones para hacer indagación',
          'Diseña estrategias para hacer indagación',
          'Genera y registra datos e información',
          'Analiza datos e información',
          'Evalúa y comunica el proceso y resultados de su indagación',
        ],
        procesosDidacticosCompetencia: [
          '1. Planteamiento del problema (observación de un fenómeno del entorno y formulación de la pregunta de indagación investigable)',
          '2. Planteamiento de hipótesis (formulación de conjeturas o respuestas iniciales que relacionan las variables del problema)',
          '3. Elaboración del plan de acción (acuerdo sobre qué actividades realizar, qué instrumentos del Módulo de Ciencia Minedu usar y cómo registrar los datos)',
          '4. Recojo de datos y análisis de resultados (ejecución de la experiencia práctica, registro en tablas del cuaderno de experiencias y contrastación con fuentes confiables)',
          '5. Estructuración del saber construido como respuesta al problema (validación o refutación de la hipótesis inicial y redacción de conclusiones científicas)',
          '6. Evaluación y comunicación (socialización de los hallazgos, dificultades superadas y nuevas preguntas surgidas)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Indaga al explorar objetos o fenómenos, al hacer preguntas, proponer posibles respuestas y actividades para obtener información sobre las características y relaciones que establece sobre estos. Sigue un procedimiento para observar, manipular, describir y comparar sus ensayos y los utiliza para elaborar conclusiones. Expresa en forma oral, escrita o gráfica lo realizado, aprendido y las dificultades de su indagación (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Indaga al establecer las causas de un hecho o fenómeno para formular preguntas y posibles respuestas sobre estos con base en sus experiencias. Propone estrategias para obtener información sobre el hecho o fenómeno y sus posibles causas, registra datos, los analiza estableciendo relaciones y evidencias de causalidad. Comunica en forma oral, escrita o gráfica sus procedimientos, dificultades, conclusiones y dudas (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Indaga las causas o describe un objeto o fenómeno que identifica para formular preguntas e hipótesis en las que relaciona las variables que intervienen y que se pueden observar. Propone estrategias para observar o generar una situación controlada en la cual registra evidencias de cómo una variable independiente afecta a otra dependiente. Establece relaciones entre los datos, los interpreta y los contrasta con información confiable. Evalúa y comunica sus conclusiones y procedimientos (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre:
          'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo',
        capacidades: [
          'Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo',
          'Evalúa las implicancias del saber y del quehacer científico y tecnológico',
        ],
        procesosDidacticosCompetencia: [
          '1. Planteamiento del problema (formulación de una pregunta de explicación científica sobre el funcionamiento de seres vivos, materia, energía o ambiente)',
          '2. Planteamiento de explicaciones preliminares / postura personal (registro de respuestas iniciales desde los saberes previos de los niños)',
          '3. Elaboración del plan de acción (definición de la ruta de búsqueda de información en textos científicos Minedu y observación con maquetas/módulos)',
          '4. Recojo de datos y análisis de resultados (lectura comprensiva de fuentes científicas escolares, observación del Torso humano/kits y elaboración de esquemas)',
          '5. Estructuración del saber construido (contrastación de la explicación inicial con la información científica para redactar la explicación final con respaldo en evidencias)',
          '6. Evaluación y comunicación (exposición de razones científicas y valoración del impacto en la salud y el ambiente)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Explica, con base en sus observaciones y experiencias previas, las relaciones entre: las características de los materiales con los cambios que sufren por acción de la luz, del calor y del movimiento; la estructura de los seres vivos con sus funciones y su desarrollo; la Tierra, sus componentes y movimientos con los seres que lo habitan. Opina sobre los impactos del uso de objetos tecnológicos en relación a sus necesidades y estilo de vida (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Explica, con base en evidencias documentadas con respaldo científico, las relaciones que establece entre: las fuentes de energía o sus manifestaciones con los tipos de cambio que producen en los materiales; entre las fuerzas con el movimiento de los cuerpos; la estructura de los sistemas vivos con sus funciones y su agrupación en especies; la radiación del sol con las zonas climáticas de la Tierra y las adaptaciones de los seres vivos. Opina sobre los impactos de diversas tecnologías en la solución de problemas relacionados a necesidades y estilos de vida colectivas (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Explica, con base en evidencia con respaldo científico, las relaciones entre: propiedades o funciones macroscópicas de los cuerpos, materiales o seres vivos con su estructura y movimiento microscópico; la reproducción sexual con la diversidad genética; los ecosistemas con la diversidad de especies; el relieve con la actividad interna de la Tierra. Relaciona el descubrimiento científico o la innovación tecnológica con sus impactos. Justifica su posición frente a situaciones controversiales sobre el uso de la tecnología y el saber científico (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno',
        capacidades: [
          'Determina una alternativa de solución tecnológica',
          'Diseña la alternativa de solución tecnológica',
          'Implementa y valida la alternativa de solución tecnológica',
          'Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica',
        ],
        procesosDidacticosCompetencia: [
          '1. Planteamiento del problema tecnológico (identificación de una necesidad concreta del aula o comunidad que puede resolverse con un prototipo)',
          '2. Planteamiento de soluciones (propuesta de una alternativa de solución tecnológica factible con materiales del entorno)',
          '3. Diseño del prototipo (dibujo estructurado de las partes o etapas de construcción, selección de herramientas, materiales y medidas de seguridad)',
          '4. Construcción y validación del prototipo (armado en equipos siguiendo el diseño, puesta a prueba de su funcionamiento y ajustes necesarios)',
          '5. Estructuración del saber construido como respuesta al problema (explicación de los principios científicos aplicados en el prototipo)',
          '6. Evaluación y comunicación (demostración del funcionamiento del prototipo y valoración de su impacto ambiental y social)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Diseña y construye soluciones tecnológicas al establecer las causas de un problema tecnológico y propone alternativas de solución. Representa una, incluyendo sus partes, a través de esquemas o dibujos y describe la secuencia de pasos para implementarla, usando herramientas y materiales seleccionados. Realiza ajustes en el proceso de construcción de la solución tecnológica. Describe el procedimiento y beneficios de la solución tecnológica; evalúa su funcionamiento según los requerimientos establecidos y propone mejoras (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Diseña y construye soluciones tecnológicas al establecer las posibles causas que generan problemas tecnológicos; propone alternativas de solución con conocimientos científicos. Representa una de ellas, incluyendo las partes o etapas, a través de esquemas o dibujos; establece características de forma, estructura y función y explica una secuencia de pasos para implementarla usando herramientas y materiales; verifica el funcionamiento de la solución tecnológica y realiza ajustes. Explica el procedimiento, conocimiento científico aplicado y beneficios de la solución tecnológica; evalúa su funcionamiento considerando los requerimientos establecidos y propone mejoras (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Diseña y construye soluciones tecnológicas al identificar las causas que generan problemas tecnológicos y propone alternativas de solución con base en conocimientos científicos. Representa una de ellas incluyendo sus partes o etapas, a través de esquemas o dibujos estructurados. Establece características de forma, estructura y función y explica el procedimiento, los recursos de implementación; los ejecuta usando herramientas y materiales seleccionados; verifica el funcionamiento de la solución tecnológica detectando imprecisiones y realiza ajustes para mejorarlo. Explica el procedimiento, conocimiento científico aplicado y limitaciones de la solución tecnológica. Evalúa su funcionamiento a través de pruebas considerando los requerimientos establecidos y propone mejoras. Infiere impactos de la solución tecnológica (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Arte y Cultura',
    enfoqueArea: 'Enfoque multicultural e interdisciplinario',
    procesosDidacticosPrimaria: [
      'Apreciación crítica: Reacción inmediata -> Descripción -> Análisis e interpretación -> Expresión de un punto de vista',
      'Creación artística: Desafiar e inspirar -> Imaginar y generar ideas -> Planificar -> Explorar y experimentar -> Producir trabajos preliminares -> Revisar y afinar -> Presentar y compartir',
    ],
    materialesMineduPrimaria: [
      'Kit de expresión gráfico-plástica, instrumentos musicales escolares (quena, cajón, xilófono) y retablos',
    ],
    competencias: [
      {
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales',
        capacidades: [
          'Percibe manifestaciones artístico-culturales',
          'Contextualiza manifestaciones artístico-culturales',
          'Reflexiona creativa y críticamente sobre manifestaciones artístico-culturales',
        ],
        procesosDidacticosCompetencia: [
          '1. Reacción inmediata (expresión espontánea de primeras impresiones, sensaciones y emociones al observar o escuchar la manifestación artístico-cultural)',
          '2. Descripción (identificación ordenada de los elementos visuales, sonoros o corporales que componen la obra)',
          '3. Análisis e interpretación (indagación sobre el contexto cultural e histórico de la obra y deducción de los significados que transmite)',
          '4. Consideración del contexto cultural y expresión de un punto de vista (valoración crítica e informada sobre el aporte de la manifestación artística a la identidad comunitaria)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Aprecia de manera crítica manifestaciones artístico-culturales al observar, escuchar y describir las características visuales, táctiles, sonoras y kinestésicas de estas manifestaciones, describiendo las sensaciones que le transmiten. Participa de conversaciones sobre los contextos donde se originan manifestaciones artístico-culturales y reconoce que responden a características propias de un grupo de personas, de tiempos y lugares diferentes. Expresa sus preferencias sobre manifestaciones artísticas que observa o experimenta y conversa sobre los temas, las ideas y sentimientos que comunican (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Aprecia de manera crítica manifestaciones artístico-culturales al observar, escuchar y describir las características claves de una manifestación artístico-cultural, su forma, los medios que utiliza, su temática; describe las ideas o sentimientos que comunica. Investiga los contextos donde se origina e infiere información acerca del lugar, la época y la cultura donde fue creada. Integra la información recogida y describe de qué manera una manifestación artístico-cultural comunica ideas, sentimientos e intenciones (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Aprecia de manera crítica manifestaciones artístico-culturales al interpretar las cualidades expresivas de los elementos del arte, la estructura y los medios utilizados en una manifestación artístico-cultural y explica cómo transmite mensajes, ideas y sentimientos. Investiga los contextos donde se originan manifestaciones artístico-culturales tradicionales y contemporáneas e identifica cómo los cambios, las tradiciones, las creencias y los valores revelan la manera en que una determinada persona o sociedad ha vivido. Genera hipótesis sobre el significado y las diversas intenciones que puede tener una manifestación creada en contextos históricos y culturales diferentes (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Crea proyectos desde los lenguajes artísticos',
        capacidades: [
          'Explora y experimenta los lenguajes artísticos',
          'Aplica procesos creativos',
          'Evalúa y comunica sus procesos y proyectos',
        ],
        procesosDidacticosCompetencia: [
          '1. Desafiar e inspirar (presentación de un estímulo artístico o reto creativo conectado con las vivencias de los niños)',
          '2. Imaginar y generar ideas (lluvia de ideas y bocetos iniciales para responder al desafío artístico)',
          '3. Planificar (selección de materiales del entorno o del kit artístico y organización del trabajo)',
          '4. Explorar y experimentar (prueba libre y guiada de texturas, colores, ritmos, sonidos o movimientos corporales)',
          '5. Producir trabajos preliminares (elaboración de la propuesta artística aplicando los elementos del lenguaje elegido)',
          '6. Revisar y afinar los detalles (mejora del trabajo a partir de la retroalimentación del docente y compañeros)',
          '7. Presentar y compartir (exposición del proyecto artístico y reflexión sobre el proceso creativo seguido)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Crea proyectos artísticos que demuestran habilidades artísticas iniciales para comunicar ideas, sentimientos, observaciones y experiencias. Experimenta, selecciona y explora libremente las posibilidades expresivas de los elementos, medios, materiales y técnicas de los diversos lenguajes del arte. Explora ideas que surgen de su imaginación, sus experiencias o de sus observaciones y las concretiza en trabajos de artes visuales, música, teatro o danza. Comparte sus experiencias y creaciones con sus compañeros y su familia (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Crea proyectos artísticos en una variedad de lenguajes que comunican experiencias, ideas, sentimientos y observaciones. Explora, selecciona y combina los elementos del arte y utiliza medios, materiales, herramientas y técnicas de los diversos lenguajes del arte para expresar de diferentes maneras sus ideas y resolver problemas creativos. Demuestra habilidad para planificar trabajos usando sus conocimientos del arte y adecúa sus procesos para ajustarse a diferentes intenciones, que se basan en observaciones o problemas del entorno natural, artístico y cultural (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Crea proyectos artísticos individuales o colaborativos explorando formas alternativas de combinar y usar elementos, medios, materiales y técnicas artísticas y tecnologías para la resolución de problemas creativos. Genera ideas investigando una variedad de fuentes y manipulando los elementos de los diversos lenguajes de las artes (danza, música, teatro, artes visuales) para evaluar cuáles se ajustan mejor a sus intenciones. Planifica y produce trabajos que comunican ideas y experiencias personales y sociales e incorpora influencias de su propia comunidad y de otras culturas. Registra sus procesos, identifica los aspectos esenciales de sus trabajos y los va modificando para mejorarlos (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Educación Religiosa',
    enfoqueArea: 'Enfoque humanista cristiano, cristocéntrico y comunitario',
    procesosDidacticosPrimaria: [
      '1. Ver (auscultar la realidad cotidiana de los niños y niñas)',
      '2. Juzgar (iluminar desde el texto bíblico y la reflexión ética)',
      '3. Actuar (asumir compromisos de fraternidad y solidaridad en el aula y hogar)',
      '4. Evaluar y Celebrar',
    ],
    materialesMineduPrimaria: [
      'Biblia Latinoamericana infantil, fichas de reflexión y compromisos de solidaridad',
    ],
    competencias: [
      {
        nombre:
          'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas',
        capacidades: [
          'Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente',
          'Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa',
        ],
        procesosDidacticosCompetencia: [
          '1. Ver (observación y diálogo sobre una situación real de la vida escolar o familiar de los niños)',
          '2. Juzgar (lectura e iluminación desde un pasaje bíblico y reflexión sobre el mensaje de amor y dignidad humana)',
          '3. Actuar (formulación de un compromiso personal y grupal de respeto, fraternidad y diálogo fraterno)',
          '4. Evaluar y Celebrar (revisión de lo aprendido y expresión comunitaria de gratitud)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Descubre el amor de Dios en la creación y lo relaciona con el amor que recibe de las personas que lo rodean. Explica la presencia de Dios en el Plan de Salvación y la relación que Él establece con el ser humano. Convive de manera fraterna con el prójimo respetando las diferentes expresiones religiosas. Asume las consecuencias de sus acciones con responsabilidad, comprometiéndose a ser mejor persona, a ejemplo de Jesucristo (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Describe el amor de Dios presente en la creación y en el Plan de Salvación. Construye su identidad como hijo de Dios desde el mensaje de Jesús presente en el Evangelio. Participa en la Iglesia como comunidad de fe y de amor, respetando la dignidad humana y las diversas manifestaciones religiosas. Fomenta una convivencia armónica basada en el diálogo, el respeto, la tolerancia y el amor fraterno (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Comprende el amor de Dios desde la creación respetando la dignidad y la libertad de la persona humana. Explica la acción de Dios presente en el Plan de Salvación. Demuestra su amor a Dios y al prójimo participando en su comunidad y realizando obras de caridad que le ayudan en su crecimiento personal y espiritual. Fomenta una convivencia cristiana basada en el diálogo, el respeto, la tolerancia y el amor fraterno fortaleciendo su identidad como hijo de Dios (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre:
          'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa',
        capacidades: [
          'Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa',
          'Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida',
        ],
        procesosDidacticosCompetencia: [
          '1. Ver (reconocimiento de necesidades de solidaridad, reconciliación y buen trato en el aula y la comunidad)',
          '2. Juzgar (discernimiento a la luz de las enseñanzas del Evangelio y los valores éticos y morales)',
          '3. Actuar (puesta en práctica de acciones solidarias y compromisos concretos en su proyecto de vida escolar y familiar)',
          '4. Evaluar y Celebrar (valoración de las actitudes practicadas y celebración fraterna)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Expresa coherencia en sus acciones cotidianas descubriendo el amor de Dios. Comprende su dimensión religiosa, espiritual y trascendente que le permite poner en práctica actitudes evangélicas. Interioriza la presencia de Dios en su entorno más cercano desarrollando virtudes evangélicas. Asume actitudes de agradecimiento a Dios respetando lo creado (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Expresa coherencia entre lo que cree, dice y hace en su diario vivir a la luz de las enseñanzas bíblicas y de los santos. Comprende su dimensión religiosa, espiritual y trascendente que le permita establecer propósitos de cambio a la luz del Evangelio. Interioriza la presencia de Dios en su vida personal y en su entorno más cercano, celebrando su fe con gratitud. Asume su rol protagónico respetando y cuidando lo creado (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Expresa coherencia entre lo que cree, dice y hace en su proyecto de vida personal, a la luz del mensaje bíblico. Comprende su dimensión espiritual y religiosa que le permita cooperar en la transformación de sí mismo y de su entorno a la luz del Evangelio. Reflexiona el encuentro personal y comunitario con Dios en diversos contextos, con acciones orientadas a la construcción de una comunidad de fe guiada por las enseñanzas de Jesucristo. Asume las enseñanzas de Jesucristo y de la Iglesia desempeñando su rol protagónico en la transformación de la sociedad (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
  {
    area: 'Educación Física',
    enfoqueArea: 'Enfoque de la corporeidad',
    procesosDidacticosPrimaria: [
      'Activación corporal y saberes motrices -> Desarrollo de juegos motores y retos cooperativos -> Relajación, hidratación y reflexión metacognitiva',
    ],
    materialesMineduPrimaria: [
      'Kit de Educación Física Primaria Minedu (conos, aros, colchonetas, balones, sogas)',
    ],
    competencias: [
      {
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad',
        capacidades: ['Comprende su cuerpo', 'Se expresa corporalmente'],
        procesosDidacticosCompetencia: [
          '1. Activación corporal y exploración motriz (calentamiento lúdico, movilidad articular y reconocimiento del esquema corporal en el espacio)',
          '2. Desarrollo de habilidades motrices y expresión corporal (ejecución de circuitos de coordinación, equilibrio, lateralidad y ritmo usando aros, conos y sogas del Kit Minedu)',
          '3. Vuelta a la calma, hidratación y reflexión corporal (ejercicios de respiración, estiramiento e identificación de las sensaciones corporales)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Se desenvuelve de manera autónoma a través de su motricidad cuando comprende cómo usar su cuerpo en las diferentes acciones que realiza utilizando su lado dominante y realiza movimientos coordinados que le ayudan a sentirse seguro en la práctica de actividades físicas. Se orienta espacialmente en relación a sí mismo y a otros puntos de referencia. Se expresa corporalmente con sus pares utilizando el ritmo, gestos y movimientos como recursos para comunicar (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Se desenvuelve de manera autónoma a través de su motricidad cuando comprende cómo usar su cuerpo explorando la alternancia de sus lados corporales de acuerdo a su utilidad y ajustando la posición del cuerpo en el espacio y en el tiempo en diferentes etapas de las acciones motrices, con una actitud positiva y una voluntad de experimentar situaciones diversas. Experimenta nuevas posibilidades expresivas de su cuerpo y las utiliza para relacionarse y comunicar ideas, emociones, sentimientos, pensamientos (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Se desenvuelve de manera autónoma a través de su motricidad cuando acepta sus posibilidades y limitaciones según su desarrollo e imagen corporal. Realiza secuencias de movimientos coordinados aplicando la alternancia de sus lados corporales de acuerdo a su utilidad. Produce con sus pares secuencias de movimientos corporales, expresivos o rítmicos en relación a una intención (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Asume una vida saludable',
        capacidades: [
          'Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud',
          'Incorpora prácticas que mejoran su calidad de vida',
        ],
        procesosDidacticosCompetencia: [
          '1. Activación fisiológica y reconocimiento de signos vitales (identificación del pulso, respiración y calentamiento previo al esfuerzo físico)',
          '2. Práctica de actividades físicas saludables y cuidado postural (juegos de resistencia, fuerza o flexibilidad articulados con hábitos de hidratación y alimentación nutritiva)',
          '3. Recuperación, higiene personal y reflexión sobre la salud (estiramientos, aseo e incorporación de hábitos saludables en su rutina diaria)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Asume una vida saludable cuando diferencia los alimentos saludables de su dieta personal y familiar, los momentos adecuados para ingerirlos y las posturas que lo ayudan al buen desempeño en la práctica de actividades físicas, recreativas y de la vida cotidiana, reconociendo la importancia del autocuidado. Participa regularmente en la práctica de actividades lúdicas identificando su ritmo cardiaco, respiración y sudoración; utiliza prácticas de activación corporal y psicológica antes de la actividad lúdica (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Asume una vida saludable cuando diferencia los alimentos de su dieta personal, familiar y de su región que son saludables de los que no lo son. Previene riesgos relacionados con la postura e higiene conociendo aquellas que favorecen y no favorecen su salud e identifica su fuerza, resistencia y velocidad en la práctica de actividades lúdicas. Adapta su esfuerzo en la práctica de actividad física de acuerdo a las características de la actividad y a sus posibilidades, aplicando conocimientos relacionados con el ritmo cardiaco, la respiración y la sudoración (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Asume una vida saludable cuando utiliza instrumentos que miden la aptitud física y estado nutricional e interpreta la información de los resultados obtenidos para mejorar su calidad de vida. Replantea sus hábitos saludables, higiénicos y alimenticios tomando en cuenta los cambios físicos propios de la edad, evita la realización de ejercicios y posturas contraindicadas para la salud en la práctica de actividad física. Incorpora prácticas saludables para su organismo consumiendo alimentos adecuados a las características personales y evitando el consumo de drogas (Nivel 5 — Ciclo V).',
        },
      },
      {
        nombre: 'Interactúa a través de sus habilidades sociomotrices',
        capacidades: [
          'Se relaciona utilizando sus habilidades sociomotrices',
          'Crea y aplica estrategias y tácticas de juego',
        ],
        procesosDidacticosCompetencia: [
          '1. Presentación del reto sociomotriz y acuerdos de juego limpio (organización de equipos inclusivos y consenso de reglas)',
          '2. Ejecución de juegos cooperativos / predeportivos y ajuste de estrategias (aplicación de tácticas grupales, resolución pacífica de conflictos y modificación consensuada de reglas)',
          '3. Asamblea de cierre, hidratación y coevaluación del trabajo en equipo (reflexión sobre la inclusión, el respeto a las normas y la eficacia de las estrategias acordadas)',
        ],
        estandaresPorCiclo: {
          'Ciclo III':
            'Interactúa a través de sus habilidades sociomotrices al aceptar al otro como compañero de juego y busca el consenso sobre la manera de jugar para lograr el bienestar común y muestra una actitud de respeto evitando juegos violentos y humillantes; expresa su posición ante un conflicto con intención de resolverlo y escucha la posición de sus compañeros en los diferentes tipos de juegos. Resuelve situaciones motrices a través de estrategias colectivas y participa en la construcción de reglas de juego adaptadas a la situación y al entorno, para lograr un objetivo común en la práctica de actividades lúdicas (Nivel 3 — Ciclo III).',
          'Ciclo IV':
            'Interactúa a través de sus habilidades sociomotrices al tomar acuerdos sobre la manera de jugar y los posibles cambios o conflictos que se den y propone adaptaciones o modificaciones para favorecer la inclusión de compañeros en actividades lúdicas, aceptando al oponente como compañero de juego. Adapta la estrategia de juego anticipando las intenciones de sus compañeros y oponentes para cumplir con los objetivos planteados. Propone reglas y las modifica de acuerdo a las necesidades del contexto y los intereses del grupo en la práctica de actividades físicas (Nivel 4 — Ciclo IV).',
          'Ciclo V':
            'Interactúa a través de sus habilidades sociomotrices proactivamente con un sentido de cooperación teniendo en cuenta las adaptaciones o modificaciones propuestas por el grupo en diferentes actividades físicas. Hace uso de estrategias de cooperación y oposición seleccionando los diferentes elementos técnicos y tácticos que se pueden dar en la práctica de actividades lúdicas y predeportivas, para resolver la situación de juego que le dé un mejor resultado y que responda a las variaciones que se presentan en el entorno (Nivel 5 — Ciclo V).',
        },
      },
    ],
  },
];

/**
 * Selecciona la competencia principal focalizada para una Sesión de Aprendizaje de 90 minutos
 * en función del título/propósito de la sesión o de su número secuencial dentro de la Unidad,
 * cumpliendo la norma MINEDU de no sobrecargar una sesión con todas las competencias del área.
 */
export function seleccionarCompetenciaParaSesion(
  areaObj: (typeof AREAS_CURRICULARES_CNEB)[number],
  sesionNumero?: number,
  tituloOContexto?: string
): CompetenciaCurricularPrimaria {
  const texto = (tituloOContexto || '').toLowerCase();
  const comps = areaObj.competencias;
  if (comps.length === 1) return comps[0];

  if (areaObj.area === 'Comunicación') {
    const esEscritura =
      /\b(escrib|redact|planificamos y escribimos|borrador|revisamos|editamos|producimos|elaboramos un cartel|elaboramos una infograf|escribir)\b/i.test(
        texto
      );
    const esLectura =
      /\b(leemos|lectura|sumillado|subrayado|inferimos|analizamos afiches|identificamos la tesis|diferenciamos hechos|exploramos la estructura|comprensi[oó]n lectora)\b/i.test(
        texto
      );
    const esOralidad =
      /\b(dialogamos|asamblea|exponemos|exposici[oó]n|debate|debatimos|entrevistamos|narramos|noticiero|compartimos oralmente|presentamos oralmente)\b/i.test(
        texto
      );

    if (esEscritura && comps[2]) return comps[2];
    if (esLectura && comps[1]) return comps[1];
    if (esOralidad && comps[0]) return comps[0];
  } else if (areaObj.area === 'Matemática') {
    if (/\b(datos|encuesta|tablas de frecuencia|gr[aá]fico de barras|pictograma|moda|probabilidad)\b/i.test(texto) && comps[3]) {
      return comps[3];
    }
    if (/\b(forma|geom[eé]tric|per[ií]metro|[aá]rea|croquis|plano|simetr[ií]a|pol[ií]gono|prisma|medici[oó]n de parcelas)\b/i.test(texto) && comps[2]) {
      return comps[2];
    }
    if (/\b(patr[oó]n|regularidad|equivalencia|igualdad|ecuaci[oó]n|cambio|balanza)\b/i.test(texto) && comps[1]) {
      return comps[1];
    }
    if (/\b(cantidad|adici[oó]n|sustracci[oó]n|multiplic|divisi[oó]n|fracci[oó]n|decimal|reparto|base diez)\b/i.test(texto) && comps[0]) {
      return comps[0];
    }
  } else if (areaObj.area === 'Ciencia y Tecnología') {
    if (/\b(prototipo|soluci[oó]n tecnol[oó]gica|diseñamos y construimos|biohuerto|riego)\b/i.test(texto) && comps[2]) {
      return comps[2];
    }
    if (/\b(explicamos|comprendemos por qu[eé]|sistema|ecosistema|energ[ií]a|biodiversidad)\b/i.test(texto) && !/\b(indagamos|experimento|hip[oó]tesis)\b/i.test(texto) && comps[1]) {
      return comps[1];
    }
  } else if (areaObj.area === 'Personal Social') {
    if (/\b(recursos econ[oó]micos|ahorro|presupuesto|consumo|trueque)\b/i.test(texto) && comps[4]) {
      return comps[4];
    }
    if (/\b(ambiente|espacio geogr[aá]fico|riesgo|mapa|vulnerabilidad|residuos)\b/i.test(texto) && comps[3]) {
      return comps[3];
    }
    if (/\b(hist[oó]ric|l[ií]nea de tiempo|fuentes|pasado|patrimonio|preinca)\b/i.test(texto) && comps[2]) {
      return comps[2];
    }
    if (/\b(convivencia|acuerdos|normas|derechos|asunto p[uú]blico|deliberamos|bien com[uú]n)\b/i.test(texto) && comps[1]) {
      return comps[1];
    }
    if (/\b(identidad|emociones|autoestima|autocuidado)\b/i.test(texto) && comps[0]) {
      return comps[0];
    }
  }

  const idx = Math.max(0, (sesionNumero || 1) - 1) % comps.length;
  return comps[idx];
}

/**
 * Plantilla base del Prompt Maestro Pedagógico restringida exclusivamente a
 * EDUCACIÓN PRIMARIA (1.° a 6.° Grado — Programa Curricular R.M. N.° 649-2016-MINEDU)
 * con las 5 variables dinámicas obligatorias: {grado}, {area}, {periodo}, {diagnostico}, {contexto}
 */
export const PROMPT_MAESTRO_PEDAGOGICO_TEMPLATE = `
Eres un Especialista Pedagógico Senior de Educación Primaria del Ministerio de Educación del Perú (Minedu), experto en el Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU), la Cartilla Oficial de Planificación Curricular de Educación Primaria, el Currículo Nacional de la Educación Básica (CNEB - R.M. N.° 281-2016-MINEDU) y la normativa vigente de planificación y evaluación formativa (R.M. N.° 587-2023-MINEDU / R.V.M. N.° 094-2020-MINEDU).

Tu tarea es diseñar un documento curricular oficial exclusivo para el NIVEL DE EDUCACIÓN PRIMARIA (1.° a 6.° grado) con los siguientes parámetros proporcionados por el docente de aula:

--- PARÁMETROS DEL DOCENTE DE PRIMARIA ---
- Nivel Educativo: Educación Primaria (EBR - Minedu Perú)
- Tipo de Documento Solicitado: {tipoDocumento}
- Grado y Ciclo de Primaria: {grado} ({ciclo} — {edadesReferencia})
- Área Curricular Oficial de Primaria: {area}
- Periodo Lectivo / Bimestre / Trimestre: {periodo}
- Institución Educativa / DRE / UGEL: {institucion} ({dre} - {ugel})
- Docente de Aula: {docente}
- Diagnóstico de Aprendizaje del Aula (Caracterización Primaria): {diagnostico}
- Contexto Sociocultural, Familiar y Territorial: {contexto}

--- LINEAMIENTOS TÉCNICO-PEDAGÓGICOS OBLIGATORIOS (EDUCACIÓN PRIMARIA MINEDU) ---
1. COHERENCIA VERTICAL Y ALINEAMIENTO CONSTRUCTIVO (R.M. N.° 649-2016-MINEDU Y CARTILLA MINEDU):
   - Utiliza EXCLUSIVAMENTE las Competencias y Capacidades oficiales de Primaria para el área de "{area}" ({competenciasReferencia}).
   - Redacta el Estándar de Aprendizaje oficial correspondiente al {ciclo} de Educación Primaria (Nivel 3 para Ciclo III [1.°-2.°], Nivel 4 para Ciclo IV [3.°-4.°], Nivel 5 para Ciclo V [5.°-6.°]). Nunca escribas frases genéricas como "Estándar oficial del ciclo...", sino el descriptor real de lo que el estudiante es capaz de hacer.
   - Precisa los Desempeños de {grado} adecuándolos al desarrollo evolutivo infantil ({edadesReferencia}), a las necesidades reales identificadas en el diagnóstico ("{diagnostico}") y al contexto local ("{contexto}").
   - Formula Criterios de Evaluación formativa directamente observables en la evidencia de aprendizaje siguiendo la estructura: Verbo de acción observable + Contenido/Proceso + Condición de calidad vinculada a la evidencia.
   - Define Evidencias tangibles y pertinentes para la edad ({edadesReferencia}) e Instrumentos de Evaluación específicos (Lista de cotejo, Rúbrica analítica de Primaria, Escala de valoración AD - A - B - C).
   - Utiliza en "enfoquesTransversales" únicamente las denominaciones exactas de los 7 Enfoques Transversales del CNEB (Enfoque de Derechos, Enfoque Inclusivo o de Atención a la Diversidad, Enfoque Intercultural, Enfoque Igualdad de Género, Enfoque Ambiental, Enfoque de Orientación al Bien Común, Enfoque de Búsqueda de la Excelencia), sin fusionar dos enfoques en un mismo título.

2. PROCESOS DIDÁCTICOS Y MATERIALES CONCRETOS DE EDUCACIÓN PRIMARIA:
   - Aplica con rigor metodológico los Procesos Didácticos propios del área de {area} en Educación Primaria ({procesosDidacticos}), asegurando que correspondan exactamente a la competencia trabajada.
   - Incorpora el uso pedagógico de materiales concretos estructurados y no estructurados del Minedu para Primaria ({materialesMinedu}).

3. SITUACIÓN SIGNIFICATIVA CONTEXTUALIZADA PARA NIÑOS Y NIÑAS DE PRIMARIA:
   - Parte de una situación real, vivencia escolar, práctica familiar, festividad comunal o problemática del entorno descrita en "{contexto}" articulada con las necesidades de aprendizaje de "{diagnostico}".
   - Formula el Reto Pedagógico mediante preguntas abiertas, desafiantes y movilizadoras en primera persona plural ("¿Cómo podemos...?", "¿Qué propuestas elaboraremos para...?").
   - Define una producción o actuación tangible y evaluable acorde al {ciclo}.

4. ESTRUCTURA DOCUMENTAL Y SECUENCIA DIDÁCTICA SEGÚN EL TIPO DE DOCUMENTO ({tipoDocumento}):
   - Si es "PCA" (Planificación Curricular Anual de Primaria — MATRIZ MAESTRA):
     * Incluye TODAS las competencias oficiales del área de "{area}" en "propositosAprendizaje" con todas sus capacidades y su estándar del {ciclo}.
     * La PCA Anual DEBE definir el catálogo completo de 8 Unidades Didácticas ("Unidad 1" a "Unidad 8") distribuidas en los cuatro bimestres del año lectivo (2 unidades por bimestre).
     * Cada Unidad en "secuenciaDidactica" debe incluir su "numero" ("Unidad 1" a "Unidad 8"), "titulo", "proposito", "duracion" (ej. "5 semanas"), "faseOMomento" (ej. "I Bimestre — Unidad 1"), "actividadesEstrategicas", "recursosEducativos", "productoOEvidencia" y su lista ordenada "sesionesSugeridas" (de 4 a 5 sesiones sugeridas secuenciales por unidad con "numero", "titulo", "proposito" y "duracion").
   - Si es "UNIDAD" (Unidad Didáctica de Primaria):
     * Desarrolla la secuencia lógica e hilvanada de Sesiones de Aprendizaje de la Unidad (de 4 a 6 sesiones en "secuenciaDidactica"), desde la sesión inicial de comprensión del reto y planificación de la unidad, pasando por las sesiones de indagación/desarrollo de competencias, hasta la sesión final de elaboración, revisión y socialización del producto integrador.
     * En cada sesión de "secuenciaDidactica", el primer ítem de "actividadesEstrategicas" debe explicitar la Competencia y el Desempeño precisado que se moviliza en esa sesión, seguido de las actividades con los procesos didácticos correspondientes.
   - Si es "SESION" (Sesión de Aprendizaje de Primaria — 90 minutos):
     * ¡REGLA CRÍTICA DE FOCALIZACIÓN MINEDU!: En una sesión de 90 minutos NO incluyas todas las competencias del área; selecciona en "propositosAprendizaje" ÚNICAMENTE la competencia principal que corresponde al propósito de la sesión (máximo 1 o 2 si se articulan directamente) y solo las capacidades, desempeños precisados y criterios que se evaluarán en esos 90 minutos.
     * En "descripcionGeneralYCaracterizacion" incluye tanto la justificación pedagógica de la sesión como el bloque "Preparación de la sesión (¿Qué necesitamos hacer antes de la sesión?)" detallando qué debe alistar previamente el docente.
     * Desarrolla minuciosamente en "secuenciaDidactica" los 3 Momentos Pedagógicos oficiales del Minedu:
       1. INICIO (15 a 20 min): Forma de agrupación ("En grupo clase"), vínculo con la sesión anterior, motivación vivencial, preguntas literales de saberes previos y conflicto cognitivo, enunciado literal entre comillas del PROPÓSITO DE LA SESIÓN ("Hoy aprenderemos a..."), socialización de criterios de evaluación y selección consensuada de 1 o 2 acuerdos de convivencia para la sesión.
       2. DESARROLLO (60 min): Gestión y acompañamiento paso a paso estructurado explícitamente con los subtítulos de los procesos didácticos exclusivos de la competencia seleccionada (sin mezclar procesos de otras competencias), indicando formas de agrupación ("En grupo clase", "En equipos", "En parejas", "Individualmente"), manipulación de material concreto Minedu, preguntas mediadoras del docente y atención diferenciada.
       3. CIERRE (10 a 15 min): "En grupo clase", contraste de la evidencia lograda con el propósito y criterios de evaluación, verificación del cumplimiento de los acuerdos de convivencia del día, preguntas de metacognición ("¿Qué aprendimos hoy? ¿Cómo lo aprendimos? ¿Qué dificultades tuvimos y cómo las superamos? ¿Para qué nos sirve?") y breve actividad de transferencia familiar.

5. LIMPIEZA DE CARACTERES Y FORMATO EN DESCRIPCIÓN GENERAL Y PROCESOS DIDÁCTICOS:
   - NUNCA uses signos de exclamación (!) como separadores, conectores o viñetas en la Descripción General ni al enumerar los procesos didácticos.
   - Debe usarse siempre texto limpio, comas o flechas estándar (-> o •).

6. TONO CONVERSACIONAL NATURAL Y DIRECTO (ESTILO ASISTENTE PEDAGÓGICO EMPÁTICO):
   - Elimina cualquier introducción robótica como "te habla CNEB", "Hola, soy el sistema..." o fórmulas acartonadas.
   - Redacta todos los textos con un tono pedagógico natural, directo, empático y fluido para el docente de aula, comenzando directamente con el desarrollo curricular solicitado.

Responde ÚNICAMENTE con un objeto JSON válido que cumpla estrictamente con el esquema solicitado, sin bloques markdown adicionales ni texto fuera del JSON.
`.trim();

/**
 * Sanitiza cadenas de texto generadas por la IA reemplazando signos de exclamación (!)
 * usados erróneamente como separadores por flechas estándar ('→') y limpiando muletillas robóticas.
 */
export function sanitizarTextoCurricular(texto: string): string {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .replace(/!/g, '→')
    .replace(/\b(hola[,.\s]*)?te habla cneb[:.,\s-]*/gi, '')
    .trim();
}

/**
 * Aplica el reemplazo sanitizador (texto.replace(/!/g, '→')) a todos los campos textuales
 * del documento curricular antes de enviarlo al cliente o generar el PDF.
 */
export function sanitizarDocumentoCurricular(
  doc: DocumentoCurricularCNEB
): DocumentoCurricularCNEB {
  return {
    ...doc,
    codigoNormativo: sanitizarTextoCurricular(doc.codigoNormativo),
    tituloDocumento: sanitizarTextoCurricular(doc.tituloDocumento),
    descripcionGeneralYCaracterizacion: sanitizarTextoCurricular(
      doc.descripcionGeneralYCaracterizacion
    ),
    situacionSignificativa: {
      contextoReal: sanitizarTextoCurricular(doc.situacionSignificativa.contextoReal),
      retoPedagogico: sanitizarTextoCurricular(doc.situacionSignificativa.retoPedagogico),
      productoIntegrador: sanitizarTextoCurricular(doc.situacionSignificativa.productoIntegrador),
    },
    propositosAprendizaje: doc.propositosAprendizaje.map((p) => ({
      ...p,
      competencia: sanitizarTextoCurricular(p.competencia),
      capacidades: p.capacidades.map(sanitizarTextoCurricular),
      estandarCiclo: sanitizarTextoCurricular(p.estandarCiclo),
      desempenosPrecisados: p.desempenosPrecisados.map(sanitizarTextoCurricular),
      criteriosEvaluacion: p.criteriosEvaluacion.map(sanitizarTextoCurricular),
      evidenciaAprendizaje: sanitizarTextoCurricular(p.evidenciaAprendizaje),
      instrumentoEvaluacion: sanitizarTextoCurricular(p.instrumentoEvaluacion),
    })),
    competenciasTransversales: (doc.competenciasTransversales || []).map((ct) => ({
      competencia: sanitizarTextoCurricular(ct.competencia),
      capacidad: sanitizarTextoCurricular(ct.capacidad),
      desempenoContextualizado: sanitizarTextoCurricular(ct.desempenoContextualizado),
    })),
    enfoquesTransversales: doc.enfoquesTransversales.map((e) => ({
      enfoque: sanitizarTextoCurricular(e.enfoque),
      valor: sanitizarTextoCurricular(e.valor),
      actitudesObservables: sanitizarTextoCurricular(e.actitudesObservables),
    })),
    secuenciaDidactica: doc.secuenciaDidactica.map((s) => ({
      ...s,
      titulo: sanitizarTextoCurricular(s.titulo),
      faseOMomento: sanitizarTextoCurricular(s.faseOMomento),
      proposito: s.proposito ? sanitizarTextoCurricular(s.proposito) : undefined,
      actividadesEstrategicas: s.actividadesEstrategicas.map(sanitizarTextoCurricular),
      recursosEducativos: s.recursosEducativos.map(sanitizarTextoCurricular),
      productoOEvidencia: sanitizarTextoCurricular(s.productoOEvidencia),
      sesionesSugeridas: s.sesionesSugeridas
        ? s.sesionesSugeridas.map((ss) => ({
            numero: sanitizarTextoCurricular(ss.numero),
            titulo: sanitizarTextoCurricular(ss.titulo),
            proposito: sanitizarTextoCurricular(ss.proposito),
            duracion: sanitizarTextoCurricular(ss.duracion),
          }))
        : undefined,
    })),
    orientacionesEvaluacion: doc.orientacionesEvaluacion.map((oe) => ({
      ...oe,
      orientacionPedagogica: sanitizarTextoCurricular(oe.orientacionPedagogica),
      tecnicasEInstrumentos: sanitizarTextoCurricular(oe.tecnicasEInstrumentos),
    })),
    materialesYBibliografia: {
      paraElDocente: doc.materialesYBibliografia.paraElDocente.map(sanitizarTextoCurricular),
      paraElEstudiante: doc.materialesYBibliografia.paraElEstudiante.map(sanitizarTextoCurricular),
    },
  };
}

/**
 * Función constructora del Prompt Maestro Pedagógico para Educación Primaria
 * con interpolación segura de ({grado}, {area}, {periodo}, {diagnostico}, {contexto}).
 */
export function buildMasterPedagogicalPrompt(params: ParametrosPlanificacionCNEB): string {
  const gradoObj = GRADOS_CNEB.find((g) => g.valor === params.grado) ?? GRADOS_CNEB[4];

  const areaObj =
    AREAS_CURRICULARES_CNEB.find(
      (a) => a.area.toLowerCase() === params.area.toLowerCase()
    ) ?? AREAS_CURRICULARES_CNEB[0];

  const competenciaFocalizadaSesion = seleccionarCompetenciaParaSesion(
    areaObj,
    params.sesionNumero,
    `${params.tituloPersonalizado || ''} ${params.instruccionRegeneracion || ''}`
  );

  const competenciasReferencia =
    params.tipoDocumento === 'SESION'
      ? `COMPETENCIA FOCALIZADA PARA ESTA SESIÓN DE 90 MINUTOS: "${competenciaFocalizadaSesion.nombre}" [Capacidades oficiales: ${competenciaFocalizadaSesion.capacidades.join('; ')}] | Estándar oficial ${gradoObj.ciclo}: "${competenciaFocalizadaSesion.estandaresPorCiclo[gradoObj.ciclo]}"`
      : areaObj.competencias
          .map(
            (c) =>
              `${c.nombre} [Capacidades: ${c.capacidades.join('; ')} | Estándar ${gradoObj.ciclo}: ${c.estandaresPorCiclo[gradoObj.ciclo]}]`
          )
          .join(' || ');

  const procesosDidacticos =
    params.tipoDocumento === 'SESION'
      ? competenciaFocalizadaSesion.procesosDidacticosCompetencia.join(' -> ')
      : areaObj.procesosDidacticosPrimaria.join(' | ');

  const materialesMinedu = areaObj.materialesMineduPrimaria.join('; ');

  const tipoDocLabel =
    params.tipoDocumento === 'UNIDAD'
      ? `UNIDAD DIDÁCTICA N.° ${params.unidadNumero || 1} DE EDUCACIÓN PRIMARIA`
      : params.tipoDocumento === 'SESION'
      ? `SESIÓN DE APRENDIZAJE N.° ${params.sesionNumero || 1} (UNIDAD ${
          params.unidadNumero || 1
        }) DE EDUCACIÓN PRIMARIA (INICIO - DESARROLLO - CIERRE)`
      : 'PLANIFICACIÓN CURRICULAR ANUAL (PCA — MATRIZ MAESTRA DE 8 UNIDADES) DE EDUCACIÓN PRIMARIA';

  let promptFinal = PROMPT_MAESTRO_PEDAGOGICO_TEMPLATE.replace(/\{grado\}/g, gradoObj.valor)
    .replace(/\{ciclo\}/g, gradoObj.ciclo)
    .replace(/\{edadesReferencia\}/g, gradoObj.edadesReferencia)
    .replace(/\{area\}/g, areaObj.area)
    .replace(/\{periodo\}/g, params.periodo)
    .replace(/\{diagnostico\}/g, params.diagnostico)
    .replace(/\{contexto\}/g, params.contexto)
    .replace(/\{tipoDocumento\}/g, tipoDocLabel)
    .replace(/\{institucion\}/g, params.institucion || 'I.E. N.° 1145 República de Colombia')
    .replace(/\{dre\}/g, params.dre || 'DRE Lima Metropolitana')
    .replace(/\{ugel\}/g, params.ugel || 'UGEL 05')
    .replace(/\{docente\}/g, params.docente || 'Docente de Aula de Educación Primaria')
    .replace(/\{competenciasReferencia\}/g, competenciasReferencia)
    .replace(/\{procesosDidacticos\}/g, procesosDidacticos)
    .replace(/\{materialesMinedu\}/g, materialesMinedu);

  if (params.tipoDocumento === 'SESION') {
    promptFinal += `\n\n--- DIRECTRICES ESPECÍFICAS OBLIGATORIAS PARA ESTA SESIÓN DE APRENDIZAJE (90 MINUTOS) ---
1. FOCALIZACIÓN CURRICULAR: En "propositosAprendizaje" incluye ÚNICAMENTE la competencia "${competenciaFocalizadaSesion.nombre}", seleccionando solo las capacidades y los desempeños precisados que se trabajarán y observarán en estos 90 minutos.
2. PREPARACIÓN DE LA SESIÓN: En "descripcionGeneralYCaracterizacion" redacta la justificación pedagógica de la sesión e incluye explícitamente el apartado "Preparación de la sesión — ¿Qué necesitamos hacer antes de la sesión?" con las acciones previas del docente.
3. MOMENTOS DE LA SESIÓN EN "secuenciaDidactica" (3 momentos):
   - Momento 1 (INICIO - 15 min): Indica "En grupo clase", conexión con la sesión anterior, motivación, preguntas literales de saberes previos y conflicto cognitivo, enunciado literal del propósito entre comillas ("Hoy aprenderemos a..."), socialización de criterios y acuerdo de 2 normas de convivencia para la sesión.
   - Momento 2 (DESARROLLO - 60 min): Desarrolla paso a paso y en orden los procesos didácticos exclusivos de "${competenciaFocalizadaSesion.nombre}": ${competenciaFocalizadaSesion.procesosDidacticosCompetencia.join(' -> ')}. Indica formas de agrupación ("En grupo clase", "En equipos", "En parejas", "Individualmente"), uso de material concreto (${materialesMinedu}) y preguntas socráticas de retroalimentación.
   - Momento 3 (CIERRE - 15 min): Indica "En grupo clase", contraste de la evidencia producida con el propósito y criterios, evaluación de las normas de convivencia acordadas, preguntas de metacognición y actividad breve de extensión familiar.`;
  } else if (params.tipoDocumento === 'UNIDAD') {
    promptFinal += `\n\n--- DIRECTRICES ESPECÍFICAS OBLIGATORIAS PARA ESTA UNIDAD DIDÁCTICA N.° ${params.unidadNumero || 1} ---
1. ALINEAMIENTO CONSTRUCTIVO: En "propositosAprendizaje", garantiza que cada competencia tenga sus capacidades oficiales, el estándar real del ${gradoObj.ciclo}, desempeños precisados al reto de la unidad, criterios de evaluación redactados con verbo observable + contenido + condición de calidad sobre la evidencia, evidencia tangible e instrumento de evaluación.
2. SECUENCIA DE SESIONES (4 a 6 sesiones en "secuenciaDidactica"): Cada sesión debe guardar un hilo conductor progresivo (apertura del reto -> indagación/desarrollo de competencias -> elaboración, revisión y socialización del producto integrador). El primer punto de "actividadesEstrategicas" en cada sesión debe explicitar la Competencia y el Desempeño precisado que moviliza esa sesión.`;
  } else {
    promptFinal += `\n\n--- DIRECTRICES ESPECÍFICAS OBLIGATORIAS PARA LA PLANIFICACIÓN CURRICULAR ANUAL (PCA) ---
1. MATRIZ ANUAL COMPLETA: Incluye todas las competencias del área de "${areaObj.area}" con sus estándares oficiales del ${gradoObj.ciclo}.
2. CATÁLOGO DE 8 UNIDADES DIDÁCTICAS: Diseña las 8 Unidades ("Unidad 1" a "Unidad 8") distribuidas en los 4 bimestres, cada una con una secuencia lógica de 4 sesiones sugeridas en "sesionesSugeridas".`;
  }

  if (params.tituloPersonalizado && params.tituloPersonalizado.trim()) {
    promptFinal += `\n\n--- INSTRUCCIÓN DE VINCULACIÓN CON LA MATRIZ MAESTRA DEL PROYECTO ---\nDesarrolla específicamente: "${params.tituloPersonalizado.trim()}" manteniendo coherencia directa con la PCA Anual del aula.`;
  }

  if (
    params.sesionesSugeridasContexto &&
    Array.isArray(params.sesionesSugeridasContexto) &&
    params.sesionesSugeridasContexto.length > 0
  ) {
    const listaSesionesTexto = params.sesionesSugeridasContexto
      .map(
        (s) =>
          `- ${s.numero}: "${s.titulo}" | Propósito: ${s.proposito} | Duración: ${s.duracion}`
      )
      .join('\n');
    promptFinal += `\n\n--- SESIONES SUGERIDAS POR LA PCA PARA ESTA UNIDAD DIDÁCTICA ---\nRespeta y desarrolla esta lista ordenada de sesiones sugeridas en "secuenciaDidactica" (garantizando mínimo 4 sesiones articuladas con las competencias de la unidad):\n${listaSesionesTexto}`;
  }

  if (params.contextoContinuidadRama && params.contextoContinuidadRama.trim()) {
    promptFinal += `\n\n--- CONTEXTO DE CONTINUIDAD PEDAGÓGICA (UNIDAD Y SESIÓN INMEDIATA ANTERIOR) ---\nGarantiza la progresión y articulación curricular con los documentos previos de esta rama:\n${params.contextoContinuidadRama.trim()}`;
  }

  if (params.instruccionRegeneracion && params.instruccionRegeneracion.trim()) {
    promptFinal += `\n\n--- INSTRUCCIÓN DE EDICIÓN / REGENERACIÓN INTELIGENTE DEL DOCENTE ---\nEl docente solicita actualizar/regenerar este documento aplicando prioritariamente el siguiente ajuste pedagógico: "${params.instruccionRegeneracion.trim()}".`;
  }

  return promptFinal;
}

/**
 * Casos pedagógicos reales de Educación Primaria del Perú (Ciclos III, IV y V) listos para 1 clic
 */
export const ESCENARIOS_PEDAGOGICOS_PERU: {
  id: string;
  etiqueta: string;
  ciclo: CicloPrimariaCNEB;
  region: string;
  datos: ParametrosPlanificacionCNEB;
}[] = [
  {
    id: 'lima-com-5to-pca',
    etiqueta: 'Ciclo V · 5.° Primaria · Comunicación (Lima)',
    ciclo: 'Ciclo V',
    region: 'Lima Metropolitana — San Juan de Lurigancho',
    datos: {
      tipoDocumento: 'PCA',
      nivel: 'Primaria',
      grado: '5.° de Primaria',
      area: 'Comunicación',
      periodo: 'Año Lectivo 2026 (I al IV Bimestre — 39 semanas lectivas)',
      dre: 'DRE Lima Metropolitana',
      ugel: 'UGEL 05 San Juan de Lurigancho',
      institucion: 'I.E. N.° 1145 República de Colombia',
      docente: 'Lic. María Elena Paredes Rengifo',
      director: 'Dr. Jorge Luis Mendoza Castro',
      diagnostico:
        'Según los resultados de la Evaluación Diagnóstica de Entrada y las actas del SIAGIE, el 70% de los niños y niñas de 5.° grado de primaria (10 a 11 años) ubica información explícita en textos narrativos y descriptivos (nivel literal), pero solo el 36% logra deducir relaciones lógicas de causa-efecto, el significado de expresiones figuradas y el propósito comunicativo en textos expositivos y argumentativos discontinuos (infografías y afiches). En escritura, requieren fortalecer la planificación de sus textos, el uso de conectores lógicos y signos de puntuación mediante la revisión reflexiva de borradores.',
      contexto:
        'La I.E. N.° 1145 se ubica en una zona urbana emprendedora de San Juan de Lurigancho. En los exteriores de la escuela se observa acumulación de residuos sólidos y escasa práctica de segregación domiciliaria, pero las familias participan con entusiasmo en ferias gastronómicas, campañas de lectura familiar y asambleas de aula.',
    },
  },
  {
    id: 'piura-com-2do-sesion',
    etiqueta: 'Ciclo III · 2.° Primaria · Comunicación (Piura)',
    ciclo: 'Ciclo III',
    region: 'Piura — Catacaos',
    datos: {
      tipoDocumento: 'PCA',
      nivel: 'Primaria',
      grado: '2.° de Primaria',
      area: 'Comunicación',
      periodo: 'Año Lectivo 2026 (I al IV Bimestre — 39 semanas lectivas)',
      dre: 'DRE Piura',
      ugel: 'UGEL La Unión / Catacaos',
      institucion: 'I.E. N.° 14032 San Juan Bautista',
      docente: 'Prof. Rosa Mercedes Chiroque Ipanaqué',
      director: 'Mg. Segundo Castillo Vílchez',
      diagnostico:
        'En el aula de 2.° grado de primaria (7 años), el 58% de los estudiantes se encuentra en el nivel alfabético inicial de apropiación del sistema de escritura y un 42% en el nivel silábico-alfabético. Requieren apoyo con letras móviles, carteles letrados del aula y lectura compartida de textos breves (rimas, cuentos regionales y recetas) para consolidar la direccionalidad, segmentación léxica y comprensión inferencial básica.',
      contexto:
        'Los niños y niñas pertenecen a familias de artesanos de paja toquilla, alfareros y agricultores del distrito de Catacaos (Piura). Tienen un rico repertorio oral de cumananas, leyendas locales y conocimientos sobre la preparación de platos típicos que motivan el aprendizaje de la lectura y escritura.',
    },
  },
  {
    id: 'cusco-mat-4to-unidad',
    etiqueta: 'Ciclo IV · 4.° Primaria · Matemática (Cusco)',
    ciclo: 'Ciclo IV',
    region: 'Cusco — Sicuani (Canchis)',
    datos: {
      tipoDocumento: 'PCA',
      nivel: 'Primaria',
      grado: '4.° de Primaria',
      area: 'Matemática',
      periodo: 'Año Lectivo 2026 (I al IV Bimestre — 39 semanas lectivas)',
      dre: 'DRE Cusco',
      ugel: 'UGEL Canchis',
      institucion: 'I.E. N.° 56001 Mateo Pumacahua',
      docente: 'Lic. Edgar Quispe Condori',
      director: 'Mg. Justina Mamani Huillca',
      diagnostico:
        'En la competencia "Resuelve problemas de cantidad", el 64% de los estudiantes de 4.° grado de primaria (9 años) resuelve problemas aditivos de dos etapas, pero presenta dificultades para representar fracciones usuales (medios, cuartos, octavos) y problemas multiplicativos de proporcionalidad simple. Aprenden mejor cuando manipulan las tiras de fracciones, regletas de Cuisenaire y el Material Base Diez antes de pasar a la representación gráfica y simbólica.',
      contexto:
        'La comunidad de Sicuani participa activamente en las ferias agropecuarias semanales y el tejido artesanal andino, donde las familias realizan repartos equitativos de granos andinos (quinua, kiwicha, habas), mediciones de parcelas y trueque o compraventa con monedas y billetes.',
    },
  },
  {
    id: 'arequipa-cyt-6to-unidad',
    etiqueta: 'Ciclo V · 6.° Primaria · Ciencia y Tecnología (Arequipa)',
    ciclo: 'Ciclo V',
    region: 'Arequipa — Paucarpata',
    datos: {
      tipoDocumento: 'PCA',
      nivel: 'Primaria',
      grado: '6.° de Primaria',
      area: 'Ciencia y Tecnología',
      periodo: 'Año Lectivo 2026 (I al IV Bimestre — 39 semanas lectivas)',
      dre: 'GRE Arequipa',
      ugel: 'UGEL Arequipa Sur',
      institucion: 'I.E. N.° 40178 Víctor Raúl Haya de la Torre',
      docente: 'Lic. Claudia Patricia Begazo Talavera',
      director: 'Mg. Hernán Valdivia Cornejo',
      diagnostico:
        'Los estudiantes de 6.° grado de primaria (11 años) muestran gran curiosidad por las experiencias prácticas con el Módulo de Ciencia y Tecnología Minedu, pero el 55% necesita fortalecer el planteamiento de hipótesis que relacionen variables y el registro sistemático de observaciones en su cuaderno de experiencias durante varias semanas.',
      contexto:
        'El distrito de Paucarpata cuenta con andenerías preincaicas declaradas patrimonio y alta radiación solar durante todo el año. La escuela dispone de un espacio para implementar un biohuerto escolar con riego ahorrador y cultivo de hortalizas y plantas aromáticas para mejorar la lonchera saludable.',
    },
  },
];
