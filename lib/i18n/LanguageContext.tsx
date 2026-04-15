"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, LocaleString } from "./translations"

type LanguageContextType = {
  language: LocaleString
  t: typeof translations.it
}

const LanguageContext = createContext<LanguageContextType>({
  language: "it",
  t: translations.it,
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LocaleString>("it")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const browserLang = navigator.language.toLowerCase()
    // Default to 'it' if the browser lang starts with 'it'
    if (browserLang.startsWith("it")) {
      setLanguage("it")
    } else {
      // For any other language (e.g. 'en', 'fr', 'de'), fallback to 'en'
      setLanguage("en")
    }
  }, [])

  const contextValue = {
    language,
    t: translations[language]
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
