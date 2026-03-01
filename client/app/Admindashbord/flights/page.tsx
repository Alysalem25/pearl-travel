'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/adminSidebar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Flight {
    _id: string
    userEmail: string
    userName?: string
    userNumber?: number
    from?: string
    to?: string
    status: 'pending' | 'reviewed'
    createdAt?: string
    reviewedBy?: string
}

export default function FlightsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <FlightsPageContent />
        </ProtectedRoute>
    );
}

const FlightsPageContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    // const [reviewedBy, setReviewedBy] = useState<Record<string, string>>({});
    const queryClient = useQueryClient()

    const { data: flights = [], isLoading } = useQuery({
        queryKey: ['flights'],
        queryFn: async () => (await api.flights.getAll()).data
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.flights.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flights'] })
    })

    const changeStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string}) => api.flights.changeStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flights'] })
    })

    return (
        <div className="min-h-screen flex bg-white text-black">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="Flights" />

            <div className="flex-1">
                <header className="bg-white p-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Flights</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <hr className="border-gray-300" />

                <div className="m-6 p-6">
                    <h2 className="text-xl font-bold mb-4">Submitted Flights ({flights.length})</h2>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {flights.map((f: Flight) => (
                                <div key={f._id} className={`p-4 border rounded flex justify-between items-center ${f.status === 'reviewed' ? 'bg-green-500' : 'bg-yellow-50'}`}>
                                    <div>
                                        <div className="font-semibold">{f.userName || f.userEmail}</div>
                                        <div className="text-sm text-gray-600">{f.userEmail} • {f.userNumber}</div>
                                        <div className="text-sm text-gray-700 mt-2">From: <span className="font-medium">{f.from || '—'}</span> — To: <span className="font-medium">{f.to || '—'}</span></div>
                                        <div className="text-xs text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</div>
                                        {f.status === "reviewed" && (
                                            <div className="text-xs text-green-600">
                                                Reviewed by: {f.reviewedBy}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                              
                                        
                                            <button type='submit' onClick={() => changeStatusMutation.mutate({
                                                id: f._id,
                                                status: f.status === "pending" ? "reviewed" : "pending",
                                            })}
                                                className={` text-white px-3 py-1 rounded ${f.status === 'reviewed' ? 'bg-red-600' : 'bg-green-600'}`}>{f.status === 'reviewed' ? 'Pending' : 'Review'}</button>

                                        <button onClick={() => deleteMutation.mutate(f._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                                    </div>
                                </div>
                            ))}

                            {flights.length === 0 && (
                                <div className="text-gray-500">No flights submitted yet.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
