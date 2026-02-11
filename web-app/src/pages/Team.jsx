import { Mail, Linkedin, Globe, Award, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import PageHero from '../components/PageHero';
import { supabase } from '../utils/supabase';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import CTASection from '../components/CTASection';
import TrustSection from '../components/TrustSection';

const Team = () => {
    const { data: teamMembers = [], isLoading } = useQuery({
        queryKey: ['team_members'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Elegant Hero Section */}
            <PageHero
                title="Our Visionary Team"
                subtitle="We are a collective of explorers and detail-obsessed planners dedicated to crafting the extraordinary."
                image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920"
                icon={Sparkles}
            />

            {/* Introduction Quote */}
            <div className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="w-full max-w-4xl mx-auto px-6 text-center">
                    <Award className="mx-auto text-primary mb-8" size={48} strokeWidth={1} />
                    <h2 className="text-3xl md:text-5xl font-serif text-gray-900 leading-tight mb-8 italic">
                        "Luxury is in each detail. It's not just where you go, but how you feel when you get there. Our team ensures that feeling is nothing short of magical."
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </div>
            </div>

            {/* Team Grid - Premium Card Design */}
            <div className="bg-gray-50 py-24 px-4 md:px-8">
                <div className="w-full max-w-[1400px] mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-32">
                            <LoadingSpinner />
                        </div>
                    ) : teamMembers.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xl font-light">Our team is currently being assembled.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={member.id}
                                    className="group relative h-[600px] rounded-[2rem] overflow-hidden bg-white shadow-xl cursor-default"
                                    style={{
                                        animation: `fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.1}s both`
                                    }}
                                >
                                    {/* Image with Parallax & Filter Effect */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                                        <img
                                            src={member.photo_url || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&auto=format&fit=crop&q=80"}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&auto=format&fit=crop&q=80" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end z-20 text-white">
                                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                            <div className="mb-4 overflow-hidden">
                                                <h3 className="text-4xl font-black mb-1 transform translate-y-0 transition-transform duration-500">{member.name}</h3>
                                                <p className="text-primary font-bold uppercase tracking-widest text-sm">{member.role}</p>
                                            </div>

                                            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 mb-6">
                                                <p className="text-gray-200 text-lg font-light leading-relaxed border-l-2 border-primary pl-4 my-4">
                                                    {member.bio}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                                {member.email && (
                                                    <a
                                                        href={`mailto:${member.email}`}
                                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-primary flex items-center justify-center backdrop-blur-md transition-all duration-300"
                                                        title="Email"
                                                    >
                                                        <Mail size={18} />
                                                    </a>
                                                )}
                                                {member.linkedin_url && (
                                                    <a
                                                        href={member.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#0077b5] flex items-center justify-center backdrop-blur-md transition-all duration-300"
                                                        title="LinkedIn"
                                                    >
                                                        <Linkedin size={18} />
                                                    </a>
                                                )}
                                                <button className="text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors ml-auto flex items-center gap-2">
                                                    Read Profile <Globe size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <TrustSection />

            <CTASection
                title="Join our team"
                description="We are constantly seeking extraordinary talent to join our world-class team. If you have a passion for luxury and a dedication to perfection, we want to hear from you."
                buttonText="View Career Opportunities"
                variant="dark"
            />
        </div>
    );
};

export default Team;
