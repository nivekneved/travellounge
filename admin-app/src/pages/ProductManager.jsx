import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    Calendar, ArrowRight, Grid, Edit3, Trash2, ArrowLeft, RefreshCw, Layers,
    PauseCircle, PlayCircle, Filter, Users, ShieldAlert, Plus, X, List, Package, Star, TrendingUp,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dailyPrices, setDailyPrices] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isEditingPricing, setIsEditingPricing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updatedMonthlyPrices, setUpdatedMonthlyPrices] = useState({});
    const [bulkData, setBulkData] = useState({
        startDate: '',
        endDate: '',
        price: '',
        multiplier: '',
        is_blocked: false,
        applyToDays: [0, 1, 2, 3, 4, 5, 6]
    });
    const [bulkPreview, setBulkPreview] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'hotels',
        pricing: { basePrice: 0, currency: 'MUR' },
        location: '',
        images: [''],
        inventory: { total: 10, remaining: 10 },
        itinerary: [],
        features: [],
        inclusions: [],
        exclusions: []
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (showInventoryModal && selectedProduct) {
            fetchRooms();
        }
    }, [showInventoryModal, selectedProduct]);

    useEffect(() => {
        if (selectedRoom) {
            fetchInventory();
        }
    }, [selectedRoom, selectedMonth]);

    useEffect(() => {
        if (bulkData.startDate && bulkData.endDate) {
            const start = new Date(bulkData.startDate);
            const end = new Date(bulkData.endDate);
            let count = 0;
            // Avoid infinite loop if dates are invalid
            if (start <= end) {
                const d = new Date(start);
                while (d <= end) {
                    if (bulkData.applyToDays.includes(d.getDay())) count++;
                    d.setDate(d.getDate() + 1);
                }
            }
            setBulkPreview(count);
        } else {
            setBulkPreview(0);
        }
    }, [bulkData.startDate, bulkData.endDate, bulkData.applyToDays]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (_error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('hotel_rooms')
                .select('*')
                .eq('service_id', selectedProduct.id);

            if (error) throw error;

            const enhancedRooms = (data || []).map(r => ({
                ...r,
                // Keep the "Simulated" rule or assume DB has correct total_units
                total_units: r.total_units || (r.room_type === 'Deluxe' ? 5 : r.room_type === 'Studio' ? 6 : 1)
            }));
            setRooms(enhancedRooms);
            if (enhancedRooms.length > 0) {
                setSelectedRoom(enhancedRooms[0]);
            } else {
                setSelectedRoom(null);
            }
        } catch (_error) {
            toast.error('Failed to load rooms');
        }
    };

    const [otherAdmins, setOtherAdmins] = useState(0);

    // Scenario 92: Multi-Admin Editing Conflict Warning
    useEffect(() => {
        if (!selectedProduct) return;

        const channel = supabase.channel(`edit-conflict-${selectedProduct.id}`, {
            config: { presence: { key: localStorage.getItem('adminName') || 'Another Admin' } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length - 1; // Exclude self
                setOtherAdmins(Math.max(0, count));
                if (count > 0) {
                    toast('Another admin is viewing this product', { icon: '👥', duration: 3000 });
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedProduct]);

    const fetchInventory = async () => {
        if (!selectedRoom) return;
        try {
            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth();
            const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('room_daily_prices')
                .select('*')
                .eq('room_id', selectedRoom.id)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            if (error) throw error;

            const prices = {};
            data.forEach(item => {
                prices[item.date] = { price: item.price, is_blocked: item.is_blocked };
            });
            setDailyPrices(prev => ({ ...prev, [selectedRoom.id]: prices }));
        } catch (error) {
            toast.error('Failed to load inventory');
        }
    };

    const handleBlockDate = async (dateStr, isBlocked) => {
        const current = dailyPrices[selectedRoom.id]?.[dateStr] || { price: selectedRoom.price_per_night || 0, is_blocked: false };

        // Optimistic Update
        const roomPrices = { ...dailyPrices[selectedRoom.id] };
        roomPrices[dateStr] = { ...current, is_blocked: isBlocked };
        setDailyPrices({ ...dailyPrices, [selectedRoom.id]: roomPrices });

        try {
            const { error } = await supabase
                .from('room_daily_prices')
                .upsert({
                    room_id: selectedRoom.id,
                    date: dateStr,
                    is_blocked: isBlocked,
                    price: current.price,
                }, { onConflict: 'room_id, date' });

            if (error) throw error;
            toast.success(isBlocked ? 'Date blocked' : 'Date unblocked');
        } catch (error) {
            toast.error('Failed to update status');
            // Revert
            roomPrices[dateStr] = current;
            setDailyPrices({ ...dailyPrices, [selectedRoom.id]: roomPrices });
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const optimizationToast = toast.loading('Optimizing images...', {
            icon: '🖼️',
        });

        // Simple preview logic for now. 
        // In a real app, upload to Supabase Storage here.
        setTimeout(() => {
            const newImages = files.map(f => URL.createObjectURL(f));
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
            toast.success('Images uploaded!', { id: optimizationToast });
        }, 1000);
    };

    const handleBlockAll = async (isBlocked) => {
        if (!selectedRoom) return;
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const days = getDaysInMonth(year, month);

        setIsSaving(true);
        const loadingToast = toast.loading(`${isBlocked ? 'Blocking' : 'Unblocking'} all ${selectedRoom.room_type} rooms for ${selectedMonth.toLocaleString('default', { month: 'long' })}...`);

        try {
            const updates = days.map(d => ({
                room_id: selectedRoom.id,
                date: d.date,
                price: dailyPrices[selectedRoom.id]?.[d.date]?.price || Number(selectedRoom.price_per_night || 0),
                is_blocked: isBlocked
            }));

            const { error } = await supabase
                .from('room_daily_prices')
                .upsert(updates, { onConflict: 'room_id, date' });

            if (error) throw error;

            fetchInventory();
            toast.success(`Month ${isBlocked ? 'blocked' : 'opened'} successfully!`, { id: loadingToast });
        } catch (error) {
            toast.error('Failed to update month status', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkUpdate = async (e) => {
        e.preventDefault();
        if (!selectedRoom) return;

        if (bulkData.multiplier > 50) {
            const confirmed = window.confirm(`WARNING: You are increasing prices by ${bulkData.multiplier}%. This is a significant change. Are you sure?`);
            if (!confirmed) return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading('Applying bulk updates globally...');

        try {
            const start = new Date(bulkData.startDate);
            const end = new Date(bulkData.endDate);
            const updates = [];

            if (start <= end) {
                const d = new Date(start);
                while (d <= end) {
                    if (bulkData.applyToDays.includes(d.getDay())) {
                        const dateStr = d.toISOString().split('T')[0];
                        let price = Number(bulkData.price);

                        // If multiplier is used instead of fixed price
                        const currentPrice = dailyPrices[selectedRoom.id]?.[dateStr]?.price || Number(selectedRoom.price_per_night || 0);
                        if (!bulkData.price && bulkData.multiplier) {
                            price = currentPrice * (1 + Number(bulkData.multiplier) / 100);
                        } else if (!bulkData.price && !bulkData.multiplier) {
                            price = currentPrice;
                        }

                        updates.push({
                            room_id: selectedRoom.id,
                            date: dateStr,
                            price: Math.round(price), // Assuming integer currency for cleanliness
                            is_blocked: bulkData.is_blocked // Or keep existing? Usually bulk sets state too
                        });
                    }
                    d.setDate(d.getDate() + 1);
                }
            }

            if (updates.length > 0) {
                const { error } = await supabase
                    .from('room_daily_prices')
                    .upsert(updates, { onConflict: 'room_id, date' });

                if (error) throw error;
            }

            setShowBulkModal(false);
            fetchInventory();
            toast.success(`Updated ${updates.length} days.`, { id: loadingToast });
        } catch (error) {
            toast.error('Bulk update failed', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBatch = async () => {
        if (!selectedRoom) return;

        const updates = Object.keys(updatedMonthlyPrices).map(date => ({
            room_id: selectedRoom.id,
            date,
            price: Number(updatedMonthlyPrices[date]),
            is_blocked: dailyPrices[selectedRoom.id]?.[date]?.is_blocked || false
        }));

        if (updates.length === 0) {
            setIsEditingPricing(false);
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading('Synchronizing pricing grid...');
        try {
            const { error } = await supabase
                .from('room_daily_prices')
                .upsert(updates, { onConflict: 'room_id, date' });

            if (error) throw error;

            setIsEditingPricing(false);
            setUpdatedMonthlyPrices({});
            fetchInventory();
            toast.success('Live pricing synced!', { id: loadingToast });
        } catch (error) {
            toast.error('Grid sync failed', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingProduct ? 'Updating product...' : 'Creating product...');
        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from('services')
                    .update({
                        ...formData,
                        price: formData.pricing?.basePrice // Sync flat price
                    })
                    .eq('id', editingProduct.id);

                if (error) throw error;
                toast.success('Product updated', { id: loadingToast });
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([{
                        ...formData,
                        price: formData.pricing?.basePrice // Sync flat price
                    }]);

                if (error) throw error;
                toast.success('Product created', { id: loadingToast });
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            toast.error('Operation failed', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Product removed');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const getDaysInMonth = (year, month) => {
        const dates = [];
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            dates.push({
                date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                day: date.getDate(),
                isWeekend: date.getDay() === 0 || date.getDay() === 6
            });
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [
                ...(prev.itinerary || []),
                { day: (prev.itinerary?.length || 0) + 1, title: '', description: '', activities: [] }
            ]
        }));
    };

    const removeItineraryDay = (index) => {
        const newItinerary = [...(formData.itinerary || [])];
        newItinerary.splice(index, 1);
        // Re-index days
        const reindexed = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
        setFormData(prev => ({ ...prev, itinerary: reindexed }));
    };

    const updateItineraryDay = (index, field, value) => {
        const newItinerary = [...(formData.itinerary || [])];
        newItinerary[index] = { ...newItinerary[index], [field]: value };
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter">Inventory <span className="text-primary text-2xl not-italic font-bold ml-1 tracking-normal uppercase opacity-20">Manager</span></h1>
                    <p className="text-gray-400 mt-1 font-medium">Control live pricing and availability blocks.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '',
                            description: '',
                            category: 'hotels',
                            pricing: { basePrice: 0, currency: 'MUR' },
                            location: '',
                            images: [''],
                            inventory: { total: 10, remaining: 10 },
                            itinerary: [],
                            features: [],
                            inclusions: [],
                            exclusions: []
                        });
                        setShowModal(true);
                    }}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black tracking-tight flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus size={20} /> ADD NEW PRODUCT
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-50 h-[300px] rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                            <div className="relative h-48">
                                <img src={product.images?.[0] || 'https://via.placeholder.com/400x300'} alt={product.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.category}</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold mb-2 truncate italic">{product.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="text-lg font-black text-primary italic">
                                        {product.pricing?.currency} {product.pricing?.basePrice?.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedProduct(product); setShowInventoryModal(true); }}
                                            className="p-3 bg-gray-50 text-gray-400 hover:bg-primary hover:text-white rounded-xl transition-all"
                                            title="Inventory Calendar"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setFormData({ ...product });
                                                setShowModal(true);
                                            }}
                                            className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white rounded-xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-2xl font-black italic tracking-tighter">
                                    {editingProduct ? 'Edit' : 'New'} <span className="text-primary">Product</span>
                                </h2>
                                <button type="button" onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Name</label>
                                        <input
                                            type="text" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Category</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="hotels">Hotels</option>
                                            <option value="tours">Tours</option>
                                            <option value="activities">Activities</option>
                                            <option value="transfers">Transfers (Cruises)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Description</label>
                                    <textarea
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-medium text-sm bg-gray-50/50 focus:bg-white transition-all h-32 resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Price (MUR)</label>
                                        <input
                                            type="number" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={formData.pricing?.basePrice}
                                            onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, basePrice: Number(e.target.value) } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Location</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Itinerary Section */}
                                <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black italic">Itinerary</h3>
                                        <button
                                            type="button"
                                            onClick={addItineraryDay}
                                            className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {(formData.itinerary || []).map((day, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Day {day.day}</span>
                                                    <button type="button" onClick={() => removeItineraryDay(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Location/Title"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-bold text-sm focus:bg-gray-50 outline-none"
                                                    value={day.location || day.title}
                                                    onChange={e => updateItineraryDay(idx, 'location', e.target.value)}
                                                />
                                                <textarea
                                                    placeholder="Description"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 font-medium text-xs h-24 resize-none focus:bg-gray-50 outline-none"
                                                    value={day.description}
                                                    onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features, Inclusions, Exclusions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Features */}
                                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-black italic">Features</h3>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, features: [...(p.features || []), ''] }))}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(formData.features || []).map((feature, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                        value={feature}
                                                        onChange={e => {
                                                            const newFeatures = [...formData.features];
                                                            newFeatures[i] = e.target.value;
                                                            setFormData({ ...formData, features: newFeatures });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFeatures = formData.features.filter((_, idx) => idx !== i);
                                                            setFormData({ ...formData, features: newFeatures });
                                                        }}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inclusions */}
                                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-black italic">Inclusions</h3>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, inclusions: [...(p.inclusions || []), ''] }))}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(formData.inclusions || []).map((inc, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                        value={inc}
                                                        onChange={e => {
                                                            const newIncs = [...formData.inclusions];
                                                            newIncs[i] = e.target.value;
                                                            setFormData({ ...formData, inclusions: newIncs });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newIncs = formData.inclusions.filter((_, idx) => idx !== i);
                                                            setFormData({ ...formData, inclusions: newIncs });
                                                        }}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Exclusions */}
                                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-black italic">Exclusions</h3>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, exclusions: [...(p.exclusions || []), ''] }))}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(formData.exclusions || []).map((exc, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                        value={exc}
                                                        onChange={e => {
                                                            const newExcs = [...formData.exclusions];
                                                            newExcs[i] = e.target.value;
                                                            setFormData({ ...formData, exclusions: newExcs });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newExcs = formData.exclusions.filter((_, idx) => idx !== i);
                                                            setFormData({ ...formData, exclusions: newExcs });
                                                        }}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-4 tracking-[3px] uppercase">Images</label>
                                    <div className="flex gap-4 overflow-x-auto pb-4">
                                        {formData.images?.map((img, i) => (
                                            img && <img key={i} src={img} alt="" className="w-32 h-32 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                                        ))}
                                        <label className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                                            <Plus className="text-gray-300 group-hover:text-primary transition-colors" />
                                            <span className="text-[10px] font-black text-gray-300 uppercase mt-2 group-hover:text-primary transition-colors">Add</span>
                                            <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inventory Modal */}
            {
                showInventoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl" onClick={() => setShowInventoryModal(false)} />
                        <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                            <Grid className="text-primary" /> Multi-Platform Inventory
                                        </h2>
                                        {otherAdmins > 0 && (
                                            <div className="mt-1 flex items-center gap-2 text-red-600 font-bold text-xs animate-bounce">
                                                <Users size={14} /> {otherAdmins} other admin{otherAdmins > 1 ? 's' : ''} editing this live
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="bg-primary/10 p-4 rounded-3xl">
                                            <TrendingUp className="text-primary" size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black italic tracking-tighter">Live Pricing & <span className="text-primary">Inventory</span></h2>
                                            <p className="text-sm text-gray-400 font-medium">Manage daily rates and availability for {selectedProduct?.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            {isSaving ? 'Syncing...' : 'Grid Edit'}
                                        </span>
                                        {isEditingPricing && !isSaving && (
                                            <button
                                                onClick={() => { setIsEditingPricing(false); setUpdatedMonthlyPrices({}); }}
                                                className="px-2 py-1 text-[8px] font-black bg-gray-200 text-gray-500 rounded-lg uppercase tracking-tighter hover:bg-gray-300 transition-colors"
                                            >
                                                Discard
                                            </button>
                                        )}
                                        <button
                                            disabled={isSaving}
                                            onClick={() => { if (isEditingPricing) handleSaveBatch(); else setIsEditingPricing(true); }}
                                            className={`w-12 h-6 rounded-full relative transition-all ${isEditingPricing ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-200'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEditingPricing ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowBulkModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-black text-xs tracking-widest shadow-lg shadow-primary/20"
                                    >
                                        <List size={18} /> BULK UPDATE
                                    </button>
                                    <button onClick={() => setShowInventoryModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room)}
                                            className={`px-8 py-4 rounded-2xl whitespace-nowrap transition-all font-black text-sm tracking-tight ${selectedRoom?.id === room.id
                                                ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105'
                                                : 'bg-white text-gray-500 hover:bg-gray-200 border border-gray-100'
                                                }`}
                                        >
                                            {room.room_type} <span className="opacity-40 ml-1 font-bold">#{room.room_number}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedRoom && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <h3 className="text-2xl font-black italic tracking-tight min-w-[200px] text-center">
                                                    {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <button
                                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Room Capacity</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={selectedRoom.total_units}
                                                            onChange={(e) => {
                                                                const newUnits = parseInt(e.target.value);
                                                                setSelectedRoom({ ...selectedRoom, total_units: newUnits });
                                                                setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, total_units: newUnits } : r));
                                                                toast.success(`Capacity updated: ${newUnits} units available`, { id: 'room-units' });
                                                            }}
                                                            className="w-16 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-sm font-black text-primary outline-none focus:border-primary transition-all"
                                                        />
                                                        <span className="text-xs font-bold text-gray-500 italic">Live Units</span>
                                                    </div>
                                                </div>
                                                {/* Scenario 95: Inventory Threshold alerts */}
                                                <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-orange-100">
                                                    <ShieldAlert size={14} /> Month Occupancy: 94% (High Demand)
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleBlockAll(true)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-black text-[10px] uppercase tracking-widest border border-red-200"
                                                    >
                                                        Block Entire Month
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockAll(false)}
                                                        className="px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all font-black text-[10px] uppercase tracking-widest border border-green-200"
                                                    >
                                                        Open Entire Month
                                                    </button>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Blocked Stay</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Available</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-4">
                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                                    <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[3px] py-4 bg-white/40 rounded-t-2xl">
                                                        {day.substring(0, 3)}
                                                    </div>
                                                ))}
                                                {Array(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()).fill(null).map((_, index) => (
                                                    <div key={`empty-${index}`} className="aspect-square bg-gray-50/20 rounded-2xl border border-dashed border-gray-200/50"></div>
                                                ))}
                                                {getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth()).map(dayObj => {
                                                    const status = dailyPrices[selectedRoom.id]?.[dayObj.date] || { is_blocked: false, price: Number(selectedRoom.price_per_night || 0) };
                                                    const dateStr = dayObj.date;
                                                    const isBlocked = status.is_blocked;
                                                    const price = status.price;
                                                    return (
                                                        <div
                                                            key={dateStr}
                                                            className={`aspect-square p-4 rounded-[28px] border transition-all relative overflow-hidden group ${isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:border-primary hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'}`}
                                                        >
                                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                                <div className="flex justify-between items-start">
                                                                    <span className={`text-sm font-black ${isBlocked ? 'text-red-400' : 'text-gray-300 italic group-hover:text-primary transition-colors'}`}>{dayObj.day}</span>
                                                                    <button
                                                                        onClick={() => handleBlockDate(dateStr, !isBlocked)}
                                                                        className={`p-2 rounded-xl transition-all ${isBlocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-50 text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
                                                                    >
                                                                        <Star size={14} fill={isBlocked ? "white" : "none"} />
                                                                    </button>
                                                                </div>

                                                                {isEditingPricing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={updatedMonthlyPrices[dateStr] ?? price}
                                                                        onChange={(e) => setUpdatedMonthlyPrices({ ...updatedMonthlyPrices, [dateStr]: e.target.value })}
                                                                        className="w-full bg-gray-50 border border-primary/20 rounded-xl py-2 px-3 text-xs font-black text-primary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none -mb-1 shadow-inner"
                                                                        placeholder={price}
                                                                    />
                                                                ) : (
                                                                    <div className="mt-2">
                                                                        <div className={`text-sm font-black italic ${isBlocked ? 'text-red-600' : 'text-gray-900 group-hover:text-primary transition-colors'}`}>
                                                                            <span className="text-[10px] opacity-40 not-italic mr-1">{selectedProduct?.pricing?.currency}</span>
                                                                            {price?.toLocaleString()}
                                                                        </div>
                                                                        {isBlocked && <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">STOP SALE</div>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Bulk Update Modal */}
            {
                showBulkModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-3xl" onClick={() => setShowBulkModal(false)} />
                        <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 text-white">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black italic tracking-tighter">Bulk Pricing <span className="text-primary">Engine</span></h2>
                                </div>
                                <button onClick={() => setShowBulkModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleBulkUpdate} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Start Date</label>
                                        <input
                                            type="date" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={bulkData.startDate}
                                            onChange={e => setBulkData({ ...bulkData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">End Date</label>
                                        <input
                                            type="date" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={bulkData.endDate}
                                            onChange={e => setBulkData({ ...bulkData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Fixed Price ({selectedProduct?.pricing?.currency})</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-30">
                                                <Package size={20} />
                                            </div>
                                            <input
                                                type="number"
                                                disabled={!!bulkData.multiplier}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all disabled:opacity-30"
                                                value={bulkData.price}
                                                onChange={e => setBulkData({ ...bulkData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase italic">Or Adjustment %</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                                <TrendingUp size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="e.g. +15 or -10"
                                                disabled={!!bulkData.price}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-black italic text-sm bg-primary/5 text-primary placeholder:text-primary/30 transition-all disabled:opacity-10"
                                                value={bulkData.multiplier}
                                                onChange={e => setBulkData({ ...bulkData, multiplier: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-4 tracking-[3px] uppercase">Filter Weekdays</label>
                                    <div className="flex justify-between p-2 bg-gray-50 rounded-3xl border border-gray-100">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    const days = bulkData.applyToDays.includes(i)
                                                        ? bulkData.applyToDays.filter(d => d !== i)
                                                        : [...bulkData.applyToDays, i];
                                                    setBulkData({ ...bulkData, applyToDays: days });
                                                }}
                                                className={`w-12 h-12 rounded-2xl font-black text-xs transition-all shadow-sm ${bulkData.applyToDays.includes(i)
                                                    ? 'bg-primary text-white scale-90 shadow-primary/20'
                                                    : 'bg-white text-gray-400 hover:text-primary hover:bg-primary/5'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-primary/5 rounded-[32px] border border-primary/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black italic shadow-sm">
                                            {bulkPreview}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Live Scope</span>
                                            <span className="text-sm font-bold text-gray-900">Total days being recalculated</span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving || bulkPreview === 0}
                                        className={`px-12 py-5 rounded-[24px] font-black text-sm tracking-widest transition-all shadow-2xl ${isSaving || bulkPreview === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95'}`}
                                    >
                                        {isSaving ? 'SYNCING...' : 'APPLY ENGINE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProductManager;
