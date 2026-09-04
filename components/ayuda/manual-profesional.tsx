import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarCheck,
  FileText,
  HelpCircle,
  ListChecks,
} from "lucide-react"
import { Preguntas, Seccion } from "@/components/ayuda/seccion"
import { NIVELES } from "@/lib/niveles"

const ESCALA = [
  { valor: 1, texto: "Nunca" },
  { valor: 2, texto: "Algunas veces" },
  { valor: 3, texto: "Frecuentemente" },
  { valor: 4, texto: "Rutinariamente" },
]

const PREGUNTAS = [
  {
    p: "¿Por qué no aparece una persona que sé que está en la plataforma?",
    r: "En tu panel solo aparecen quienes ya enviaron la encuesta. Si no la ha presentado, no hay resultados que mostrar. El administrador puede difundirle un recordatorio.",
  },
  {
    p: "Me llegó «requiere atención» pero en la fila veo nivel Bueno, ¿cuál me creo?",
    r: "La fila. La alerta se guardó con el resultado del momento en que envió la encuesta; si después la volvió a presentar en una medición nueva, el panel muestra siempre el último resultado.",
  },
  {
    p: "La etiqueta de la fila y la alerta de retroceso no comparan lo mismo, ¿por qué?",
    r: "Porque miran cosas distintas a propósito. La etiqueta «antes X%» compara con la medición inmediatamente anterior, para ver el movimiento reciente. La alerta de retroceso compara con su primera encuesta, la línea base, para ver si perdió lo ganado desde el inicio.",
  },
  {
    p: "¿Puedo ver la racha o los días que lleva registrados una persona?",
    r: "No. Ese detalle es solo del estudiante. A ti te llega el aviso cuando da una recomendación por completada, que es el resumen de ese proceso.",
  },
  {
    p: "Si completó una recomendación, ¿ya mejoró?",
    r: "No necesariamente. Ese aviso dice que practicó la técnica los días que pedía y la cerró; es una señal de constancia, no una medición. La mejora se ve cuando vuelva a presentar la encuesta en la siguiente medición.",
  },
  {
    p: "¿Por qué veo docentes y administrativos, y no solo estudiantes?",
    r: "La plataforma es para toda la comunidad. Si quieres trabajar con un grupo puntual, usa el filtro de tipo de usuario.",
  },
  {
    p: "¿Puedo cambiar las recomendaciones que le salen a una persona?",
    r: "No desde la plataforma. Las fichas están definidas por dimensión, pregunta y nivel; lo que cambia según cada persona es cuáles le tocan.",
  },
]

export function ManualProfesional({
  dimension,
  panel,
  esAdmin = false,
}: {
  dimension: string | null
  panel: string
  esAdmin?: boolean
}) {
  const suDimension = dimension ?? "la dimensión de la vista que estés viendo"

  return (
    <>
      <div>
        <Link
          href={panel}
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <h1 className="mt-3 text-2xl font-bold font-heading text-[#1F2937]">
          Cómo leer tu panel
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Qué significa cada dato de {suDimension}, qué avisos te llegan y cuándo conviene citar a
          una persona.
        </p>
        {esAdmin && (
          <p className="mt-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#6B7280]">
            Esta es la guía de las vistas por dimensión, las mismas que ves desde{" "}
            <strong>Áreas de bienestar</strong>.
          </p>
        )}
      </div>

      <Seccion icono={<BarChart3 className="w-5 h-5 text-[#16A34A]" />} titulo="Qué ves en tu panel">
        <p>
          Tu panel muestra únicamente {suDimension}, con todas las personas que ya respondieron la
          encuesta. Arriba tienes el panorama y abajo el detalle:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            <strong>Población general</strong>: el promedio de la dimensión en toda la universidad,
            con cuántas personas lo componen y cómo se reparten entre los cuatro niveles.
          </li>
          <li>
            <strong>Facultades que más necesitan atención</strong>: las mismas facultades ordenadas
            de menor a mayor promedio, así que las primeras son las que están peor.
          </li>
          <li>
            <strong>El listado</strong>: agrupado por facultad y dentro de cada una por carrera.
            Cada persona trae su porcentaje y su nivel.
          </li>
        </ul>
        <p>
          Los filtros de facultad, carrera y tipo de usuario recortan todo lo anterior, incluidos
          los promedios de arriba.
        </p>
      </Seccion>

      <Seccion icono={<ListChecks className="w-5 h-5 text-[#16A34A]" />} titulo="Cómo leer los puntajes">
        <p>
          El porcentaje de una persona es el promedio de sus respuestas en esta dimensión, llevado a
          una escala de 0 a 100. Los cortes son estos:
        </p>
        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          {NIVELES.map((n, i) => (
            <div
              key={n.nivel}
              className={`flex items-center justify-between px-4 py-2.5 ${
                i < NIVELES.length - 1 ? "border-b border-[#E2E8F0]" : ""
              }`}
            >
              <span className="text-sm font-semibold text-[#1F2937]">{n.nivel}</span>
              <span className="text-sm text-[#6B7280]">{n.rango}%</span>
            </div>
          ))}
        </div>
        <p>
          Al abrir la fila de una persona aparecen las preguntas de la encuesta que componen esa
          cifra, cada una con la respuesta que dio, del 1 al 4:
        </p>
        <div className="flex flex-wrap gap-2">
          {ESCALA.map((op) => (
            <span
              key={op.valor}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#475569]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F1F5F9] text-[10px] font-bold">
                {op.valor}
              </span>
              {op.texto}
            </span>
          ))}
        </div>
        <p>
          Ese detalle es lo más útil para preparar una cita: dos personas con el mismo porcentaje
          pueden tener problemas distintos, y ahí se ve en qué pregunta puntual está el bajón.
        </p>
        <p>
          Si la persona ya presentó la encuesta más de una vez, junto a la fecha verás una etiqueta
          del tipo <strong>«antes 55%»</strong> con una flecha: compara su resultado actual con el de
          la <strong>medición anterior</strong>.
        </p>
      </Seccion>

      <Seccion icono={<Bell className="w-5 h-5 text-[#16A34A]" />} titulo="Los avisos de la campanita">
        <p>Te llegan tres tipos de aviso, y cada uno se dispara por algo distinto:</p>
        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <p className="text-sm font-semibold text-[#1F2937]">🔴 Requiere atención</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Alguien acabó de enviar la encuesta y quedó en nivel <strong>Pobre</strong> o{" "}
              <strong>Moderado</strong> en tu dimensión.
            </p>
          </div>
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <p className="text-sm font-semibold text-[#1F2937]">🔻 Retrocedió</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Volvió a presentar la encuesta y bajó de nivel respecto a{" "}
              <strong>su primera medición</strong>. Es el aviso más importante: perdió terreno frente
              a su punto de partida.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-[#1F2937]">Avanzó</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Completó una recomendación de su plan. Es el aviso que se explica en la sección
              siguiente.
            </p>
          </div>
        </div>
        <p>
          Los dos primeros traen enlace: al abrirlos, el panel se posiciona en esa persona y despliega
          su detalle.
        </p>
      </Seccion>

      <Seccion
        icono={<CalendarCheck className="w-5 h-5 text-[#16A34A]" />}
        titulo="Qué significa «completó el seguimiento»"
      >
        <p>
          Este es el aviso que más confunde, porque detrás hay un proceso de varios días. El aviso se
          ve así:
        </p>
        <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
          Ana Pérez avanzó: completó el seguimiento de la recomendación «Caminata progresiva»
          (pregunta 4: realizo ejercicio vigoroso al menos tres veces por semana) en {suDimension},
          nivel Pobre, por este momento.
        </p>
        <p>
          Cada pregunta en la que la persona salió baja le genera una recomendación en su plan. Esa
          recomendación <strong>se practica todos los días</strong>: ella entra, registra el día y
          acumula racha. Cuando cumple los días que piden las instrucciones, la marca como completada
          y ahí se te avisa.
        </p>
        <p>
          Por eso el aviso nombra <strong>la técnica</strong> y{" "}
          <strong>el número de la pregunta</strong>: esa es la pregunta de la encuesta que originó la
          recomendación, la misma que puedes ubicar al abrir su fila. El nivel que menciona es el que
          tenía cuando se generó el plan.
        </p>
        <p>
          Dos cosas para tener claras: es <strong>autoinforme</strong> —lo registró la persona, no es
          evidencia clínica— y es una señal de <strong>constancia</strong>, no de mejora. La mejora
          aparece cuando vuelva a presentar la encuesta.
        </p>
      </Seccion>

      <Seccion icono={<Bell className="w-5 h-5 text-[#16A34A]" />} titulo="Invitar a una cita">
        <p>
          El botón de invitar aparece solo en las personas que lo necesitan: nivel{" "}
          <strong>Pobre</strong>, nivel <strong>Moderado</strong>, o que hayan bajado respecto a su
          medición anterior. Las de nivel Pobre además llevan la etiqueta{" "}
          <strong>Atención inmediata</strong>.
        </p>
        <p>
          Al invitar se le manda una notificación con un mensaje sugerido que puedes editar antes de
          enviarlo. Después la fila te muestra en qué va:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            <strong>Notificado</strong>: la invitación está enviada y todavía no responde.
          </li>
          <li>
            <strong>Aceptó la cita</strong>: al aceptar se abre el reporte de esa persona, para que
            llegues a la cita con el detalle a mano.
          </li>
          <li>
            <strong>Rechazó la cita</strong>: el botón cambia a <strong>Volver a invitar</strong>, así
            que puedes insistir más adelante.
          </li>
        </ul>
      </Seccion>

      <Seccion icono={<FileText className="w-5 h-5 text-[#16A34A]" />} titulo="El reporte individual">
        <p>
          En cada persona tienes <strong>Ver reporte</strong>. A diferencia del panel, que solo
          muestra tu dimensión, el reporte trae el cuadro completo: sus datos, su resultado global,
          cómo quedó en <strong>las seis dimensiones</strong> y el detalle pregunta por pregunta de la
          tuya.
        </p>
        <p>
          Se puede imprimir o guardar en PDF, que es lo que sirve como soporte de una remisión o para
          dejar constancia de la atención.
        </p>
      </Seccion>

      <Seccion icono={<HelpCircle className="w-5 h-5 text-[#16A34A]" />} titulo="Preguntas frecuentes">
        <Preguntas items={PREGUNTAS} />
      </Seccion>

      <div className="flex justify-center pt-2 pb-4">
        <Link
          href={panel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>
      </div>
    </>
  )
}
