import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            boxShadow: {
                redGlow: '0 0 10px 5px #ff0000',
                greenGlow: '0 0 10px 5px #00ff00',
            },

            perspective: {
                '1000': '1000px',
            },

            transitionProperty: {
                'z-index': 'z-index',
            },
        },
    },

    plugins: [
        forms,
        function ({ addUtilities }) {
            addUtilities({
                '.perspective-1000': {
                    'perspective': '1000px',
                },
                '.transform-style-preserve-3d': {
                    'transform-style': 'preserve-3d',
                },
                '.transform-origin-center': {
                    'transform-origin': 'center center',
                },
                '.backface-hidden': {
                    'backface-visibility': 'hidden',
                },
                '.transition-transform-zindex': {
                    'transition': 'transform 0.5s ease, z-index 0.5s ease',
                },
            });
        },
    ],
};
