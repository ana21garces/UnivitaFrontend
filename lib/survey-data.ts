// HPLP-II style 48-question survey: questions, subscales, and scoring logic

export const QUESTIONS: string[] = [
  "Dialogar tus problemas o preocupaciones con personas muy allegadas a ti.",
  "Consumir alimentos reducidos en grasas, grasas saturadas o calorías.",
  "Informar a los profesionales de la salud cualquier señal inusual o síntoma extraño en tu salud o cuerpo.",
  "Seguir un programa de ejercicio físico planificado por un profesional en este campo.",
  "Dormir diariamente de 7 a 9 horas por las noches.",
  "Cambiar tus comportamientos habituales de una forma positiva.",
  "Elogiar a otras personas por sus éxitos",
  "Limitar el consumo de alimentos con azúcares añadidos (dulces, pasteles/panes, refrescos, entre otros).",
  "Procurar mantenerte informado acerca del mejoramiento de la salud.",
  "Practicar semanalmente ejercicios vigorosos (aquellos que implican un esfuerzo físico que te hacen respirar mucho más fuerte de lo normal) por ≥ 3 días y ≥ 20 minutos por sesión.",
  "Apartar diariamente algún tiempo para relajarte.",
  "Aceptar que tu vida tiene un propósito.",
  "Mantener relaciones sociales positivas.",
  "Comer diariamente de 6 a 11 porciones (1 porción = ½ taza) de carbohidratos (pan, tortilla, arroz, avena, pasta, fideos, amaranto, entre otros).",
  "Hacer preguntas a los profesionales de la salud para poder entender sus instrucciones.",
  "Practicar semanalmente actividades físicas de caminata (≥ 5 días y ≥ 30 minutos por sesión).",
  "Practicar semanalmente actividades físicas moderadas (aquellas queimplican un esfuerzo físico que te hacen respirar un poco más fuerte de lo normal), por ≥ 5 días y ≥ 30 minutos por sesión. ",
  "Aceptar aquellas cosas en tu vida que no puedes cambiar.",
  "Mirar hacia al futuro de forma positiva.",
  "Dedicar tiempo para estar con tus amistades más cercanas.",
  "Comer diariamente de 2 a 4 porciones de frutas. (1 porción = 1 pieza o 1 taza)",
  "Buscar una segunda opinión cuando tengas dudas de las recomendaciones de tu proveedor de servicios de salud.",
  "Practicar, en tus tiempos libres, actividades físicas de recreación (tales como nadar, andar en bicicleta, escalar montañas, entre otras).",
  "Concentrarte en pensamientos agradables a la hora de acostarte.",
  "Sentir satisfacción hacia tu persona.",
  "Expresar amor o cariño a otros.",
  "Comer diariamente de 3 a 5 porciones de vegetales. (1 porción de vegetales crudos = 1 taza y 1 porción de vegetales cocidos = ½ taza)",
  "Dialogar tus puntos de vista acerca de la salud con los profesionales en este campo.",
  "Practicar ejercicios de estiramiento que involucren grandes grupos musculares (espaldas, pectorales, cadera, piernas) 3 veces por semana.",
  "Usar métodos o técnicas específicas para controlar tu estrés.",
  "Establecer metas a largo plazo para tu vida.",
  "Utilizar el toque físico con las personas importantes para ti.",
  "Comer diariamente de 2 a 3 porciones de lácteos. (1 porción de leche = 1 taza, 1 porción de yogurt = ½ taza y 1 porción de queso = 40gr.)",
  "Examinar mensualmente tu cuerpo para detectar cambios físicos o señales diferentes en él.",
  "Tratar de mejorar tu nivel de actividad física diaria a través de comportamientos tales como: caminar a la hora del almuerzo, utilizar escaleras en vez de elevadores, estacionar el carro lejos del lugar de destino, entre otros.",
  "Mantener un equilibrio de tiempo entre tu trabajo/estudio y tus actividades de entretenimiento.",
  "Hacer que tu día sea interesante y retador (estimulante).",
  "Buscar maneras respetuosas de llenar tus necesidades afectivas.",
  "Comer diariamente de 2 a 3 porciones (1 porción = ½ taza) de proteína de origen vegetal (frijol, garbanzo, lenteja, soya, nueces, almendras, cacahuates, entre otras).",
  "Comer diariamente de 2 a 3 porciones (1 porción = 90 gramos) de proteína de origen animal (carne, aves, pescado, huevos, entre otras).",
  "Pedir orientación de los profesionales de la salud sobre cómo mantenerte en buen estado de salud.",
  "Medir tu frecuencia cardíaca cuando estás haciendo ejercicio.",
  "Practicar diariamente relajación o meditación por 15 a 20 minutos.",
  "Enfocarte en lo que es importante para ti en la vida.",
  "Buscar apoyo en las personas que se preocupan por ti.",
  "Observar los sellos de advertencia (hexágonos negros) que tienen los productos alimenticios ultraprocesados (empacados).",
  "Alcanzar tu pulso cardíaco objetivo cuando haces ejercicios aeróbicos (tales como caminar rápido, correr, pedalear, remar y nadar).",
  "Mantener equilibradas tus tareas laborales/estudios para prevenir el cansancio.",
  "Sentirte unido a Dios.",
  "Comprometerte a encontrar puntos en común, por medio del diálogo, con otras personas.",
  "Desayunar diariamente.",
  "Exponerte a nuevas experiencias y retos constructivos",
]

export interface Subscale {
  name: string
  /** 1-based question indices */
  items: number[]
}

export const SUBSCALES: Subscale[] = [
  { name: "Nutricion", items: [2, 8, 14, 20, 26, 32, 38, 44, 50] },
  { name: "Actividad fisica", items: [4, 10, 16, 22, 28, 34, 40, 46] },
  { name: "Responsabilidad en Salud", items: [3, 9, 15, 21, 27, 33, 39, 45, 51] },
  { name: "Manejo del Estres", items: [5, 11, 17, 23, 29, 35, 41, 47] },
  { name: "Relaciones Interpersonales", items: [1, 7, 13, 19, 25, 31, 37, 43, 49] },
  { name: "Crecimiento espiritual", items: [6, 12, 18, 24, 30, 36, 42, 48, 52] },
]

export const LIKERT_LABELS: Record<number, string> = {
  1: "Nunca",
  2: "Algunas veces",
  3: "Frecuentemente",
  4: "Rutinariamente",
}


//mapeo grupo de preguntas que ira al back
export const QUESTION_KEY_MAP: Record<number, string> = {
  1: "ri_item_01",
  2: "n_item_02",
  3: "rs_item_03",
  4: "af_item_04",
  5: "me_item_05",
  6: "pp_item_06",
  7: "ri_item_07",
  8: "n_item_08",
  9: "rs_item_09",
  10: "af_item_10",
  11: "me_item_11",
  12: "pp_item_12",
  13: "ri_item_13",
  14: "n_item_14",
  15: "rs_item_15",
  16: "af_item_16",
  17: "af_item_17",
  18: "me_item_18",
  19: "pp_item_19",
  20: "ri_item_20",
  21: "n_item_21",
  22: "rs_item_22",
  23: "af_item_23",
  24: "me_item_24",
  25: "pp_item_25",
  26: "ri_item_26",
  27: "n_item_27",
  28: "rs_item_28",
  29: "af_item_29",
  30: "me_item_30",
  31: "pp_item_31",
  32: "ri_item_32",
  33: "n_item_33",
  34: "rs_item_34",
  35: "af_item_35",
  36: "me_item_36",
  37: "pp_item_37",
  38: "ri_item_38",
  39: "n_item_39",
  40: "n_item_40",
  41: "rs_item_41",
  42: "af_item_42",
  43: "me_item_43",
  44: "pp_item_44",
  45: "ri_item_45",
  46: "n_item_46",
  47: "af_item_47",
  48: "me_item_48",
  49: "pp_item_49",
  50: "ri_item_50",
  51: "n_item_51",
  52: "pp_item_52",
};

//función para transformar el payload
export function buildSurveyPayload(
  answers: Record<number, number>
) {
  const payload: Record<string, any> = {};

  for (const [qIndex, value] of Object.entries(answers)) {
    const key = QUESTION_KEY_MAP[Number(qIndex)];
    if (key) {
      payload[key] = value;
    }
  }

  return payload;
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
