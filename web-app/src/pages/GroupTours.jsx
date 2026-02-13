import React, { useState, useMemo } from 'react';
import { Users, Calendar, MapPin, Search, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar from '../components/FilterSidebar';

import { useGroupTours } from '../hooks/useGroupTours';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PageHero from '../components/PageHero';
import ListingHeader from '../components/ListingHeader';
import Pagination from '../components/Pagination';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';

const GroupTours = () => {
    const { tours, loading, error } = useGroupTours();
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [filters, setFilters] = useState({
        location: [],
        rating: [],
        amenities: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const categories = [...new Set(tours.map(t => t.category))];

    const filteredTours = useMemo(() => {
        const filtered = tours.filter(tour => {
            const price = typeof tour.price === 'string' ?
                parseInt(tour.price.replace(/,/g, '')) :
                (typeof tour.price === 'number' ? tour.price : 0);
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            const matchesLocation = filters.location.length === 0 || filters.location.includes(tour.category);
            const matchesRating = filters.rating.length === 0 || filters.rating.includes(Math.floor(tour.rating));

            return matchesPrice && matchesLocation && matchesRating;
        });
        setCurrentPage(1); // Reset to first page on filter change
        return filtered;
    }, [tours, filters, priceRange]);

    const paginatedTours = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTours.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTours, currentPage]);

    if (loading) return <LoadingSpinner message="Loading inspired journeys..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load tours" />;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <PageHero
                title="Guided Group Tours"
                subtitle="Join our exclusive small-group journeys to the world's most breathtaking destinations."
                image="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1920"
                icon={Users}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="tour"
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
                            count={filteredTours.length}
                            label="tours"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Grid/List */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                            {paginatedTours.map((tour, index) => (
                                <div
                                    key={tour.id}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                    className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                                >
                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full md:w-2/5 h-64 md:h-auto' : 'h-64'}`}>
                                        <img
                                            src={tour.image}
                                            alt={tour.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-sm font-bold text-gray-900 flex items-center gap-1">
                                            <Star size={14} className="text-orange-500" fill="currentColor" />
                                            {tour.rating}
                                        </div>
                                    </div>

                                    <div className={`p-6 flex flex-col justify-between ${viewMode === 'list' ? 'w-full md:w-3/5' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                                    {tour.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-primary" />
                                                    <span>{tour.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} className="text-primary" />
                                                    <span>{tour.groupSize || 'Standard Group'}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {(tour.highlights || []).slice(0, 3).map((highlight, i) => (
                                                    <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                                                        {highlight}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-2xl font-black text-gray-900">
                                                    Rs {tour.price}
                                                </p>
                                                <span className="text-xs text-gray-500">per person</span>
                                            </div>
                                            <Button
                                                to={`/services/${tour.id}`}
                                                size="sm"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTours.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />

                        {filteredTours.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No tours found</h3>
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

            {/* Why Group Tours Section - White Background */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Make Friends</h3>
                        <p className="text-gray-600">
                            Travel with small groups of like-minded adventurers and create lasting friendships.
                        </p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Expert Guides</h3>
                        <p className="text-gray-600">
                            Our local guides know the hidden gems and stories that you won't find in guidebooks.
                        </p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Best Value</h3>
                        <p className="text-gray-600">
                            Enjoy premium experiences at better rates by sharing the journey with others.
                        </p>
                    </div>
                </div>
            </div>

            <TrustSection />

            <CTASection
                title="Ready for an Adventure?"
                description="Book your spot on one of our popular group tours today."
                buttonText="Inquire Now"
                variant="dark"
            />
        </div>
    );
};

export default GroupTours;
