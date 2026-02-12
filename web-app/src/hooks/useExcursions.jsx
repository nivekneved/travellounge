import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useExcursions = () => {
    const [excursions, setExcursions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExcursions = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('category', 'Excursion')
                    .eq('status', 'active');

                if (error) throw error;

                setExcursions(data.map(e => ({
                    id: e.id,
                    name: e.name,
                    image: e.images?.[0] || '',
                    location: e.location,
                    price: e.pricing?.price?.toLocaleString() || '0',
                    rating: e.rating,
                    category: e.category,
                    description: e.description
                })));
            } catch (err) {
                console.error('[useExcursions]', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExcursions();
    }, []);

    return { excursions, loading, error };
};
