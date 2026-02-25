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
 MoreVertical,
 Search,
 TrendingUp,
 UserCheck,
 Building2,
 SearchX,
 ArrowUpDown,
 Save,
 Calendar,
 Image as ImageIcon
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ViewToggle from '../components/ViewToggle';
import { SortableItem, SortableHandle } from '../components/SortableItem';

const TeamManager = () => {
 const queryClient = useQueryClient();
 const [view, setView] = useState('list'); // 'grid' or 'list'
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [selectedIds, setSelectedIds] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

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

 const sensors = useSensors(
 useSensor(PointerSensor),
 useSensor(KeyboardSensor, {
 coordinateGetter: sortableKeyboardCoordinates,
 })
 );

 // Mutations
 const createMutation = useMutation({
 mutationFn: async (newMember) => {
 const { data: lastMember } = await supabase.from('team_members').select('display_order').order('display_order', { ascending: false }).limit(1).single();
 const nextOrder = (lastMember?.display_order || 0) + 1;
 const { data, error } = await supabase.from('team_members').insert([{ ...newMember, display_order: nextOrder }]).select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['team']);
 toast.success('Personnel added to directory');
 setIsModalOpen(false);
 resetForm();
 },
 onError: (err) => toast.error(err.message)
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }) => {
 const { error } = await supabase.from('team_members').update(updates).eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['team']);
 toast.success('Profile updated successfully');
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
 toast.success('Directory records removed');
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
 onSuccess: () => queryClient.invalidateQueries(['team'])
 });

 const handleDragEnd = (event) => {
 const { active, over } = event;
 if (active && over && active.id !== over.id) {
 const oldIndex = teamMembers.findIndex((item) => item.id === active.id);
 const newIndex = teamMembers.findIndex((item) => item.id === over.id);
 const newItems = arrayMove(teamMembers, oldIndex, newIndex);
 reorderMutation.mutate(newItems);
 }
 };

 const handleSelect = (id) => {
 setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
 };

 const handleSelectAll = () => {
 if (selectedIds.length === teamMembers.length) setSelectedIds([]);
 else setSelectedIds(teamMembers.map(m => m.id));
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

 const filteredAndSortedTeam = teamMembers.filter(m =>
 m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (m.role && m.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
 (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
 ).sort((a, b) => {
 const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
 const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
 return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
 });

 if (isLoading) {
 return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Personnel Directory...</div>;
 }

 return (
 <div className="space-y-8">
 {/* Header & Controls */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Personnel Hub</h1>
 <p className="text-gray-500 font-medium">Manage corporate profiles, departmental roles, and organizational structure</p>
 </div>

 <div className="flex items-center gap-4">
 <button
 onClick={() => { resetForm(); setIsModalOpen(true); }}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group"
 >
 <Plus size={22} className="group-hover:rotate-90 transition-transform" />
 <span>Recruit Member</span>
 </button>
 </div>
 </div>

 {!isModalOpen && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Total Staff</p>
 <h3 className="text-3xl font-black text-gray-900" >{teamMembers.length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
 <UserCheck size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Active Talent</p>
 <h3 className="text-3xl font-black text-gray-900" >{teamMembers.filter(m => m.status === 'active').length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
 <Building2 size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Departments</p>
 <h3 className="text-3xl font-black text-gray-900" >{[...new Set(teamMembers.map(m => m.role))].filter(Boolean).length}</h3>
 </div>
 </div>
 </div>
 )}

 {!isModalOpen && (
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
 <input
 type="text"
 placeholder="Search directory by name, role or email..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-3">
 <ViewToggle view={view} onViewChange={setView} />
 {selectedIds.length > 0 && (
 <button
 onClick={() => { if (window.confirm(`Expunge ${selectedIds.length} records?`)) deleteMutation.mutate(selectedIds); }}
 className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all active:scale-95"
 >
 <Trash2 size={16} /> Bulk Del ({selectedIds.length})
 </button>
 )}
 <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
 <span className="text-xs font-black uppercase tracking-widest" >Staff Ledger</span>
 </div>
 </div>
 </div>
 )}

 {!isModalOpen && (
 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
 <SortableContext items={teamMembers.map(m => m.id)} strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
 {filteredAndSortedTeam.length === 0 ? (
 <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 flex flex-col items-center justify-center text-center group transition-all hover:border-red-200 shadow-sm">
 <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-500 group-hover:bg-red-50" >
 <SearchX size={48} />
 </div>
 <h3 className="text-2xl font-black text-gray-900 mb-2" >No Personnel Matches</h3>
 <p className="text-gray-500 font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px]" >We couldn't find any team members matching your current search parameters.</p>
 <button onClick={() => setSearchTerm('')} className="mt-8 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all" >Reset Directory</button>
 </div>
 ) : (view === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
 {filteredAndSortedTeam.map((member) => (
 <SortableItem key={member.id} id={member.id} className="h-full">
 {(attributes, listeners) => (
 <div className={`bg-white p-6 rounded-[2rem] border transition-all h-full flex flex-col items-center group relative
 ${selectedIds.includes(member.id) ? 'border-red-500 shadow-xl ring-1 ring-red-500' : 'border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100'}`}
 >
 <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
 <SortableHandle attributes={attributes} listeners={listeners} />
 </div>
 <button onClick={() => handleSelect(member.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors">
 {selectedIds.includes(member.id) ? <CheckSquare size={20} className="text-red-600" /> : <Square size={20} />}
 </button>

 <div className="w-28 h-28 rounded-full bg-gray-50 mb-6 overflow-hidden border-4 border-white shadow-premium mt-2 group-hover:scale-110 transition-transform duration-500 relative">
 <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors" />
 {member.photo_url ? (
 <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={32} /></div>
 )}
 </div>
 <h3 className="text-lg font-black text-gray-900 tracking-tight text-center" >{member.name}</h3>
 <p className="text-red-600 font-black uppercase tracking-widest text-[9px] mb-4 text-center" >{member.role || 'Unassigned Position'}</p>

 <div className="flex gap-2 mb-6">
 {member.email && <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Mail size={12} /></div>}
 {member.linkedin_url && <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Linkedin size={12} /></div>}
 </div>

 <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-50 pt-4 w-full">
 <div className="flex gap-1.5">
 <button
 onClick={() => handleEdit(member)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 </div>
 <button
 onClick={() => { if (window.confirm('Expunge record?')) deleteMutation.mutate([member.id]); }}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 )}
 </SortableItem>
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[80px]" />
 <col className="w-[60px]" />
 <col className="w-[300px]" />
 <col className="w-[200px]" />
 <col className="w-[150px]" />
 <col className="w-[200px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Stack</th>
 <th className="py-5 px-6 text-center">
 <button onClick={handleSelectAll} className="text-gray-300 hover:text-red-600 transition-colors" >
 {selectedIds.length > 0 && selectedIds.length === teamMembers.length ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} />}
 </button>
 </th>
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2" >
 Personnel
 <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'role', direction: sortConfig.key === 'role' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2" >
 Profession
 <ArrowUpDown size={12} className={sortConfig.key === 'role' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Connect</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right" >Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredAndSortedTeam.map((member) => (
 <SortableItem key={member.id} id={member.id} as="tr" className={`hover:bg-gray-50 transition-colors group align-top ${selectedIds.includes(member.id) ? 'bg-red-50/50' : ''}`}>
 {(attributes, listeners) => (
 <>
 <td className="py-6 px-6"><div className="flex justify-center"><SortableHandle attributes={attributes} listeners={listeners} /></div></td>
 <td className="py-6 px-6 text-center text-gray-400">
 <button onClick={() => handleSelect(member.id)} className="hover:text-red-600 transition-colors">
 {selectedIds.includes(member.id) ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} />}
 </button>
 </td>
 <td className="py-6 px-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-gray-50 overflow-hidden border border-gray-100 shrink-0 shadow-sm transition-transform group-hover:scale-110" >
 {member.photo_url ? <img src={member.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 font-black ">{member.name.charAt(0)}</div>}
 </div>
 <div className="flex flex-col min-w-0" >
 <span className="font-black text-gray-900 truncate text-sm " >{member.name}</span>
 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate" >Code: TL-{member.id.substring(0, 4)}</span>
 </div>
 </div>
 </td>
 <td className="py-6 px-6">
 <span className="text-xs font-black text-red-600 uppercase tracking-widest truncate" >{member.role || 'Unassigned'}</span>
 </td>
 <td className="py-6 px-6 text-center">
 <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
 {member.email && <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-red-600 transition-colors" title={member.email}><Mail size={14} /></a>}
 {member.linkedin_url && <a href={member.linkedin_url} target="_blank" className="text-gray-400 hover:text-[#0077b5] transition-colors" rel="noreferrer" ><Linkedin size={14} /></a>}
 </div>
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
 <button
 onClick={() => handleEdit(member)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => { if (window.confirm('Del record?')) deleteMutation.mutate([member.id]); }}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </>
 )}
 </SortableItem>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 ))}
 </SortableContext>
 </DndContext>
 )}

 {isModalOpen && (
 <div className="space-y-8 animate-fade-in">
 <div className="max-w-6xl mx-auto w-full">
 <div className="px-8 pt-4 pb-16">
 <div className="flex items-center justify-between mb-16">
 <div className="flex items-center gap-6">
 <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
 <Users size={32} />
 </div>
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
 {editingId ? 'Edit Profile' : 'New Enrollment'}
 </h2>
 <p className="text-lg text-slate-400 font-medium mt-1">Configure user role and organizational status</p>
 </div>
 </div>
 <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>

 <form onSubmit={(e) => { e.preventDefault(); if (editingId) updateMutation.mutate({ id: editingId, updates: formData }); else createMutation.mutate(formData); }} className="p-8 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Name *</label>
 <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
 </div>
 <div>
 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Professional Role</label>
 <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
 </div>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon size={12} className="text-red-600" /> Photo URL</label>
 <input type="url" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.photo_url} onChange={e => setFormData({ ...formData, photo_url: e.target.value })} placeholder="https://..." />
 </div>
 <div>
 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Mail size={12} className="text-red-600" /> Corporate Email</label>
 <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="staff@travellounge.mu" />
 </div>
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Linkedin size={12} className="text-red-600" /> LinkedIn Profile</label>
 <input type="url" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
 </div>

 <div className="flex gap-4 pt-6 border-t border-gray-100">
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all" >Cancel</button>
 <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 active:scale-95 transition-all" >
 <Save size={16} /> {editingId ? 'Commit Updates' : 'Launch Profile'}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default TeamManager;
