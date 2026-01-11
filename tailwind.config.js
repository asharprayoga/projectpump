/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // RE Brand Colors matching TankCalc
                re: {
                    blue: '#1e5aa0',
                    'blue-dark': '#164578',
                    'blue-light': '#e8f0f8',
                    green: '#2d9d4f',
                    'green-light': '#e6f5eb',
                    yellow: '#f0a500',
                    'yellow-light': '#fef7e5',
                    orange: '#e85d04',
                    'orange-light': '#fef0e7',
                    gray: '#6b7280',
                    'gray-light': '#f3f4f6',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
