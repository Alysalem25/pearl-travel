'use client'

import React, { useState } from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer';
import axios from "axios";
// import { api } from "@/lib/api";

interface HotelBookingData {
    country: string;
    city: string;
    hotelName: string;
    fromDate: string;
    toDate: string;

    adults: number;
    children: number;
    childrenAges: number[];
    infants: number;

    userName: string;
    userEmail: string;
    userPhone: string;
    remarks: string;
}

const Page = () => {

    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState<HotelBookingData>({
        country: '',
        city: '',
        hotelName: '',
        fromDate: '',
        toDate: '',

        adults: 1,
        children: 0,
        childrenAges: [],
        infants: 0,

        userName: '',
        userEmail: '',
        userPhone: '',
        remarks: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    // Handle children count change
    const handleChildrenChange = (value: number) => {
        setFormData(prev => ({
            ...prev,
            children: value,
            childrenAges: Array(value).fill(0)
        }));
    };

    const handleChildAgeChange = (index: number, age: number) => {
        const updatedAges = [...formData.childrenAges];
        updatedAges[index] = age;

        setFormData(prev => ({
            ...prev,
            childrenAges: updatedAges
        }));
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.country ||
            !formData.city ||
            !formData.hotelName ||
            !formData.fromDate ||
            !formData.toDate
        ) {
            setError("Please fill all hotel details");
            return;
        }

        setError("");
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await axios.post("http://localhost:5000/hotelBooking", formData);

        alert("Hotel Booking Submitted!");
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 min-h-screen">
                <h1 className="text-3xl font-bold text-center mb-8">Hotel Booking</h1>


                <h2 className="text-xl font-semibold text-blue-700">
                    Step 1: Hotel Details
                </h2>
                {step === 1 ? (
                    <form onSubmit={handleNextStep}
                        className="space-y-6 border-2 border-gray-200 rounded-lg shadow-lg p-6">

                        {error && <div className="text-red-500">{error}</div>}

                        <div>
                            <label className="text-black font-bold">
                                Country
                            </label>
                            <input type="text" name="country" placeholder="Country"
                                value={formData.country}
                                onChange={handleChange}
                                className="input-style text-black border-2 border-gray-200 rounded-md" required />
                        </div>

                        <div>

                            <label className="text-black font-bold">
                                City
                            </label>
                            <input type="text" name="city" placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                className="input-style text-black border-2 border-gray-200 rounded-md" required />
                        </div>

                        <div>
                            <label className="text-black font-bold">
                                Hotel Name
                            </label>
                            <input type="text" name="hotelName" placeholder="Hotel Name"
                                value={formData.hotelName}
                                onChange={handleChange}
                                className="input-style text-black border-2 border-gray-200 rounded-md" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-black font-bold">
                                From Date
                                <input type="date" name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    className="input-style text-black border-2 border-gray-200 rounded-md" required />
                            </label>

                            <label className="text-black font-bold">
                                To Date
                                <input type="date" name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    className="input-style text-black border-2 border-gray-200 rounded-md" required />
                            </label>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <input type="number" name="adults" min={1}
                                value={formData.adults}
                                onChange={handleChange}
                                className="input-style text-black border-2 border-gray-200 rounded-md"
                                placeholder="Adults" />

                            <label className="text-black font-bold">
                                Children
                                <input type="number" min={0}
                                    value={formData.children}
                                    onChange={(e) => handleChildrenChange(parseInt(e.target.value))}
                                    className="input-style text-black border-2 border-gray-200 rounded-md"
                                    placeholder="Children" />
                            </label>

                            <label className="text-black font-bold">
                                Infants
                                <input type="number" name="infants" min={0}
                                    value={formData.infants}
                                    onChange={handleChange}
                                    className="input-style text-black border-2 border-gray-200 rounded-md"
                                    placeholder="Infants" />
                            </label>
                        </div>

                        {/* Children Ages */}
                        {formData.children > 0 && (
                            <div>
                                <h3 className="font-semibold text-black font-bold">Children Ages</h3>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {formData.childrenAges.map((age, index) => (
                                        <input
                                            key={index}
                                            type="number"
                                            min={0}
                                            max={17}
                                            placeholder={`Child ${index + 1} Age`}
                                            value={age}
                                            onChange={(e) =>
                                                handleChildAgeChange(index, parseInt(e.target.value))
                                            }
                                            className="input-style text-black border-2 border-gray-200 rounded-md"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md">
                            Continue to Personal Details
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}
                        className="space-y-6 border-2 border-gray-200 rounded-lg shadow-lg p-6">

                        <h2 className="text-xl font-semibold text-blue-700">
                            Step 2: Personal Details
                        </h2>

                        <input type="text" name="userName"
                            placeholder="Full Name"
                            value={formData.userName}
                            onChange={handleChange}
                            className="input-style text-black border-2 border-gray-200 rounded-md" required />

                        <input type="email" name="userEmail"
                            placeholder="Email"
                            value={formData.userEmail}
                            onChange={handleChange}
                            className="input-style text-black border-2 border-gray-200 rounded-md" required />

                        <input type="tel" name="userPhone"
                            placeholder="Phone"
                            value={formData.userPhone}
                            onChange={handleChange}
                            className="input-style text-black border-2 border-gray-200 rounded-md " required />

                        <textarea name="remarks"
                            placeholder="Remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="input-style text-black border-2 border-gray-200 rounded-md" />

                        <div className="flex gap-4">
                            <button type="button"
                                onClick={() => setStep(1)}
                                className="w-1/2 bg-gray-300 py-2 rounded-md">
                                Back
                            </button>

                            <button type="submit"
                                className="w-1/2 bg-green-600 text-white py-2 rounded-md">
                                Submit Booking
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Page;