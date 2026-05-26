import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const LayoutContext = createContext({
  modernLayout: false,
  toggleLayout: () => {},
  langKey: 0,
});

const LAYOUT_KEY = 'brewuno_modern_layout';

function getInitialLayout() {
  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch (e) {}
  return true;
}

var _setLangKeyCallback = null;

export function notifyLangChanged() {
  if (_setLangKeyCallback) _setLangKeyCallback();
}

export function LayoutProvider({ children }) {
  const [modernLayout, setModernLayout] = useState(getInitialLayout);
  const [langKey, setLangKey] = useState(0);

  const toggleLayout = useCallback(() => {
    setModernLayout(prev => {
      const next = !prev;
      try {
        localStorage.setItem(LAYOUT_KEY, String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  useEffect(() => {
    _setLangKeyCallback = () => setLangKey(k => k + 1);
    return () => { _setLangKeyCallback = null; };
  }, []);

  return (
    <LayoutContext.Provider value={{ modernLayout, toggleLayout, langKey }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}

export default LayoutContext;
