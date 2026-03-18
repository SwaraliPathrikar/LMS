import { ReactNode } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceFrameProps {
  children: ReactNode;
  deviceType?: DeviceType;
  showFrame?: boolean;
}

const deviceConfigs = {
  mobile: {
    width: 'w-96',
    height: 'h-screen',
    maxHeight: 'max-h-screen',
    icon: Smartphone,
    label: 'Mobile (375px)',
    frameClass: 'rounded-3xl border-8 border-gray-900 shadow-2xl',
  },
  tablet: {
    width: 'w-full',
    height: 'h-screen',
    maxHeight: 'max-h-screen',
    icon: Tablet,
    label: 'Tablet (768px)',
    frameClass: 'rounded-2xl border-4 border-gray-800 shadow-xl',
  },
  desktop: {
    width: 'w-full',
    height: 'h-screen',
    maxHeight: 'max-h-screen',
    icon: Monitor,
    label: 'Desktop (1920px)',
    frameClass: 'rounded-lg border-2 border-gray-700 shadow-lg',
  },
};

export default function DeviceFrame({ 
  children, 
  deviceType = 'desktop', 
  showFrame = true 
}: DeviceFrameProps) {
  const config = deviceConfigs[deviceType];
  const Icon = config.icon;

  if (!showFrame) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      {/* Device Label */}
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-600">{config.label}</span>
      </div>

      {/* Device Frame */}
      <div className={`${config.width} ${config.maxHeight} ${config.frameClass} bg-white overflow-hidden flex flex-col`}>
        {/* Status Bar (Mobile) */}
        {deviceType === 'mobile' && (
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
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Home Indicator (Mobile) */}
        {deviceType === 'mobile' && (
          <div className="bg-gray-900 h-6 flex items-center justify-center">
            <div className="w-32 h-1 bg-gray-700 rounded-full" />
          </div>
        )}
      </div>

      {/* Device Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Responsive Preview</p>
      </div>
    </div>
  );
}
