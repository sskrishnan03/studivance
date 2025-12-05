import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type FontSize = 'sm' | 'base' | 'lg';
export type FontFamily = 'Inter' | 'Poppins' | 'Roboto' | 'Nunito' | 'SF Pro' | 'Jumble';

interface ThemeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  noteFontSize: number;
  setNoteFontSize: (size: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '14px',
  base: '16px',
  lg: '18px',
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
      const savedSize = localStorage.getItem('fontSize');
      return (savedSize as FontSize) || 'base';
  });

  const [noteFontSize, setNoteFontSizeState] = useState<number>(() => {
    const savedSize = localStorage.getItem('noteFontSize');
    return savedSize ? parseInt(savedSize, 10) : 16;
  });

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    const savedFont = localStorage.getItem('appFont');
    return (savedFont as FontFamily) || 'Inter';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.fontSize = FONT_SIZE_MAP[fontSize];
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);
  
  const setNoteFontSize = (size: number) => {
    localStorage.setItem('noteFontSize', String(size));
    setNoteFontSizeState(size);
  };

  useEffect(() => {
    const fontMap: Record<FontFamily, string> = {
        'Inter': "'Inter', sans-serif",
        'Poppins': "'Poppins', sans-serif",
        'Roboto': "'Roboto', sans-serif",
        'Nunito': "'Nunito', sans-serif",
        'SF Pro': "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'Jumble': "'Jura', sans-serif",
    };
    document.body.style.fontFamily = fontMap[fontFamily];
    localStorage.setItem('appFont', fontFamily);
  }, [fontFamily]);

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize, noteFontSize, setNoteFontSize, fontFamily, setFontFamily }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};