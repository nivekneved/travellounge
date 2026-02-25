import React, { useState, useMemo } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    Users, User, Briefcase, Mail, Linkedin,
    Edit2, Trash2, Plus, Save, Phone, MapPin,
    LayoutGrid, List as ListIcon, Search
} from 'lucide-react';

const TeamManager = () => {
    const [view, setView] = useState('grid');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState = {
        name: '',
        role: '',
        photo_url: '',
        bio: '',
        email: '',
        is_active: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: team,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('team_members', {
        orderColumn: 'name',
        ascending: true,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('grid');
    };

    const handleEdit = (member) => {
        setFormData(member);
        setEditingId(member.id);
        setView('edit');
    };

    const filteredTeam = useMemo(() => {
        return team.filter(m => {
            const searchStr = searchTerm.toLowerCase();
            return (
                m.name?.toLowerCase().includes(searchStr) ||
                m.role?.toLowerCase().includes(searchStr) ||
                m.bio?.toLowerCase().includes(searchStr)
            );
        });
    }, [team, searchTerm]);

    const stats = [
        { label: 'Total Personnel', value: team.length, icon: Users, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Active Specialists', value: team.filter(m => m.is_active).length, icon: User, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Departments', value: [...new Set(team.map(m => m.role))].length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Specialist Identity' },
        { header: 'Official Position' },
        { header: 'Contact & Communication' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Our Talent"
            subtitle="Personnel Command & Specialization Hub"
            icon={Users}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search specialists..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Onboard Personnel"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={() => save(editingId, formData)}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredTeam}
            renderRow={(member) => (
                <tr key={member.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100 shadow-sm">
                                {member.photo_url ? <img src={member.photo_url} className="w-full h-full object-cover" /> : <User size={20} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{member.name}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Specialist ID: {member.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{member.role}</span>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">
                            <Mail size={12} />
                            <span>{member.email || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${member.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(member)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Specialist Profile"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('Remove this specialist?')) deleteMutation.mutate(member.id); }} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Specialist Identity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Professional Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900" placeholder="Ahmad Khan" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Designated Role</label>
                                <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="Managing Director" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Photo URL</label>
                                <input type="url" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Bio & Communication</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mission / Biography</label>
                            <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium text-sm resize-none leading-relaxed" placeholder="Tell us about the specialist..." />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="name@travellounge.mu" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                                <select value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm uppercase">
                                    <option value="true">Active Personnel</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[500px]">
                    <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-50 text-center flex flex-col items-center group transition-all">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-red-600 mb-6 overflow-hidden border border-slate-100 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-700">
                            {formData.photo_url ? <img src={formData.photo_url} alt="" className="w-full h-full object-cover" /> : <User size={48} />}
                        </div>
                        <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight mb-1">{formData.name || 'Specialist Name'}</h4>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">{formData.role || 'Designated Role'}</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-8 line-clamp-3 italic">"{formData.bio || 'The specialist mission statement and professional background will appear here for customer engagement.'}"</p>
                    </div>
                </div>
            )}
        />
    );
};

export default TeamManager;
