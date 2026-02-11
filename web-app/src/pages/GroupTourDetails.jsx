import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, MapPin, Globe, Star, ArrowLeft, Heart, CheckCircle, Camera } from 'lucide-react';
import Button from '../components/Button';

// Import the same tour data from GroupTours page
const groupTours = [
    {
        id: 1,
        name: "European Highlights Tour",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop",
        duration: "12 Days",
        destinations: "Paris, Rome, Venice, Barcelona",
        groupSize: "10-15 people",
        price: "160,000",
        rating: 4.8,
        includes: ["Accommodation", "Most meals", "Transport", "Guided tours"],
        description: "Discover the magic of Europe on this 12-day journey through four of its most iconic cities. From the romance of Paris to the ancient history of Rome, the canals of Venice, and the vibrant architecture of Barcelona, this tour offers a perfect blend of guided sightseeing and free time.",
        itinerary: [
            { day: 1, title: "Arrival in Paris", description: "Welcome dinner and evening Eiffel Tower visit." },
            { day: 2, title: "Paris Sightseeing", description: "Louvre Museum, Notre Dame, and Seine River cruise." },
            { day: 3, title: "Paris to Venice", description: "Flight to Venice, evening gondola ride." },
            { day: 4, title: "Venice Exploration", description: "St. Mark's Basilica, Doge's Palace, and glass blowing demo." },
            { day: 5, title: "Venice to Rome", description: "High-speed train to Rome, evening piazza walking tour." },
            { day: 6, title: "Ancient Rome", description: "Colosseum, Roman Forum, and Palatine Hill." },
            { day: 7, title: "Vatican City", description: "St. Peter's Basilica, Vatican Museums, and Sistine Chapel." },
            { day: 8, title: "Rome to Barcelona", description: "Flight to Barcelona, tapestry workshop." },
            { day: 9, title: "Gaudí's Barcelona", description: "Sagrada Família, Park Güell, and Casa Batlló." },
            { day: 10, title: "Gothic Quarter", description: "Walking tour of the Gothic Quarter and tapas tasting." },
            { day: 11, title: "Free Day in Barcelona", description: "Optional beach visit or shopping on Las Ramblas." },
            { day: 12, title: "Departure", description: "Breakfast and transfer to airport." }
        ],
        includedList: [
            "11 nights in 4-star hotels",
            "Daily breakfast and 6 dinners",
            "All internal flights and trains",
            "Expert tour director",
            "Admission to all listed attractions",
            "Private deluxe motorcoach"
        ]
    },
    {
        id: 2,
        name: "African Safari Adventure",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
        duration: "10 Days",
        destinations: "Kenya, Tanzania, Serengeti",
        groupSize: "8-12 people",
        price: "225,000",
        rating: 4.9,
        includes: ["4x4 Safari vehicles", "Park fees", "Expert guides", "Lodge stays"],
        description: "Experience the thrill of the wild on this 10-day safari adventure through Kenya and Tanzania. Witness the Great Migration, spot the Big Five, and stay in luxury lodges under the stars.",
        itinerary: [
            { day: 1, title: "Arrival in Nairobi", description: "Welcome meeting and dinner at Carnivore Restaurant." },
            { day: 2, title: "Masai Mara", description: "Drive to Masai Mara, afternoon game drive." },
            { day: 3, title: "Masai Mara Full Day", description: "Full day game viewing, picnic lunch in the reserve." },
            { day: 4, title: "Lake Nakuru", description: "Game drive in Lake Nakuru National Park, rhino sanctuary." },
            { day: 5, title: "Amboseli", description: "Drive to Amboseli National Park, views of Mt. Kilimanjaro." },
            { day: 6, title: "Cross to Tanzania", description: "Border crossing, drive to Lake Manyara." },
            { day: 7, title: "Serengeti National Park", description: "Afternoon game drive in the endless plains." },
            { day: 8, title: "Serengeti to Ngorongoro", description: "Morning game drive, transfer to Ngorongoro Crater." },
            { day: 9, title: "Ngorongoro Crater", description: "Descend into the crater for a full day of wildlife viewing." },
            { day: 10, title: "Arusha and Departure", description: "Drive to Arusha, farewell lunch, airport transfer." }
        ],
        includedList: [
            "9 nights in luxury lodges and tented camps",
            "All meals included",
            "4x4 Land Cruiser transportation",
            "Professional English-speaking driver/guides",
            "All park entrance fees",
            "Flying Doctors emergency evacuation cover"
        ]
    },
    {
        id: 3,
        name: "Southeast Asia Explorer",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop",
        duration: "14 Days",
        destinations: "Thailand, Vietnam, Cambodia, Laos",
        groupSize: "12-18 people",
        price: "135,000",
        rating: 4.7,
        includes: ["Hotels", "Breakfast daily", "Cultural visits", "Local guides"],
        description: "Immerse yourself in the rich cultures, delicious cuisines, and stunning landscapes of Southeast Asia. Visit ancient temples, bustling markets, and serene bays.",
        itinerary: [
            { day: 1, title: "Arrival in Bangkok", description: "Welcome dinner and street food tour." },
            { day: 2, title: "Bangkok Temples", description: "Grand Palace, Wat Arun, and Wat Pho." },
            { day: 3, title: "Fly to Chiang Mai", description: "Evening visit to the Night Bazaar." },
            { day: 4, title: "Elephant Sanctuary", description: "Ethical elephant interactions and cooking class." },
            { day: 5, title: "Luang Prabang, Laos", description: "Flight to Laos, sunset at Mount Phousi." },
            { day: 6, title: "Kuang Si Falls", description: "Alms giving ceremony and waterfall swim." },
            { day: 7, title: "Hanoi, Vietnam", description: "Flight to Hanoi, water puppet show." },
            { day: 8, title: "Halong Bay", description: "Overnight cruise on a traditional junk boat." },
            { day: 9, title: "Hanoi to Hoi An", description: "Flight to Da Nang, transfer to ancient town Hoi An." },
            { day: 10, title: "Hoi An Walking Tour", description: "Lantern making workshop and tailoring." },
            { day: 11, title: "Ho Chi Minh City", description: "Flight to HCMC, War Remnants Museum." },
            { day: 12, title: "Mekong Delta", description: "Day trip to the delta, boat rides and fruit tasting." },
            { day: 13, title: "Siem Reap, Cambodia", description: "Flight to Siem Reap, Phare circus show." },
            { day: 14, title: "Angkor Wat", description: "Sunrise at Angkor Wat, temple tour, departure." }
        ],
        includedList: [
            "13 nights accommodation",
            "Daily breakfast and 5 dinners",
            "All internal flights",
            "Boat cruises and tours",
            "Local guides at each destination",
            "Entrance fees to monuments"
        ]
    },
    // Add other tours similarly...
    {
        id: 4,
        name: "South American Discovery",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop",
        duration: "15 Days",
        destinations: "Peru, Bolivia, Chile, Argentina",
        groupSize: "10-14 people",
        price: "245,000",
        rating: 4.8,
        includes: ["Machu Picchu", "Salt flats", "Wine tours", "All transport"],
        description: "A comprehensive journey through the Andes and beyond. Explore Incan ruins, vast salt flats, lunar landscapes, and vibrant capital cities.",
        itinerary: [
            { day: 1, title: "Arrival in Lima", description: "Transfer to hotel, welcome dinner." },
            { day: 2, title: "Cusco", description: "Flight to Cusco, city tour and acclimatization." },
            { day: 3, title: "Sacred Valley", description: "Pisac market and Ollantaytambo fortress." },
            { day: 4, title: "Machu Picchu", description: "Train to Aguas Calientes, guided tour of the citadel." },
            { day: 5, title: "Cusco to La Paz", description: "Flight to La Paz, Bolivia. Witches Market tour." },
            { day: 6, title: "Uyuni Salt Flats", description: "Flight to Uyuni, 4x4 tour of the salt flats." },
            { day: 7, title: "Eduardo Avaroa Reserve", description: "Colored lagoons and geysers." },
            { day: 8, title: "San Pedro de Atacama", description: "Cross border to Chile, Valley of the Moon sunset." },
            { day: 9, title: "Atacama Geysers", description: "El Tatio Geysers at sunrise, stargazing tour." },
            { day: 10, title: "Santiago", description: "Flight to Santiago, city walking tour." },
            { day: 11, title: "Buenos Aires", description: "Flight to Argentina, tango show and dinner." },
            { day: 12, title: "Buenos Aires City", description: "La Boca, San Telmo, and Recoleta Cemetery." },
            { day: 13, title: "Iguazu Falls", description: "Flight to Iguazu, visit Argentine side of falls." },
            { day: 14, title: "Brazilian Falls", description: "Visit Brazilian side, helicopter ride option." },
            { day: 15, title: "Departure", description: "Transfer to airport for flight home." }
        ],
        includedList: [
            "14 nights in boutique hotels",
            "All breakfasts and 8 dinners",
            "Internal flights",
            "Private transport",
            "Machu Picchu train and entrance",
            "Uyuni 4x4 expedition"
        ]
    }
];

const GroupTourDetails = () => {
    const { id } = useParams();
    const [selectedDay, setSelectedDay] = useState(null);

    // Find tour (handle string id from params)
    const tour = groupTours.find(t => t.id === parseInt(id)) || groupTours[0]; // Fallback to first if not found (for demo)

    if (!tour) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tour Not Found</h2>
                    <Link to="/group-tours" className="text-primary hover:underline">← Back to Group Tours</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/group-tours" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Group Tours</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Users size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{tour.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">{tour.name}</h1>
                        <div className="flex flex-wrap gap-6 text-lg">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} />
                                <span>{tour.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />
                                <span>{tour.destinations}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={20} />
                                <span>{tour.groupSize}</span>
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
                            <p className="text-xl text-gray-700 leading-relaxed">{tour.description}</p>
                        </div>

                        {/* Itinerary */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Itinerary</h2>
                            <div className="border-l-2 border-primary/30 pl-8 space-y-8 relative">
                                {tour.itinerary?.map((day, index) => (
                                    <div key={index} className="relative">
                                        <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Day {day.day}: {day.title}</h3>
                                        <p className="text-gray-700 leading-relaxed">{day.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="bg-gray-50 rounded-3xl p-8">
                            <h2 className="text-3xl font-black mb-6">What's Included</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(tour.includedList || tour.includes).map((item, index) => (
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
                                <div className="text-5xl font-black text-gray-900">Rs {tour.price}</div>
                                <span className="text-gray-500">per person</span>
                            </div>

                            <Button
                                to="/contact"
                                className="w-full py-4 mb-4 shadow-lg shadow-primary/20"
                            >
                                Book This Tour
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                            >
                                <Heart size={20} />
                                Save to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Our travel experts are here to help you plan your perfect trip.
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

export default GroupTourDetails;
