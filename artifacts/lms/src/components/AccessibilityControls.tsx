import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Eye, Accessibility, HelpCircle, X } from 'lucide-react';

interface AccessibilityControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccessibilityControls({ open, onOpenChange }: AccessibilityControlsProps) {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'vision' | 'motor'>('vision');

  const textSizeOptions = [
    { value: 'small', label: 'Aa', size: '12px' },
    { value: 'normal', label: 'Aa', size: '16px' },
    { value: 'large', label: 'Aa', size: '20px' },
    { value: 'xlarge', label: 'Aa', size: '24px' },
    { value: 'xxlarge', label: 'Aa', size: '28px' },
  ];

  const colorFilters = [
    { value: 'none', label: 'None' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'high-contrast', label: 'High Contrast' },
    { value: 'deuteranopia', label: 'Deuteranopia' },
    { value: 'protanopia', label: 'Protanopia' },
    { value: 'tritanopia', label: 'Tritanopia' },
  ];

  const errorColors = [
    '#dc2626', '#ef4444', '#b8860b', '#cd853f', '#6b8e23',
    '#a0522d', '#e11d48', '#7f1d1d', '#404040',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl">Accessibility Controls</DialogTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vision' | 'motor')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="motor" className="flex items-center gap-2">
              <Accessibility className="w-4 h-4" />
              Motor
            </TabsTrigger>
          </TabsList>

          {/* VISION TAB */}
          <TabsContent value="vision" className="space-y-6 mt-6">
            {/* Screen Reader */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Screen Reader</h3>
              <p className="text-sm text-muted-foreground">
                Reads content out loud and is compatible with screen reader extensions on your browser. Invoke by pressing the following keyboard shortcut.
              </p>
              <div className="flex gap-2 flex-wrap">
                <kbd className="px-3 py-1 bg-destructive/20 text-destructive rounded font-mono text-sm">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-3 py-1 bg-destructive/20 text-destructive rounded font-mono text-sm">⊞ Windows</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-3 py-1 bg-destructive/20 text-destructive rounded font-mono text-sm">↵ Enter</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Enable Screen Reader</Label>
                <Switch checked={settings.screenReader} onCheckedChange={(v) => updateSetting('screenReader', v)} />
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Text Size</h3>
                <Button variant="link" size="sm" onClick={() => updateSetting('textSize', 'normal')}>Reset</Button>
              </div>
              <p className="text-sm text-muted-foreground">Choose your preferred text size for comfortable readability and visual clarity.</p>
              <div className="flex gap-2 justify-center">
                {textSizeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting('textSize', opt.value as 'small' | 'medium' | 'large' | 'x-large')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      settings.textSize === opt.value
                        ? 'border-destructive bg-destructive/10'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    style={{ fontSize: opt.size }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Zoom</h3>
              <p className="text-sm text-muted-foreground">Zooms content from 25% to 150% and is compatible with your browser's zoom functionality.</p>
              <div className="flex gap-2 items-center">
                <span className="text-sm">25%</span>
                <Slider
                  value={[settings.zoom]}
                  onValueChange={(v) => updateSetting('zoom', v[0])}
                  min={25}
                  max={150}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12 text-right">{settings.zoom}%</span>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <kbd className="px-2 py-1 bg-destructive/20 text-destructive rounded">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-2 py-1 bg-destructive/20 text-destructive rounded">+ / −</kbd>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Letter Spacing</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred letter spacing for optimal readability and text clarity.</p>
              <Select value={settings.letterSpacing} onValueChange={(v) => updateSetting('letterSpacing', v as 'normal' | 'wide' | 'wider')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="increased">Increased</SelectItem>
                  <SelectItem value="very-increased">Very Increased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mandatory Fields Display */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Mandatory Fields Display Format</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred format to visually indicate mandatory form fields.</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="mandatory" defaultChecked className="w-4 h-4" />
                  <span>Asterisk</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="mandatory" className="w-4 h-4" />
                  <span>Mandatory Text</span>
                </label>
              </div>
            </div>

            {/* Underline Links */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Underline Links</h3>
                  <p className="text-sm text-muted-foreground">Adds an underline to hyperlinks for better visibility and accessibility.</p>
                </div>
                <Switch checked={settings.underlineLinks} onCheckedChange={(v) => updateSetting('underlineLinks', v)} />
              </div>
            </div>

            {/* Text Magnifier */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Text Magnifier</h3>
                  <p className="text-sm text-muted-foreground">Magnifies texts when hovering over it, with the following key pressed.</p>
                </div>
                <Switch checked={settings.textMagnifier} onCheckedChange={(v) => updateSetting('textMagnifier', v)} />
              </div>
              {settings.textMagnifier && (
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-destructive/20 text-destructive rounded text-sm">Alt</kbd>
                </div>
              )}
            </div>

            {/* Custom Cursor */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Custom Cursor</h3>
                  <p className="text-sm text-muted-foreground">Customize the size and color of your cursor for better visibility and easier tracking on the screen.</p>
                </div>
                <Switch checked={settings.customCursor} onCheckedChange={(v) => updateSetting('customCursor', v)} />
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Color Filter</h3>
              <p className="text-sm text-muted-foreground">Modify screen colors to enhance visibility and assist color perception.</p>
              <Select value={settings.colorFilter} onValueChange={(v) => updateSetting('colorFilter', v as 'none' | 'grayscale' | 'high-contrast' | 'inverted')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorFilters.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message Display */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Error Message Display Format</h3>
              <p className="text-sm text-muted-foreground">Customize the color of error messages or add an error icon for improved visibility and faster resolution.</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Error message color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {errorColors.map(color => (
                      <button
                        key={color}
                        onClick={() => updateSetting('errorMessageColor', color)}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          settings.errorMessageColor === color ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show error icon with message</Label>
                  <Switch checked={settings.showErrorIcon} onCheckedChange={(v) => updateSetting('showErrorIcon', v)} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* MOTOR TAB */}
          <TabsContent value="motor" className="space-y-6 mt-6">
            {/* Quick Access */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold">Quick Access</h3>
              <p className="text-sm text-muted-foreground">
                Provides navigation shortcuts to header, space, main menu, and app content of your live application. Note: Use 'tab' to move to the next option in live mode of you app. This control can also be activated using the following keyboard shortcut.
              </p>
              <div className="flex gap-2">
                <kbd className="px-3 py-1 bg-destructive/20 text-destructive rounded font-mono text-sm">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-3 py-1 bg-destructive/20 text-destructive rounded font-mono text-sm">.</kbd>
              </div>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 w-full">
                Enable
              </Button>
            </div>

            {/* Focus Disabled Fields */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Focus Disabled Fields</h3>
                  <p className="text-sm text-muted-foreground">Highlights disabled fields for clearer identification</p>
                </div>
                <Switch checked={settings.focusDisabledFields} onCheckedChange={(v) => updateSetting('focusDisabledFields', v)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={resetSettings}>
            Reset All Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
