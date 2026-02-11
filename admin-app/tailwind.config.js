/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#ffe5e5',
                    100: '#ffcccc',
                    200: '#ff9999',
                    300: '#ff6666',
                    400: '#ff3333',
                    500: '#e60000', // Main brand red
                    600: '#cc0000',
                    700: '#b30000',
                    800: '#990000',
                    900: '#800000',
                    DEFAULT: '#e60000',
                },
                gray: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 20px 60px -15px rgba(230, 0, 0, 0.15), 0 10px 25px -10px rgba(0, 0, 0, 0.1)',
                'premium-lg': '0 30px 80px -20px rgba(230, 0, 0, 0.25), 0 15px 35px -15px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 30px rgba(230, 0, 0, 0.3)',
                'inner-premium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.8s ease-out forwards',
                'scale-in': 'scaleIn 0.6s ease-out forwards',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
        },
    },
    plugins: [],
}
