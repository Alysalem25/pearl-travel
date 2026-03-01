// 'use client'

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import axios from "axios";
// import Navbar from '@/components/Navbar';
// import CountryHero from '@/components/country-hero';
// import Footer from '@/components/footer'
// import { motion } from "framer-motion";
// import { Language, getDirection, getLanguageFromSearchParams } from "@/lib/language";
// import SearchableDropdown from "@/components/SearchableDropdown";

// interface Flights {
//     _id: string;
//     userEmail: string;
//     userName: string;
//     userNumber: number;
//     from: string;
//     to: string;
// }

// const Page = () => {
//     const searchParams = useSearchParams();
//     const router = useRouter();
//     const [lang, setLang] = useState<Language>("en");
//     const [mounted, setMounted] = useState(false);
//     const [fromCountries, setFromCountriess] = useState<any[]>([]);
//     const [toCountries, setToCountries] = useState<any[]>([]);
//     const [fromCountry, setFromCountry] = useState("");
//     const [toCountry, setToCountry] = useState("");
//     const [flights, setFlights] = useState<Flights[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [successMessage, setSuccessMessage] = useState("");
//     const [formData, setFormData] = useState({
//         userEmail: "",
//         userName: "",
//         userNumber: 0,
//         from: "",
//         to: ""
//     });

//     useEffect(() => {
//         setMounted(true);
//         setLang(getLanguageFromSearchParams(searchParams));
//     }, [searchParams]);

//     useEffect(() => {
//         fetchFromCountries();
//         fetchToCountries();
//     }, []);


//     const fetchFromCountries = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.get(`https://www.airportroutes.com/api/all-airports/`);
//             setFromCountriess(res.data);
//             console.log("From Countries:", res.data);
//         } catch (err) {
//             console.error("Error fetching from countries:", err);
//         } finally {
//             setLoading(false);
//         }

//     }

//     const fetchToCountries = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.get(`http://localhost:5000/countries/inToCountry`);
//             setToCountries(res.data);
//         } catch (err) {
//             console.error("Error fetching to countries:", err);
//         } finally {
//             setLoading(false);
//         }
//     }

//     const submitFlighte = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.post(
//                 `http://localhost:5000/flights`,
//                 {
//                     userEmail: formData.userEmail,
//                     userName: formData.userName,
//                     userNumber: formData.userNumber,
//                     from: formData.from,
//                     to: formData.to
//                 }
//             );
//             setSuccessMessage("Flight booked successfully");
//             // clear form
//             setFormData({ userEmail: "", userName: "", userNumber: 0, from: "", to: "" });
//             setFromCountry("");
//             setToCountry("");
//             setTimeout(() => setSuccessMessage(""), 4000);

//         } catch (err) {
//             console.error("Error submitting flight", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!mounted) return null;

//     const data = {
//         en: {
//             title: "Flights",
//             description: "Choose department and destination airports or type to search"
//         },
//         ar: {
//             title: "الرحلات",
//             description: "اختر مطار المغادرة والوصول أو اكتب للبحث"
//         },
//     };

//     const container = {
//         hidden: { opacity: 0 },
//         show: {
//             opacity: 1,
//             transition: { staggerChildren: 0.15 },
//         },
//     };

//     const item = {
//         hidden: { opacity: 0, y: 30 },
//         show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
//     };

//     // if (categories.length === 0) {
//     //     return (
//     //         <div dir={getDirection(lang)} className="bg-white min-h-screen">
//     //             <Navbar />
//     //             <div className="flex text-center mt-72 text-gray-500">
//     //                 <p>
//     //                     No categories available for this country.
//     //                 </p>
//     //             </div>
//     //         </div>
//     //     );
//     // }
//     function filterFunction1() {
//         const input = document.getElementById("myInput") as HTMLInputElement;
//         if (!input) return;
//         const filter = input.value.toUpperCase();
//         const div = document.getElementById("myDropdown");
//         if (!div) return;
//         const a = div.getElementsByTagName("p");
//         for (let i = 0; i < a.length; i++) {
//             const txtValue = a[i].textContent || a[i].innerText;
//             if (txtValue.toUpperCase().indexOf(filter) > -1) {
//                 a[i].style.display = "";
//             } else {
//                 a[i].style.display = "none";
//             }
//         }
//     }
//     function filterFunction2() {
//         const input = document.getElementById("myInput2") as HTMLInputElement;
//         if (!input) return;
//         const filter = input.value.toUpperCase();
//         const div = document.getElementById("myDropdown2");
//         if (!div) return;
//         const a = div.getElementsByTagName("p");
//         for (let i = 0; i < a.length; i++) {
//             const txtValue = a[i].textContent || a[i].innerText;
//             if (txtValue.toUpperCase().indexOf(filter) > -1) {
//                 a[i].style.display = "";
//             } else {
//                 a[i].style.display = "none";
//             }
//         }
//     }
//     return (
//         <div dir={getDirection(lang)} className="bg-white min-h-screen"
//         >
//             <Navbar />

//             <div className="flex justify-center">
//                 <div
//                     className="
// w-full  max-w-7xl min-h-[750px] flex flex-col justify-between rounded-3xl shadow-2xl 
//     backdrop-blur-xl
//     bg-white/80
//     border border-gray-200
//     p-8
//     "
//                     style={{
//                         marginTop:"100px",
//                         // padding: "4rem",
//                         backgroundImage: `
//       linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)),
//       url(/airport-transfer.webp)
//     `,
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                     }}
//                 >               <motion.h1
//                     variants={item}
//                     className="text-3xl font-bold text-start mt-10 text-black"
//                 >
//                         {data[lang].title}
//                     </motion.h1>
//                     <motion.p
//                         variants={item}
//                         className="text-start mt-4 text-black text-lg max-w-xl mx-auto"
//                     >
//                         {data[lang].description}
//                     </motion.p>
//                     {/* </motion.div> */}

//                     <form className="
//     w-full
//     mt-52
//     p-8
//     m
//     bg-white/95
//     backdrop-blur-xl
//     rounded-2xl
//     shadow-xl
//     border border-gray-100
//   " onSubmit={(e) => {
//                             e.preventDefault();
//                             submitFlighte();
//                         }}

//                     >
//                         {successMessage && (
//                             <div className="mb-4 p-3 rounded bg-green-100 border border-green-300 text-green-800 flex justify-between items-center">
//                                 <span>{successMessage}</span>
//                                 <button type="button" onClick={() => setSuccessMessage("")} className="ml-4 text-green-700 font-bold">✕</button>
//                             </div>
//                         )}
//                         <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <div className="mb-4">
//                                 <label className="block text-black mb-2">Email</label>
//                                 <input
//                                     type="email"
//                                     className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring  border-gray-800  focus:border-gray-950"
//                                     value={formData.userEmail}
//                                     onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-black mb-2">Name</label>
//                                 <input
//                                     type="text"
//                                     className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring border-gray-800  focus:border-gray-950"
//                                     value={formData.userName}
//                                     onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-black mb-2">Phone Number</label>
//                                 <input
//                                     type="tel"
//                                     className="text-black w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring  border-gray-800  focus:border-gray-950"
//                                     value={formData.userNumber}
//                                     onChange={(e) => setFormData({ ...formData, userNumber: parseInt(e.target.value) })}
//                                     required
//                                 />
//                             </div>
//                         </div>
//                         <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <SearchableDropdown
//                                 items={fromCountries}
//                                 value={formData.from}
//                                 onChange={(id, label) => { setFormData({ ...formData, from: id }); if (label) setFromCountry(label); }}
//                                 placeholder="From Country"
//                             />

//                             <SearchableDropdown
//                                 items={toCountries}
//                                 value={formData.to}
//                                 onChange={(id, label) => { setFormData({ ...formData, to: id }); if (label) setToCountry(label); }}
//                                 placeholder="To Country"
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
//                             disabled={loading}
//                         >
//                             {loading ? "Submitting..." : "Submit Flight"}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//             <div className="fixed bottom-0 w-full">
//                 <Footer />
//             </div>
//         </div>
//     );
// };

// export default Page;
'use client'

import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { setFips } from "crypto";
import { useState, useEffect } from "react";
import AirportDropdown from "@/components/SearchableDropdown"

export default function FlightSearch() {

    const [tripType, setTripType] = useState("round");
    const [userInfoForm, setUserInfoForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [fromCountries, setFromCountriess] = useState<any[]>([]);
    const [toCountries, setToCountries] = useState([]);
    const [fromCountry, setFromCountry] = useState("");
    const [formData, setFormData] = useState({
        userEmail: "",
        userName: "",
        userNumber: "",
        from: "",
        to: "",
        date: "",
        returnDate: "",
        tripType: "round",
        numOfAdults: 1,
        numOfChildren: 0,
        cabinClass: "economy",
        multiCities: [
            { from: "", to: "", date: "" },
            { from: "", to: "", date: "" },
        ],
    });


    // useEffect(() => {
    //     setMounted(true);
    //     setLang(getLanguageFromSearchParams(searchParams));
    // }, [searchParams]);

    useEffect(() => {
        fetchFromCountries();
        // fetchToCountries();
    }, []);


    const fetchFromCountries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`https://www.airportroutes.com/api/all-airports/`);
            setFromCountriess(res.data);
            console.log("From Countries:", res.data);
        } catch (err) {
            console.error("Error fetching from countries:", err);
        } finally {
            setLoading(false);
        }

    }



    const handelValidation = () => {
        if (tripType === "round") {
            if (!formData.from) {
                setError("from is required");
                return false;
            }
            if (!formData.to) {
                setError("to is required");
                return false;
            }
            if (!formData.date) {
                setError("depart date is required");
                return false;
            }
            if (!formData.returnDate) {
                setError("return date is required");
                return false;
            }
        }
        if (tripType === "oneway") {
            if (!formData.from || !formData.to || !formData.date) {
                setError("All fields are required");
                return false;
            }
        }
        if (tripType === "multi") {
            if (!formData.multiCities || formData.multiCities.length < 2) {
                setError("All fields are required");
                return false;
            }
        }
        return true;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handelValidation()) return;
        setLoading(true);
        console.log(formData);
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/flights", formData);
            // axios puts the response body on `data` and throws on non-2xx statuses
            const data = res.data;

            alert("Flight booked successfully!");
            setFormData({
                userEmail: "",
                userName: "",
                userNumber: "",
                from: "",
                to: "",
                date: "",
                returnDate: "",
                numOfAdults: 1,
                numOfChildren: 0,
                cabinClass: "economy",
                multiCities: [
                    { from: "", to: "", date: "" },
                    { from: "", to: "", date: "" },
                ],
            });
            setTripType("round");
            setUserInfoForm(false);
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.message || "Something went wrong");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ================= ROUND TRIP =================
    const RoundTripForm = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <AirportDropdown
                airports={fromCountries}
                value={formData.from}
                onChange={(iata) =>
                    setFormData({ ...formData, from: iata })
                }
                placeholder="From Airport"
            />
            <AirportDropdown
                airports={fromCountries}
                value={formData.to}
                onChange={(iata) =>
                    setFormData({ ...formData, to: iata })
                }
                placeholder="From Airport"
            />

            {/* <input
                type="text"
                placeholder="To"
                value={formData.to}
                onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                }
                className="input  bg-white text-black p-2  border-2 border-black rounded-2xl"
            /> */}

            <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                }
                className="input  bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                }
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="number"
                min="1"
                value={formData.numOfAdults}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        numOfAdults: e.target.value,
                    })
                }
                placeholder="Adults"
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="number"
                min="0"
                value={formData.numOfChildren}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        numOfChildren: e.target.value,
                    })
                }
                placeholder="Children"
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />
            <select
                value={formData.cabinClass}
                onChange={(e) =>
                    setFormData({ ...formData, cabinClass: e.target.value })
                }
                className="input bg-white text-black p-2 w-full  border-2 border-black rounded-2xl"
            >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
            </select>
            {/* <CabinClass /> */}
        </div>
    );

    // ================= ONE WAY =================
    const OneWayForm = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <input
                type="text"
                placeholder="Leaving From"
                value={formData.from}
                onChange={(e) =>
                    setFormData({ ...formData, from: e.target.value })
                }
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="text"
                placeholder="Going To"
                value={formData.to}
                onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                }
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                }
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />



            <input
                type="number"
                min="1"
                value={formData.numOfAdults}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        numOfAdults: e.target.value,
                    })
                }
                placeholder="Adults"
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />

            <input
                type="number"
                min="0"
                value={formData.numOfChildren}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        numOfChildren: e.target.value,
                    })
                }
                placeholder="Children"
                className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
            />
            <select
                value={formData.cabinClass}
                onChange={(e) =>
                    setFormData({ ...formData, cabinClass: e.target.value })
                }
                className="input bg-white text-black p-2 w-full  border-2 border-black rounded-2xl"
            >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
            </select>            {/* <CabinClass /> */}
        </div>
    );

    // ================= MULTI CITY =================
    const MultiCityForm = () => {

        const updateCity = (index, field, value) => {
            const updated = [...formData.multiCities];
            updated[index][field] = value;
            setFormData({ ...formData, multiCities: updated });
        };

        const addCity = () => {
            if (formData.multiCities.length < 5) {
                setFormData({
                    ...formData,
                    multiCities: [
                        ...formData.multiCities,
                        { from: "", to: "", date: "" }
                    ]
                });
            }
        };
        const deleteCity = () => {
            if (formData.multiCities.length < 5) {
                setFormData({
                    ...formData,
                    multiCities: formData.multiCities.slice(0, -1)
                });
            }
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full">
                {formData.multiCities.map((city, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="From"
                            value={city.from}
                            onChange={(e) =>
                                updateCity(index, "from", e.target.value)
                            }
                            className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
                        />

                        <input
                            type="text"
                            placeholder="To"
                            value={city.to}
                            onChange={(e) =>
                                updateCity(index, "to", e.target.value)
                            }
                            className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
                        />

                        <input
                            type="date"
                            value={city.date}
                            onChange={(e) =>
                                updateCity(index, "date", e.target.value)
                            }
                            className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
                        />
                    </div>
                ))}

                <div className="flex flex-row">

                    {formData.multiCities.length < 5 && (
                        <button
                            type="button"
                            onClick={addCity}
                            className="text-blue-600 font-semibold bg-white m-5 p-2"
                        >
                            + Add Another Flight
                        </button>
                    )}
                    {formData.multiCities.length > 2 && (
                        <button
                            type="button"
                            onClick={deleteCity}
                            className=" font-semibold bg-white text-red-600 p-2"
                        >
                            + Delete Flight
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <input
                        type="number"
                        min="1"
                        value={formData.numOfAdults}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                numOfAdults: e.target.value,
                            })
                        }
                        placeholder="Adults"
                        className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
                    />

                    <input
                        type="number"
                        min="0"
                        value={formData.numOfChildren}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                numOfChildren: e.target.value,
                            })
                        }
                        placeholder="Children"
                        className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
                    />
                    <select
                        value={formData.cabinClass}
                        onChange={(e) =>
                            setFormData({ ...formData, cabinClass: e.target.value })
                        }
                        className="input bg-white text-black p-2 w-full  border-2 border-black rounded-2xl"
                    >
                        <option value="economy">Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                    </select>
                </div>

                {/* <CabinClass /> */}
            </div>
        );
    };

    // ================= PASSENGERS =================
    // const PassengerSection = () => (
    //     <>
    //         <input
    //             type="number"
    //             min="1"
    //             value={formData.numOfAdults}
    //             onChange={(e) =>
    //                 setFormData({
    //                     ...formData,
    //                     numOfAdults: e.target.value,
    //                 })
    //             }
    //             placeholder="Adults"
    //             className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
    //         />

    //         <input
    //             type="number"
    //             min="0"
    //             value={formData.numOfChildren}
    //             onChange={(e) =>
    //                 setFormData({
    //                     ...formData,
    //                     numOfChildren: e.target.value,
    //                 })
    //             }
    //             placeholder="Children"
    //             className="input bg-white text-black p-2 border-2 border-black rounded-2xl"
    //         />
    //         <select
    //             value={formData.cabinClass}
    //             onChange={(e) =>
    //                 setFormData({ ...formData, cabinClass: e.target.value })
    //             }
    //             className="input bg-white text-black p-2 w-full  border-2 border-black rounded-2xl"
    //         >
    //             <option value="economy">Economy</option>
    //             <option value="business">Business</option>
    //             <option value="first">First</option>
    //         </select>
    //     </>
    // );

    // ================= CABIN =================
    // const CabinClass = () => (

    // );

    // ================= RENDER =================
    return (
        <div >
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">

                <div className="bg-white p-8 rounded-2xl shadow-xl mx-12 max-w-6xl w-full">

                    <h1 className="text-2xl text-black m-2">
                        Flight Services
                    </h1>
                    <p className="text-black m-2">
                        Travel at ease, let our professional team arrange your convenient and shortest route to your destination
                    </p>
                    <div className="line bg-black w-full border-b-2 border-black"></div>

                    <div className="flex gap-4 my-6">
                        <button onClick={() => { setTripType("round"), setFormData({ ...formData, tripType: "round" }) }}
                            className={tripType === "round" ? "btn-active text-blue-700 border-b-2 border-blue-700" : "btn text-black border-b-2 border-black"}>
                            Round Trip
                        </button>

                        <button onClick={() => { setTripType("oneway"), setFormData({ ...formData, tripType: "oneway" }) }}
                            className={tripType === "oneway" ? "btn-active text-blue-700 border-b-2 border-blue-700" : "btn text-black border-b-2 border-black"}>
                            One Way
                        </button>

                        <button onClick={() => { setTripType("multi"), setFormData({ ...formData, tripType: "multi" }) }}
                            className={tripType === "multi" ? "btn-active text-blue-700 border-b-2 border-blue-700" : "btn text-black border-b-2 border-black"}>
                            Multi City
                        </button>
                    </div>

                    {
                        error && <p className="text-red-500">{error}</p>
                    }

                    <form className=" min-w-7xl" onSubmit={handleSubmit} >
                        {tripType === "round" && <RoundTripForm />}
                        {tripType === "oneway" && <OneWayForm />}
                        {tripType === "multi" && <MultiCityForm />}

                        {
                            userInfoForm && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <input type="text" placeholder="Name"
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className="input bg-white text-black p-2 border-2 border-black rounded-2xl" />
                                    <input type="text" placeholder="Email"
                                        onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })} className="input bg-white text-black p-2 border-2 border-black rounded-2xl" />
                                    <input type="text" placeholder="Phone"
                                        onChange={(e) => setFormData({ ...formData, userNumber: e.target.value })} className="input bg-white text-black p-2 border-2 border-black rounded-2xl" />
                                </div>
                            )
                        }

                        {!userInfoForm ? <div
                            // type="button"
                            onClick={() => setUserInfoForm(true)}
                            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl text-center">
                            Next
                        </div> : <button
                            type="submit"
                            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl">
                            Submit
                        </button>}
                    </form>
                </div>
            </div>

            <div className="w-full">
                <Footer />
            </div>
        </div>
    );
}