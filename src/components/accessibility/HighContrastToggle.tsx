import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const HighContrastToggle = () => {
  const { t } = useTranslation();
  const { settings, toggleHighContrast, announce } = useAccessibility();

  const handleToggle = () => {
    toggleHighContrast();
    announce(
      `High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label 
        htmlFor="high-contrast-toggle" 
        className="flex-1 cursor-pointer"
      >
        {t('accessibility.highContrast')}
      </Label>
      <Switch
        id="high-contrast-toggle"
        checked={settings.highContrast}
        onCheckedChange={handleToggle}
        aria-label={t('accessibility.highContrast')}
      />
    </div>
  );
};
