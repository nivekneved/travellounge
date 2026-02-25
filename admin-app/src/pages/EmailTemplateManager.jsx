import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Mail, Code, Variable, Search, ArrowUpDown, Calendar, ChevronRight, X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

const EmailTemplateManager = () => {
 const [templates, setTemplates] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingTemplate, setEditingTemplate] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
 const [formData, setFormData] = useState({
 name: '',
 subject: '',
 body: '',
 variables: []
 });

 useEffect(() => {
 fetchTemplates();
 }, []);

 const fetchTemplates = async () => {
 try {
 const { data, error } = await supabase
 .from('email_templates')
 .select('*')
 .order('updated_at', { ascending: false });
 if (error) throw error;
 setTemplates(data || []);
 } catch (error) {
 toast.error('Failed to load templates');
 } finally {
 setLoading(false);
 }
 };

 const filteredAndSortedTemplates = templates.filter(template => {
 const searchStr = searchTerm.toLowerCase();
 return (
 template.name?.toLowerCase().includes(searchStr) ||
 template.subject?.toLowerCase().includes(searchStr) ||
 template.id?.toLowerCase().includes(searchStr)
 );
 }).sort((a, b) => {
 const key = sortConfig.key;
 let valA = a[key] ?? '';
 let valB = b[key] ?? '';

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
 });

 const handleSave = async (e) => {
 e.preventDefault();
 try {
 if (editingTemplate) {
 const { error } = await supabase
 .from('email_templates')
 .update(formData)
 .eq('id', editingTemplate.id);
 if (error) throw error;
 toast.success('Template updated');
 } else {
 const { error } = await supabase
 .from('email_templates')
 .insert([formData]);
 if (error) throw error;
 toast.success('Template created');
 }
 setIsModalOpen(false);
 fetchTemplates();
 } catch (error) {
 toast.error('Failed to save template');
 }
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Delete this template?')) return;
 try {
 const { error } = await supabase
 .from('email_templates')
 .delete()
 .eq('id', id);
 if (error) throw error;
 toast.success('Template deleted');
 fetchTemplates();
 } catch (error) {
 toast.error('Failed to delete');
 }
 };

 const openModal = (template = null) => {
 if (template) {
 setEditingTemplate(template);
 setFormData({
 name: template.name,
 subject: template.subject,
 body: template.body,
 variables: template.variables || []
 });
 } else {
 setEditingTemplate(null);
 setFormData({
 name: '',
 subject: '',
 body: '',
 variables: []
 });
 }
 setIsModalOpen(true);
 };

 return (
 <div className="p-8">
 {!isModalOpen && (
 <>
 <div className="flex justify-between items-center mb-8">
 <div>
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
 <p className="text-gray-500">Manage automated email content sent to customers.</p>
 </div>
 <button
 onClick={() => openModal()}
 className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-600/30"
 >
 <Plus size={20} /> New Template
 </button>
 </div>

 {/* DataTable Search */}
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 max-w-2xl">
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
 <input
 type="text"
 placeholder="Search templates by name, subject or ID..."
 className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-20 animate-pulse text-gray-400 font-medium ">Loading Templates...</div>
 ) : (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[60px]" />
 <col className="w-[200px]" />
 <col className="w-[300px]" />
 <col className="w-[150px]" />
 <col className="w-[150px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 bg-gray-50/50 align-middle">
 <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Type</th>
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Template Name
 <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'subject', direction: sortConfig.key === 'subject' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Email Subject
 <ArrowUpDown size={12} className={sortConfig.key === 'subject' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Modified</th>
 <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredAndSortedTemplates.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-20 text-center text-gray-400 font-bold">No templates found matching your criteria.</td>
 </tr>
 ) : (
 filteredAndSortedTemplates.map((template) => (
 <tr key={template.id} className="transition-all even:bg-gray-50/20 hover:bg-gray-50 align-top group">
 <td className="py-6 px-6">
 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
 <Mail size={18} />
 </div>
 </td>
 <td className="py-6 px-4">
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-gray-900 truncate ">{template.name}</span>
 <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter mt-1">{template.id}</span>
 </div>
 </td>
 <td className="py-6 px-4">
 <div className="text-sm text-gray-600 line-clamp-2 font-medium">
 {template.subject}
 </div>
 </td>
 <td className="py-6 px-4">
 <div className="flex items-center gap-2 text-xs text-gray-400 font-bold ">
 <Calendar size={12} />
 {template.updated_at ? new Date(template.updated_at).toLocaleDateString('en-GB') : 'N/A'}
 </div>
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 onClick={() => openModal(template)}
 className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-bold text-xs"
 >
 <Edit2 size={14} /> Edit
 </button>
 <button
 onClick={() => handleDelete(template.id)}
 className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-bold text-xs"
 >
 <Trash2 size={14} /> Delete
 </button>
 <ChevronRight size={14} className="text-gray-300 ml-1" />
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 )}
 </>
 )}

 {isModalOpen && (
 <div className="space-y-8 animate-fade-in">
 <div className="max-w-6xl mx-auto w-full">
 <div className="px-8 pt-4 pb-16">
 <div className="flex items-center justify-between mb-16 px-4">
 <div className="flex items-center gap-6">
 <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
 <Mail size={32} />
 </div>
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
 {editingTemplate ? 'Modify Template' : 'Create Template'}
 </h2>
 <p className="text-lg text-slate-400 font-medium mt-1">Configure automated email parameters and content</p>
 </div>
 </div>
 <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>
 <div className="px-4">
 <form onSubmit={handleSave} className="space-y-6">
 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Template Name</label>
 <input
 type="text" required
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
 placeholder="e.g. Booking Confirmation"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Subject</label>
 <input
 type="text" required
 value={formData.subject}
 onChange={e => setFormData({ ...formData, subject: e.target.value })}
 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
 placeholder="Your booking is confirmed!"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HTML Content</label>
 <textarea
 required
 rows="10"
 value={formData.body}
 onChange={e => setFormData({ ...formData, body: e.target.value })}
 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-sm"
 placeholder="<html><body><h1>Hello {{name}}</h1>...</body></html>"
 />
 <p className="mt-2 text-xs text-gray-400">Use {'{{variable}}'} for dynamic content.</p>
 </div>
 <div className="flex gap-4 pt-4">
 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
 <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all">Save Template</button>
 </div>
 </form>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default EmailTemplateManager;
