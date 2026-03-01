'use client'

import React, { useState, useEffect } from 'react'
import AdminSidebar from '@/components/adminSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import axios from 'axios'

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}

function AdminDashboardContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        userCount: 0,
        activePrograms: 0,
        totalPrograms: 0,
        categoriesCount: 0, // Fixed spelling from catiogriesCount
        egyptPrograms: 0,
        internationalPrograms: 0, // Renamed for better context
        visaApplications: 0,
        visaPending: 0,
        visaReviewed: 0,
        flightCount: 0,
        reviewedFlights: 0,
        pendingFlights: 0,
        bookedCount: 0,
        pendingBookings: 0,
        reviewedBookings: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Ensure the URL matches your backend endpoint precisely
                const response = await axios.get('http://localhost:5000/stats');
                setStats(response.data.stats);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };

        fetchStats();
    }, []);

    // Log stats in the body of the component to see updates
    // console.log("Current Stats:", stats);

    return (
        <div className="min-h-screen bg-gray-50  flex">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="dashboard" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-white shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 ">Pearl Travel Admin</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Primary Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Users"
                            value={stats.userCount}
                            subtitle="Registered clients"
                            icon="👥"
                            color="orange"
                        />
                        <StatCard
                            title="Active Programs"
                            value={stats.activePrograms}
                            subtitle={`of ${stats.totalPrograms} total packages`}
                            icon="🌍"
                            color="green"
                        />
                        <StatCard
                            title="Categories"
                            value={stats.categoriesCount}
                            subtitle="Tours & Services"
                            icon="🗂️"
                            color="purple"
                        />
                    </div>

                    {/* Geographical Distribution */}
                    <h2 className="text-lg font-semibold text-black mb-4">Program Distribution</h2>
                    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Domestic (Egypt)</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.egyptPrograms}</p>
                                </div>
                                <div className="text-3xl">🇪🇬</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">International / Outgoing</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.internationalPrograms}</p>
                                </div>
                                <div className="text-3xl">✈️</div>
                            </div>
                        </div>
                    </div>

                    {/* visa data */}
                    <h2 className="text-lg font-semibold text-black  mb-4">Visa Applications</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Visa Applications"
                            value={stats.visaApplications}
                            subtitle="All submitted applications"
                            icon="📝"
                            color="blue"
                        />
                        <StatCard
                            title="Pending Visa Applications"
                            value={stats.visaPending}
                            subtitle="Awaiting review"
                            icon="⏳"
                            color="orange"
                        />
                        <StatCard
                            title="Reviewed Visa Applications"
                            value={stats.visaReviewed}
                            subtitle="Completed reviews"
                            icon="✅"
                            color="green"
                        />
                    </div>

                    {/* flight data */}
                    <h2 className="text-lg font-semibold text-black  mb-4">Flight Submissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Flights"
                            value={stats.flightCount}
                            subtitle="All flights in system"
                            icon="✈️"
                            color="purple"
                        />

                        <StatCard
                            title="Pending Flights Review"
                            value={stats.pendingFlights}
                            subtitle="Flights awaiting review"
                            icon="⏳"
                            color="orange"
                        />
                        <StatCard
                            title="Reviewed Flights"
                            value={stats.reviewedFlights}
                            subtitle="Flights reviewed and approved"
                            icon="✅"
                            color="green"
                        />
                    </div>

                    {/* booked programs data */}
                    <h2 className="text-lg font-semibold text-black  mb-4">Booked Programs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Booked Programs"
                            value={stats.bookedCount}
                            subtitle={`All booked programs`}
                            icon="📅"
                            color="blue"

                        />
                        <StatCard
                            title="Pending Bookings"
                            value={stats.pendingBookings}
                            subtitle="Bookings awaiting approval"
                            icon="⏳"
                            color="orange"
                        />
                        <StatCard
                            title="Reviewed Bookings"
                            value={stats.reviewedBookings}
                            subtitle="Bookings approved and confirmed"
                            icon="✅"
                            color="green"
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: number
    subtitle: string
    icon: string
    color: 'blue' | 'green' | 'purple' | 'orange'
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {

    const colorClasses = {
        blue: `
        from-blue-500/20 to-blue-600/10 
        border-blue-300/40 
        hover:shadow-blue-500/30`,

        green: `
        from-emerald-500/20 to-green-600/10 
        border-emerald-300/40 
        hover:shadow-emerald-500/30`,

        purple: `
        from-purple-500/20 to-indigo-600/10 
        border-purple-300/40 
        hover:shadow-purple-500/30`,

        orange: `
        from-orange-500/20 to-amber-600/10 
        border-orange-300/40 
        hover:shadow-orange-500/30`,
    }

    return (
        <div
            className={`
            relative overflow-hidden
            bg-gradient-to-br ${colorClasses[color]}
            backdrop-blur-xl
            border
            rounded-2xl
            shadow-lg
            hover:shadow-2xl
            transition-all duration-500
            hover:-translate-y-1
            p-6
        `}
        >
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                        {title}
                    </p>

                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                        {value}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {subtitle}
                    </p>
                </div>

                <div className="
                    text-4xl
                    opacity-80
                    transition-all duration-500
                    group-hover:scale-110
                ">
                    {icon}
                </div>

            </div>

            {/* Glow Effect */}
            <div className="
                absolute -top-10 -right-10 w-32 h-32
                bg-white/10
                rounded-full blur-3xl
            "></div>
        </div>
    )

}