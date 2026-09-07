// AI assisted development
import Link from "next/link"
import { AlertTriangle, Info } from "lucide-react"
import { TRANSPARENCY } from "@/lib/content/transparency"

type DisclaimerBannerProps = {
  className?: string
  /** Muestra enlace a la página de metodología (TR-002) */
  showMetodologiaLink?: boolean
  compact?: boolean
}

export function DisclaimerBanner({
  className = "",
  showMetodologiaLink = true,
  compact = false,
}: DisclaimerBannerProps) {
  const { title, text, metodologiaLinkLabel } = TRANSPARENCY.disclaimer
  const { metodologiaLink } = TRANSPARENCY.comoSeConstruyen

  return (
    <aside
      role="note"
      aria-label={title}
      className={`rounded-xl border border-amber-200 bg-amber-50 ${compact ? "px-4 py-3" : "px-5 py-4"} ${className}`}
    >
      <div className="flex gap-3">
        <AlertTriangle
          className={`${compact ? "h-4 w-4" : "h-5 w-5"} mt-0.5 shrink-0 text-amber-600`}
          aria-hidden="true"
        />
        <div>
          <h2 className={`${compact ? "text-xs" : "text-sm"} font-semibold text-amber-900`}>
            {title}
          </h2>
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} leading-relaxed text-amber-800`}>
            {text}
          </p>
          {showMetodologiaLink && (
            <p className="mt-2">
              <Link
                href={metodologiaLink}
                className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "text-sm"} font-semibold text-amber-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded`}
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                {metodologiaLinkLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
