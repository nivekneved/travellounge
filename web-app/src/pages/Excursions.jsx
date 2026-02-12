import React from 'react';
import { Mountain, Loader, ArrowRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import ServiceCard from '../components/ServiceCard';
import TrustSection from '../components/TrustSection';
import { useExcursions } from '../hooks/useExcursions';

const Excursions = () => {
    const { excursions, loading, error } = useExcursions();

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Island Excursions"
                subtitle="Discover the hidden gems of Mauritius with our curated land and sea activities."
                image="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1920"
                icon={Mountain}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">Adventure Awaits</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                        From the colored earths of Chamarel to the turquoise lagoons of Île aux Cerfs, explore the very best of Mauritius.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Finding the best excursions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 font-bold">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {excursions.map((excu, index) => (
                            <div
                                key={excu.id}
                                style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                            >
                                <ServiceCard
                                    product={{
                                        _id: excu.id,
                                        name: excu.name,
                                        images: [excu.image],
                                        location: excu.location,
                                        category: excu.category,
                                        pricing: { price: parseInt(excu.price.replace(/,/g, '')) },
                                        rating: excu.rating
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TrustSection />
        </div>
    );
};

export default Excursions;
