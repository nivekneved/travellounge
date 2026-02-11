import { useNavigate, Link } from 'react-router-dom';
import { Building2, Star, MapPin, ArrowLeft, Heart, CheckCircle, Maximize, Waves } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Button from '../Button';

const MySwal = withReactContent(Swal);

const HotelDetailsTemplate = ({ hotel, backLink, backText }) => {
    const navigate = useNavigate();

    // Handle booking specific room or general hotel booking
    const handleBookRoom = (room) => {
        const params = new URLSearchParams({
            serviceName: room ? `${hotel.name} - ${room.name}` : hotel.name,
            serviceId: hotel.id,
            price: (room ? room.price : hotel.price).replace(/,/g, ''),
            image: room ? room.image : hotel.image
        });
        navigate(`/booking?${params.toString()}`);
    };

    const handleSaveHotel = () => {
        MySwal.fire({
            icon: 'success',
            title: 'Saved!',
            text: `${hotel.name} has been added to your wishlist.`,
            confirmButtonColor: '#e60000',
            timer: 2000,
            showConfirmButton: false
        });
    };

    if (!hotel) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Hotel Not Found</h2>
                    <Link to={backLink} className="text-primary hover:underline">← {backText}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to={backLink} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>{backText}</span>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 size={32} className="text-primary" />
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                {[...Array(hotel.starRating || 5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" className="text-yellow-400" />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{hotel.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">{hotel.name}</h1>
                        <div className="flex items-center gap-2 text-xl text-gray-200">
                            <MapPin size={24} />
                            <span>{hotel.location}</span>
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
                            <h2 className="text-3xl font-black mb-6">About the Hotel</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{hotel.description}</p>
                        </div>

                        {/* Amenities Grid */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Hotel Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {hotel.amenities?.map((amenity, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-gray-100">
                                        <div className="text-primary mb-3">
                                            {amenity.icon}
                                        </div>
                                        <span className="text-gray-700 font-medium text-center">{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Room Selection */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Choose Your Room</h2>
                            <div className="space-y-8">
                                {hotel.rooms?.map((room) => (
                                    <div key={room.id} className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                                        <div className="grid grid-cols-1 md:grid-cols-3">
                                            {/* Room Image */}
                                            <div className="h-64 md:h-auto relative">
                                                <img
                                                    src={room.image}
                                                    alt={room.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Room Details */}
                                            <div className="p-6 md:col-span-2 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-primary">Rs {room.price}</div>
                                                            <div className="text-sm text-gray-500">per night</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                                                            <Maximize size={16} />
                                                            <span>{room.size}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                                                            <Maximize size={16} className="rotate-45" />
                                                            <span>{room.bed}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                                                            <Waves size={16} />
                                                            <span>{room.view}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {room.features.map((feature, i) => (
                                                            <span key={i} className="flex items-center gap-1 text-sm text-gray-600">
                                                                <CheckCircle size={14} className="text-green-500" />
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBookRoom(room)}
                                                    className="w-full md:w-auto bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-primary transition-colors self-start"
                                                >
                                                    Select This Room
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Booking Sidebar (General) */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Stays from</span>
                                <div className="text-5xl font-black text-gray-900">Rs {hotel.price}</div>
                                <span className="text-gray-500">per night</span>
                            </div>

                            <button
                                onClick={() => handleBookRoom(null)}
                                className="block w-full bg-primary text-white text-center font-bold py-4 px-8 rounded-full hover:bg-red-700 transition-all hover:scale-105 mb-4 shadow-lg shadow-primary/20"
                            >
                                Check Availability
                            </button>

                            <button
                                onClick={handleSaveHotel}
                                className="w-full border-2 border-primary text-primary font-bold py-4 px-8 rounded-full hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Heart size={20} />
                                Save Hotel
                            </button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Best Price Guarantee</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Found a lower price elsewhere? We'll match it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsTemplate;
