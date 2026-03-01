// 'use client'

// import React, { useState } from "react";
// import Navbar from '@/components/Navbar';
// import Footer from '@/components/footer'
// import { Language, getDirection } from "@/lib/language";

// interface trip {
//     _id: string;
//     from: String,
//     to: String,
//     date: '',
//     returnDate: '',
//     isReturn:false,
//     userEmail: String,
//     userName: String,
//     userNumber: number,
//     numOfAdults: 1,
//     numOfLuggage: 0,
//     remarks: String,
// }

// const Page = () => {
//   const [lang] = useState<Language>("en");

//   const [step, setStep] = useState<1 | 2>(1);

//   const [formData, setFormData] = useState({
//     from: '',
//     to: '',
//     date: '',
//     returnDate: '',
//     isReturn:false,
//     userEmail: '',
//     userName: '',
//     userNumber: '',
//     numOfAdults: 1,
//     numOfLuggage: 0,
//     remarks: '',
//   });



//   return (
//     <div dir={getDirection(lang)} className="bg-white min-h-screen">
//       <Navbar />

//       <div className="max-w-2xl mx-auto p-6 min-h-screen">
//         <h1 className="text-3xl font-bold text-center mb-8">Car Rental</h1>

//         {step === 1 ? (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 From
//               </label>
//               <input
//                 type="text"
//                 name="from"
//                 value={formData.from}
//                 onChange={(e) => setFormData(prev=>({...prev, from: e.target.value}))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 To
//               </label>
//               <input
//                 type="text"
//                 name="to"
//                 value={formData.to}
//                 onChange={(e) => setFormData(prev=>({...prev, to: e.target.value}))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Start (date & time)
//               </label>
//               <input
//                 type="datetime-local"
//                 name="startDateTime"
//                 value={formData.date}
//                 onChange={(e) => setFormData(prev=>({...prev, date: e.target.value}))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Return (date & time)
//               </label>
//               <input
//                 type="datetime-local"
//                 name="returnDateTime"
//                 value={formData.returnDate}
//                 onChange={(e) => setFormData(prev=>({...prev, returnDate: e.target.value}))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
//             >
//               Continue
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleDetailsSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={details.name}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={details.email}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={details.phone}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Number of passengers
//               </label>
//               <input
//                 type="number"
//                 name="passengers"
//                 min={1}
//                 value={details.passengers}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Number of luggage items
//               </label>
//               <input
//                 type="number"
//                 name="luggage"
//                 min={0}
//                 value={details.luggage}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Remarks
//               </label>
//               <textarea
//                 name="remarks"
//                 value={details.remarks}
//                 onChange={handleDetailsChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//                 rows={3}
//               ></textarea>
//             </div>

//             <div className="flex justify-between">
//               <button
//                 type="button"
//                 onClick={() => setStep(1)}
//                 className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
//               >
//                 Back
//               </button>
//               <button
//                 type="submit"
//                 className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
//               >
//                 Submit
//               </button>
//             </div>
//           </form>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Page;



'use client'

import React, { useState } from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer'
import { Language, getDirection } from "@/lib/language";
import Image from "next/image";
import axios from "axios";

// Corrected Interface
interface TripData {
  from: string;
  to: string;
  date: string;
  returnDate: string;
  isReturn: boolean;
  userEmail: string;
  userName: string;
  userNumber: string;
  numOfAdults: number;
  numOfLuggage: number;
  remarks: string;
  carType: string;
}

const Page = () => {
  const [lang] = useState<Language>("en");
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string>("");

  // Single state for the whole form
  const [formData, setFormData] = useState<TripData>({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    isReturn: false,
    userEmail: '',
    userName: '',
    userNumber: '',
    numOfAdults: 1,
    numOfLuggage: 0,
    remarks: '',
    carType: '',
  });

  // Universal handler for all text, email, tel, and textarea inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.carType === "") {
      setError("Please select a car type");
      return;
    }
    if (formData.from === "" || formData.to === "" || formData.date === "" || formData.returnDate === "" || formData.userEmail === "" || formData.userName === "" || formData.userNumber === "" || formData.numOfAdults === 0 || formData.numOfLuggage === 0 || formData.remarks === "") {
      setError("Please fill all the fields");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Final Trip Data:", formData);
    axios.post("http://localhost:5000/carTrip", formData)
    alert("Trip Submitted! Check console for data.");
  };

  return (
    <div dir={getDirection(lang)} className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8">Car Rental</h1>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-6  border-2 border-gray-200 rounded-lg shadow-lg p-6">
            {error && <div className="text-red-500">{error}</div>}
            <h2 className="text-xl font-semibold text-blue-700">Step 1: Route Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">From (Pickup)</label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">To (Drop-off)</label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                required
              />
            </div>
            <div className="flex justify-between">
              {/* premium car or normal car */}
              {/* <label className="block text-sm font-medium text-gray-700">Car Type</label> */}

              <input type="radio" id="Premium" onChange={handleChange} name="carType" value="Premium" />
              <label htmlFor="Premium" className="flex items-center flex-col text-black" >
                <Image src="/car-wash.png" alt="Premium" width={150} height={150} className=" grayscale hover:grayscale-0  transition-all duration-300 " />
                Premium Car</label><br />
              <input type="radio" id="Normal" onChange={handleChange} name="carType" value="Normal" />
              <label htmlFor="Normal" className="flex items-center flex-col text-black" >
                <Image src="/car.png" alt="Normal" width={150} height={150} className=" grayscale hover:grayscale-0 transition-all duration-300 " />
                Normal Car</label><br />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  required
                />
              </div>



              <div className="flex items-center mt-2 ">
                <label className="inline text-sm font-medium text-gray-700 ">Is Return</label>
                <input type="checkbox" className="ml-2" id="isReturn" name="isReturn" value="" onClick={() => setFormData(prev => ({ ...prev, isReturn: !prev.isReturn }))} />

              </div>

              {formData.isReturn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Continue to Personal Details
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6 border-2 border-gray-200 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-blue-700">Step 2: Personal Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="userNumber"
                value={formData.userNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Passengers</label>
                <input
                  type="number"
                  name="numOfAdults"
                  min={1}
                  value={formData.numOfAdults}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Luggage</label>
                <input
                  type="number"
                  name="numOfLuggage"
                  min={0}
                  value={formData.numOfLuggage}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                rows={3}
              ></textarea>
            </div>

            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 p-4"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 p-4"
              >
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