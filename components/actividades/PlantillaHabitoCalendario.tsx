"use client"

import { useState } from "react"

// Extraído de app/dashboard/plan-semanal/page.tsx (HabitTracker) para
// reutilizarlo en cualquier ficha clasificada como "habito_calendario".
// Sigue siendo 100% local (no se persiste el detalle día a día en el
// backend, igual que ya funcionaba antes) — lo que sí se persiste es el
// check-in de "Lo hice hoy" de abajo, que alimenta la racha del seguimiento.

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
const NUM_HABITS = 12
const NUM_DAYS = 31

export function HabitTracker() {
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [habitNames, setHabitNames] = useState<string[]>(Array(NUM_HABITS).fill(""))
  const [checked, setChecked] = useState<boolean[][]>(
    Array.from({ length: NUM_DAYS }, () => Array(NUM_HABITS).fill(false))
  )

  const toggleCell = (day: number, habit: number) => {
    setChecked((prev) => {
      const next = prev.map((row) => [...row])
      next[day][habit] = !next[day][habit]
      return next
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[#1e293b]" style={{ background: "#0f172a" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Habit Tracker</h4>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-wrap">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setMonth(i)}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                  month === i ? "bg-white text-[#0f172a]" : "text-white/50 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-16 bg-white/10 text-white text-xs font-bold text-center rounded px-1 py-0.5 border border-white/20 focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-white text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="w-8 text-white/40 font-normal py-1 px-2 text-left sticky left-0 z-10" style={{ background: "#0f172a" }}>
                DÍA
              </th>
              {Array.from({ length: NUM_HABITS }, (_, i) => (
                <th key={i} className="w-8 text-center font-bold text-white/70 py-1 px-1">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: NUM_DAYS }, (_, day) => (
              <tr key={day} className="group">
                <td
                  className="text-white/40 font-mono text-[10px] py-0.5 px-2 text-left sticky left-0 z-10 group-hover:text-white/70 transition-colors"
                  style={{ background: "#0f172a" }}
                >
                  {String(day + 1).padStart(2, "0")}
                </td>
                {Array.from({ length: NUM_HABITS }, (_, habit) => (
                  <td key={habit} className="py-0.5 px-0.5 text-center">
                    <button
                      onClick={() => toggleCell(day, habit)}
                      className={`w-6 h-6 rounded transition-colors border ${
                        checked[day][habit]
                          ? "bg-green-400 border-green-400"
                          : "border-white/20 hover:border-white/50 bg-white/5"
                      }`}
                      aria-label={`Día ${day + 1}, hábito ${habit + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">HABIT / KEY</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {habitNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-white/50 text-[10px] font-bold w-4 shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const next = [...habitNames]
                  next[i] = e.target.value
                  setHabitNames(next)
                }}
                placeholder={`Hábito ${i + 1}`}
                className="flex-1 bg-transparent border-b border-white/20 text-white text-xs py-0.5 focus:outline-none focus:border-white/60 placeholder:text-white/20"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PlantillaHabitoCalendario({
  enviando,
  onEnviar,
}: {
  enviando: boolean
  onEnviar: (notas: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <HabitTracker />
      <button
        type="button"
        disabled={enviando}
        onClick={() => onEnviar(null)}
        className="self-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-60 transition-colors"
      >
        {enviando ? "..." : "✓ Lo hice hoy"}
      </button>
    </div>
  )
}
