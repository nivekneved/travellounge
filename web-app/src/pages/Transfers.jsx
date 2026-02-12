import React from 'react';
import { Car, ShieldCheck, Clock, Users } from 'lucide-react';
import PageHero from '../components/PageHero';
import ServiceCard from '../components/ServiceCard';
import TrustSection from '../components/TrustSection';
import ListingHeader from '../components/ListingHeader';
import Button from '../components/Button';
import { Star, MapPin } from 'lucide-react';
import { useTransfers } from '../hooks/useTransfers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { useState, useMemo } from 'react';

const Transfers = () => {
    const { transfers, loading, error } = useTransfers();
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const paginatedTransfers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return transfers.slice(startIndex, startIndex + itemsPerPage);
    }, [transfers, currentPage]);

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Professional Transfers"
                subtitle="Safe, reliable, and comfortable transportation services across Mauritius."
                image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920"
                icon={Car}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-20 pt-12 md:pt-20">
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
                    <LoadingSpinner message="Loading transfer options..." />
                ) : error ? (
                    <ErrorMessage error={error} title="Failed to load transfers" />
                ) : (
                    <>
                        <ListingHeader
                            count={transfers.length}
                            label="transfers"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                            {paginatedTransfers.map((trans, index) => (
                                <div
                                    key={trans.id}
                                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                                    className={viewMode === 'list' ? 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row' : ''}
                                >
                                    {viewMode === 'grid' ? (
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
                                    ) : (
                                        // List View
                                        <>
                                            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                                                <img src={trans.image} alt={trans.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1 text-orange-500">
                                                        <Star size={16} fill="currentColor" />
                                                        <span className="font-bold text-sm">{trans.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 w-full md:w-3/5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-bold">{trans.name}</h3>
                                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Transfer Service</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 mb-6">
                                                        <MapPin size={18} className="text-primary" />
                                                        <span>{trans.location}</span>
                                                    </div>
                                                    <p className="text-gray-500 font-medium leading-relaxed">Experience a premium, safe, and reliable transfer service in Mauritius with our professional drivers.</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-sm text-gray-500 block mb-1">From</span>
                                                        <span className="text-3xl font-black text-gray-900">Rs {trans.price}</span>
                                                        <span className="text-sm text-gray-500 ml-1">per person</span>
                                                    </div>
                                                    <Button to={`/services/${trans.id}`}>View Details</Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={transfers.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <TrustSection />
        </div>
    );
};

export default Transfers;
