import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ResponsivePreview() {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const deviceConfigs = {
    mobile: {
      width: 'w-96',
      height: 'h-[812px]',
      icon: Smartphone,
      label: 'Mobile (375px × 812px)',
      description: 'iPhone 12/13/14 size',
    },
    tablet: {
      width: 'w-full max-w-2xl',
      height: 'h-[1024px]',
      icon: Tablet,
      label: 'Tablet (768px × 1024px)',
      description: 'iPad size',
    },
    desktop: {
      width: 'w-full',
      height: 'h-screen',
      icon: Monitor,
      label: 'Desktop (1920px)',
      description: 'Full desktop view',
    },
  };

  const config = deviceConfigs[selectedDevice];
  const Icon = config.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header">Responsive Preview</h1>
          <p className="text-muted-foreground mt-1">View the application on different device sizes</p>
        </div>

        {/* Device Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(deviceConfigs).map(([key, value]) => {
                const DeviceIcon = value.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDevice(key as 'mobile' | 'tablet' | 'desktop')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDevice === key
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <DeviceIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
                    <p className="font-medium text-sm">{value.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{value.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon size={20} />
              {config.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center bg-gray-100 rounded-lg p-8 overflow-x-auto">
              <div className={`${config.width} ${config.height} bg-white rounded-2xl border-8 border-gray-900 shadow-2xl overflow-hidden flex flex-col`}>
                {/* Status Bar */}
                {selectedDevice === 'mobile' && (
                  <div className="bg-gray-900 text-white px-4 py-1 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>📡</span>
                      <span>🔋</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h2 className="font-bold text-lg">Library Management</h2>
                      <p className="text-sm text-muted-foreground">Municipal System</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Books', value: '2,450' },
                        { label: 'Members', value: '1,230' },
                        { label: 'Events', value: '12' },
                        { label: 'Overdue', value: '45' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-bold text-accent">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                      {['Search Books', 'Events', 'Members', 'Notifications'].map(item => (
                        <div key={item} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                          <span className="text-sm font-medium">{item}</span>
                          <span className="text-muted-foreground">→</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                {selectedDevice === 'mobile' && (
                  <div className="bg-gray-900 h-6 flex items-center justify-center">
                    <div className="w-32 h-1 bg-gray-700 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsive Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Mobile Optimized', desc: 'Touch-friendly interface with bottom navigation' },
                { title: 'Tablet Friendly', desc: 'Optimized layout for medium screens' },
                { title: 'Desktop Ready', desc: 'Full sidebar navigation and features' },
                { title: 'Adaptive Design', desc: 'Automatically adjusts to screen size' },
                { title: 'Fast Loading', desc: 'Optimized for all connection speeds' },
                { title: 'Accessible', desc: 'WCAG compliant with keyboard navigation' },
              ].map(feature => (
                <div key={feature.title} className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Breakpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsive Breakpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Mobile', size: '< 640px', features: 'Bottom nav, Full-width content' },
                { name: 'Tablet', size: '640px - 1024px', features: 'Collapsible sidebar, Grid layout' },
                { name: 'Desktop', size: '> 1024px', features: 'Full sidebar, Multi-column layout' },
              ].map(bp => (
                <div key={bp.name} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{bp.name}</p>
                    <p className="text-xs text-muted-foreground">{bp.size}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{bp.features}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
