import React from 'react';
import HotelListingTemplate from '../components/templates/HotelListingTemplate';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useHotels } from '../hooks/useHotels';

const MauritiusHotels = () => {
    const { hotels, loading, error } = useHotels('Mauritius');

    if (loading) return <LoadingSpinner message="Loading hotels..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load hotels" />;

    return (
        <HotelListingTemplate
            hotels={hotels}
            heroImage="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920"
            heroTitle="Mauritius Hotels"
            heroSubtitle="Discover luxury accommodations across the island of Mauritius"
            basePath="/services"
        />
    );
};

export default MauritiusHotels;
