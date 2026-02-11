import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Mail, Code, Variable } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';

const EmailTemplateManager = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        variables: [] // e.g. [{key:'name', label:'Customer Name'}]
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
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

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
            console.error('Save error:', error);
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
            console.error('Delete error:', error);
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
                    <p className="text-gray-500">Manage automated email content sent to customers.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-primary/30"
                >
                    <Plus size={20} /> New Template
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Mail size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(template)} className="p-2 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded-lg transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(template.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">Subject: {template.subject}</p>
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                                <Code size={12} />
                                <span className="truncate">{template.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
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
                                <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-red-700 shadow-lg shadow-primary/30 transition-all">Save Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailTemplateManager;
