"use client";

/**
 * Responsive Navbar component with language switcher and authentication
 * Supports RTL/LTR layout based on selected language
 * 
 * Security: Logout clears all auth data and redirects to home
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X, Globe, BarChart3 } from "lucide-react";
import { translations } from "@/data/translations";
import { Language, getDirection } from "@/lib/language";
import { getLanguageFromSearchParams, updateLanguage } from "@/lib/language";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [destinationsDropdown, setDestinationsDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Initialize language from URL or localStorage
  useEffect(() => {
    setMounted(true);
    const currentLang = getLanguageFromSearchParams(searchParams);
    setLang(currentLang);

    // Listen for language changes
    const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => {
      setLang(e.detail.lang);
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
  }, [searchParams]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-dropdown="destinations"]') &&
        !target.closest('[data-dropdown="language"]')
      ) {
        setDestinationsDropdown(false);
        setLangDropdown(false);
      }
    };

    if (destinationsDropdown || langDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [destinationsDropdown, langDropdown]);

  const changeLang = (newLang: Language) => {
    updateLanguage(newLang);
    setLang(newLang);
    setLangDropdown(false);
    setDestinationsDropdown(false);
    setOpen(false);
    // Refresh the page to apply language changes
    router.refresh();
  };

  const t = translations[lang];
  const isRTL = lang === "ar";
  const direction = getDirection(lang);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-transparent backdrop-blur-xl shadow-md z-50 ${
        isRTL ? "font-arabic" : ""
      }`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/?lang=${lang}`}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <img
              src="/Logo.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />

          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href={`/?lang=${lang}`}
              className="text-gray-700 dark:text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 font-medium"
            >
              {t.navbar.home}
            </Link>
            <Link
              href={`/visa?lang=${lang}`}
              className="text-gray-700 dark:text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 font-medium"
            >
              {t.navbar.visa}
            </Link>
            <Link
              href={`/cars?lang=${lang}`}
              className="text-gray-700 dark:text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 font-medium"
            >
              {t.navbar.cars}
            </Link>

            {/* Dropdown */}
            <div className="relative" data-dropdown="destinations">
              <button
                onClick={() => setDestinationsDropdown(!destinationsDropdown)}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 font-medium"
              >
                {t.navbar.destinations}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    destinationsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {destinationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute ${
                      isRTL ? "left-0" : "right-0"
                    } top-full mt-2 bg-white dark:bg-gray-800 backdrop-blur-xl shadow-lg rounded-lg w-40 overflow-hidden`}
                  >
                    <Link
                      href={`/Egypt?lang=${lang}`}
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      onClick={() => setDestinationsDropdown(false)}
                    >
                      {t.navbar.egypt}
                    </Link>
                    <Link
                      href={`/Albania?lang=${lang}`}
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      onClick={() => setDestinationsDropdown(false)}
                    >
                      {t.navbar.albania}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={`/Flight?lang=${lang}`}
              className="text-gray-700 dark:text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 font-medium"
            >
              {t.navbar.flight}
            </Link>

            {/* Language Switcher */}
            <div className="relative ml-4" data-dropdown="language">
              <button
                onClick={() => changeLang(lang === "en" ? "ar" : "en")}
                className="flex items-center gap-2 px-4 py-2 dark:bg-[var(--mainColor)] text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-md"
              >
                <Globe size={18} />
                <span>{lang === "en" ? "AR" : "EN"}</span>
              </button>
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === "admin" ? "Admin" : "User"}
                  </p>
                </div>
                
                {isAdmin() && (
                  <Link
                    href={`/Admindashbord?lang=${lang}`}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                  >
                    <BarChart3 size={16} />
                    Dashboard
                  </Link>
                )}

              </div>
            ) : (
              <Link
                href={`/login?lang=${lang}`}
                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg rounded-lg mt-2 mb-4 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <Link
                  href={`/?lang=${lang}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {t.navbar.home}
                </Link>
                <Link
                  href={`/about?lang=${lang}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {t.navbar.about}
                </Link>

                {/* Mobile Dropdown */}
                <details className="group">
                  <summary className="cursor-pointer py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium list-none">
                    <div className="flex items-center justify-between">
                      <span>{t.navbar.destinations}</span>
                      <ChevronDown
                        size={16}
                        className="transition-transform duration-200 group-open:rotate-180"
                      />
                    </div>
                  </summary>
                  <div className="pl-4 mt-2 space-y-2 rtl:pl-0 rtl:pr-4">
                    <Link
                      href={`/egypt?lang=${lang}`}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {t.navbar.egypt}
                    </Link>
                    <Link
                      href={`/albania?lang=${lang}`}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {t.navbar.albania}
                    </Link>
                  </div>
                </details>

                <Link
                  href={`/contact?lang=${lang}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {t.navbar.contact}
                </Link>

                {/* Mobile Language Switcher */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={18} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {lang === "en" ? "Language" : "اللغة"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeLang("en")}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                        lang === "en"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLang("ar")}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                        lang === "ar"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>

                {/* Mobile Auth Section */}
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.role === "admin" ? "Admin" : "User"}
                      </p>
                    </div>
                    
                    {isAdmin() && (
                      <Link
                        href={`/Admindashbord?lang=${lang}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        <BarChart3 size={16} />
                        Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/login?lang=${lang}`}
                    onClick={() => setOpen(false)}
                    className="block w-full text-center py-2 px-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
