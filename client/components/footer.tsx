"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { translations, Language } from "@/data/translations";
import { getDirection, getLanguageFromSearchParams } from "@/lib/language";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, MessageCircle as WhatsApp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));

    const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => {
      setLang(e.detail.lang);
    };

    window.addEventListener("languagechange", handleLanguageChange as EventListener);
    return () =>
      window.removeEventListener("languagechange", handleLanguageChange as EventListener);
  }, [searchParams]);

  if (!mounted) return null;

  const isRTL = lang === "ar";
  const direction = getDirection(lang);
  const t = translations[lang];

  const handleContactClick = () => {
    window.open('https://wa.me/201067588333', '_blank');
  };

  const footerLinks: Array<{ label: string; href?: string; onClick?: () => void }> = lang === "en" ? [
    { label: "Home", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    {
      label: "About Us", onClick: () => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    { label: "Contact", onClick: handleContactClick },
  ] : [
    { label: "الرئيسية", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    {
      label: "عن الشركة", onClick: () => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    { label: "اتصل بنا", onClick: handleContactClick },
  ];

  return (
    <footer
      dir={direction}
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12  bottom-0 w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4 text-[var(--mainColor)]">
              Pearl Travel Group
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {lang === "en"
                ? "Your trusted travel partner since 1985. We bring you closer to the world's most beautiful destinations."
                : "شريكك الموثوق في السفر منذ عام 1985. نقربك من أجمل وجهات العالم."}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">
              {lang === "en" ? "Quick Links" : "روابط سريعة"}
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={link.onClick}
                      className="text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200 cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">
              {lang === "en" ? "Contact Info" : "معلومات التواصل"}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[var(--mainColor)]" />
                <span className="text-gray-300 text-sm">+201067588333 , 034855588</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[var(--mainColor)]" />
                <span className="text-gray-300 text-sm">pearltravel1@gmail.com</span>
              </div>
              <a
                href="https://maps.app.goo.gl/GNxH8HD3JioTAJB2A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:opacity-80 transition-opacity duration-200"
              >
                <MapPin size={18} className="text-[var(--mainColor)] mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm hover:text-[var(--mainColor)] transition-colors duration-200">Alexandria, Egypt</span>
              </a>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">
              {lang === "en" ? "Follow Us" : "تابعنا"}
            </h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/1DWP3cFfix/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-white" />
              </a>
              <a
                href="https://wa.me/201098076669"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-green-500 transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <Phone size={19} className="text-white"/>
              </a>
              <a
                href="https://www.instagram.com/pearltravel1?igsh=MTBsaXdtMGhtcGxseg=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-white" />
              </a>
              <a
                href="https://www.linkedin.com/company/pearl-travel-egypt/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-blue-700 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-white" />
              </a>
              <a
                href="https://x.com/travel_pearl"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-sky-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} className="text-white" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              Travel in style. {lang === "en" ? "All rights reserved." : "جميع الحقوق محفوظة."}
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => window.open("https://wa.me/201098076669", "_blank")}
                className="text-sm text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200"
              >
                {lang === "en" ? "Contact Us" : "اتصل بنا"}
              </button>
              <Link
                href={`/?lang=${lang}`}
                className="text-sm text-gray-300 hover:text-[var(--mainColor)] transition-colors duration-200"
              >
                {lang === "en" ? "Privacy Policy" : "سياسة الخصوصية"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
