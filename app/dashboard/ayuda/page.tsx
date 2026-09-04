"use client"

import Link from "next/link"
import { ArrowLeft, ClipboardList, CalendarCheck, Flame, CheckCircle2, HelpCircle } from "lucide-react"
import { DashboardNavbar } from "@/components/dashboard-navbar"

const PREGUNTAS = [
  {
    p: "¿Tengo que hacer todas las recomendaciones todos los días?",
    r: "Sí, esa es la idea: están pensadas para practicarse a diario en cada una de tus dimensiones, y por eso el registro y la racha son diarios. Si algún día no alcanzas con todas, registra las que sí hiciste y retoma el resto al día siguiente.",
  },
  {
    p: "Registro todos los días, ¿por qué mi plan sigue en 0?",
    r: "Son dos cosas distintas. «Hoy» cuenta lo que registraste en el día y se reinicia cada mañana. «Plan» cuenta las recomendaciones que ya diste por terminadas, y eso solo avanza cuando tú marcas una como completada.",
  },
  {
    p: "¿Qué pasa si me salto un día?",
    r: "No pierdes nada de lo registrado: solo se reinicia la racha. Tus días acumulados y tu mejor racha quedan guardados.",
  },
  {
    p: "¿Cuándo marco una recomendación como completada?",
    r: "Cuando cumplas los días que piden sus instrucciones. Cada recomendación indica por cuánto tiempo practicarla, así que revisa esa parte de tu tarjeta; ahí mismo ves cuántos días llevas registrados. Al completarla ya no podrás registrar más días en ella.",
  },
  {
    p: "¿Las misiones de hoy son lo mismo que el plan?",
    r: "No. Las misiones son tareas cortas que cambian cada día y dan puntos. El plan son las recomendaciones de tus dimensiones más bajas, y esas se trabajan durante varios días.",
  },
]

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar role="user" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">
        <div>
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <h1 className="mt-3 text-2xl font-bold font-heading text-[#1F2937]">
            Cómo funciona tu plan
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Una guía corta para entender de dónde salen tus recomendaciones y cómo llevarles el
            seguimiento.
          </p>
        </div>

        <Seccion
          icono={<ClipboardList className="w-5 h-5 text-[#16A34A]" />}
          titulo="De dónde sale tu plan"
        >
          <p>
            Tu plan se arma con las respuestas de tu encuesta. Cada una de las seis dimensiones del
            bienestar recibe un puntaje, y las tres en las que saliste más bajo son las que la
            plataforma te propone trabajar primero: son las que aparecen en{" "}
            <strong>Dimensiones prioritarias</strong>.
          </p>
          <p>
            Dentro de cada dimensión vas a encontrar varias recomendaciones. Cada una responde a una
            pregunta puntual de la encuesta en la que tuviste un puntaje bajo, así que tu plan no es
            genérico: es el resultado de lo que respondiste.
          </p>
        </Seccion>

        <Seccion
          icono={<ClipboardList className="w-5 h-5 text-[#16A34A]" />}
          titulo="Qué trae cada recomendación"
        >
          <p>Al entrar a un plan, cada tarjeta tiene tres partes:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong>La técnica</strong>, que es el nombre de lo que vas a practicar.
            </li>
            <li>
              <strong>El objetivo</strong>, que explica para qué sirve.
            </li>
            <li>
              <strong>Las instrucciones</strong>, que son los pasos concretos a seguir.
            </li>
          </ul>
          <p>
            Además verás una etiqueta de nivel. <strong>Pobre</strong> señala lo más urgente y{" "}
            <strong>Moderado</strong> lo que ya haces a veces y conviene afianzar.
          </p>
        </Seccion>

        <Seccion
          icono={<CalendarCheck className="w-5 h-5 text-[#16A34A]" />}
          titulo="Por qué se registran día a día"
        >
          <p>
            Ninguna recomendación se resuelve en una sola vez: están pensadas para{" "}
            <strong>practicarse todos los días</strong>, hasta que se vuelvan costumbre. Por eso vas
            a ver instrucciones del tipo «durante siete días seguidos» o «cada vez que comas», y por
            eso el seguimiento es diario.
          </p>
          <p>
            Cada día que la practiques, entra a la recomendación y regístralo. Lo que te pide el
            formulario cambia según la actividad: a veces basta con confirmar que la hiciste, otras
            veces anotas un número (los minutos que caminaste, los vasos de agua) o escribes una
            frase corta.
          </p>
          <p>
            Solo se puede registrar <strong>una vez por día</strong>. Si ya lo hiciste, la tarjeta te
            avisa que esa recomendación ya quedó registrada hoy.
          </p>
        </Seccion>

        <Seccion icono={<Flame className="w-5 h-5 text-[#16A34A]" />} titulo="La racha">
          <p>
            La racha son los <strong>días seguidos</strong> que llevas registrando una recomendación.
            Si dejas pasar un día vuelve a empezar en uno, pero no pierdes nada más: el total de días
            registrados y tu mejor racha quedan guardados.
          </p>
          <p>
            En cada tarjeta puedes abrir <strong>Ver historial</strong> para revisar en qué fechas la
            registraste.
          </p>
        </Seccion>

        <Seccion
          icono={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
          titulo="«Hoy» y «plan» no son lo mismo"
        >
          <p>
            Son las dos medidas que verás en tu panel y en el asistente, y conviene no confundirlas:
          </p>
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <p className="text-sm font-semibold text-[#1F2937]">Hoy</p>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Cuántas recomendaciones registraste en el día. Se reinicia cada mañana.
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-[#1F2937]">Plan</p>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Cuántas recomendaciones diste por terminadas. Avanza solo cuando marcas una como
                completada.
              </p>
            </div>
          </div>
          <p>
            Por eso puedes tener «2 de 2 hoy» y a la vez «0 de 2» en el plan: registraste todo lo del
            día, pero todavía no cerraste ninguna recomendación.
          </p>
        </Seccion>

        <Seccion
          icono={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
          titulo="Cuándo darla por completada"
        >
          <p>
            Cada recomendación te dice en sus <strong>instrucciones</strong> por cuántos días
            practicarla. Cuando cumplas ese tiempo, usa el botón{" "}
            <strong>Marcar como completada</strong>.
          </p>
          <p>
            Para saber cuántos llevas, mira el contador de días registrados de la tarjeta o abre{" "}
            <strong>Ver historial</strong>, donde aparecen las fechas exactas.
          </p>
          <p>
            Al completarla ganas puntos, deja de pedirte registro diario y el profesional de esa
            dimensión se entera de tu avance. Ten en cuenta que después ya no podrás registrar más
            días en ella.
          </p>
        </Seccion>

        <Seccion icono={<HelpCircle className="w-5 h-5 text-[#16A34A]" />} titulo="Preguntas frecuentes">
          <div className="flex flex-col gap-4">
            {PREGUNTAS.map((item) => (
              <div key={item.p}>
                <p className="text-sm font-semibold text-[#1F2937]">{item.p}</p>
                <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{item.r}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <div className="flex justify-center pt-2 pb-4">
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>
      </main>
    </div>
  )
}

function Seccion({
  icono,
  titulo,
  children,
}: {
  icono: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
          {icono}
        </div>
        <h2 className="text-base font-bold font-heading text-[#1F2937]">{titulo}</h2>
      </div>
      <div className="flex flex-col gap-3 text-sm text-[#6B7280] leading-relaxed">{children}</div>
    </section>
  )
}
