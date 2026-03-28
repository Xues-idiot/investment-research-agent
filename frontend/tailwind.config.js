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
      // Neo-Terminal Premium 配色系统
      colors: {
        // 核心背景色
        terminal: {
          950: '#050709',
          900: '#0A0D12',
          800: '#131820',
          700: '#1A1F28',
          600: '#232B38',
          500: '#2D3648',
        },
        // 主色调 - 电光蓝
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // 强调色 - 琥珀金
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // 语义色
        gain: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        loss: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
        // 文字色
        content: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          muted: '#64748B',
          subtle: '#475569',
        },
        // 边框色
        border: {
          subtle: '#1E293B',
          default: '#2D3648',
          emphasis: '#3D4A5C',
        },
      },
      // 字体系统
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      // 圆角系统
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // 阴影系统 - 增强层次感
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.15)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.35)',
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      // 背景渐变
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%, rgba(245, 158, 11, 0.02) 100%)',
      },
      // 动画
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
