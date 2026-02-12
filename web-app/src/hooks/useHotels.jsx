import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export const useHotels = (locationFilter = null) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                let query = supabase.from('services').select('*').eq('type', 'hotel');

                if (locationFilter) {
                    query = locationFilter === 'Rodrigues'
                        ? query.eq('category', 'Rodrigues')
                        : query.neq('category', 'Rodrigues');
                }

                const { data, error } = await query;
                if (error) throw error;

                setHotels(data.map(h => ({
                    id: h.id,
                    name: h.name,
                    image: h.images?.[0] || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
                    location: h.location,
                    starRating: h.star_rating || 0,
                    price: h.pricing?.base_price?.toLocaleString() || '0',
                    rating: h.rating || 4.5,
                    description: h.description,
                    amenities: Array.isArray(h.amenities)
                        ? h.amenities.map(a => typeof a === 'object' ? a.name : a)
                        : [],
                    rooms: []
                })));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [locationFilter]);

    return { hotels, loading, error };
};
