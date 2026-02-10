'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

import Navbar from '@/components/Navbar';
import CountryHero from '@/components/country-hero';
import Footer from '@/components/footer';
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Language,
  getDirection,
  getLanguageFromSearchParams
} from "@/lib/language";
import Link from "next/link";

interface Program {
  _id: string;
  titleEn: string;
  titleAr: string;
  images: string[];
  status: string;
}

const Page = () => {
  const { id, category } = useParams<{
    id: string;
    category: string;
  }>();

  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);

  /* language */
  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));
  }, [searchParams]);

  /* fetch programs */
  useEffect(() => {
    console.log(category)
    if (!category) return;
    fetchPrograms(category);
  }, [category]);

  const fetchPrograms = async (categoryId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/programs/category/${categoryId}`
      );

      if (Array.isArray(res.data)) {
        console.log(res)
        setPrograms(res.data);
      } else {
        setPrograms([]);
        console.error("Invalid response shape", res.data);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
      setPrograms([]);
    }
  };

  if (!mounted) return null;

  return (
    <div dir={getDirection(lang)} className="bg-white">
      <Navbar />
      <CountryHero />

      <motion.h1
        className="text-3xl font-bold text-center mt-10 text-black"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {lang === "ar" ? "البرامج" : "Programs"}
      </motion.h1>

      <div className="max-w-full mx-16 m-10 flex flex-wrap justify-center gap-10">
        {programs.length === 0 && (
          <p className="text-gray-400">No programs found</p>
        )}

        {programs.map(program => (
          <Link href={`/${id}/${category}/${program._id}`}
            key={program._id}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-[400px]"
            >
              {/* {program.images?.length > 0 && ( */}
              {/* <Link to={`/$`} */}
              <div
                className="
                h-[300px]
                rounded-[30px]
                bg-cover bg-center
                flex items-end justify-center
                cursor-pointer
                transition-all
                hover:brightness-75
                hover:scale-[1.02]
                "
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)),
                  url(http://localhost:5000${program.images[0]})
                  `
                }}
              >
                <h2 className="text-white text-xl font-bold mb-6">
                  {lang === "ar" ? program.titleAr : program.titleEn}
                </h2>
              </div>
              {/* )} */}
            </motion.div>
          </Link>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Page;
