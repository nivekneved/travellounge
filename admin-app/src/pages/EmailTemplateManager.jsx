import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Edit2, Variable, Code, ChevronRight, Calendar, Search, ArrowUpDown, X, Eye } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import ManagerLayout from '../components/ManagerLayout';

const EmailTemplateManager = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const initialFormState = {
        name: '',
        subject: '',
        body: '',
        variables: []
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
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

    const handleSave = async () => {
        try {
            setIsSaving(true);
            if (editingId) {
                const { error } = await supabase
                    .from('email_templates')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Template updated');
            } else {
                const { error } = await supabase
                    .from('email_templates')
                    .insert([formData]);
                if (error) throw error;
                toast.success('Template created');
            }
            fetchTemplates();
            resetForm();
        } catch (error) {
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
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

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (template) => {
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body,
            variables: template.variables || []
        });
        setEditingId(template.id);
        setView('edit');
    };

    const filteredTemplates = templates.filter(t => {
        const searchStr = searchTerm.toLowerCase();
        return (
            t.name?.toLowerCase().includes(searchStr) ||
            t.subject?.toLowerCase().includes(searchStr)
        );
    });

    const stats = [
        { label: 'Total Templates', value: templates.length, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Dynamic Hooks', value: templates.reduce((acc, t) => acc + (t.variables?.length || 0), 0), icon: Variable, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Last Updated', value: templates.length > 0 ? format(new Date(templates[0].updated_at), 'MMM d') : 'N/A', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    const columns = [
        { header: 'Template Definition' },
        { header: 'Subject Line' },
        { header: 'Variables', align: 'center' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    // Helper to format date for stats
    function format(date, fmt) {
        // Simple mock of date-fns format since it's not imported here and I don't want to add it if not needed
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    }

    return (
        <ManagerLayout
            title="Email Center"
            subtitle="Automated narrative layers & customer touchpoints"
            icon={Mail}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search templates..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Create Template"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={isSaving}
            isLoading={loading}
            columns={columns}
            data={filteredTemplates}
            renderRow={(template) => (
                <tr key={template.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <Code size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{template.name}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Template ID: {template.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <span className="text-slate-600 font-medium text-sm line-clamp-1">{template.subject}</span>
                    </td>
                    <td className="py-6 px-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {template.variables?.length || 0} Dynamic Keys
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-green-50 text-green-700 border-green-100">
                            Active
                        </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(template)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Template"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(template.id)} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Core configuration</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Template Registry Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm uppercase tracking-tight" placeholder="e.g. BOOKING_CONFIRMATION" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Narrative Subject Line</label>
                                <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm" placeholder="Your journey begins soon..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">HTML Architecture</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Template Body Content</label>
                            <textarea rows={12} required value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none font-mono text-xs text-red-400 resize-none leading-relaxed" placeholder="<html><body>...</body></html>" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-4 ml-1">
                                <Variable size={12} className="text-amber-500" /> Use Double Braces for Injections: {"{{name}}"}, {"{{order_id}}"}
                            </p>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Visual Transmission Proof</h3>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                            <Eye size={18} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col min-h-[500px]">
                        {/* Browser-like Header */}
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-4">
                            <div className="flex gap-1.5 focus-within:">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                            </div>
                            <div className="flex-1 px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 truncate">
                                transmission://email-engine.local/{formData.name || 'new-template'}
                            </div>
                        </div>

                        {/* Email Subject Section */}
                        <div className="p-8 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-900 rounded-lg text-white">
                                    <Mail size={14} />
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Dispatch</span>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{formData.subject || 'Empty Subject Line'}</h4>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-white p-8 overflow-auto">
                            {formData.body ? (
                                <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed font-serif"
                                    dangerouslySetInnerHTML={{ __html: formData.body.replace(/{{[^{}]+}}/g, '<span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-mono text-[10px] font-black">VAR</span>') }} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4 opacity-50 italic">
                                    <Code size={48} strokeWidth={0.5} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting HTML Payload</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transmission Status</span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase">● Ready for Dispatch</span>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 font-serif italic text-xs">
                                TL
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex gap-4 text-indigo-600">
                        <Variable size={24} className="shrink-0 mt-1" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Dynamic Mapping</p>
                            <p className="text-[11px] font-medium leading-relaxed opacity-80">Variables injected via the API will be mapped to the double-brace placeholders. Ensure HTML integrity for optimal cross-client rendering.</p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default EmailTemplateManager;
