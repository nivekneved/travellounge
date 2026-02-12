import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Star, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';

const ReviewModerator = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Fetch reviews and optionally join with a services table if you have one
            // allowing for service_id to be nullable or joined
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Review Moderation</h1>
                <p className="text-gray-500">Approve or reject customer feedback for public display.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-gray-400 italic">No reviews found in the system.</p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">Once customers leave reviews for your products, they will appear here for moderation.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{review.customer_name || 'Anonymous'}</div>
                                            <div className={`text-xs capitalize font-bold px-2 py-0.5 rounded-full w-fit mt-1 ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {review.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm italic border-l-2 border-gray-100 pl-3">"{review.comment}"</p>

                                <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-50">
                                    <span>Service ID: {review.service_id ? review.service_id.slice(0, 8) + '...' : 'N/A'}</span>
                                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button
                                    disabled={review.status === 'approved'}
                                    onClick={() => moderateReview(review.id, 'approved')}
                                    className={`flex-grow py-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${review.status === 'approved'
                                        ? 'bg-green-50 text-green-600 opacity-50 cursor-not-allowed'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button
                                    disabled={review.status === 'rejected'}
                                    onClick={() => moderateReview(review.id, 'rejected')}
                                    className={`flex-grow py-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${review.status === 'rejected'
                                        ? 'bg-red-50 text-red-600 opacity-50 cursor-not-allowed'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewModerator;
