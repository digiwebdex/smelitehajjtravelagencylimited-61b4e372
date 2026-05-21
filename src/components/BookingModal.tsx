import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, Plane, Phone, Mail, User, AlertCircle, Loader2, CreditCard, Banknote } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";
import { z } from "zod";
import PaymentMethodSelector from "./PaymentMethodSelector";
import BankTransferDetails from "./BankTransferDetails";
import BkashPersonalDetails, { BkashPersonalInfo } from "./BkashPersonalDetails";
import { Separator } from "@/components/ui/separator";

interface Package {
  id: string;
  title: string;
  price: number;
  type: string;
  duration_days: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  package_info: Package | null;
}

const bookingSchema = z.object({
  guestName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  guestEmail: z.string().trim().email("Please enter a valid email").max(255).optional().or(z.literal("")),
  guestPhone: z.string().trim().min(1, "Mobile number is required").regex(/^[+]?[\d\s-]{10,}$/, "Please enter a valid phone number"),
  passengerCount: z.number().min(1, "At least 1 passenger required").max(10, "Maximum 10 passengers allowed"),
  travelDate: z.string().optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

interface FormErrors {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  passengerCount?: string;
  paymentMethod?: string;
  transactionNumber?: string;
  screenshot?: string;
}

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  routing_number: string;
  swift_code: string;
}

const BookingModal = ({ isOpen, onClose, package_info }: BookingModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { initiatePayment, processing: paymentProcessing } = usePaymentProcessing();
  const { trackInitiateCheckout } = useFacebookPixel();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(3);
  const [bankTransactionNumber, setBankTransactionNumber] = useState("");
  const [bankScreenshot, setBankScreenshot] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    passengerCount: 1,
    travelDate: "",
    notes: "",
    paymentMethod: "",
    passengerDetails: {
      name: "",
      passportNumber: "",
      dateOfBirth: "",
      nationality: "Bangladeshi",
    },
  });

  // Fetch bank details when bank_transfer is selected
  useEffect(() => {
    if (formData.paymentMethod === "bank_transfer" && !bankDetails) {
      fetchBankDetails();
    }
  }, [formData.paymentMethod]);

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("credentials")
        .eq("slug", "bank_transfer")
        .single();

      if (error) throw error;
      if (data?.credentials) {
        setBankDetails(data.credentials as unknown as BankDetails);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Track InitiateCheckout event when modal opens
      if (package_info) {
        trackInitiateCheckout({
          contentId: package_info.id,
          contentName: package_info.title,
          value: package_info.price,
        });
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, package_info, trackInitiateCheckout]);

  const validateField = (field: keyof FormErrors, value: string | number) => {
    try {
      const fieldSchema = bookingSchema.shape[field];
      fieldSchema.parse(value);
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const resetFormAndClose = () => {
    onClose();
    setFormData({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      passengerCount: 1,
      travelDate: "",
      notes: "",
      paymentMethod: "",
      passengerDetails: {
        name: "",
        passportNumber: "",
        dateOfBirth: "",
        nationality: "Bangladeshi",
      },
    });
    setPaymentType("full");
    setAdvanceAmount(0);
    setNumberOfInstallments(3);
    setBankTransactionNumber("");
    setBankScreenshot(null);
    setErrors({});
    setTouched({});
    setLoading(false);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field in bookingSchema.shape) {
      validateField(field as keyof FormErrors, formData[field as keyof typeof formData] as string | number);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading || paymentProcessing) {
      console.log("Blocking duplicate submission");
      return;
    }
    
    // For installment payments, payment method is not required
    const dataToValidate = paymentType === "installment" 
      ? { ...formData, paymentMethod: "installment" }
      : formData;
    
    // Validate all fields
    const result = bookingSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      // Don't show payment method error for installment type
      if (paymentType === "installment") {
        delete fieldErrors.paymentMethod;
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setTouched({ guestName: true, guestEmail: true, guestPhone: true, passengerCount: true });
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate bank transfer specific fields
    if (formData.paymentMethod === "bank_transfer") {
      const bankErrors: FormErrors = {};
      if (!bankTransactionNumber.trim()) {
        bankErrors.transactionNumber = "Transaction number is required";
      }
      if (!bankScreenshot) {
        bankErrors.screenshot = "Payment screenshot is required";
      }
      if (Object.keys(bankErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...bankErrors }));
        toast({
          title: "Validation Error",
          description: "Please provide transaction number and screenshot.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!package_info) return;

    setLoading(true);
    
    const totalPrice = package_info.price * formData.passengerCount;
    const isInstallment = paymentType === "installment";
    
    // Generate booking ID client-side to avoid SELECT after INSERT (RLS issue for guests)
    const bookingId = crypto.randomUUID();
    
    const { error } = await supabase.from("bookings").insert({
      id: bookingId,
      package_id: package_info.id,
      passenger_count: formData.passengerCount,
      travel_date: formData.travelDate || null,
      notes: formData.notes || null,
      passenger_details: formData.passengerDetails,
      total_price: totalPrice,
      guest_name: formData.guestName.trim(),
      guest_email: formData.guestEmail.trim() || null,
      guest_phone: formData.guestPhone.trim(),
      payment_method: isInstallment ? "installment" : formData.paymentMethod,
      payment_status: isInstallment ? "emi_pending" : (formData.paymentMethod === 'cash' ? 'pending_cash' : (formData.paymentMethod === 'bank_transfer' ? 'pending_verification' : 'pending')),
      bank_transaction_number: formData.paymentMethod === "bank_transfer" ? bankTransactionNumber.trim() : null,
    });

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create installment plan if selected
    if (isInstallment) {
      const remaining = totalPrice - advanceAmount;
      const installmentAmount = Math.ceil(remaining / numberOfInstallments);
      
      // Generate EMI payment ID client-side to avoid SELECT after INSERT (RLS issue for guests)
      const emiPaymentId = crypto.randomUUID();

      // Create installment payment plan without .select() to avoid RLS issues
      const { error: emiError } = await supabase
        .from("emi_payments")
        .insert({
          id: emiPaymentId,
          booking_id: bookingId,
          total_amount: totalPrice,
          advance_amount: advanceAmount,
          number_of_emis: numberOfInstallments,
          emi_amount: installmentAmount,
          paid_emis: advanceAmount > 0 ? 0 : 0, // Advance is separate from installments
          remaining_amount: remaining,
          is_emi_plan: true,
        });

      if (emiError) {
        console.error("Error creating installment plan:", emiError);
        toast({
          title: "Warning",
          description: "Booking created but installment plan setup failed. Please contact support.",
          variant: "destructive",
        });
      } else {
        // Small delay to ensure emi_payments record is fully committed before RLS check on installments
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create individual installments using the pre-generated ID
        const installmentsToCreate = [];
        const today = new Date();
        
        for (let i = 1; i <= numberOfInstallments; i++) {
          const dueDate = new Date(today);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          installmentsToCreate.push({
            emi_payment_id: emiPaymentId,
            installment_number: i,
            amount: i === numberOfInstallments ? remaining - (installmentAmount * (numberOfInstallments - 1)) : installmentAmount,
            due_date: dueDate.toISOString().split('T')[0],
            status: "pending" as const,
          });
        }

        const { error: installmentError } = await supabase.from("emi_installments").insert(installmentsToCreate);
        
        if (installmentError) {
          console.error("Error creating installments:", installmentError);
        }

        // Send installment plan notification
        supabase.functions.invoke("send-emi-notification", {
          body: {
            bookingId: bookingId,
            notificationType: "emi_plan_created",
            amount: installmentAmount,
            totalEmis: numberOfInstallments,
          }
        }).catch(err => console.error("Installment notification error:", err));
      }
    }

    // Store guest booking info for "My Bookings" access
    const { saveGuestBookingInfo } = await import("@/utils/guestBookingStorage");
    saveGuestBookingInfo(
      formData.guestEmail.trim(),
      formData.guestPhone.trim(),
      formData.guestName.trim(),
      bookingId
    );

    // Send booking confirmation notifications in background
    supabase.functions.invoke("send-booking-notification", {
      body: { bookingId: bookingId }
    }).catch(err => console.error("Notification error:", err));

    // Auto-create user account with phone number and send credentials via SMS/Email
    supabase.functions.invoke("create-guest-account", {
      body: {
        bookingId: bookingId,
        guestName: formData.guestName.trim(),
        guestPhone: formData.guestPhone.trim(),
        guestEmail: formData.guestEmail.trim() || undefined,
      }
    }).then(response => {
      if (response.data?.isNew) {
        console.log("Guest account created, credentials sent via SMS/Email");
      }
    }).catch(err => console.error("Account creation error:", err));

    // For installment bookings, redirect to confirmation page
    if (isInstallment) {
      onClose();
      navigate(`/booking/confirmation/${bookingId}`);
      return;
    }

    // Handle bank transfer - upload screenshot
    if (formData.paymentMethod === "bank_transfer" && bankScreenshot) {
      const fileExt = bankScreenshot.name.split(".").pop();
      const fileName = `${bookingId}/bank-transfer-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("booking-documents")
        .upload(fileName, bankScreenshot);

      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
      } else {
        // Get public URL and update booking
        const { data: urlData } = supabase.storage
          .from("booking-documents")
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          await supabase
            .from("bookings")
            .update({ bank_transfer_screenshot_url: urlData.publicUrl })
            .eq("id", bookingId);
        }
      }

      onClose();
      navigate(`/booking/confirmation/${bookingId}`);
      return;
    }

    // For cash payments, redirect to confirmation page
    if (formData.paymentMethod === "cash") {
      onClose();
      navigate(`/booking/confirmation/${bookingId}`);
      return;
    }

    // Initiate payment for full payment
    const paymentResult = await initiatePayment({
      bookingId: bookingId,
      paymentMethod: formData.paymentMethod,
      amount: totalPrice,
    });

    if (paymentResult.success) {
      // For redirect payments, the hook handles the redirect
      if (!paymentResult.redirectUrl) {
        resetFormAndClose();
      }
      // For online payments, the hook handles the redirect
    } else {
      toast({
        title: "Payment Initiation Failed",
        description: paymentResult.error || "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (!package_info) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Book {package_info.title}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to book your {package_info.type} package
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-lg p-4 mb-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">{package_info.title}</p>
              <p className="text-sm text-muted-foreground capitalize">{package_info.type} Package • {package_info.duration_days} Days</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(package_info.price)}
              </p>
              <p className="text-xs text-muted-foreground">per person</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengerCount" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Passengers
              </Label>
              <Input
                id="passengerCount"
                type="number"
                min="1"
                max="10"
                value={formData.passengerCount}
                onChange={(e) => setFormData({ ...formData, passengerCount: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Travel Date
              </Label>
              <Input
                id="travelDate"
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Info - Name and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestName" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestName"
                placeholder="Enter your full name"
                value={formData.guestName}
                onChange={(e) => {
                  setFormData({ ...formData, guestName: e.target.value });
                  if (touched.guestName) validateField("guestName", e.target.value);
                }}
                onBlur={() => handleBlur("guestName")}
                className={touched.guestName && errors.guestName ? "border-destructive" : ""}
              />
              {touched.guestName && errors.guestName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.guestName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.guestEmail}
                onChange={(e) => {
                  setFormData({ ...formData, guestEmail: e.target.value });
                  if (touched.guestEmail) validateField("guestEmail", e.target.value);
                }}
                onBlur={() => handleBlur("guestEmail")}
                className={touched.guestEmail && errors.guestEmail ? "border-destructive" : ""}
              />
              {touched.guestEmail && errors.guestEmail && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.guestEmail}
                </p>
              )}
            </div>
          </div>

          {/* Mobile Number - Mandatory */}
          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              value={formData.guestPhone}
              onChange={(e) => {
                setFormData({ ...formData, guestPhone: e.target.value });
                if (touched.guestPhone) validateField("guestPhone", e.target.value);
              }}
              onBlur={() => handleBlur("guestPhone")}
              className={`border-primary/30 focus:border-primary ${touched.guestPhone && errors.guestPhone ? "border-destructive" : ""}`}
            />
            {touched.guestPhone && errors.guestPhone && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guestPhone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                id="passportNumber"
                placeholder="AB1234567"
                value={formData.passengerDetails.passportNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  passengerDetails: { ...formData.passengerDetails, passportNumber: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.passengerDetails.dateOfBirth}
                onChange={(e) => setFormData({
                  ...formData,
                  passengerDetails: { ...formData.passengerDetails, dateOfBirth: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Payment Type Selection */}
          <div className="border-t pt-4 space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Option
            </Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(value: "full" | "installment") => setPaymentType(value)}
              className="grid grid-cols-2 gap-3"
            >
              <div className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${paymentType === "full" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer flex-1">
                  <span className="font-medium">Full Payment</span>
                  <p className="text-xs text-muted-foreground mt-1">Pay the total amount now</p>
                </Label>
              </div>
              <div className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${paymentType === "installment" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem value="installment" id="installment" />
                <Label htmlFor="installment" className="cursor-pointer flex-1">
                  <span className="font-medium">Installment</span>
                  <p className="text-xs text-muted-foreground mt-1">Pay in easy installments</p>
                </Label>
              </div>
            </RadioGroup>

            {/* Installment Options */}
            {paymentType === "installment" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 bg-muted/50 rounded-lg p-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advanceAmount" className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Advance Payment (৳)
                    </Label>
                    <Input
                      id="advanceAmount"
                      type="number"
                      min="0"
                      max={package_info.price * formData.passengerCount - 1}
                      value={advanceAmount === 0 ? "" : advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Optional upfront payment</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfInstallments">Number of Installments</Label>
                    <Select
                      value={numberOfInstallments.toString()}
                      onValueChange={(v) => setNumberOfInstallments(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? "Installment" : "Installments"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {(() => {
                  const totalAmount = package_info.price * formData.passengerCount;
                  const remaining = totalAmount - advanceAmount;
                  const perInstallment = numberOfInstallments > 0 
                    ? Math.ceil(remaining / numberOfInstallments) 
                    : 0;
                  
                  return (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Advance Payment:</span>
                        <span className="font-medium text-green-600">{formatCurrency(advanceAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Remaining Amount:</span>
                        <span className="font-medium">{formatCurrency(remaining)}</span>
                      </div>
                      <Separator />
                      <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-foreground">Per Installment:</span>
                          <span className="font-bold text-primary text-xl">
                            {formatCurrency(perInstallment)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {formatCurrency(perInstallment)} × {numberOfInstallments} installment(s) = {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <Separator />

                {/* Payment Method for Installment */}
                <PaymentMethodSelector
                  selectedMethod={formData.paymentMethod}
                  onSelect={(method) => {
                    setFormData({ ...formData, paymentMethod: method });
                    if (touched.paymentMethod) {
                      setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                    // Clear bank transfer errors when switching away
                    if (method !== "bank_transfer") {
                      setErrors(prev => ({ ...prev, transactionNumber: undefined, screenshot: undefined }));
                      setBankTransactionNumber("");
                      setBankScreenshot(null);
                    }
                  }}
                />
                {touched.paymentMethod && errors.paymentMethod && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" /> {errors.paymentMethod}
                  </p>
                )}

                {/* Bank Transfer Details for Installment */}
                {formData.paymentMethod === "bank_transfer" && bankDetails && (
                  <BankTransferDetails
                    bankDetails={bankDetails}
                    transactionNumber={bankTransactionNumber}
                    onTransactionNumberChange={(value) => {
                      setBankTransactionNumber(value);
                      if (errors.transactionNumber) {
                        setErrors(prev => ({ ...prev, transactionNumber: undefined }));
                      }
                    }}
                    screenshotFile={bankScreenshot}
                    onScreenshotChange={(file) => {
                      setBankScreenshot(file);
                      if (errors.screenshot) {
                        setErrors(prev => ({ ...prev, screenshot: undefined }));
                      }
                    }}
                    error={errors.transactionNumber || errors.screenshot}
                  />
                )}
              </motion.div>
            )}

            {/* Payment Method - Only for full payment */}
            {paymentType === "full" && (
              <>
                <PaymentMethodSelector
                  selectedMethod={formData.paymentMethod}
                  onSelect={(method) => {
                    setFormData({ ...formData, paymentMethod: method });
                    if (touched.paymentMethod) {
                      setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                    // Clear bank transfer errors when switching away
                    if (method !== "bank_transfer") {
                      setErrors(prev => ({ ...prev, transactionNumber: undefined, screenshot: undefined }));
                      setBankTransactionNumber("");
                      setBankScreenshot(null);
                    }
                  }}
                />
                {touched.paymentMethod && errors.paymentMethod && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" /> {errors.paymentMethod}
                  </p>
                )}

                {/* Bank Transfer Details */}
                {formData.paymentMethod === "bank_transfer" && bankDetails && (
                  <BankTransferDetails
                    bankDetails={bankDetails}
                    transactionNumber={bankTransactionNumber}
                    onTransactionNumberChange={(value) => {
                      setBankTransactionNumber(value);
                      if (errors.transactionNumber) {
                        setErrors(prev => ({ ...prev, transactionNumber: undefined }));
                      }
                    }}
                    screenshotFile={bankScreenshot}
                    onScreenshotChange={(file) => {
                      setBankScreenshot(file);
                      if (errors.screenshot) {
                        setErrors(prev => ({ ...prev, screenshot: undefined }));
                      }
                    }}
                    error={errors.transactionNumber || errors.screenshot}
                  />
                )}
              </>
            )}
          </div>

          <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {paymentType === "installment" ? "Advance to Pay Now" : "Total Amount"}
              </span>
              <span className="text-2xl font-bold text-secondary">
                {paymentType === "installment" 
                  ? formatCurrency(advanceAmount)
                  : formatCurrency(package_info.price * formData.passengerCount)
                }
              </span>
            </div>
            {paymentType === "full" && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.passengerCount} passenger(s) × {formatCurrency(package_info.price)}
              </p>
            )}
            {paymentType === "installment" && (
              <p className="text-xs text-muted-foreground mt-1">
                + {numberOfInstallments} due installments of {formatCurrency(Math.ceil(((package_info.price * formData.passengerCount) - advanceAmount) / numberOfInstallments))}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading || paymentProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={loading || paymentProcessing}
            >
              {loading || paymentProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {paymentProcessing ? "Processing Payment..." : "Creating Booking..."}
                </>
              ) : paymentType === "installment" ? (
                "Confirm Booking"
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
