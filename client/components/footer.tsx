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
        en: {
            links: [
                "home",
                "about",
                "our team",
                "hero",
            ]
        },
        ar: {
            links: [
                "home",
                "about",
                "our team",
                "hero",
            ]
        }
    }

    return (
        <section
            dir={direction}
            className="relative w-full bg-gradient-to-b from-gray-800 via-gray-700 to-gray-500 text-gray-300"
        >
            <div className="border-t border-gray-950"></div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* About */}
                <div>
                    <h3 className="text-red-600 text-2xl font-bold mb-4">
                        Pearl Travel
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Inventore dolorum, aut reiciendis ipsum impedit, corporis
                        expedita quae repellat nam amet.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold text-lg mb-4">
                        Quick Links
                    </h3>
                    <ul className="space-y-2">
                        {data[lang].links.map((link, i) => (
                            <li
                                key={i}
                                className="cursor-pointer hover:text-red-500 transition-colors duration-200"
                            >
                                {link}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-white font-semibold text-lg mb-4">
                        Contact Info
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li>📞 0121226225</li>
                        <li>✉️ pearl@gmail.com</li>
                        <li>📍 Alexandria, Egypt</li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h3 className="text-white font-semibold text-lg mb-4">
                        Follow Us
                    </h3>
                    <div className="flex gap-4">
                        <a className="hover:text-red-500 transition">Facebook</a>
                        <a className="hover:text-red-500 transition">Instagram</a>
                        <a className="hover:text-red-500 transition">Twitter</a>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Copyright */}
            <div className="text-center py-6 text-sm text-gray-500">
                © 2023 Pearl Travel. All Rights Reserved.
            </div>
        </section>

    );
}

