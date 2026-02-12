import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft, ChevronRight, ChevronDown, GripVertical, Code, LayoutList, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

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
        <div className={`transition-all duration-200 ${depth > 0 ? 'ml-8 mt-2 border-l-2 border-white/10 pl-4' : 'mb-3'}`}>
            <div className={`group flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors ${depth === 0 ? 'bg-white/5' : 'bg-black/20'}`}>
                {/* Drag Handle (Visual only for now) */}
                <div className="text-white/20 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </div>

                {/* Expand/Collapse for items with children */}
                {item.children && item.children.length > 0 ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <div className="w-4" />
                )}

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                        <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            placeholder="Label"
                            className="w-full bg-transparent border-b border-white/10 focus:border-red-500 px-2 py-1 text-white text-sm focus:outline-none transition-colors"
                        />
                        <div className="text-[10px] text-white/30 px-2 uppercase tracking-wider mt-0.5">Label</div>
                    </div>
                    <div className="col-span-8">
                        <input
                            type="text"
                            value={item.link}
                            onChange={(e) => handleChange('link', e.target.value)}
                            placeholder="/path"
                            className="w-full bg-transparent border-b border-white/10 focus:border-red-500 px-2 py-1 text-blue-400 font-mono text-sm focus:outline-none transition-colors"
                        />
                        <div className="text-[10px] text-white/30 px-2 uppercase tracking-wider mt-0.5">URL / Path</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => moveItem(index, parentIndex, -1)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Move Up"
                    >
                        <ArrowUp size={14} />
                    </button>
                    <button
                        onClick={() => moveItem(index, parentIndex, 1)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Move Down"
                    >
                        <ArrowDown size={14} />
                    </button>

                    {depth === 0 && (
                        <button
                            onClick={handleAddChild}
                            className="p-1.5 rounded hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors ml-2"
                            title="Add Sub-link"
                        >
                            <Plus size={14} />
                        </button>
                    )}

                    <button
                        onClick={() => deleteItem(index, parentIndex)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Recursively render children */}
            {item.children && item.children.length > 0 && isExpanded && (
                <div className="mt-2">
                    {item.children.map((child, childIndex) => (
                        <MenuItemEditor
                            key={childIndex}
                            item={child}
                            index={childIndex}
                            parentIndex={index} // Pass current index as parentIndex for children
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
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'json'
    const [menuItems, setMenuItems] = useState([]);
    const [jsonInput, setJsonInput] = useState('');

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const { data, error } = await supabase
                .from('menus')
                .select('*')
                .order('title');

            if (error) throw error;
            setMenus(data || []);

            if (data && data.length > 0 && !selectedMenu) {
                selectMenu(data[0]);
            }
        } catch (error) {
            toast.error(`Failed to load menus: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const selectMenu = (menu) => {
        setSelectedMenu(menu);
        setMenuItems(menu.items || []);
        setJsonInput(JSON.stringify(menu.items, null, 4));
    };

    // Update menu items from Visual Editor
    const updateItem = (index, parentIndex, newItem) => {
        let updatedItems = [...menuItems];

        if (parentIndex !== null) {
            // Update child item
            const parent = { ...updatedItems[parentIndex] };
            const children = [...(parent.children || [])];
            children[index] = newItem;
            parent.children = children;
            updatedItems[parentIndex] = parent;
        } else {
            // Update root item
            updatedItems[index] = newItem;
        }

        setMenuItems(updatedItems);
        setJsonInput(JSON.stringify(updatedItems, null, 4));
    };

    const deleteItem = (index, parentIndex) => {
        if (!window.confirm('Delete this item?')) return;

        let updatedItems = [...menuItems];

        if (parentIndex !== null) {
            // Delete child
            const parent = { ...updatedItems[parentIndex] };
            const children = parent.children.filter((_, i) => i !== index);
            parent.children = children;
            updatedItems[parentIndex] = parent;
        } else {
            // Delete root
            updatedItems = updatedItems.filter((_, i) => i !== index);
        }

        setMenuItems(updatedItems);
        setJsonInput(JSON.stringify(updatedItems, null, 4));
    };

    const moveItem = (index, parentIndex, direction) => {
        let itemsInfo = [...menuItems];
        let targetList = parentIndex !== null ? itemsInfo[parentIndex].children : itemsInfo;

        // Check bounds
        if (index + direction < 0 || index + direction >= targetList.length) return;

        // Swap
        const temp = targetList[index];
        targetList[index] = targetList[index + direction];
        targetList[index + direction] = temp;

        if (parentIndex !== null) {
            itemsInfo[parentIndex].children = [...targetList];
        } else {
            itemsInfo = [...targetList];
        }

        setMenuItems(itemsInfo);
        setJsonInput(JSON.stringify(itemsInfo, null, 4));
    };

    const addItem = () => {
        const newItem = { label: 'New Menu Item', link: '/' };
        const updatedItems = [...menuItems, newItem];
        setMenuItems(updatedItems);
        setJsonInput(JSON.stringify(updatedItems, null, 4));
    };

    const handleSave = async () => {
        try {
            // Use jsonInput if in JSON mode, otherwise use menuItems
            const finalItems = viewMode === 'json' ? JSON.parse(jsonInput) : menuItems;

            const { error } = await supabase
                .from('menus')
                .update({ items: finalItems })
                .eq('id', selectedMenu.id);

            if (error) throw error;

            toast.success('Menu updated successfully');
            fetchMenus();
        } catch (error) {
            toast.error('Invalid JSON or update failed');
        }
    };

    const handleInit = async () => {
        try {
            const { count } = await supabase.from('menus').select('*', { count: 'exact', head: true });

            if (count > 0) {
                toast.success('Menus already initialized');
                return;
            }

            const defaultMenus = [
                {
                    title: 'Main Navigation',
                    location: 'header',
                    items: [
                        { label: "Home", link: "/" },
                        {
                            label: "Destinations", link: "/destinations", children: [
                                { label: "Mauritius", link: "/mauritius" },
                                { label: "Rodrigues", link: "/rodrigues" }
                            ]
                        },
                        { label: "Packages", link: "/packages" },
                        { label: "Contact", link: "/contact" }
                    ]
                }
            ];

            const { error } = await supabase.from('menus').insert(defaultMenus);
            if (error) throw error;

            toast.success('Default menus initialized');
            fetchMenus();
        } catch (error) {
            toast.error('Error initializing menus');
        }
    };

    if (loading) return <div className="p-8 text-white flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Menu Management</h1>
                    <p className="text-white/60">Configure website navigation menus and sub-menus.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setViewMode(viewMode === 'visual' ? 'json' : 'visual')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors border border-white/5"
                    >
                        {viewMode === 'visual' ? <Code size={18} /> : <LayoutList size={18} />}
                        {viewMode === 'visual' ? 'Raw JSON' : 'Visual Editor'}
                    </button>
                    <button
                        onClick={handleInit}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
                    >
                        Initialize Defaults
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar List */}
                <div className="col-span-3 space-y-2">
                    {menus.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => selectMenu(menu)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${selectedMenu?.id === menu.id
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                }`}
                        >
                            <div className="font-bold">{menu.title}</div>
                            <div className="text-xs opacity-60 uppercase tracking-wider mt-1">{menu.location}</div>
                        </button>
                    ))}

                    {menus.length === 0 && (
                        <div className="text-white/40 text-center p-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                            No menus found. Click Initialize.
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="col-span-9">
                    {selectedMenu ? (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-white/40">Editing:</span> {selectedMenu.title}
                                </h2>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition-all font-bold shadow-lg shadow-green-500/20"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>

                            <div className={`bg-[#1e1e1e]/50 rounded-2xl border border-white/10 ${viewMode === 'visual' ? 'p-4' : 'p-0'}`}>
                                {viewMode === 'visual' ? (
                                    <div className="space-y-4">
                                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {menuItems.map((item, index) => (
                                                <MenuItemEditor
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    updateItem={updateItem}
                                                    deleteItem={deleteItem}
                                                    moveItem={moveItem}
                                                />
                                            ))}
                                            {menuItems.length === 0 && (
                                                <div className="text-center py-10 text-white/30 italic">No menu items. Add one below.</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={addItem}
                                            className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                                        >
                                            <Plus size={18} /> Add Top-Level Item
                                        </button>
                                    </div>
                                ) : (
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className="w-full h-[600px] bg-[#1e1e1e] text-green-400 font-mono text-sm focus:outline-none resize-none p-4 rounded-2xl"
                                        spellCheck="false"
                                    />
                                )}
                            </div>

                            <p className="text-white/40 text-xs mt-3 flex items-center gap-2">
                                <Code size={12} />
                                {viewMode === 'visual'
                                    ? "Visual Editor: Drag/Drop coming soon. Use arrows to reorder. Use + to add submenus."
                                    : "Advanced Mode: Edit the JSON structure directly. Ensure valid JSON format."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 bg-white/5 rounded-3xl border border-white/5 border-dashed min-h-[400px]">
                            <LayoutList size={48} className="mb-4 opacity-50" />
                            <p>Select a menu from the sidebar to edit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuManager;
