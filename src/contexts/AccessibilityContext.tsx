import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TextSize = 'small' | 'medium' | 'large' | 'extraLarge';

interface AccessibilitySettings {
  highContrast: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  setTextSize: (size: TextSize) => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderAnnouncements: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  textSize: 'medium',
  reducedMotion: false,
  screenReaderAnnouncements: true,
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.setAttribute('data-text-size', settings.textSize);
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);

    // Handle prefers-reduced-motion
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0ms');
    } else {
      document.documentElement.style.removeProperty('--transition-duration');
    }
  }, [settings]);

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setTextSize = (size: TextSize) => {
    setSettings(prev => ({ ...prev, textSize: size }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleScreenReaderAnnouncements = () => {
    setSettings(prev => ({ 
      ...prev, 
      screenReaderAnnouncements: !prev.screenReaderAnnouncements 
    }));
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderAnnouncements) return;

    const announcer = document.getElementById(`aria-announcer-${priority}`);
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        setTextSize,
        toggleReducedMotion,
        toggleScreenReaderAnnouncements,
        announce,
      }}
    >
      {children}
      {/* Screen reader announcement regions */}
      <div
        id="aria-announcer-polite"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div
        id="aria-announcer-assertive"
        className="sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
