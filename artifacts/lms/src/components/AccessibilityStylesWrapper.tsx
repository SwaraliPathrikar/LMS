import { ReactNode } from 'react';
import { useAccessibilityStyles } from '@/hooks/useAccessibilityStyles';

export function AccessibilityStylesWrapper({ children }: { children: ReactNode }) {
  useAccessibilityStyles();
  return <>{children}</>;
}
