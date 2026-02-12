import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: '',
        valid_until: '',
        is_active: true
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            toast.error(`Failed to load promotions: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
            };

            if (editingId) {
                const { error } = await supabase
                    .from('promotions')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Promotion updated');
            } else {
                const { error } = await supabase
                    .from('promotions')
                    .insert([payload]);

                if (error) throw error;
                toast.success('Promotion created');
            }

            closeModal();
            fetchPromotions();
            closeModal();
            fetchPromotions();
        } catch (error) {
            toast.error(`Error saving promotion: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;

        try {
            const { error } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Promotion deleted');
            fetchPromotions();
        } catch (error) {
            toast.error(`Error deleting promotion: ${error.message}`);
        }
    };

    const openModal = (promo = null) => {
        if (promo) {
            setEditingId(promo.id);
            setFormData({
                title: promo.title,
                description: promo.description || '',
                image: promo.image || '',
                link: promo.link || '',
                valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
                is_active: promo.is_active
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                image: '',
                link: '',
                valid_until: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Promotions Manager</h1>
                    <p className="text-white/60">Manage seasonal offers and marketing banners.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-red-600/30"
                >
                    <Plus size={20} />
                    New Promotion
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map(promo => (
                    <div key={promo.id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all">
                        <div className="h-48 bg-gray-800 relative">
                            {promo.image ? (
                                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                            )}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase ${promo.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
                                }`}>
                                {promo.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
                            <p className="text-white/60 text-sm mb-4 line-clamp-2">{promo.description}</p>

                            <div className="space-y-2 mb-6">
                                {promo.valid_until && (
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Calendar size={14} />
                                        <span>Ends: {new Date(promo.valid_until).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {promo.link && (
                                    <div className="flex items-center gap-2 text-white/40 text-xs text-blue-400">
                                        <LinkIcon size={14} />
                                        <span className="truncate">{promo.link}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => openModal(promo)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#121212] w-full max-w-lg rounded-3xl border border-white/10 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Promotion' : 'New Promotion'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows="2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <ImageIcon size={12} /> Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <LinkIcon size={12} /> Target Link
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer mt-6">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="hidden"
                                        />
                                        <span className="text-white font-bold">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30">
                                    {editingId ? 'Update Promotion' : 'Create Promotion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManager;
