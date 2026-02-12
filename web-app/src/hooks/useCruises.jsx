import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useCruises = (categoryFilter = null) => {
    const [cruises, setCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCruises = async () => {
            try {
                let query = supabase.from('services').select('*').eq('type', 'cruise');

                if (categoryFilter) {
                    query = query.eq('category', categoryFilter);
                }

                const { data, error } = await query;
                if (error) throw error;

                setCruises(data.map(c => ({
                    id: c.id,
                    name: c.name,
                    image: c.images?.[0] || '',
                    duration: c.duration,
                    ports: c.ports,
                    price: c.pricing?.base_price?.toLocaleString() || '0',
                    rating: c.rating,
                    highlights: c.highlights || [],
                    category: c.category
                })));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCruises();
    }, [categoryFilter]);

    return { cruises, loading, error };
};
