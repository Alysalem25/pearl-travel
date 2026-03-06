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

  // default range: start of current month to today
  const getDefaultDates = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const toInput = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      start: toInput(startOfMonth),
      end: toInput(now)
    };
  };

  const defaults = getDefaultDates();

  const [startDate, setStartDate] = React.useState(defaults.start);
  const [endDate, setEndDate] = React.useState(defaults.end);

  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ['userSummary', id, startDate, endDate],
    queryFn: () => api.users.getSummary(id!, startDate, endDate).then(r => r.data),
    enabled: !!id
  });

  if (userLoading) return <div className="p-6">Loading user...</div>;
  if (!userData) return <div className="p-6 text-red-600">User not found</div>;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AdminSidebar sidebarOpen={false} setSidebarOpen={() => { }} active="Users" />

      <div className="flex-1 p-8 space-y-8">
        {/* header / profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
          {userData.images && userData.images.length > 0 ? (
            <img
              src={`http://localhost:5000${userData.images[0]}`}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-slate-200">
              <User className="w-10 h-10 text-slate-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{userData.name}</h1>
            <p className="text-sm text-slate-600">{userData.email}</p>
            <p className="text-sm text-slate-600">{userData.number}</p>
            <p className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Role: {userData.role}
            </p>
          </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Review statistics</p>
            <p className="text-[11px]">
              Default range: from start of this month
            </p>
          </div>
        </div>

        {/* date filter */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-800">
              Filter reviews by date
            </h3>
            <p className="text-xs text-slate-500">
              Showing reviews from {startDate || 'start'} to {endDate || 'now'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <button
              type="button"
              onClick={() => {
                const d = getDefaultDates();
                setStartDate(d.start);
                setEndDate(d.end);
              }}
              className="ml-auto inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              This month
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full text-sm text-slate-600">
              Loading stats...
            </div>
          ) : error ? (
            <div className="col-span-full text-sm text-red-600">
              Error loading user stats
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">
                  Reviewed Flights
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {data?.reviewedFlightsCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">
                  Reviewed Hotel Bookings
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {data?.reviewedHotelsCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">
                  Reviewed Car Trips
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {data?.reviewedCarsCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">
                  Reviewed Visa Applications
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {data?.reviewedVisasCount ?? 0}
                </p>
              </div>
            </>
          )}
        </div>
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
