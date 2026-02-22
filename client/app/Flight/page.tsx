'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from '@/components/Navbar';
import CountryHero from '@/components/country-hero';
import Footer from '@/components/footer'
import { motion } from "framer-motion";
import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";
import SearchableDropdown from "@/components/SearchableDropdown";

interface Flights {
    _id: string;
    userEmail: string;
    userName: string;
    userNumber: number;
    from: string;
    to: string;
}

const Page = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [lang, setLang] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);
    const [fromCountries, setFromCountriess] = useState<any[]>([]);
    const [toCountries, setToCountries] = useState<any[]>([]);
    const [fromCountry, setFromCountry] = useState("");
    const [toCountry, setToCountry] = useState("");
    const [flights, setFlights] = useState<Flights[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        userEmail: "",
        userName: "",
        userNumber: 0,
        from: "",
        to: ""
    });

    useEffect(() => {
        setMounted(true);
        setLang(getLanguageFromSearchParams(searchParams));
    }, [searchParams]);

    useEffect(() => {
        fetchFromCountries();
        fetchToCountries();
    }, []);


    const fetchFromCountries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/countries/inFromCountry`);
            setFromCountriess(res.data);
            console.log("From Countries:", res.data);
        } catch (err) {
            console.error("Error fetching from countries:", err);
        } finally {
            setLoading(false);
        }

    }

    const fetchToCountries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/countries/inToCountry`);
            setToCountries(res.data);
        } catch (err) {
            console.error("Error fetching to countries:", err);
        } finally {
            setLoading(false);
        }
    }

    const submitFlighte = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                `http://localhost:5000/flights`,
                {
                    userEmail: formData.userEmail,
                    userName: formData.userName,
                    userNumber: formData.userNumber,
                    from: formData.from,
                    to: formData.to
                }
            );
            setSuccessMessage("Flight booked successfully");
            // clear form
            setFormData({ userEmail: "", userName: "", userNumber: 0, from: "", to: "" });
            setFromCountry("");
            setToCountry("");
            setTimeout(() => setSuccessMessage(""), 4000);

        } catch (err) {
            console.error("Error submitting flight", err);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const data = {
        en: {
            title: "Flights",
            description: "Choose department and destination airports or type to search"
        },
        ar: {
            title: "الرحلات",
            description: "اختر مطار المغادرة والوصول أو اكتب للبحث"
        },
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    // if (categories.length === 0) {
    //     return (
    //         <div dir={getDirection(lang)} className="bg-white min-h-screen">
    //             <Navbar />
    //             <div className="flex text-center mt-72 text-gray-500">
    //                 <p>
    //                     No categories available for this country.
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }
    function filterFunction1() {
        const input = document.getElementById("myInput") as HTMLInputElement;
        if (!input) return;
        const filter = input.value.toUpperCase();
        const div = document.getElementById("myDropdown");
        if (!div) return;
        const a = div.getElementsByTagName("p");
        for (let i = 0; i < a.length; i++) {
            const txtValue = a[i].textContent || a[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    function filterFunction2() {
        const input = document.getElementById("myInput2") as HTMLInputElement;
        if (!input) return;
        const filter = input.value.toUpperCase();
        const div = document.getElementById("myDropdown2");
        if (!div) return;
        const a = div.getElementsByTagName("p");
        for (let i = 0; i < a.length; i++) {
            const txtValue = a[i].textContent || a[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    return (
        <div dir={getDirection(lang)} className="bg-white min-h-screen flex flex-col"
        >
            <Navbar />

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    px-4
                "
            >
                <div
                    className="
    w-full
    max-w-4xl
    mt-52
    rounded-3xl
    shadow-2xl
    backdrop-blur-xl
    bg-white/80
    border border-gray-200
    p-8
    "
                    style={{
                        // padding: "4rem",
                        backgroundImage: `
      linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)),
      url(/airport-transfer.webp)
    `,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >               <motion.h1
                    variants={item}
                    className="text-3xl font-bold text-start mt-10 text-black"
                >
                        {data[lang].title}
                    </motion.h1>
                    <motion.p
                        variants={item}
                        className="text-start mt-4 text-black text-lg max-w-xl mx-auto"
                    >
                        {data[lang].description}
                    </motion.p>
                    {/* </motion.div> */}

                    <form className="
    w-full
    mt-52
    p-8
    m
    bg-white/95
    backdrop-blur-xl
    rounded-2xl
    shadow-xl
    border border-gray-100
  " onSubmit={(e) => {
                            e.preventDefault();
                            submitFlighte();
                        }}

                    >
                        {successMessage && (
                            <div className="mb-4 p-3 rounded bg-green-100 border border-green-300 text-green-800 flex justify-between items-center">
                                <span>{successMessage}</span>
                                <button type="button" onClick={() => setSuccessMessage("")} className="ml-4 text-green-700 font-bold">✕</button>
                            </div>
                        )}
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="mb-4">
                                <label className="block text-black mb-2">Email</label>
                                <input
                                    type="email"
                                    className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring  border-gray-800  focus:border-gray-950"
                                    value={formData.userEmail}
                                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-black mb-2">Name</label>
                                <input
                                    type="text"
                                    className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring border-gray-800  focus:border-gray-950"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-black mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring  border-gray-800  focus:border-gray-950"
                                    value={formData.userNumber}
                                    onChange={(e) => setFormData({ ...formData, userNumber: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SearchableDropdown
                                items={fromCountries}
                                value={formData.from}
                                onChange={(id, label) => { setFormData({ ...formData, from: id }); if (label) setFromCountry(label); }}
                                placeholder="From Country"
                            />

                            <SearchableDropdown
                                items={toCountries}
                                value={formData.to}
                                onChange={(id, label) => { setFormData({ ...formData, to: id }); if (label) setToCountry(label); }}
                                placeholder="To Country"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Flight"}
                        </button>
                    </form>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default Page;
