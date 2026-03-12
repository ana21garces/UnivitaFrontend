// HPLP-II style 48-question survey: questions, subscales, and scoring logic

export const QUESTIONS: string[] = [
  "Tomas algun alimento al levantarte por las mananas",
  "Relatas al medico cualquier sintoma extrano relacionado con tu salud",
  "Te quieres a ti misma (o)",
  "Realizas ejercicios para relajar tus musculos al menos 3 veces al dia o por semana",
  "Seleccionas comidas que no contienen ingredientes artificiales o quimicos para conservarlos",
  "Tomas tiempo cada dia para el relajamiento",
  "Conoces el nivel de colesterol en tu sangre (miligramos en sangre)",
  "Eres entusiasta y optimista con referencia a tu vida",
  "Crees que estas creciendo y cambiando personalmente en direcciones positivas",
  "Discutes con personas cercanas tus preocupaciones y problemas personales",
  "Eres consciente de las fuentes que producen tension (comunmente nervios) en tu vida",
  "Te sientes feliz y contento(a)",
  "Realizas ejercicio vigoroso por 20 o 30 minutos al menos tres veces a la semana",
  "Comes tres comidas al dia",
  "Lees revistas o folletos sobre como cuidar tu salud",
  "Eres consciente de tus capacidades y debilidades personales",
  "Trabajas en apoyo de metas a largo plazo en tu vida",
  "Elogias facilmente a otras personas por sus exitos",
  "Lees las etiquetas de las comidas empaquetadas para identificar nutrientes",
  "Le preguntas a otro medico o buscas otra opcion cuando no estas de acuerdo con lo que el tuyo te recomienda",
  "Miras hacia el futuro",
  "Participas en programas o actividades de ejercicio fisico bajo supervision",
  "Eres consciente de lo que te importa en la vida",
  "Te gusta expresar y que te expresen carino personas cercanas a ti",
  "Mantienes relaciones interpersonales que te dan satisfaccion",
  "Incluyes en tu dieta alimentos que contienen fibra (ejemplo: granos enteros, frutas crudas, verduras crudas)",
  "Pasas de 15 a 20 minutos diariamente en relajamiento o meditacion",
  "Discutes con profesionales calificados tus inquietudes respecto al cuidado de tu salud",
  "Respetas tus propios exitos",
  "Checas tu pulso durante el ejercicio fisico",
  "Pasas tiempo con amigos cercanos",
  "Haces medir tu presion arterial y sabes el resultado",
  "Asistes a programas educativos sobre el mejoramiento del medio ambiente en que vives",
  "Ves cada dia como interesante y desafiante",
  "Planeas o escoges comidas que incluyan los cuatro grupos basicos de nutrientes cada dia (proteinas, carbohidratos, grasas, vitaminas)",
  "Relajas conscientemente tus musculos antes de dormir",
  "Encuentras agradable y satisfecho el ambiente de tu vida",
  "Realizas actividades fisicas de recreo como caminar, nadar, jugar futbol, ciclismo",
  "Expresas facilmente interes, amor y calor humano hacia otros",
  "Te concentras en pensamientos agradables a la hora de dormir",
  "Pides informacion a los profesionales para cuidar de tu salud",
  "Encuentras maneras positivas para expresar tus sentimientos",
  "Observas al menos cada mes tu cuerpo para ver cambios fisicos o senas de peligro",
  "Eres realista en las metas que te propones",
  "Usas metodos especificos para controlar la tension (nervios)",
  "Asistes a programas educativos sobre el cuidado de la salud personal",
  "Te gusta mostrar y que te muestren afecto con palmadas, abrazos y caricias por personas que te importan",
  "Crees que tu vida tiene un proposito",
]

export interface Subscale {
  name: string
  /** 1-based question indices */
  items: number[]
}

export const SUBSCALES: Subscale[] = [
  { name: "Nutricion", items: [1, 5, 14, 19, 26, 35] },
  { name: "Ejercicio", items: [4, 13, 22, 30, 38] },
  { name: "Responsabilidad en Salud", items: [2, 7, 15, 20, 28, 32, 33, 42, 43, 46] },
  { name: "Manejo del Estres", items: [6, 11, 27, 36, 40, 41, 45] },
  { name: "Soporte Interpersonal", items: [10, 18, 24, 25, 31, 39, 47] },
  { name: "Autoactualizacion", items: [3, 8, 9, 12, 16, 17, 21, 23, 29, 34, 37, 44, 48] },
]

export const LIKERT_LABELS: Record<number, string> = {
  1: "Nunca",
  2: "A veces",
  3: "Frecuentemente",
  4: "Rutinariamente",
}

/** Calculate subscale scores from a Record<questionIndex(1-based), value(1-4)> */
export function calculateSubscaleScores(
  answers: Record<number, number>
): Record<string, { total: number; count: number; avg: number }> {
  const result: Record<string, { total: number; count: number; avg: number }> = {}
  for (const sub of SUBSCALES) {
    let total = 0
    let count = 0
    for (const qIdx of sub.items) {
      const val = answers[qIdx]
      if (val !== undefined) {
        total += val
        count++
      }
    }
    result[sub.name] = {
      total,
      count,
      avg: count > 0 ? Math.round((total / count) * 100) / 100 : 0,
    }
  }
  return result
}
