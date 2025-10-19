/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        soil: '#6b4f4f',
        crop: '#43a047',
        tree: '#2e7d32',
      },
      keyframes: {
        cloud: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' }
        },
        rain: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateY(20px)', opacity: 0 }
        },
        grow: {
          '0%': { transform: 'scaleY(0.1)' },
          '100%': { transform: 'scaleY(1)' }
        }
      },
      animation: {
        cloud: 'cloud 40s linear infinite',
        rain: 'rain 1s linear infinite',
        grow: 'grow 1.2s ease-out forwards'
      }
    },
  },
  plugins: [],
}
