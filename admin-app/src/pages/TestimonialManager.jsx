import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';

const TestimonialManager = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        avatar_url: '',
        rating: 5,
        content: '',
        is_featured: false,
        is_approved: true,
        display_order: 0
    });

    const queryClient = useQueryClient();

    // Fetch testimonials
    const { data: testimonials = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load testimonials: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (newTestimonial) => {
            const { data, error } = await supabase
                .from('testimonials')
                .insert([newTestimonial])
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial created successfully!');
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
                .from('testimonials')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial updated successfully!');
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
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial deleted successfully!');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Toggle approved status
    const toggleApprovedMutation = useMutation({
        mutationFn: async ({ id, is_approved }) => {
            const { error } = await supabase
                .from('testimonials')
                .update({ is_approved: !is_approved })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Status updated!');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingTestimonial) {
            updateMutation.mutate({ id: editingTestimonial.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData(testimonial);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setFormData({
            customer_name: '',
            avatar_url: '',
            rating: 5,
            content: '',
            is_featured: false,
            is_approved: true,
            display_order: testimonials.length
        });
        setEditingTestimonial(null);
        setIsEditing(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Testimonial Manager</h1>
                    <p className="text-gray-600 mt-1">Manage customer reviews and testimonials</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold"
                >
                    {isEditing ? <X size={20} /> : <Plus size={20} />}
                    {isEditing ? 'Cancel' : 'Add Testimonial'}
                </button>
            </div>

            {/* Form */}
            {isEditing && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">
                        {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Avatar URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Rating (1-5 stars)
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            fill={star <= formData.rating ? '#DC2626' : 'none'}
                                            className={star <= formData.rating ? 'text-primary' : 'text-gray-300'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Testimonial Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
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
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="is_featured" className="text-sm font-bold text-gray-700">
                                    Featured
                                </label>
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    id="is_approved"
                                    checked={formData.is_approved}
                                    onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="is_approved" className="text-sm font-bold text-gray-700">
                                    Approved
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold"
                            >
                                <Save size={20} />
                                {editingTestimonial ? 'Update' : 'Create'} Testimonial
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

            {/* Testimonials List */}
            <div className="grid grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 relative">
                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            {testimonial.is_featured && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                                    Featured
                                </span>
                            )}
                            <button
                                onClick={() => toggleApprovedMutation.mutate({ id: testimonial.id, is_approved: testimonial.is_approved })}
                                className={`px-2 py-1 rounded-full text-xs font-bold ${testimonial.is_approved
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {testimonial.is_approved ? 'Approved' : 'Pending'}
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-4 mb-4">
                            {testimonial.avatar_url ? (
                                <img
                                    src={testimonial.avatar_url}
                                    alt={testimonial.customer_name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                                    {testimonial.customer_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-lg">{testimonial.customer_name}</h3>
                                <div className="flex gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < testimonial.rating ? '#DC2626' : 'none'}
                                            className={i < testimonial.rating ? 'text-primary' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleEdit(testimonial)}
                                className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={18} />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(testimonial.id)}
                                className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center text-gray-500">
                    <p className="text-lg font-medium">No testimonials yet</p>
                    <p className="text-sm mt-1">Click "Add Testimonial" to create your first testimonial</p>
                </div>
            )}
        </div>
    );
};

export default TestimonialManager;
