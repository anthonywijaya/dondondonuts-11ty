module.exports = {
  content: ["./src/**/*.{html,njk}"],
  theme: {
    colors: {
      'dondonblue': '#1E367B',
      'dondonwhite': '#FFFAF2',
      'dondonorange': '#F37D07',
    },
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
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
      },
    },
  },
  plugins: [
    
  ],
};
