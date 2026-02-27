import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Star, CheckCircle, XCircle, User, Trash2, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import ManagerLayout from '../components/ManagerLayout';

const ReviewModerator = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            toast.error(`Error fetching reviews: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const { error } = await supabase.from('reviews').delete().eq('id', id);
            if (error) throw error;
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            toast.error(`Error deleting review: ${error.message}`);
        }
    };

    const moderateReview = async (id, status) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Review ${status}`);
            fetchReviews();
        } catch (error) {
            toast.error(`Error updating review: ${error.message}`);
        }
    };

    const filteredReviews = reviews.filter(r => {
        const searchStr = searchTerm.toLowerCase();
        return (
            r.customer_name?.toLowerCase().includes(searchStr) ||
            r.comment?.toLowerCase().includes(searchStr) ||
            r.status?.toLowerCase().includes(searchStr)
        );
    });

    const stats = [
        { label: 'Pending Audit', value: reviews.filter(r => r.status === 'pending').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Approval Rating', value: '94%', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Social Velocity', value: '+18', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Transmitter Identity' },
        { header: 'Rating Integrity', align: 'center' },
        { header: 'Narrative Segment' },
        { header: 'Protocol Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Moderation Matrix"
            subtitle="Analyze and authenticate global customer feedback signals"
            icon={ShieldCheck}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search reviews by customer or content..."
            view={view}
            setView={setView}
            isLoading={loading}
            columns={columns}
            data={filteredReviews}
            renderRow={(review) => (
                <tr key={review.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <User size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{review.customer_name || 'Anonymous Signal'}</span>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex justify-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} strokeWidth={i < (review.rating || 0) ? 0 : 2} />
                            ))}
                        </div>
                    </td>
                    <td className="py-6 px-8 max-w-xs">
                        <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed" title={review.comment}>"{review.comment}"</p>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                review.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                            {review.status}
                        </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            {review.status !== 'approved' && (
                                <button onClick={() => moderateReview(review.id, 'approved')} className="p-2.5 bg-white text-emerald-600 border border-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Approve"><CheckCircle size={16} /></button>
                            )}
                            {review.status !== 'rejected' && (
                                <button onClick={() => moderateReview(review.id, 'rejected')} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Reject"><XCircle size={16} /></button>
                            )}
                            <button onClick={() => deleteReview(review.id)} className="p-2.5 bg-white text-slate-400 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderGrid={() => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col group relative hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white duration-300">
                                    <User size={20} />
                                </div>
                                <div className="flex gap-2">
                                    {review.status !== 'approved' && (
                                        <button onClick={() => moderateReview(review.id, 'approved')} className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors"><CheckCircle size={18} /></button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button onClick={() => moderateReview(review.id, 'rejected')} className="p-2 text-red-400 hover:text-red-600 transition-colors"><XCircle size={18} /></button>
                                    )}
                                    <button onClick={() => deleteReview(review.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg truncate">{review.customer_name || 'Anonymous'}</h3>
                                <div className="flex gap-0.5 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} strokeWidth={i < (review.rating || 0) ? 0 : 2} />
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6 line-clamp-3">"{review.comment}"</p>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        review.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {review.status}
                                </span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        />
    );
};

export default ReviewModerator;
