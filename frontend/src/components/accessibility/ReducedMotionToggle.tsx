import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const ReducedMotionToggle = () => {
  const { t } = useTranslation();
  const { settings, toggleReducedMotion, announce } = useAccessibility();

  const handleToggle = () => {
    toggleReducedMotion();
    announce(
      `Reduced motion ${!settings.reducedMotion ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label 
        htmlFor="reduced-motion-toggle" 
        className="flex-1 cursor-pointer"
      >
        {t('accessibility.reducedMotion')}
      </Label>
      <Switch
        id="reduced-motion-toggle"
        checked={settings.reducedMotion}
        onCheckedChange={handleToggle}
        aria-label={t('accessibility.reducedMotion')}
      />
    </div>
  );
};
