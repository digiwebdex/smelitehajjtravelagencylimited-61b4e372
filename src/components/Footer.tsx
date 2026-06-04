import { useState, useEffect, useRef, lazy, Suspense, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Phone, Mail, Facebook, Instagram, Youtube, Twitter, Building2, Building,
  Linkedin, MessageCircle, Send, Music, Globe, ExternalLink, Camera, Video, Rss, Twitch, Github
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import companyLogo from "@/assets/company-logo.webp";

// Lazy load non-critical decorative component
const FloatingIslamicPattern = lazy(() => import("./FloatingIslamicPattern"));

// Defer the heavy footer background video until the footer scrolls into view.
// This avoids downloading several MB of video on initial page load.
interface LazyFooterVideoProps {
  videoUrl: string;
  videoBlur: number;
  videoOpacity: number;
  videoScale: number;
  videoSpeed: number;
  videoOverlayColor: string;
  objectPosition: string;
}

const LazyFooterVideo = memo(({
  videoUrl,
  videoBlur,
  videoOpacity,
  videoScale,
  videoSpeed,
  videoOverlayColor,
  objectPosition,
}: LazyFooterVideoProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!containerRef.current || shouldLoad) return;
    const el = containerRef.current;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      {shouldLoad && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
          style={{
            filter: `blur(${videoBlur}px)`,
            opacity: videoOpacity / 100,
            transform: `scale(${videoScale / 100})`,
            objectPosition,
          }}
          ref={(el) => {
            if (el) el.playbackRate = videoSpeed;
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0" style={{ backgroundColor: videoOverlayColor }} />
    </div>
  );
});
LazyFooterVideo.displayName = "LazyFooterVideo";

interface FooterLink {
  label: string;
  href: string;
}

interface ServiceLink {
  label: string;
  href: string;
}

interface SocialNetwork {
  id: string;
  platform_name: string;
  icon_name: string;
  url: string;
  is_active: boolean;
  order_index: number;
}

interface FooterContent {
  company_description?: string;
  copyright_text?: string;
  quick_links: FooterLink[];
  services_links: ServiceLink[];
  contact_address?: string;
  contact_address_2?: string;
  address_label_1?: string;
  address_label_2?: string;
  contact_phones?: string[];
  contact_email?: string;
  contact_email_2?: string;
  video_url?: string;
  video_opacity?: number;
  video_enabled?: boolean;
  video_speed?: number;
  video_blur?: number;
  video_scale?: number;
  video_overlay_color?: string;
  video_position?: string;
}

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const { companyInfo, contactDetails, socialLinks } = useSiteSettings();
  
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [content, setContent] = useState<FooterContent>({
    company_description: "",
    copyright_text: "",
    quick_links: [
      { label: "Home", href: "#home" },
      { label: "Hajj Packages", href: "#hajj" },
      { label: "Umrah Packages", href: "#umrah" },
      { label: "Visa Services", href: "#visa" },
      { label: "Our Team", href: "#team" },
      { label: "Contact", href: "#contact" },
    ],
    services_links: [
      { label: "Hajj Packages", href: "#hajj" },
      { label: "Umrah Packages", href: "#umrah" },
      { label: "Visa Processing", href: "#visa" },
      { label: "Air Tickets", href: "#" },
      { label: "Hotel Booking", href: "#" },
      { label: "Travel Insurance", href: "#" },
    ],
    contact_address: "",
    contact_address_2: "",
    address_label_1: "Head Office",
    address_label_2: "Branch Office",
    contact_phones: [],
    contact_email: "",
    video_url: "/videos/footer-bg.mp4",
    video_opacity: 60,
    video_enabled: true,
    video_speed: 1.0,
    video_blur: 0.5,
    video_overlay_color: 'rgba(0, 0, 0, 0.5)',
    video_position: 'center',
    video_scale: 100,
  });

  useEffect(() => {
    // Defer footer DB fetches: footer is below the fold so it never affects LCP/TBT.
    const idle = (cb: () => void) => {
      if (typeof (window as any).requestIdleCallback === "function") {
        (window as any).requestIdleCallback(cb, { timeout: 2000 });
      } else {
        setTimeout(cb, 500);
      }
    };
    idle(() => {
      fetchFooterContent();
      fetchSocialNetworks();
    });
  }, []);

  const fetchSocialNetworks = async () => {
    const { data } = await supabase
      .from("social_networks")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    
    if (data) {
      setSocialNetworks(data);
    }
  };

  const fetchFooterContent = async () => {
    const { data } = await supabase
      .from("footer_content")
      .select("*")
      .limit(1)
      .maybeSingle();
    
    if (data) {
      const dataRecord = data as Record<string, unknown>;
      setContent({
        company_description: data.company_description || "",
        copyright_text: data.copyright_text || "",
        quick_links: Array.isArray(data.quick_links) ? (data.quick_links as unknown as FooterLink[]) : content.quick_links,
        services_links: Array.isArray(data.services_links) ? (data.services_links as unknown as ServiceLink[]) : content.services_links,
        contact_address: dataRecord.contact_address as string || "",
        contact_address_2: dataRecord.contact_address_2 as string || "",
        address_label_1: dataRecord.address_label_1 as string || "Head Office",
        address_label_2: dataRecord.address_label_2 as string || "Branch Office",
        contact_phones: Array.isArray(dataRecord.contact_phones) ? dataRecord.contact_phones as string[] : [],
        contact_email: dataRecord.contact_email as string || "",
        video_url: dataRecord.video_url as string || "/videos/footer-bg.mp4",
        video_opacity: (dataRecord.video_opacity as number) ?? 60,
        video_enabled: (dataRecord.video_enabled as boolean) ?? true,
        video_speed: (dataRecord.video_speed as number) ?? 1.0,
        video_blur: (dataRecord.video_blur as number) ?? 0.5,
        video_overlay_color: (dataRecord.video_overlay_color as string) ?? 'rgba(0, 0, 0, 0.5)',
        video_position: (dataRecord.video_position as string) ?? 'center',
        video_scale: (dataRecord.video_scale as number) ?? 100,
      });
    }
  };

  // Use site settings as fallback for footer content
  const displayDescription = content.company_description || companyInfo.tagline;
  const displayCopyright = content.copyright_text || `© ${currentYear} ${companyInfo.name}. All rights reserved.`;
  const displayAddress = content.contact_address || contactDetails.address;
  const displayAddress2 = content.contact_address_2 || "";
  const displayAddressLabel1 = content.address_label_1 || "Head Office";
  const displayAddressLabel2 = content.address_label_2 || "Branch Office";
  const displayPhones = content.contact_phones?.length ? content.contact_phones : [contactDetails.phone];
  const displayEmail = content.contact_email || contactDetails.email;
  const videoUrl = content.video_url || "/videos/footer-bg.mp4";
  const videoOpacity = content.video_opacity ?? 60;
  const videoEnabled = content.video_enabled ?? true;
  const videoSpeed = content.video_speed ?? 1.0;
  const videoBlur = content.video_blur ?? 0.5;
  const videoScale = content.video_scale ?? 100;
  const videoOverlayColor = content.video_overlay_color ?? 'rgba(0, 0, 0, 0.5)';
  const videoPosition = content.video_position ?? 'center';

  const getObjectPosition = () => {
    switch (videoPosition) {
      case 'top': return 'center top';
      case 'bottom': return 'center bottom';
      default: return 'center center';
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "Facebook":
        return Facebook;
      case "Instagram":
        return Instagram;
      case "Youtube":
        return Youtube;
      case "Twitter":
        return Twitter;
      case "Linkedin":
        return Linkedin;
      case "MessageCircle":
        return MessageCircle;
      case "Send":
        return Send;
      case "Music":
        return Music;
      case "Twitch":
        return Twitch;
      case "Github":
        return Github;
      case "Camera":
        return Camera;
      case "Video":
        return Video;
      case "Rss":
        return Rss;
      case "ExternalLink":
        return ExternalLink;
      default:
        return Globe;
    }
  };

  const logoSrc = companyInfo.logo_url || companyLogo;

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Video Animation - lazy mounted when footer enters viewport */}
      {videoEnabled && videoUrl && (
        <LazyFooterVideo
          videoUrl={videoUrl}
          videoBlur={videoBlur}
          videoOpacity={videoOpacity}
          videoScale={videoScale}
          videoSpeed={videoSpeed}
          videoOverlayColor={videoOverlayColor}
          objectPosition={getObjectPosition()}
        />
      )}
      
      {/* Floating Islamic Pattern Animation - Lazy Loaded */}
      <Suspense fallback={null}>
        <FloatingIslamicPattern />
      </Suspense>
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 geometric-pattern" />
      </div>

      <div className="container py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logoSrc} 
                alt={companyInfo.name} 
                className="h-24 w-auto object-contain bg-white/10 rounded-xl p-2"
              />
              <span className="font-calligraphy font-bold text-xl sm:text-2xl text-primary-foreground leading-tight">
                {companyInfo.name}
                <span className="block text-xs sm:text-sm font-normal text-secondary mt-1 italic">
                  Excellence in Every Step of Hajj
                </span>
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              {displayDescription}
            </p>
            {socialNetworks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialNetworks.map((network) => {
                  const Icon = getSocialIcon(network.icon_name);
                  return (
                    <a
                      key={network.id}
                      href={network.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-primary-foreground/10 rounded-xl flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                      aria-label={network.platform_name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Our Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Our Services
            </h4>
            <ul className="space-y-3">
              {content.services_links.map((service) => {
                const isExternalOrHash = service.href.startsWith('#') || service.href.startsWith('http');
                const isHashRoute = service.href.startsWith('/#');
                
                const handleClick = (e: React.MouseEvent) => {
                  if (isHashRoute) {
                    e.preventDefault();
                    const hash = service.href.substring(1); // Remove leading /
                    if (location.pathname !== '/') {
                      navigate('/' + hash);
                    } else {
                      const element = document.querySelector(hash);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }
                };
                
                if (!isExternalOrHash && !isHashRoute) {
                  // Internal route like /hotels
                  return (
                    <li key={service.label}>
                      <Link
                        to={service.href}
                        className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full group-hover:bg-secondary transition-colors" />
                        {service.label}
                      </Link>
                    </li>
                  );
                }
                
                return (
                  <li key={service.label}>
                    <a
                      href={isHashRoute ? service.href.substring(1) : service.href}
                      onClick={handleClick}
                      className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full group-hover:bg-secondary transition-colors" />
                      {service.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info - Addresses */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Contact Info
            </h4>
            <ul className="space-y-4">
              {displayAddress && (
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-primary-foreground/80 text-sm pt-1">
                    <span className="text-secondary font-medium text-xs uppercase tracking-wide">{displayAddressLabel1}</span>
                    <div className="mt-1">{displayAddress}</div>
                  </div>
                </li>
              )}
              {displayAddress2 && (
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-primary-foreground/80 text-sm pt-1">
                    <span className="text-secondary font-medium text-xs uppercase tracking-wide">{displayAddressLabel2}</span>
                    <div className="mt-1">{displayAddress2}</div>
                  </div>
                </li>
              )}
              {/* Email - Below Branch Office */}
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex flex-col gap-1 pt-2">
                  <a 
                    href={`mailto:${displayEmail}`}
                    className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors"
                  >
                    {displayEmail}
                  </a>
                  <a 
                    href="mailto:info@smelitehajj.com"
                    className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors"
                  >
                    info@smelitehajj.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info - Phone Numbers */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary" />
              Phone Numbers
            </h4>
            <ul className="space-y-3">
              {displayPhones.map((phoneSection, sectionIndex) => {
                const phones = phoneSection.split(',').map(p => p.trim()).filter(p => p);
                if (phones.length === 0) return null;
                
                return (
                  <li key={sectionIndex} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-primary-foreground/80 text-sm leading-relaxed">
                      {phones.map((phone, idx) => (
                        <span key={idx}>
                          <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-secondary transition-colors whitespace-nowrap">
                            {phone}
                          </a>
                          {idx < phones.length - 1 && <span className="text-primary-foreground/50">, </span>}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10 relative z-10">
        <div className="container py-4 sm:py-6 pb-20 lg:pb-6 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-primary-foreground/70 text-xs sm:text-sm text-center md:text-left">
            {displayCopyright}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <Link to="/legal/privacy-policy" className="text-primary-foreground/70 hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal/terms-of-service" className="text-primary-foreground/70 hover:text-secondary transition-colors">
              Terms of Service
            </Link>
            <Link to="/legal/refund-policy" className="text-primary-foreground/70 hover:text-secondary transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
        {/* Developer Credit */}
        <div className="border-t border-primary-foreground/5 relative z-10">
          <div className="container py-4 flex justify-center">
            <p className="text-primary-foreground/50 text-xs">
              Designed & Developed by{" "}
              <a 
                href="https://digiwebdex.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 transition-colors font-medium"
              >
                DigiWebDex
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;