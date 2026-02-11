import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Upload, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ViewToggle from '../components/ViewToggle';
import { SortableItem, SortableHandle } from '../components/SortableItem';

const CategoryManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('grid');
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        image_url: '',
        link: '',
        display_order: 0,
        is_active: true
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch categories
    const { data: categories = [], isLoading, isError, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && error) {
            toast.error(`Failed to load categories: ${error.message}`);
        }
    }, [isError, error]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newCategory) => {
            // Get max order
            const { data: maxOrder } = await supabase.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).single();
            const nextOrder = (maxOrder?.display_order || 0) + 1;

            const { data, error } = await supabase.from('categories').insert([{ ...newCategory, display_order: nextOrder }]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Category created successfully!');
            resetForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Category updated successfully!');
            resetForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase.from('categories').delete().in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Category(ies) deleted successfully!');
            setSelectedIds([]);
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const reorderMutation = useMutation({
        mutationFn: async (items) => {
            const updates = items.map((item, index) => ({
                id: item.id,
                display_order: index
            }));
            const { error } = await supabase.from('categories').upsert(updates);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }) => {
            const { error } = await supabase.from('categories').update({ is_active: !is_active }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Status updated!');
        }
    });

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = categories.findIndex((item) => item.id === active.id);
            const newIndex = categories.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(categories, oldIndex, newIndex);
            reorderMutation.mutate(newItems);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === categories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(categories.map(c => c.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData(category);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', icon: '', image_url: '', link: '', display_order: 0, is_active: true });
        setEditingCategory(null);
        setIsEditing(false);
    };

    const handleNameChange = (name) => {
        setFormData({
            ...formData,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        });
    };

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Category Manager</h1>
                    <p className="text-gray-500 text-sm">Manage homepage category grid & sorting</p>
                </div>

                <div className="flex items-center gap-3">
                    <ViewToggle view={view} onViewChange={setView} />

                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => { if (window.confirm(`Delete ${selectedIds.length} categories?`)) deleteMutation.mutate(selectedIds); }}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={18} /> Delete ({selectedIds.length})
                        </button>
                    )}

                    <button
                        onClick={() => { resetForm(); setIsEditing(!isEditing); }}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-bold shadow-lg hover:shadow-primary/30"
                    >
                        {isEditing ? <X size={20} /> : <Plus size={20} />}
                        {isEditing ? 'Cancel' : 'Add Category'}
                    </button>
                </div>
            </div>

            {/* Form */}
            {isEditing && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Slug (auto-generated)</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Icon (lucide-react name)</label>
                                <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g., Ship, Plane" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Link Path *</label>
                                <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="/cruises" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Image URL *</label>
                            <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary" />
                                <span className="text-sm font-bold text-gray-700">Active (visible on website)</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold">
                                <Save size={20} /> {editingCategory ? 'Update' : 'Create'} Category
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List/Grid View */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categories.map(c => c.id)} strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
                    {categories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-lg font-medium">No categories yet</p>
                            <p className="text-sm mt-1">Click "Add Category" to create your first category</p>
                        </div>
                    ) : (
                        view === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.map((category) => (
                                    <SortableItem key={category.id} id={category.id} className="h-full">
                                        {(attributes, listeners) => (
                                            <div className={`bg-white rounded-2xl border overflow-hidden transition-all h-full flex flex-col group relative
                                                 ${selectedIds.includes(category.id) ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-gray-200 shadow-sm hover:shadow-premium'}`}>

                                                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded p-1">
                                                    <SortableHandle attributes={attributes} listeners={listeners} />
                                                </div>
                                                <button onClick={() => handleSelect(category.id)} className="absolute top-3 right-3 z-10 text-white drop-shadow-md hover:text-primary transition-colors">
                                                    {selectedIds.includes(category.id) ? <CheckSquare size={24} className="text-primary bg-white rounded" /> : <Square size={24} />}
                                                </button>

                                                <div className="h-40 overflow-hidden relative">
                                                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                    <div className="absolute bottom-3 left-4 text-white">
                                                        <h3 className="font-bold text-lg">{category.name}</h3>
                                                        <p className="text-xs opacity-80">{category.slug}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500 flex items-center gap-1"><GripVertical size={14} /> {category.display_order}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {category.is_active ? 'Active' : 'Hidden'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end gap-2">
                                                        <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </SortableItem>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center"><SortableHandle className="opacity-0" /></th>
                                            <th className="px-6 py-4 w-12"><button onClick={handleSelectAll}>{selectedIds.length > 0 && selectedIds.length === categories.length ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}</button></th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Link</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <SortableItem key={category.id} id={category.id} className="group">
                                                {(attributes, listeners) => (
                                                    <tr className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(category.id) ? 'bg-primary-50/10' : ''}`}>
                                                        <td className="px-6 py-4 text-center"><SortableHandle attributes={attributes} listeners={listeners} /></td>
                                                        <td className="px-6 py-4"><button onClick={() => handleSelect(category.id)} className="text-gray-400 hover:text-primary">{selectedIds.includes(category.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}</button></td>
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <img src={category.image_url} alt={category.name} className="w-10 h-10 rounded object-cover" />
                                                            <div>
                                                                <div className="font-bold text-gray-900">{category.name}</div>
                                                                <div className="text-xs text-gray-500">{category.slug}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{category.link}</td>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => toggleActiveMutation.mutate({ id: category.id, is_active: category.is_active })} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {category.is_active ? <Eye size={12} /> : <EyeOff size={12} />} {category.is_active ? 'Active' : 'Hidden'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </SortableItem>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default CategoryManager;
