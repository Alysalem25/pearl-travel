/**
 * Language utility functions
 * Handles language detection from URL params and localStorage
 */

import { Language } from "@/data/translations";

/**
 * Get language from URL search params
 * Falls back to localStorage, then defaults to 'en'
 */
export function getLanguageFromSearchParams(
  searchParams: URLSearchParams | null
): Language {
  if (typeof window === "undefined") return "en"; // Server-side default

  // First check URL params
  const urlLang = searchParams?.get("lang");
  if (urlLang === "en" || urlLang === "ar") {
    return urlLang;
  }

  // Then check localStorage
  if (typeof window !== "undefined") {
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "en" || storedLang === "ar") {
      return storedLang;
    }
  }

  return "en"; // Default fallback
}

/**
 * Get direction (LTR/RTL) based on language
 */
export function getDirection(lang: Language): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

/**
 * Update language in URL and localStorage
 */
export function updateLanguage(lang: Language) {
  if (typeof window === "undefined") return;

  // Update localStorage
  localStorage.setItem("lang", lang);

  // Update URL without page reload
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.pushState({}, "", url.toString());

  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

