import { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export function useAccessibilityStyles() {
  const { settings } = useAccessibility();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Text size - use CSS custom property for better control
    const textSizeMap = {
      small: '0.875rem',
      normal: '1rem',
      large: '1.125rem',
      xlarge: '1.5rem',
      xxlarge: '1.75rem',
    };
    root.style.setProperty('--base-font-size', textSizeMap[settings.textSize]);
    
    // Apply to body for better inheritance
    body.style.fontSize = textSizeMap[settings.textSize];

    // Zoom - use CSS transform instead of zoom property for better layout preservation
    const zoomScale = settings.zoom / 100;
    if (settings.zoom !== 100) {
      root.style.setProperty('--zoom-scale', zoomScale.toString());
      // Apply transform to body to maintain layout
      body.style.transformOrigin = 'top left';
      body.style.transform = `scale(${zoomScale})`;
      body.style.width = `${100 / zoomScale}%`;
      body.style.height = `${100 / zoomScale}%`;
    } else {
      root.style.setProperty('--zoom-scale', '1');
      body.style.transform = '';
      body.style.transformOrigin = '';
      body.style.width = '100%';
      body.style.height = '100%';
    }

    // Letter spacing - apply to all text elements
    const letterSpacingMap = {
      default: '0',
      increased: '0.05em',
      'very-increased': '0.1em',
    };
    root.style.setProperty('--letter-spacing', letterSpacingMap[settings.letterSpacing]);
    body.style.letterSpacing = letterSpacingMap[settings.letterSpacing];

    // Underline links
    if (settings.underlineLinks) {
      root.style.setProperty('--link-underline', 'underline');
      // Add CSS rule for links
      let styleEl = document.getElementById('accessibility-link-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'accessibility-link-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = 'a { text-decoration: underline !important; }';
    } else {
      root.style.setProperty('--link-underline', 'none');
      const styleEl = document.getElementById('accessibility-link-styles');
      if (styleEl) styleEl.remove();
    }

    // Color filter - apply to body for better effect
    const filterMap = {
      none: 'none',
      grayscale: 'grayscale(100%)',
      'high-contrast': 'contrast(1.5) brightness(1.1)',
      deuteranopia: 'url(#deuteranopia-filter)',
      protanopia: 'url(#protanopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
    };
    body.style.filter = filterMap[settings.colorFilter];

    // Custom cursor - apply to entire document
    if (settings.customCursor) {
      const cursorSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2214%22 fill=%22%23dc2626%22 stroke=%22%23fff%22 stroke-width=%222%22/%3E%3C/svg%3E';
      root.style.cursor = `url("${cursorSvg}") 16 16, auto`;
      body.style.cursor = `url("${cursorSvg}") 16 16, auto`;
    } else {
      root.style.cursor = 'auto';
      body.style.cursor = 'auto';
    }

    // Focus disabled fields - add visual highlight
    if (settings.focusDisabledFields) {
      let styleEl = document.getElementById('accessibility-disabled-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'accessibility-disabled-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        input:disabled, 
        textarea:disabled, 
        select:disabled, 
        button:disabled {
          outline: 2px solid #fca5a5 !important;
          outline-offset: 2px !important;
          background-color: #fef2f2 !important;
        }
      `;
    } else {
      const styleEl = document.getElementById('accessibility-disabled-styles');
      if (styleEl) styleEl.remove();
    }

    // Text magnifier - add hover effect
    if (settings.textMagnifier) {
      let styleEl = document.getElementById('accessibility-magnifier-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'accessibility-magnifier-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        body.magnifier-active *:hover {
          font-size: 1.2em !important;
          background-color: rgba(255, 255, 0, 0.1) !important;
          padding: 2px 4px !important;
        }
      `;
      body.classList.add('magnifier-active');
    } else {
      const styleEl = document.getElementById('accessibility-magnifier-styles');
      if (styleEl) styleEl.remove();
      body.classList.remove('magnifier-active');
    }

    return () => {
      // Cleanup
      root.style.setProperty('--base-font-size', '1rem');
      root.style.setProperty('--zoom-scale', '1');
      root.style.setProperty('--letter-spacing', '0');
      root.style.setProperty('--link-underline', 'none');
      
      body.style.fontSize = '';
      body.style.transform = '';
      body.style.width = '';
      body.style.height = '';
      body.style.letterSpacing = '';
      body.style.filter = '';
      body.style.cursor = '';
      
      root.style.cursor = '';
      
      // Remove dynamic styles
      document.getElementById('accessibility-link-styles')?.remove();
      document.getElementById('accessibility-disabled-styles')?.remove();
      document.getElementById('accessibility-magnifier-styles')?.remove();
      body.classList.remove('magnifier-active');
    };
  }, [settings]);
}
