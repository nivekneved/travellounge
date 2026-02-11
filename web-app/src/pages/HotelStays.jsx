import React from 'react';
import { Bed, Star, MapPin, Wifi, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import TrustSection from '../components/TrustSection';
import CTASection from '../components/CTASection';
import Button from '../components/Button';

const hotelStays = [
    {
        id: 1,
        name: "Weekend Getaway",
        hotel: "Beachcomber Resort",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
        nights: "2 Nights",
        price: "15,000",
        rating: 4.9,
        includes: ["Breakfast", "WiFi", "Pool Access", "Beach"]
    },
    {
        id: 2,
        name: "Romantic Escape",
        hotel: "LUX* Belle Mare",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        nights: "3 Nights",
        price: "45,000",
        rating: 5.0,
        includes: ["Half Board", "Spa Discount", "Sunset Cruise", "WiFi"]
    },
    {
        id: 3,
        name: "Family Holiday Package",
        hotel: "Sugar Beach Resort",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
        nights: "5 Nights",
        price: "75,000",
        rating: 4.8,
        includes: ["All Meals", "Kids Club", "Activities", "WiFi"]
    },
    {
        id: 4,
        name: "Luxury Week",
        hotel: "Shangri-La Le Touessrok",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
        nights: "7 Nights",
        price: "145,000",
        rating: 5.0,
        includes: ["All Inclusive", "Golf", "Spa", "Private Island"]
    }
];

const HotelStays = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHero
                title="Hotel Stays"
                subtitle="Special packages for your perfect island escape."
                image="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop"
                icon={Bed}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-6">Your Perfect Stay</h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    Handpicked hotel packages with exclusive rates and added value. From romantic getaways to family holidays.
                </p>
            </div>

            <div className="bg-gray-100 py-20">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {hotelStays.map((stay, index) => (
                            <div key={stay.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                                <div className="relative h-64 overflow-hidden">
                                    <img src={stay.image} alt={stay.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                                        <div className="flex items-center gap-1 text-orange-500">
                                            <Star size={16} fill="currentColor" /><span className="font-bold text-sm">{stay.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-2">{stay.name}</h3>
                                    <p className="text-primary font-semibold text-sm mb-2">{stay.hotel}</p>
                                    <p className="text-gray-600 text-sm mb-6">{stay.nights}</p>
                                    <div className="border-t border-gray-100 pt-4 mb-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {stay.includes.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div><span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-3xl font-black text-gray-900">Rs {stay.price}</p>
                                            <span className="text-xs text-gray-500">total</span>
                                        </div>
                                        <Link to={`/hotel-stays/${stay.id}`} className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all hover:scale-105">View Details</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TrustSection />

            <CTASection
                title="Book Your Stay Today"
                description="Exclusive rates and packages at Mauritius' finest hotels."
                buttonText="Contact Us"
            />
        </div>
    );
};

export default HotelStays;
