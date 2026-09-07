import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  // `template` hace que cada página que ponga su propio título salga como
  // «Mi perfil · UnacHealth»; las que no lo pongan usan `default`.
  title: {
    default: 'UnacHealth',
    template: '%s · UnacHealth',
  },
  description: 'Pequeños hábitos, grandes cambios.',
  // El icono de la pestaña lo toma Next de app/icon.png (aplica el basePath
  // solo; antes /logo.png se servía mal bajo /~ana.garces/univita).
}

export const viewport: Viewport = {
  themeColor: '#16A34A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
