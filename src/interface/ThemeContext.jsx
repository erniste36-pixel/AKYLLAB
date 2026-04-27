import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  neon:     { name: 'Неон',      bg: '#07080d', primary: '#00ffb3', secondary: '#7c3aed', glow: 'rgba(0,255,179,0.15)' },
  plasma:   { name: 'Плазма',    bg: '#08050f', primary: '#e879f9', secondary: '#06b6d4', glow: 'rgba(232,121,249,0.15)' },
  solar:    { name: 'Солнечная', bg: '#0d0800', primary: '#fb923c', secondary: '#facc15', glow: 'rgba(251,146,60,0.15)' },
  quantum:  { name: 'Квантовый', bg: '#020d0f', primary: '#38bdf8', secondary: '#818cf8', glow: 'rgba(56,189,248,0.15)' },
  bio:      { name: 'Биолог.',   bg: '#040d04', primary: '#4ade80', secondary: '#22d3ee', glow: 'rgba(74,222,128,0.15)' },
  crimson:  { name: 'Алый',      bg: '#0d0404', primary: '#f43f5e', secondary: '#f97316', glow: 'rgba(244,63,94,0.15)' },
};

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('akyl-theme') || 'neon');

  const theme = THEMES[themeKey] || THEMES.neon;

  useEffect(() => {
    localStorage.setItem('akyl-theme', themeKey);
    const r = document.documentElement.style;
    r.setProperty('--forge-bg',       theme.bg);
    r.setProperty('--neon-primary',   theme.primary);
    r.setProperty('--neon-accent',    theme.secondary);
    r.setProperty('--theme-glow',     theme.glow);
    
    // Add RGB value for transparent layers
    const rgb = hexToRgbValues(theme.primary);
    r.setProperty('--neon-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    
    document.body.style.background = theme.bg;
  }, [themeKey, theme]);

  return (
    <ThemeCtx.Provider value={{ themeKey, setThemeKey, theme, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// Helper
function hexToRgbValues(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  return { r, g, b };
}

export const useTheme = () => useContext(ThemeCtx);
