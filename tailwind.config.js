module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      maxHeight: {
        xvh: '80vh',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
