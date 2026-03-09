"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { Language } from "@/data/translations";
import { getDirection, getLanguageFromSearchParams } from "@/lib/language";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Mail, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";


interface Cruisies {
    _id: string
    nameEn: string
    titleAr: string
    country: string
    images: string[]
}


function CruisiesContent() {
    const [lang, setLang] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const [cruisies, setCruisies] = useState<Cruisies[]>([])
    const [loadingCruisies, setLoadingCruisies] = useState(true)

    useEffect(() => {
        setMounted(true);
        setLang(getLanguageFromSearchParams(searchParams));
        const handleLanguageChange = (e: CustomEvent<{ lang: Language }>) => setLang(e.detail.lang);
        window.addEventListener("languagechange", handleLanguageChange as EventListener);
        return () => window.removeEventListener("languagechange", handleLanguageChange as EventListener);
    }, [searchParams]);

    //  fetch countries
    // useEffect(() => {
    //     const fetchCountries = async () => {
    //         try {
    //             setLoadingCruisies(true)
    //             const res = await api.cruisies.getAll()
    //             const data = res.data.cruisies || res.data
    //             console.log(data)
    //             if (Array.isArray(data)) {
    //                 setCruisies(data)
    //             } else {
    //                 setCruisies([])
    //             }

    //         } catch (err) {
    //             console.error("Error fetching countries", err)
    //             setCruisies([])
    //         } finally {
    //             setLoadingCruisies(false)
    //         }
    //     }

    //     fetchCountries()
    // }, [])


    if (!mounted) return null;

    const direction = getDirection(lang);


    // const handleFormSubmit = async () => {
    //     setSubmitting(true);
    //     setSubmitError(null);

    //     try {
    //         const payload = {
    //             fullName: stepOneForm.name,
    //             email: stepOneForm.email,
    //             phone: stepOneForm.phone,
    //             destination: stepOneForm.destination,
    //             otherCountries: stepOneForm.otherCountries,
    //             hasTraveledAbroad: stepTwoForm.hasTraveledAbroad === "yes",
    //             visitedCountries: stepTwoForm.visitedCountries
    //         };
    //         // const response = await api.visa.apply(payload);
    //         console.log("Submitting visa application with payload:", payload);
    //         const response = await axios.post("http://localhost:5000/cruisies", payload);

    //         if (response.data.applicationId) {
    //             setApplicationId(response.data.applicationId);
    //             setSubmitSuccess(true);
    //             setCurrentStep(3);
    //         }
    //     } catch (error: any) {
    //         console.error("Submission error:", error);
    //         setSubmitError(
    //             error.response?.data?.error ||
    //             error.message ||
    
    //             "An error occurred while submitting your application."
    //         );
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };
    cruisies:[
        {
            nameER:"Nile",
            nameAR:"نيل"
        }
    ]


    return (
        <>
            <main className="min-h-screen bg-white" dir={direction}>
                <Navbar />

                {/* Same layout as Egypt page: section + max-w-7xl + title + grid */}
                <div className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                            Where your journey begins
                        </h2>

                        {/* Same grid and card size as Egypt categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 py-4">
                            {cruisies.map((cruise, index) => (
                                <motion.div
                                    key={cruise._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="w-full"
                                >
                                    <div
                                        className="bg-gradient-to-br rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-12 text-white h-64 flex flex-col
                                         items-center justify-center relative overflow-hidden"
                                        style={{
                                            backgroundImage: `url('http://localhost:5000${cruise.images[0]}')`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/40" />
                                        <h3 className="text-2xl font-bold relative z-10">{cruise.nameEn}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />


        </>
    );
}

export default function CruisiesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <CruisiesContent />
        </Suspense>
    );
}
