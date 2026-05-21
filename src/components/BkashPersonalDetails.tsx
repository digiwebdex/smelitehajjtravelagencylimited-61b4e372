import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BkashPersonalInfo {
  account_name?: string;
  mobile_number: string;
  account_type?: string; // Personal | Agent | Merchant
  instructions?: string;
}

interface Props {
  details: BkashPersonalInfo;
  transactionNumber: string;
  onTransactionNumberChange: (value: string) => void;
  screenshotFile: File | null;
  onScreenshotChange: (file: File | null) => void;
  error?: string;
}

const BkashPersonalDetails = ({
  details,
  transactionNumber,
  onTransactionNumberChange,
  screenshotFile,
  onScreenshotChange,
  error,
}: Props) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    onScreenshotChange(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    onScreenshotChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const rows: { label: string; value?: string; key: string }[] = [
    { label: "bKash Number", value: details.mobile_number, key: "mobile_number" },
    { label: "Account Name", value: details.account_name, key: "account_name" },
  ].filter((r) => r.value);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4"
    >
      <Card className="border-pink-500/30 bg-pink-500/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-pink-600 font-semibold">
              <Smartphone className="w-5 h-5" />
              bKash Payment Details
            </div>
            {details.account_type && (
              <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/30">
                {details.account_type}
              </Badge>
            )}
          </div>
          <Separator />
          <div className="grid gap-2">
            {rows.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between bg-background rounded-lg px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium truncate">{item.value}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => copy(item.value!, item.key)}
                >
                  {copiedField === item.key ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          {details.instructions ? (
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {details.instructions}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Send Money to this bKash number, then enter the Transaction ID (TrxID) and upload the screenshot.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="bkashTrxId" className="flex items-center gap-2">
          Transaction ID (TrxID) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="bkashTrxId"
          placeholder="e.g. 9F7A2B3C4D"
          value={transactionNumber}
          onChange={(e) => onTransactionNumberChange(e.target.value)}
          className={error ? "border-destructive" : ""}
        />
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Payment Screenshot <span className="text-destructive">*</span>
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <AnimatePresence mode="wait">
          {!screenshotFile ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed flex flex-col items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload bKash payment screenshot
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-lg border overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 bg-muted/50">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Payment screenshot" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{screenshotFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(screenshotFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={removeScreenshot}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BkashPersonalDetails;
