// 'use client'
// import React from 'react';
// import { useParams, useSearchParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import AdminSidebar from '@/components/adminSidebar';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Pagination, Navigation } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';
// import Navbar from '@/components/Navbar';
// import './styles.css';

// import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";
// import { api } from '@/lib/api';
// import Footer from '@/components/footer';


// interface Program {
//     _id: string;
//     titleEn: string;
//     titleAr: string;
//     descriptionEn: string;
//     descriptionAr: string;
//     category: {
//         nameEn: string;
//         nameAr: string;
//     };
//     country: string;
//     durationDays: number;
//     durationNights: number;
//     images?: [String];
//     days: {
//         dayNumber: number;
//         titleEn: string;
//         titleAr: string;
//         descriptionEn: string;
//         descriptionAr: string;
//     }[];
// }

// interface BookingData {
//     _id: string,
//     userName: string;
//     userEmail: string;
//     userNumber: string;
//     message: string;
//     programId: string;
// }

// const ProgramPage = () => {
//     const [sidebarOpen, setSidebarOpen] = React.useState(false);
//     const [program, setProgram] = React.useState<Program | null>(null);
//     const [loading, setLoading] = React.useState(true);
//     const [error, setError] = React.useState<string | null>(null);
//     const { id, category, programId } = useParams<{
//         id: string;
//         category: string;
//         programId: string;
//     }>();
//     const [lang, setLang] = useState<Language>("en");
//     const [mounted, setMounted] = useState(false);
//     const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
//     const searchParams = useSearchParams();
//     const [formData, setFormData] = useState({
//         userName: '',
//         userEmail: '',
//         userNumber: '',
//         message: ''
//     });

//     const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         try {
//             const bookingData: BookingData = {
//                 userName: formData.userName,
//                 userEmail: formData.userEmail,
//                 userNumber: formData.userNumber,
//                 message: formData.message,
//                 programId: programId
//             }
//             await api.bookings.create(bookingData);
//             alert(lang === "en" ? "Booking successful! We will contact you soon." : "تم الحجز بنجاح! سنتواصل معك قريبًا.");
//             setFormData({
//                 userName: '',
//                 userEmail: '',
//                 userNumber: '',
//                 message: ''
//             });
//         } catch (err) {
//             alert(lang === "en" ? "Failed to book program." : "فشل في حجز البرنامج.");
//         }
//     };

//     /* language */
//     useEffect(() => {
//         setMounted(true);
//         setLang(getLanguageFromSearchParams(searchParams));
//     }, [searchParams]);

//     React.useEffect(() => {
//         const fetchProgram = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const response = await api.programs.getOne(programId);
//                 setProgram(response.data);
//                 console.log(response.data);
//             } catch (err) {
//                 setError('Failed to load program details');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (programId) {
//             fetchProgram();
//         }
//     }, [programId]);


//     return (
//         <div dir={getDirection(lang)} className="min-h-screen flex bg-white text-white">
//             <Navbar />

//             <div className="flex-1 overflow-auto">
//                 {/* Header */}
//                 <header className="bg-blue-400 flex justify-end-safe flex-col h-52 p-4 sticky top-0 z-10">
//                     <div className="flex  items-center space-x-4">
//                         <h1 className="text-2xl font-bold">{(lang === 'en' ? "Program Details" : "تفاصيل البرنامج")}</h1>
//                     </div>
//                     <div className="flex  items-center space-x-4">
//                         <h1 className="text-lg font-medium">
//                             {program ? (lang === "en" ? program.country + " . " + program.category.nameEn + " . " + program.titleEn : program.country + " . " + program.category.nameAr + " . " + program.titleAr) : "Loading..."}</h1>
//                     </div>
//                 </header>

//                 {/* Content */}
//                 <div className="p-6">
//                     {loading && (
//                         <div className="flex items-center justify-center h-96">
//                             <div className="text-center">
//                                 <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//                                 <p className="mt-4 text-gray-400">Loading program details...</p>
//                             </div>
//                         </div>
//                     )}

//                     {error && (
//                         <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
//                             {error}
//                         </div>
//                     )}

//                     {program && !loading && (
//                         <div className="max-w-6xl mx-auto rounded-lg">
//                             {/* Image Carousel */}
//                             {program.images && program.images.length > 0 && (
//                                 <div className="mb-8">
//                                     <Swiper
//                                         spaceBetween={10}
//                                         centeredSlides={true}
//                                         autoplay={{
//                                             delay: 3000,
//                                             disableOnInteraction: false,
//                                         }}
//                                         pagination={{
//                                             clickable: true,
//                                         }}
//                                         navigation={true}
//                                         modules={[Autoplay, Pagination, Navigation]}
//                                         className="rounded-lg overflow-hidden"
//                                         style={{
//                                         }}
//                                     >
//                                         {program.images.map((img: string, index: number) => (
//                                             <SwiperSlide key={index} style={{}}>
//                                                 <img
//                                                     src={`http://localhost:5000${img}`}
//                                                     alt={`Program Image ${index + 1}`}
//                                                     className="w-72 object-cover"
//                                                 />
//                                             </SwiperSlide>
//                                         ))}
//                                     </Swiper>
//                                 </div>
//                             )}

//                             <div className="flex flex-col  gap-8">
//                                 <div className=" rounded-lg p-6">
//                                     <h2 className="text-3xl font-bold mb-4 text-blue-400">{lang === "en" ? program.titleEn : program.titleAr}</h2>
//                                     <div className="space-y-3 text-white">
//                                         <div className="flex justify-between items-center border-b border-gray-700 pb-2">
//                                             <div className='flex flex-row items-center '>
//                                                 <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-1'>
//                                                     <svg xmlns="http://www.w3.org/2000/svg" color='black' height="30px"
//                                                         viewBox="0 -960 960 960" width="30px" fill="black"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" /></svg>
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-bold text-2xl text-black">{lang === "en" ? "Duration" : "المده"}:</p>
//                                                     <p className=" text-lg  text-black">{program.durationDays} Days</p>
//                                                 </div>
//                                             </div>
//                                             <div className='flex flex-row items-center '>
//                                                 <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-1'>
//                                                     <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
//                                                         width="30px" fill="black"><path d="M480-80q-155 0-269-103T82-440h81q15 121 105.5 200.5T480-160q134 0 227-93t93-227q0-134-93-227t-227-93q-86 0-159.5 42.5T204-640h116v80H88q29-140 139-230t253-90q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm112-232L440-464v-216h80v184l128 128-56 56Z" /></svg>  </div>
//                                                 <div>
//                                                     <p className="font-bold text-2xl text-black">{lang === "en" ? "Duration Nights" : "المده"}</p>
//                                                     <p className=" text-lg  text-black">{program.durationNights} Nights</p>
//                                                 </div>
//                                             </div>
//                                             <div className='flex flex-row items-center '>
//                                                 <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-1'>
//                                                     <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
//                                                         width="30px" fill="black"><path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-160l-28-28q-6-6-9-13t-3-15v-224q-33 0-56.5-23.5T360-520v-40L235-685q-35 42-55 94t-20 111q0 134 93 227t227 93Zm40-2q119-15 199.5-105T800-480q0-133-93.5-226.5T480-800q-44 0-84.5 11.5T320-757v77h142q18 0 34.5 8t27.5 22l56 70h60q17 0 28.5 11.5T680-540v42q0 9-2.5 17t-7.5 16L520-240v78Z" /></svg>   </div>
//                                                 <div>
//                                                     <p className="font-bold text-2xl text-black">{lang === "en" ? "Country" : "البلد"}</p>
//                                                     <p className=" text-lg  text-black">{program.country}</p>
//                                                 </div>
//                                             </div>
//                                             {/* <div className='flex flex-row items-center '>
//                                                 <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-1'>
//                                                     <svg xmlns="http://www.w3.org/2000/svg" height="30px"
//                                                         viewBox="0 -960 960 960" width="30px" fill="black"><path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg> </div>
//                                                 <div>
//                                                     <p className="font-bold text-black">Price</p>
//                                                     <p className=" text-lg  text-black">${program.price}</p>
//                                                 </div>
//                                             </div> */}

//                                         </div>
//                                         <p className="font-bold text-3xl text-black">{lang === "en" ? "Description" : "الوصف"}:</p>
//                                         <p className="text-black text-lg">{lang === "en" ? program.descriptionEn : program.descriptionAr}</p>


//                                         <div className="flex flex-col justify-between items-center border-b w-full border-gray-700 pb-2">
//                                             <span className="font-semibold">days:</span>
//                                             {/* <span className="text-green-400 font-bold text-lg">{program.days.length}</span> */}
//                                             {
//                                                 program.days.map((day: any, index: number) => (
//                                                     <div key={index} className="w-full mt-2 p-4 bg-gray-300 rounded">

//                                                         <div className="flex justify-between items-center border-b border-gray-600 pb-2">
//                                                             <div className='flex flex-row items-center'>
//                                                                 <h3 className="font-semibold m-2 border-gray-600 border-2 text-black p-2 rounded-2xl">{index + 1}</h3>
//                                                                 <p className="text-black text-lg">{day.titleEn}</p>
//                                                             </div>
//                                                             <button
//                                                                 onClick={() =>
//                                                                     setActiveDayIndex(activeDayIndex === index ? null : index)
//                                                                 }
//                                                                 className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                                                             >
//                                                                 {activeDayIndex === index ? "-" : "+"}
//                                                             </button>
//                                                         </div>
//                                                         {activeDayIndex === index && (
//                                                             <div className="mt-3 p-3 bg-gray-300 rounded">
//                                                                 <p className="text-black">{day.descriptionEn}</p>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 ))
//                                             }

//                                         </div>



//                                     </div>
//                                 </div>

//                                 {/* book div */}
//                                 <div className="rounded-lg p-6 flex flex-col items-center justify-center border-2 border-gray-200">
//                                     <h2 className="text-2xl font-bold mb-4 text-blue-400">{lang === "en" ? "Ready to Book?" : "جاهز للحجز؟"}</h2>
//                                     <form className="w-full max-w-md mt-6" onSubmit={(e) => {
//                                         handelSubmit(e);
//                                     }}>
//                                         <div className="mb-4">
//                                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
//                                                 {lang === "en" ? "Name" : "الاسم"}
//                                             </label>
//                                             <input
//                                                 onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
//                                                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder={lang === "en" ? "Your Name" : "اسمك"} />
//                                         </div>
//                                         <div className="mb-4">
//                                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
//                                                 {lang === "en" ? "Email" : "البريد الإلكتروني"}
//                                             </label>
//                                             <input
//                                                 onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
//                                                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder={lang === "en" ? "Your Email" : "بريدك الإلكتروني"} />
//                                         </div>
//                                         <div className="mb-4">
//                                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
//                                                 {lang === "en" ? "Number" : "رقم الهاتف"}
//                                             </label>
//                                             <input
//                                                 onChange={(e) => setFormData({ ...formData, userNumber: e.target.value })}
//                                                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="number" type="tel" placeholder={lang === "en" ? "Your Number" : "رقم هاتفك"} />
//                                         </div>
//                                         <div className="mb-4">
//                                             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
//                                                 {lang === "en" ? "Message" : "الرسالة"}
//                                             </label>
//                                             <textarea
//                                                 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                                                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="message" placeholder={lang === "en" ? "Your Message" : "رسالتك"} rows={4}></textarea>
//                                         </div>
//                                         <div className="flex items-center justify-center">
//                                             <button className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">
//                                                 {lang === "en" ? "Send Message" : "إرسال الرسالة"}
//                                             </button>
//                                         </div>
//                                     </form>

//                                 </div>
//                             </div>

//                         </div>
//                     )}
//                 </div>
//                 <Footer />
//             </div>
//         </div>
//     );
// };

// export default ProgramPage;


'use client';
import React, { useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navbar from '@/components/Navbar';
import './styles.css';

import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";
import { api } from '@/lib/api';
import Footer from '@/components/footer';


interface Program {
    _id: string;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    category: {
        nameEn: string;
        nameAr: string;
    };
    country: string;
    durationDays: number;
    durationNights: number;
    images?: string[];
    days: {
        dayNumber: number;
        titleEn: string;
        titleAr: string;
        descriptionEn: string;
        descriptionAr: string;
    }[];
}

interface BookingData {
    _id?: string;
    userName: string;
    userEmail: string;
    userNumber: string;
    message: string;
    programId: string;
}

const ProgramPage = () => {
    const [program, setProgram] = React.useState<Program | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { programId } = useParams<{
        programId: string;
    }>();
    const [lang, setLang] = useState<Language>("en");
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        userNumber: '',
        message: ''
    });

    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);

    const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const bookingData: BookingData = {
                userName: formData.userName,
                userEmail: formData.userEmail,
                userNumber: formData.userNumber,
                message: formData.message,
                programId: programId
            }
            await api.bookings.create(bookingData);
            alert(lang === "en" ? "Booking successful! We will contact you soon." : "تم الحجز بنجاح! سنتواصل معك قريبًا.");
            setFormData({
                userName: '',
                userEmail: '',
                userNumber: '',
                message: ''
            });
        } catch {
            alert(lang === "en" ? "Failed to book program." : "فشل في حجز البرنامج.");
        }
    };

    /* language */
    useEffect(() => {
        setLang(getLanguageFromSearchParams(searchParams));
    }, [searchParams]);

    React.useEffect(() => {
        const fetchProgram = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.programs.getOne(programId);
                setProgram(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to load program details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (programId) {
            fetchProgram();
        }
    }, [programId]);


    return (
        <div dir={getDirection(lang)} className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="max-w-6xl mx-auto mb-10">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-900 mb-2">
                        {lang === 'en' ? "Program Details" : "تفاصيل البرنامج"}
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                        {program
                            ? (lang === "en" ? program.titleEn : program.titleAr)
                            : (lang === "en" ? "Loading program..." : "جاري تحميل البرنامج...")}
                    </h1>
                    {program && (
                        <p className="text-gray-600 text-sm sm:text-base">
                            {lang === "en"
                                ? `${program.country} · ${program.category.nameEn}`
                                : `${program.country} · ${program.category.nameAr}`}
                        </p>
                    )}
                </header>

                {/* Content */}
                <div className="flex flex-col max-w-6xl mx-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                <p className="mt-4 text-gray-400">Loading program details...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {program && !loading && (
                        <div className="space-y-10">
                            {/* Image Carousel */}
                            {program.images && program.images.length > 0 && (
                                <section className="relative mb-6 rounded-3xl overflow-hidden shadow-2xl bg-black/5 ring-1 ring-black/5">
                                    <Swiper
                                        spaceBetween={16}
                                        centeredSlides={true}
                                        loop={true}
                                        // autoplay={{
                                        //     delay: 4000,
                                        //     disableOnInteraction: false,
                                        // }}
                                        pagination={{
                                            clickable: true,
                                        }}
                                        navigation={{
                                            prevEl: prevRef.current,
                                            nextEl: nextRef.current,
                                        }}
                                        onBeforeInit={(swiper) => {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const nav = swiper.params.navigation as any;
                                            nav.prevEl = prevRef.current;
                                            nav.nextEl = nextRef.current;
                                        }}
                                        modules={[Autoplay, Pagination, Navigation]}
                                        className="w-full h-full"
                                    >
                                        {program.images.map((img: string, index: number) => (
                                            <SwiperSlide key={index}>
                                                <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[460px] overflow-hidden">
                                                    <img
                                                        src={`http://localhost:5000${img}`}
                                                        alt={`Program Image ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Custom navigation arrows (restored style) */}
                                    <button
                                        ref={prevRef}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-lg hover:bg-white transition-colors"
                                        aria-label={lang === 'en' ? 'Previous image' : 'الصورة السابقة'}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        ref={nextRef}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-lg hover:bg-white transition-colors"
                                        aria-label={lang === 'en' ? 'Next image' : 'الصورة التالية'}
                                    >
                                        ›
                                    </button>
                                </section>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100">
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-500">
                                        {lang === "en" ? "Overview" : "نظرة عامة"}
                                    </h2>
                                    <div className="space-y-6 text-gray-800">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                                            <div className='flex flex-row items-center'>
                                                <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-2 bg-gray-50'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" color='black' height="30px"
                                                        viewBox="0 -960 960 960" width="30px" fill="black"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide">{lang === "en" ? "Duration" : "المدة (أيام)"}</p>
                                                    <p className="text-lg font-semibold text-gray-900">{program.durationDays} {lang === "en" ? "Days" : "أيام"}</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center'>
                                                <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-2 bg-gray-50'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                                                        width="30px" fill="black"><path d="M480-80q-155 0-269-103T82-440h81q15 121 105.5 200.5T480-160q134 0 227-93t93-227q0-134-93-227t-227-93q-86 0-159.5 42.5T204-640h116v80H88q29-140 139-230t253-90q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm112-232L440-464v-216h80v184l128 128-56 56Z" /></svg>  </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide">{lang === "en" ? "Nights" : "المدة (ليالي)"}</p>
                                                    <p className="text-lg font-semibold text-gray-900">{program.durationNights} {lang === "en" ? "Nights" : "ليالي"}</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center'>
                                                <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-2 bg-gray-50'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960"
                                                        width="30px" fill="black"><path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-160l-28-28q-6-6-9-13t-3-15v-224q-33 0-56.5-23.5T360-520v-40L235-685q-35 42-55 94t-20 111q0 134 93 227t227 93Zm40-2q119-15 199.5-105T800-480q0-133-93.5-226.5T480-800q-44 0-84.5 11.5T320-757v77h142q18 0 34.5 8t27.5 22l56 70h60q17 0 28.5 11.5T680-540v42q0 9-2.5 17t-7.5 16L520-240v78Z" /></svg>   </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide">{lang === "en" ? "Country" : "البلد"}</p>
                                                    <p className="text-lg font-semibold text-gray-900">{program.country}</p>
                                                </div>
                                            </div>
                                            {/* <div className='flex flex-row items-center '>
                                                <div className='text-black m-2 border-2 border-gray-200 rounded-2xl p-1'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="30px"
                                                        viewBox="0 -960 960 960" width="30px" fill="black"><path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg> </div>
                                                <div>
                                                    <p className="font-bold text-black">Price</p>
                                                    <p className=" text-lg  text-black">${program.price}</p>
                                                </div>
                                            </div> */}
                                        </div>

                                        <div className="space-y-3">
                                            <p className="font-semibold text-lg text-gray-900">
                                                {lang === "en" ? "Description" : "الوصف"}
                                            </p>
                                            <p className="text-gray-700 text-base leading-relaxed">
                                                {lang === "en" ? program.descriptionEn : program.descriptionAr}
                                            </p>
                                        </div>


                                        <div className="mt-6 border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-gray-900">
                                                    {lang === "en" ? "Days Itinerary" : "برنامج الأيام"}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {program.days.length} {lang === "en" ? "days" : "يوم"}
                                                </span>
                                            </div>
                                            {
                                                program.days.map((day, index) => (
                                                    <div key={index} className="w-full mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">

                                                        <div className="flex justify-between items-center gap-4">
                                                            <div className='flex flex-row items-center gap-3'>
                                <h3 className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 text-white font-semibold text-lg">
                                                                    {index + 1}
                                                                </h3>
                                                                <p className="text-gray-900 text-base font-medium">
                                                                    {lang === "en" ? day.titleEn : day.titleAr}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    setActiveDayIndex(activeDayIndex === index ? null : index)
                                                                }
                                                                className="mt-2 px-4 py-1.5 text-sm rounded-full border border-blue-900 text-blue-900 hover:bg-blue-50 transition-colors"
                                                            >
                                                                {activeDayIndex === index
                                                                    ? (lang === "en" ? "Hide details" : "إخفاء التفاصيل")
                                                                    : (lang === "en" ? "View details" : "عرض التفاصيل")}
                                                            </button>
                                                        </div>
                                                        {activeDayIndex === index && (
                                                            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100">
                                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                                    {lang === "en" ? day.descriptionEn : day.descriptionAr}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            }

                                        </div>



                                    </div>
                                </div>

                                {/* Booking card */}
                                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-gray-100 flex flex-col items-center justify-center">
                                    <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">
                                        {lang === "en" ? "Ready to book?" : "جاهز للحجز؟"}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-6 text-center">
                                        {lang === "en"
                                            ? "Send us your details and our team will contact you shortly to confirm your booking."
                                            : "أرسل لنا بياناتك وسيتواصل معك فريقنا قريبًا لتأكيد الحجز."}
                                    </p>
                                    <form className="w-full max-w-md mt-1" onSubmit={(e) => {
                                        handelSubmit(e);
                                    }}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                                                {lang === "en" ? "Name" : "الاسم"}
                                            </label>
                                            <input
                                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900" id="name" type="text" placeholder={lang === "en" ? "Your Name" : "اسمك"} />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                                                {lang === "en" ? "Email" : "البريد الإلكتروني"}
                                            </label>
                                            <input
                                                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900" id="email" type="email" placeholder={lang === "en" ? "Your Email" : "بريدك الإلكتروني"} />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="number">
                                                {lang === "en" ? "Number" : "رقم الهاتف"}
                                            </label>
                                            <input
                                                onChange={(e) => setFormData({ ...formData, userNumber: e.target.value })}
                                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900" id="number" type="tel" placeholder={lang === "en" ? "Your Number" : "رقم هاتفك"} />
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="message">
                                                {lang === "en" ? "Message" : "الرسالة"}
                                            </label>
                                            <textarea
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-2.5 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900" id="message" placeholder={lang === "en" ? "Your Message" : "رسالتك"} rows={4}></textarea>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <button className="px-8 py-3 bg-blue-900 text-white rounded-full hover:bg-blue-950 shadow-md transition-colors font-semibold" type="submit">
                                                {lang === "en" ? "Send Message" : "إرسال الرسالة"}
                                            </button>
                                        </div>
                                    </form>

                                </div> {/* end booking card */}
                            </div>

                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProgramPage;