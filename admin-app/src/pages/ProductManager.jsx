import React, { useState, useMemo, useEffect } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    Package, Grid, MapPin, Tag, Star, Info, Layers,
    ImageIcon, Clock, Calendar, Edit2, Trash2,
    AlertCircle, CheckCircle, ChevronDown, List,
    Users, TrendingUp, ShieldAlert, Download, Upload,
    Box, Filter, MoreVertical, Plus
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

import { ArrowLeft } from 'lucide-react';

const InventoryManager = ({ serviceId, onClose }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dailyPrices, setDailyPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchRooms = async () => {
        const { data } = await supabase.from('hotel_rooms').select('*').eq('service_id', serviceId);
        setRooms(data || []);
        if (data?.length > 0 && !selectedRoom) setSelectedRoom(data[0]);
    };

    const fetchInventory = async () => {
        if (!selectedRoom) return;
        setIsLoading(true);
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const start = new Date(year, month, 1).toISOString().split('T')[0];
        const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data } = await supabase
            .from('room_daily_prices')
            .select('*')
            .eq('room_id', selectedRoom.id)
            .gte('date', start)
            .lte('date', end);

        const prices = {};
        data?.forEach(item => { prices[item.date] = { price: item.price, is_blocked: item.is_blocked }; });
        setDailyPrices(prices);
        setIsLoading(false);
    };

    useEffect(() => { fetchRooms(); }, [serviceId]);
    useEffect(() => { fetchInventory(); }, [selectedRoom, selectedMonth]);

    const handleBlockDate = async (dateStr, isBlocked) => {
        const current = dailyPrices[dateStr] || { price: selectedRoom.price_per_night || 0, is_blocked: false };
        setDailyPrices({ ...dailyPrices, [dateStr]: { ...current, is_blocked: isBlocked } });

        await supabase.from('room_daily_prices').upsert({
            room_id: selectedRoom.id,
            date: dateStr,
            is_blocked: isBlocked,
            price: current.price
        }, { onConflict: 'room_id, date' });
        toast.success(isBlocked ? 'Date Blocked' : 'Date Unblocked');
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = [];
        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            const d = new Date(year, month, i);
            days.push({ date: d.toISOString().split('T')[0], label: i, dayOfWeek: d.getDay() });
        }
        return days;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"><ArrowLeft size={24} /></button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Terminal</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Availability & Dynamic Pricing</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <input type="month" value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
                        onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                        className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Types</h3>
                    <div className="flex flex-col gap-2">
                        {rooms.map(room => (
                            <button key={room.id} onClick={() => setSelectedRoom(room)}
                                className={`px-6 py-4 rounded-3xl text-left transition-all border ${selectedRoom?.id === room.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}>
                                <p className="font-black uppercase text-[11px] tracking-tight">{room.name}</p>
                                <p className="text-[9px] font-bold opacity-60 mt-1 uppercase">from MUR {room.price_per_night}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Matrix...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{d}</div>
                            ))}
                            {getDaysInMonth(selectedMonth).map((day, idx) => {
                                const data = dailyPrices[day.date] || { price: selectedRoom?.price_per_night || 0, is_blocked: false };
                                const isPast = new Date(day.date) < new Date(new Date().setHours(0, 0, 0, 0));
                                if (idx === 0) {
                                    return <React.Fragment key={day.date}>
                                        {[...Array(day.dayOfWeek)].map((_, i) => <div key={`empty-${i}`} />)}
                                        <DayCard day={day} data={data} isPast={isPast} onToggle={() => handleBlockDate(day.date, !data.is_blocked)} />
                                    </React.Fragment>
                                }
                                return <DayCard key={day.date} day={day} data={data} isPast={isPast} onToggle={() => handleBlockDate(day.date, !data.is_blocked)} />
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DayCard = ({ day, data, isPast, onToggle }) => (
    <div onClick={isPast ? null : onToggle} className={`p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer
        ${isPast ? 'opacity-20 grayscale border-slate-50' : data.is_blocked ? 'bg-red-50 border-red-100 text-red-600 shadow-inner' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-900 shadow-sm'}`}>
        <span className="text-[10px] font-black">{day.label}</span>
        <span className="text-[9px] font-bold opacity-60">MUR {data.price}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${data.is_blocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
    </div>
);

const ProductManager = () => {
    const [view, setView] = useState('list'); // 'list', 'edit', 'inventory'
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Inventory State
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [dailyPrices, setDailyPrices] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const initialFormState = {
        name: '',
        description: '',
        category: 'hotels',
        location: '',
        pricing: { basePrice: 0, currency: 'MUR' },
        images: [],
        itinerary: [],
        features: [],
        inclusions: [],
        exclusions: [],
        highlights: [],
        is_active: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: products,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('services', {
        orderColumn: 'created_at',
        ascending: false,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (product) => {
        setFormData({
            ...product,
            pricing: product.pricing || { basePrice: product.price || 0, currency: 'MUR' },
            itinerary: product.itinerary || [],
            features: product.features || [],
            inclusions: product.inclusions || [],
            exclusions: product.exclusions || [],
            highlights: product.highlights || []
        });
        setEditingId(product.id);
        setView('edit');
    };

    const addItineraryDay = () => {
        const newDay = { day: (formData.itinerary?.length || 0) + 1, title: '', description: '' };
        setFormData({ ...formData, itinerary: [...(formData.itinerary || []), newDay] });
    };

    const removeItineraryDay = (idx) => {
        const newItinerary = formData.itinerary.filter((_, i) => i !== idx)
            .map((item, i) => ({ ...item, day: i + 1 }));
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const updateItineraryDay = (idx, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[idx] = { ...newItinerary[idx], [field]: value };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.location?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, filterCategory]);

    // Room & Inventory Logic (Preserved and Refined)
    const fetchRooms = async (serviceId) => {
        const { data, error } = await supabase.from('hotel_rooms').select('*').eq('service_id', serviceId);
        if (!error) {
            setRooms(data || []);
            if (data?.length > 0) setSelectedRoom(data[0]);
        }
    };

    useEffect(() => {
        if (view === 'inventory' && editingId) {
            fetchRooms(editingId);
        }
    }, [view, editingId]);

    const stats = [
        { label: 'Total Listings', value: products.length, icon: Package, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Active Services', value: products.filter(p => p.is_active !== false).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Updates', value: 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    const columns = [
        { header: 'Service/Product' },
        { header: 'Category', align: 'left' },
        { header: 'Price', align: 'left' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Service Repository"
            subtitle="Global Inventory & Pricing Command"
            icon={Package}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Filter services by name or location..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="New Service"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={() => save(editingId, formData)}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredProducts}
            renderRow={(product) => (
                <tr key={product.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-100">
                                {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={20} />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-900 truncate uppercase tracking-tight">{product.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest mt-1">
                                    <MapPin size={10} /> {product.location || 'Global/Dynamic'}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            {product.category}
                        </span>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">MUR {product.pricing?.basePrice || product.price || 0}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Starting Rate</span>
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${product.is_active !== false ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            {product.is_active !== false ? 'Active' : 'Draft'}
                        </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => { setEditingId(product.id); setView('inventory'); }} className="p-2.5 bg-white text-amber-600 border border-slate-100 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Inventory"><Calendar size={16} /></button>
                            <button onClick={() => handleEdit(product)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('Delete this service?')) deleteMutation.mutate(product.id); }} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Primary Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Service Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-black text-gray-900" placeholder="e.g. Radisson Blu Azuri Resort" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-black text-gray-900 uppercase">
                                    <option value="hotels">Hotels</option>
                                    <option value="activities">Activities</option>
                                    <option value="cruises">Cruises</option>
                                    <option value="packages">Packages</option>
                                    <option value="transfers">Transfers</option>
                                    <option value="Guest Houses">Guest Houses</option>
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-gray-600 text-sm resize-none" placeholder="Provide a compelling narrative for this service..." />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-sm" placeholder="e.g. Belle Mare, Mauritius" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Base Price (MUR)</label>
                                <input type="number" value={formData.pricing?.basePrice} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, basePrice: parseInt(e.target.value) } })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-black text-sm" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Inventory & Assets</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Images (URLs)</label>
                            <div className="grid grid-cols-2 gap-4">
                                {(formData.images || []).map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" value={img} onChange={(e) => {
                                            const newImages = [...formData.images];
                                            newImages[idx] = e.target.value;
                                            setFormData({ ...formData, images: newImages });
                                        }} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold font-mono outline-none focus:bg-white transition-all" />
                                        <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                <button onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })} className="col-span-2 py-3 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={14} /> Add Image Link
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">03</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Detailed Narrative</h3>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Itinerary Builder</h4>
                                <button type="button" onClick={addItineraryDay} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(formData.itinerary || []).map((day, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Day {day.day}</span>
                                            <button type="button" onClick={() => removeItineraryDay(idx)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                        <input type="text" placeholder="Title" value={day.title} onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-100 text-[11px] font-black outline-none focus:bg-slate-50" />
                                        <textarea placeholder="Description" value={day.description} onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-100 text-[11px] font-medium outline-none focus:bg-slate-50 min-h-[80px] resize-none" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {['features', 'inclusions', 'exclusions', 'highlights'].map(key => (
                                <div key={key} className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key}</h4>
                                        <button type="button" onClick={() => setFormData({ ...formData, [key]: [...(formData[key] || []), ''] })} className="text-slate-900 hover:scale-110 transition-transform"><Plus size={16} /></button>
                                    </div>
                                    <div className="space-y-3">
                                        {(formData[key] || []).map((item, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input type="text" value={item} onChange={e => {
                                                    const newList = [...formData[key]];
                                                    newList[idx] = e.target.value;
                                                    setFormData({ ...formData, [key]: newList });
                                                }} className="flex-1 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                                                <button type="button" onClick={() => setFormData({ ...formData, [key]: formData[key].filter((_, i) => i !== idx) })} className="text-red-200 hover:text-red-400"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        />
    );
};

export default ProductManager;
