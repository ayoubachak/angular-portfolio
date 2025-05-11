/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: {
    files: [
      "./src/**/*.{html,ts}",
    ],
    safelist: [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'text-primary',
      'text-secondary',
      'text-accent',
      'border-accent',
      'hover:bg-accent',
      'hover:text-accent',
      'focus:ring-accent',
      'text-text-primary',
      'text-text-secondary',
      'bg-text-primary',
      'bg-text-secondary'
    ],
  },
  theme: {
    extend: {
      colors: {
        'primary': '#111827',
        'secondary': '#1F2937',
        'accent': '#4F46E5',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}