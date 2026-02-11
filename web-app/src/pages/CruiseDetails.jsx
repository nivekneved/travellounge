import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Ship, Calendar, MapPin, Users, Star, ArrowLeft, Heart, CheckCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const cruisePackages = [
    {
        id: 1,
        name: "Mediterranean Grand Voyage",
        image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1200&auto=format&fit=crop",
        duration: "14 Days",
        ports: "Barcelona, Rome, Athens, Istanbul",
        price: "115,000",
        rating: 4.9,
        highlights: ["All meals included", "Shore excursions", "Entertainment"],
        description: "Embark on an unforgettable journey through the Mediterranean's most iconic destinations. This 14-day luxury cruise takes you from the vibrant streets of Barcelona through ancient Rome, historic Athens, and the mesmerizing Istanbul.",
        itinerary: [
            { day: 1, port: "Barcelona, Spain", activities: "Embarkation, Welcome dinner, Ship tour" },
            { day: 2, port: "At Sea", activities: "Relaxation, Spa treatments, Entertainment shows" },
            { day: 3, port: "Marseille, France", activities: "Old Port visit, Local cuisine tour" },
            { day: 4, port: "Monaco", activities: "Monte Carlo Casino, Prince's Palace" },
            { day: 5, port: "Rome, Italy", activities: "Colosseum, Vatican City, Trevi Fountain" },
            { day: 6, port: "Naples, Italy", activities: "Pompeii ruins, Pizza making class" },
            { day: 7, port: "At Sea", activities: "Cooking demonstrations, Pool parties" },
            { day: 8, port: "Santorini, Greece", activities: "Oia sunset, Wine tasting" },
            { day: 9, port: "Athens, Greece", activities: "Acropolis, Parthenon, Greek dinner" },
            { day: 10, port: "Mykonos, Greece", activities: "Beach day, Windmills, Shopping" },
            { day: 11, port: "At Sea", activities: "Captain's gala dinner, Shows" },
            { day: 12, port: "Istanbul, Turkey", activities: "Blue Mosque, Grand Bazaar, Turkish bath" },
            { day: 13, port: "Istanbul, Turkey", activities: "Bosphorus cruise, Topkapi Palace" },
            { day: 14, port: "Istanbul, Turkey", activities: "Disembarkation, Farewell breakfast" }
        ],
        included: [
            "All meals and snacks",
            "Shore excursions at every port",
            "Entertainment and shows",
            "Fitness center access",
            "Kids club activities",
            "WiFi in common areas"
        ]
    },
    {
        id: 2,
        name: "Caribbean Paradise Cruise",
        image: "https://images.unsplash.com/photo-1599640845513-534431838eb2?q=80&w=1200&auto=format&fit=crop",
        duration: "7 Days",
        ports: "Miami, Bahamas, Jamaica, Cayman Islands",
        price: "85,000",
        rating: 4.8,
        highlights: ["Private island access", "Water sports", "Casino & spa"],
        description: "Experience the ultimate Caribbean getaway with crystal-clear waters, white sandy beaches, and tropical paradise at every stop.",
        itinerary: [
            { day: 1, port: "Miami, USA", activities: "Embarkation, Sail away party" },
            { day: 2, port: "Nassau, Bahamas", activities: "Beach day, Atlantis resort visit" },
            { day: 3, port: "Private Island", activities: "Snorkeling, Beach BBQ, Water sports" },
            { day: 4, port: "At Sea", activities: "Pool parties, Casino, Spa" },
            { day: 5, port: "Ocho Rios, Jamaica", activities: "Dunn's River Falls, Jerk chicken tasting" },
            { day: 6, port: "Grand Cayman", activities: "Seven Mile Beach, Stingray City" },
            { day: 7, port: "Miami, USA", activities: "Disembarkation" }
        ],
        included: [
            "All meals",
            "Private island access",
            "Water sports equipment",
            "Casino access",
            "Spa facilities",
            "Entertainment"
        ]
    },
    {
        id: 3,
        name: "Alaska Wilderness Explorer",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
        duration: "10 Days",
        ports: "Seattle, Juneau, Skagway, Glacier Bay",
        price: "150,000",
        rating: 5.0,
        highlights: ["Glacier viewing", "Wildlife tours", "Premium dining"],
        description: "Witness the breathtaking beauty of Alaska's last frontier. From towering glaciers to abundant wildlife, this cruise offers a once-in-a-lifetime adventure.",
        itinerary: [
            { day: 1, port: "Seattle, USA", activities: "Embarkation, View of Space Needle" },
            { day: 2, port: "At Sea", activities: "Whale watching spots, Nature talks" },
            { day: 3, port: "Ketchikan", activities: "Totem Bight State Park, Creek Street" },
            { day: 4, port: "Juneau", activities: "Mendenhall Glacier, Mount Roberts Tramway" },
            { day: 5, port: "Skagway", activities: "White Pass & Yukon Route Railroad" },
            { day: 6, port: "Glacier Bay", activities: "Scenic cruising, Ranger presentation" },
            { day: 7, port: "Hubbard Glacier", activities: "Scenic cruising, Photography" },
            { day: 8, port: "Sitka", activities: "Russian Bishop's House, Fortress of the Bear" },
            { day: 9, port: "Victoria, BC", activities: "Butchart Gardens, High Tea" },
            { day: 10, port: "Seattle, USA", activities: "Disembarkation" }
        ],
        included: [
            "Glacier cruising",
            "Naturalist guides",
            "All dining venues",
            "Educational programs",
            "Evening entertainment",
            "Room service"
        ]
    },
    {
        id: 4,
        name: "Asian Coastal Discovery",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop",
        duration: "12 Days",
        ports: "Singapore, Thailand, Vietnam, Hong Kong",
        price: "125,000",
        rating: 4.7,
        highlights: ["Cultural excursions", "Cooking classes", "Spa treatments"],
        description: "Immerse yourself in the rich cultures and stunning landscapes of Asia. Visit bustling markets, ancient temples, and pristine bays on this diverse itinerary.",
        itinerary: [
            { day: 1, port: "Singapore", activities: "Embarkation, Gardens by the Bay" },
            { day: 2, port: "At Sea", activities: "Asian fusion cooking class, Pool relaxation" },
            { day: 3, port: "Ko Samui, Thailand", activities: "Big Buddha, Beach time" },
            { day: 4, port: "Bangkok (Laem Chabang)", activities: "Grand Palace, Wat Arun tour" },
            { day: 5, port: "Bangkok (Laem Chabang)", activities: "Floating market, Local shopping" },
            { day: 6, port: "Sihanoukville, Cambodia", activities: "Ream National Park, Beach relax" },
            { day: 7, port: "Ho Chi Minh City, Vietnam", activities: "War Remnants Museum, Cu Chi Tunnels" },
            { day: 8, port: "Nha Trang, Vietnam", activities: "Mud baths, Po Nagar Cham Towers" },
            { day: 9, port: "Da Nang (Hue/Hoi An)", activities: "Ancient Town tour, Marble Mountains" },
            { day: 10, port: "Halong Bay", activities: "Junk boat cruise, Cave exploration" },
            { day: 11, port: "At Sea", activities: "Farewell gala dinner, Karaoke" },
            { day: 12, port: "Hong Kong", activities: "Disembarkation, Victoria Peak" }
        ],
        included: [
            "Authentic Asian cuisine",
            "Cultural workshops",
            "Port taxes and fees",
            "Beverage package",
            "Fitness classes",
            "Concierge service"
        ]
    },
    {
        id: 5,
        name: "Norwegian Fjords Journey",
        image: "https://images.unsplash.com/photo-1506307129524-7b0a70823555?q=80&w=1200&auto=format&fit=crop",
        duration: "9 Days",
        ports: "Copenhagen, Bergen, Geiranger, Oslo",
        price: "135,000",
        rating: 4.9,
        highlights: ["Fjord viewpoints", "Northern lights", "Local cuisine"],
        description: "Sail through the majestic Norwegian Fjords, where waterfalls cascade down towering cliffs and charming villages dot the shoreline. A journey of spectacular natural beauty.",
        itinerary: [
            { day: 1, port: "Copenhagen, Denmark", activities: "Embarkation, Nyhavn walk" },
            { day: 2, port: "At Sea", activities: "Nordic spa experience, Viking history talk" },
            { day: 3, port: "Stavanger", activities: "Pulpit Rock hike, Old Stavanger" },
            { day: 4, port: "Bergen", activities: "Bryggen Wharf, Floibanen Funicular" },
            { day: 5, port: "Flam", activities: "Flam Railway, Nærøyfjord cruise" },
            { day: 6, port: "Geiranger", activities: "Geirangerfjord scenic cruising, Seven Sisters waterfall" },
            { day: 7, port: "Alesund", activities: "Art Nouveau architecture tour, Mt. Aksla" },
            { day: 8, port: "Oslo", activities: "Vigeland Park, Viking Ship Museum" },
            { day: 9, port: "Copenhagen, Denmark", activities: "Disembarkation" }
        ],
        included: [
            "Panoramic fjord views",
            "Local seafood tastings",
            "Sauna access",
            "Guided hikes",
            "Entertainment",
            "All onboard meals"
        ]
    },
    {
        id: 6,
        name: "South Pacific Explorer",
        image: "https://images.unsplash.com/photo-1580541631950-7282082b53ce?q=80&w=1200&auto=format&fit=crop",
        duration: "15 Days",
        ports: "Sydney, Fiji, Bora Bora, Tahiti",
        price: "200,000",
        rating: 5.0,
        highlights: ["Beach excursions", "Snorkeling gear", "Luxury cabins"],
        description: "Escape to paradise on this trans-Pacific voyage. Discover turquoise lagoons, overwater bungalows, and the warm hospitality of the South Pacific islands.",
        itinerary: [
            { day: 1, port: "Sydney, Australia", activities: "Embarkation, Opera House view" },
            { day: 2, port: "At Sea", activities: "Pool deck relaxation, Enrichment lectures" },
            { day: 3, port: "At Sea", activities: "Culinary demonstration, Stargazing" },
            { day: 4, port: "Noumea, New Caledonia", activities: "Amedee Lighthouse, Snorkeling" },
            { day: 5, port: "Mystery Island, Vanuatu", activities: "Beach day, Cultural village" },
            { day: 6, port: "Lautoka, Fiji", activities: "Garden of the Sleeping Giant, Mud pools" },
            { day: 7, port: "Suva, Fiji", activities: "Fiji Museum, Local market" },
            { day: 8, port: "At Sea", activities: "Cross International Date Line" },
            { day: 9, port: "Apia, Samoa", activities: "Robert Louis Stevenson Museum, To Sua Trench" },
            { day: 10, port: "Pago Pago, American Samoa", activities: "National Park visit, Two Dollar Beach" },
            { day: 11, port: "At Sea", activities: "Polynesian dance class, Lei making" },
            { day: 12, port: "Bora Bora, French Polynesia", activities: "Lagoon cruise, Shark feeding" },
            { day: 13, port: "Bora Bora, French Polynesia", activities: "Mt. Otemanu view, Beach time" },
            { day: 14, port: "Moorea, French Polynesia", activities: "Belvedere Lookout, Pineapple plantation" },
            { day: 15, port: "Papeete, Tahiti", activities: "Disembarkation, Market visit" }
        ],
        included: [
            "Island excursions",
            "Snorkeling equipment",
            "Cultural shows",
            "Luxury dining",
            "Beverage package",
            "Gratuities"
        ]
    }
];



const CruiseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = useState(null);

    // Convert id to integer for comparison
    const cruise = cruisePackages.find(c => c.id === parseInt(id));

    const handleBook = () => {
        const params = new URLSearchParams({
            serviceName: cruise.name,
            serviceId: cruise.id,
            price: typeof cruise.price === 'string' ? cruise.price.replace(/,/g, '') : cruise.price,
            image: cruise.image
        });
        navigate(`/booking?${params.toString()}`);
    };

    const handleSave = () => {
        MySwal.fire({
            icon: 'success',
            title: 'Saved!',
            text: `${cruise.name} has been added to your wishlist.`,
            confirmButtonColor: '#e60000',
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Duplicate function removed

    // Duplicate removed

    if (!cruise) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Cruise Not Found</h2>
                    <p className="text-gray-600 mb-6">The cruise you're looking for appears to be unavailable.</p>
                    <Link to="/cruises" className="text-primary hover:underline">← Back to All Cruises</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/cruises" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to All Cruises</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={cruise.image}
                    alt={cruise.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Ship size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{cruise.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">{cruise.name}</h1>
                        <div className="flex flex-wrap gap-6 text-lg">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} />
                                <span>{cruise.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />
                                <span>{cruise.ports}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full px-4 md:px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Overview</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{cruise.description}</p>
                        </div>

                        {/* Itinerary */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Day-by-Day Itinerary</h2>
                            <div className="space-y-4">
                                {cruise.itinerary?.map((day, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all cursor-pointer"
                                        onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-black text-xl">
                                                {day.day}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{day.port}</h3>
                                                <p className="text-gray-700">{day.activities}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="bg-gray-50 rounded-3xl p-8">
                            <h2 className="text-3xl font-black mb-6">What's Included</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cruise.included?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">From</span>
                                <div className="text-5xl font-black text-gray-900">Rs {cruise.price}</div>
                                <span className="text-gray-500">per person</span>
                            </div>

                            <Button
                                onClick={handleBook}
                                className="w-full py-4 mb-4 shadow-lg shadow-primary/20"
                            >
                                Book This Cruise
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                                onClick={handleSave}
                            >
                                <Heart size={20} />
                                Save to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Our cruise specialists are available 24/7 to answer your questions.
                                </p>
                                <Link
                                    to="/contact"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    Contact Us →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CruiseDetails;
