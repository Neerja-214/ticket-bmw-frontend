/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", 
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      scrollbar: {
        none: 'none', // For hiding the scrollbar
        auto: 'auto', // Default behavior
      },
      screens: {
        'sm': '640px',   // Small devices (default Tailwind)
        'md': '768px',   // Medium devices (default Tailwind)
        'lg': '1024px',  // Large devices (default Tailwind)
        'xl': '1280px',  // Extra large devices (default Tailwind)
        '2xl': '1440px', // Custom for 1440px screens
        '3xl': '1600px', // Custom for large desktops
        '4k': '2560px',  // 4K Screens
      },
      width: {
        "3/12": "24.333333%", 
      },
    },
  },
  plugins: [],
};
