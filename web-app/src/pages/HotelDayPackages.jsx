import React, { useState, useMemo } from 'react';
import { Sun, Utensils, Waves, Sparkles, Star, Clock, MapPin, DollarSign } from 'lucide-react';
import Button from '../components/Button';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar from '../components/FilterSidebar';
import ServiceCard from '../components/ServiceCard';
import PageHero from '../components/PageHero';
import ListingHeader from '../components/ListingHeader';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';
import Pagination from '../components/Pagination';

import { useDayPackages } from '../hooks/useDayPackages';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const HotelDayPackages = () => {
    const { packages: dayPackages, loading, error } = useDayPackages();
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [filters, setFilters] = useState({
        location: [],
        category: [],
        amenities: [] // Using 'includes' as amenities
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Extract unique values
    const locations = [...new Set(dayPackages.map(pkg => pkg.location))];
    const categories = [...new Set(dayPackages.map(pkg => pkg.category))];
    const allAmenities = [...new Set(dayPackages.flatMap(pkg => pkg.includes))];

    // Filter logic
    const filteredPackages = useMemo(() => {
        const filtered = dayPackages.filter(pkg => {
            const price = parseInt(pkg.price.replace(/,/g, ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            const matchesLocation = filters.location.length === 0 || filters.location.includes(pkg.location);
            const matchesCategory = filters.category.length === 0 || filters.category.includes(pkg.category);
            const matchesAmenities = filters.amenities.length === 0 ||
                filters.amenities.every(inc => pkg.includes.includes(inc));

            return matchesPrice && matchesLocation && matchesCategory && matchesAmenities;
        });
        setCurrentPage(1); // Reset to first page on filter change
        return filtered;
    }, [filters, priceRange]);

    const paginatedPackages = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPackages.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPackages, currentPage]);

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Hotel Day Packages"
                subtitle="Experience luxury hotels without an overnight stay - perfect for day trips!"
                image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop"
                icon={Sun}
            />

            <div className="">
                {/* Content... */}
            </div>

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="package"
                            filters={filters}
                            setFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            locations={locations}
                            categories={categories}
                            amenities={allAmenities}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        {/* Toolbar */}
                        <ListingHeader
                            count={filteredPackages.length}
                            label="packages"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Grid/List */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                            {paginatedPackages.map((pkg, index) => (
                                <div
                                    key={pkg.id}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                    className={`${viewMode === 'list' ? 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row' : ''}`}
                                >
                                    {viewMode === 'grid' ? (
                                        <ServiceCard
                                            product={{
                                                _id: pkg.id,
                                                name: pkg.name,
                                                images: [pkg.image],
                                                location: pkg.location,
                                                category: pkg.category + " Package",
                                                pricing: { price: parseInt(pkg.price.replace(/,/g, '')) },
                                                rating: pkg.rating
                                            }}
                                        />
                                    ) : (
                                        // List View Implementation
                                        <>
                                            <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                                                <img
                                                    src={pkg.image}
                                                    alt={pkg.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1 text-orange-500">
                                                        <Star size={16} fill="currentColor" />
                                                        <span className="font-bold text-sm">{pkg.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full shadow-lg">
                                                    <span className="text-xs font-bold uppercase">{pkg.category}</span>
                                                </div>
                                            </div>
                                            <div className="p-6 w-full md:w-3/5 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                                                    <p className="text-primary font-semibold text-sm mb-3">{pkg.hotel}</p>

                                                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={16} className="text-primary" />
                                                            <span className="text-sm">{pkg.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={16} className="text-primary" />
                                                            <span className="text-sm">{pkg.location}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {pkg.includes.map((item, i) => (
                                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-sm text-gray-500">Only</span>
                                                        <p className="text-3xl font-black text-gray-900">
                                                            Rs {pkg.price}
                                                        </p>
                                                        <span className="text-xs text-gray-500">per person</span>
                                                    </div>
                                                    <Button
                                                        to={`/services/${pkg.id}`}
                                                        className="px-6 py-2"
                                                    >
                                                        View Package
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
                            totalItems={filteredPackages.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />

                        {filteredPackages.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <Sun className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No packages found</h3>
                                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                                <button
                                    onClick={() => {
                                        setFilters({ location: [], category: [], amenities: [] });
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
                title="Ready for a Day of Luxury?"
                description="Book your hotel day package and indulge in premium amenities."
                buttonText="Reserve Your Day"
            />
        </div>
    );
};

export default HotelDayPackages;
