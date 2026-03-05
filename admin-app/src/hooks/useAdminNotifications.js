import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabase';

/**
 * Hook to handle real-time booking notifications for admin
 */
export const useAdminNotifications = (queryClient) => {
    useEffect(() => {
        const channel = supabase
            .channel('admin-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                (payload) => {
                    toast.success(`New Booking Received! [#${payload.new.id.slice(0, 8)}]`, {
                        duration: 5000,
                        icon: '🔥',
                        style: {
                            borderRadius: '16px',
                            background: '#111827',
                            color: '#fff',
                            fontWeight: 'bold'
                        }
                    });
                    queryClient?.invalidateQueries(['bookings']);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
};
