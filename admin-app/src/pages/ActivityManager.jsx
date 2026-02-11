import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

const ActivityManager = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Sea Activities',
        description: '',
        price: '',
        duration: '',
        image_url: '',
        location: '',
        is_active: true,
        display_order: 0
    });

    const queryClient = useQueryClient();

    // Fetch activities
    const { data: activities = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .in('category', ['Sea Activities', 'Land Activities'])
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load activities: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (newActivity) => {
            const { data, error } = await supabase
                .from('services')
                .insert([{
                    ...newActivity,
                    pricing: { price: newActivity.price }
                }])
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['activities']);
            toast.success('Activity created successfully!');
            resetForm();
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('services')
                .update({
                    ...updates,
                    pricing: { price: updates.price }
                })
                .eq('_id', id)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['activities']);
            toast.success('Activity updated successfully!');
            resetForm();
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('_id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['activities']);
            toast.success('Activity deleted successfully!');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingActivity) {
            updateMutation.mutate({ id: editingActivity._id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setFormData({
            name: activity.name,
            category: activity.category,
            description: activity.description || '',
            price: activity.pricing?.price || '',
            duration: activity.duration || '',
            image_url: activity.images?.[0] || '',
            location: activity.location || '',
            is_active: activity.is_active !== false,
            display_order: activity.display_order || 0
        });
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Sea Activities',
            description: '',
            price: '',
            duration: '',
            image_url: '',
            location: '',
            is_active: true,
            display_order: activities.length
        });
        setEditingActivity(null);
        setIsEditing(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const seaActivities = activities.filter(a => a.category === 'Sea Activities');
    const landActivities = activities.filter(a => a.category === 'Land Activities');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Activity Manager</h1>
                    <p className="text-gray-600 mt-1">Manage sea and land activities</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold"
                >
                    {isEditing ? <X size={20} /> : <Plus size={20} />}
                    {isEditing ? 'Cancel' : 'Add Activity'}
                </button>
            </div>

            {/* Form */}
            {isEditing && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">
                        {editingActivity ? 'Edit Activity' : 'New Activity'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Activity Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="Sea Activities">Sea Activities</option>
                                    <option value="Land Activities">Land Activities</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Price (Rs)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g., 2 hours"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Image URL *
                            </label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                                    Active (visible on website)
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold"
                            >
                                <Save size={20} />
                                {editingActivity ? 'Update' : 'Create'} Activity
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Activities by Category */}
            <div className="space-y-6">
                {/* Sea Activities */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-blue-600">🌊 Sea Activities ({seaActivities.length})</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {seaActivities.map((activity) => (
                            <div key={activity._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <img src={activity.images?.[0]} alt={activity.name} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{activity.location}</p>
                                    <p className="text-primary font-bold">Rs {activity.pricing?.price}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleEdit(activity)}
                                            className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                        >
                                            <Edit2 size={16} className="inline mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity._id)}
                                            className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                        >
                                            <Trash2 size={16} className="inline mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {seaActivities.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No sea activities yet</p>
                    )}
                </div>

                {/* Land Activities */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-green-600">🏞️ Land Activities ({landActivities.length})</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {landActivities.map((activity) => (
                            <div key={activity._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <img src={activity.images?.[0]} alt={activity.name} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{activity.location}</p>
                                    <p className="text-primary font-bold">Rs {activity.pricing?.price}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleEdit(activity)}
                                            className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                        >
                                            <Edit2 size={16} className="inline mr-1" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity._id)}
                                            className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                        >
                                            <Trash2 size={16} className="inline mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {landActivities.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No land activities yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityManager;
