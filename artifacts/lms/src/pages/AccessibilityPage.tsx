import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Eye, Accessibility2 } from 'lucide-react';

export default function AccessibilityPage() {
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
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="page-header">Accessibility Controls</h1>
          <p className="text-muted-foreground mt-1">Customize your experience with accessibility features</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vision' | 'motor')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="motor" className="flex items-center gap-2">
              <Accessibility2 className="w-4 h-4" />
              Motor
            </TabsTrigger>
          </TabsList>

          {/* VISION TAB */}
          <TabsContent value="vision" className="space-y-4 mt-6">
            {/* Text Size */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Text Size</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose your preferred text size for comfortable readability.</p>
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
              </CardContent>
            </Card>

            {/* Zoom */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zoom</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Zoom content from 25% to 150%.</p>
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
              </CardContent>
            </Card>

            {/* Letter Spacing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Letter Spacing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Underline Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Underline Links</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Label>Add underline to hyperlinks</Label>
                <Switch checked={settings.underlineLinks} onCheckedChange={(v) => updateSetting('underlineLinks', v)} />
              </CardContent>
            </Card>

            {/* Color Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Color Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOTOR TAB */}
          <TabsContent value="motor" className="space-y-4 mt-6">
            {/* Focus Disabled Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Focus Disabled Fields</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Label>Highlight disabled fields</Label>
                <Switch checked={settings.focusDisabledFields} onCheckedChange={(v) => updateSetting('focusDisabledFields', v)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <Button variant="outline" onClick={resetSettings} className="w-full">
          Reset All Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
