'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/adminSidebar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Day {
    dayNumber: number
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
}

interface Cruisies {
    _id: string
    titleEn: string
    titleAr: string
    category: 'Nile' | 'MSC' | 'Silversea' | 'Caribbean' | 'Norwegian'
    durationDays: number
    durationNights: number
    price: number
    descriptionEn: string
    descriptionAr: string
    itineraryEn: string
    itineraryAr: string
    status: 'active' | 'inactive'
    images?: string[]
    days?: Day[]
}

function CruisiesPageContent() {
    const queryClient = useQueryClient()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingCruisies, setEditingCruisies] = useState<Cruisies | null>(null)

    const [images, setImages] = useState<File[]>([])
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [error, setError] = useState('')

    const [days, setDays] = useState<Day[]>([
        {
            dayNumber: 1,
            titleEn: '',
            titleAr: '',
            descriptionEn: '',
            descriptionAr: '',
        },
    ])

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAr: '',
        category: 'Nile',
        durationDays: 1,
        durationNights: 0,
        price: 0,
        descriptionEn: '',
        descriptionAr: '',
        itineraryEn: '',
        itineraryAr: '',
        status: 'active',
    })

    // ================= FETCH =================

    const { data: cruisies = [] } = useQuery({
        queryKey: ['cruisies'],
        queryFn: async () =>
            (await api.cruisies.getAll()).data,
    })

    // ================= MUTATION =================
    const cruisiesMutation = useMutation({
        mutationFn: (payload: FormData) =>
            editingCruisies
                ? api.cruisies.update(editingCruisies._id, payload)
                : api.cruisies.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cruisies'] })
            alert(editingCruisies ? 'Cruisies updated ✅' : 'Cruisies added ✅')
            resetForm()
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message ?? error?.message ?? 'Something went wrong'
            setError(message)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            api.cruisies.delete(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['cruisies'] }),
    })

    // ================= HANDLERS =================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const fd = new FormData()

        Object.entries(formData).forEach(([key, value]) => {
            fd.append(key, String(value))
        })

        fd.append('days', JSON.stringify(days))

        images.forEach((img) => fd.append('images', img))

        cruisiesMutation.mutate(fd)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        const files = Array.from(e.target.files)

        setImages((prev) => [...prev, ...files])
        setPreviewImages((prev) => [
            ...prev,
            ...files.map((file) => URL.createObjectURL(file)),
        ])
    }

    const removePreviewImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPreviewImages((prev) => prev.filter((_, i) => i !== index))
    }

    const updateDay = (i: number, field: keyof Day, value: string) => {
        const copy = days.map((d, idx) =>
            idx === i ? { ...d, [field]: value } : d
        )
        setDays(copy)
    }

    const addDay = () => {
        setDays((prev) => [
            ...prev,
            {
                dayNumber: prev.length + 1,
                titleEn: '',
                titleAr: '',
                descriptionEn: '',
                descriptionAr: '',
            },
        ])
    }

    const removeDay = (i: number) => {
        setDays((prev) =>
            prev
                .filter((_, index) => index !== i)
                .map((d, idx) => ({ ...d, dayNumber: idx + 1 }))
        )
    }

    const resetForm = () => {
        setFormData({
            titleEn: '',
            titleAr: '',
            category: 'Nile',
            durationDays: 1,
            durationNights: 0,
            price: 0,
            descriptionEn: '',
            descriptionAr: '',
            itineraryEn: '',
            itineraryAr: '',
            status: 'active',
        })
        setImages([])
        setPreviewImages([])
        setDays([
            {
                dayNumber: 1,
                titleEn: '',
                titleAr: '',
                descriptionEn: '',
                descriptionAr: '',
            },
        ])
        setEditingCruisies(null)
        setShowForm(false)
    }

    // ================= UI =================
    return (
        <div className="min-h-screen flex bg-white text-black">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                active="cruisies"
            />

            <div className="flex-1">
                <header className="bg-white p-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Cruisies</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => (showForm ? resetForm() : setShowForm(true))}
                        className="bg-blue-600 px-4 py-2 rounded"
                    >
                        {showForm ? 'Cancel' : 'Add Cruisies'}
                    </button>
                </header>
                <hr />

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col bg-gray-300 m-6 p-6 rounded space-y-4"
                    >
                        {/* titles */}
                        <div className="flex w-full gap-6">

                            <input
                                placeholder="Title EN"
                                className="bg-white w-full input text-left p-2 rounded border border-gray-600"
                                value={formData.titleEn}
                                onChange={(e) =>
                                    setFormData({ ...formData, titleEn: e.target.value })
                                }
                                required
                            />

                            <input
                                placeholder="العنوان بالعربي"
                                className="bg-white w-full input text-right p-2 rounded border border-gray-600"
                                value={formData.titleAr}
                                onChange={(e) =>
                                    setFormData({ ...formData, titleAr: e.target.value })
                                }
                                required
                            />
                        </div>
                        {/* category & country */}
                        <div className="flex w-full gap-6">

                            <select className="bg-white w-full p-2 rounded border border-gray-600" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                <option value="">Select Category</option>
                                <option value="Nile">Nile</option>
                                <option value="MSC">MSC</option>
                                <option value="Silversea">Silversea</option>
                                <option value="Caribbean">Caribbean</option>
                                <option value="Norwegian">Norwegian</option>
                            </select>


                        </div>
                        <div className="flex gap-6">
                            <label className=" gap-6 w-full">
                                Duration days
                                <input type="number" placeholder="Days"  className="bg-white p-2 rounded border border-gray-600 w-full" value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) })} required />
                            </label>
                            <label className=" gap-2 w-full">
                                Duration nights
                                <input type="number" placeholder="Nights" className="bg-white p-2 rounded border border-gray-600 w-full" value={formData.durationNights} onChange={e => setFormData({ ...formData, durationNights: parseInt(e.target.value) })} required />
                            </label>
                        </div>

                        {/* <input type="number" placeholder="Price" className="bg-white p-2 rounded border border-gray-600" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} required /> */}

                        <textarea placeholder="Description (EN)"
                            className="bg-white p-2 rounded border border-gray-600 w-full h-20"
                            value={formData.descriptionEn}
                            onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} />
                        <textarea placeholder="التفاصيل بالعربي"
                            className="bg-white p-2 rounded border border-gray-600 w-full h-20 text-right"
                            value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} />



                        {/* images */}
                        <input type="file" multiple onChange={handleImageChange} />

                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {previewImages.map((src, i) => (
                                    <div key={i} className="relative">
                                        <img src={src} className="rounded h-32 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePreviewImage(i)}
                                            className="absolute top-1 right-1 bg-red-600 px-2 text-xs rounded"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* days */}
                        <h3 className="font-bold">Days</h3>

                        {days.map((day, i) => (
                            <div key={i} className="border p-4 rounded space-y-2 align-middle">
                                <h4>Day {day.dayNumber}</h4>

                                <div className="flex w-full gap-6">
                                    <input
                                        placeholder="Title EN"
                                        value={day.titleEn}
                                        className="bg-white w-full input text-left p-2 rounded border border-gray-600"
                                        onChange={(e) =>
                                            updateDay(i, 'titleEn', e.target.value)
                                        }
                                    />

                                    <input
                                        placeholder="العنوان بالعربي"
                                        value={day.titleAr}
                                        className="bg-white w-full input text-right p-2 rounded border border-gray-600"
                                        onChange={(e) =>
                                            updateDay(i, 'titleAr', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex w-full flex-col gap-2">
                                    <textarea
                                        placeholder="Description EN"
                                        value={day.descriptionEn}
                                        className="bg-white  input text-left p-2 rounded border border-gray-600"
                                        onChange={(e) =>
                                            updateDay(i, 'descriptionEn', e.target.value)
                                        }
                                    />

                                    <textarea
                                        placeholder="الوصف بالعربي"
                                        value={day.descriptionAr}
                                        className="bg-white input text-right p-2 rounded border border-gray-600"
                                        onChange={(e) =>
                                            updateDay(i, 'descriptionAr', e.target.value)
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeDay(i)}
                                    className="text-red-500"
                                >
                                    Remove Day
                                </button>
                            </div>
                        ))}

                        <button type="button" onClick={addDay}>
                            ➕ Add Day
                        </button>

                        <button type="submit" className="w-full bg-green-600 py-3 rounded">
                            Save Cruisies
                        </button>
                    </form>
                )}

                <div className="m-6 p-6 bg-gray-300 rounded">
                    <h2 className="text-xl font-bold mb-4">Available Cruisies ({cruisies.length})</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {cruisies.map((c: Cruisies) => (
                            <div key={c._id}
                                onClick={() => window.location.href = `/Admindashbord/cruisies/${c._id}`}
                                className="bg-gray-800 p-4 text-white    rounded border border-gray-700 flex justify-between items-center hover:border-blue-500">
                                <div>
                                    <h3 className="text-lg font-bold">{c.titleEn} / {c.titleAr}</h3>
                                    <p className="text-sm text-gray-400">{c.durationDays} Days - {c.category} - ${c.price}</p>
                                    <span className={`text-xs px-2 py-1 rounded ${c.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        // populate form and show it
                                        setEditingCruisies(c as Cruisies);
                                        setFormData({
                                            titleEn: c.titleEn,
                                            titleAr: c.titleAr,
                                            category: c.category,
                                            durationDays: c.durationDays,
                                            durationNights: c.durationNights,
                                            price: c.price,
                                            descriptionEn: c.descriptionEn,
                                            descriptionAr: c.descriptionAr,
                                            itineraryEn: c.itineraryEn || '',
                                            itineraryAr: c.itineraryAr || '',
                                            status: c.status,
                                        });
                                        setDays(c.days || []);
                                        setPreviewImages(c.images || []);
                                        setShowForm(true);
                                    }} className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-700">Edit</button>

                                    <button onClick={(e) => {
                                        e.stopPropagation(); // STOP link navigation
                                        e.preventDefault(); // STOP link navigation
                                        deleteMutation.mutate(c._id)
                                    }} className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CruisiesPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <CruisiesPageContent />
        </ProtectedRoute>
    )
}
