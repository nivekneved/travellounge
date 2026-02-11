const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Hero.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The issue is at lines 48-52:
// Line 48:             </div>
// Line 49:             );     ← WRONG - this is closing nothing
// Line 50: };
// Line 51: 
// Line 52:             export default Hero;

// Expected structure:
// Line 48:         </div>  ← close line 16
// Line 49:     );           ← close return statement
// Line 50: };               ← close component function  
// Line 51:
// Line 52: export default Hero;

content = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from './Button';

const Hero = () => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) navigate(\`/search?q=\${query}\`);
    };

    return (
        <div className="relative h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 z-10" />

            {/* Background Image Placeholder */}
            <div
                className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=1920&auto=format&fit=crop')" }}
            />

            <div className="container relative z-20 text-center text-white px-4">
                <h1 className="text-5xl md:text-8xl font-extrabold mb-6 tracking-tighter drop-shadow-2xl leading-none">
                    Paradise <span className="text-primary">Awaits</span>
                </h1>
                <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/90 font-medium drop-shadow-md leading-relaxed">
                    Experience Mauritius like never before. From boutique stays to exclusive island excursions, we craft your perfect getaway.
                </p>
                {/* Hero Stats */}
                <div className="absolute bottom-12 left-0 right-0 z-20">
                    <div className="container flex justify-center gap-6 md:gap-12 text-white/90">
                        {[
                            { label: 'Hotels', value: '500+' },
                            { label: 'Secure', value: '100%' },
                            { label: 'Support', value: '24/7' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-card px-6 py-4 rounded-2xl text-center min-w-[100px] md:min-w-[140px] hover:scale-105 transition-transform cursor-default premium-shadow">
                                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                                <div className="text-[10px] md:text-xs uppercase tracking-widest text-primary font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
`;

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ Hero.jsx completely rewritten with correct structure');
