'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  images?: string[]; // ✅ تصحيح
  isActive: boolean;
}

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setLang(getLanguageFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    fetchCategories(id);
  }, [id]);

  const fetchCategories = async (countryName: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/categories/country/${countryName}`
      );

      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }

    } catch (err) {
      console.error("Error fetching categories", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const data = {
    en: { title: "Categories" },
    ar: { title: "الفئات" },
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

  if (categories.length === 0) {
    return (
      <div dir={getDirection(lang)} className="bg-white min-h-screen">
        <Navbar />
        <div className="flex text-center mt-72 text-gray-500">
          <p>
            No categories available for this country.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir={getDirection(lang)} className="bg-white ">
      <Navbar />
      <CountryHero />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        className="my-6"
      >
        <motion.h1
          variants={item}
          className="text-3xl font-bold text-center mt-10 text-black"
        >
          {data[lang].title}
        </motion.h1>

        {/* Loading */}
        {loading && (
          <p className="text-center mt-10 text-gray-500">
            Loading categories...
          </p>
        )}

        {/* No Data */}
        {!loading && categories.length === 0 && (
          <p className="text-center mt-10 text-gray-400">
            No categories found
          </p>
        )}

        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
          {categories.map(cat => {
            const imageUrl =
              cat.images && cat.images.length > 0
                ? `http://localhost:5000${cat.images[0]}`
                : '/default-country.jpg'; // fallback

            return (
              <motion.div
                key={cat._id}
                variants={item}
                onClick={() => router.push(`/${id}/${cat._id}`)} // ✅ أفضل من window.location
                className="cursor-pointer"
              >
                <div
                  className="relative w-full h-[300px] rounded-3xl overflow-hidden
                  bg-cover bg-center
                  transition-all duration-300
                  hover:brightness-75
                  hover:shadow-2xl
                  hover:-translate-y-1
                  hover:scale-[1.02]"
                  style={{
                    backgroundImage: `url(${imageUrl})`
                  }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-xl font-bold text-white text-center px-4">
                      {lang === 'ar' ? cat.nameAr : cat.nameEn}
                    </h1>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Page;
