import React from 'react';
import { useParams } from 'react-router-dom';
import HotelDetailsTemplate from '../components/templates/HotelDetailsTemplate';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useHotelDetails } from '../hooks/useHotelDetails';

const RodriguesHotelDetails = () => {
    const { id } = useParams();
    const { hotel, loading, error } = useHotelDetails(id);

    if (loading) return <LoadingSpinner message="Loading hotel details..." />;
    if (error) return <ErrorMessage error={error} title="Failed to load hotel" />;
    if (!hotel) return <EmptyState title="Hotel not found" message="The hotel you're looking for doesn't exist." actionText="View All Hotels" actionLink="/rodrigues-hotels" />;

    return (
        <HotelDetailsTemplate
            hotel={hotel}
            backLink="/rodrigues-hotels"
            backText="Back to Rodrigues Hotels"
        />
    );
};

export default RodriguesHotelDetails;
