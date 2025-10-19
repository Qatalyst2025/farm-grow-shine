import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, TrendingUp, Calendar, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  fields: { key: string; label: string; type: string; placeholder: string }[];
  generate: (values: Record<string, string>) => string;
}

const templates: Template[] = [
  {
    id: "price_offer",
    name: "Price Offer",
    icon: <TrendingUp className="h-4 w-4" />,
    fields: [
      { key: "price", label: "Price per kg", type: "number", placeholder: "0.00" },
      { key: "quantity", label: "Quantity (kg)", type: "number", placeholder: "1000" },
      { key: "location", label: "Delivery Location", type: "text", placeholder: "City, Region" },
    ],
    generate: (v) => `I offer $${v.price} per kg for ${v.quantity}kg with delivery to ${v.location}`,
  },
  {
    id: "quality_cert",
    name: "Quality & Delivery",
    icon: <Sparkles className="h-4 w-4" />,
    fields: [
      { key: "certification", label: "Quality Certification", type: "text", placeholder: "e.g., Organic, Grade A" },
      { key: "date", label: "Delivery Date", type: "date", placeholder: "" },
    ],
    generate: (v) => `I can provide ${v.certification} certification and deliver by ${new Date(v.date).toLocaleDateString()}`,
  },
  {
    id: "payment_split",
    name: "Payment Terms",
    icon: <Calendar className="h-4 w-4" />,
    fields: [
      { key: "advance", label: "Advance %", type: "number", placeholder: "30" },
      { key: "delivery", label: "On Delivery %", type: "number", placeholder: "70" },
    ],
    generate: (v) => `Let's split payment: ${v.advance}% advance, ${v.delivery}% on delivery`,
  },
  {
    id: "pickup_offer",
    name: "Pickup & Location",
    icon: <MapPin className="h-4 w-4" />,
    fields: [
      { key: "location", label: "Pickup Location", type: "text", placeholder: "Farm address" },
      { key: "date", label: "Available From", type: "date", placeholder: "" },
      { key: "duration", label: "Available For (days)", type: "number", placeholder: "7" },
    ],
    generate: (v) => `Available for pickup at ${v.location} from ${new Date(v.date).toLocaleDateString()} for ${v.duration} days`,
  },
];

interface MessageTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (message: string) => void;
}

export default function MessageTemplates({
  open,
  onOpenChange,
  onSelectTemplate,
}: MessageTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setValues({});
  };

  const handleGenerate = () => {
    if (selectedTemplate) {
      const message = selectedTemplate.generate(values);
      onSelectTemplate(message);
      onOpenChange(false);
      setSelectedTemplate(null);
      setValues({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Message Templates
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:border-primary transition-all hover:shadow-md"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {template.icon}
                  </div>
                  <p className="font-semibold text-sm">{template.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to customize and use
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTemplate(null)}
            >
              ← Back to templates
            </Button>

            <div className="space-y-3">
              {selectedTemplate.fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-sm">{field.label}</Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[field.key] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <Card className="p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <p className="text-sm font-medium">
                {selectedTemplate.generate(values)}
              </p>
            </Card>

            <Button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={!Object.values(values).every((v) => v)}
            >
              Use This Message
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
