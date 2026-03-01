'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'

interface TeamMember {
    _id: string
    name: string
    role: string
    number?: string
    image?: string
    video?: string
}

const OurTeam = () => {

    const { data: members = [], isLoading, isError } = useQuery({
        queryKey: ['team'],
        queryFn: async () => {
            const res = await apiClient.get('/auth/team')
            console.log(res.data.team);
            return res.data.team
        }
    })

    if (isLoading) {
        return (
            <section className="py-20 bg-gray-950 text-center text-white">
                <p className="text-xl">Loading team members...</p>
            </section>
        )
    }

    if (isError) {
        return (
            <section className="py-20 bg-gray-950 text-center text-red-500">
                <p>Failed to load team members.</p>
            </section>
        )
    }

    return (
        <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Title */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Our Team</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Meet our professional team dedicated to delivering the best travel experience.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

                    {members.map((member: TeamMember) => {
                        return (
                            <div
                                key={member._id}
                                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-64 w-full overflow-hidden">
                                    <img
                                        src={member.images
                                            ? `http://localhost:5000${member.images[0]}`
                                            : '/default-profile.png'} alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40"></div>
                                </div>

                                {/* Info */}
                                <div className="p-6 text-center">
                                    <h3 className="text-2xl font-semibold mb-2">
                                        {member.name}
                                    </h3>

                                    <p className="text-red-500 font-medium mb-2">
                                        {member.role}
                                    </p>

                                    {/* {member.number && (
                                        <p className="text-gray-400 text-sm">
                                            📞 {member.number}
                                        </p>
                                    )} */}

                                    {/* Video (optional) */}
                                    {member.video && (
                                        <video
                                            src={`http://localhost:5000${member.video}`}
                                            controls
                                            className="mt-4 w-full rounded-lg"
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}

                </div>

                {members.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        No team members available.
                    </div>
                )}

            </div>
        </section>
    )
}

export default OurTeam
