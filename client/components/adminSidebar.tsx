'use client'
import React, { use } from 'react'
import Link from 'next/link'
import { useState } from 'react';
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const admin_sidebar = ({ sidebarOpen, setSidebarOpen, active }) => {
  const [Active, setActive] = useState(active);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link
              href={`/`}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >

              {/* <img
              src="/Logo.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            /> */}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li onClick={() => setActive("dashboard")} className={Active === "dashboard" ? "bg-gray-200  rounded-lg" : ""}>
                <Link
                  href="/Admindashbord"
                  className="flex items-center px-4 py-3 text-black  rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="38px" fill="black"><path d="M600-160v-280h280v280H600ZM440-520v-280h440v280H440ZM80-160v-280h440v280H80Zm0-360v-280h280v280H80Zm440-80h280v-120H520v120ZM160-240h280v-120H160v120Zm520 0h120v-120H680v120ZM160-600h120v-120H160v120Zm360 0Zm-80 240Zm240 0ZM280-600Z" /></svg>
                  Dashboard
                </Link>
              </li>
              <li onClick={() => setActive("programs")} className={Active === "programsprograms" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/programs"
                  className="flex items-center px-4 py-3 text-black  rounded-lg hover:bg-gray-100   transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="38px" fill="black"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                  Manage Programs
                </Link>
              </li>
              <li onClick={() => setActive("buses")} className={Active === "buses" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/categories"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="38px" fill="black"><path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z" /></svg>
                  categories
                </Link>
              </li>
              <li onClick={() => setActive("users")} className={Active === "users" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/users"
                  className="flex items-center px-4 py-3 text-black  rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" /></svg>

                  users
                </Link>
              </li>
              <li onClick={() => setActive("countries")} className={Active === "countries" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/countries"
                  className="flex items-center px-4 py-3 text-black  rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" /></svg>

                  countries
                </Link>
              </li>
              <li onClick={() => setActive("visa")} className={Active === "visa" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/visa"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M560-400h-80v-80h80v80ZM360-240h240v-80H360v80Zm520-480v-120q0-33-23.5-56.5T800-920H160q-33 0-56.5 23.5T80-840v120h800Zm0 80H80v520q0 33 23.5 56.5T160-40h640q33 0 56.5-23.5T880-120v-520Zm-400 320q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" /></svg>

                  Visa Applications
                </Link>
              </li>
              <li onClick={() => setActive("flights")} className={Active === "flights" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/flights"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m397-115-99-184-184-99 71-70 145 25 102-102-317-135 84-86 385 68 124-124q23-23 57-23t57 23q23 23 23 56.5T822-709L697-584l68 384-85 85-136-317-102 102 26 144-71 71Z" /></svg>
                  Flights
                </Link>
              </li>
              <li onClick={() => setActive("bookedPrograms")} className={Active === "bookedPrograms" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/bookedPrograms"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M438-226 296-368l58-58 84 84 168-168 58 58-226 226ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg>
                  Booked Programs
                </Link>
              </li>
              <li onClick={() => setActive("Cars")} className={Active === "bookedPrograms" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/transportation"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M400-106v-228l56-160q5-11 14.5-18.5T494-520h292q14 0 24 7.5t14 18.5l56 160v228q0 11-7.5 18.5T854-80h-28q-11 0-18.5-7.5T800-106v-34H480v34q0 11-7.5 18.5T454-80h-28q-11 0-18.5-7.5T400-106Zm80-274h320l-28-80H508l-28 80Zm-20 60v120-120Zm88.5 88.5Q560-243 560-260t-11.5-28.5Q537-300 520-300t-28.5 11.5Q480-277 480-260t11.5 28.5Q503-220 520-220t28.5-11.5Zm240 0Q800-243 800-260t-11.5-28.5Q777-300 760-300t-28.5 11.5Q720-277 720-260t11.5 28.5Q743-220 760-220t28.5-11.5ZM240-400v-80h80v80h-80Zm200-240v-80h80v80h-80ZM240-240v-80h80v80h-80Zm0 160v-80h80v80h-80ZM80-80v-560h200v-240h400v280h-80v-200H360v240H160v480H80Zm380-120h360v-120H460v120Z" /></svg>
                  transportation
                </Link>
              </li>
              <li onClick={() => setActive("hotels")} className={Active === "hotels" ? "bg-gray-200 dark:bg-gray-100 rounded-lg" : ""}>
                <Link
                  href="/Admindashbord/hotel"
                  className="flex items-center px-4 py-3 text-black rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M303.5-376.5Q327-400 360-400t56.5 23.5Q440-353 440-320t-23.5 56.5Q393-240 360-240t-56.5-23.5Q280-287 280-320t23.5-56.5ZM480-400h240q33 0 56.5 23.5T800-320v280h-80v-80H240v80h-80v-400h80v240h240v-200Zm150-40L512-654 406-548l10 68-30 30-47-88-88-48 30-30 68 9 106-106-215-117 38-38 264 68 108-108q12-12 29-12t29 12q12 12 12 29t-12 29L600-742l68 264-38 38Zm90 240v-120H560v120h160Zm-160 0v-120 120Z" /></svg>
                  Hotels
                </Link>
              </li>

            </ul>
          </nav>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-1 px-3 py-2 m-6 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>
      </aside>
    </div>
  )
}

export default admin_sidebar
