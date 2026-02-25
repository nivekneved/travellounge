import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Calendar,
    Link as LinkIcon,
    Search,
    ArrowUpDown,
    TrendingUp,
    Zap,
    Tag,
    SearchX,
    Image as ImageIcon,
    Clock,
    Loader
} from 'lucide-react';

const PromotionManager = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: '',
        valid_until: '',
        is_active: true
    });

    const queryClient = useQueryClient();

    // Fetch promotions
    const { data: promotions = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const filteredAndSortedPromotions = useMemo(() => {
        return promotions.filter(p => {
            const searchStr = (searchTerm || '').toLowerCase();
            return (
                p.title?.toLowerCase().includes(searchStr) ||
                p.description?.toLowerCase().includes(searchStr)
            );
        }).sort((a, b) => {
            const key = sortConfig.key;
            const valA = a[key]?.toString().toLowerCase() || '';
            const valB = b[key]?.toString().toLowerCase() || '';

            return sortConfig.direction === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });
    }, [promotions, searchTerm, sortConfig]);

    const expiringSoonCount = useMemo(() => {
        const weekFromNow = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        return promotions.filter(p => p.valid_until && new Date(p.valid_until).getTime() < weekFromNow).length;
    }, [promotions]);

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load promotions: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newPromo) => {
            const { data, error } = await supabase.from('promotions').insert([newPromo]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['promotions']);
            toast.success('Promotion created successfully!');
            resetForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('promotions').update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['promotions']);
            toast.success('Promotion updated successfully!');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('promotions').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['promotions']);
            toast.success('Promotion removed');
        }
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
            title: '',
            description: '',
            image: '',
            link: '',
            valid_until: '',
            is_active: true
        });
        setEditingId(null);
        setIsEditing(false);
    };

    const handleEdit = (promo) => {
        setFormData({
            title: promo.title || '',
            description: promo.description || '',
            image: promo.image || '',
            link: promo.link || '',
            valid_until: promo.valid_until || '',
            is_active: promo.is_active !== undefined ? promo.is_active : true
        });
        setEditingId(promo.id);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader className="animate-spin text-red-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Offers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Campaign Center</h1>
                    <p className="text-gray-500 font-medium">Create and manage seasonal offers, early-bird deals, and exclusive coupons</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { if (isEditing) resetForm(); else setIsEditing(true); }}
                        className={`flex items-center gap-2 ${isEditing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'} px-8 py-4 rounded-2xl font-black transition-all active:scale-95 group`}
                    >
                        {isEditing ? <X size={22} /> : <Plus size={22} className="group-hover:rotate-90 transition-transform" />}
                        <span>{isEditing ? 'Cancel Edit' : 'Launch Campaign'}</span>
                    </button>
                </div>
            </div>

            {!isEditing ? (
                <>
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <Tag size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Live Offers</p>
                                <h3 className="text-3xl font-black text-gray-900" >{promotions.filter(p => p.is_active).length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Expiring Soon</p>
                                <h3 className="text-3xl font-black text-gray-900" >{expiringSoonCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Conversion Rate</p>
                                <h3 className="text-3xl font-black text-gray-900" >High</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filters Area */}
                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by campaign title or description..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest" >Promotion Ledger</span>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed">
                                <colgroup>
                                    <col className="w-[300px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[150px]" />
                                    <col className="w-[120px]" />
                                    <col className="w-[150px]" />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
                                        <th className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors text-left"
                                            onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                            <div className="flex items-center gap-2">Campaign <ArrowUpDown size={12} className={sortConfig.key === 'title' ? 'opacity-100' : 'opacity-20'} /></div>
                                        </th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expires At</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reference</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAndSortedPromotions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4 text-gray-300">
                                                    <SearchX size={60} />
                                                    <h3 className="text-lg font-black text-gray-900 ">No Campaigns Found</h3>
                                                    <p className="text-xs font-bold uppercase tracking-widest">Adjust your search or create a new one</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredAndSortedPromotions.map((promo) => (
                                        <tr key={promo.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border border-gray-50 group-hover:scale-110 transition-transform shadow-sm">
                                                        {promo.image ? <img src={promo.image} alt="" className="w-full h-full object-cover" /> : <TrendingUp size={24} />}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-gray-900 truncate text-sm uppercase ">{promo.title}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold line-clamp-1">{promo.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                                    <Calendar size={14} className="text-red-500" />
                                                    {promo.valid_until ? format(new Date(promo.valid_until), 'MMM d, yyyy') : 'Perpetual'}
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono truncate">
                                                    <LinkIcon size={12} />
                                                    {promo.link || '-'}
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 text-center">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${promo.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                    {promo.is_active ? 'Live' : 'Paused'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleEdit(promo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black" title="Edit"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(promo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black" title="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                    <div className="relative z-10 flex items-center gap-6 mb-12">
                        <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
                                {editingId ? 'Refine Campaign' : 'New Promotion'}
                            </h2>
                            <p className="text-lg text-slate-400 font-medium mt-1">Configure offer visibility, expiration, and landing mechanics</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Tag size={14} className="text-red-600" /> Offer Information</label>
                                <div className="space-y-4">
                                    <input type="text" required placeholder="Promotion Title" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    <textarea rows="3" placeholder="Brief description of the offer..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm resize-none"
                                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon size={14} className="text-red-600" /> Media & Visuals</label>
                                <div className="space-y-4">
                                    <input type="url" placeholder="Hero Image URL (https://...)" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Expiry Date</label>
                                            <input type="date" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                                value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Status</label>
                                            <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                                value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })} >
                                                <option value="true">Live & Public</option>
                                                <option value="false">Hidden / Draft</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><LinkIcon size={14} className="text-red-600" /> Call to Action Link</label>
                            <input type="url" placeholder="https://travellounge.mu/exclusive-deal-702" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-gray-50 mt-12">
                            <button type="button" onClick={resetForm} className="px-10 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all" >Force Revert</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95 transition-all" >
                                {createMutation.isPending || updateMutation.isPending ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingId ? 'Update Campaign' : 'Deploy Promotion'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PromotionManager;
