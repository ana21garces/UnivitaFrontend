export function UniVitaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-16 h-16" : "w-12 h-12"
  const eightSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
  const ringSize = size === "sm" ? "w-11 h-11" : size === "lg" ? "w-[4.5rem] h-[4.5rem]" : "w-14 h-14"

  return (
    <div className={`relative flex items-center justify-center ${ringSize}`}>
      {/* Outer subtle ring -- purple accent */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-20`}
        style={{ background: "linear-gradient(135deg, #6D28D9, transparent 60%)" }}
      />
      {/* Main green container */}
      <div
        className={`relative ${dims} rounded-2xl flex items-center justify-center shadow-sm`}
        style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
      >
        {/* Inner highlight for depth */}
        <div
          className="absolute inset-0 rounded-2xl opacity-25"
          style={{ background: "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.5), transparent 55%)" }}
        />
        {/* The "8" symbol */}
        <span
          className={`relative ${eightSize} font-extrabold text-[#FFFFFF] font-heading leading-none`}
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
        >
          8
        </span>
      </div>
    </div>
  )
}
