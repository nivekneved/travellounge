import React, { useState } from 'react';
import {
    Plus, Search, SearchX, ArrowUpDown, Monitor, Smartphone,
    ArrowRight, Info, Save
} from 'lucide-react';

/**
 * A standardized layout for all Admin Managers following the "Visual Proof" pattern.
 */
const ManagerLayout = ({
    title,
    subtitle,
    icon: Icon,
    stats = [],
    searchTerm,
    setSearchTerm,
    searchPlaceholder = "SEARCH REGISTRY...",
    onAdd,
    addLabel = "Create New",
    view,
    setView,
    editingId,
    onSubmit,
    isSaving,
    isLoading,
    columns = [],
    data = [],
    renderRow,
    renderForm,
    renderPreview,
    previewTitle = "Visual Proof",
    previewDescription = "Real-time simulation of the experience as it will appear in the ecosystem.",
    mediaPicker
}) => {
    const [previewMode, setPreviewMode] = useState('desktop');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 animate-pulse text-slate-500 font-black uppercase tracking-widest text-[10px]">
                Synchronizing with Central Registry...
            </div>
        );
    }

    if (view === 'edit') {
        return (
            <div className="min-h-screen bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Editor Header */}
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-gray-100 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950 text-white rounded-2xl">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {editingId ? `Update ${title}` : `Define ${title}`}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('list')}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Abandon
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            <Save size={16} />
                            {editingId ? 'Push Update' : 'Deploy Record'}
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pb-20">
                    <div className={renderPreview ? "grid grid-cols-1 lg:grid-cols-2 gap-16" : "max-w-4xl mx-auto"}>
                        {/* Form Section */}
                        <div className="space-y-12">
                            {renderForm()}
                        </div>

                        {/* Preview Section */}
                        {renderPreview && (
                            <div className="lg:sticky lg:top-12 h-fit space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{previewTitle}</h3>
                                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                                        <button
                                            onClick={() => setPreviewMode('desktop')}
                                            className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-premium border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <Monitor size={18} />
                                        </button>
                                        <button
                                            onClick={() => setPreviewMode('mobile')}
                                            className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-premium border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <Smartphone size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className={`relative mx-auto bg-slate-50 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 border-8 border-slate-950 flex items-center justify-center p-12
                                    ${previewMode === 'desktop' ? 'w-full aspect-[4/3] rounded-[48px]' : 'w-[320px] h-[640px] rounded-[64px]'}`}
                                >
                                    {renderPreview()}
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-premium shrink-0">
                                        <Info size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Architectural Validation</h4>
                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">
                                            {previewDescription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {mediaPicker}
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[40px] shadow-premium-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000"></div>
                <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100">
                            <Icon size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tight">{title}</h1>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">{subtitle}</p>
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 group relative z-10"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>{addLabel}</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            {stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-premium-sm group hover:border-slate-300 transition-all duration-500">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-transparent group-hover:border-slate-100`}>
                                    <stat.icon size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-950">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Control Strip */}
            <div className="bg-white p-4 border border-slate-100 rounded-3xl shadow-premium-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-2xl w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black" size={20} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-[20px] focus:ring-4 focus:ring-slate-900/10 focus:bg-white focus:border-slate-900 outline-none transition-all font-black text-xs placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-premium-xl overflow-hidden mb-20 relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-32 text-center bg-slate-50/20">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-slate-200 shadow-premium-sm border border-slate-100">
                                                <SearchX size={48} strokeWidth={1} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-black text-xl uppercase tracking-tight">Zero Registry Hits</p>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Adjust query parameters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => renderRow(item))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {mediaPicker}
        </div>
    );
};

export default ManagerLayout;
