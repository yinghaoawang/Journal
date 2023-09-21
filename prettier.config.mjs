/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  singleQuote: true,
  tabWidth: 2,
  semi: true,
  trailingComma: 'none',
  plugins: ['prettier-plugin-tailwindcss']
};

export default config;
