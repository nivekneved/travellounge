import React from 'react';
import { MapPin, Loader, Car, ShieldCheck, Clock, Users } from 'lucide-react';
import PageHero from '../components/PageHero';
import ServiceCard from '../components/ServiceCard';
import TrustSection from '../components/TrustSection';
import { useTransfers } from '../hooks/useTransfers';

const Transfers = () => {
    const { transfers, loading, error } = useTransfers();

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Professional Transfers"
                subtitle="Safe, reliable, and comfortable transportation services across Mauritius."
                image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920"
                icon={Car}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-gray-50 p-8 rounded-3xl text-center">
                        <ShieldCheck className="mx-auto text-primary mb-4" size={40} />
                        <h3 className="font-bold text-xl mb-2">Licensed Drivers</h3>
                        <p className="text-gray-600">Professional, bilingual, and fully insured transport experts.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl text-center">
                        <Clock className="mx-auto text-primary mb-4" size={40} />
                        <h3 className="font-bold text-xl mb-2">Punctual Arrival</h3>
                        <p className="text-gray-600">We track your flight or pickup time to ensure zero waiting time.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl text-center">
                        <Users className="mx-auto text-primary mb-4" size={40} />
                        <h3 className="font-bold text-xl mb-2">Any Group Size</h3>
                        <p className="text-gray-600">From private luxury sedans to large passenger coaches.</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Our Fleet & Services</h2>
                    <p className="text-gray-600">Choose the perfect transport option for your journey.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading transfer options...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 font-bold">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {transfers.map((trans, index) => (
                            <div
                                key={trans.id}
                                style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                            >
                                <ServiceCard
                                    product={{
                                        _id: trans.id,
                                        name: trans.name,
                                        images: [trans.image],
                                        location: trans.location,
                                        category: "Transfer",
                                        pricing: { price: parseInt(trans.price.replace(/,/g, '')) },
                                        rating: trans.rating
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

export default Transfers;
