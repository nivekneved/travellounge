import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Globe, Compass } from 'lucide-react';
import { supabase } from '../utils/supabase';
import HeroSlider from '../components/HeroSlider';
import CategoryGrid from '../components/CategoryGrid';
import PromotionsCarousel from '../components/PromotionsCarousel';
import ServiceCard from '../components/ServiceCard';
import PartnersSlider from '../components/PartnersSlider';
import TrustSection from '../components/TrustSection';

const Home = () => {
    const [page, setPage] = useState(1);
    const limit = 9;

    // Scroll to section top when page changes
    useEffect(() => {
        if (page > 1) {
            const section = document.getElementById('featured-services');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['services', 'featured', page],
        queryFn: async () => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data: services, error, count } = await supabase
                .from('services')
                .select('*', { count: 'exact' })
                .eq('is_featured', true)
                .eq('status', 'active')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                services: services || [],
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            };
        },
        keepPreviousData: true
    });

    if (error) {
        // Error is handled by UI state if needed, or by error boundary
    }

    return (
        <div className="flex flex-col">
            {/* Hero - Full width */}
            <HeroSlider />

            {/* Category Grid - Premium Experience */}
            <CategoryGrid />

            {/* Promotions - White Background */}
            <PromotionsCarousel />

            {/* Why Choose Us - Trust Section (White Background) */}
            <TrustSection />

            {/* Featured Experiences - Light Grey Background */}
            <section id="featured-services" className="py-24 bg-gray-50">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                            Featured <span className="text-primary">Experiences</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-xl font-light">
                            Hand-picked premium stays and activities curated by our island experts.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[450px] bg-white rounded-3xl animate-pulse shadow-lg" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {data?.services?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                                    {data.services.map((service, index) => (
                                        <div
                                            key={service.id || service._id}
                                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                                        >
                                            <ServiceCard product={{ ...service, _id: service.id }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                                    <Compass className="mx-auto text-gray-200 mb-6" size={80} />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Featured Experiences Found</h3>
                                    <p className="text-gray-500 mb-8">Start exploring our full range of categories above.</p>
                                    <Link to="/search" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all uppercase tracking-widest text-sm">
                                        View All Services
                                    </Link>
                                </div>
                            )}

                            {/* Pagination */}
                            {data?.pages > 1 && (
                                <div className="flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all font-bold"
                                    >
                                        &lt;
                                    </button>

                                    <div className="flex gap-2">
                                        {[...Array(data.pages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${page === i + 1
                                                    ? 'bg-primary text-white shadow-lg scale-110'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                                        disabled={page === data.pages}
                                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all font-bold"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Partners - White Background */}
            <PartnersSlider />
        </div>
    );
};

export default Home;
