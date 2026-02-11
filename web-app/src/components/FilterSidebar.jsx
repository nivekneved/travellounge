import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Check, DollarSign } from 'lucide-react';

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 py-6 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full mb-4 group"
            >
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const FilterSidebar = ({
    type = 'hotel', // hotel, cruise, tour, activity
    filters,
    setFilters,
    priceRange,
    setPriceRange,
    categories = [],
    locations = [],
    amenities = []
}) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-32">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Search size={20} className="text-primary" />
                    <h2 className="text-xl font-black">Filters</h2>
                </div>
                <button
                    onClick={() => {
                        setFilters({});
                        setPriceRange([0, 200000]);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-primary underline"
                >
                    Reset All
                </button>
            </div>

            {/* Price Range Filter */}
            <FilterSection title="Price Range">
                <div className="px-2">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Rs {priceRange[0].toLocaleString()}</span>
                        <span className="text-sm text-gray-600">Rs {priceRange[1].toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200000"
                        step="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </FilterSection>

            {/* Categories / Types */}
            {categories.length > 0 && (
                <FilterSection title="Categories">
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${filters.category?.includes(cat) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                    {filters.category?.includes(cat) && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.category?.includes(cat) || false}
                                    onChange={(e) => {
                                        const current = filters.category || [];
                                        setFilters({
                                            ...filters,
                                            category: e.target.checked
                                                ? [...current, cat]
                                                : current.filter(c => c !== cat)
                                        });
                                    }}
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Locations */}
            {locations.length > 0 && (
                <FilterSection title="Location">
                    <div className="space-y-3">
                        {locations.map((loc) => (
                            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${filters.location?.includes(loc) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                    {filters.location?.includes(loc) && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.location?.includes(loc) || false}
                                    onChange={(e) => {
                                        const current = filters.location || [];
                                        setFilters({
                                            ...filters,
                                            location: e.target.checked
                                                ? [...current, loc]
                                                : current.filter(l => l !== loc)
                                        });
                                    }}
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{loc}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Star Rating (Hotels) */}
            {(type === 'hotel' || type === 'guest-house') && (
                <FilterSection title="Star Rating">
                    <div className="space-y-3">
                        {[5, 4, 3].map((star) => (
                            <label key={star} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${filters.rating?.includes(star) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                    {filters.rating?.includes(star) && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.rating?.includes(star) || false}
                                    onChange={(e) => {
                                        const current = filters.rating || [];
                                        setFilters({
                                            ...filters,
                                            rating: e.target.checked
                                                ? [...current, star]
                                                : current.filter(r => r !== star)
                                        });
                                    }}
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1">
                                    {star} Stars <span className="text-yellow-400">★</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
                <FilterSection title="Amenities">
                    <div className="space-y-3">
                        {amenities.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${filters.amenities?.includes(amenity) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                    {filters.amenities?.includes(amenity) && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.amenities?.includes(amenity) || false}
                                    onChange={(e) => {
                                        const current = filters.amenities || [];
                                        setFilters({
                                            ...filters,
                                            amenities: e.target.checked
                                                ? [...current, amenity]
                                                : current.filter(a => a !== amenity)
                                        });
                                    }}
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{amenity}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}
        </div>
    );
};

export default FilterSidebar;
