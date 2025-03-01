module.exports = {
  content: ["./src/**/*.{html,njk}"],
  theme: {
    colors: {
      red: {
        '50': '#fff1f2',
        '100': '#ffe4e6',
        '200': '#fecdd3',
        '300': '#fda4af',
        '400': '#fb7185',
        '500': '#f43f5e',
        '600': '#e11d48',
        '700': '#be123c',
        '800': '#9f1239',
        '900': '#881337'
      },
      green: {
        '50': '#f0fdf4',
        '100': '#dcfce7',
        '200': '#bbf7d0',
        '300': '#86efac',
        '400': '#4ade80',
        '500': '#22c55e',
        '600': '#16a34a',
        '700': '#15803d',
        '800': '#166534',
        '900': '#14532d'
      },
      rose: {
        '50': '#fff1f2',
        '100': '#ffe4e6',
        '200': '#fecdd3',
        '300': '#fda4af',
        '400': '#fb7185',
        '500': '#f43f5e',
        '600': '#e11d48',
        '700': '#be123c',
        '800': '#9f1239',
        '900': '#881337'
      },
      dondonblue: '#1E367B',
      dondonwhite: '#FFFAF2',
      dondonwhiteDark: '#fff0d9',
      dondonorange: '#F37D07',
      dondonorangeLight: '#F5A54C',
      dondonorangeDark: '#D16006',
      // ... add more variations as needed
    },
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.8s ease-out forwards', // Add the new animation
        bounce: 'bounce 2s infinite',
        'bounce-gentle': 'bounce-gentle 3s infinite',
        'text-reveal': 'text-reveal 0.5s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.5 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        fadeIn: { // Add the new keyframes
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'text-reveal': {
          '0%': {
            opacity: '0',
            transform: 'translateY(1em)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      aspectRatio: {
        'w-4': 4,
        'h-3': 3,
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  safelist: [
    'grid-cols-3',
    // other classes you want to preserve
  ],
};
