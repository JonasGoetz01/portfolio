"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { content, DEFAULT_LANG, type Lang, type SiteContent } from "@/lib/content";

const STORAGE_KEY = "lang";
const CHANGE_EVENT = "languagechange:local";

/**
 * The chosen language lives in localStorage rather than in React state, so a
 * reload — and any other tab — keeps the visitor's choice.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readLang(): Lang {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "de" ? stored : DEFAULT_LANG;
}

// The server cannot know the preference, so it always renders the default and
// React swaps in the stored one right after hydration.
function serverLang(): Lang {
  return DEFAULT_LANG;
}

type LanguageValue = {
  lang: Lang;
  t: SiteContent;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, serverLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, readLang() === "de" ? "en" : "de");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo(() => ({ lang, t: content[lang], toggleLang }), [lang, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside a LanguageProvider");
  return value;
}
