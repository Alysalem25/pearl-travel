"use client";



import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { translations } from "@/data/translations";
import { Language, getDirection } from "@/lib/language";
import { getLanguageFromSearchParams } from "@/lib/language";

export default function  Hero() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

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

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const t = translations[lang].home;
  const isRTL = lang === "ar";
  const direction = getDirection(lang);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      dir={direction}
    >
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/19009052-uhd_3840_2160_24fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center text-white"
        >
          {/* Main Heading - Responsive Typography */}
          <motion.h1
            variants={itemVariants}
            className={`font-bold mb-6 sm:mb-8 leading-tight ${
              isRTL ? "font-arabic" : ""
            } ${
              // Responsive text sizes: small on mobile, big on desktop
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            }`}
            style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            {t.heading}
          </motion.h1>

          {/* Paragraph - Responsive Typography */}
          <motion.p
            variants={itemVariants}
            className={`mx-auto mb-8 sm:mb-12 leading-relaxed font-normal ${
              isRTL ? "font-arabic" : ""
            } ${
              // Responsive text sizes
              "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
            } ${
              // Responsive max-width for better readability
              "max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
            }`}
            style={{
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {t.paragraph}
          </motion.p>

          {/* Optional CTA Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 bg-[var(--mainColor)] hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg ${
                // Responsive button text
                "text-sm sm:text-base md:text-lg"
              }`}
            >
              {lang === "en" ? "Explore Now" : "استكشف الآن"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
}

