import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const useHotelDetails = (id) => {
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            if (!id) return;

            try {
                const { data: hotelData, error: hotelError } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (hotelError) throw hotelError;

                const { data: roomsData, error: roomsError } = await supabase
                    .from('hotel_rooms')
                    .select('*')
                    .eq('service_id', id);

                if (roomsError) throw roomsError;

                setHotel({
                    id: hotelData.id,
                    name: hotelData.name,
                    image: hotelData.images?.[0] || '',
                    location: hotelData.location,
                    starRating: hotelData.star_rating,
                    price: hotelData.pricing?.base_price?.toLocaleString() || '0',
                    rating: hotelData.rating,
                    description: hotelData.description,
                    amenities: hotelData.amenities || [],
                    rooms: roomsData.map(r => ({
                        id: r.id,
                        name: r.name,
                        size: r.size,
                        bed: r.bed,
                        view: r.view,
                        price: r.price_per_night?.toLocaleString() || '0',
                        image: r.image_url,
                        maxOccupancy: r.max_occupancy,
                        mealPlan: r.meal_plan,
                        cancellationPolicy: r.cancellation_policy,
                        depositPolicy: r.deposit_policy,
                        features: r.features || []
                    }))
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [id]);

    return { hotel, loading, error };
};
