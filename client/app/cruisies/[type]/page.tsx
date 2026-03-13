'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

import Navbar from '@/components/Navbar';
import CountryHero from '@/components/country-hero';
import Footer from '@/components/footer';
import { motion } from "framer-motion";
import {
  Language,
  getDirection,
  getLanguageFromSearchParams
} from "@/lib/language";
import Link from "next/link";

interface Cruise {
  _id: string;
  titleEn: string;
  titleAr: string;
  images: string[];
  status: string;
}

const Page = () => {

  const { type } = useParams<{ type: string }>();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [cruises, setCruises] = useState<Cruise[]>([]);

  /* Language */
  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));
  }, [searchParams]);

  /* Fetch Programs */
  useEffect(() => {
    if (!type) return;
    fetchPrograms(type);
  }, [type]);

  const fetchPrograms = async (type: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/cruisies/type/${type}`
      );

      if (Array.isArray(res.data)) {
        setCruises(res.data);
      } else {
        console.error("Invalid response shape", res.data);
        setCruises([]);
      }

    } catch (err) {
      console.error("Error fetching programs:", err);
      setCruises([]);
    }
  };

  if (!mounted) return null;

  return (
    <div dir={getDirection(lang)} className="bg-white min-h-screen">

      <Navbar />

      <CountryHero />

      <motion.h1
        className="text-3xl font-bold text-center mt-10 text-black"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {lang === "ar" ? "البرامج" : type + " Cruisies"}
      </motion.h1>

      <div className="max-w-[1400px] mx-auto mt-10 flex flex-wrap justify-center gap-10 px-4">
        {cruises.length === 0 && (
          <p className="text-gray-400 text-lg">No programs found</p>
        )}

        {cruises.map(cruise => (

          <Link
            href={`/cruisies/${type}/${cruise._id}`}
            key={cruise._id}
          >

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-[350px]"
            >

              <div
                className="
                h-[300px]
                rounded-[30px]
                bg-cover
                bg-center
                flex
                items-end
                justify-center
                cursor-pointer
                transition-all
                hover:brightness-75
                hover:scale-[1.03]
                "
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)),
                  url(http://localhost:5000${cruise.images?.[0]})
                  `
                }}
              >

                <h2 className="text-white text-xl font-bold mb-6 text-center px-4">
                  {lang === "ar" ? cruise.titleAr : cruise.titleEn}
                </h2>

              </div>

            </motion.div>

          </Link>

        ))}

      </div>

      <Footer />

    </div>
  );
};

export default Page;