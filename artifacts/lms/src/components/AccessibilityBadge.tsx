import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, BookOpen, Zap, Contrast, Ear } from 'lucide-react';
import AudiobookIcon from '@/components/icons/AudiobookIcon';

interface AccessibilityBadgeProps {
  features?: string[];
  compact?: boolean;
}

const accessibilityFeatureConfig = {
  'large-print': {
    label: 'Large Print',
    icon: Eye,
    description: 'Available in large print format for better readability',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  'braille': {
    label: 'Braille',
    icon: BookOpen,
    description: 'Available in Braille format for visually impaired readers',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  'audiobook': {
    label: 'Audiobook',
    icon: AudiobookIcon,
    description: 'Available as audiobook for audio learning',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  'dyslexia-friendly': {
    label: 'Dyslexia Friendly',
    icon: Zap,
    description: 'Formatted for readers with dyslexia',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  'high-contrast': {
    label: 'High Contrast',
    icon: Contrast,
    description: 'High contrast version available for low vision readers',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  'screen-reader-optimized': {
    label: 'Screen Reader',
    icon: Ear,
    description: 'Optimized for screen reader compatibility',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
};

export function AccessibilityBadge({ features = [], compact = false }: AccessibilityBadgeProps) {
  if (!features || features.length === 0) return null;

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {features.map(feature => {
          const config = accessibilityFeatureConfig[feature as keyof typeof accessibilityFeatureConfig];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <Tooltip key={feature}>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge className={`${config.color} border-0`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>{config.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">Accessibility Features:</p>
      <div className="flex gap-2 flex-wrap">
        {features.map(feature => {
          const config = accessibilityFeatureConfig[feature as keyof typeof accessibilityFeatureConfig];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <Tooltip key={feature}>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge className={`${config.color} border-0`}>
                    <Icon className="w-4 h-4 mr-1" />
                    {config.label}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>{config.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
