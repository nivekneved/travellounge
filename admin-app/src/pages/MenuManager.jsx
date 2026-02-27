/* eslint-disable unused-imports/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, GripVertical, LayoutList, ArrowUp, ArrowDown, Menu, Settings2, Globe, Edit3, Eye } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import ManagerLayout from '../components/ManagerLayout';

// Recursive Menu Item Component
const MenuItemEditor = ({ item, index, parentIndex = null, updateItem, deleteItem, moveItem, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleChange = (field, value) => {
        const newItem = { ...item, [field]: value };
        updateItem(index, parentIndex, newItem);
    };

    const handleAddChild = () => {
        const newChild = { label: 'New Link', link: '/' };
        const newChildren = [...(item.children || []), newChild];
        updateItem(index, parentIndex, { ...item, children: newChildren });
        setIsExpanded(true);
    };

    return (
        <div className={`transition-all duration-300 ${depth > 0 ? 'ml-10 mt-3 border-l-2 border-red-50 pl-6' : 'mb-4'}`}>
            <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${depth === 0
                ? 'bg-white border-gray-100 hover:border-red-200 shadow-sm'
                : 'bg-gray-50/50 border-gray-50 hover:bg-white hover:border-red-100'}`}>

                <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </div>

                {item.children && item.children.length > 0 ? (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-red-600 transition-colors">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <div className="w-4" />
                )}

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                        <input type="text" value={item.label} onChange={(e) => handleChange('label', e.target.value)} placeholder="Label"
                            className="w-full bg-transparent border-b-2 border-gray-100 focus:border-red-500 px-1 py-1 text-gray-900 font-bold text-sm focus:outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL / Path</label>
                        <input type="text" value={item.link} onChange={(e) => handleChange('link', e.target.value)} placeholder="/path"
                            className="w-full bg-transparent border-b-2 border-gray-100 focus:border-red-500 px-1 py-1 text-blue-600 font-mono text-xs focus:outline-none transition-all placeholder:text-gray-300" />
                    </div>
                </div>

                <div className="flex items-center gap-1 transition-all">
                    <button onClick={() => moveItem(index, parentIndex, -1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95" title="Move Up"><ArrowUp size={16} /></button>
                    <button onClick={() => moveItem(index, parentIndex, 1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95" title="Move Down"><ArrowDown size={16} /></button>
                    {depth === 0 && (
                        <button onClick={handleAddChild} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all ml-2 active:scale-95 border border-red-100/50" title="Add Sub-link"><Plus size={16} /></button>
                    )}
                    <button onClick={() => deleteItem(index, parentIndex)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all ml-1 active:scale-95" title="Delete"><Trash2 size={16} /></button>
                </div>
            </div>

            {isExpanded && item.children && item.children.length > 0 && (
                <div className="space-y-2">
                    {item.children.map((child, childIndex) => (
                        <MenuItemEditor
                            key={`${index}-${childIndex}`}
                            item={child}
                            index={childIndex}
                            parentIndex={index}
                            updateItem={updateItem}
                            deleteItem={deleteItem}
                            moveItem={moveItem}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MenuManager = () => {
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [menus, setMenus] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('category', 'menu');

            if (error) throw error;
            setMenus(data || []);
        } catch (error) {
            toast.error('Failed to load menus');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (menu) => {
        setMenuItems(menu.value || []);
        setEditingId(menu.id);
        setView('edit');
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('site_settings')
                .update({ value: menuItems })
                .eq('id', editingId);

            if (error) throw error;
            toast.success('Navigation updated successfully');
            fetchMenus();
            setView('list');
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const updateItem = (index, parentIndex, newItem) => {
        const newItems = [...menuItems];
        if (parentIndex !== null) {
            newItems[parentIndex].children[index] = newItem;
        } else {
            newItems[index] = newItem;
        }
        setMenuItems(newItems);
    };

    const deleteItem = (index, parentIndex) => {
        if (!window.confirm('Remove this menu item?')) return;
        const newItems = [...menuItems];
        if (parentIndex !== null) {
            newItems[parentIndex].children.splice(index, 1);
        } else {
            newItems.splice(index, 1);
        }
        setMenuItems(newItems);
    };

    const moveItem = (index, parentIndex, direction) => {
        const newItems = [...menuItems];
        const list = parentIndex !== null ? newItems[parentIndex].children : newItems;
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < list.length) {
            const temp = list[index];
            list[index] = list[newIndex];
            list[newIndex] = temp;
            setMenuItems(newItems);
        }
    };

    const addItem = () => {
        const newItem = { label: 'New Navigation Link', link: '/' };
        setMenuItems([...menuItems, newItem]);
    };

    const stats = [
        { label: 'Active Menus', value: menus.length, icon: Menu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Node links', value: menus.reduce((acc, m) => acc + (m.value?.length || 0) + (m.value?.reduce((a, i) => a + (i.children?.length || 0), 0) || 0), 0), icon: LayoutList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Link Integrity', value: '100%', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    const columns = [
        { header: 'Navigation ID' },
        { header: 'Registry Key' },
        { header: 'Node Count', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Navigation Architect"
            subtitle="Configure global menu frameworks, sub-layers, and routing logic"
            icon={Menu}
            stats={stats}
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={isSaving}
            isLoading={loading}
            columns={columns}
            data={menus}
            renderRow={(menu) => (
                <tr key={menu.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <Settings2 size={18} />
                            </div>
                            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{menu.description || menu.key}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <code className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded-lg">{menu.key}</code>
                    </td>
                    <td className="py-6 px-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {(menu.value?.length || 0)} Master Nodes
                    </td>
                    <td className="py-6 px-8 text-right">
                        <button onClick={() => handleEdit(menu)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Menu"><Edit3 size={16} /></button>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Logical structure</h3>
                            </div>
                            <button onClick={addItem} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">
                                <Plus size={14} /> Add Root Entry
                            </button>
                        </div>

                        <div className="space-y-4">
                            {menuItems.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200">
                                        <Menu size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Empty Navigation Framework</p>
                                        <p className="text-[10px] text-slate-300 font-medium mt-2">Initialize your first navigation node to begin.</p>
                                    </div>
                                </div>
                            ) : (
                                menuItems.map((item, index) => (
                                    <MenuItemEditor
                                        key={index}
                                        item={item}
                                        index={index}
                                        updateItem={updateItem}
                                        deleteItem={deleteItem}
                                        moveItem={moveItem}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Experience Preview</h3>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                            <Eye size={18} />
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[3rem] border border-slate-900 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col p-8">
                        <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                            <div className="text-white font-black text-xs tracking-tighter uppercase font-display">TRAVEL LOUNGE</div>
                            <div className="flex gap-6">
                                {menuItems.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] hover:text-white transition-colors cursor-pointer">{item.label}</div>
                                ))}
                                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white scale-75">
                                    <Plus size={10} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                                <Globe size={48} strokeWidth={0.5} />
                            </div>
                            <div>
                                <h4 className="text-white text-xl font-black tracking-tight uppercase mb-2">Navigation Live</h4>
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">Visual Interaction Logic Active</p>
                            </div>
                        </div>

                        <div className="mt-16 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-white font-black text-[10px] uppercase mb-1">{menuItems[0]?.label || '---'}</div>
                                <div className="text-white/20 text-[7px] font-black uppercase tracking-widest">{menuItems[0]?.link || '---'}</div>
                            </div>
                            <div className="p-4 bg-red-600/10 rounded-2xl border border-red-600/20">
                                <div className="text-red-600 font-black text-[10px] uppercase mb-1">Global Hub</div>
                                <div className="text-red-600/40 text-[7px] font-black uppercase tracking-widest">Master Route</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default MenuManager;
