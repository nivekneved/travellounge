import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useTransfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransfers = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('type', 'transport')
                    .eq('status', 'active');

                if (error) throw error;

                setTransfers(data.map(t => ({
                    id: t.id,
                    name: t.name,
                    image: t.images?.[0] || '',
                    location: t.location,
                    price: t.pricing?.price?.toLocaleString() || '0',
                    rating: t.rating,
                    description: t.description
                })));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfers();
    }, []);

    return { transfers, loading, error };
};
