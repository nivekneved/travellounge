import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useActivities = (categoryFilter = null) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {

                let query = supabase.from('services').select('*').eq('type', 'activity');

                if (categoryFilter) {
                    query = query.eq('category', categoryFilter);
                }

                const { data, error } = await query;
                if (error) throw error;


                setActivities(data.map(a => ({
                    id: a.id,
                    name: a.name,
                    image: a.images?.[0] || '',
                    duration: a.duration,
                    location: a.location,
                    price: a.pricing?.base_price?.toLocaleString() || '0',
                    rating: a.rating,
                    category: a.category,
                    amenities: a.amenities || []
                })));
            } catch (err) {
                console.error('[useActivities]', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [categoryFilter]);

    return { activities, loading, error };
};
