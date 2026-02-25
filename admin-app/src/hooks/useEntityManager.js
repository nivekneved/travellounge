import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

/**
 * A generic hook for managing Supabase entities with React Query.
 * @param {string} tableName - The name of the Supabase table.
 * @param {Object} options - Configuration options.
 * @param {string} options.queryKey - React Query key (defaults to tableName).
 * @param {string} options.orderColumn - Column to order by (defaults to 'created_at').
 * @param {boolean} options.ascending - Sort direction (defaults to false).
 * @param {Object} options.callbacks - Optional success/error callbacks.
 */
export const useEntityManager = (tableName, options = {}) => {
    const {
        queryKey = [tableName],
        orderColumn = 'created_at',
        ascending = false,
        callbacks = {}
    } = options;

    const queryClient = useQueryClient();

    // Fetch data
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order(orderColumn, { ascending });

            if (error) throw error;
            return data;
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (newData) => {
            const { data, error } = await supabase
                .from(tableName)
                .insert([newData])
                .select();
            if (error) throw error;
            return data[0];
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(`${tableName.slice(0, -1)} created successfully!`);
            if (callbacks.onSaveSuccess) callbacks.onSaveSuccess(data);
        },
        onError: (err) => {
            toast.error(`Create failed: ${err.message}`);
            if (callbacks.onError) callbacks.onError(err);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from(tableName)
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(`${tableName.slice(0, -1)} updated successfully!`);
            if (callbacks.onSaveSuccess) callbacks.onSaveSuccess(data);
        },
        onError: (err) => {
            toast.error(`Update failed: ${err.message}`);
            if (callbacks.onError) callbacks.onError(err);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(`${tableName.slice(0, -1)} deleted successfully!`);
            if (callbacks.onDeleteSuccess) callbacks.onDeleteSuccess(id);
        },
        onError: (err) => {
            toast.error(`Delete failed: ${err.message}`);
            if (callbacks.onError) callbacks.onError(err);
        }
    });

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        createMutation,
        updateMutation,
        deleteMutation,
        save: (id, updates) => {
            if (id) {
                return updateMutation.mutateAsync({ id, updates });
            }
            return createMutation.mutateAsync(updates);
        },
        isSaving: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};
