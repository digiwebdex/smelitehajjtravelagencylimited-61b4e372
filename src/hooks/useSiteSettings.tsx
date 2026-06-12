import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  google_map_embed_url: string;
  savar_google_map_embed_url: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
}

export interface Appearance {
  primary_color: string;
  show_announcement_bar: boolean;
  announcement_text: string;
  show_book_now_button: boolean;
  show_mobile_cta_bar: boolean;
}

export interface SiteSettings {
  companyInfo: CompanyInfo;
  contactDetails: ContactDetails;
  socialLinks: SocialLinks;
  appearance: Appearance;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  companyInfo: {
    name: "SM Elite Hajj",
    tagline: "Your Trusted Partner for Sacred Journeys",
    description: "Government Approved Hajj & Umrah Agency",
    logo_url: "",
  },
  contactDetails: {
    email: "info@smelitehajj.com",
    phone: "+880 1234-567890",
    whatsapp: "+8801712345678",
    address: "Dhaka, Bangladesh",
    google_map_embed_url: "",
    savar_google_map_embed_url: "",
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
  },
  appearance: {
    primary_color: "#10b981",
    show_announcement_bar: false,
    announcement_text: "",
    show_book_now_button: true,
    show_mobile_cta_bar: true,
  },
  loading: false,
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const schedule = () => {
      const idle = (cb: () => void) => {
        if (typeof (window as any).requestIdleCallback === "function") {
          (window as any).requestIdleCallback(cb, { timeout: 3000 });
        } else {
          setTimeout(cb, 1500);
        }
      };
      idle(() => { fetchSettings(); });
    };
    // Defer until after window load so initial paint is never blocked by this fetch
    if (document.readyState === "complete") {
      setTimeout(schedule, 500);
    } else {
      window.addEventListener("load", () => setTimeout(schedule, 500), { once: true });
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) {
        console.error("Error fetching site settings:", error);
        setSettings(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data && data.length > 0) {
        const newSettings = { ...defaultSettings, loading: false };
        
        data.forEach((setting) => {
          const value = setting.setting_value as Record<string, unknown>;
          switch (setting.setting_key) {
            case "company_info":
              newSettings.companyInfo = value as unknown as CompanyInfo;
              break;
            case "contact_details":
              newSettings.contactDetails = value as unknown as ContactDetails;
              break;
            case "social_links":
              newSettings.socialLinks = value as unknown as SocialLinks;
              break;
            case "appearance":
              newSettings.appearance = value as unknown as Appearance;
              break;
          }
        });
        
        setSettings(newSettings);
      } else {
        setSettings(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      setSettings(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}