import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, User, LogOut, LayoutDashboard, MapPin, MessageCircle, Package, ClipboardList, Globe, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { getTenantPackages } from "@/lib/tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/currency";
import { hasGuestBookings } from "@/utils/guestBookingStorage";
import companyLogo from "@/assets/company-logo.webp";
// Heavy modals (react-hook-form + zod + radix dialog) — lazy-load to keep mobile LCP fast
const BookingModal = lazy(() => import("./BookingModal"));
const VisaApplicationModal = lazy(() => import("./VisaApplicationModal"));

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
}

interface PackageItem {
  id: string;
  title: string;
  price: number;
  type: "hajj" | "umrah";
  duration_days: number;
}

interface VisaCountry {
  id: string;
  country_name: string;
  flag_emoji: string;
  processing_time: string;
  price: number;
}

const ANNOUNCEMENT_DISMISSED_KEY = "smEliteHajj_announcementDismissed";

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "1", label: "Services", href: "#services", order_index: 0 },
  { id: "2", label: "Hajj Packages", href: "#hajj", order_index: 1 },
  { id: "3", label: "Umrah Packages", href: "#umrah", order_index: 2 },
  { id: "4", label: "Visa Services", href: "#visa", order_index: 3 },
  { id: "5", label: "Our Team", href: "#team", order_index: 4 },
  { id: "6", label: "Testimonials", href: "#testimonials", order_index: 5 },
  { id: "7", label: "FAQ", href: "#faq", order_index: 6 },
  { id: "8", label: "Contact", href: "#contact", order_index: 7 },
];

const idle = (cb: () => void) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback(cb, { timeout: 4000 });
  } else {
    setTimeout(cb, 2000);
  }
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === 'true';
    }
    return false;
  });
  const { user, canAccessAdmin, signOut } = useAuth();
  const { companyInfo, contactDetails, appearance } = useSiteSettings();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [visaCountries, setVisaCountries] = useState<VisaCountry[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [selectedVisaCountry, setSelectedVisaCountry] = useState<VisaCountry | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);

  // Check if user has bookings (logged in or guest)
  useEffect(() => {
    setShowMyBookings(!!user || hasGuestBookings());
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Defer non-critical header data until after first paint
    idle(() => {
      fetchMenuItems();
      fetchPackages();
      fetchVisaCountries();
    });
  }, []);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    
    if (data && data.length > 0) {
      setMenuItems(data);
    }
  };

  const fetchPackages = async () => {
    const { data } = await getTenantPackages({
      select: "id, title, price, type, duration_days",
      activeOnly: true,
    });

    if (data) {
      // Filter show_book_now client-side since getTenantPackages doesn't handle it
      setPackages(data.filter((p: any) => p.show_book_now !== false));
    }
  };

  const fetchVisaCountries = async () => {
    const { data } = await supabase
      .from("visa_countries")
      .select("id, country_name, flag_emoji, processing_time, price")
      .eq("is_active", true)
      .order("order_index");
    
    if (data) {
      setVisaCountries(data);
    }
  };

  const handleBookPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
    setIsMenuOpen(false);
  };

  // Refresh showMyBookings when booking modal closes (in case a new booking was made)
  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedPackage(null);
    // Check again for guest bookings
    setShowMyBookings(!!user || hasGuestBookings());
  };

  const handleApplyVisa = (country: VisaCountry) => {
    setSelectedVisaCountry(country);
    setIsVisaModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleVisaModalClose = () => {
    setIsVisaModalOpen(false);
    setSelectedVisaCountry(null);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    
    // Check if we're on the homepage
    if (window.location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Navigate to homepage with hash
      navigate('/#' + targetId);
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const logoSrc = companyInfo.logo_url || companyLogo;

  const showAnnouncement = appearance.show_announcement_bar && appearance.announcement_text && !announcementDismissed;

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    sessionStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, 'true');
  };

  return (
    <>
      {/* Announcement Bar */}
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-secondary text-secondary-foreground py-2 text-sm font-medium animate-fade-down">
          <div className="container flex items-center justify-center gap-2 relative">
            <span>📢</span>
            <span>{appearance.announcement_text}</span>
            <button 
              onClick={dismissAnnouncement}
              className="absolute right-0 p-1 hover:bg-secondary-foreground/10 rounded transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <header className={`fixed left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-elegant transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''} ${showAnnouncement ? 'top-[36px]' : 'top-0'}`}>
        {/* Top Bar - Hide when scrolled */}
        <div className={`bg-primary text-primary-foreground overflow-hidden transition-all duration-300 ${isScrolled ? 'h-0 py-0' : 'h-auto py-2'}`}>
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2 text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <a href={`tel:${contactDetails.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">{contactDetails.phone}</span>
              </a>
              <a href={`mailto:${contactDetails.email}`} className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">{contactDetails.email}</span>
              </a>
              <a 
                href={`https://wa.me/${contactDetails.whatsapp?.replace(/[^0-9]/g, '') || '8801867666888'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>
            </div>
            <div className="text-secondary font-medium text-xs sm:text-sm text-center leading-tight">
              {companyInfo.description}
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav className={`container transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <img 
                src={logoSrc} 
                alt={companyInfo.name} 
                className={`object-contain ring-2 ring-primary/20 rounded-lg p-1 bg-white shadow-elegant group-hover:ring-primary/40 transition-all duration-300 ${isScrolled ? 'h-10 w-auto' : 'h-12 sm:h-14 w-auto'}`}
              />
              <span className={`font-calligraphy font-bold text-primary group-hover:text-primary/80 transition-all duration-300 ${isScrolled ? 'text-base sm:text-xl' : 'text-lg sm:text-2xl'}`}>
                {companyInfo.name}
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              {menuItems.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-foreground hover:text-primary text-sm xl:text-base font-medium transition-colors relative group cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              <Link to="/track-order">
                <Button variant="outline" size="sm" className="gap-1.5 text-sm px-3 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden xl:inline">Track Order</span>
                  <span className="xl:hidden">Track</span>
                </Button>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border shadow-lg z-[100]">
                    {canAccessAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {!canAccessAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                          <ClipboardList className="w-4 h-4 mr-2" />
                          My Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/profile")}>
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-down max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-4">
                {menuItems.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    className="text-foreground hover:text-primary font-medium py-2"
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                  <Link to="/track-order" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <MapPin className="w-4 h-4" />
                      Track Order
                    </Button>
                  </Link>
                  {user ? (
                    <>
                      {!canAccessAdmin && (
                        <>
                          <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full gap-2">
                              <ClipboardList className="w-4 h-4" />
                              My Bookings
                            </Button>
                          </Link>
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full gap-2">
                              <Settings className="w-4 h-4" />
                              Profile Settings
                            </Button>
                          </Link>
                        </>
                      )}
                      {canAccessAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedPackage && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleBookingModalClose}
            package_info={{
              id: selectedPackage.id,
              title: selectedPackage.title,
              price: selectedPackage.price,
              type: selectedPackage.type,
              duration_days: selectedPackage.duration_days,
            }}
          />
        </Suspense>
      )}

      {/* Visa Application Modal */}
      {isVisaModalOpen && (
        <Suspense fallback={null}>
          <VisaApplicationModal
            isOpen={isVisaModalOpen}
            onClose={handleVisaModalClose}
            country={selectedVisaCountry}
          />
        </Suspense>
      )}
    </>
  );
};

export default Header;