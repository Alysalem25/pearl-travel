'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/adminSidebar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface BookedProgram {
    _id: string
    userEmail: string
    userName?: string
    userNumber?: number
    status: 'pending' | 'reviewed'
    createdAt?: string
    programId: string
}

export default function BookedProgramsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <BookedProgramsPageContent />
        </ProtectedRoute>
    );
}

const BookedProgramsPageContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: booked = [], isLoading } = useQuery({
        queryKey: ['bookedPrograms'],
        queryFn: async () => (await api.bookings.getAll()).data
    })


    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.bookings.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookedPrograms'] })
    })

    const changeStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.bookings.changeStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookedPrograms'] })
    })

    return (
        <div className="min-h-screen flex bg-white text-black">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="Booked Programs" />

            <div className="flex-1">
                <header className="bg-white p-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Booked Programs</h1>
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
                    <h2 className="text-xl font-bold mb-4">Submitted Booked Programs ({booked.length})</h2>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {booked.map((f: any) => (
                                <div key={f._id} className={`p-4 border rounded flex justify-between items-center ${f.status === 'reviewed' ? 'bg-green-500' : 'bg-yellow-50'}`}>
                                    <div>
                                        <div className="font-semibold">{f.userName || f.userEmail}</div>
                                        <div className="text-sm text-gray-600">{f.userEmail} • {f.userNumber}</div>
                                        <div className="text-sm text-gray-700 mt-2">Program - {f.program?.titleEn} • {f.program?.titleAr}</div>
                                        <div className="text-sm text-gray-700 mt-2">Massage - {f.message}</div>
                                        <div className="text-xs text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => changeStatusMutation.mutate({ id: f._id, status: f.status === 'pending' ? 'reviewed' : 'pending' })} 
                                        className={` text-white px-3 py-1 rounded ${f.status === 'reviewed' ? 'bg-red-600' : 'bg-green-600'}`}>{f.status === 'pending' ? 'Review' : 'Pending'}</button>
                                   
                                        <button onClick={() => deleteMutation.mutate(f._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                                    </div>
                                </div>
                            ))}

                            {booked.length === 0 && (
                                <div className="text-gray-500">No booked programs submitted yet.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
