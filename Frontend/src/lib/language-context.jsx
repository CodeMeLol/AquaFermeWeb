import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || 'fr'
  )

  function setLang(value) {
    setLanguage(value)
    localStorage.setItem('language', value)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage doit être utilisé dans <LanguageProvider>')
  return ctx
}
