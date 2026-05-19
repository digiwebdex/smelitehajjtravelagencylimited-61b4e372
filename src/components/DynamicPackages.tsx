import { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, ArrowUpDown, ChevronUp, Eye, GitCompare, X, Moon } from "lucide-react";
import MakkahIcon from "./icons/MakkahIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookingModal from "./BookingModal";
import PackageDetailsModal from "./PackageDetailsModal";
import PackageComparisonDrawer from "./PackageComparisonDrawer";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getTenantPackages } from "@/lib/tenant";

interface Package {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  type: string;
  price: number;
  duration_days: number;
  includes: string[] | null;
  exclusions: string[] | null;
  hotel_rating: number | null;
  hotel_type: string | null;
  hotel_image_url: string | null;
  hotel_images: string[] | null;
  hotel_map_link: string | null;
  transport_type: string | null;
  flight_type: string | null;
  special_notes: string | null;
  stock: number;
  show_view_details: boolean;
  show_book_now: boolean;
  pdf_url: string | null;
}

interface DynamicPackagesProps {
  type: "hajj" | "umrah";
}

type SortOption = "default" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc" | "rating-desc";

const VISIBLE_FEATURES_COUNT = 6;

// Expandable Package Card Component
const ExpandablePackageCard = ({ 
  pkg, 
  index, 
  onBookNow,
  onViewDetails,
  isCompareSelected,
  onCompareToggle,
  compareDisabled
}: { 
  pkg: Package; 
  index: number; 
  onBookNow: (pkg: Package) => void;
  onViewDetails: (pkg: Package) => void;
  isCompareSelected: boolean;
  onCompareToggle: (pkg: Package) => void;
  compareDisabled: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const features = pkg.includes || [];
  const hasMoreFeatures = features.length > VISIBLE_FEATURES_COUNT;
  const visibleFeatures = isExpanded ? features : features.slice(0, VISIBLE_FEATURES_COUNT);
  const remainingCount = features.length - VISIBLE_FEATURES_COUNT;

  return (
    <motion.div
      key={pkg.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        boxShadow: "0 12px 32px -8px rgba(0, 0, 0, 0.15)"
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: { duration: 0.2 },
        y: { duration: 0.2 },
        boxShadow: { duration: 0.2 }
      }}
      className={cn(
        "w-full xs:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex cursor-pointer relative h-auto",
        isCompareSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Gradient glow effect on hover */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-70 transition-opacity duration-500 -z-10" />
      
      <Card className="h-full w-full flex flex-col overflow-hidden transition-all duration-300 group border-border/50 bg-card relative z-10 min-h-[480px] xs:min-h-[520px] sm:min-h-[580px] lg:min-h-[620px]">
          {/* Compare Checkbox */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
            <div 
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-sm transition-opacity",
                !isCompareSelected && "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                id={`compare-${pkg.id}`}
                checked={isCompareSelected}
                onCheckedChange={() => onCompareToggle(pkg)}
                disabled={compareDisabled && !isCompareSelected}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5 sm:h-4 sm:w-4"
              />
              <label 
                htmlFor={`compare-${pkg.id}`} 
                className="text-[10px] sm:text-xs font-medium cursor-pointer text-foreground hidden xs:inline"
              >
                Compare
              </label>
            </div>
          </div>

          {/* Header with gradient and decorative elements */}
          <CardHeader className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-4 sm:p-6 pb-12 sm:pb-14 overflow-hidden">
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{ animationTimingFunction: 'ease-in-out' }}
              />
            </div>
            
            {/* Decorative Islamic geometric pattern with pulse animations */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 border-[3px] border-white/40 rounded-full -translate-y-1/2 translate-x-1/2 animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute top-4 right-4 w-16 sm:w-20 h-16 sm:h-20 border-[2px] border-white/30 rounded-full animate-[pulse_5s_ease-in-out_infinite_0.5s]" />
              <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 border-[2px] border-white/20 rounded-full translate-y-1/2 -translate-x-1/2 animate-[pulse_4.5s_ease-in-out_infinite_1s]" />
              
              {/* Rotating star patterns */}
              <svg className="absolute top-2 left-2 w-6 sm:w-8 h-6 sm:h-8 text-white/25 animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <svg className="absolute bottom-8 right-8 w-5 sm:w-6 h-5 sm:h-6 text-white/20 animate-[spin_25s_linear_infinite_reverse] hidden sm:block" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <svg className="absolute top-1/2 left-1/4 w-3 sm:w-4 h-3 sm:h-4 text-white/15 animate-[pulse_3s_ease-in-out_infinite_0.3s] hidden sm:block" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            
            {/* Mosque silhouette decorative element */}
            <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 opacity-[0.07]">
              <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
                <path fill="currentColor" d="M0,40 L0,30 Q10,30 10,25 L10,20 Q10,15 15,15 L15,10 Q15,5 20,5 Q25,5 25,10 L25,15 Q30,15 30,20 L30,25 Q30,30 40,30 L40,40 Z M50,40 L50,35 Q60,35 60,30 L60,25 Q60,20 65,20 L65,15 Q65,10 70,10 Q75,10 75,15 L75,20 Q80,20 80,25 L80,30 Q80,35 90,35 L90,40 Z M100,40 L100,25 Q110,25 110,20 L110,15 Q110,5 120,5 Q130,5 130,15 L130,20 Q130,25 140,25 L140,40 Z M150,40 L150,30 Q160,30 160,25 L160,20 Q160,15 165,15 L165,10 Q165,5 170,5 Q175,5 175,10 L175,15 Q180,15 180,20 L180,25 Q180,30 190,30 L190,40 Z" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Package type icon badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-secondary/90 flex items-center justify-center shadow-md">
                  {pkg.type === 'hajj' ? (
                    <MakkahIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
                  ) : (
                    <Moon className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-foreground fill-secondary-foreground" />
                  )}
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 uppercase text-[10px] sm:text-xs font-medium tracking-wide">
                  {pkg.type}
                </Badge>
              </div>
              
              <h3 className="font-display text-base sm:text-xl font-medium tracking-wide mb-2 sm:mb-3 text-white line-clamp-2">{pkg.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs">
                  {pkg.duration_days} Days
                </Badge>
                {pkg.hotel_rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: pkg.hotel_rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-secondary fill-secondary" />
                    ))}
                  </div>
                )}
                {pkg.stock < 10 && (
                  <Badge className="bg-secondary/80 text-secondary-foreground whitespace-nowrap text-[10px] sm:text-xs">
                    Only {pkg.stock} left
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Price badge */}
            <div className="absolute -bottom-4 sm:-bottom-5 right-3 sm:right-4 bg-secondary text-secondary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-gold z-10">
              <span className="text-lg sm:text-2xl font-bold">{formatCurrency(pkg.price)}</span>
              <span className="text-[10px] sm:text-xs block opacity-80">per person</span>
            </div>
          </CardHeader>

        <CardContent className="flex-1 pt-6 sm:pt-8 pb-3 sm:pb-4 px-3 sm:px-6">
          {pkg.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{pkg.description}</p>
          )}
          
          {features.length > 0 && (
            <ul className="space-y-1.5 sm:space-y-2">
              <AnimatePresence mode="sync">
                {visibleFeatures.map((item, i) => (
                  <motion.li 
                    key={item} 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: i < VISIBLE_FEATURES_COUNT ? 0 : 0.03 * (i - VISIBLE_FEATURES_COUNT) }}
                    className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-hidden"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* Expand/Collapse Button */}
          {hasMoreFeatures && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs sm:text-sm font-medium mt-2 sm:mt-3 text-primary hover:text-primary/80 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Show less
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-bold mr-1">+</span>
                  {remainingCount} more
                </>
              )}
            </motion.button>
          )}
        </CardContent>

        <CardFooter className="pt-0 px-3 sm:px-6 pb-3 sm:pb-4 flex flex-col gap-1.5 sm:gap-2">
          {pkg.show_view_details !== false && (
            <Button 
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(pkg);
              }}
              className="w-full group-hover:border-primary transition-colors text-xs sm:text-sm h-8 sm:h-9"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              View Details
            </Button>
          )}
          {pkg.show_book_now !== false && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookNow(pkg);
              }}
              className="w-full bg-gradient-primary hover:opacity-90 shadow-gold group-hover:scale-105 transition-transform text-xs sm:text-sm h-8 sm:h-9"
            >
              Book Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const DynamicPackages = ({ type }: DynamicPackagesProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparePackages, setComparePackages] = useState<Package[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  const MAX_COMPARE = 3;

  useEffect(() => {
    fetchPackages();
  }, [type]);

  const fetchPackages = async () => {
    const { data, error } = await getTenantPackages({
      type,
      activeOnly: true,
    });

    if (!error && data) {
      setPackages(data as Package[]);
    }
    setLoading(false);
  };

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "duration-asc":
          return a.duration_days - b.duration_days;
        case "duration-desc":
          return b.duration_days - a.duration_days;
        case "rating-desc":
          return (b.hotel_rating || 0) - (a.hotel_rating || 0);
        default:
          return 0;
      }
    });
  }, [packages, sortBy]);

  const handleBookNow = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(true);
  };

  const handleBookFromDetails = (pkg: Package) => {
    setIsDetailsModalOpen(false);
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  const handleCompareToggle = (pkg: Package) => {
    setComparePackages(prev => {
      const isSelected = prev.some(p => p.id === pkg.id);
      if (isSelected) {
        return prev.filter(p => p.id !== pkg.id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, pkg];
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setComparePackages(prev => prev.filter(p => p.id !== id));
  };

  const handleBookFromComparison = (pkg: Package) => {
    setIsComparisonOpen(false);
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-muted" />
            <CardContent className="space-y-3 pt-6">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No {type} packages available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      {/* Compare Bar - Fixed at bottom when packages selected */}
      <AnimatePresence>
        {comparePackages.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-3 sm:p-4"
          >
            <div className="container mx-auto flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {comparePackages.length}/{MAX_COMPARE} selected
                </Badge>
                <div className="flex items-center gap-2">
                  {comparePackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1">
                      <span className="text-sm font-medium truncate max-w-[100px]">{pkg.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-destructive/20"
                        onClick={() => handleRemoveFromCompare(pkg.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setComparePackages([])}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsComparisonOpen(true)}
                  disabled={comparePackages.length < 2}
                  className="bg-gradient-primary"
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare ({comparePackages.length})
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <p className="text-sm text-muted-foreground hidden sm:block">
          Select packages to compare (max {MAX_COMPARE})
        </p>
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background border">
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="duration-asc">Duration: Shortest</SelectItem>
              <SelectItem value="duration-desc">Duration: Longest</SelectItem>
              <SelectItem value="rating-desc">Rating: Highest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className={cn(
        "flex flex-wrap justify-center gap-6",
        comparePackages.length > 0 && "pb-24"
      )}>
        {sortedPackages.map((pkg, index) => (
          <ExpandablePackageCard
            key={pkg.id}
            pkg={pkg}
            index={index}
            onBookNow={handleBookNow}
            onViewDetails={handleViewDetails}
            isCompareSelected={comparePackages.some(p => p.id === pkg.id)}
            onCompareToggle={handleCompareToggle}
            compareDisabled={comparePackages.length >= MAX_COMPARE}
          />
        ))}
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        package_info={selectedPackage}
      />

      <PackageDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        package_info={selectedPackage}
        onBookNow={handleBookFromDetails}
      />

      <PackageComparisonDrawer
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        packages={comparePackages}
        onRemove={handleRemoveFromCompare}
        onBookNow={handleBookFromComparison}
      />
    </>
  );
};

export default DynamicPackages;
