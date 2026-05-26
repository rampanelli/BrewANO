import React, { createContext, useContext, useState, useCallback } from 'react';

const LayoutContext = createContext({
  modernLayout: false,
  toggleLayout: () => {},
});

const LAYOUT_KEY = 'brewuno_modern_layout';

function getInitialLayout() {
  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch (e) {}
  return false;
}

export function LayoutProvider({ children }) {
  const [modernLayout, setModernLayout] = useState(getInitialLayout);

  const toggleLayout = useCallback(() => {
    setModernLayout(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LAYOUT_KEY, String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  return (
    <LayoutContext.Provider value={{ modernLayout, toggleLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}

export default LayoutContext;
