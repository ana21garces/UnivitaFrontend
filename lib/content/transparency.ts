// AI assisted development
/**
 * TR-006 — Fuente única de textos de transparencia para UnacHealth.
 * Consumida por: landing (TR-001), metodología (TR-002), aviso (TR-004/005),
 * encuesta, resultados y recomendaciones (TR-003).
 */

export type DimensionKey =
  | "relaciones_interpersonales"
  | "nutricion"
  | "responsabilidad_salud"
  | "actividad_fisica"
  | "manejo_estres"
  | "psicologia_positiva"

export type ExpertProfile = {
  displayName: string
  area: string
  credential: string
}

export type DimensionConfig = {
  key: DimensionKey
  name: string
  professionalArea: string
  responsibleProfessional: string
  credential: string
  /** Niveles del instrumento que generan tarjetas de orientación */
  nivelesConRecomendacion: readonly string[]
  /** Explicación cuando no hay tarjetas para ciertos niveles */
  sinRecomendacionRazon: string
  /** Descripción genérica de qué activa las tarjetas (sin fórmulas ni umbrales) */
  indicadoresDescripcion: string
}

export const TRANSPARENCY = {
  appName: "UnacHealth",
  tagline: "Guía informativa para tu bienestar integral",

  queEsUnacHealth: {
    title: "Qué es UnacHealth",
    paragraphs: [
      "UnacHealth es una plataforma web que promueve la adopción de estilos de vida saludables en estudiantes universitarios, a partir de un instrumento validado que evalúa sus hábitos en seis dimensiones del bienestar.",
      "Usa gamificación: misiones diarias, puntos, niveles, insignias y rachas, para sostener la práctica continua de los hábitos, e inteligencia artificial para acompañarte día a día con mensajes personalizados según tu avance.",
      "Las recomendaciones de cada dimensión son elaboradas y revisadas por el profesional del área, no por la IA. UnacHealth no es un diagnóstico médico ni una evaluación clínica, y no sustituye la atención de un profesional de la salud.",
    ],
  },

  quienesLoAvalan: {
    title: "Quiénes lo avalan",
    intro:
      "Cada recomendación de UnacHealth fue escrita y revisada por el profesional de su área, pensando en el día a día de un estudiante universitario. No son consejos genéricos: cada uno responde a una pregunta concreta del cuestionario en la que mostraste una oportunidad de mejora.",
    experts: [
      {
        displayName: "Profesional en Salud",
        area: "Salud y Enfermería",
        credential: "",
      },
      {
        displayName: "Profesional en Psicología",
        area: "Psicología Positiva",
        credential: "",
      },
      {
        displayName: "Profesional en Nutrición",
        area: "Nutrición y Dietética",
        credential: "",
      },
      {
        displayName: "Profesional en Actividad física",
        area: "Actividad Física",
        credential: "",
      },
      {
        displayName: "Profesional en Manejo del estrés",
        area: "Manejo del Estrés",
        credential: "",
      },
      {
        displayName: "Profesional en Relaciones Interpersonales",
        area: "Relaciones Interpersonales",
        credential: "",
      },
      {
        displayName: "Profesional en Capellanía",
        area: "Acompañamiento espiritual",
        credential: "",
      },
    ] satisfies ExpertProfile[],
  },

  comoSeConstruyen: {
    title: "Cómo se construyen las recomendaciones",
    summary:
      "Cada recomendación combina un instrumento validado con contenido redactado por el profesional de su área. Ninguna tarjeta es generada por inteligencia artificial.",
    steps: [
      {
        title: "1. Respondes el instrumento",
        description:
          "Completas el HPLP-II ASD, un instrumento validado de 52 ítems que explora tus hábitos en las seis dimensiones del bienestar.",
      },
      {
        title: "2. Conoces tu perfil",
        description:
          "Obtienes un nivel en cada dimensión. Eso muestra dónde estás bien y en qué áreas conviene empezar a trabajar.",
      },
      {
        title: "3. Recibes orientación de tus áreas más bajas",
        description:
          "Para las dimensiones donde hay oportunidad de mejora, recibes tarjetas escritas por el profesional de esa área. El contenido es humano, no generado por IA.",
      },
      {
        title: "4. Las practicas día a día",
        description:
          "Registras cada recomendación que cumples y avanzas con misiones, puntos y rachas. Cuando vuelvas a responder el instrumento, verás cómo cambió tu perfil.",
      },
    ],
    metodologiaLink: "/metodologia",
    metodologiaLinkLabel: "Conoce la metodología completa",
  },

  enQueSeBasa: {
    title: "En qué se basa",
    instrument: "HPLP-II ASD",
    instrumentFullName:
      "Health-Promoting Lifestyle Profile II — adaptación al contexto universitario adventista hispanohablante",
    items: 52,
    dimensions: 6,
    dimensionNames: [
      "Relaciones Interpersonales",
      "Nutrición",
      "Responsabilidad en la Salud",
      "Actividad Física",
      "Manejo del Estrés",
      "Psicología Positiva",
    ],
    paragraphs: [
      "El instrumento base es el HPLP-II (Health-Promoting Lifestyle Profile II), un cuestionario validado de 52 ítems distribuidos en 6 dimensiones del estilo de vida saludable.",
      "UnacHealth usa el HPLP-II ASD, su adaptación al contexto universitario adventista hispanohablante.",
    ],
  },

  /**
   * TR-004 + TR-005 — Aviso informativo compartido (texto aprobado por el equipo).
   * Una sola fuente: cambiar aquí se refleja en landing, encuesta, resultados y recomendaciones.
   */
  disclaimer: {
    title: "Aviso importante",
    text: "UnacHealth evalúa tus hábitos con un instrumento validado y te acompaña a mejorarlos con orientación escrita por los profesionales de cada área del bienestar. Es una herramienta educativa y de seguimiento personal: no diagnostica, no valora clínicamente tu salud y no reemplaza la atención de un médico o profesional de la salud. Si algo sobre tu bienestar te preocupa, consulta directamente con un profesional.",
    metodologiaLinkLabel: "¿Por qué estas recomendaciones?",
  },

  /** TR-003 — Textos del bloque "¿Por qué veo esto?" */
  porQueRecomendacion: {
    title: "¿Por qué veo esto?",
    fixedContentNote:
      "Las recomendaciones son contenido fijo redactado y revisado por el profesional del área (no generadas por inteligencia artificial). Cada tarjeta fue elaborada por el equipo correspondiente antes de publicarse en la plataforma.",
    nivelLabel: "Tu nivel en esta dimensión",
    redactadoPorLabel: "Contenido redactado por",
    sinTarjetasTitulo: "Sin orientación adicional en esta dimensión",
  },

  /** TR-002 — Las 6 dimensiones con su área profesional responsable */
  dimensions: [
    {
      key: "relaciones_interpersonales",
      name: "Relaciones Interpersonales",
      professionalArea: "Relaciones Interpersonales",
      responsibleProfessional: "Equipo de Relaciones",
      credential: "Profesionales en desarrollo humano",
      nivelesConRecomendacion: ["Pobre", "Moderado"],
      sinRecomendacionRazon:
        "Cuando tus hábitos en relaciones interpersonales están en nivel Bueno o Excelente, no se generan tarjetas porque ya muestras prácticas saludables en esta área. La orientación se enfoca en quienes necesitan fortalecer sus vínculos.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre relaciones y vínculos sociales del cuestionario, donde indicaste áreas de mejora.",
    },
    {
      key: "nutricion",
      name: "Nutrición",
      professionalArea: "Nutrición y Dietética",
      responsibleProfessional: "Equipo de Nutrición",
      credential: "Profesionales en nutrición",
      nivelesConRecomendacion: ["Pobre", "Moderado"],
      sinRecomendacionRazon:
        "Por decisión del equipo de Nutrición y Dietética, esta dimensión solo incluye fichas orientativas para los niveles Pobre y Moderado. Si tu nivel es Bueno o Excelente, no recibes tarjetas: no es un error del sistema, sino un criterio profesional que prioriza la orientación donde hay mayor oportunidad de mejora.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre alimentación y nutrición del cuestionario, donde indicaste áreas de mejora.",
    },
    {
      key: "responsabilidad_salud",
      name: "Responsabilidad en la Salud",
      professionalArea: "Salud y Enfermería",
      responsibleProfessional: "Equipo de Salud",
      credential: "Profesionales en ciencias de la salud",
      nivelesConRecomendacion: ["Pobre", "Moderado"],
      sinRecomendacionRazon:
        "Cuando tu nivel en responsabilidad en la salud es Bueno o Excelente, no se generan tarjetas porque ya demuestras hábitos proactivos de cuidado de tu salud.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre autocuidado y responsabilidad en salud del cuestionario.",
    },
    {
      key: "actividad_fisica",
      name: "Actividad Física",
      professionalArea: "Actividad Física",
      responsibleProfessional: "Equipo de Actividad Física",
      credential: "Profesionales en educación física",
      nivelesConRecomendacion: ["Pobre", "Moderado", "Bueno"],
      sinRecomendacionRazon:
        "Si todas tus respuestas sobre actividad física están en nivel Excelente, no se generan tarjetas porque ya cumples con las prácticas recomendadas en esta dimensión.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre ejercicio y movimiento del cuestionario, priorizando las áreas con mayor oportunidad de mejora.",
    },
    {
      key: "manejo_estres",
      name: "Manejo del Estrés",
      professionalArea: "Manejo del Estrés",
      responsibleProfessional: "Equipo de Bienestar Emocional",
      credential: "Profesionales en salud mental",
      nivelesConRecomendacion: ["Pobre", "Moderado"],
      sinRecomendacionRazon:
        "Cuando tu nivel en manejo del estrés es Bueno o Excelente, no se generan tarjetas porque ya cuentas con estrategias efectivas de regulación emocional.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre estrés y relajación del cuestionario.",
    },
    {
      key: "psicologia_positiva",
      name: "Psicología Positiva",
      professionalArea: "Psicología Positiva",
      responsibleProfessional: "Equipo de Psicología",
      credential: "Profesionales en psicología",
      nivelesConRecomendacion: ["Pobre", "Moderado", "Bueno"],
      sinRecomendacionRazon:
        "Si todas tus respuestas en psicología positiva están en nivel Excelente, no se generan tarjetas porque ya reflejas fortalezas y bienestar emocional en esta área.",
      indicadoresDescripcion:
        "Las tarjetas se activan según tus respuestas a las preguntas sobre actitudes positivas, propósito y bienestar emocional del cuestionario.",
    },
  ] satisfies DimensionConfig[],

  metodologia: {
    title: "Metodología",
    intro:
      "Esta página explica de dónde salen las recomendaciones que ves en UnacHealth, qué áreas las avalan y cuáles son sus límites. Puedes consultarla con o sin sesión iniciada.",
    limitesTitle: "Límites de UnacHealth",
    limites: [
      "UnacHealth no diagnostica condiciones de salud ni reemplaza la atención médica o psicológica profesional.",
      "Las recomendaciones son orientativas y se basan en tus respuestas al cuestionario; no predicen tu salud futura.",
      "No todas las dimensiones ni todos los niveles generan tarjetas de orientación (ver tabla más abajo).",
      "Las tarjetas de orientación no las genera la inteligencia artificial: cada una fue redactada y revisada por un profesional del área. La IA solo redacta el saludo del asistente y nunca da orientación de salud.",
      "Los puntos de corte y fórmulas internas no se exponen; solo se muestra el nivel resultante para facilitar tu autoconocimiento.",
    ],
    coberturaTitle: "¿Qué niveles generan recomendaciones?",
    coberturaIntro:
      "No todas las dimensiones cubren los cuatro niveles del instrumento. Esto responde a criterios del equipo profesional de cada área, no a limitaciones técnicas ocultas.",
    nutricionDestacado: {
      title: "Por qué en algunas dimensiones no ves tarjetas",
      content:
        "Tu nivel puede ser Excelente en cualquiera de las seis dimensiones: eso no cambia. Lo que cambia es hasta qué nivel hay tarjetas de orientación. En cuatro dimensiones se orienta solo en Pobre y Moderado, y en Actividad Física y Psicología Positiva también en Bueno. Es un criterio del equipo profesional de cada área, no una limitación de la plataforma: si tu nivel es más alto, no recibes tarjetas porque ya muestras prácticas saludables ahí.",
    },
    sections: [
      {
        title: "Instrumento: HPLP-II ASD",
        content:
          "Utilizamos el Health-Promoting Lifestyle Profile II (HPLP-II) en su adaptación al contexto universitario adventista hispanohablante (HPLP-II ASD). Consta de 52 ítems con escala Likert de 1 a 4, agrupados en 6 dimensiones: Relaciones Interpersonales, Nutrición, Responsabilidad en la Salud, Actividad Física, Manejo del Estrés y Psicología Positiva.",
      },
      {
        title: "Cómo se calculan los niveles",
        content:
          "A partir de tus respuestas se obtiene un índice por dimensión, que clasifica cada área en un nivel de bienestar (Pobre, Moderado, Bueno o Excelente). Estos niveles orientan qué contenido recibirás, sin exponer fórmulas ni umbrales exactos.",
      },
      {
        title: "Recomendaciones humanas",
        content:
          "Las tarjetas de recomendación son redactadas por profesionales de cada área y revisadas antes de publicarse en la plataforma. No se utilizan modelos de inteligencia artificial para generar el contenido orientativo que recibes.",
      },
      {
        title: "Gamificación",
        content:
          "Para sostener la práctica continua de los hábitos, la plataforma incorpora misiones diarias, puntos, niveles, insignias y rachas. Estos elementos acompañan el seguimiento de tus recomendaciones y no modifican tu resultado en el cuestionario ni el contenido que recibes.",
      },
      {
        title: "Dónde se usa la inteligencia artificial",
        content:
          "Cada día, al abrir tu panel, el asistente te saluda con un mensaje escrito para ti: reconoce tu racha, te recuerda cuántas misiones te faltan y te señala la dimensión en la que vale la pena poner el foco. Ese mensaje lo redacta la inteligencia artificial, así que cambia contigo a medida que avanzas. Su papel es motivarte, no evaluarte: no calcula tus niveles, no decide qué recomendaciones recibes y no da orientación de salud. Eso queda en manos del instrumento y de los profesionales de cada área.",
      },
      {
        title: "Seguimiento y evolución",
        content:
          "Puedes volver a completar el cuestionario periódicamente para observar tu evolución en cada dimensión y recibir orientación actualizada según tu nivel actual.",
      },
    ],
  },
} as const

/** Obtiene la configuración de una dimensión por su clave */
export function getDimensionConfig(key: DimensionKey): DimensionConfig {
  const dim = TRANSPARENCY.dimensions.find((d) => d.key === key)
  if (!dim) throw new Error(`Dimensión desconocida: ${key}`)
  return dim
}

type TarjetaIndicador = {
  pregunta_num: number
  pregunta_texto: string
}

/** Resume los indicadores que activaron tarjetas, sin exponer lógica interna */
export function formatIndicadoresActivados(tarjetas: TarjetaIndicador[]): string {
  if (tarjetas.length === 0) {
    return "No se activaron indicadores de mejora en esta dimensión según tus respuestas actuales."
  }
  if (tarjetas.length === 1) {
    const t = tarjetas[0]
    return `Se activó por tu respuesta a la pregunta ${t.pregunta_num} del cuestionario: «${t.pregunta_texto}».`
  }
  const nums = tarjetas.map((t) => t.pregunta_num).join(", ")
  return `Se activaron ${tarjetas.length} orientaciones según tus respuestas en las preguntas ${nums} del cuestionario de esta dimensión.`
}

/** Indica si un nivel tiene cobertura de recomendaciones en una dimensión */
export function nivelTieneRecomendacion(key: DimensionKey, nivel: string): boolean {
  const dim = getDimensionConfig(key)
  return dim.nivelesConRecomendacion.some(
    (n) => n.toLowerCase() === nivel.toLowerCase(),
  )
}
