import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useDayPackages = (locationFilter = null) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                // Fetch where category is 'Day Package' or type is 'day-package'
                let query = supabase.from('services').select('*').or('category.eq.Day Package,type.eq.day-package');

                if (locationFilter) {
                    query = query.ilike('location', `%${locationFilter}%`);
                }

                const { data, error } = await query;
                if (error) throw error;

                setPackages(data.map(pkg => ({
                    id: pkg.id,
                    name: pkg.name,
                    hotel: pkg.description ? pkg.description.split(' - ')[0] : 'Luxury Hotel', // Fallback or convention
                    image: pkg.images?.[0] || '',
                    time: pkg.duration || '9 AM - 5 PM',
                    location: pkg.location,
                    price: pkg.pricing?.base_price?.toLocaleString() || '0',
                    rating: pkg.rating,
                    category: pkg.category,
                    includes: pkg.amenities || []
                })));
            } catch (err) {
                console.error('[useDayPackages]', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [locationFilter]);

    return { packages, loading, error };
};
