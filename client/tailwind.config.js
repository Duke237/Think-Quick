/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A1628',
        'bg-secondary': '#0D1B2E',
        'bg-tertiary': '#1A2942',
        'cyan-primary': '#00E5FF',
        'cyan-glow': '#00D9FF',
        'cyan-light': '#5FF5FF',
        'cyan-dark': '#00B8D4',
        'orange-primary': '#FF9F1C',
        'orange-glow': '#FFB347',
        'yellow-accent': '#F5B942',
        'amber': '#FFC107',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E0F7FF',
        'text-muted': '#8BA9C4',
      },
      backgroundImage: {
        'gradient-orb': 'radial-gradient(circle, #00E5FF 0%, #0A1628 70%)',
        'gradient-cyan': 'linear-gradient(135deg, #00E5FF, #00B8D4)',
        'gradient-warm': 'linear-gradient(135deg, #FF9F1C, #F5B942)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'glow-orange': '0 0 20px rgba(255, 159, 28, 0.5)',
        'deep': '0 10px 40px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        }
      }
    },
  },
  plugins: [],
}