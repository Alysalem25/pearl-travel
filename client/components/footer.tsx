"use client";



import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { translations } from "@/data/translations";
import { Language, getDirection } from "@/lib/language";
import { getLanguageFromSearchParams } from "@/lib/language";
import { data } from "react-router-dom";
import { title } from "process";

export default function Hero() {
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

    const data = {
        en:{
            links:[
                "home",
                "about",
                "our team",
                "hero",
            ]
        },
        ar:{
            links:[
                "home",
                "about",
                "our team",
                "hero",
            ]
        }
    }

    return (
        <section
            className="relative flex items-center bg-black drop-shadow-2xl min-h-72 w-full justify-center overflow-hidden"
            dir={direction}
        >
                <h3>paral travel</h3>
                <ol>
                    {
                        data[lang].links.map((link ,i)=>
                           (  <li key={i}>{link}</li>)
                        )
                    }
                </ol>

                <footer>
                    <small>
                        Copyright © 2023 Football History Archives. All Rights Reserved.
                    </small>
                </footer>

        </section>
    );
}

