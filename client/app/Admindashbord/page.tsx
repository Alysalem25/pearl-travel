'use client'

import React, { useState, useEffect } from 'react'
import AdminSidebar from '@/components/adminSidebar';
import axios from 'axios'

export default function AdminDashboard() {
    return (
        // It is recommended to uncomment this once your auth logic is ready
        // <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardContent />
       // {/* </ProtectedRoute> */}
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
        internationalPrograms: 0 // Renamed for better context
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="dashboard" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pearl Travel Admin</h1>
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
                            color="blue"
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program Distribution</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border-2 ${colorClasses[color]} p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    )
}