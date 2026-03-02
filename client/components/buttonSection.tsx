"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";

export default function ButtonSection() {
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

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };



    return (
        <section
            dir={direction}
            className="relative py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
            <div className="container flex flex-wrap justify-center mx-auto px-6 text-center mb-12 gap-8">

                {/* Egypt Button */}
                <motion.div
                    variants={item}

                >
                    <a
                        className="button_img1 text-3xl text-white font-bold"
                        href="/Egypt"
                    >
                        <span className="button_text">
                            {isRTL ? "مصر" : "Egypt"}
                        </span>
                    </a>
                </motion.div>

                {/* Albania Button */}
                <motion.div
                    variants={item}

                >
                    <a
                        className="button_img2 text-3xl text-white font-bold"
                        href="/Albania"
                    >
                        <span className="button_text">
                            {isRTL ? "ألبانيا" : "Albania"}
                        </span>
                    </a>
                </motion.div>

            </div>
        </section>
    );
}
