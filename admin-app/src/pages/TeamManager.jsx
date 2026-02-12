import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Linkedin,
    X,
    CheckSquare,
    Square,
    MoreVertical
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ViewToggle from '../components/ViewToggle';
import { SortableItem, SortableHandle } from '../components/SortableItem';

const TeamManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('grid'); // 'grid' or 'list'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        linkedin_url: '',
        photo_url: '',
        bio: '',
        status: 'active'
    });

    const { data: teamMembers = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['team'],
        queryFn: async () => {
            const { data, error } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
            if (error) {
                if (error.code === '42P01') return [];
                throw error;
            };
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load team members: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newMember) => {
            // Get max order
            const { data: maxOrder } = await supabase.from('team_members').select('display_order').order('display_order', { ascending: false }).limit(1).single();
            const nextOrder = (maxOrder?.display_order || 0) + 1;

            const { data, error } = await supabase.from('team_members').insert([{ ...newMember, display_order: nextOrder }]);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Team member added');
            setIsModalOpen(false);
            resetForm();
        },
        onError: (err) => toast.error(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('team_members').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Team member updated');
            setIsModalOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase.from('team_members').delete().in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Team member(s) removed');
            setSelectedIds([]);
        }
    });

    const reorderMutation = useMutation({
        mutationFn: async (items) => {
            const updates = items.map((item, index) => ({
                id: item.id,
                display_order: index
            }));

            const { error } = await supabase.from('team_members').upsert(updates);
            if (error) throw error;
        },
        onSuccess: () => {
            // toast.success('Order updated'); // Optional, might differ too much noise
            queryClient.invalidateQueries(['team']);
        }
    });

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = teamMembers.findIndex((item) => item.id === active.id);
            const newIndex = teamMembers.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(teamMembers, oldIndex, newIndex);

            // Optimistically update cache could be done here, but simple invalidation is safer for now
            reorderMutation.mutate(newItems);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === teamMembers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(teamMembers.map(m => m.id));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', role: '', email: '', linkedin_url: '', photo_url: '', bio: '', status: 'active' });
        setEditingId(null);
    };

    const handleEdit = (member) => {
        setFormData(member);
        setEditingId(member.id);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Team Management</h1>
                    <p className="text-gray-500 text-sm">Manage members, roles, and ordering</p>
                </div>

                <div className="flex items-center gap-3">
                    <ViewToggle view={view} onViewChange={setView} />

                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm(`Delete ${selectedIds.length} members?`)) {
                                    deleteMutation.mutate(selectedIds);
                                }
                            }}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={18} /> Delete ({selectedIds.length})
                        </button>
                    )}

                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
                    >
                        <Plus size={20} /> <span className="hidden sm:inline">Add Member</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={teamMembers.map(m => m.id)}
                        strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                    >
                        {teamMembers.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                                No team members found. Add one to get started!
                            </div>
                        ) : (
                            // View Switching
                            view === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {teamMembers.map((member) => (
                                        <SortableItem key={member.id} id={member.id} className="h-full">
                                            {(attributes, listeners) => (
                                                <div className={`bg-white p-6 rounded-2xl border transition-all h-full flex flex-col items-center group relative
                          ${selectedIds.includes(member.id) ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-gray-100 shadow-sm hover:shadow-premium'}`}
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <SortableHandle attributes={attributes} listeners={listeners} />
                                                    </div>

                                                    {/* Selection Checkbox */}
                                                    <button
                                                        onClick={() => handleSelect(member.id)}
                                                        className="absolute top-3 right-3 text-gray-400 hover:text-primary transition-colors"
                                                    >
                                                        {selectedIds.includes(member.id) ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                                                    </button>

                                                    {/* Content */}
                                                    <div className="w-24 h-24 rounded-full bg-gray-50 mb-4 overflow-hidden border-4 border-white shadow-md mt-2">
                                                        {member.photo_url ? (
                                                            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-full h-full p-6 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                                    <p className="text-primary-600 font-medium text-sm mb-4">{member.role}</p>

                                                    {/* Actions */}
                                                    <div className="mt-auto flex gap-2 w-full pt-4 border-t border-gray-50 justify-center">
                                                        <button onClick={() => handleEdit(member)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </SortableItem>
                                    ))}
                                </div>
                            ) : (
                                // LIST VIEW (Table)
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                                <th className="p-4 w-12 text-center">
                                                    <SortableHandle className="opacity-0" /> {/* Spacer */}
                                                </th>
                                                <th className="p-4 w-12">
                                                    <button onClick={handleSelectAll}>
                                                        {selectedIds.length > 0 && selectedIds.length === teamMembers.length ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                                                    </button>
                                                </th>
                                                <th className="p-4">Member</th>
                                                <th className="p-4">Role</th>
                                                <th className="p-4">Contact</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {teamMembers.map((member) => (
                                                <SortableItem key={member.id} id={member.id} className="group">
                                                    {(attributes, listeners) => (
                                                        <tr className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(member.id) ? 'bg-primary-50/10' : ''}`}>
                                                            <td className="p-4 text-center">
                                                                <SortableHandle attributes={attributes} listeners={listeners} />
                                                            </td>
                                                            <td className="p-4">
                                                                <button onClick={() => handleSelect(member.id)} className="text-gray-400 hover:text-primary">
                                                                    {selectedIds.includes(member.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                                    {member.photo_url ? <img src={member.photo_url} className="w-full h-full object-cover" /> : <Users className="p-2 text-gray-400" />}
                                                                </div>
                                                                <span className="font-bold text-gray-900">{member.name}</span>
                                                            </td>
                                                            <td className="p-4 text-gray-600">{member.role}</td>
                                                            <td className="p-4 flex gap-2">
                                                                {member.email && <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-gray-900"><Mail size={16} /></a>}
                                                                {member.linkedin_url && <a href={member.linkedin_url} target="_blank" className="text-gray-400 hover:text-[#0077b5]" rel="noreferrer"><Linkedin size={16} /></a>}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button onClick={() => handleEdit(member)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                                                    <Edit2 size={16} />
                                                                </button>
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
            )}

            {/* Modal - Same as before but with minor consistent tweaks implies */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Member' : 'Add Team Member'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"><X size={20} /></button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if (editingId) updateMutation.mutate({ id: editingId, updates: formData }); else createMutation.mutate(formData); }} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Inputs... */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Name</label>
                                    <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Role</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Photo URL</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary"
                                        value={formData.photo_url} onChange={e => setFormData({ ...formData, photo_url: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Email</label>
                                    <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">LinkedIn</label>
                                    <input type="url" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary"
                                        value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold">
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManager;
