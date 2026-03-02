'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/adminSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User } from 'lucide-react';

interface Summary {
  reviewedFlightsCount: number;
  reviewedHotelsCount: number;
  reviewedCarsCount: number;
  reviewedVisasCount: number;
}

const UserSummaryPage = () => {
  const { id } = useParams<{ id: string }>();

  // fetch profile data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.users.getOne(id!).then(r => r.data.user),
    enabled: !!id
  });

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [trigger, setTrigger] = React.useState(0);

  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ['userSummary', id, startDate, endDate, trigger],
    queryFn: () => api.users.getSummary(id!, startDate || undefined, endDate || undefined).then(r => r.data),
    enabled: !!id && trigger > 0
  });

  const handleSearch = () => setTrigger(t => t + 1);

  if (userLoading) return <div className="p-6">Loading user...</div>;
  if (!userData) return <div className="p-6 text-red-600">User not found</div>;

  return (
    <div className="min-h-screen flex bg-white text-black">
      <AdminSidebar sidebarOpen={false} setSidebarOpen={() => { }} active="Users" />

      <div className="flex-1 p-6">
        {/* profile section */}
        <div className="flex items-center gap-4 mb-6">
          {userData.images && userData.images.length > 0 ? (
            <img
              src={`http://localhost:5000${userData.images[0]}`}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p>{userData.email}</p>
            <p>{userData.number}</p>
            <p className="text-sm text-gray-500">Role: {userData.role}</p>
          </div>
        </div>

        {/* date filter */}
        <div className="mb-6 space-y-2">
          <h3 className="font-semibold">Filter reviews by date</h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border p-1 rounded"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border p-1 rounded"
            />
            <button onClick={handleSearch} className="bg-blue-600 text-white px-3 py-1 rounded">
              Search
            </button>
          </div>
        </div>

        {/* stats */}
        {isLoading ? (
          <div>Loading stats...</div>
        ) : error ? (
          <div className="text-red-600">Error loading user stats</div>
        ) : (
          <div className="space-y-2">
            <p>Reviewed Flights: {data?.reviewedFlightsCount ?? 0}</p>
            <p>Reviewed Hotel Bookings: {data?.reviewedHotelsCount ?? 0}</p>
            <p>Reviewed Car Trips: {data?.reviewedCarsCount ?? 0}</p>
            <p>Reviewed Visa Applications: {data?.reviewedVisasCount ?? 0}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserSummaryPage />
    </ProtectedRoute>
  );
}
