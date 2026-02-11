/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#ff4d4d',
                    DEFAULT: '#e60000', // Premium Red
                    dark: '#b30000',
                },
            },
        },
    },
    plugins: [],
}
