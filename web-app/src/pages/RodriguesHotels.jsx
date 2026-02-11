import React from 'react';
import HotelListingTemplate from '../components/templates/HotelListingTemplate';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useHotels } from '../hooks/useHotels';

const RodriguesHotels = () => {
    const { hotels, loading, error } = useHotels('Rodrigues');

    if (loading) return <LoadingSpinner message="Loading hotels..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load hotels" />;

    return (
        <HotelListingTemplate
            hotels={hotels}
            heroImage="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200"
            heroTitle="Rodrigues Hotels"
            heroSubtitle="Experience authentic island hospitality in Rodrigues"
            basePath="/services"
        />
    );
};

export default RodriguesHotels;
