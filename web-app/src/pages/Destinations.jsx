import React from 'react';
import { Plane, Hotel, Ticket, Palmtree, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import Button from '../components/Button';
import PageHero from '../components/PageHero';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';

const destinations = [
    {
        id: 1,
        name: "Dubai Luxury Package",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
        duration: "5 Days / 4 Nights",
        price: "85,000",
        rating: 4.9,
        includes: ["Flights", "5-Star Hotel", "City Tour", "Desert Safari"]
    },
    {
        id: 2,
        name: "Bangkok Adventure",
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1200&auto=format&fit=crop",
        duration: "6 Days / 5 Nights",
        price: "68,000",
        rating: 4.8,
        includes: ["Flights", "Hotel", "Tours", "Transfers"]
    },
    {
        id: 3,
        name: "Malaysia Discovery",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
        duration: "7 Days / 6 Nights",
        price: "76,000",
        rating: 4.7,
        includes: ["Flights", "Accommodation", "Island Hopping", "Meals"]
    },
    {
        id: 4,
        name: "Maldives Paradise",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
        duration: "5 Days / 4 Nights",
        price: "135,000",
        rating: 5.0,
        includes: ["Flights", "Water Villa", "All Inclusive", "Spa"]
    },
    {
        id: 5,
        name: "Seychelles Escape",
        image: "https://images.unsplash.com/photo-1535916707205-153cd3e42997?q=80&w=1200&auto=format&fit=crop",
        duration: "6 Days / 5 Nights",
        price: "115,000",
        rating: 4.9,
        includes: ["Flights", "Beach Resort", "Excursions", "Breakfast"]
    },
    {
        id: 6,
        name: "South Africa Explorer",
        image: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?q=80&w=1200&auto=format&fit=crop",
        duration: "8 Days / 7 Nights",
        price: "125,000",
        rating: 4.8,
        includes: ["Flights", "Hotels", "Safari", "Cape Town Tour"]
    }
];

const Destinations = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Dream Destinations"
                subtitle="Complete vacation packages to the world's most sought-after destinations."
                image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1920&auto=format&fit=crop"
                icon={Plane}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20 text-center text-gray-900">
                <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">Explore the World</h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
                    From tropical islands to vibrant cities, we offer all-inclusive packages with flights, accommodation, and unforgettable experiences. Let us handle every detail of your perfect getaway.
                </p>
            </div>

            {/* Destinations Grid - Light Grey Background */}
            <div className="bg-gray-100 py-20">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {destinations.map((dest, index) => (
                            <div
                                key={dest.id}
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <ServiceCard
                                    product={{
                                        _id: dest.id,
                                        name: dest.name,
                                        images: [dest.image],
                                        location: dest.duration, // Mapping duration to location for display
                                        category: "Destination",
                                        pricing: { price: parseInt(dest.price.replace(/,/g, '')) },
                                        rating: dest.rating
                                    }}
                                    customLink={`/destinations/${dest.id}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section - White Background */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">All Inclusive</h3>
                        <p className="text-gray-600">
                            Flights, accommodation, and activities all bundled in one price.
                        </p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Hotel className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Premium Stays</h3>
                        <p className="text-gray-600">
                            Carefully selected hotels and resorts for maximum comfort.
                        </p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Palmtree className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Exclusive Experiences</h3>
                        <p className="text-gray-600">
                            Unique tours and activities curated for unforgettable moments.
                        </p>
                    </div>
                </div>
            </div>

            <TrustSection />

            <CTASection
                title="Begin Your Journey"
                description="Let our travel experts craft the perfect destination package for you."
                buttonText="Plan Your Trip"
                variant="dark"
            />
        </div>
    );
};

export default Destinations;
