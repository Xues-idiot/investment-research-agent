/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 投研项目特色配色
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',      // 深蓝 - 金融、专业感
          50: '#E8EDF2',
          100: '#D1DBE5',
          200: '#A3B7CB',
          300: '#7593B1',
          400: '#476F97',
          500: '#1E3A5F',
          600: '#1A3252',
          700: '#152A45',
          800: '#112138',
          900: '#0D192B',
        },
        secondary: {
          DEFAULT: '#2D5A4A',      // 墨绿 - 沉稳、信任
          50: '#E8F0EE',
          100: '#D1E1DD',
          200: '#A3C3BB',
          300: '#75A599',
          400: '#478777',
          500: '#2D5A4A',
          600: '#264C3E',
          700: '#1F3E32',
          800: '#183026',
          900: '#11221A',
        },
        accent: {
          DEFAULT: '#C9A227',      // 金色 - 高端、价值
          50: '#FCF8E8',
          100: '#F9F1D1',
          200: '#F3E3A3',
          300: '#EDD575',
          400: '#E7C747',
          500: '#C9A227',
          600: '#A1821F',
          700: '#796117',
          800: '#51400F',
          900: '#281F08',
        },
        background: {
          DEFAULT: '#1A1A2E',      // 深灰 - 数据看板感
          50: '#E6E6EA',
          100: '#CDCDD5',
          200: '#9B9BAB',
          300: '#696981',
          400: '#373757',
          500: '#1A1A2E',
          600: '#161626',
          700: '#12121E',
          800: '#0E0E16',
          900: '#0A0A0E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
