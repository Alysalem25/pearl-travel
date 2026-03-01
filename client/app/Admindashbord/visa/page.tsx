'use client'

import React, { useState, useEffect } from 'react'
import AdminSidebar from '@/components/adminSidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import apiClient from '@/lib/api'
import { Search, Filter, Eye, Edit2, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface VisaApplication {
    _id: string
    fullName: string
    email: string
    phone: string
    destination: string
    otherCountries: string
    hasTraveledAbroad: boolean
    visitedCountries: string
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_info'
    adminNotes: string
    submittedAt: string
    reviewedAt: string | null
}

interface VisaStats {
    total: number
    pending: number
    under_review: number
    approved: number
    rejected: number
    needs_info: number
}

export default function VisaPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <VisaPageContent />
        </ProtectedRoute>
    )
}

const VisaPageContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [visas, setVisas] = useState<VisaApplication[]>([])
    const [stats, setStats] = useState<VisaStats>({
        total: 0,
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        needs_info: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchEmail, setSearchEmail] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedVisa, setSelectedVisa] = useState<VisaApplication | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [showStatusForm, setShowStatusForm] = useState(false)
    const [newStatus, setNewStatus] = useState<VisaApplication['status']>('pending')
    const [adminNotes, setAdminNotes] = useState('')
    const [updating, setUpdating] = useState(false)

    // Fetch visas
    const fetchVisas = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.get('/visa')
            setVisas(response.data.data || [])
            calculateStats(response.data.data || [])
            console.log('Fetched visas:', response.data.data)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch visa applications')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }


    const calculateStats = (applications: VisaApplication[]) => {
        const newStats: VisaStats = {
            total: applications.length,
            pending: 0,
            under_review: 0,
            approved: 0,
            rejected: 0,
            needs_info: 0
        }

        applications.forEach(app => {
            newStats[app.status as keyof Omit<VisaStats, 'total'>]++
        })

        setStats(newStats)
    }

    useEffect(() => {
        fetchVisas()
    }, [])

    const handleViewDetails = (visa: VisaApplication) => {
        setSelectedVisa(visa)
        setNewStatus(visa.status)
        setAdminNotes(visa.adminNotes)
        setShowDetails(true)
    }

    const handleUpdateStatus = async () => {
        if (!selectedVisa) return

        try {
            setUpdating(true)
            await apiClient.put(`/visa/${selectedVisa._id}`, { status: newStatus, adminNotes })
            
            // Refresh list
            fetchVisas()
            setShowDetails(false)
            setShowStatusForm(false)
        } catch (err: any) {
            console.error('Update error:', err)
            alert(err.response?.data?.error || 'Failed to update application')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return

        try {
            await apiClient.delete(`/visa/${id}`)
            fetchVisas()
        } catch (err: any) {
            console.error('Delete error:', err)
            alert(err.response?.data?.error || 'Failed to delete application')
        }
    }

    // Filter visas
    const filteredVisas = visas.filter(visa => {
        const emailMatch = visa.email.toLowerCase().includes(searchEmail.toLowerCase())
        const statusMatch = filterStatus === 'all' || visa.status === filterStatus
        return emailMatch && statusMatch
    })

    const getStatusColor = (status: VisaApplication['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300'
            case 'under_review':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'needs_info':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    const getStatusIcon = (status: VisaApplication['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'rejected':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            case 'under_review':
            case 'needs_info':
                return <Clock className="w-5 h-5 text-yellow-600" />
            default:
                return <Clock className="w-5 h-5 text-gray-600" />
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="visa" />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white shadow">
                    <div className="p-4 sm:p-6 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Visa Applications</h1>
                        <div className="w-8" />
                    </div>
                </div>

                {/* Stats */}
                <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Total" value={stats.total} color="bg-gray-500" />
                    <StatCard label="Pending" value={stats.pending} color="bg-gray-400" />
                    <StatCard label="Under Review" value={stats.under_review} color="bg-blue-500" />
                    <StatCard label="Approved" value={stats.approved} color="bg-green-500" />
                    <StatCard label="Rejected" value={stats.rejected} color="bg-red-500" />
                    <StatCard label="Needs Info" value={stats.needs_info} color="bg-yellow-500" />
                </div>

                {/* Filters */}
                <div className="p-4 sm:p-6 bg-white mx-4 sm:mx-6 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="needs_info">Needs Info</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">Loading applications...</div>
                        </div>
                    ) : filteredVisas.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500 text-lg">No visa applications found</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Submitted</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredVisas.map((visa) => (
                                            <tr key={visa._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {visa.fullName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {visa.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {visa.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(visa.status)}`}>
                                                        {getStatusIcon(visa.status)}
                                                        {visa.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(visa.submittedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm gap-2 flex">
                                                    <button
                                                        onClick={() => handleViewDetails(visa)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleViewDetails(visa)
                                                            setShowStatusForm(true)
                                                        }}
                                                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                                                        title="Update Status"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(visa._id)}
                                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && selectedVisa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Application Details</h2>
                            <button
                                onClick={() => {
                                    setShowDetails(false)
                                    setShowStatusForm(false)
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <p className="mt-1 text-gray-900">{selectedVisa.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-gray-900">{selectedVisa.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="mt-1 text-gray-900">{selectedVisa.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Destinations */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVisa.destination && (
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {selectedVisa.destination}
                                        </span>
                                    )}
                                </div>
                                {selectedVisa.otherCountries && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700">Other Countries</label>
                                        <p className="mt-1 text-gray-900">{selectedVisa.otherCountries}</p>
                                    </div>
                                )}
                            </div>

                            {/* Travel History */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel History</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Traveled Abroad</label>
                                    <p className="mt-1 text-gray-900">{selectedVisa.hasTraveledAbroad ? 'Yes' : 'No'}</p>
                                </div>
                                {selectedVisa.visitedCountries && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700">Visited Countries</label>
                                        <p className="mt-1 text-gray-900">{selectedVisa.visitedCountries}</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Section */}
                            {showStatusForm ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value as VisaApplication['status'])}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-blue-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="needs_info">Needs Info</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                                            <textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                                placeholder="Add notes for this application..."
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end pt-4 border-t">
                                            <button
                                                onClick={() => setShowStatusForm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdateStatus}
                                                disabled={updating}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {updating ? 'Updating...' : 'Update Status'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Status</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        {getStatusIcon(selectedVisa.status)}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedVisa.status)}`}>
                                            {selectedVisa.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {selectedVisa.adminNotes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                                            <p className="mt-1 text-gray-900">{selectedVisa.adminNotes}</p>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t mt-4">
                                        <button
                                            onClick={() => setShowStatusForm(true)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Edit Status
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Submitted</label>
                                        <p className="text-sm text-gray-600">{formatDate(selectedVisa.submittedAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                        <p className="text-sm text-gray-600">{formatDate(selectedVisa.reviewedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">{label}</p>
            <p className={`text-3xl font-bold ${color} text-transparent bg-clip-text`} style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                <span className={`${color} bg-clip-text text-transparent`}>{value}</span>
            </p>
            <div className={`mt-2 h-1 ${color} rounded-full`} style={{ width: '100%' }} />
        </div>
    )
}
