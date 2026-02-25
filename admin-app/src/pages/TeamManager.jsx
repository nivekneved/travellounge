import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    GripVertical,
    Linkedin,
    Twitter,
    Mail,
    X,
    Save,
    User,
    Briefcase,
    Globe,
    PlusCircle,
    MoreVertical,
    LayoutGrid,
    List,
    Search,
    SearchX,
    Loader,
    ImageIcon
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ member, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: member.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-4 group hover:shadow-lg transition-all"
        >
            <div {...attributes} {...listeners} className="cursor-grab p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <GripVertical size={20} />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-red-600 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform shadow-sm shrink-0">
                {member.image_url ? <img src={member.image_url} alt="" className="w-full h-full object-cover" /> : <User size={24} />}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 text-sm uppercase ">{member.name}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.role}</p>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => onEdit(member)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(member.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
            </div>
        </div>
    );
};

const TeamManager = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [view, setView] = useState('grid'); // 'grid' | 'list' (reorder)
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        description: '',
        image_url: '',
        social_links: {
            linkedin: '',
            twitter: '',
            email: ''
        },
        display_order: 0
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch Team
    const { data: team = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['team'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('team')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    const filteredTeam = useMemo(() => {
        return team.filter(m =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [team, searchTerm]);

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load team: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newMember) => {
            const { data, error } = await supabase.from('team').insert([newMember]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Team member added successfully');
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('team').update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Team member updated');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('team').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('Member removed');
        }
    });

    const reorderMutation = useMutation({
        mutationFn: async (newOrder) => {
            const updates = newOrder.map((m, index) => ({
                id: m.id,
                display_order: index
            }));

            const { error } = await supabase.from('team').upsert(updates);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['team']);
            toast.success('New order synced');
        }
    });

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = team.findIndex((m) => m.id === active.id);
            const newIndex = team.findIndex((m) => m.id === over.id);
            const newOrder = arrayMove(team, oldIndex, newIndex);
            reorderMutation.mutate(newOrder);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, updates: formData });
        } else {
            createMutation.mutate({ ...formData, display_order: team.length });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            description: '',
            image_url: '',
            social_links: { linkedin: '', twitter: '', email: '' },
            display_order: 0
        });
        setEditingId(null);
        setIsEditing(false);
    };

    const handleEdit = (m) => {
        setFormData({
            name: m.name || '',
            role: m.role || '',
            description: m.description || '',
            image_url: m.image_url || '',
            social_links: m.social_links || { linkedin: '', twitter: '', email: '' },
            display_order: m.display_order || 0
        });
        setEditingId(m.id);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this member?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader className="animate-spin text-red-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Assembling Personnel...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Our Talent</h1>
                    <p className="text-gray-500 font-medium">Manage the specialists who power the Travel Lounge experience</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button onClick={() => setView('grid')} className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={20} /></button>
                        <button onClick={() => setView('list')} className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><List size={20} /></button>
                    </div>
                    <button
                        onClick={() => { if (isEditing) resetForm(); else setIsEditing(true); }}
                        className={`flex items-center gap-2 ${isEditing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'} px-8 py-4 rounded-2xl font-black transition-all active:scale-95 group`}
                    >
                        {isEditing ? <X size={22} /> : <Plus size={22} className="group-hover:rotate-90 transition-transform" />}
                        <span>{isEditing ? 'Cancel Edit' : 'Add Member'}</span>
                    </button>
                </div>
            </div>

            {!isEditing ? (
                <>
                    {/* Filters Area */}
                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, role, or mission..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest" >Verified Staff</span>
                        </div>
                    </div>

                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredTeam.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center gap-6 text-gray-300">
                                    <SearchX size={64} />
                                    <div className="text-center">
                                        <h3 className="text-xl font-black text-gray-900 mb-1">Ghost Town</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest">No team members match your search criteria</p>
                                    </div>
                                </div>
                            ) : filteredTeam.map((member) => (
                                <div key={member.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col items-center text-center relative group hover:shadow-2xl hover:border-red-100 transition-all duration-500 group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-red-600 mb-6 overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform shadow-lg shadow-gray-200">
                                        {member.image_url ? <img src={member.image_url} alt="" className="w-full h-full object-cover" /> : <User size={40} />}
                                    </div>

                                    <h3 className="font-black text-gray-900 text-lg uppercase mb-1">{member.name}</h3>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-4">{member.role}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">{member.description}</p>

                                    <div className="flex gap-4 mb-8">
                                        {member.social_links?.linkedin && <a href={member.social_links.linkedin} target="_blank" className="p-2 text-gray-300 hover:text-blue-600 transition-colors"><Linkedin size={18} /></a>}
                                        {member.social_links?.twitter && <a href={member.social_links.twitter} target="_blank" className="p-2 text-gray-300 hover:text-sky-500 transition-colors"><Twitter size={18} /></a>}
                                        {member.social_links?.email && <a href={`mailto:${member.social_links.email}`} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Mail size={18} /></a>}
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all mt-auto scale-90 group-hover:scale-100">
                                        <button onClick={() => handleEdit(member)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(member.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm bg-white"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="absolute top-6 right-6">
                                        <span className="text-[10px] font-black text-gray-300">#{member.display_order + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><GripVertical size={18} /></div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ">Priority Sequencing (Drag to reorder)</p>
                                </div>
                            </div>

                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={filteredTeam} strategy={verticalListSortingStrategy}>
                                    {filteredTeam.map(member => (
                                        <SortableItem key={member.id} member={member} onEdit={handleEdit} onDelete={handleDelete} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                    <div className="relative z-10 flex items-center gap-6 mb-12">
                        <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
                            <PlusCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
                                {editingId ? 'Modify Specialist' : 'Draft New Position'}
                            </h2>
                            <p className="text-lg text-slate-400 font-medium mt-1">Configure profile details, professional role, and digital presence</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14} className="text-red-600" /> Identity</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required placeholder="Full Name" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required placeholder="Official Role" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                            value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                                    </div>
                                </div>
                                <input type="url" placeholder="Profile Image URL (https://...)" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                    value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={14} className="text-red-600" /> Professional Channels</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="relative">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="url" placeholder="LinkedIn Profile" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                            value={formData.social_links.linkedin} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input type="url" placeholder="Twitter URL" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                                value={formData.social_links.twitter} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })} />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                                value={formData.social_links.email} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, email: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={14} className="text-red-600" /> Mission Statement</label>
                            <textarea required rows="4" placeholder="Briefly describe the specialist's expertise and focus areas..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm resize-none"
                                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-gray-50 mt-12">
                            <button type="button" onClick={resetForm} className="px-10 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all" >Drop Changes</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95 transition-all" >
                                {createMutation.isPending || updateMutation.isPending ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingId ? 'Modify Profile' : 'Confirm Onboarding'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TeamManager;
