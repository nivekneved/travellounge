import React, { useState, useMemo } from 'react';
import { Activity, Heart, Camera, Mountain, Fish, Bike, Waves, MapPin, Clock, Star, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ViewToggle from '../components/ViewToggle';
import FilterSidebar from '../components/FilterSidebar';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSearchParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import PageHero from '../components/PageHero';
import TrustSection from '../components/TrustSection';
import ListingHeader from '../components/ListingHeader';

const Activities = () => {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category');

    const { activities, loading, error } = useActivities(initialCategory);
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [filters, setFilters] = useState({
        location: [],
        category: initialCategory ? [initialCategory] : [],
        amenities: []
    });

    const locations = [...new Set(activities.map(a => a.location))];
    const categories = [...new Set(activities.map(a => a.category))];
    const allAmenities = [...new Set(activities.flatMap(a => a.amenities))];

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const price = parseInt(activity.price.replace(/,/g, ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            const matchesLocation = filters.location.length === 0 || filters.location.includes(activity.location);
            const matchesCategory = filters.category.length === 0 || filters.category.includes(activity.category);
            const matchesAmenities = filters.amenities.length === 0 ||
                filters.amenities.every(a => activity.amenities.includes(a));

            return matchesPrice && matchesLocation && matchesCategory && matchesAmenities;
        });
    }, [activities, filters, priceRange]);

    if (loading) return <LoadingSpinner message="Loading activities..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load activities" />;

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            {/* Hero Section */}
            <PageHero
                title="Island Activities"
                subtitle="Discover the best adventures and experiences in Mauritius."
                image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920"
                icon={Waves}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <FilterSidebar
                            type="activity"
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
                            count={filteredActivities.length}
                            label="activities"
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Grid/List */}
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                            {filteredActivities.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                    className={`${viewMode === 'list' ? 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row' : ''}`}
                                >
                                    {viewMode === 'grid' ? (
                                        <ServiceCard
                                            product={{
                                                _id: activity.id,
                                                name: activity.name,
                                                images: [activity.image],
                                                location: activity.location,
                                                category: activity.category,
                                                pricing: { price: parseInt(activity.price.replace(/,/g, '')) },
                                                rating: activity.rating,
                                                type: 'Activity'
                                            }}
                                        />
                                    ) : (
                                        // List View Implementation
                                        <>
                                            <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                                                <img
                                                    src={activity.image}
                                                    alt={activity.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1 text-orange-500">
                                                        <Star size={16} fill="currentColor" />
                                                        <span className="font-bold text-sm">{activity.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full shadow-lg">
                                                    <span className="text-xs font-bold uppercase">{activity.category}</span>
                                                </div>
                                            </div>
                                            <div className="p-6 w-full md:w-3/5 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-1">{activity.name}</h3>
                                                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={16} className="text-primary" />
                                                            <span className="text-sm">{activity.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={16} className="text-primary" />
                                                            <span className="text-sm">{activity.location}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {activity.amenities.map((item, i) => (
                                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-sm text-gray-500">From</span>
                                                        <p className="text-3xl font-black text-gray-900">
                                                            Rs {activity.price}
                                                        </p>
                                                        <span className="text-xs text-gray-500">per person</span>
                                                    </div>
                                                    <Button
                                                        to={`/services/${activity.id}`}
                                                        className="px-6 py-2"
                                                    >
                                                        View Activity
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredActivities.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                <Activity className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No activities found</h3>
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
            {/* Categories Section - White Background */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20">
                <h2 className="text-4xl font-black text-center mb-12">Activity <span className="text-primary">Categories</span></h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Heart className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Water Sports</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Fish className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Fishing</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Mountain className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Hiking</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Bike className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Cycling</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Camera className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Sightseeing</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl hover:bg-primary hover:text-white transition-all group">
                        <Activity className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <p className="font-bold">Adventure</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="bg-gradient-to-br from-primary to-red-700 rounded-3xl p-12 md:p-16 text-center text-white">
                    <h2 className="text-4xl font-black mb-6">Ready for Adventure?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Book your activities and make memories that last a lifetime.
                    </p>
                    <Button
                        to="/contact"
                        className="bg-white text-primary hover:bg-gray-100 shadow-xl py-4 px-10"
                    >
                        Browse All Activities
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Activities;
