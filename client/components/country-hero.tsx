// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import { translations } from "@/data/translations";
// import { Language, getDirection } from "@/lib/language";
// import { getLanguageFromSearchParams } from "@/lib/language";
// import { useParams } from "next/navigation";
// export default function  Hero() {
//   const params = useParams();
//   const [lang, setLang] = useState<Language>("en");
//   const [mounted, setMounted] = useState(false);
//   const [urlVideo, setUrlVideo] = useState<string>("/egypt-bg-video.mp4");
//   const searchParams = useSearchParams();
//   // alert(params.id)
//   useEffect(() => {
//     setMounted(true);
//     const currentLang = getLanguageFromSearchParams(searchParams);
//     setLang(currentLang);

//     // Listen for language changes
//     const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => {
//       setLang(e.detail.lang);
//     };

//     window.addEventListener(
//       "languagechange",
//       handleLanguageChange as EventListener
//     );

//     return () => {
//       window.removeEventListener(
//         "languagechange",
//         handleLanguageChange as EventListener
//       );
//     };
//   }, [searchParams]);

//   if (!mounted) {
//     return null; // Prevent hydration mismatch
//   }

//   useEffect(()=>{
//     if (params.id =="Egypt") {
//       setUrlVideo("/egypt-bg-video.mp4")
//     }else if (params.id =="Albania") {
//       setUrlVideo("/albania-bg-video.mp4")
//     }
//   }, [params.id])

//   // const t = translations[lang].home;
//   const data = {
//     en: {
//       Egypt: "Egypt",
//       Albania: "Albania",
//     },
//     ar: {
//       Egypt: "مصر",
//       Albania: "ألبانيا",
//     }
//   }
//   const isRTL = lang === "ar";
//   const direction = getDirection(lang);

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.3,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut",
//       },
//     },
//   };

//   return (
//     <section
//       className="relative min-h-screen flex items-center justify-center overflow-hidden"
//       dir={direction}
//     >
//       {/* Full-screen Video Background */}
//       <div className="absolute inset-0 w-full h-full -z-10">
//         <video
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="absolute top-0 left-0 w-full h-full object-cover"
//         >
//           <source src={urlVideo} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//         {/* Dark overlay for better text readability */}
//         <div className="absolute inset-0 bg-black/50"></div>
//       </div>

//       {/* Content Container */}
//       <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="text-center text-white"
//         >
//           {/* Main Heading - Responsive Typography */}
//           <motion.h1
//             variants={itemVariants}
//             className={`font-bold mb-6 sm:mb-8 leading-tight ${
//               isRTL ? "font-arabic" : ""
//             } ${
//               // Responsive text sizes: small on mobile, big on desktop
//               "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
//             }`}
//             style={{
//               textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
//             }}
//           >
//             {}{data[lang as keyof typeof data][params.id as keyof typeof data['en']]}
//           </motion.h1>
//         </motion.div>
//       </div>


//     </section>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";

export default function Hero({ country }: { country?: { nameEn: string; nameAr: string; images: string[] } | null }) {
  const params = useParams();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [urlVideo, setUrlVideo] = useState("/egypt-bg-video.mp4");

  // ✅ Effect 1: mounting + language
  useEffect(() => {
    setMounted(true);

    const currentLang = getLanguageFromSearchParams(searchParams);
    setLang(currentLang);

    const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => {
      setLang(e.detail.lang);
    };

    window.addEventListener("languagechange", handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange as EventListener);
    };
  }, [searchParams]);

  // ✅ Effect 2: video based on params
  useEffect(() => {
    if (params.id === "Egypt") {
      setUrlVideo("/egypt-bg-video.mp4");
    } else if (params.id === "Albania") {
      setUrlVideo("/albania-bg-video.mp4");
    }
  }, [params.id]);

  // ✅ return AFTER all hooks
  if (!mounted) return null;

  const data = {
    en: { Egypt: "Egypt", Albania: "Albania" },
    ar: { Egypt: "مصر", Albania: "ألبانيا" },
  };

  const direction = getDirection(lang);
  const isRTL = lang === "ar";
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden z-10 "
      dir={direction}
    >
      {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video autoPlay muted loop className="w-full h-full object-cover">
          <source src={urlVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <motion.h1
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={item}

        className={`text-white font-bold text-6xl ${isRTL ? "font-arabic" : ""}`}
      >
        {country ? (lang === "ar" ? country.nameAr : country.nameEn) : data[lang][params.id as "Egypt" | "Albania"]}
      </motion.h1>
    </section>
  );
}
