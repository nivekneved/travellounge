import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Set legacy token for PrivateRoute compatibility
            localStorage.setItem('adminToken', data.session.access_token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));

            toast.success('Welcome back, Admin!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-primary p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold italic tracking-tighter">TRAVEL LOUNGE ADMIN</h1>
                    <p className="text-white/70 text-sm mt-1">Secure portal for authorized personnel only</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Administrative Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                    placeholder="admin@travellounge.mu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Master Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="password" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/30"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enter Admin Panel'}
                        {!loading && <ArrowRight size={20} />}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        Session secured by Supabase Auth by Gravity. <br /> Unauthorized access attempts are monitored.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
