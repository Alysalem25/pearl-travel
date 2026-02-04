'use client'

import React, { useState } from 'react'
import axios from 'axios'
import AdminSidebar from '@/components/adminSidebar'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Category {
    _id: string
    nameEn: string
    nameAr: string
    type: 'Incoming' | 'outgoing' | 'Domestic' | 'Educational' | 'Corporate'
    country: string
    images: string[]
    isActive: boolean
}

const CategoriesPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [images, setImages] = useState<File[]>([])
    const [previewImages, setPreviewImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        nameEn: '',
        nameAr: '',
        type: '',
        country: 'Egypt',
        images: '',
        isActive: true
    })

    const queryClient = useQueryClient()

    // ================= FETCH =================
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await axios.get('http://localhost:5000/categories')).data
    })

    // ================= MUTATION =================
    const categoryMutation = useMutation({
        mutationFn: (payload: typeof formData) =>
            editingCategory
                ? axios.put(`http://localhost:5000/categories/${editingCategory._id}`, payload)
                : axios.post('http://localhost:5000/categories', payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            alert(editingCategory ? 'Category updated!' : 'Category added!')
            resetForm()
        },

        onError: (error: any) =>
            alert(error.response?.data?.error || 'Error')
    })


    const deleteMutation = useMutation({
        mutationFn: (id: string) => axios.delete(`http://localhost:5000/categories/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
    })


    // ================= HANDLERS =================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()





        try {
            if (editingCategory) {
                // If a new image was selected while editing, upload it first
                if (images.length > 0) {
                    const imgForm = new FormData();
                    imgForm.append('images', images[0]);
                    await axios.post(`http://localhost:5000/categories/${editingCategory._id}/images`, imgForm);
                }

                await axios.put(`http://localhost:5000/categories/${editingCategory._id}`, {
                    nameEn: formData.nameEn,
                    nameAr: formData.nameAr,
                    type: formData.type,
                    country: formData.country,
                    isActive: formData.isActive
                });

                alert('Category updated!');
            } else {
                const data = new FormData();
                data.append('nameEn', formData.nameEn);
                data.append('nameAr', formData.nameAr);
                data.append('type', formData.type);
                data.append('country', formData.country);
                data.append('isActive', String(formData.isActive));
                if (images.length > 0) data.append('images', images[0]);

                await axios.post('http://localhost:5000/categories', data);
                alert('Category added!');
            }

            queryClient.invalidateQueries({ queryKey: ['categories'] });
            resetForm();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error');
        }
    }




    const resetForm = () => {
        setFormData({
            nameEn: '',
            nameAr: '',
            type: '',
            country: 'Egypt',
            images: '',
            isActive: true
        })
        setImages([])
        setPreviewImages([])
        setEditingCategory(null)
        setShowForm(false)
    }

    const startEdit = (c: Category) => {
        setEditingCategory(c)
        setFormData({
            nameEn: c.nameEn,
            nameAr: c.nameAr,
            type: c.type,
            country: c.country,
            images: '',
            isActive: c.isActive
        })

        // show existing images from server
        setImages([])
        setPreviewImages((c.images || []).map(img => `http://localhost:5000/uploads/categories/${img}`))

        setShowForm(true)
    }
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        const file = e.target.files[0]
        if (!file) return

        setImages([file])
        setPreviewImages([URL.createObjectURL(file)])
    }

    const removePreviewImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPreviewImages((prev) => prev.filter((_, i) => i !== index))
    }
    // ================= UI =================
    return (
        <div className="min-h-screen flex bg-gray-900 text-white">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} active="programs" />

            <div className="flex-1">
                <header className="bg-gray-800 p-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Program Management</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                        className="bg-blue-600 px-4 py-2 mx-4 rounded"
                    >
                        {showForm ? 'Cancel' : 'Add Program'}
                    </button>
                </header>

                {showForm && (
                    <div className="bg-gray-800 m-6 p-6 rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* TEXT INPUTS (UNCHANGED) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Name (EN)"
                                    className="bg-gray-700 p-2 rounded border border-gray-600"
                                    value={formData.nameEn}
                                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                    required
                                />

                                <input
                                    placeholder="Name (AR)"
                                    className="bg-gray-700 p-2 rounded border border-gray-600 text-right"
                                    value={formData.nameAr}
                                    onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                                    required
                                />

                                <select className="bg-gray-700 p-2 rounded border border-gray-600" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value as any })}>
                                    <option value="Egypt">Egypt</option>
                                    <option value="Albania">Albania</option>
                                </select>

                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    className="bg-gray-700 p-2 rounded border border-gray-600"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Incoming">Incoming</option>
                                    <option value="outgoing">Outgoing</option>
                                    <option value="Domestic">Domestic</option>
                                    <option value="Educational">Educational</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>
                                                    {/* images */}
                        <input type="file" accept="image/*" onChange={handleImageChange} />

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
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={formData.isActive === true} onChange={() => setFormData({ ...formData, isActive: true })} /> Active
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={formData.isActive === false} onChange={() => setFormData({ ...formData, isActive: false })} /> Inactive
                                </label>
                            </div>

                            <button type="submit" disabled={!formData.type}
                                className="w-full bg-green-600 py-3 rounded">
                                {editingCategory ? 'Update Category' : 'Save Category'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="m-6 p-6">
                    <h2 className="text-xl font-bold mb-4">Available Categories ({categories.length})</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((p: Category) => (
                            <div key={p._id}
                                onClick={() => window.location.href = `/Admindashbord/programs/${p._id}`}
                                className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center hover:border-blue-500">
                                <div>
                                    <h3 className="text-lg font-bold">{p.nameEn} / {p.nameAr}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => {
                                        e.stopPropagation(); // STOP link navigation
                                        e.preventDefault(); // STOP link navigation
                                        startEdit(p)
                                    }} className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-700">Edit</button>

                                    <button onClick={(e) => {
                                        e.stopPropagation(); // STOP link navigation
                                        e.preventDefault(); // STOP link navigation
                                        deleteMutation.mutate(p._id)
                                    }} className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        </div >
    )
}

export default CategoriesPage
