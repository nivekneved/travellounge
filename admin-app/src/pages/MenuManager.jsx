import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft, ChevronRight, ChevronDown, GripVertical, Code, LayoutList, ArrowUp, ArrowDown, Menu, Settings2, XCircle } from 'lucide-react';
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
 <div className={`transition-all duration-300 ${depth > 0 ? 'ml-10 mt-3 border-l-2 border-red-50 pl-6' : 'mb-4'}`}>
 <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${depth === 0
 ? 'bg-white border-gray-100 hover:border-red-200 shadow-sm'
 : 'bg-gray-50/50 border-gray-50 hover:bg-white hover:border-red-100'}`}>
 {/* Drag Handle (Visual only for now) */}
 <div className="text-gray-300 cursor-grab active:cursor-grabbing">
 <GripVertical size={16} />
 </div>

 {/* Expand/Collapse for items with children */}
 {item.children && item.children.length > 0 ? (
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="text-gray-400 hover:text-red-600 transition-colors"
 >
 {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
 </button>
 ) : (
 <div className="w-4" />
 )}

 {/* Inputs */}
 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-1">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
 <input
 type="text"
 value={item.label}
 onChange={(e) => handleChange('label', e.target.value)}
 placeholder="Label"
 className="w-full bg-transparent border-b-2 border-gray-100 focus:border-red-500 px-1 py-1 text-gray-900 font-bold text-sm focus:outline-none transition-all placeholder:text-gray-300"
 />
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL / Path</label>
 <input
 type="text"
 value={item.link}
 onChange={(e) => handleChange('link', e.target.value)}
 placeholder="/path"
 className="w-full bg-transparent border-b-2 border-gray-100 focus:border-red-500 px-1 py-1 text-blue-600 font-mono text-xs focus:outline-none transition-all placeholder:text-gray-300"
 />
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
 <button
 onClick={() => moveItem(index, parentIndex, -1)}
 className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
 title="Move Up"
 >
 <ArrowUp size={16} />
 </button>
 <button
 onClick={() => moveItem(index, parentIndex, 1)}
 className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
 title="Move Down"
 >
 <ArrowDown size={16} />
 </button>

 {depth === 0 && (
 <button
 onClick={handleAddChild}
 className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all ml-2 active:scale-95 border border-red-100/50"
 title="Add Sub-link"
 >
 <Plus size={16} />
 </button>
 )}

 <button
 onClick={() => deleteItem(index, parentIndex)}
 className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all ml-1 active:scale-95"
 title="Delete"
 >
 <Trash2 size={16} />
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

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center h-64 gap-4">
 <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
 <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading menus...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <h1 className="text-3xl font-display font-bold text-gray-900 ">Menu Management</h1>
 <p className="text-gray-500 mt-1">Configure website navigation menus and sub-menus</p>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => setViewMode(viewMode === 'visual' ? 'json' : 'visual')}
 className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl transition-all border border-gray-100 font-bold text-xs shadow-sm active:scale-95"
 >
 {viewMode === 'visual' ? <Code size={18} className="text-red-500" /> : <LayoutList size={18} className="text-red-500" />}
 {viewMode === 'visual' ? 'RAW JSON' : 'VISUAL EDITOR'}
 </button>
 <button
 onClick={handleInit}
 className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-all font-bold text-xs shadow-lg active:scale-95 border border-gray-800"
 >
 INITIALIZE DEFAULTS
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
 {/* Sidebar List */}
 <div className="md:col-span-4 lg:col-span-3 space-y-6">
 <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
 <Menu size={12} className="text-red-500" />
 Navigation Menus
 </h3>
 <div className="space-y-3">
 {menus.map(menu => (
 <button
 key={menu.id}
 onClick={() => selectMenu(menu)}
 className={`w-full text-left p-4 rounded-xl transition-all group relative overflow-hidden ${selectedMenu?.id === menu.id
 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 -translate-y-0.5'
 : 'bg-white text-gray-600 hover:bg-red-50/50 border border-gray-100 hover:border-red-100'
 }`}
 >
 {selectedMenu?.id === menu.id && (
 <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
 )}
 <div className="font-bold ">{menu.title}</div>
 <div className={`text-[9px] uppercase tracking-widest mt-1.5 font-black flex items-center gap-1.5 ${selectedMenu?.id === menu.id ? 'text-white/60' : 'text-gray-300 group-hover:text-red-400'}`}>
 <Settings2 size={10} />
 {menu.location}
 </div>
 </button>
 ))}

 {menus.length === 0 && (
 <div className="text-gray-400 text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
 <p className="text-xs font-bold ">No menus found</p>
 <p className="text-[9px] mt-1 font-black uppercase tracking-widest text-gray-300">Run initialization</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Editor */}
 <div className="md:col-span-8 lg:col-span-9">
 {selectedMenu ? (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-8">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/50">
 <LayoutList size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900 leading-none">{selectedMenu.title}</h2>
 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Editing Menu Structure</p>
 </div>
 </div>
 <button
 onClick={handleSave}
 className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 active:scale-95 border border-red-700"
 >
 <Save size={18} />
 Save Changes
 </button>
 </div>

 <div className={`${viewMode === 'visual' ? 'bg-gray-50/30 rounded-2xl border border-gray-100 p-8' : 'p-0'}`}>
 {viewMode === 'visual' ? (
 <div className="space-y-6">
 <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
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
 <div className="text-center py-16 text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
 No menu items. Add your first item below.
 </div>
 )}
 </div>
 <button
 onClick={addItem}
 className="w-full py-5 flex items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 transition-all active:scale-[0.99] group mt-4 shadow-sm"
 >
 <Plus size={20} className="group-hover:rotate-90 transition-transform" />
 Add Top-Level Menu Item
 </button>
 </div>
 ) : (
 <div className="relative group rounded-2xl overflow-hidden border border-gray-900 shadow-2xl">
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 z-10"></div>
 <textarea
 value={jsonInput}
 onChange={(e) => setJsonInput(e.target.value)}
 className="w-full h-[60vh] bg-gray-950 text-red-500 font-mono text-xs focus:outline-none resize-none p-8 shadow-inner scrollbar-hide selection:bg-red-500/30 selection:text-white"
 spellCheck="false"
 />
 <div className="absolute bottom-6 right-8 text-[10px] font-black text-red-500/30 uppercase tracking-widest pointer-events-none ">
 Advanced Developer Mode
 </div>
 </div>
 )}
 </div>

 <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-red-500 border border-gray-100">
 <Code size={16} />
 </div>
 <p className="text-gray-500 text-[11px] font-bold leading-relaxed">
 {viewMode === 'visual'
 ? "Visual Editor: Drag and drop would go here. Use arrows for sorting. Click the red + to add submenus to top-level items."
 : "Advanced JSON Mode: Edit the raw structure directly. Be careful: any syntax error will block the save process."
 }
 </p>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed min-h-[600px] shadow-sm animate-pulse">
 <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-8 border border-gray-100">
 <LayoutList size={40} className="text-gray-200" />
 </div>
 <h3 className="text-xl font-bold text-gray-900 mb-2">Editor Dormant</h3>
 <p className="font-bold text-[10px] uppercase tracking-widest text-gray-300">Select a navigation menu to begin refining</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default MenuManager;
