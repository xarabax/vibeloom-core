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
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={itIT}>
      <html lang="it" className="dark" suppressHydrationWarning>
        <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
          {children}
          <div className="fixed top-4 left-4 z-50 pointer-events-none opacity-80 hover:opacity-100 transition-opacity drop-shadow-lg">
            <img src="/ergo-sum-logo.png" alt="Ergo Sum" className="w-[123px] md:w-[155px] h-auto" />
          </div>
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
