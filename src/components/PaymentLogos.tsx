import React from "react";
import sslcommerzLogo from "@/assets/payment/sslcommerz-logo.png";
import bkashLogo from "@/assets/payment/bkash-logo.svg";
import nagadLogo from "@/assets/payment/nagad-logo.svg";

interface LogoProps {
  className?: string;
  size?: number;
}

export const SSLCommerzLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => (
  <img 
    src={sslcommerzLogo} 
    alt="SSLCommerz" 
    width={size * 2.5} 
    height={size}
    className={`object-contain ${className}`}
  />
);

export const BkashLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => (
  <img 
    src={bkashLogo} 
    alt="bKash" 
    width={size} 
    height={size}
    className={`object-contain ${className}`}
  />
);

export const NagadLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => (
  <img 
    src={nagadLogo} 
    alt="Nagad" 
    width={size} 
    height={size}
    className={`object-contain ${className}`}
  />
);

export const CashLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="12" fill="#22C55E" />
    <circle cx="50" cy="45" r="20" fill="#16A34A" />
    <text
      x="50"
      y="52"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="24"
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
    >
      ৳
    </text>
    <text
      x="50"
      y="78"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="600"
      fontFamily="system-ui, sans-serif"
    >
      CASH
    </text>
  </svg>
);

export const BankTransferLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="12" fill="#1E40AF" />
    <path
      d="M50 18L20 35V40H80V35L50 18Z"
      fill="#60A5FA"
    />
    <rect x="25" y="45" width="10" height="25" fill="#FFFFFF" />
    <rect x="45" y="45" width="10" height="25" fill="#FFFFFF" />
    <rect x="65" y="45" width="10" height="25" fill="#FFFFFF" />
    <rect x="20" y="72" width="60" height="8" rx="2" fill="#60A5FA" />
    <text
      x="50"
      y="92"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="8"
      fontWeight="600"
      fontFamily="system-ui, sans-serif"
    >
      BANK
    </text>
  </svg>
);

// Map slug to logo component
export const paymentLogoMap: Record<string, React.FC<LogoProps>> = {
  sslcommerz: SSLCommerzLogo,
  bkash: BkashLogo,
  bkash_personal: BkashLogo,
  nagad: NagadLogo,
  cash: CashLogo,
  bank_transfer: BankTransferLogo,
};
