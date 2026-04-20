/**
 * NODE_V4 POSTCSS CONFIGURATION
 * Optimized for Tailwind CSS v4 and Next.js 15+ Turbopack.
 * Using the separate @tailwindcss/postcss plugin for ultra-fast compilation.
 */

export default {
  plugins: {
    // Is package ko humne 'npm install @tailwindcss/postcss' se add kiya hai
    '@tailwindcss/postcss': {},
    // Autoprefixer ensures cross-browser compatibility for older engines
    'autoprefixer': {},
  },
};