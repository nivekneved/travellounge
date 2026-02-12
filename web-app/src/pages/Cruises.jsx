import React, { useState, useMemo } from 'react';
import { Ship, Calendar, MapPin, Search, Star, Filter } from 'lucide-react';
import Button from '../components/Button';
import ServiceCard from '../components/ServiceCard';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCruises } from '../hooks/useCruises';
import PageHero from '../components/PageHero';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';
import ListingHeader from '../components/ListingHeader';
import Pagination from '../components/Pagination';

const Cruises = () => {
    const { cruises: cruisePackages, loading, error } = useCruises();
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 250000]);
    const [filters, setFilters] = useState({
        location: [],
        rating: [],
        amenities: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const categories = [...new Set(cruisePackages.map(c => c.category))];

    const filteredCruises = useMemo(() => {
        const filtered = cruisePackages.filter(cruise => {
            const price = parseInt(cruise.price.replace(/,/g, ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            const matchesLocation = filters.location.length === 0 || filters.location.includes(cruise.category);
            const matchesRating = filters.rating.length === 0 || filters.rating.includes(Math.floor(cruise.rating));

            return matchesPrice && matchesLocation && matchesRating;
        });
        setCurrentPage(1); // Reset to first page on filter change
        return filtered;
    }, [cruisePackages, filters, priceRange]);

    const paginatedCruises = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCruises.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCruises, currentPage]);

    if (loading) return <LoadingSpinner message="Loading cruises..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load cruises" />;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <PageHero
                title="Cruise Vacations"
                subtitle="Sail through paradise with our curated luxury cruise experiences."
                image="https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1920"
                icon={Ship}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="cruise"
                            filters={filters}
                            setFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            locations={categories}
                            amenities={[]}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        {/* Toolbar */}
                        <ListingHeader
                            count={filteredCruises.length}
                            label="cruise packages"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Grid/List */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                            {paginatedCruises.map((cruise, index) => (
                                <div
                                    key={cruise.id}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                    className={`${viewMode === 'list' ? 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row' : ''}`}
                                >
                                    {viewMode === 'grid' ? (
                                        <ServiceCard
                                            product={{
                                                _id: cruise.id,
                                                name: cruise.name,
                                                image: cruise.image || (cruise.images && cruise.images[0]),
                                                description: cruise.highlights?.join(' • ') || cruise.description || '',
                                                price: typeof cruise.price === 'string' ? parseInt(cruise.price.replace(/,/g, '')) : cruise.price, // Handle legacy string prices
                                                duration: cruise.duration,
                                                location: cruise.ports || cruise.location,
                                                rating: cruise.rating,
                                                type: 'Cruise'
                                            }}
                                        />
                                    ) : (
                                        // List View Card
                                        <>
                                            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                                                <img
                                                    src={cruise.image}
                                                    alt={cruise.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg text-sm font-bold text-gray-900">
                                                    {cruise.duration}
                                                </div>
                                            </div>
                                            <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-bold">{cruise.name}</h3>
                                                        <div className="flex items-center gap-1 text-orange-500">
                                                            <Star size={16} fill="currentColor" />
                                                            <span className="font-bold">{cruise.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-gray-600 mb-4">
                                                        <MapPin size={18} className="text-primary mt-1" />
                                                        <span className="leading-relaxed">{cruise.ports}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {(cruise.highlights || []).map((tag, i) => (
                                                            <span key={i} className="px-3 py-1 bg-gray-100 text-sm rounded-full text-gray-600">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between pt-6 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-sm text-gray-500 block mb-1">From</span>
                                                        <span className="text-3xl font-black text-gray-900">Rs {cruise.price}</span>
                                                        <span className="text-sm text-gray-500 ml-1">per person</span>
                                                    </div>
                                                    <Button to={`/services/${cruise.id}`}>
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredCruises.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />

                        {filteredCruises.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <Ship className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No cruises found</h3>
                                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                                <button
                                    onClick={() => {
                                        setFilters({ location: [], rating: [], amenities: [] });
                                        setPriceRange([0, 250000]);
                                    }}
                                    className="mt-4 text-primary font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TrustSection />
            {/* CTA Section */}
            <CTASection
                title="Plan Your Dream Voyage"
                description="Our cruise specialists are ready to help you choose the perfect cabin and itinerary."
                buttonText="Talk to an Expert"
            />
        </div>
    );
};

export default Cruises;
