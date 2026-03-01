// "use client";

// /**
//  * About component with creative photo shapes and animations
//  * Features creative CSS shapes (hexagons, circles, polygons) for photos
//  * Supports RTL/LTR layout based on language
//  */

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import { translations } from "@/data/translations";
// import { Language, getDirection } from "@/lib/language";
// import { getLanguageFromSearchParams } from "@/lib/language";
// import { Target, Eye, Heart, Sparkles } from "lucide-react";
// import { title } from "process";

// export default function About() {
//   const [lang, setLang] = useState<Language>("en");
//   const [mounted, setMounted] = useState(false);
//   const searchParams = useSearchParams();

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
//     return null;
//   }

//   const t = translations[lang].about;
//   const isRTL = lang === "ar";
//   const direction = getDirection(lang);


//   const data = {
//     en: {
//       title : "About Us",
//       paragraph:
//         "It is our great pleasure to extend our services to our business partners. Established in 1985, Pearl Travel is a fully accredited IATA travel agency based in Alexandria. Being in business for 40 years makes us one of Egypt's leading travel agencies with proven financial record, representing most international airlines. Moreover, we are one of few “Category A” IATA agents in Egypt. Our large clientele varies from Governmental bodies to private sector. Also, our large variety of service includes:",
//         points: [
//         "Domestic and international air reservations and ticketing.",
//         "Hotel reservations world-wide.",
//         "Conference and incentive tours.",
//         "Incoming&Outgoing customized tours.",
//         "Arranging domestic and international holiday packages.",
//         "Meet and greet at the Airport and visa processing.",
//         "Limousine and car hire service.",
//         "Educational packages and youth summer camps.",
//       ]
//     },
//     ar: {
//       title : "معلومات عنا",
//       paragraph: "يسرنا أن نقدم خدماتنا لشركائنا في العمل. تأسست شركة بيرل للسفر في عام 1985، وهي وكالة سفر معتمدة بالكامل من IATA وتقع في الإسكندرية. كوننا في مجال الأعمال لمدة 40 عامًا يجعلنا واحدة من وكالات السفر الرائدة في مصر بسجل مالي مثبت، نمثل معظم شركات الطيران الدولية. علاوة على ذلك، نحن من بين القلائل الذين يحملون تصنيف 'الفئة أ' من IATA في مصر. تتنوع قاعدة عملائنا الكبيرة بين الهيئات الحكومية والقطاع الخاص. كما تشمل خدماتنا المتنوعة ما يلي:",
//       points: [
//         "الحجز والتأشيرات الجوية المحلية والدولية.",
//         "الحجز في الفنادق حول العالم.",
//         "جولات المؤتمرات والمكافآت.",
//         "جولات مخصصة للواردين والناشرين.",
//         "تنظيم حزم العطل المحلية والدولية.",
//         "القاء القبض على المطار ومعالجة التأشيرات.",
//         "خدمة ليموزين وتأجير السيارات.",
//         "حزم تعليمية ومخيمات صيفية للشباب."
//       ]
//     },
//   }

//   return (
//     <section
//       className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
//       dir={direction}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
//           <motion.h1
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
//             {data[lang].title}
//           </motion.h1>
//           <motion.div
//             // variants={itemVariants}
//             className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-6"
//           >
//             <p>{data[lang].paragraph}</p>
//          <div className="flex flex-row
//          ">
//              <ul className="list-disc list-inside space-y-2">
//                {data[lang].points.map((point, index) => (
//                  <li key={index}>{point}</li>
//                ))}
//              </ul>
//            <div className="flex flex-col">
//              <img
//                src="/OIP.webp"
//                alt="About Us Illustration"
//                className="mt-8 mx-auto w-64 h-auto"
//                />
//                <div className="flex flex-row">
//                 <img
//                src="/OIP.webp"
//                alt="About Us Illustration"
//                className="mt-8 mx-auto w-64 h-auto"
//                /><img
//                src="/OIP.webp"
//                alt="About Us Illustration"
//                className="mt-8 mx-auto w-64 h-auto"
//                />
//                </div>
//                </div>
//          </div>
//           </motion.div>

//           {/* <div className="blob-container">
//             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
//               <defs>
//                 <clipPath id="imageBlob">
//                   <path
//                     d="M55.1,-50.6C70.8,-39.4,82.5,-19.7,78.3,-4.2C74.1,11.3,54.1,22.7,38.4,35.8C22.7,48.8,11.3,63.7,-0.4,64C-12,64.4,-24.1,50.2,-30.6,37.2C-37,24.1,-37.9,12,-39.9,-2C-41.8,-16,-44.9,-31.9,-38.4,-43C-31.9,-54.2,-16,-60.4,1.9,-62.3C19.7,-64.2,39.4,-61.7,55.1,-50.6Z"
//                     transform="translate(100 100)"
//                   />
//                 </clipPath>
//               </defs>

//               <image
//                 href="/OIP.webp"
//                 width="100%"
//                 height="100%"
//                 clip-path="url(#imageBlob)"
//                 preserveAspectRatio="xMidYMid slice"
//               />
//             </svg>
//           </div> */}





//       </div>
//     </section>
//   );
// }
















"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";

export default function About() {
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

  const data = {
    en: {
      title : "About Us",
      paragraph:
        "It is our great pleasure to extend our services to our business partners. Established in 1985, Pearl Travel is a fully accredited IATA travel agency based in Alexandria. Being in business for 40 years makes us one of Egypt's leading travel agencies with proven financial record, representing most international airlines. Moreover, we are one of few “Category A” IATA agents in Egypt. Our large clientele varies from Governmental bodies to private sector. Also, our large variety of service includes:",
        points: [
        "Domestic and international air reservations and ticketing.",
        "Hotel reservations world-wide.",
        "Conference and incentive tours.",
        "Incoming&Outgoing customized tours.",
        "Arranging domestic and international holiday packages.",
        "Meet and greet at the Airport and visa processing.",
        "Limousine and car hire service.",
        "Educational packages and youth summer camps.",
      ]
    },
    ar: {
      title : "معلومات عنا",
      paragraph: "يسرنا أن نقدم خدماتنا لشركائنا في العمل. تأسست شركة بيرل للسفر في عام 1985، وهي وكالة سفر معتمدة بالكامل من IATA وتقع في الإسكندرية. كوننا في مجال الأعمال لمدة 40 عامًا يجعلنا واحدة من وكالات السفر الرائدة في مصر بسجل مالي مثبت، نمثل معظم شركات الطيران الدولية. علاوة على ذلك، نحن من بين القلائل الذين يحملون تصنيف 'الفئة أ' من IATA في مصر. تتنوع قاعدة عملائنا الكبيرة بين الهيئات الحكومية والقطاع الخاص. كما تشمل خدماتنا المتنوعة ما يلي:",
      points: [
        "الحجز والتأشيرات الجوية المحلية والدولية.",
        "الحجز في الفنادق حول العالم.",
        "جولات المؤتمرات والمكافآت.",
        "جولات مخصصة للواردين والناشرين.",
        "تنظيم حزم العطل المحلية والدولية.",
        "القاء القبض على المطار ومعالجة التأشيرات.",
        "خدمة ليموزين وتأجير السيارات.",
        "حزم تعليمية ومخيمات صيفية للشباب."
      ]
    },
  }

  /* ================= Animations ================= */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section
      dir={direction}
      className="relative py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Title */}
        <motion.h1
          variants={item}
          className={`font-bold mb-8 text-center text-[var(--mainColor)] ${
            isRTL ? "font-arabic" : ""
          } text-4xl sm:text-5xl md:text-6xl`}
        >
          {data[lang].title}
        </motion.h1>
        <motion.p variants={item} className="text-start align-middle text-2xl mb-16 max-w-full
         text-[var(--secondColor)]">
         {data[lang].paragraph}
        </motion.p>


        {/* Content */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Text */}
          <motion.div
           variants={item} 
           className="space-y-6 text-[var(--secondColor)] text-2xl">

            <ol type="1" className="list-decimal list-inside space-y-2">
              {data[lang].points.map((point, i) => (
                <li className="text-2xl" key={i}>{point}</li>
              ))}
            </ol>
          </motion.div>

          {/* Images */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 gap-6"
          >
            <img
              src="/about2.jpeg"
              alt=""
              className="col-span-2 rounded-2xl object-cover w-full h-64 shadow-lg"
            />
            <img
              src="/about1.jpeg"
              alt=""
              className="rounded-3xl object-cover h-52 w-full shadow-lg"
            />
            <img
              src="/about3.jpeg"
              alt=""
              className="rounded-3xl object-cover  w-full shadow-xl"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
