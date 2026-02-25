import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    Star,
    CheckCircle,
    XCircle,
    Clock,
    Edit2,
    Trash2,
    X,
    Save,
    Globe,
    Quote,
    ThumbsUp,
    User,
    ArrowUpDown,
    Loader,
    SearchX
} from 'lucide-react';
import { format } from 'date-fns';

const TestimonialManager = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const [formData, setFormData] = useState({
        author_name: '',
        author_role: '',
        author_location: '',
        content: '',
        rating: 5,
        is_featured: false,
        status: 'pending'
    });

    // Fetch Testimonials
    const { data: testimonials = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const filteredTestimonials = useMemo(() => {
        return testimonials.filter(t => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch =
                t.author_name?.toLowerCase().includes(searchStr) ||
                t.content?.toLowerCase().includes(searchStr) ||
                t.author_location?.toLowerCase().includes(searchStr);

            const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            const key = sortConfig.key;
            const direction = sortConfig.direction === 'asc' ? 1 : -1;

            if (typeof a[key] === 'string') {
                return direction * a[key].localeCompare(b[key]);
            }
            return direction * (a[key] - b[key]);
        });
    }, [testimonials, searchTerm, filterStatus, sortConfig]);

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load testimonials: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newTestimonial) => {
            const { data, error } = await supabase.from('testimonials').insert([newTestimonial]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial added successfully');
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial updated');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testimonials']);
            toast.success('Testimonial deleted');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries(['testimonials'])
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const resetForm = () => {
        setFormData({
            author_name: '',
            author_role: '',
            author_location: '',
            content: '',
            rating: 5,
            is_featured: false,
            status: 'pending'
        });
        setEditingId(null);
        setIsEditing(false);
    };

    const handleEdit = (t) => {
        setFormData({
            author_name: t.author_name || '',
            author_role: t.author_role || '',
            author_location: t.author_location || '',
            content: t.content || '',
            rating: t.rating || 5,
            is_featured: t.is_featured || false,
            status: t.status || 'pending'
        });
        setEditingId(t.id);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this testimonial?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader className="animate-spin text-red-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Authenticating Reviews...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Voice of the Traveler</h1>
                    <p className="text-gray-500 font-medium">Curate and showcase client stories to build trust and brand authority</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { if (isEditing) resetForm(); else setIsEditing(true); }}
                        className={`flex items-center gap-2 ${isEditing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'} px-8 py-4 rounded-2xl font-black transition-all active:scale-95 group`}
                    >
                        {isEditing ? <X size={22} /> : <Plus size={22} className="group-hover:rotate-90 transition-transform" />}
                        <span>{isEditing ? 'Cancel Edit' : 'Add Testimonial'}</span>
                    </button>
                </div>
            </div>

            {!isEditing ? (
                <>
                    {/* Active Filters / Stats */}
                    <div className="flex flex-wrap items-center gap-4">
                        {['all', 'approved', 'pending', 'rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${filterStatus === s ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-500'}`}
                            >
                                {s === 'approved' && <CheckCircle size={14} />}
                                {s === 'pending' && <Clock size={14} />}
                                {s === 'rejected' && <XCircle size={14} />}
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Search & Ledger Header */}
                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by author name or content keywords..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTestimonials.length === 0 ? (
                            <div className="col-span-full py-32 flex flex-col items-center gap-6 text-gray-300">
                                <SearchX size={64} />
                                <div className="text-center">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">Mirror, Mirror...</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest">No testimonials found matching your filters</p>
                                </div>
                            </div>
                        ) : filteredTestimonials.map((t) => (
                            <div key={t.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col relative group hover:shadow-2xl hover:border-red-100 transition-all duration-500 overflow-hidden">
                                <Quote className="absolute -top-4 -right-4 w-24 h-24 text-gray-50 opacity-10 group-hover:text-red-50 group-hover:opacity-100 transition-all pointer-events-none" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <div className="flex gap-2">
                                        {t.is_featured && (
                                            <span className="bg-red-50 text-red-600 p-1.5 rounded-lg border border-red-100" title="Featured">
                                                <ThumbsUp size={12} fill="currentColor" />
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 italic leading-relaxed mb-8 flex-1">"{t.content}"</p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                                            {t.author_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase ">{t.author_name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.author_location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => handleEdit(t)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(t.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Status Float */}
                                <div className="absolute top-8 right-8">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${t.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : t.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                    <div className="relative z-10 flex items-center gap-6 mb-12">
                        <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
                                {editingId ? 'Refine Review' : 'New Client Story'}
                            </h2>
                            <p className="text-lg text-slate-400 font-medium mt-1">Capture authentic feedback and experiences to highlight your service quality</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14} className="text-red-600" /> Author Details</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required placeholder="Author Name" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} />
                                    <input type="text" placeholder="Role (e.g. CEO, Traveler)" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.author_role} onChange={(e) => setFormData({ ...formData, author_role: e.target.value })} />
                                </div>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Location (e.g. Paris, France)" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.author_location} onChange={(e) => setFormData({ ...formData, author_location: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Star size={14} className="text-red-600" /> Configuration</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Experience Rating</label>
                                        <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                            value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} >
                                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Moderation Status</label>
                                        <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                            value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} >
                                            <option value="pending">Review Pending</option>
                                            <option value="approved">Approved & Live</option>
                                            <option value="rejected">Rejected / Hidden</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                                            <Star size={20} fill={formData.is_featured ? "currentColor" : "none"} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase">Feature Highlight</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Pin this review to high-traffic zones</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })} className={`w-14 h-8 rounded-full transition-all relative ${formData.is_featured ? 'bg-red-600' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.is_featured ? 'left-7 shadow-sm' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Quote size={14} className="text-red-600" /> Testimonial Content</label>
                            <textarea required rows="5" placeholder="Enter the author's feedback verbatim..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm resize-none leading-relaxed"
                                value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-gray-50 mt-12">
                            <button type="button" onClick={resetForm} className="px-10 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all" >Discard</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95 transition-all" >
                                {createMutation.isPending || updateMutation.isPending ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingId ? 'Save Revisions' : 'Approve & Publish'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TestimonialManager;
