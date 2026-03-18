import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  // Vision
  textSize: 'small' | 'normal' | 'large' | 'xlarge' | 'xxlarge';
  zoom: number; // 25-150
  letterSpacing: 'default' | 'increased' | 'very-increased';
  underlineLinks: boolean;
  textMagnifier: boolean;
  customCursor: boolean;
  colorFilter: 'none' | 'grayscale' | 'high-contrast' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  errorMessageColor: string;
  showErrorIcon: boolean;
  screenReader: boolean;

  // Motor
  quickAccess: boolean;
  focusDisabledFields: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'normal',
  zoom: 100,
  letterSpacing: 'default',
  underlineLinks: false,
  textMagnifier: false,
  customCursor: false,
  colorFilter: 'none',
  errorMessageColor: '#dc2626',
  showErrorIcon: true,
  screenReader: false,
  quickAccess: false,
  focusDisabledFields: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        // Failed to load accessibility settings - using defaults
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
