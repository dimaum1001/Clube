/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Escaneia todos os arquivos JS/JSX/TS/TSX na pasta src
  ],
  theme: {
    extend: {}, // Você pode adicionar customizações aqui, como cores ou fontes
  },
  plugins: [], // Adicione plugins como @tailwindcss/forms ou @tailwindcss/typography se necessário
}