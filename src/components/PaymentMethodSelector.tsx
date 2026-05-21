import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { paymentLogoMap } from "./PaymentLogos";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelect: (methodSlug: string) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onSelect }: PaymentMethodSelectorProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("id, name, slug, description, icon_name")
        .eq("is_enabled", true)
        .order("order_index");

      if (error) throw error;
      setPaymentMethods((data || []) as PaymentMethod[]);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No payment methods available
      </p>
    );
  }

  const getPaymentBadge = (slug: string) => {
    switch (slug) {
      case "sslcommerz":
        return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Secure</Badge>;
      case "bkash":
        return <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/30">Mobile</Badge>;
      case "bkash_personal":
        return <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/30">Send Money</Badge>;
      case "nagad":
        return <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">Mobile</Badge>;
      case "cash":
        return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">Office</Badge>;
      default:
        return null;
    }
  };

  const handleSelect = (slug: string) => {
    onSelect(slug);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Select Payment Method</Label>
      <div className="grid gap-3">
        {paymentMethods.map((method) => {
          const LogoComponent = paymentLogoMap[method.slug];
          const isSelected = selectedMethod === method.slug;

          return (
            <div
              key={method.id}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(method.slug);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(method.slug);
                }
              }}
              className={`cursor-pointer transition-all duration-200 rounded-lg border bg-card text-card-foreground shadow-sm p-4 ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20 shadow-md' 
                  : 'hover:border-primary/50 hover:shadow-sm border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {LogoComponent ? (
                    <div className={`rounded-xl overflow-hidden shadow-sm transition-transform duration-200 ${
                      isSelected ? 'scale-105 ring-2 ring-primary/30' : ''
                    }`}>
                      <LogoComponent size={48} />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className={`font-semibold transition-colors ${
                        isSelected ? 'text-primary' : ''
                      }`}
                    >
                      {method.name}
                    </span>
                    {getPaymentBadge(method.slug)}
                  </div>
                  {method.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {method.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
