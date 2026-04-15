import Image from "next/image"
import  Logo  from "../assets/images/logo.png"

export function UniVitaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-20 h-20" : size === "lg" ? "w-40 h-40" : "w-32 h-32"
  const eightSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
  const ringSize = size === "sm" ? "w-24 h-24" : size === "lg" ? "w-44 h-44" : "w-36 h-36"

  return (
    <div className={`relative flex items-center justify-center ${ringSize}`}>
      <Image src={Logo} alt="Logo" className={dims} />
    </div>
  )
}
