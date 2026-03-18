/**
 * Dialog Configuration Utility
 * Ensures all dialogs are properly sized and visible without scrolling
 */

export const dialogClasses = {
  // Small dialogs (confirmations, simple forms)
  small: "w-[95vw] max-w-sm max-h-[85vh] overflow-y-auto",
  
  // Medium dialogs (forms, details)
  medium: "w-[95vw] max-w-md max-h-[85vh] overflow-y-auto",
  
  // Large dialogs (complex forms, tables)
  large: "w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto",
  
  // Extra large dialogs (full content)
  xlarge: "w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto",
};

export const getDialogClass = (size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium') => {
  return dialogClasses[size];
};
