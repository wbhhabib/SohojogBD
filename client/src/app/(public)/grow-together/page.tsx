'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShoppingBag, GraduationCap, ArrowRight, Users, MapPin } from 'lucide-react'

export default function GrowTogetherHubPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #f9fafb 240px)' }}>
                <section className="relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #fcd34d, #fb923c)' }} />
                    <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #6ee7b7, #14b8a6)' }} />

                    <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-14 md:pt-20 md:pb-16 text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm">
                            <Users size={12} />
                            GrowTogether
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
                            style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                            Small steps go further<br />
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(135deg, #d97706, #059669)' }}>
                                when taken together.
                            </span>
                        </h1>
                        <p className="text-gray-500 text-base max-w-xl mx-auto">
                            Two ways GrowTogether helps small entrepreneurs and job seekers across
                            Bangladesh move forward — pick one to get started.
                        </p>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-4 pb-20">
                    <div className="grid sm:grid-cols-2 gap-6">

                        <a href="/grow-together/pools"
                            className="group relative overflow-hidden rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-7 flex flex-col"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle, #fcd34d, #fb923c)' }} />
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-amber-50 relative">
                                <ShoppingBag size={22} className="text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 relative"
                                style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                Wholesale Pooling
                            </h2>
                            <p className="text-sm text-gray-500 mb-5 relative leading-relaxed">
                                Can&apos;t afford wholesale rates alone? Join other small entrepreneurs to
                                hit the target quantity together and unlock factory/bulk prices.
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold relative text-amber-600 group-hover:gap-2.5 transition-all">
                                Browse pools
                                <ArrowRight size={15} />
                            </span>
                        </a>


                        <a href="/grow-together/courses"
                            className="group relative overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-7 flex flex-col"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle, #6ee7b7, #14b8a6)' }} />
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-emerald-50 relative">
                                <GraduationCap size={22} className="text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 relative"
                                style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                                Free Courses
                            </h2>
                            <p className="text-sm text-gray-500 mb-5 relative leading-relaxed">
                                Find free skill-development training from verified organizations —
                                TTCs, youth development centers, TVET institutes, and more.
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold relative text-emerald-600 group-hover:gap-2.5 transition-all">
                                Browse courses
                                <ArrowRight size={15} />
                            </span>
                        </a>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                        <MapPin size={12} />
                        Available across all divisions of Bangladesh
                    </div>
                </section >
            </main >
            <Footer />
        </>
    )
}