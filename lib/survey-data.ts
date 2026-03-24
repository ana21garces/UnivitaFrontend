// HPLP-II style 48-question survey: questions, subscales, and scoring logic

export const QUESTIONS: string[] = [
  "Discuto mis problemas y preocupaciones con personas allegadas.",
  "Escojo una dieta baja en grasas, grasas saturadas, y en colesterol.",
  "Informo a un doctor(a) o a otros profesionales de la salud cualquier señal inusual o síntoma extraño.",
  "Sigo un programa de ejercicios planificados.",
  "Duermo lo suficiente.",
  "Siento que estoy creciendo y cambiando en una forma positiva.",
  "Elogio fácilmente a otras personas por sus éxitos.",
  "Limito el uso de azúcares y alimentos que contienen azúcar (dulces).",
  "Leo o veo programas de televisión acerca del mejoramiento de la salud.",
  "Hago ejercicios vigorosos por 20 o más minutos, por lo menos tres veces a la semana (tales y como caminar rápidamente, andar en bicicleta, baile aeróbico, usar la maquina escaladora).",
  "Tomo algún tiempo para relajarme todos los días.",
  "Creo que mi vida tiene propósito.",
  "Mantengo relaciones significativas y enriquecedoras.",
  "Como de 6-11 porciones de pan, cereales, arroz, o pasta (fideos) todos los días.",
  "Hago preguntas a los profesionales de la salud para poder entender sus instrucciones.",
  "Tomo parte en actividades físicas livianas a moderadas (tales como caminar continuamente de 30 a 40 minutos, 5 o más veces a la semana.",
  "Acepto aquellas cosas en mi vida que yo no puedo cambiar.",
  "Miro adelante hacia el futuro.",
  "Paso tiempo con amigos íntimos.",
  "Como de 2 a 4 porciones de frutas todos los días.",
  "Busco una segunda opinión, cuando pongo en duda las recomendaciones de mi proveedor de servicios de salud.",
  "Tomo parte en actividades físicas de recreación (tales como nadar, bailar, andar en bicicleta).",
  "Me concentro en pensamientos agradables a la hora de acostarme.",
  "Me siento satisfecho y en paz conmigo mismo(a).",
  "Se me hace fácil demostrar preocupación, amor y cariño a otros.",
  "Como de 3 a 5 porciones de vegetales todos los días.",
  "Discuto mis cuestiónes de salud con profesionales de la salud.",
  "Hago ejercicios para estirar los músculos por lo menos 3 veces por semana.",
  "Uso métodos especificos para controlar mi tensión.",
  "Trabajo hacia metas de largo plazo en mi vida.",
  "Toco y soy tocado(a) por las personas que me importan.",
  "Como de 2 a 3 porciones de leche, yogurt, o queso cada día.",
  "Examino mi cuerpo por lo menos mensualmente, por cambios físicos o señales peligrosas.",
  "Hago ejercicios durante actividades físicas usuales diariamente (tales como caminar a la hora del almuerzo, utilizar escaleras en vez de elevadores, estacionar el carro lejos del lugar de destino y, caminar).",
  "Mantengo un balance del tiempo entre el trabajo y pasatiempos.",
  "Encuentro cada día interesante y retador (estimulante).",
  "Busco maneras de llenar mis necesidades de intimidad.",
  "Como solamente de 2 a 3 porciones de carne, aves, pescado, frijoles, huevos, y nueces todos los días.",
  "Pido información de los profesionales de la salud sobre como tomar buen cuidado de mi misma(o). ",
  "Examino mi pulso cuando estoy haciendo ejercicios.",
  "Practico relajación o o meditactión por 15-20 minutos diariamente.",
  "Estoy consciente de lo que es importante para mí en la vida.",
  "Busco apoyo de un grupo de personas que se preocupan por mí.",
  "Leo las etiquetas nutritivas para identificar el contenido de grasas y sodio en los alimentos empacados.",
  "Asisto a programas educacionales sobre el cuidado de salud personal.",
  "Alcanzo mi pulso cardíaco objectivo cuando hago ejercicios.",
  "Mantengo un balance para prevenir el cansancio.",
  "Me siento unido(a) con una fuerza mas grande que yo.",
  "Me pongo de acuerdo con otros por medio del diálogo y compromiso",
  "Como desayuno.",
  "Busco orientación o consejo cuando es necesario.",
  "Expongo mi persona a nuevas experiencias y retos.",
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
  2: "Algunas veces",
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
