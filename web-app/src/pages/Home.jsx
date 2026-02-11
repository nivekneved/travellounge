import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Globe, Compass } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import CategoryGrid from '../components/CategoryGrid';
import PromotionsCarousel from '../components/PromotionsCarousel';
import ServiceCard from '../components/ServiceCard';
import PartnersSlider from '../components/PartnersSlider';
import TrustSection from '../components/TrustSection';
import NewsletterSection from '../components/NewsletterSection';

const Home = () => {
    const [page, setPage] = useState(1);

    // Scroll to section top when page changes
    React.useEffect(() => {
        if (page > 1) {
            const section = document.getElementById('featured-services');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['services', 'featured', page],
        queryFn: async () => {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const params = new URLSearchParams({
                limit: 9,
                page: page,
                featured: true
            });

            const response = await fetch(`${apiBase}/services?${params}`);
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            return data;
        },
        keepPreviousData: true
    });

    if (error) {
        console.error('React Query Error:', error);
    }

    if (error) {
        console.error('React Query Error:', error);
    }

    return (
        <div className="flex flex-col">
            {/* Hero - Full width */}
            <HeroSlider />

            {/* Category Grid - Light Grey Background */}
            <CategoryGrid />

            {/* Promotions - White Background */}
            <PromotionsCarousel />

            {/* Why Choose Us - Trust Section (White Background) */}
            <TrustSection />

            {/* Featured Experiences - Light Grey Background */}
            <section id="featured-services" className="py-24 bg-gray-50">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                            Featured <span className="text-primary">Experiences</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                            Hand-picked premium stays and activities curated by our island experts.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                <div key={i} className="h-[450px] bg-white rounded-3xl animate-pulse shadow-lg" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                                {data?.services?.map((service, index) => (
                                    <div
                                        key={service.id || service._id}
                                        style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                                    >
                                        <ServiceCard product={service} />
                                    </div>
                                ))}
                            </div>

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

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-24">
                <NewsletterSection />
            </div>
        </div>
    );
};

export default Home;
