import React from 'react';
import { MapPin, Star, Heart, Eye, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const ServiceCard = ({ product, hideRating = false, customLink, discountBadge }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product?._id);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    if (!product) return null;
    const { name, images, pricing, location, category, rating } = product;
    const _id = product._id || product.id;

    // Data Normalization for robustness (handles different API/Static data structures)
    const displayImage = images?.[0] || product.image || '/placeholder-image.jpg';
    const displayPrice = pricing?.price || product.price || pricing?.basePrice;
    const originalPrice = pricing?.originalPrice;

    // Ensure numeric price for formatting
    const formattedPrice = displayPrice ? parseInt(String(displayPrice).replace(/[^0-9]/g, '')) : null;
    const formattedOriginalPrice = originalPrice ? parseInt(String(originalPrice).replace(/[^0-9]/g, '')) : null;

    // Calculate Discount Percentage
    let calculatedDiscount = null;
    if (formattedPrice && formattedOriginalPrice && formattedOriginalPrice > formattedPrice) {
        calculatedDiscount = Math.round(((formattedOriginalPrice - formattedPrice) / formattedOriginalPrice) * 100);
    }

    const displayBadge = discountBadge || (calculatedDiscount ? `-${calculatedDiscount}% OFF` : null);

    const getLinkPath = () => {
        if (customLink) return customLink;
        return `/services/${_id}`;
    };

    // Accessibility label
    const ariaLabel = `${name}${location ? ` in ${location}` : ''}${formattedPrice ? `, starting at Rs ${formattedPrice.toLocaleString()}` : ''}${calculatedDiscount ? `, ${calculatedDiscount}% discount` : ''}`;

    return (
        <Link
            to={getLinkPath()}
            className="premium-card group hover-lift h-full flex flex-col relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            aria-label={ariaLabel}
        >
            {/* Full Height Background Image */}
            <div className="absolute inset-0">
                {/* Skeleton Loader */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                )}

                <img
                    src={displayImage}
                    alt={name}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            </div>

            {/* Wishlist button */}
            <button
                onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                    ? 'bg-primary text-white shadow-lg scale-110'
                    : 'bg-white/20 text-white hover:bg-white hover:text-primary hover:scale-110'
                    }`}
                aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Quick Action Icons - Appear on Hover */}
            <div className="absolute top-4 right-16 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                {/* Quick View */}
                <button
                    onClick={(e) => { e.preventDefault(); /* Add quick view modal logic */ }}
                    className="p-2.5 rounded-full backdrop-blur-md bg-white/20 text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-110"
                    aria-label={`Quick view ${name}`}
                    title="Quick View"
                >
                    <Eye size={18} />
                </button>

                {/* More Info */}
                <button
                    onClick={(e) => { e.preventDefault(); /* Scroll to details or show tooltip */ }}
                    className="p-2.5 rounded-full backdrop-blur-md bg-white/20 text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-110"
                    aria-label={`More info about ${name}`}
                    title="More Info"
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Discount Badge */}
            {displayBadge && (
                <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
                    {displayBadge}
                </div>
            )}

            {/* Content Container (Overlaid) */}
            <div className="relative z-10 h-full flex flex-col justify-end p-5 text-white">

                {/* Top Content: Category & Rating */}
                <div className="flex items-center justify-between mb-2">
                    {category && (
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                            {category}
                        </div>
                    )}
                    {!hideRating && rating && (
                        <div className="flex items-center gap-1 text-orange-400 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-bold">{rating}</span>
                        </div>
                    )}
                </div>

                {/* Main Content: Title & Location */}
                <div className="mb-4">
                    <h3 className="font-bold text-xl mb-1 leading-tight drop-shadow-md group-hover:text-primary-100 transition-colors">{name}</h3>
                    {location && (
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                            <MapPin size={14} />
                            <span>{location}</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                    <div>
                        {formattedPrice ? (
                            <div className="flex flex-col">
                                {formattedOriginalPrice && (
                                    <span className="text-xs text-red-300 line-through font-medium mb-0.5">
                                        Rs {formattedOriginalPrice.toLocaleString()}
                                    </span>
                                )}
                                <span className="text-2xl font-black text-white">
                                    Rs {formattedPrice.toLocaleString()}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                                View Details
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ServiceCard;
