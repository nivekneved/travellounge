import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useGuestHouses = (locationFilter = null) => {
    const [guestHouses, setGuestHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuestHouses = async () => {
            try {
                // Fetch where category is 'Guest House' or type is 'guest-house'
                let query = supabase.from('services').select('*').or('category.eq.Guest House,type.eq.guest-house');

                if (locationFilter) {
                    // If location filter is provided, we might need to filter by location column
                    // or if it's 'Rodrigues', check if location contains Rodrigues
                    query = query.ilike('location', `%${locationFilter}%`);
                }

                const { data, error } = await query;
                if (error) throw error;

                setGuestHouses(data.map(gh => ({
                    id: gh.id,
                    name: gh.name,
                    image: gh.images?.[0] || '',
                    location: gh.location,
                    price: gh.pricing?.base_price?.toLocaleString() || '0',
                    rating: gh.rating,
                    starRating: gh.star_rating || 3,
                    amenities: gh.amenities || []
                })));
            } catch (err) {
                console.error('[useGuestHouses]', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGuestHouses();
    }, [locationFilter]);

    return { guestHouses, loading, error };
};
