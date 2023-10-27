/** @type {import('tailwindcss').Config} */
import { type Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'black-pearl': {
          '50': '#f1f9fe',
          '100': '#e2f3fc',
          '200': '#bee6f9',
          '300': '#84d4f5',
          '400': '#43bded',
          '500': '#1aa5dd',
          '600': '#0d85bc',
          '700': '#0c6998',
          '800': '#0e5a7e',
          '900': '#114b69',
          '950': '#082130'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
} satisfies Config;
