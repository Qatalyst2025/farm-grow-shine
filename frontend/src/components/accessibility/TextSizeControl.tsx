import { useTranslation } from 'react-i18next';
import { useAccessibility, TextSize } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';

const sizes: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'accessibility.small' },
  { value: 'medium', label: 'accessibility.medium' },
  { value: 'large', label: 'accessibility.large' },
  { value: 'extraLarge', label: 'accessibility.extraLarge' },
];

export const TextSizeControl = () => {
  const { t } = useTranslation();
  const { settings, setTextSize, announce } = useAccessibility();

  const handleSizeChange = (size: TextSize) => {
    setTextSize(size);
    announce(`Text size changed to ${t(sizes.find(s => s.value === size)?.label || '')}`);
  };

  return (
    <div 
      className="flex gap-2 flex-wrap"
      role="group"
      aria-label={t('accessibility.textSize')}
    >
      {sizes.map((size) => (
        <Button
          key={size.value}
          variant={settings.textSize === size.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSizeChange(size.value)}
          aria-pressed={settings.textSize === size.value}
          aria-label={`${t('accessibility.textSize')}: ${t(size.label)}`}
        >
          {t(size.label)}
        </Button>
      ))}
    </div>
  );
};
