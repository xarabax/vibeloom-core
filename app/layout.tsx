import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { ClerkProvider } from '@clerk/nextjs'
import { itIT } from '@clerk/localizations'
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "VibeLoom — Decision & Adoption Engine",
  description: "Trasforma l'incertezza sull'integrazione AI in decisioni aziendali difendibili.",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
  }
}

import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={itIT}>
      <html lang="it" className="dark" suppressHydrationWarning>
        <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
          <LanguageProvider>
            {children}
            <a href="https://ergo-sum.tv" target="_blank" className="fixed top-4 left-6 z-50 opacity-80 hover:opacity-100 transition-opacity drop-shadow-lg flex items-center gap-2">
              <img src="/ergo-sum-logo.png" alt="Ergo Sum" className="w-[105px] md:w-[125px] h-auto mix-blend-screen" />
            </a>
            <Analytics />
            <Toaster />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
