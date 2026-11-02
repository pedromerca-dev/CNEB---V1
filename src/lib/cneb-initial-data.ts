/**
 * @file src/lib/cneb-initial-data.ts
 * @description Proyecto curricular inicial de referencia exclusivo para EDUCACIÓN PRIMARIA:
 * Planificación Curricular Anual (PCA — Matriz Maestra de 8 Unidades Didácticas con Sesiones Sugeridas),
 * Unidad Didáctica 1 (con Sesión 1 y Sesión 2) y Unidad Didáctica 2 de Comunicación — 5.° Grado de Primaria (Ciclo V)
 * alineado al Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU).
 */

import { DocumentoCurricularCNEB } from './prompts';

export const DOCUMENTO_EJEMPLO_INICIAL_CNEB: DocumentoCurricularCNEB = {
  id: 'cneb-primaria-5to-comunicacion-pca-2026',
  fechaGeneracion: '2026-03-16T14:00:00.000Z',
  tipoDocumento: 'PCA',
  codigoNormativo:
    'R.M. N.° 649-2016-MINEDU (Programa Curricular de Educación Primaria) · R.M. N.° 587-2023-MINEDU · R.V.M. N.° 094-2020-MINEDU',
  tituloDocumento:
    'PLANIFICACIÓN CURRICULAR ANUAL DE COMUNICACIÓN — 5.° GRADO DE PRIMARIA (CICLO V): FORTALECEMOS LA COMPRENSIÓN CRÍTICA Y LA PRODUCCIÓN DE TEXTOS PROMOVIENDO LA CIUDADANÍA AMBIENTAL EN NUESTRA ESCUELA Y COMUNIDAD',
  datosInformativos: {
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    institucionEducativa: 'I.E. N.° 1145 República de Colombia',
    nivel: 'Educación Primaria',
    ciclo: 'Ciclo V (5.° y 6.° Grado)',
    gradoYSeccion: '5.° de Primaria (Secciones A, B y C)',
    areaCurricular: 'Comunicación',
    periodoLectivo: 'Año Lectivo 2026 (I al IV Bimestre — 8 Unidades Didácticas)',
    duracionEstimada: '39 semanas lectivas (8 Unidades Didácticas · 6 horas semanales)',
    docenteResponsable: 'Lic. María Elena Paredes Rengifo',
    directorIE: 'Dr. Jorge Luis Mendoza Castro',
  },
  descripcionGeneralYCaracterizacion:
    'El área de Comunicación en el 5.° grado de Educación Primaria (Ciclo V del CNEB — R.M. N.° 649-2016-MINEDU) tiene como finalidad que los niños y niñas de 10 a 11 años desarrollen competencias comunicativas mediante el uso del lenguaje en prácticas sociales auténticas de interacción oral, lectura comprensiva y producción escrita. En esta etapa evolutiva, los estudiantes consolidan operaciones del pensamiento concreto hacia un pensamiento cada vez más abstracto, muestran mayor autonomía en el trabajo cooperativo y se interesan por asuntos públicos de su escuela y barrio. De acuerdo con los resultados de la Evaluación Diagnóstica de Entrada y las actas del SIAGIE, el 70% de los estudiantes alcanza el nivel esperado al localizar información explícita en textos narrativos, pero solo el 36% logra realizar inferencias de causa-efecto, deducir el propósito comunicativo y reflexionar críticamente sobre textos expositivos y argumentativos discontinuos (infografías, afiches y artículos de opinión). En la competencia de escritura, requieren mediación docente sistemática en los procesos didácticos de planificación, textualización y revisión reflexiva de borradores empleando el Cuaderno de Fichas de Comunicación 5.° Primaria y la Biblioteca de Aula Minedu.',
  situacionSignificativa: {
    contextoReal:
      'En la I.E. N.° 1145 República de Colombia, ubicada en el distrito de San Juan de Lurigancho (Lima), los estudiantes de 5.° grado de primaria retornan a las aulas con entusiasmo por compartir sus vivencias familiares y comunitarias. Sin embargo, observan que en los patios durante el recreo y en los alrededores de la institución se acumulan residuos plásticos y envolturas, además de evidenciarse situaciones de trato poco empático en algunos juegos escolares.',
    retoPedagogico:
      '¿Cómo podemos utilizar nuestras habilidades de expresión oral, lectura crítica e investigación en diversas fuentes para escribir y difundir textos funcionales y literarios que promuevan el cuidado del ambiente escolar y una convivencia armoniosa en nuestra comunidad educativa?',
    productoIntegrador:
      'Revista escolar ilustrada, Antología de relatos y tradiciones familiares, Infografías ambientales y Asamblea de Debate Escolar sobre convivencia y cuidado del entorno presentados en el Día del Logro.',
  },
  propositosAprendizaje: [
    {
      competencia: 'Se comunica oralmente en su lengua materna',
      capacidades: [
        'Obtiene información del texto oral',
        'Infiere e interpreta información del texto oral',
        'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada',
        'Utiliza recursos no verbales y paraverbales de forma estratégica',
        'Interactúa estratégicamente con distintos interlocutores',
        'Reflexiona y evalúa la forma, el contenido y contexto del texto oral',
      ],
      estandarCiclo:
        'Se comunica oralmente mediante diversos tipos de textos; infiere el tema, propósito, hechos y conclusiones a partir de información explícita, e interpreta la intención del interlocutor en discursos que contienen ironías. Se expresa adecuándose a situaciones comunicativas formales e informales. Organiza y desarrolla sus ideas en torno a un tema y las relaciona mediante el uso de conectores y algunos referentes, así como de un vocabulario variado y pertinente. Usa recursos no verbales y paraverbales para enfatizar lo que dice. Reflexiona y evalúa los textos escuchados a partir de sus conocimientos y el contexto sociocultural. En un intercambio, hace preguntas y contribuciones relevantes que responden a las ideas y puntos de vista de otros, enriqueciendo el tema tratado (Nivel 5 — Ciclo V).',
      desempenosPrecisados: [
        'Expresa oralmente ideas y emociones de forma coherente y cohesionada al participar en asambleas de aula, exposiciones y debates sobre el cuidado del ambiente escolar, siguiendo los procesos didácticos (antes, durante y después del discurso).',
        'Emplea gestos, contacto visual, volumen de voz modulada y apoyos visuales (láminas y organizadores gráficos) para enfatizar sus argumentos ante sus compañeros y familias.',
        'Participa en intercambios orales alternando los roles de hablante y oyente, formulando preguntas oportunas y respetando las normas de cortesía escolar.',
      ],
      criteriosEvaluacion: [
        'Adecúa su exposición oral y participación en la asamblea al propósito comunicativo y a su auditorio escolar.',
        'Expresa sus propuestas con claridad utilizando conectores de adición, causa y consecuencia, acompañados de recursos paraverbales pertinentes.',
        'Escucha activamente a sus compañeros y aporta ideas constructivas respetando los turnos de habla.',
      ],
      evidenciaAprendizaje:
        'Participación en Asamblea Escolar de Aula y Exposición oral con soporte de infografía sobre acciones de segregación de residuos.',
      instrumentoEvaluacion:
        'Lista de cotejo de expresión y comprensión oral (Escala CNEB: AD, A, B, C)',
    },
    {
      competencia: 'Lee diversos tipos de textos escritos en su lengua materna',
      capacidades: [
        'Obtiene información del texto escrito',
        'Infiere e interpreta información del texto',
        'Reflexiona y evalúa la forma, el contenido y contexto del texto',
      ],
      estandarCiclo:
        'Lee diversos tipos de textos con varios elementos complejos en su estructura y con vocabulario variado. Obtiene información e integra datos que están en distintas partes del texto. Realiza inferencias locales a partir de información explícita e implícita. Interpreta el texto considerando información relevante y complementaria para construir su sentido global. Reflexiona sobre aspectos variados del texto a partir de su conocimiento y experiencia. Evalúa el uso del lenguaje, la intención de los recursos textuales y el efecto del texto en el lector a partir de su conocimiento y del contexto sociocultural (Nivel 5 — Ciclo V).',
      desempenosPrecisados: [
        'Identifica información explícita, relevante y complementaria que se encuentra en distintas partes de cuentos, textos expositivos, noticias e infografías de la Biblioteca de Aula Minedu.',
        'Deduce relaciones lógicas de causa-efecto, semejanza-diferencia y enseñanza o propósito en textos continuos y discontinuos aplicando estrategias antes, durante y después de la lectura.',
        'Opina acerca del contenido, la organización textual y la intención de los recursos tipográficos (negritas, subtítulos, imágenes) a partir de su experiencia en la escuela y comunidad.',
      ],
      criteriosEvaluacion: [
        'Localiza e integra datos explícitos ubicados en distintas partes del texto mediante el subrayado y sumillado.',
        'Deduce el tema central, las ideas principales y relaciones de causa-efecto a partir de pistas del texto.',
        'Sustenta su opinión crítica sobre el mensaje del autor y el uso de imágenes en textos discontinuos.',
      ],
      evidenciaAprendizaje:
        'Fichas de lectura comprensiva y organizadores gráficos (espina de Ishikawa y mapas semánticos) en su portafolio lector.',
      instrumentoEvaluacion: 'Rúbrica analítica de comprensión lectora de Educación Primaria',
    },
    {
      competencia: 'Escribe diversos tipos de textos en su lengua materna',
      capacidades: [
        'Adecúa el texto a la situación comunicativa',
        'Organiza y desarrolla las ideas de forma coherente y cohesionada',
        'Utiliza convenciones del lenguaje escrito de forma pertinente',
        'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito',
      ],
      estandarCiclo:
        'Escribe diversos tipos de textos de forma reflexiva. Adecúa su texto al destinatario, propósito y el registro, a partir de su experiencia previa y de algunas fuentes de información complementarias. Organiza y desarrolla lógicamente las ideas en torno a un tema y las estructura en párrafos. Establece relaciones entre ideas a través del uso adecuado de algunos tipos de conectores y de referentes; emplea vocabulario variado. Utiliza recursos ortográficos para separar expresiones, ideas y párrafos con la intención de darle claridad y sentido a su texto. Reflexiona y evalúa de manera permanente la coherencia y cohesión de las ideas en el texto que escribe (Nivel 5 — Ciclo V).',
      desempenosPrecisados: [
        'Planifica la escritura de cuentos, textos instructivos, infografías y cartas de solicitud adecuando el registro al destinatario escolar y comunal.',
        'Escribe su primer borrador organizando las ideas en párrafos coherentes, utilizando conectores lógicos, recursos ortográficos (tildación general y diacrítica, punto seguido y aparte) y vocabulario variado.',
        'Revisa y corrige su texto con apoyo de una ficha de autoevaluación y coevaluación entre pares antes de editar la versión final para el mural escolar.',
      ],
      criteriosEvaluacion: [
        'Completa su cuadro de planificación textual definiendo propósito, destinatario, tema y estructura.',
        'Organiza sus ideas en párrafos con coherencia, evitando repeticiones innecesarias y usando conectores pertinentes.',
        'Aplica correctamente las reglas de tildación y puntuación trabajadas, mejorando su borrador tras la revisión.',
      ],
      evidenciaAprendizaje:
        'Cuadro de planificación, primer borrador revisado y versión final publicada de su Infografía Ambiental y Relato Familiar.',
      instrumentoEvaluacion:
        'Rúbrica de producción escrita (Planificación · Textualización · Revisión)',
    },
  ],
  competenciasTransversales: [
    {
      competencia: 'Se desenvuelve en entornos virtuales generados por las TIC',
      capacidad: 'Crea objetos virtuales en diversos formatos',
      desempenoContextualizado:
        'Elabora afiches e infografías digitales en las laptops XO / tabletas Minedu integrando textos breves e ilustraciones sobre el cuidado del ambiente.',
    },
    {
      competencia: 'Gestiona su aprendizaje de manera autónoma',
      capacidad: 'Monitorea y ajusta su desempeño durante el proceso de aprendizaje',
      desempenoContextualizado:
        'Revisa los avances de su portafolio de lectura y escritura contrastándolos con la lista de cotejo socializada al inicio de cada unidad.',
    },
  ],
  enfoquesTransversales: [
    {
      enfoque: 'Enfoque Ambiental',
      valor: 'Solidaridad planetaria y equidad intergeneracional',
      actitudesObservables:
        'Docente y niños de 5.° de primaria implementan los puntos ecológicos de reciclaje en el aula y difunden afiches para mantener limpios los patios de la escuela.',
    },
    {
      enfoque: 'Enfoque de Orientación al Bien Común',
      valor: 'Empatía y responsabilidad',
      actitudesObservables:
        'Los estudiantes comparten los libros de la Biblioteca de Aula Minedu, cuidan el mobiliario escolar y apoyan a los compañeros que requieren refuerzo en lectura.',
    },
    {
      enfoque: 'Enfoque de Derechos',
      valor: 'Diálogo y concertación',
      actitudesObservables:
        'Participan democráticamente en las asambleas de aula para consensuar los acuerdos de convivencia y elegir los temas de su revista escolar.',
    },
  ],
  secuenciaDidactica: [
    {
      numero: 'Unidad 1',
      titulo:
        'Nos reencontramos y organizamos nuestra Biblioteca de Aula consensuando acuerdos de convivencia en asamblea',
      duracion: '5 semanas',
      faseOMomento: 'I Bimestre — Unidad 1',
      proposito:
        'Diagnosticar las competencias comunicativas y establecer acuerdos de convivencia mediante asambleas y lectura de relatos escolares.',
      actividadesEstrategicas: [
        'Aplicación de la Evaluación Diagnóstica de Lectura y Escritura (Kit de Evaluación Minedu Primaria).',
        'Asamblea de aula (Antes -> Durante -> Después del discurso) para deliberar y redactar los acuerdos de convivencia.',
        'Lectura de relatos de amistad y escritura de anécdotas escolares siguiendo los procesos de planificación, textualización y revisión.',
      ],
      recursosEducativos: [
        'Kit de Evaluación Diagnóstica de Primaria — Minedu.',
        'Cuaderno de Fichas de Comunicación 5.° Grado de Primaria y Biblioteca de Aula.',
      ],
      productoOEvidencia:
        'Cartel de acuerdos de convivencia consensuados y Antología de anécdotas de retorno a clases.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo:
            'Dialogamos en asamblea sobre nuestro retorno a clases y consensuamos acuerdos de convivencia',
          proposito:
            'Participar en una asamblea de aula proponiendo y argumentando acuerdos de convivencia respetando los turnos de habla.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo:
            'Leemos relatos escolares e inferimos las causas y consecuencias de las acciones',
          proposito:
            'Deducir relaciones lógicas de causa-efecto en relatos de convivencia escolar empleando el subrayado y organizadores.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo:
            'Planificamos y escribimos nuestras anécdotas y el primer borrador del cartel de acuerdos del aula',
          proposito:
            'Planificar y redactar el primer borrador del cartel de acuerdos de convivencia y anécdotas usando conectores lógicos.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo:
            'Revisamos, editamos y socializamos nuestro Cartel de Acuerdos y el Catálogo de la Biblioteca de Aula',
          proposito:
            'Revisar en pares los borradores aplicando la lista de cotejo y socializar la versión final del Cartel de Acuerdos y reseñas.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 2',
      titulo:
        'Investigamos y leemos textos expositivos sobre el cuidado de la salud y la gestión de residuos en nuestra escuela',
      duracion: '5 semanas',
      faseOMomento: 'I Bimestre — Unidad 2',
      proposito:
        'Comprender textos expositivos y discontinuos aplicando el sumillado para proponer hábitos de higiene y reciclaje escolar.',
      actividadesEstrategicas: [
        'Lectura analítica de artículos divulgativos y afiches sobre segregación de residuos sólidos.',
        'Elaboración de mapas semánticos y espinas de Ishikawa sobre problemáticas ambientales del patio escolar.',
        'Exposición oral de hallazgos sobre el manejo de residuos en la I.E. N.° 1145.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria Minedu.',
        'Textos informativos de la Biblioteca de Aula Minedu.',
      ],
      productoOEvidencia:
        'Dossier de organizadores gráficos y exposición oral sobre salud y ambiente.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo:
            'Leemos textos expositivos sobre el manejo de residuos sólidos aplicando la técnica del sumillado',
          proposito:
            'Identificar ideas principales y secundarias en textos expositivos sobre el cuidado ambiental mediante el sumillado.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo:
            'Analizamos afiches y textos discontinuos deduciendo el propósito comunicativo del autor',
          proposito:
            'Interpretar la relación entre imagen, tipografía y texto en afiches ambientales de la escuela.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo:
            'Elaboramos nuestro dossier de organizadores gráficos con propuestas de segregación de residuos',
          proposito:
            'Planificar, textualizar y revisar organizadores gráficos y fichas informativas sobre las 3R en la escuela.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 4',
          titulo:
            'Exponemos nuestras conclusiones sobre el cuidado del patio escolar usando apoyos visuales',
          proposito:
            'Exponer oralmente hallazgos y propuestas de mejora ambiental modulando la voz y empleando organizadores.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 3',
      titulo:
        'Producimos infografías y textos instructivos para promover las brigadas ecológicas y loncheras nutritivas',
      duracion: '5 semanas',
      faseOMomento: 'II Bimestre — Unidad 3',
      proposito:
        'Escribir y revisar infografías y textos instructivos integrando recursos visuales y ortográficos para sensibilizar a la comunidad.',
      actividadesEstrategicas: [
        'Planificación y diseño de infografías ambientales integrando texto breve, imágenes y datos estadísticos del aula.',
        'Redacción de textos instructivos para reutilizar materiales reciclables y preparar loncheras saludables.',
        'Revisión en pares con rúbrica y publicación en los murales del pabellón de primaria.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria.',
        'Papelotes, plumones, revistas recicladas y tabletas educativas.',
      ],
      productoOEvidencia:
        'Galería de Infografías Ambientales y Recetario de loncheras saludables.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Exploramos la estructura y elementos visuales de una infografía ambiental',
          proposito:
            'Reconocer las partes de una infografía (titular, bajada, cuerpo, fuente y créditos) antes de planificar.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Planificamos y redactamos el borrador de nuestra infografía sobre reciclaje',
          proposito:
            'Organizar ideas de forma coherente en un borrador de infografía empleando conectores y vocabulario preciso.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Revisamos, editamos y socializamos nuestras infografías en el mural escolar',
          proposito:
            'Revisar la ortografía y coherencia visual de la infografía aplicando una lista de cotejo entre pares.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 4',
      titulo:
        'Valoramos la diversidad cultural de nuestras familias recopilando relatos, mitos y leyendas peruanas',
      duracion: '5 semanas',
      faseOMomento: 'II Bimestre — Unidad 4',
      proposito:
        'Rescatar la tradición oral familiar mediante entrevistas y lectura comparativa de mitos y leyendas para el Primer Día del Logro.',
      actividadesEstrategicas: [
        'Entrevistas a padres y abuelos sobre relatos y costumbres de sus regiones de origen.',
        'Lectura comparativa de mitos y leyendas peruanas de la Biblioteca de Aula Minedu (costa, sierra y selva).',
        'Presentación oral en el Festival de Cuenta Cuentos por el Primer Día del Logro.',
      ],
      recursosEducativos: [
        'Antología Literaria de Primaria Minedu.',
        'Guía de entrevista familiar y portafolio lector.',
      ],
      productoOEvidencia:
        'Festival de Cuenta Cuentos y Antología ilustrada de Leyendas Familiares.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Entrevistamos a nuestras familias para recoger relatos y tradiciones orales',
          proposito:
            'Formular preguntas pertinentes en una entrevista oral para recopilar saberes y tradiciones familiares.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Leemos y comparamos leyendas de la costa, sierra y selva del Perú',
          proposito:
            'Establecer semejanzas y diferencias entre personajes y escenarios de leyendas peruanas.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Escribimos y narramos nuestra antología de leyendas en el Día del Logro',
          proposito:
            'Redactar y narrar oralmente una leyenda familiar empleando recursos expresivos y paraverbales.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 5',
      titulo:
        'Leemos y escribimos crónicas y reportajes sobre la historia y lugares representativos de nuestro distrito',
      duracion: '5 semanas',
      faseOMomento: 'III Bimestre — Unidad 5',
      proposito:
        'Indagar en fuentes escritas y orales sobre la historia local para producir crónicas y reportajes escolares.',
      actividadesEstrategicas: [
        'Lectura de crónicas y reportajes periodísticos identificando hechos, opiniones y secuencia cronológica.',
        'Planificación y redacción de reportajes sobre el patrimonio y emprendimientos de San Juan de Lurigancho.',
        'Socialización de reportajes en formato de noticiero escolar.',
      ],
      recursosEducativos: [
        'Periódicos locales, crónicas de la Biblioteca de Aula y Cuaderno de Fichas 5.° Primaria.',
      ],
      productoOEvidencia: 'Suplemento de Crónicas y Reportajes de nuestra Comunidad.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Diferenciamos hechos y opiniones al leer reportajes sobre nuestra localidad',
          proposito:
            'Distinguir información objetiva de opiniones del autor en reportajes y crónicas locales.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Planificamos y escribimos un reportaje sobre los saberes de nuestro barrio',
          proposito:
            'Redactar un reportaje estructurado en entrada, desarrollo y cierre usando conectores temporales.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Presentamos nuestro noticiero escolar compartiendo los reportajes del aula',
          proposito:
            'Comunicar oralmente el reportaje elaborado adecuando la entonación al formato periodístico.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 6',
      titulo:
        'Interpretamos textos científicos escolares y redactamos informes de indagación sobre biodiversidad y energía',
      duracion: '5 semanas',
      faseOMomento: 'III Bimestre — Unidad 6',
      proposito:
        'Integrar datos de diversas fuentes informativas para redactar resúmenes y conclusiones de indagación escolar.',
      actividadesEstrategicas: [
        'Lectura intertextual de enciclopedias escolares y textos de divulgación científica.',
        'Elaboración de cuadros comparativos y resúmenes con parafraseo.',
        'Exposición con apoyo de maquetas y dípticos informativos.',
      ],
      recursosEducativos: [
        'Textos de divulgación científica de la Biblioteca de Aula Minedu y tabletas.',
      ],
      productoOEvidencia: 'Dípticos informativos y fichas de síntesis científica.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Leemos textos de divulgación científica y elaboramos resúmenes por parafraseo',
          proposito:
            'Integrar información relevante de dos textos expositivos mediante el parafraseo.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Escribimos un díptico informativo para promover el ahorro de energía y agua',
          proposito:
            'Diseñar y redactar un díptico informativo usando subtítulos, viñetas y lenguaje claro.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Socializamos nuestros dípticos en una feria informativa escolar',
          proposito:
            'Explicar oralmente el contenido del díptico respondiendo preguntas del público escolar.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 7',
      titulo:
        'Deliberamos en debates estudiantiles y escribimos artículos de opinión sobre los derechos y deberes de la niñez',
      duracion: '5 semanas',
      faseOMomento: 'IV Bimestre — Unidad 7',
      proposito:
        'Desarrollar la argumentación oral y escrita mediante debates y artículos de opinión sobre convivencia y ciudadanía.',
      actividadesEstrategicas: [
        'Lectura crítica de artículos de opinión y cartas al lector identificando tesis y argumentos.',
        'Organización y desarrollo de un Debate Estudiantil de 5.° grado con moderador y reglas acordadas.',
        'Redacción y revisión de artículos de opinión y cartas formales dirigidas al Municipio Escolar.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria Minedu y fichas de argumentación.',
      ],
      productoOEvidencia:
        'Debate Estudiantil de Aula y Mural de Artículos de Opinión sobre los Derechos del Niño.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Identificamos la tesis y los argumentos en artículos de opinión escolares',
          proposito:
            'Reconocer la postura del autor y las razones que la sustentan en textos argumentativos.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Escribimos un artículo de opinión defendiendo el buen trato y la inclusión',
          proposito:
            'Redactar un artículo de opinión con tesis clara, argumentos sólidos y conectores causales.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Participamos en un debate escolar sustentando nuestras propuestas con respeto',
          proposito:
            'Debatir sobre asuntos públicos de la escuela formulando argumentos y contraargumentos respetuosos.',
          duracion: '90 minutos',
        },
      ],
    },
    {
      numero: 'Unidad 8',
      titulo:
        'Editamos y publicamos nuestra Revista Escolar demostrando nuestros logros comunicativos en el Día del Logro',
      duracion: '4 semanas',
      faseOMomento: 'IV Bimestre — Unidad 8',
      proposito:
        'Sistematizar, editar y presentar públicamente las mejores producciones escritas del año en una Revista Escolar.',
      actividadesEstrategicas: [
        'Selección y revisión final de textos del portafolio anual en comité editorial estudiantil.',
        'Diagramación cooperativa de la Revista Escolar de 5.° Grado (editorial, artículos, cuentos e infografías).',
        'Presentación oral y balance metacognitivo ante las familias en el Segundo Día del Logro.',
      ],
      recursosEducativos: [
        'Portafolio anual de evidencias del estudiante y rúbricas de salida CNEB.',
      ],
      productoOEvidencia:
        'Revista Escolar de 5.° Grado de Primaria presentada en el Día del Logro.',
      sesionesSugeridas: [
        {
          numero: 'Sesión 1',
          titulo: 'Organizamos nuestro comité editorial y seleccionamos los textos del portafolio',
          proposito:
            'Evaluar y seleccionar colaborativamente las producciones del año para la Revista Escolar.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 2',
          titulo: 'Redactamos la presentación editorial y diagramamos nuestra Revista Escolar',
          proposito:
            'Escribir la nota editorial y revisar la cohesión e ilustraciones de la revista.',
          duracion: '90 minutos',
        },
        {
          numero: 'Sesión 3',
          titulo: 'Presentamos nuestra Revista Escolar a las familias en el Día del Logro',
          proposito:
            'Exponer oralmente el proceso de producción de la revista y reflexionar sobre los logros alcanzados.',
          duracion: '90 minutos',
        },
      ],
    },
  ],
  orientacionesEvaluacion: [
    {
      tipoEvaluacion: 'Diagnóstica',
      orientacionPedagogica:
        'Se aplica al inicio del año escolar utilizando el Kit de Evaluación Diagnóstica de Educación Primaria del Minedu y el análisis de actas SIAGIE del grado anterior para identificar las necesidades reales en lectura, escritura y oralidad.',
      tecnicasEInstrumentos:
        'Registro del Kit Diagnóstico de Lectura y Escritura Primaria Minedu, mapa de calor del aula y portafolio inicial.',
    },
    {
      tipoEvaluacion: 'Formativa',
      orientacionPedagogica:
        'Es continua y centrada en el progreso del niño y niña (R.V.M. N.° 094-2020-MINEDU). El docente socializa los criterios en lenguaje claro al iniciar cada sesión y brinda retroalimentación descriptiva y por descubrimiento durante la revisión de borradores.',
      tecnicasEInstrumentos:
        'Listas de cotejo, rúbricas analíticas de Primaria, fichas de coevaluación entre pares y portafolio de producciones.',
    },
    {
      tipoEvaluacion: 'Sumativa',
      orientacionPedagogica:
        'Se registra al término de cada bimestre en el SIAGIE empleando la escala literal oficial del CNEB (AD: Logro Destacado, A: Logro Esperado, B: En Proceso, C: En Inicio) acompañada de conclusiones descriptivas para las familias.',
      tecnicasEInstrumentos:
        'Rúbrica integradora del producto de unidad y presentación en el Día del Logro.',
    },
  ],
  materialesYBibliografia: {
    paraElDocente: [
      'Ministerio de Educación del Perú (2016). Programa Curricular de Educación Primaria (R.M. N.° 649-2016-MINEDU). Lima: Minedu.',
      'Ministerio de Educación del Perú (2016). Currículo Nacional de la Educación Básica (R.M. N.° 281-2016-MINEDU). Lima: Minedu.',
      'Ministerio de Educación del Perú (2020). Norma que regula la Evaluación de las Competencias de los Estudiantes de la Educación Básica (R.V.M. N.° 094-2020-MINEDU).',
      'Ministerio de Educación del Perú (2015). Rutas del Aprendizaje — ¿Qué y cómo aprenden nuestros estudiantes? Área Curricular Comunicación Ciclo V. Lima: Minedu.',
    ],
    paraElEstudiante: [
      'Ministerio de Educación del Perú (2025). Cuaderno de Fichas de Comunicación 5.° Grado de Primaria (Dotación Oficial Minedu).',
      'Módulo de Biblioteca de Aula de Educación Primaria — Colección Literaria e Informativa Minedu.',
      'Portafolio de lectura y escritura, diccionario escolar, letras móviles y tarjetas de conectores lógicos.',
    ],
  },
};

export const UNIDAD_EJEMPLO_INICIAL_CNEB: DocumentoCurricularCNEB = {
  id: 'cneb-primaria-5to-comunicacion-unidad-1',
  fechaGeneracion: '2026-03-16T14:05:00.000Z',
  tipoDocumento: 'UNIDAD',
  unidadNumero: 1,
  codigoNormativo:
    'R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU · R.V.M. N.° 094-2020-MINEDU',
  tituloDocumento:
    'UNIDAD DIDÁCTICA N.° 01: NOS REENCONTRAMOS Y ORGANIZAMOS NUESTRA BIBLIOTECA DE AULA CONSENSUANDO ACUERDOS DE CONVIVENCIA EN ASAMBLEA',
  datosInformativos: {
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    institucionEducativa: 'I.E. N.° 1145 República de Colombia',
    nivel: 'Educación Primaria',
    ciclo: 'Ciclo V (5.° y 6.° Grado)',
    gradoYSeccion: '5.° de Primaria (Secciones A, B y C)',
    areaCurricular: 'Comunicación',
    periodoLectivo: 'I Bimestre 2026 — Unidad Didáctica 1 (Duración: 5 semanas)',
    duracionEstimada: '5 semanas (30 horas pedagógicas)',
    docenteResponsable: 'Lic. María Elena Paredes Rengifo',
    directorIE: 'Dr. Jorge Luis Mendoza Castro',
  },
  descripcionGeneralYCaracterizacion:
    'Esta Unidad Didáctica N.° 1 se desprende directamente de la Matriz Maestra de la Planificación Curricular Anual (PCA) de 5.° grado de Educación Primaria. Responde al diagnóstico del aula fortaleciendo la inferencia de relaciones causa-efecto en textos continuos y discontinuos, la participación oral argumentada en asambleas y la planificación, textualización y revisión de acuerdos de convivencia y anécdotas escolares utilizando la Biblioteca de Aula Minedu.',
  situacionSignificativa: {
    contextoReal:
      'Al iniciar el año escolar en la I.E. N.° 1145 República de Colombia, los estudiantes de 5.° grado se reencuentran con entusiasmo, pero observan desorden en el uso de los materiales de lectura y dificultades para escucharse respetuosamente durante los trabajos en equipo y recreos.',
    retoPedagogico:
      '¿Cómo podemos deliberar en asamblea para establecer nuestros acuerdos de convivencia y organizar de manera participativa nuestra Biblioteca de Aula para disfrutar de la lectura y escritura?',
    productoIntegrador:
      'Cartel de Acuerdos de Convivencia consensuados en Asamblea y Catálogo ilustrado de la Biblioteca de Aula con reseñas literarias.',
  },
  propositosAprendizaje: DOCUMENTO_EJEMPLO_INICIAL_CNEB.propositosAprendizaje,
  competenciasTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.competenciasTransversales,
  enfoquesTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.enfoquesTransversales,
  secuenciaDidactica: [
    {
      numero: 'Sesión 1',
      titulo:
        'Dialogamos en asamblea sobre nuestro retorno a clases y consensuamos acuerdos de convivencia',
      duracion: '90 minutos',
      faseOMomento: 'Semana 1 — Apertura del reto y Oralidad (Se comunica oralmente en su lengua materna)',
      proposito:
        'Participar en una asamblea de aula proponiendo y argumentando acuerdos de convivencia respetando los turnos de habla.',
      actividadesEstrategicas: [
        'Competencia movilizada: Se comunica oralmente en su lengua materna (Desempeño precisado: Expresa oralmente ideas y emociones de forma coherente y cohesionada al participar en asambleas de aula).',
        'Antes del discurso: Planifican su intervención oral sobre las necesidades de convivencia en el aula de 5.° grado.',
        'Durante el discurso: Participan en la asamblea proponiendo y sustentando acuerdos con respeto a los turnos de habla.',
        'Después del discurso: Evalúan el cumplimiento de los acuerdos de escucha activa.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria',
        'Papelotes y plumones',
      ],
      productoOEvidencia: 'Propuestas deliberadas en asamblea para el cartel de convivencia.',
    },
    {
      numero: 'Sesión 2',
      titulo: 'Leemos relatos escolares e inferimos las causas y consecuencias de las acciones',
      duracion: '90 minutos',
      faseOMomento: 'Semana 2 — Comprensión Lectora (Lee diversos tipos de textos escritos en su lengua materna)',
      proposito:
        'Deducir relaciones lógicas de causa-efecto en relatos de convivencia escolar empleando el subrayado y organizadores.',
      actividadesEstrategicas: [
        'Competencia movilizada: Lee diversos tipos de textos escritos en su lengua materna (Desempeño precisado: Deduce relaciones lógicas de causa-efecto a partir de información explícita e implícita).',
        'Antes de la lectura: Formulan hipótesis a partir del título e ilustraciones de un cuento de la Biblioteca de Aula.',
        'Durante la lectura: Aplican el subrayado y sumillado para deducir relaciones lógicas de causa-efecto.',
        'Después de la lectura: Elaboran un organizador gráfico y opinan sobre la actitud de los personajes.',
      ],
      recursosEducativos: [
        'Textos de la Biblioteca de Aula Minedu',
        'Ficha de lectura comprensiva',
      ],
      productoOEvidencia: 'Organizador de causa-efecto y ficha de comprensión inferencial.',
    },
    {
      numero: 'Sesión 3',
      titulo: 'Planificamos y escribimos nuestras anécdotas y el primer borrador del cartel de acuerdos del aula',
      duracion: '90 minutos',
      faseOMomento: 'Semana 3 — Producción Escrita: Planificación y Textualización (Escribe diversos tipos de textos en su lengua materna)',
      proposito:
        'Planificar y redactar el primer borrador del cartel de acuerdos de convivencia y anécdotas usando conectores lógicos.',
      actividadesEstrategicas: [
        'Competencia movilizada: Escribe diversos tipos de textos en su lengua materna (Desempeño precisado: Escribe textos de forma coherente y cohesionada ordenando las ideas en torno a un tema).',
        'Planificación: Definen propósito, destinatario y estructura de su texto en un cuadro de planificación.',
        'Textualización: Redactan el primer borrador utilizando conectores lógicos y signos de puntuación.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas 5.° Primaria',
        'Cuadro de planificación textual y hojas de borrador',
      ],
      productoOEvidencia: 'Cuadro de planificación y primer borrador del Cartel de Acuerdos y anécdotas.',
    },
    {
      numero: 'Sesión 4',
      titulo: 'Revisamos, editamos y socializamos nuestro Cartel de Acuerdos y el Catálogo de la Biblioteca de Aula',
      duracion: '90 minutos',
      faseOMomento: 'Semana 4 — Revisión, Edición y Socialización del Producto Integrador',
      proposito:
        'Revisar en pares los borradores aplicando la lista de cotejo y socializar la versión final del Cartel de Acuerdos y reseñas.',
      actividadesEstrategicas: [
        'Competencia movilizada: Escribe diversos tipos de textos en su lengua materna / Se comunica oralmente en su lengua materna (Desempeño precisado: Revisa el uso de los recursos ortográficos y la coherencia textual).',
        'Revisión: Intercambian borradores en parejas aplicando la rúbrica de revisión y corrigen digresiones u ortografía.',
        'Socialización y evaluación: Publican la versión final del Cartel de Acuerdos e inauguran la Biblioteca de Aula.',
      ],
      recursosEducativos: [
        'Rúbrica de revisión de producción escrita',
        'Cartulinas, plumones y Biblioteca de Aula Minedu',
      ],
      productoOEvidencia: 'Versión final publicada del Cartel de Acuerdos y Catálogo de la Biblioteca de Aula.',
    },
  ],
  orientacionesEvaluacion: DOCUMENTO_EJEMPLO_INICIAL_CNEB.orientacionesEvaluacion,
  materialesYBibliografia: DOCUMENTO_EJEMPLO_INICIAL_CNEB.materialesYBibliografia,
};

export const SESION_EJEMPLO_INICIAL_CNEB: DocumentoCurricularCNEB = {
  id: 'cneb-primaria-5to-comunicacion-u1-sesion-1',
  fechaGeneracion: '2026-03-16T14:10:00.000Z',
  tipoDocumento: 'SESION',
  unidadNumero: 1,
  sesionNumero: 1,
  codigoNormativo:
    'R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU · R.V.M. N.° 094-2020-MINEDU',
  tituloDocumento:
    'SESIÓN DE APRENDIZAJE N.° 01 (UNIDAD 1): DIALOGAMOS EN ASAMBLEA SOBRE NUESTRO RETORNO A CLASES Y CONSENSUAMOS ACUERDOS DE CONVIVENCIA',
  datosInformativos: {
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    institucionEducativa: 'I.E. N.° 1145 República de Colombia',
    nivel: 'Educación Primaria',
    ciclo: 'Ciclo V (5.° y 6.° Grado)',
    gradoYSeccion: '5.° de Primaria (Secciones A, B y C)',
    areaCurricular: 'Comunicación',
    periodoLectivo: 'I Bimestre 2026 — Unidad 1 · Sesión 1 (90 minutos)',
    duracionEstimada: '90 minutos (Inicio: 15 min · Desarrollo: 60 min · Cierre: 15 min)',
    docenteResponsable: 'Lic. María Elena Paredes Rengifo',
    directorIE: 'Dr. Jorge Luis Mendoza Castro',
  },
  descripcionGeneralYCaracterizacion:
    'Sesión de Aprendizaje N.° 1 vinculada a la Unidad Didáctica 1 y a la PCA de 5.° grado de Primaria. Desarrolla de manera focalizada la competencia "Se comunica oralmente en su lengua materna" mediante los procesos didácticos de la oralidad (Antes del discurso -> Durante el discurso -> Después del discurso), atendiendo la necesidad diagnóstica de argumentar ideas con claridad y escucha activa. Preparación de la sesión (¿Qué necesitamos hacer antes de la sesión?): 1) Preparar el cartel con el propósito de la sesión y los criterios de evaluación en lenguaje amigable; 2) Disponer las sillas en media luna para la asamblea de aula y alistar tarjetas de cartulina y plumones por equipos; 3) Tener lista la escala de valoración / lista de cotejo con los nombres de los estudiantes.',
  situacionSignificativa: {
    contextoReal:
      'Los niños y niñas de 5.° grado necesitan organizar la convivencia en el aula y el cuidado de los espacios comunes de la I.E. N.° 1145 República de Colombia desde la primera semana de clases.',
    retoPedagogico:
      '¿Cómo podemos organizar y expresar nuestras propuestas en una asamblea de aula para acordar normas que todos cumplamos con compromiso?',
    productoIntegrador:
      'Participación deliberativa en la Asamblea de Aula y acta de acuerdos de convivencia consensuados.',
  },
  propositosAprendizaje: [DOCUMENTO_EJEMPLO_INICIAL_CNEB.propositosAprendizaje[0]],
  competenciasTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.competenciasTransversales,
  enfoquesTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.enfoquesTransversales,
  secuenciaDidactica: [
    {
      numero: 'Momento 1',
      titulo: 'Motivación, saberes previos, conflicto cognitivo y propósito de la sesión',
      duracion: '15 minutos',
      faseOMomento: 'INICIO',
      proposito:
        'Despertar el interés de los estudiantes, activar saberes previos y comunicar el propósito y criterios de la asamblea.',
      actividadesEstrategicas: [
        'En grupo clase: La docente da la bienvenida afectuosa a los estudiantes, recuerda el reto de la Unidad 1 y presenta una casuística ilustrada sobre lo ocurrido en el patio y en la biblioteca escolar.',
        'Activación de saberes previos y problematización: Formula las preguntas: ¿Qué situaciones observamos en la imagen?, ¿cómo nos afecta cuando no respetamos los turnos para hablar?, ¿qué necesitamos acordar hoy para trabajar en armonía?',
        'Propósito y organización: Comunica el propósito literal: "Hoy participaremos en una asamblea de aula para proponer y consensuar nuestros acuerdos de convivencia sustentando nuestras ideas", socializa los criterios de evaluación y acuerdan dos normas de convivencia para la sesión (levantar la mano para pedir la palabra y escuchar sin interrumpir).',
      ],
      recursosEducativos: ['Lámina de casuística escolar', 'Cartel del propósito y criterios'],
      productoOEvidencia: 'Comprensión del propósito de la sesión y acuerdo de normas para la asamblea.',
    },
    {
      numero: 'Momento 2',
      titulo: 'Procesos didácticos de la oralidad: Antes del discurso -> Durante el discurso -> Después del discurso',
      duracion: '60 minutos',
      faseOMomento: 'DESARROLLO',
      proposito:
        'Planificar, expresar y deliberar propuestas de convivencia respetando los roles de hablante y oyente.',
      actividadesEstrategicas: [
        'Antes del discurso (En equipos de 4): Dialogan sobre las dificultades de convivencia observadas en el aula y en el recreo, y organizan en tarjetas de cartulina dos propuestas de acuerdos indicando el argumento de por qué son necesarias.',
        'Durante el discurso (En grupo clase — disposición en media luna): Eligen democráticamente a un moderador y un secretario; cada equipo presenta oralmente sus propuestas empleando conectores de causa y consecuencia ("porque", "por lo tanto") y modulando el volumen de voz, mientras la docente acompaña y formula preguntas de retroalimentación.',
        'Después del discurso (En grupo clase e individualmente): Deliberan y votan los 5 acuerdos prioritarios del aula, y evalúan con apoyo de la lista de cotejo cómo cumplieron los roles de hablante y oyente.',
      ],
      recursosEducativos: [
        'Tarjetas de cartulina, plumones y limpiatipo',
        'Cuaderno de Fichas de Comunicación 5.° Primaria',
      ],
      productoOEvidencia: 'Acuerdos de convivencia sustentados oralmente y consensuados en la asamblea.',
    },
    {
      numero: 'Momento 3',
      titulo: 'Evaluación formativa, metacognición y compromiso de aplicación',
      duracion: '15 minutos',
      faseOMomento: 'CIERRE',
      proposito:
        'Reflexionar sobre lo aprendido y asumir el compromiso de cumplir los acuerdos del aula.',
      actividadesEstrategicas: [
        'En grupo clase: Contrastan el acta de acuerdos consensuada con el propósito y los criterios socializados al inicio, y revisan si se cumplieron las dos normas de convivencia de la sesión.',
        'Metacognición: Reflexionan mediante las preguntas: ¿Qué aprendimos hoy en nuestra asamblea?, ¿qué pasos seguimos antes y durante nuestra intervención?, ¿qué dificultades tuvimos para escucharnos y cómo las superamos?, ¿para qué nos servirá cumplir estos acuerdos?',
        'Extensión familiar: Comentan en casa los acuerdos elegidos en la asamblea y dialogan con sus familias sobre qué normas practican en el hogar.',
      ],
      recursosEducativos: ['Lista de cotejo de expresión oral', 'Acta de acuerdos del aula'],
      productoOEvidencia: 'Reflexión metacognitiva y firma simbólica de compromiso estudiantil.',
    },
  ],
  orientacionesEvaluacion: DOCUMENTO_EJEMPLO_INICIAL_CNEB.orientacionesEvaluacion,
  materialesYBibliografia: DOCUMENTO_EJEMPLO_INICIAL_CNEB.materialesYBibliografia,
};

export const SESION_2_EJEMPLO_INICIAL_CNEB: DocumentoCurricularCNEB = {
  id: 'cneb-primaria-5to-comunicacion-u1-sesion-2',
  fechaGeneracion: '2026-03-16T14:15:00.000Z',
  tipoDocumento: 'SESION',
  unidadNumero: 1,
  sesionNumero: 2,
  codigoNormativo:
    'R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU · R.V.M. N.° 094-2020-MINEDU',
  tituloDocumento:
    'SESIÓN DE APRENDIZAJE N.° 02 (UNIDAD 1): LEEMOS RELATOS ESCOLARES E INFERIMOS LAS CAUSAS Y CONSECUENCIAS DE LAS ACCIONES',
  datosInformativos: {
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    institucionEducativa: 'I.E. N.° 1145 República de Colombia',
    nivel: 'Educación Primaria',
    ciclo: 'Ciclo V (5.° y 6.° Grado)',
    gradoYSeccion: '5.° de Primaria (Secciones A, B y C)',
    areaCurricular: 'Comunicación',
    periodoLectivo: 'I Bimestre 2026 — Unidad 1 · Sesión 2 (90 minutos)',
    duracionEstimada: '90 minutos (Inicio: 15 min · Desarrollo: 60 min · Cierre: 15 min)',
    docenteResponsable: 'Lic. María Elena Paredes Rengifo',
    directorIE: 'Dr. Jorge Luis Mendoza Castro',
  },
  descripcionGeneralYCaracterizacion:
    'Sesión de Aprendizaje N.° 2 vinculada a la Unidad Didáctica 1 y a la PCA de 5.° grado de Primaria. Desarrolla de manera focalizada la competencia "Lee diversos tipos de textos escritos en su lengua materna" aplicando los procesos didácticos de la lectura (Antes de la lectura -> Durante la lectura -> Después de la lectura) para atender la necesidad diagnóstica de fortalecer la inferencia de relaciones causa-efecto. Preparación de la sesión (¿Qué necesitamos hacer antes de la sesión?): 1) Seleccionar el relato escolar de la Biblioteca de Aula Minedu y preparar copias o proyectar la portada; 2) Elaborar en papelote el esquema de causa-efecto (Espina de Ishikawa / esquema de flechas); 3) Alistar la lista de cotejo con los criterios de comprensión lectora.',
  situacionSignificativa: {
    contextoReal:
      'Durante la organización de la Biblioteca de Aula en la I.E. N.° 1145 República de Colombia, los estudiantes de 5.° grado descubren cuentos sobre convivencia escolar y desean comprender por qué ocurren los conflictos entre los personajes y cómo los resuelven.',
    retoPedagogico:
      '¿Cómo podemos identificar pistas en el texto para deducir las causas y consecuencias de las acciones de los personajes y reflexionar sobre nuestra propia convivencia?',
    productoIntegrador:
      'Organizador gráfico de causa-efecto (Espina de Ishikawa / Esquema de flechas) y ficha de comprensión lectora.',
  },
  propositosAprendizaje: [DOCUMENTO_EJEMPLO_INICIAL_CNEB.propositosAprendizaje[1]],
  competenciasTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.competenciasTransversales,
  enfoquesTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.enfoquesTransversales,
  secuenciaDidactica: [
    {
      numero: 'Momento 1',
      titulo: 'Motivación, activación de saberes previos y propósito lector',
      duracion: '15 minutos',
      faseOMomento: 'INICIO',
      proposito:
        'Explorar el paratexto del cuento y establecer el propósito de lectura inferencial.',
      actividadesEstrategicas: [
        'En grupo clase: Recordamos los acuerdos consensuados en la Sesión 1 y la docente muestra la portada ilustrada del relato escolar seleccionado de la Biblioteca de Aula Minedu.',
        'Activación de saberes previos y conflicto cognitivo: Dialogan a partir de las preguntas: ¿Qué observan en la ilustración?, ¿por qué creen que ocurrió ese conflicto entre los personajes?, ¿cómo podemos descubrir la causa de un hecho cuando no está escrita directamente?',
        'Propósito y organización: Comunica el propósito de la sesión: "Hoy leeremos un relato escolar para deducir las causas y consecuencias de las acciones de los personajes utilizando un organizador gráfico", socializa los criterios de evaluación y acuerdan las normas de lectura silenciosa y escucha activa.',
      ],
      recursosEducativos: [
        'Libro de la Biblioteca de Aula Minedu 5.° Primaria',
        'Cartel de propósito y criterios de evaluación',
      ],
      productoOEvidencia: 'Hipótesis iniciales de lectura registradas en la pizarra.',
    },
    {
      numero: 'Momento 2',
      titulo: 'Procesos didácticos de la lectura: Antes de la lectura -> Durante la lectura -> Después de la lectura',
      duracion: '60 minutos',
      faseOMomento: 'DESARROLLO',
      proposito:
        'Aplicar el subrayado de pistas textuales para deducir relaciones de causa-efecto.',
      actividadesEstrategicas: [
        'Antes de la lectura (En grupo clase): Inspeccionan el título, los párrafos e ilustraciones del relato y registran en su cuaderno sus predicciones sobre el problema central.',
        'Durante la lectura (Individualmente y en grupo clase): Realizan una primera lectura silenciosa y luego una lectura guiada por párrafos, deteniéndose en los conectores ("porque", "ya que", "por eso", "en consecuencia") para subrayar las acciones y sus motivos con colores diferenciados.',
        'Después de la lectura (En parejas): Completan el organizador gráfico relacionando cada acción principal con su causa y su consecuencia, contrastan sus hipótesis iniciales y redactan una opinión crítica sobre la actitud de los personajes.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria',
        'Resaltadores, tarjetas de conectores y ficha de esquema causa-efecto',
      ],
      productoOEvidencia:
        'Esquema de causa-efecto completado y ficha con respuestas de nivel inferencial y crítico.',
    },
    {
      numero: 'Momento 3',
      titulo: 'Socialización de esquemas, evaluación formativa y metacognición',
      duracion: '15 minutos',
      faseOMomento: 'CIERRE',
      proposito:
        'Verificar el logro de los criterios de lectura inferencial y reflexionar sobre las estrategias empleadas.',
      actividadesEstrategicas: [
        'En grupo clase: Dos parejas voluntarias socializan sus organizadores gráficos en la pizarra y contrastan sus respuestas con los criterios de evaluación y el cumplimiento de las normas del día.',
        'Metacognición: Reflexionan sobre su proceso lector: ¿Qué aprendimos hoy?, ¿qué pistas del texto nos ayudaron a deducir la causa de una acción?, ¿qué dificultad tuvimos y cómo la superamos?, ¿cómo nos sirve esta estrategia al leer otros textos?',
        'Extensión familiar: Comparten el relato con un familiar y dialogan sobre una anécdota escolar identificando qué la ocasionó y qué aprendizaje dejó.',
      ],
      recursosEducativos: ['Rúbrica / Lista de cotejo de comprensión lectora', 'Portafolio lector'],
      productoOEvidencia: 'Autoevaluación lectora y compromiso de aplicación.',
    },
  ],
  orientacionesEvaluacion: DOCUMENTO_EJEMPLO_INICIAL_CNEB.orientacionesEvaluacion,
  materialesYBibliografia: DOCUMENTO_EJEMPLO_INICIAL_CNEB.materialesYBibliografia,
};

export const UNIDAD_2_EJEMPLO_INICIAL_CNEB: DocumentoCurricularCNEB = {
  id: 'cneb-primaria-5to-comunicacion-unidad-2',
  fechaGeneracion: '2026-03-16T14:20:00.000Z',
  tipoDocumento: 'UNIDAD',
  unidadNumero: 2,
  codigoNormativo:
    'R.M. N.° 649-2016-MINEDU · R.M. N.° 587-2023-MINEDU · R.V.M. N.° 094-2020-MINEDU',
  tituloDocumento:
    'UNIDAD DIDÁCTICA N.° 02: INVESTIGAMOS Y LEEMOS TEXTOS EXPOSITIVOS SOBRE EL CUIDADO DE LA SALUD Y LA GESTIÓN DE RESIDUOS EN NUESTRA ESCUELA',
  datosInformativos: {
    dre: 'DRE Lima Metropolitana',
    ugel: 'UGEL 05 San Juan de Lurigancho',
    institucionEducativa: 'I.E. N.° 1145 República de Colombia',
    nivel: 'Educación Primaria',
    ciclo: 'Ciclo V (5.° y 6.° Grado)',
    gradoYSeccion: '5.° de Primaria (Secciones A, B y C)',
    areaCurricular: 'Comunicación',
    periodoLectivo: 'I Bimestre 2026 — Unidad Didáctica 2 (Duración: 5 semanas)',
    duracionEstimada: '5 semanas (30 horas pedagógicas)',
    docenteResponsable: 'Lic. María Elena Paredes Rengifo',
    directorIE: 'Dr. Jorge Luis Mendoza Castro',
  },
  descripcionGeneralYCaracterizacion:
    'Esta Unidad Didáctica N.° 2 forma parte del Proyecto PCA de 5.° grado de Educación Primaria. Aborda de manera directa la problemática ambiental identificada en el contexto de la I.E. N.° 1145 República de Colombia y la necesidad diagnóstica de comprender textos expositivos y discontinuos (afiches e infografías) empleando la técnica del sumillado y organizadores gráficos.',
  situacionSignificativa: {
    contextoReal:
      'En los patios y exteriores de la I.E. N.° 1145 República de Colombia se observa acumulación de botellas plásticas, papeles y envolturas después del recreo, lo que afecta la salud y presentación de nuestra escuela.',
    retoPedagogico:
      '¿Cómo podemos investigar en textos expositivos y afiches para comprender el impacto de los residuos sólidos y exponer propuestas de segregación ante nuestra comunidad escolar?',
    productoIntegrador:
      'Dossier de organizadores gráficos (sumillado y mapas semánticos) y Exposición Oral sobre Gestión de Residuos Escolares.',
  },
  propositosAprendizaje: DOCUMENTO_EJEMPLO_INICIAL_CNEB.propositosAprendizaje,
  competenciasTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.competenciasTransversales,
  enfoquesTransversales: DOCUMENTO_EJEMPLO_INICIAL_CNEB.enfoquesTransversales,
  secuenciaDidactica: [
    {
      numero: 'Sesión 1',
      titulo:
        'Leemos textos expositivos sobre el manejo de residuos sólidos aplicando la técnica del sumillado',
      duracion: '90 minutos',
      faseOMomento: 'Semana 1 — Lectura Expositiva (Lee diversos tipos de textos escritos en su lengua materna)',
      proposito:
        'Identificar ideas principales y secundarias en textos expositivos sobre el cuidado ambiental mediante el sumillado.',
      actividadesEstrategicas: [
        'Competencia movilizada: Lee diversos tipos de textos escritos en su lengua materna (Desempeño precisado: Identifica información explícita y relevante e integra datos ubicados en distintas partes de textos expositivos).',
        'Antes de la lectura: Predicen el contenido del texto expositivo a partir de los subtítulos y gráficos.',
        'Durante la lectura: Subrayan datos clave en cada párrafo y redactan sumillas al margen.',
        'Después de la lectura: Sintetizan las ideas principales en un mapa semántico.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria',
        'Lecturas informativas sobre las 3R',
      ],
      productoOEvidencia: 'Texto sumillado y mapa semántico sobre las 3R en la escuela.',
    },
    {
      numero: 'Sesión 2',
      titulo:
        'Analizamos afiches y textos discontinuos deduciendo el propósito comunicativo del autor',
      duracion: '90 minutos',
      faseOMomento: 'Semana 2 — Lectura de Textos Discontinuos (Lee diversos tipos de textos escritos en su lengua materna)',
      proposito:
        'Interpretar la relación entre imagen, tipografía y texto en afiches ambientales de la escuela.',
      actividadesEstrategicas: [
        'Competencia movilizada: Lee diversos tipos de textos escritos en su lengua materna (Desempeño precisado: Deduce el propósito comunicativo y evalúa la intención de los recursos textuales en textos discontinuos).',
        'Antes de la lectura: Observan diversos afiches de campañas ambientales del Minedu.',
        'Durante la lectura: Analizan el eslogan, las imágenes centrales y los datos complementarios.',
        'Después de la lectura: Evalúan críticamente el impacto de los recursos visuales en el lector.',
      ],
      recursosEducativos: [
        'Afiches ambientales impresos y digitales',
        'Ficha de análisis crítico',
      ],
      productoOEvidencia: 'Cuadro de análisis de afiches y reflexión escrita.',
    },
    {
      numero: 'Sesión 3',
      titulo:
        'Elaboramos nuestro dossier de organizadores gráficos con propuestas de segregación de residuos',
      duracion: '90 minutos',
      faseOMomento: 'Semana 3 — Producción Escrita (Escribe diversos tipos de textos en su lengua materna)',
      proposito:
        'Planificar, textualizar y revisar organizadores gráficos y fichas informativas sobre las 3R en la escuela.',
      actividadesEstrategicas: [
        'Competencia movilizada: Escribe diversos tipos de textos en su lengua materna (Desempeño precisado: Organiza y desarrolla lógicamente las ideas en torno a un tema empleando conectores y vocabulario variado).',
        'Planificación: Seleccionan las fuentes leídas y estructuran el diseño de su dossier de organizadores gráficos.',
        'Textualización y revisión: Redactan las fichas síntesis, verifican la ortografía y precisión léxica en parejas y editan su dossier.',
      ],
      recursosEducativos: [
        'Cuaderno de Fichas de Comunicación 5.° Primaria',
        'Hojas bond, plumones y lista de cotejo de escritura',
      ],
      productoOEvidencia: 'Dossier de organizadores gráficos revisado y editado.',
    },
    {
      numero: 'Sesión 4',
      titulo:
        'Exponemos nuestras conclusiones sobre el cuidado del patio escolar usando apoyos visuales',
      duracion: '90 minutos',
      faseOMomento: 'Semana 4 — Expresión Oral y Socialización (Se comunica oralmente en su lengua materna)',
      proposito:
        'Exponer oralmente hallazgos y propuestas de mejora ambiental modulando la voz y empleando organizadores.',
      actividadesEstrategicas: [
        'Competencia movilizada: Se comunica oralmente en su lengua materna (Desempeño precisado: Emplea recursos no verbales y paraverbales y apoyos visuales para enfatizar sus ideas).',
        'Antes del discurso: Organizan su guion de exposición y preparan sus láminas de apoyo.',
        'Durante el discurso: Exponen en equipos utilizando conectores explicativos y volumen de voz adecuado.',
        'Después del discurso: Responden preguntas del auditorio y coevalúan su participación.',
      ],
      recursosEducativos: [
        'Papelotes con organizadores gráficos',
        'Lista de cotejo de exposición oral',
      ],
      productoOEvidencia: 'Exposición oral en equipos y compromisos de brigada ambiental.',
    },
  ],
  orientacionesEvaluacion: DOCUMENTO_EJEMPLO_INICIAL_CNEB.orientacionesEvaluacion,
  materialesYBibliografia: DOCUMENTO_EJEMPLO_INICIAL_CNEB.materialesYBibliografia,
};
