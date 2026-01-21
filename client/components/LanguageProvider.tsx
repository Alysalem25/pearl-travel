"use client";

/**
 * Client-side language provider component
 * Handles language state and RTL/LTR direction
 * Reads language from URL params or localStorage on mount
 */

import { useEffect, useState } from "react";
import { Language, getDirection } from "@/lib/language";
import { getLanguageFromSearchParams } from "@/lib/language";

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get language from URL or localStorage on mount
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const currentLang = getLanguageFromSearchParams(urlParams);
      setLang(currentLang);

      // Update document attributes
      const direction = getDirection(currentLang);
      document.documentElement.dir = direction;
      document.documentElement.lang = currentLang;
    }
  }, []);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => {
      setLang(e.detail.lang);
      const direction = getDirection(e.detail.lang);
      document.documentElement.dir = direction;
      document.documentElement.lang = e.detail.lang;
    };

    window.addEventListener(
      "languagechange",
      handleLanguageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "languagechange",
        handleLanguageChange as EventListener
      );
    };
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    if (mounted) {
      const direction = getDirection(lang);
      document.documentElement.dir = direction;
      document.documentElement.lang = lang;
    }
  }, [lang, mounted]);

  return <>{children}</>;
}

