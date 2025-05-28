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
        primary: '#FF6B6B',       // 鲜艳的红色
        secondary: '#4ECDC4',     // 清新的青绿色
        accent: '#FFD166',        // 明亮的黄色
        pastel: {
          blue: '#A5D8FF',        // 淡蓝色
          green: '#B8E0D2',       // 淡绿色
          pink: '#FFD1DC',        // 淡粉色
          yellow: '#FFFACD',      // 淡黄色
          purple: '#D8BFD8',      // 淡紫色
        }
      },
      borderRadius: {
        'bubble': '2rem',
      },
      boxShadow: {
        'cartoon': '0 4px 0 rgba(0, 0, 0, 0.1)',
        'cartoon-lg': '0 6px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}