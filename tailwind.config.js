export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        base: 'var(--color-base)',
        elevated: 'var(--color-elevated)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)'
      },
      borderRadius: { DEFAULT: '8px', sm: '6px', lg: '12px', xl: '16px', full: '9999px' }
    }
  },
  plugins: []
};
