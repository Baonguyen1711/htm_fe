/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '4rem': '4rem',
      },
      // Thêm keyframes tùy chỉnh
     keyframes: {
      'wave-slow': {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-50%)' },
      },
      'wave-medium': {
        '0%': { transform: 'translateX(-50%)' },
        '100%': { transform: 'translateX(0)' },
      },
      'wave-fast': {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-33%)' },
      },
      'float-slow': {
        '0%': { transform: 'translateY(100vh) translateX(0)' },
        '100%': { transform: 'translateY(-100px) translateX(20px)' },
      },
      'float-medium': {
        '0%': { transform: 'translateY(100vh) translateX(0)' },
        '100%': { transform: 'translateY(-100px) translateX(-30px)' },
      },
      'float-fast': {
        '0%': { transform: 'translateY(100vh) translateX(0)' },
        '100%': { transform: 'translateY(-100px) translateX(50px)' },
      },
    },
    animation: {
      'wave-slow': 'wave-slow 60s linear infinite',
      'wave-medium': 'wave-medium 45s linear infinite',
      'wave-fast': 'wave-fast 30s linear infinite',
      'float-slow': 'float-slow 20s ease-in infinite',
      'float-medium': 'float-medium 25s ease-in infinite',
      'float-fast': 'float-fast 15s ease-in infinite',
    },
    },
  },
  plugins: [],
}