'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

import Navbar from '@/components/Navbar';
import CountryHero from '@/components/country-hero';
import Footer from '@/components/footer'
import { motion } from "framer-motion";


import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";


interface Category {
  _id: string;
  nameEn: string;
  nameAr: string;
  type: 'Incoming' | 'Outgoing' | 'Domestic' | 'Educational' | 'Corporate';
  image?: string;
  isActive: boolean;
}

const Page = () => {
  const {id , category } = useParams<{id:string , category: string }>(); // ✅ صح
  const searchParams = useSearchParams();
  alert(id + category);
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!category) return; // ✅ مهم
  }, [category]);


  if (!mounted) return null;

  const data = {
    en: { title: "Categories", Albania: "Albania" },
    ar: { title: "الفئات", Albania: "ألبانيا" },
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
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };


  return (
    <div dir={getDirection(lang)} className=" bg-white">
      <Navbar />
      <CountryHero />

      <motion.div variants={container}
        initial="hidden"
        whileInView="show"
        // viewport={{ once: true }}
         >

        <motion.h1 variants={item} className="text-3xl font-bold text-center mt-10 text-black">
          {data[lang].title}
        </motion.h1>

        <div className="max-w-full mx-16 mt-8 space-y-4 flex flex-row justify-center flex-wrap">
          {categories.length === 0 && (
            <p className="text-center my-6 text-gray-400">
              No categories found
            </p>
          )}


          {categories.map(cat => (
            <motion.div key={cat._id} variants={item}
              className="space-y-3 m-8">


              {cat.images?.length > 0 && (
                <div

                  className="
                w-[400px] h-[300px]
                rounded-[30px]
                bg-cover bg-center
                flex items-center justify-center
                transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                brightness-100
                hover:brightness-75
                hover:shadow-2xl
                hover:-translate-y-1
                hover:scale-[1.01]
                cursor-pointer
                hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]
                "
                  style={{
                    backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.63)),
                  url(http://localhost:5000/uploads/categories/${cat.images[0]})
                  `
                  }}
                >
                  <h1 className="text-lg font-bold text-white">
                    {lang === 'ar' ? cat.nameAr : cat.nameEn}
                  </h1>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Page;
