import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  Building,
  Eye, 
  EyeOff, 
  Save,
  Settings,
  TestTube,
  Radio,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
  is_enabled: boolean;
  is_live_mode: boolean;
  credentials: Record<string, string>;
  order_index: number;
}

interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  required?: boolean;
}

const paymentMethodConfigs: Record<string, { 
  fields: CredentialField[];
  testFields?: CredentialField[];
  hasTestMode: boolean;
}> = {
  sslcommerz: {
    hasTestMode: true,
    fields: [
      { key: 'store_id', label: 'Store ID', type: 'text', placeholder: 'Enter SSLCommerz Store ID', required: true },
      { key: 'store_password', label: 'Store Password', type: 'password', placeholder: 'Enter Store Password', required: true },
    ],
    testFields: [
      { key: 'test_store_id', label: 'Test Store ID', type: 'text', placeholder: 'Enter Test Store ID' },
      { key: 'test_store_password', label: 'Test Store Password', type: 'password', placeholder: 'Enter Test Password' },
    ],
  },
  bkash: {
    hasTestMode: true,
    fields: [
      { key: 'app_key', label: 'App Key', type: 'text', placeholder: 'Enter bKash App Key', required: true },
      { key: 'app_secret', label: 'App Secret', type: 'password', placeholder: 'Enter App Secret', required: true },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter Merchant Username', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter Merchant Password', required: true },
    ],
    testFields: [
      { key: 'test_app_key', label: 'Sandbox App Key', type: 'text', placeholder: 'Enter Sandbox App Key' },
      { key: 'test_app_secret', label: 'Sandbox App Secret', type: 'password', placeholder: 'Enter Sandbox Secret' },
      { key: 'test_username', label: 'Sandbox Username', type: 'text', placeholder: 'Enter Sandbox Username' },
      { key: 'test_password', label: 'Sandbox Password', type: 'password', placeholder: 'Enter Sandbox Password' },
    ],
  },
  nagad: {
    hasTestMode: true,
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', placeholder: 'Enter Nagad Merchant ID', required: true },
      { key: 'merchant_number', label: 'Merchant Number', type: 'text', placeholder: 'Enter Merchant Number', required: true },
      { key: 'public_key', label: 'Public Key', type: 'password', placeholder: 'Paste Public Key', required: true },
      { key: 'private_key', label: 'Private Key', type: 'password', placeholder: 'Paste Private Key', required: true },
    ],
    testFields: [
      { key: 'test_merchant_id', label: 'Sandbox Merchant ID', type: 'text', placeholder: 'Enter Sandbox Merchant ID' },
      { key: 'test_merchant_number', label: 'Sandbox Merchant Number', type: 'text', placeholder: 'Enter Sandbox Number' },
    ],
  },
  cash: {
    hasTestMode: false,
    fields: [
      { key: 'instructions', label: 'Payment Instructions', type: 'text', placeholder: 'Instructions shown to customer' },
    ],
  },
  bank_transfer: {
    hasTestMode: false,
    fields: [
      { key: 'bank_name', label: 'Bank Name', type: 'text', placeholder: 'e.g., BRAC Bank Limited', required: true },
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'e.g., SM Elite Hajj Travel Agency Ltd', required: true },
      { key: 'account_number', label: 'Account Number', type: 'text', placeholder: 'e.g., 1501204528849001', required: true },
      { key: 'branch', label: 'Branch Name', type: 'text', placeholder: 'e.g., Gulshan Branch', required: true },
      { key: 'routing_number', label: 'Routing Number', type: 'text', placeholder: 'e.g., 060261934' },
      { key: 'swift_code', label: 'SWIFT Code', type: 'text', placeholder: 'e.g., BABORHDHXXX' },
    ],
  },
};

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  Building,
};

const AdminPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editedCredentials, setEditedCredentials] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("order_index");

      if (error) throw error;
      
      // Type assertion since we know the structure
      setPaymentMethods((data || []) as unknown as PaymentMethod[]);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_enabled: !method.is_enabled })
        .eq("id", method.id);

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(m => m.id === method.id ? { ...m, is_enabled: !m.is_enabled } : m)
      );

      toast({
        title: "Success",
        description: `${method.name} ${!method.is_enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error("Error toggling payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    }
  };

  const toggleLiveMode = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_live_mode: !method.is_live_mode })
        .eq("id", method.id);

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(m => m.id === method.id ? { ...m, is_live_mode: !m.is_live_mode } : m)
      );

      toast({
        title: "Success",
        description: `${method.name} switched to ${!method.is_live_mode ? 'Live' : 'Test'} mode`,
      });
    } catch (error) {
      console.error("Error toggling mode:", error);
      toast({
        title: "Error",
        description: "Failed to update mode",
        variant: "destructive",
      });
    }
  };

  const moveMethod = async (method: PaymentMethod, direction: 'up' | 'down') => {
    const sorted = [...paymentMethods].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex(m => m.id === method.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    const a = method.order_index;
    const b = other.order_index;

    try {
      // Two-step swap to avoid unique-constraint conflicts if any
      const tmp = -Math.abs(a) - 1000;
      const { error: e1 } = await supabase.from("payment_methods").update({ order_index: tmp }).eq("id", method.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("payment_methods").update({ order_index: a }).eq("id", other.id);
      if (e2) throw e2;
      const { error: e3 } = await supabase.from("payment_methods").update({ order_index: b }).eq("id", method.id);
      if (e3) throw e3;

      setPaymentMethods(prev => prev.map(m => {
        if (m.id === method.id) return { ...m, order_index: b };
        if (m.id === other.id) return { ...m, order_index: a };
        return m;
      }));

      toast({ title: "Reordered", description: `${method.name} moved ${direction}` });
    } catch (error) {
      console.error("Error reordering:", error);
      toast({ title: "Error", description: "Failed to reorder", variant: "destructive" });
    }
  };

  const openConfigDialog = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setEditedCredentials(method.credentials || {});
    setShowSecrets({});
  };

  const saveCredentials = async () => {
    if (!selectedMethod) return;

    setSaving(selectedMethod.id);
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ credentials: editedCredentials })
        .eq("id", selectedMethod.id);

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(m => m.id === selectedMethod.id ? { ...m, credentials: editedCredentials } : m)
      );

      toast({
        title: "Success",
        description: `${selectedMethod.name} credentials saved securely`,
      });

      setSelectedMethod(null);
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const updateCredential = (key: string, value: string) => {
    setEditedCredentials(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCredentialField = (field: CredentialField) => {
    const isPassword = field.type === 'password';
    const isVisible = showSecrets[field.key];

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={field.key}
            type={isPassword && !isVisible ? 'password' : 'text'}
            placeholder={field.placeholder}
            value={editedCredentials[field.key] || ''}
            onChange={(e) => updateCredential(field.key, e.target.value)}
            className="pr-10"
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => toggleSecretVisibility(field.key)}
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage payment gateways and configure API credentials securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {paymentMethods.map((method) => {
              const IconComponent = iconMap[method.icon_name] || CreditCard;
              const config = paymentMethodConfigs[method.slug];
              const hasCredentials = Object.keys(method.credentials || {}).length > 0;

              return (
                <Card key={method.id} className={`${method.is_enabled ? 'border-primary/50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          method.is_enabled ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${method.is_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{method.name}</h3>
                            {method.is_enabled && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                            {config?.hasTestMode && method.is_enabled && (
                              <Badge variant={method.is_live_mode ? "default" : "secondary"} className="text-xs gap-1">
                                {method.is_live_mode ? (
                                  <>
                                    <Radio className="w-3 h-3" />
                                    Live
                                  </>
                                ) : (
                                  <>
                                    <TestTube className="w-3 h-3" />
                                    Test
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          {method.slug !== 'cash' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {hasCredentials ? '✓ Credentials configured' : '⚠ Credentials not set'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {config?.hasTestMode && method.is_enabled && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`live-${method.id}`} className="text-xs text-muted-foreground">
                              Live
                            </Label>
                            <Switch
                              id={`live-${method.id}`}
                              checked={method.is_live_mode}
                              onCheckedChange={() => toggleLiveMode(method)}
                            />
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfigDialog(method)}
                          className="gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Configure
                        </Button>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enable-${method.id}`} className="text-sm">
                            Enable
                          </Label>
                          <Switch
                            id={`enable-${method.id}`}
                            checked={method.is_enabled}
                            onCheckedChange={() => toggleEnabled(method)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!selectedMethod} onOpenChange={() => setSelectedMethod(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure {selectedMethod?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials. All sensitive data is stored securely.
            </DialogDescription>
          </DialogHeader>

          {selectedMethod && paymentMethodConfigs[selectedMethod.slug] && (
            <div className="space-y-4">
              {paymentMethodConfigs[selectedMethod.slug].hasTestMode ? (
                <Tabs defaultValue="live" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live" className="gap-2">
                      <Radio className="w-4 h-4" />
                      Live Credentials
                    </TabsTrigger>
                    <TabsTrigger value="test" className="gap-2">
                      <TestTube className="w-4 h-4" />
                      Test/Sandbox
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="live" className="space-y-4 mt-4">
                    {paymentMethodConfigs[selectedMethod.slug].fields.map(renderCredentialField)}
                  </TabsContent>
                  <TabsContent value="test" className="space-y-4 mt-4">
                    {paymentMethodConfigs[selectedMethod.slug].testFields?.map(renderCredentialField)}
                    <p className="text-xs text-muted-foreground">
                      Test credentials are used when the payment method is in Test mode.
                    </p>
                  </TabsContent>
                </Tabs>
              ) : selectedMethod.slug === 'bank_transfer' ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary font-medium mb-3">
                      <Building className="w-5 h-5" />
                      Bank Account Details
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      These details will be shown to customers when they select Bank Transfer as payment method.
                    </p>
                    <div className="grid gap-4">
                      {paymentMethodConfigs[selectedMethod.slug].fields.map(renderCredentialField)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethodConfigs[selectedMethod.slug].fields.map(renderCredentialField)}
                </div>
              )}

              {selectedMethod.slug === 'cash' && (
                <div className="space-y-2">
                  <Label>Payment Instructions</Label>
                  <Textarea
                    placeholder="Instructions shown to customers choosing cash payment..."
                    value={editedCredentials.instructions || ''}
                    onChange={(e) => updateCredential('instructions', e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedMethod(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={saveCredentials}
                  disabled={saving === selectedMethod.id}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving === selectedMethod.id ? 'Saving...' : 'Save Credentials'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaymentMethods;
