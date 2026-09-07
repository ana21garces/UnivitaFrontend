import type { Metadata } from "next"
import { LandingPage } from "@/components/landing-page"
import { TRANSPARENCY } from "@/lib/content/transparency"

export const metadata: Metadata = {
  title: `${TRANSPARENCY.appName} — Guía de bienestar universitario`,
  description: TRANSPARENCY.tagline,
}

export default function HomePage() {
  return <LandingPage />
}
