import Link from "next/link"
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  FileText,
  HelpCircle,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Preguntas, Seccion } from "@/components/ayuda/seccion"

const PREGUNTAS = [
  {
    p: "¿Puedo borrar una medición si me equivoqué al programarla?",
    r: "Sí, mientras nadie haya respondido en ella. En cuanto tiene una sola respuesta deja de ser borrable, porque esas respuestas son datos de la investigación. La línea base no se puede borrar nunca.",
  },
  {
    p: "Cerré una medición antes de tiempo, ¿perdí las respuestas?",
    r: "No. Cerrar solo deja de aceptar respuestas nuevas; lo ya respondido queda intacto. Y si la cerraste por error, puedes reabrirla con una fecha nueva.",
  },
  {
    p: "¿A un profesional le llegan los avisos de todas las dimensiones?",
    r: "No, solo de la suya. Y si hay varias personas con el mismo rol de área, el aviso les llega a todas: los roles de área no son exclusivos de una persona.",
  },
  {
    p: "¿La auditoría me sirve para saber quién modificó un dato?",
    r: "No. Registra accesos —quién entró, desde qué IP, cuánto duró la sesión—, no cambios sobre los datos. Para saber qué pasó con los resultados de una persona, el camino es su reporte individual.",
  },
  {
    p: "¿Por qué en «Gestión de usuarios» mi propia fila no tiene botones?",
    r: "Para que no puedas quitarte el acceso por error. Tampoco se puede suspender al último administrador ni eliminar a otro administrador sin antes cambiarle el rol.",
  },
  {
    p: "¿Qué formato conviene para el análisis de la tesis?",
    r: "El CSV: son los datos crudos, listos para abrirlos en un programa estadístico. El Excel sirve para revisar a mano y el PDF para imprimir o anexar.",
  },
]

export default function AyudaAdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#1F2937]">Manual del administrador</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Qué hace cada acción del panel y a quién afecta. Está pensado para quien reciba la
          plataforma sin haberla configurado.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Seccion
          icono={<CalendarClock className="w-5 h-5 text-[#16A34A]" />}
          titulo="Mediciones: lo más delicado del panel"
        >
          <p>
            En <strong>Configuración</strong> defines cuándo se aplica la encuesta. Hay dos clases de
            medición y no se comportan igual:
          </p>
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#1F2937]">Línea base</p>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Está siempre abierta y no se cierra ni se borra. Ahí cae la{" "}
                <strong>primera</strong> encuesta de cada persona, incluida la de quien se registre
                dentro de un año.
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-[#1F2937]">Seguimiento</p>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Es una ventana con fechas y solo aplica a quien ya tiene una encuesta anterior. Eso
                es lo que vuelve comparables los resultados.
              </p>
            </div>
          </div>
          <p>
            El estado —<strong>programado</strong>, <strong>abierto</strong>,{" "}
            <strong>cerrado</strong>— no se guarda: se deduce de las fechas. Por eso mover la fecha de
            cierre es lo que extiende, cierra o reabre una medición, y no hay ningún proceso
            automático que la cierre por su cuenta.
          </p>
          <p className="flex gap-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Abrir una medición cambia lo que ven todos: habilita a la gente a responder otra vez y,
              cuando lo hacen, los seis profesionales empiezan a ver comparativos y a recibir avisos
              de retroceso. No es un cambio de configuración interno.
            </span>
          </p>
          <p>
            Solo la medición <strong>más reciente</strong> se puede editar o reabrir. Y{" "}
            <strong>eliminar</strong> está limitado a propósito: únicamente mediciones{" "}
            <strong>sin respuestas</strong>, para deshacer una programada por error. Nunca vas a
            borrar datos de la investigación desde ahí.
          </p>
        </Seccion>

        <Seccion icono={<Users className="w-5 h-5 text-[#16A34A]" />} titulo="Gestión de usuarios">
          <p>En cada fila tienes cuatro acciones, y algunas están bloqueadas por diseño:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong>Ver detalles</strong>, para revisar sus datos completos.
            </li>
            <li>
              <strong>Cambiar rol</strong>. Es lo que le da acceso a la vista de una dimensión. Ojo:{" "}
              <strong>puede haber varias personas con el mismo rol de área</strong>, y los avisos de
              esa dimensión les llegan a todas.
            </li>
            <li>
              <strong>Suspender</strong>, que le quita el acceso pero conserva sus respuestas.
            </li>
            <li>
              <strong>Eliminar</strong>, que sí borra la cuenta.
            </li>
          </ul>
          <p>
            Tu propia fila solo muestra <strong>Acceso total</strong>: no puedes cambiarte el rol ni
            suspenderte, para que no te quedes por fuera. Tampoco se puede suspender al{" "}
            <strong>último administrador</strong>, ni eliminar a otro administrador sin antes
            cambiarle el rol.
          </p>
          <p>
            Si alguien se va de la universidad, <strong>suspender</strong> suele ser mejor que
            eliminar: la persona pierde el acceso y sus respuestas siguen contando en los promedios y
            en los reportes.
          </p>
        </Seccion>

        <Seccion icono={<Bell className="w-5 h-5 text-[#16A34A]" />} titulo="Notificaciones">
          <p>
            Desde aquí mandas un anuncio a un grupo. Puedes segmentar por{" "}
            <strong>facultad</strong>, <strong>programa</strong>, <strong>tipo de usuario</strong> o{" "}
            <strong>nivel</strong>, o enviarlo a todos.
          </p>
          <p>
            Cuando hay una medición abierta aparece además el segmento de{" "}
            <strong>quienes no la han respondido</strong>, que es el recordatorio más útil: le llega
            solo a quien falta, no a toda la comunidad.
          </p>
          <p className="flex gap-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              El envío no tiene deshacer. Antes de enviar, revisa el segmento y cuántas personas
              quedan incluidas.
            </span>
          </p>
          <p>
            En <strong>Enviados</strong> queda el historial de lo que ya difundiste, para no repetir
            un recordatorio a los pocos días.
          </p>
        </Seccion>

        <Seccion icono={<FileText className="w-5 h-5 text-[#16A34A]" />} titulo="Reportes y estadísticas">
          <p>
            <strong>Reportes</strong> tiene seis descargas: usuarios de la plataforma, participación
            en las encuestas, progresión de niveles, distribución por niveles, recomendaciones del
            plan y misiones de hábitos. Cada una sale en tres formatos, y la elección importa:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong>CSV</strong> son los datos crudos, para análisis estadístico.
            </li>
            <li>
              <strong>Excel</strong> viene con formato, para revisar a mano.
            </li>
            <li>
              <strong>PDF</strong> para imprimir o anexar.
            </li>
          </ul>
          <p>
            <strong>Seguimiento / Estadísticas</strong> es la vista para comparar mediciones: el
            cambio por dimensión y el índice global por facultad. Ahí es donde se ve si la
            intervención movió algo, y solo tiene sentido cuando ya hay una segunda medición
            respondida.
          </p>
          <p>
            <strong>Perfiles de salud</strong> y <strong>Áreas de bienestar</strong> son de consulta:
            las mismas vistas que usan los profesionales. Cómo se leen está en{" "}
            <Link href="/dashboard/ayuda" className="font-medium text-[#16A34A] hover:underline">
              la guía de las vistas por dimensión
            </Link>
            .
          </p>
        </Seccion>

        <Seccion icono={<ShieldCheck className="w-5 h-5 text-[#16A34A]" />} titulo="Auditoría">
          <p>
            Es la bitácora de <strong>accesos</strong>: quién entró y salió, desde qué IP y cuánto
            duró la sesión, con los totales del día arriba y la posibilidad de exportar a Excel.
          </p>
          <p>
            Conviene saber lo que <strong>no</strong> es: no registra cambios sobre los datos, así que
            no sirve para reconstruir quién modificó un resultado. Sirve para responder si una cuenta
            se está usando y cuánta actividad real hay en la plataforma.
          </p>
        </Seccion>

        <Seccion icono={<HelpCircle className="w-5 h-5 text-[#16A34A]" />} titulo="Preguntas frecuentes">
          <Preguntas items={PREGUNTAS} />
        </Seccion>
      </div>
    </main>
  )
}
