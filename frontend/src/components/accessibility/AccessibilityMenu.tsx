import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';
import { TextSizeControl } from './TextSizeControl';
import { HighContrastToggle } from './HighContrastToggle';
import { ReducedMotionToggle } from './ReducedMotionToggle';
import { Separator } from '@/components/ui/separator';

export const AccessibilityMenu = () => {
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('accessibility.menu')}
          className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-96 overflow-y-auto"
        aria-describedby="accessibility-description"
      >
        <SheetHeader>
          <SheetTitle>{t('accessibility.menu')}</SheetTitle>
          <SheetDescription id="accessibility-description">
            Customize your experience with accessibility and language settings
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">{t('accessibility.language')}</h3>
            <LanguageSelector />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">{t('accessibility.textSize')}</h3>
            <TextSizeControl />
          </div>

          <Separator />

          <div className="space-y-4">
            <HighContrastToggle />
            <ReducedMotionToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
