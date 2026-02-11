import React, { useState, useMemo } from 'react';
import { Home, Wifi, Coffee, Utensils, Star, MapPin } from 'lucide-react';
import Button from '../components/Button';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar from '../components/FilterSidebar';

import { useGuestHouses } from '../hooks/useGuestHouses';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PageHero from '../components/PageHero';
import ListingHeader from '../components/ListingHeader';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';

const RodriguesGuestHouses = () => {
    const { guestHouses, loading, error } = useGuestHouses('Rodrigues');
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [filters, setFilters] = useState({
        location: [],
        rating: [],
        amenities: []
    });

    // Extract unique values
    const locations = [...new Set(guestHouses.map(h => h.location))];
    const allAmenities = [...new Set(guestHouses.flatMap(h => h.amenities))];

    // Filter logic
    const filteredGuestHouses = useMemo(() => {
        return guestHouses.filter(gh => {
            const price = parseInt(gh.price.replace(/,/g, ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            const matchesLocation = filters.location.length === 0 || filters.location.includes(gh.location);
            const matchesRating = filters.rating.length === 0 || filters.rating.includes(gh.starRating);
            const matchesAmenities = filters.amenities.length === 0 ||
                filters.amenities.every(a => gh.amenities.includes(a));

            return matchesPrice && matchesLocation && matchesRating && matchesAmenities;
        });
    }, [filters, priceRange]);

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            {/* Hero Section */}
            <PageHero
                title="Guest Houses"
                subtitle="Experience authentic Rodriguan hospitality in our charming guest houses."
                image="https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=1920"
                icon={Home}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="guest-house"
                            filters={filters}
                            setFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            locations={locations}
                            amenities={allAmenities}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        {/* Toolbar */}
                        <ListingHeader
                            count={filteredGuestHouses.length}
                            label="properties"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Grid/List */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                            {filteredGuestHouses.map((gh, index) => (
                                <div
                                    key={gh.id}
                                    className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-72' : ''}`}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                >
                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full md:w-2/5 h-64 md:h-full' : 'h-64'}`}>
                                        <img
                                            src={gh.image}
                                            alt={gh.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                                            <div className="flex items-center gap-1 text-orange-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="font-bold text-sm">{gh.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-6 flex flex-col justify-between ${viewMode === 'list' ? 'w-full md:w-3/5' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-2xl font-bold">{gh.name}</h3>
                                                {viewMode === 'list' && (
                                                    <div className="flex gap-1 text-yellow-400">
                                                        {[...Array(gh.starRating || 3)].map((_, i) => (
                                                            <Star key={i} size={14} fill="currentColor" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                <MapPin size={16} className="text-primary" />
                                                <span className="text-sm">{gh.location}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {(viewMode === 'list' ? gh.amenities : (gh.amenities || []).slice(0, 3)).map((amenity, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {viewMode === 'grid' && (gh.amenities || []).length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">+{gh.amenities.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-2">
                                            <div>
                                                <span className="text-sm text-gray-500">From</span>
                                                <p className="text-3xl font-black text-gray-900">
                                                    Rs {gh.price}
                                                </p>
                                                <span className="text-xs text-gray-500">per night</span>
                                            </div>
                                            <Button
                                                to={`/services/${gh.id}`}
                                                className="px-6 py-2"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredGuestHouses.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <Home className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No guest houses found</h3>
                                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                                <button
                                    onClick={() => {
                                        setFilters({ location: [], rating: [], amenities: [] });
                                        setPriceRange([0, 10000]);
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

            <CTASection
                title="Experience Local Life"
                description="Book your stay at one of our authentic Rodriguan guest houses today."
                buttonText="Check Availability"
                variant="dark"
            />
        </div>
    );
};

export default RodriguesGuestHouses;
