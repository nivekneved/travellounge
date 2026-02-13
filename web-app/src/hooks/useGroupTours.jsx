import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useGroupTours = (categoryFilter = null) => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Fetch where category is 'Group Tours' or type is 'group-tour'
                let query = supabase.from('services').select('*').or('category.eq.Group Tours,type.eq.group-tour');

                const { data, error } = await query;
                if (error) throw error;

                setTours(data.map(t => ({
                    id: t.id,
                    name: t.name,
                    image: t.images?.[0] || '',
                    duration: t.duration,
                    groupSize: t.amenities?.find(a => a.toLowerCase().includes('group size')) || 'Min 2', // Fallback or extract from amenities/details
                    price: t.pricing?.base_price?.toLocaleString() || '0',
                    rating: t.rating,
                    highlights: t.highlights || [],
                    category: t.category
                })));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, [categoryFilter]);

    return { tours, loading, error };
};
