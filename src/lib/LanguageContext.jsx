import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('s4_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('s4_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  const isAr = lang === 'ar';

  const t = (en, ar) => (isAr ? ar : en);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isAr, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
