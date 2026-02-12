import React from 'react';
import { Mountain } from 'lucide-react';
import PageHero from '../components/PageHero';
import ServiceCard from '../components/ServiceCard';
import TrustSection from '../components/TrustSection';
import { useExcursions } from '../hooks/useExcursions';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import ListingHeader from '../components/ListingHeader';
import { useState, useMemo } from 'react';

const Excursions = () => {
    const { excursions, loading, error } = useExcursions();
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const paginatedExcursions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return excursions.slice(startIndex, startIndex + itemsPerPage);
    }, [excursions, currentPage]);

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Island Excursions"
                subtitle="Discover the hidden gems of Mauritius with our curated land and sea activities."
                image="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1920"
                icon={Mountain}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-20 pt-12 md:pt-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">Adventure Awaits</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                        From the colored earths of Chamarel to the turquoise lagoons of Île aux Cerfs, explore the very best of Mauritius.
                    </p>
                </div>

                {loading ? (
                    <LoadingSpinner message="Finding the best excursions..." />
                ) : error ? (
                    <ErrorMessage error={error} title="Failed to load excursions" />
                ) : (
                    <>
                        <ListingHeader
                            count={excursions.length}
                            label="excursions"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                            {paginatedExcursions.map((excu, index) => (
                                <div
                                    key={excu.id}
                                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                                    className={viewMode === 'list' ? 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row' : ''}
                                >
                                    {viewMode === 'grid' ? (
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
                                    ) : (
                                        // List View
                                        <>
                                            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                                                <img src={excu.image} alt={excu.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1 text-orange-500">
                                                        <Star size={16} fill="currentColor" />
                                                        <span className="font-bold text-sm">{excu.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 w-full md:w-3/5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-bold">{excu.name}</h3>
                                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">{excu.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 mb-6">
                                                        <MapPin size={18} className="text-primary" />
                                                        <span>{excu.location}</span>
                                                    </div>
                                                    <p className="text-gray-500 line-clamp-2 mb-6 leading-relaxed uppercase text-xs font-black tracking-widest">{excu.highlights?.join(' • ')}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-sm text-gray-500 block mb-1">From</span>
                                                        <span className="text-3xl font-black text-gray-900">Rs {excu.price}</span>
                                                        <span className="text-sm text-gray-500 ml-1">per person</span>
                                                    </div>
                                                    <Button to={`/services/${excu.id}`}>View Details</Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={excursions.length}
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

export default Excursions;
