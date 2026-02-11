import React, { useState, useMemo } from 'react';
import { Hotel, Star, MapPin } from 'lucide-react';
import Button from '../Button';
import ViewToggle from '../ViewToggle';
import FilterSidebar from '../FilterSidebar';
import PageHero from '../PageHero';
import TrustSection from '../TrustSection';
import CTASection from '../CTASection';
import ListingHeader from '../ListingHeader';

const HotelListingTemplate = ({
    hotels,
    heroImage,
    heroTitle,
    heroSubtitle,
    HeroIcon = Hotel,
    basePath,
    ctaTitle = "Need Personal Recommendation?",
    ctaText = "Our travel experts know every hotel in Mauritius. Let us help you find the perfect one for your stay."
}) => {
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [filters, setFilters] = useState({
        location: [],
        rating: [],
        amenities: []
    });

    const locations = [...new Set(hotels?.map(h => h.location).filter(Boolean))];
    const allAmenities = [...new Set(hotels?.flatMap(h => Array.isArray(h.amenities) ? h.amenities : []).filter(Boolean))];

    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            const price = parseInt(hotel.price.replace(/,/g, ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
            const matchesLocation = filters.location.length === 0 || filters.location.includes(hotel.location);
            const matchesRating = filters.rating.length === 0 || filters.rating.includes(hotel.starRating);
            const matchesAmenities = filters.amenities.length === 0 || filters.amenities.every(a => hotel.amenities.includes(a));
            return matchesPrice && matchesLocation && matchesRating && matchesAmenities;
        });
    }, [filters, priceRange, hotels]);

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            {/* Hero Section */}
            <PageHero
                title={heroTitle}
                subtitle={heroSubtitle}
                image={heroImage}
                icon={HeroIcon}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="hotel"
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
                        <ListingHeader
                            count={filteredHotels.length}
                            label="properties"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                            {filteredHotels.map((hotel, index) => (
                                <div key={hotel.id} className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-72' : ''}`} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full md:w-2/5 h-64 md:h-full' : 'h-64'}`}>
                                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                            <div className="flex items-center gap-1 text-orange-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="font-bold text-sm">{hotel.rating}</span>
                                            </div>
                                        </div>
                                        {viewMode === 'grid' && (
                                            <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg">
                                                <div className="flex gap-1">
                                                    {[...Array(hotel.starRating)].map((_, i) => (
                                                        <Star key={i} size={14} fill="currentColor" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-6 flex flex-col justify-between ${viewMode === 'list' ? 'w-full md:w-3/5' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-2xl font-bold">{hotel.name}</h3>
                                                {viewMode === 'list' && (
                                                    <div className="flex gap-1 text-yellow-400">
                                                        {[...Array(hotel.starRating)].map((_, i) => (
                                                            <Star key={i} size={14} fill="currentColor" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                <MapPin size={16} className="text-primary" />
                                                <span className="text-sm">{hotel.location}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {(viewMode === 'list' ? hotel.amenities : hotel.amenities.slice(0, viewMode === 'grid' ? 3 : 4)).map((amenity, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                        {typeof amenity === 'object' ? amenity.name : amenity}
                                                    </span>
                                                ))}
                                                {viewMode === 'grid' && hotel.amenities.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">+{hotel.amenities.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-2">
                                            <div>
                                                <span className="text-sm text-gray-500">From</span>
                                                <p className="text-3xl font-black text-gray-900">Rs {hotel.price}</p>
                                                <span className="text-xs text-gray-500">/night</span>
                                            </div>
                                            <Button to={`${basePath}/${hotel.id}`} className="px-6 py-2">View Details</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredHotels.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <HeroIcon className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No hotels found</h3>
                                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                                <button onClick={() => { setFilters({ location: [], rating: [], amenities: [] }); setPriceRange([0, 50000]); }} className="mt-4 text-primary font-bold hover:underline">Clear all filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TrustSection />
            <CTASection
                title={ctaTitle}
                description={ctaText}
            />
        </div>
    );
};

export default HotelListingTemplate;
