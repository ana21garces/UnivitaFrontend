// Fuente única de facultades y sus programas. La usan la encuesta de
// onboarding y la pantalla que completa datos demográficos faltantes, así que
// la lista no puede vivir duplicada: si cambia una carrera, cambia aquí y ya.

export const FACULTADES = {
  "Ciencias de la Salud": [
    "Enfermería",
    "Tecnología en atención prehospitalaria",
  ],
  "Ingeniería": [
    "Ingeniería industrial",
    "Ingeniería de sistemas",
    "Especialización en Inteligencia de Negocios y Big Data",
  ],
  "Ciencias Administrativas y Contables": [
    "Administración de empresas",
    "Contaduría pública",
    "Marketing y comunicación digital",
    "Especialización en alta gerencia",
  ],
  "Ciencias Humanas y de la Educación": [
    "Licenciatura en español e inglés",
    "Licenciatura en educación infantil",
    "Licenciatura en música",
    "Especialización en docencia",
    "Maestría en educación",
  ],
  "Teología y Religión": [
    "Teología",
    "Licenciatura en educación religiosa",
    "Maestría en estudios religiosos y teología",
  ],
} as const

export type Facultad = keyof typeof FACULTADES

export const facultadOptions = Object.keys(FACULTADES).map((fac) => ({
  value: fac,
  label: fac,
}))

export function programaOptions(facultad: string) {
  return facultad && facultad in FACULTADES
    ? (FACULTADES[facultad as Facultad] as readonly string[]).map((prog) => ({
        value: prog,
        label: prog,
      }))
    : []
}

// Estilos del <Select> de react-select, iguales a los de la encuesta.
export const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: "10px",
    borderColor: state.isFocused ? "#16A34A" : "#E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 2px #DCFCE7" : "none",
    "&:hover": { borderColor: "#16A34A" },
    padding: "2px",
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? "#16A34A" : state.isFocused ? "#F0FDF4" : "white",
    color: state.isSelected ? "white" : "#1F2937",
    cursor: "pointer",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: "10px",
    overflow: "hidden",
  }),
}
