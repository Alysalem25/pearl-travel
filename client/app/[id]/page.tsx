'use client'
import React, { use } from 'react'
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { translations } from "@/data/translations";
import { Language, getDirection } from "@/lib/language";
import { getLanguageFromSearchParams } from "@/lib/language";
import { data } from 'framer-motion/client';
import Navbar from '@/components/Navbar';
const Page = () => {
  
    const country = useParams();

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

      const data ={
        en: {
          Egypt: "Egypt",
          Albania: "Albania",
      },
      ar: {
          Egypt: "مصر",
          Albania: "ألبانيا",
      }
      }

    return (
    <div >
                <Navbar />
      
      {country.id}
      {data[lang].Egypt}
    </div>
  )
}

export default Page
