import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('category', 'Destination')
                    .eq('status', 'active');

                if (error) throw error;

                setDestinations(data.map(d => ({
                    id: d.id,
                    name: d.name,
                    image: d.images?.[0] || '',
                    duration: d.location, // In Destinations.jsx, location field was used for duration mapping
                    price: d.pricing?.price?.toLocaleString() || '0',
                    rating: d.rating,
                    includes: d.description?.split('. ')?.[1]?.replace('Includes ', '')?.split(', ') || []
                })));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    return { destinations, loading, error };
};
