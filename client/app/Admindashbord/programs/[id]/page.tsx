'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import AdminSidebar from '@/components/adminSidebar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './styles.css';

interface Program {
    titleEn: string;
    titleAr: string;
    durationDays: number;
    country: string;
    price: number;
    images: string[];
}

export default function ProgramPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <ProgramPageContent />
        </ProtectedRoute>
    );
}

const ProgramPageContent = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [program, setProgram] = React.useState<Program | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const params = useParams();

    React.useEffect(() => {
        const fetchProgram = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:5000/programs/${params.id}`);
                setProgram(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Failed to load program details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProgram();
        }
    }, [params.id]);


    return (
        <div className="min-h-screen flex bg-gray-900 text-white">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="programs" />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-2xl font-bold">Program Details</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Content */}
                <div className="p-6">
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
                        <div className="max-w-6xl mx-auto">
                            {/* Image Carousel */}
                            {program.images && program.images.length > 0 && (
                                <div className="mb-8">
                                    <Swiper
                                        spaceBetween={10}
                                        centeredSlides={true}
                                        autoplay={{
                                            delay: 3000,
                                            disableOnInteraction: false,
                                        }}
                                        pagination={{
                                            clickable: true,
                                        }}
                                        navigation={true}
                                        modules={[Autoplay, Pagination, Navigation]}
                                        className="rounded-lg overflow-hidden"
                                        style={{
                                            height: '400px',
                                        }}
                                    >
                                        {program.images.map((img: string, index: number) => (
                                            <SwiperSlide key={index} style={{ height: '400px' }}>
                                                <img
                                                    src={`http://localhost:5000${img}`}
                                                    alt={`Program Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* English Version */}
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-3xl font-bold mb-4 text-blue-400">{program.titleEn}</h2>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">Duration:</span>
                                            <span>{program.durationDays} Days</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">Country:</span>
                                            <span>{program.country}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">Price:</span>
                                            <span className="text-green-400 font-bold text-lg">${program.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">Description:</span>
                                            <span className="text-green-400 font-bold text-lg">${program.descriptionEn}</span>
                                        </div>
                                         
                                         <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">days:</span>
                                            <span className="text-green-400 font-bold text-lg">{program.days.length}</span>
                                            {
                                                program.days.map((day: any, index: number) => (
                                                    <div key={index} className="mt-2 p-4 bg-gray-700 rounded">
                                                        <h3 className="font-semibold mb-2">Day {index + 1}</h3>
                                                        <p className="text-gray-300">{day.titleEn}</p>
                                                        <p className="text-gray-400 mt-1">{day.descriptionEn}</p>   
                                                    </div>
                                                ))
                                            }
                                            </div>
                                    </div>
                                </div>

                                {/* Arabic Version */}
                                <div className="bg-gray-800 rounded-lg p-6" dir="rtl">
                                    <h2 className="text-3xl font-bold mb-4 text-blue-400">{program.titleAr}</h2>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">المدة:</span>
                                            <span>{program.durationDays} أيام</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">البلد:</span>
                                            <span>{program.country}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">السعر:</span>
                                            <span className="text-green-400 font-bold text-lg">${program.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">الوصف</span>
                                            <span className="text-green-400 font-bold text-lg">${program.descriptionAr}</span>
                                        </div>
                                                 <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                            <span className="font-semibold">days:</span>
                                            <span className="text-green-400 font-bold text-lg">{program.days.length}</span>
                                            {
                                                program.days.map((day: any, index: number) => (
                                                    <div key={index} className="mt-2 p-4 bg-gray-700 rounded">
                                                        <h3 className="font-semibold mb-2">Day {index + 1}</h3>
                                                        <p className="text-gray-300">{day.titleAr}</p>
                                                        <p className="text-gray-400 mt-1">{day.descriptionAr}</p>   
                                                    </div>
                                                ))
                                            }
                                            </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {program.images && program.images.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold mb-4 text-gray-300">Gallery</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {program.images.map((img: string, index: number) => (
                                            <div
                                                key={index}
                                                className="rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                                            >
                                                <img
                                                    src={`http://localhost:5000${img}`}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

