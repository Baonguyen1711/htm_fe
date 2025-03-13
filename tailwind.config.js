/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Đảm bảo Tailwind quét đúng file
  ],
  theme: {
    extend: {
      borderRadius: {
        '4rem': '4rem',
      },
    },
  },
  plugins: [],
}

