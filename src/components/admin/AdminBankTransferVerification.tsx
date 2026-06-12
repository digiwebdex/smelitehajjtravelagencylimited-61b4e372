import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import {
  Building,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  Hash,
} from "lucide-react";

interface BankTransferBooking {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  total_price: number;
  created_at: string;
  bank_transaction_number: string | null;
  bank_transfer_screenshot_url: string | null;
  packages: {
    title: string;
    type: string;
  };
}

interface AdminBankTransferVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BankTransferBooking | null;
  onVerified: () => void;
}

const AdminBankTransferVerification = ({
  isOpen,
  onClose,
  booking,
  onVerified,
}: AdminBankTransferVerificationProps) => {
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;

  const sendNotification = async (notificationType: "payment_verified" | "payment_rejected", rejectionReason?: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          bookingId: booking.id,
          notificationType,
          rejectionReason,
        },
      });

      if (error) throw error;
      console.log("Notification result:", result);
      
      if (result.results?.email?.sent || result.results?.sms?.sent) {
        toast({
          title: "Notification Sent",
          description: "Customer has been notified about the payment status.",
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't block the main flow if notification fails
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
          transaction_id: `BANK-${booking.bank_transaction_number || Date.now()}`,
        })
        .eq("id", booking.id);

      if (error) throw error;

      // Send notification to customer
      await sendNotification("payment_verified");

      toast({
        title: "Payment Verified",
        description: "Bank transfer payment has been approved and booking confirmed.",
      });

      onVerified();
      onClose();
    } catch (error: any) {
      console.error("Error approving payment:", error);
      toast({
        title: "Error",
        description: "Failed to approve payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the payment.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          admin_notes: `Payment rejected: ${rejectionReason}`,
        })
        .eq("id", booking.id);

      if (error) throw error;

      // Send notification to customer
      await sendNotification("payment_rejected", rejectionReason);

      toast({
        title: "Payment Rejected",
        description: "Bank transfer payment has been rejected.",
      });

      onVerified();
      onClose();
      setRejectionReason("");
      setShowRejectForm(false);
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      toast({
        title: "Error",
        description: "Failed to reject payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !processing && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Verify Bank Transfer Payment
          </DialogTitle>
          <DialogDescription>
            Review the payment details and screenshot before approving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <Badge variant="outline" className="font-mono">
                #{booking.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{booking.guest_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{booking.guest_phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{booking.guest_email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(booking.created_at), "dd MMM yyyy, HH:mm")}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{booking.packages.title}</span>
                <Badge variant="secondary" className="capitalize text-xs">
                  {booking.packages.type}
                </Badge>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(booking.total_price)}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Transaction Details
            </h4>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Number</span>
                <span className="font-mono font-semibold text-lg">
                  {booking.bank_transaction_number || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Screenshot */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Payment Screenshot
            </h4>
            {booking.bank_transfer_screenshot_url ? (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={booking.bank_transfer_screenshot_url}
                  alt="Payment screenshot"
                  className="w-full max-h-96 object-contain bg-muted"
                />
                <div className="p-2 bg-muted/50 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(booking.bank_transfer_screenshot_url!, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Full Size
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No screenshot uploaded</p>
              </div>
            )}
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="space-y-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertTriangle className="w-4 h-4" />
                Reject Payment
              </div>
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejecting this payment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showRejectForm && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowRejectForm(true)}
                disabled={processing}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleApprove}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Approve Payment
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBankTransferVerification;
