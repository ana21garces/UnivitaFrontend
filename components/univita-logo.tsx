import Image from "next/image"

// El PNG se sirve desde /public y NO se importa estáticamente: un import estático
// hace que Next genere el blur placeholder con sharp en tiempo de build, y el CPU
// de ubuntusrv (pre-x86-64-v2) no soporta sharp. Ver memoria del despliegue.
export function UniVitaLogo({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" }) {
  const dims = size === "xs" ? "w-8 h-8" : size === "sm" ? "w-20 h-20" : size === "lg" ? "w-40 h-40" : "w-32 h-32"
  const ringSize = size === "xs" ? "w-10 h-10" : size === "sm" ? "w-24 h-24" : size === "lg" ? "w-44 h-44" : "w-36 h-36"

  return (
    <div className={`relative flex items-center justify-center ${ringSize}`}>
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
        alt="Logo"
        width={500}
        height={500}
        priority
        className={dims}
      />
    </div>
  )
}
