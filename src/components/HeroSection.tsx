import { useState, useEffect, useCallback, useRef, lazy, Suspense, forwardRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
// Hero image is preloaded in index.html via <link rel="preload"> at /hero-kaaba.webp
const heroImage = "/hero-kaaba.webp";

// Lightweight `motion` shim — strips framer-motion-only props and renders plain
// elements. This removes ~80KB of JS off the mobile critical path (LCP/TBT win)
// while keeping existing JSX intact.
type AnyProps = Record<string, any>;
const stripMotionProps = ({ variants, initial, animate, exit, transition, whileHover, whileTap, whileInView, viewport, layout, layoutId, ...rest }: AnyProps) => rest;
const makeMotion = (tag: keyof JSX.IntrinsicElements) =>
  forwardRef<any, AnyProps>(function MotionShim(props, ref) {
    const Tag: any = tag;
    return <Tag ref={ref} {...stripMotionProps(props)} />;
  });
const motion = {
  div: makeMotion("div"),
  h1: makeMotion("h1"),
  p: makeMotion("p"),
  button: makeMotion("button"),
  span: makeMotion("span"),
  section: makeMotion("section"),
} as const;

// Lazy load non-critical components
const HeroServiceTiles = lazy(() => import("./HeroServiceTiles"));
const Dialog = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.Dialog })));
const DialogContent = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogContent })));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogTitle })));

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge_text?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  background_image_url?: string;
  video_url?: string;
  stats?: { number: string; label: string }[];
  slide_type?: string;
  order_index?: number;
}

// No default placeholder slide — we don't want a "first" hero with placeholder
// text flashing before the real CMS slide loads. The background image still
// shows immediately because it's preloaded from index.html and rendered as the
// section background regardless of whether slides have loaded.
const defaultSlides: HeroSlide[] = [];

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [enableTransition, setEnableTransition] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(3000);
  const [transitionDuration, setTransitionDuration] = useState(0.6);
  const [isHovered, setIsHovered] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"centered" | "split-screen">("split-screen");
  const [heroTheme, setHeroTheme] = useState<"dark" | "light">("dark");
  const [showServiceTiles, setShowServiceTiles] = useState(true);
  const [heroHeight, setHeroHeight] = useState<"60vh" | "70vh" | "80vh" | "100vh">("70vh");
  const [heroHeightMobile, setHeroHeightMobile] = useState<"50vh" | "60vh" | "70vh" | "80vh" | "100vh">("60vh");
  const [imageFocalPoint, setImageFocalPoint] = useState<"top" | "center" | "bottom">("center");
  const [heroTopMargin, setHeroTopMargin] = useState<string>("0");
  const [isMobile, setIsMobile] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Defer API calls until after first paint — hero image is already visible via
    // index.html bootstrap + preload; defaults match bootstrap height (70vh/60vh).
    const run = () => {
      fetchHeroContent();
      fetchSliderSettings();
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(run));
    } else {
      setTimeout(run, 0);
    }
  }, []);

  const fetchSliderSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "hero_autoplay_interval", 
        "hero_transition_speed", 
        "hero_layout_mode",
        "hero_theme",
        "hero_show_service_tiles",
        "hero_height",
        "hero_height_mobile",
        "hero_image_focal_point",
        "hero_top_margin"
      ]);

    if (data) {
      data.forEach((item) => {
        const value = String(item.setting_value).replace(/"/g, "");
        switch (item.setting_key) {
          case "hero_autoplay_interval":
            setAutoplayInterval((parseInt(value, 10) || 6) * 1000);
            break;
          case "hero_transition_speed":
            switch (value) {
              case "fast": setTransitionDuration(0.4); break;
              case "slow": setTransitionDuration(0.8); break;
              default: setTransitionDuration(0.6);
            }
            break;
          case "hero_layout_mode":
            setLayoutMode(value === "centered" ? "centered" : "split-screen");
            break;
          case "hero_theme":
            setHeroTheme(value === "light" ? "light" : "dark");
            break;
          case "hero_show_service_tiles":
            setShowServiceTiles(value !== "false");
            break;
          case "hero_height":
            if (value === "60vh" || value === "70vh" || value === "80vh" || value === "100vh") {
              setHeroHeight(value);
            }
            break;
          case "hero_height_mobile":
            if (value === "50vh" || value === "60vh" || value === "70vh" || value === "80vh" || value === "100vh") {
              setHeroHeightMobile(value);
            }
            break;
          case "hero_image_focal_point":
            if (value === "top" || value === "center" || value === "bottom") {
              setImageFocalPoint(value);
            }
            break;
          case "hero_top_margin":
            setHeroTopMargin(value);
            break;
        }
      });
    }
  };

  // Simplified autoplay with single timeout instead of 50ms interval
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1 || isHovered) {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      return;
    }
    
    autoplayRef.current = setTimeout(() => {
      setPrevSlide(currentSlide);
      setEnableTransition(true);
      // Always advance forward; allow going to slides.length (cloned first) so
      // the wrap from last → first slides in the same direction as 1 → 2 → 3.
      setCurrentSlide(curr => curr + 1);
    }, autoplayInterval);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [isAutoPlaying, slides.length, autoplayInterval, currentSlide, isHovered]);

  // After sliding to the cloned first slide, snap back to real index 0 without
  // animation so the next forward slide continues smoothly.
  useEffect(() => {
    if (slides.length === 0) return;
    if (currentSlide === slides.length) {
      const t = setTimeout(() => {
        setEnableTransition(false);
        setCurrentSlide(0);
        // Re-enable transition on next frame for subsequent slides.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEnableTransition(true));
        });
      }, transitionDuration * 1000);
      return () => clearTimeout(t);
    }
  }, [currentSlide, slides.length, transitionDuration]);

  const fetchHeroContent = async () => {
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });
    
    if (data && data.length > 0) {
      const formattedSlides = data.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle || undefined,
        description: item.description || undefined,
        badge_text: item.badge_text || undefined,
        primary_button_text: item.primary_button_text || undefined,
        primary_button_link: item.primary_button_link || undefined,
        secondary_button_text: item.secondary_button_text || undefined,
        secondary_button_link: item.secondary_button_link || undefined,
        background_image_url: item.background_image_url || undefined,
        video_url: item.video_url || undefined,
        stats: Array.isArray(item.stats) ? item.stats as { number: string; label: string }[] : undefined,
        slide_type: (item as any).slide_type || "general",
        order_index: (item as any).order_index || 0,
      }));
      setSlides(formattedSlides);
    }
  };

  const HeroSkeleton = () => (
    <div className="relative z-10 container text-center pt-32 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-64 rounded-full bg-primary-foreground/10" />
        </div>
        <div className="space-y-4 mb-8">
          <Skeleton className="h-16 md:h-20 w-3/4 mx-auto bg-primary-foreground/10" />
          <Skeleton className="h-12 md:h-16 w-1/2 mx-auto bg-secondary/20" />
        </div>
        <div className="space-y-3 mb-12">
          <Skeleton className="h-6 w-full max-w-2xl mx-auto bg-primary-foreground/10" />
          <Skeleton className="h-6 w-4/5 max-w-xl mx-auto bg-primary-foreground/10" />
        </div>
      </div>
    </div>
  );

  const goToSlide = useCallback((index: number) => {
    setPrevSlide(currentSlide);
    setEnableTransition(true);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentSlide]);

  const goToPrevious = useCallback(() => {
    setPrevSlide(currentSlide);
    setEnableTransition(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length, currentSlide]);

  const goToNext = useCallback(() => {
    setPrevSlide(currentSlide);
    setEnableTransition(true);
    setCurrentSlide((prev) => prev + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentSlide]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goToNext();
    else if (distance < -minSwipeDistance) goToPrevious();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    return url;
  };

  const isYouTubeUrl = (url: string) => url?.includes("youtube.com") || url?.includes("youtu.be");

  // Auto-upgrade local /images/*.jpg to .webp (smaller payload)
  const toWebp = (url?: string) => {
    if (!url) return url;
    if (url.startsWith("/images/") && /\.(jpe?g|png)$/i.test(url)) {
      return url.replace(/\.(jpe?g|png)$/i, ".webp");
    }
    return url;
  };
  // When at cloned-first position (currentSlide === slides.length), display real first slide content
  const displayIndex = slides.length > 0 ? currentSlide % slides.length : 0;
  const content = slides[displayIndex];
  const hasContent = !!content;
  const backgroundImage = toWebp(content?.background_image_url) || heroImage;
  const isLight = heroTheme === "light";

  // Simple fade animation for content - no complex exits
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  // Light theme text colors
  const textPrimary = isLight ? "text-foreground" : "text-primary-foreground";
  const textSecondary = isLight ? "text-muted-foreground" : "text-primary-foreground/85";
  const textMuted = isLight ? "text-muted-foreground" : "text-primary-foreground/70";

  // Use responsive height
  const currentHeight = isMobile ? heroHeightMobile : heroHeight;
  const topMarginStyle = heroTopMargin !== "0" ? `${heroTopMargin}px` : "0";

  return (
    <section 
      id="home" 
      className={`relative flex items-center justify-center overflow-hidden ${isLight ? "bg-background" : ""}`}
      style={{ height: currentHeight, marginTop: topMarginStyle }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background - Conditional based on theme */}
      {isLight ? (
        /* Light Theme Background - Static decorations instead of infinite animations */
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-hero-light hero-light-pattern" />
          
          {/* Static geometric accents - removed infinite rotation */}
          <div className="absolute -top-32 -right-32 w-96 h-96 border border-emerald-200/40 rounded-full" />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] border border-amber-200/30 rounded-full" />

          {/* Static accent shapes */}
          <div className="absolute top-20 left-[15%] w-0 h-0 border-l-[40px] border-l-transparent border-b-[70px] border-b-emerald-500/20 border-r-[40px] border-r-transparent" />
          <div className="absolute bottom-32 right-[10%] w-0 h-0 border-l-[30px] border-l-transparent border-t-[50px] border-t-amber-400/25 border-r-[30px] border-r-transparent" />
          <div className="absolute top-1/3 right-[5%] w-16 h-16 bg-emerald-500/10 rounded-full" />
          <div className="absolute bottom-1/4 left-[8%] w-12 h-12 bg-amber-400/15 rounded-full" />
          
          {/* Background image with CSS transition instead of Framer Motion */}
          <div 
            className="absolute right-0 top-0 w-1/2 h-full opacity-10 transition-opacity duration-500"
            style={{ willChange: 'opacity' }}
          >
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: imageFocalPoint }}
              draggable={false}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background" />
          </div>
        </div>
      ) : (
        /* Dark Theme Background — smooth right-to-left slide between hero images */
        <div className="absolute inset-0 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-900/90 z-[1]" />

          {/* Sliding track: all slide images sit side-by-side and translate left
              when currentSlide changes. We append a clone of the first slide at
              the end so the wrap from last → first slides forward in the same
              direction (no reverse rewind). After landing on the clone, we snap
              back to index 0 without animation. */}
          {(() => {
            const baseSlides = slides.length > 0
              ? slides
              : [{ id: "default", background_image_url: undefined } as HeroSlide];
            const trackSlides = slides.length > 1
              ? [...baseSlides, { ...baseSlides[0], id: `${baseSlides[0].id}-clone` }]
              : baseSlides;
            const trackCount = trackSlides.length;
            return (
              <div
                className="absolute inset-0 z-[2] flex h-full ease-out"
                style={{
                  width: `${trackCount * 100}%`,
                  transform: `translateX(-${currentSlide * (100 / trackCount)}%)`,
                  transition: enableTransition
                    ? `transform ${transitionDuration}s cubic-bezier(0.45, 0, 0.15, 1)`
                    : "none",
                  willChange: "transform",
                }}
              >
                {trackSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="relative h-full flex-shrink-0"
                    style={{ width: `${100 / trackCount}%` }}
                  >
                    <img
                      src={toWebp(slide.background_image_url) || heroImage}
                      srcSet={!slide.background_image_url ? "/hero-kaaba-mobile.webp 768w, /hero-kaaba.webp 1280w" : undefined}
                      sizes="100vw"
                      alt="Hero background"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: imageFocalPoint }}
                      draggable={false}
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "low"}
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent z-[3]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-transparent to-primary/60 z-[3]" />
        </div>
      )}


      {/* Content - Conditional Layout. Render nothing until CMS slides have loaded
          so we don't flash placeholder text/badges/stats over the hero image. */}
      {!hasContent ? null : isLoading ? (
        <HeroSkeleton />
      ) : layoutMode === "centered" ? (
        /* Full-Width Centered Layout */
        <div className={`relative z-10 container text-center pt-48 md:pt-52 lg:pt-56 pb-20 ${textPrimary}`}>
          <motion.div
            key={`content-centered-${displayIndex}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
            >
              {/* Badge */}
              {content.badge_text && (
                <motion.div variants={itemVariants} className="mb-8">
                  <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium border shadow-lg
                    ${isLight 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-secondary/15 text-secondary border-secondary/25 backdrop-blur-md shadow-secondary/10"
                    }`}>
                    <Star className={`w-4 h-4 ${isLight ? "text-emerald-600" : ""} fill-current`} />
                    {content.badge_text}
                  </span>
                </motion.div>
              )}
              
              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className={`font-calligraphy text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-snug tracking-wide overflow-visible ${textPrimary}`}
                style={{ textShadow: isLight ? 'none' : '0 2px 24px rgba(201, 162, 39, 0.4), 0 0 50px rgba(201, 162, 39, 0.15)' }}
              >
                <span className="inline-block">{content.title}</span>
                {content.subtitle && (
                  <span className={`block mt-4 sm:mt-6 font-kufi pb-2 text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${isLight ? "text-emerald-600" : "text-gradient-gold"}`}>
                    {content.subtitle}
                  </span>
                )}
              </motion.h1>
              
              {/* Description */}
              <motion.p
                variants={itemVariants}
                className={`text-sm xs:text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0 ${textSecondary}`}
              >
                {content.description}
              </motion.p>

              {/* Service Tiles */}
              {showServiceTiles && (
                <motion.div variants={itemVariants} className="mb-10">
                  <Suspense fallback={<div className="h-16 animate-pulse bg-muted/20 rounded-lg" />}>
                    <HeroServiceTiles theme={heroTheme} />
                  </Suspense>
                </motion.div>
              )}

              {/* Video CTA */}
              {content.video_url && (
                <motion.button
                  variants={itemVariants}
                  onClick={() => setIsVideoOpen(true)}
                  className={`inline-flex items-center gap-3 transition-colors group ${textMuted} hover:${textPrimary}`}
                >
                  <span className={`w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110
                    ${isLight 
                      ? "bg-white border border-slate-200 group-hover:border-emerald-300" 
                      : "bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 group-hover:bg-primary-foreground/20 group-hover:border-secondary/40"
                    }`}>
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </span>
                  <span className="font-medium">Watch Video</span>
                </motion.button>
              )}

              {/* Stats */}
              {content.stats && content.stats.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t ${isLight ? "border-slate-200" : "border-primary-foreground/15"}`}
                >
                  {content.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center group cursor-default"
                    >
                      <div className={`font-kufi text-4xl md:text-5xl font-bold mb-2 ${isLight ? "text-emerald-600" : "text-secondary"}`}>
                        {stat.number}
                      </div>
                      <div className={`text-sm md:text-base ${textMuted}`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
        </div>
      ) : (
        /* Split-Screen Layout */
        <div className="relative z-10 w-full min-h-screen flex items-center pt-32 md:pt-36 lg:pt-40">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 items-center">
              {/* Content - Full width (right-side framed image removed) */}
              <motion.div
                key={`content-${displayIndex}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`text-center ${textPrimary}`}
              >
                  {/* Badge */}
                  {content.badge_text && (
                    <motion.div variants={itemVariants} className="mb-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-lg
                        ${isLight 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-secondary/15 text-secondary border-secondary/25 backdrop-blur-md shadow-secondary/10"
                        }`}>
                        <Star className={`w-3.5 h-3.5 ${isLight ? "text-emerald-600" : ""} fill-current`} />
                        {content.badge_text}
                      </span>
                    </motion.div>
                  )}
                  
                  {/* Title */}
                  <motion.h1
                    variants={itemVariants}
                    className={`font-calligraphy text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-4 leading-snug tracking-wide overflow-visible ${textPrimary}`}
                    style={{ textShadow: isLight ? 'none' : '0 2px 24px rgba(201, 162, 39, 0.4), 0 0 50px rgba(201, 162, 39, 0.15)' }}
                  >
                    <span className="inline-block">{content.title}</span>
                    {content.subtitle && (
                      <span className={`block mt-4 sm:mt-6 font-kufi pb-1 text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl ${isLight ? "text-emerald-600" : "text-gradient-gold"}`}>
                        {content.subtitle}
                      </span>
                    )}
                  </motion.h1>
                  
                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    className={`text-sm xs:text-base md:text-lg max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed ${textSecondary}`}
                  >
                    {content.description}
                  </motion.p>

                  {/* Service Tiles - Compact for split view */}
                  {showServiceTiles && (
                    <motion.div variants={itemVariants} className="mb-8">
                      <Suspense fallback={<div className="h-16 animate-pulse bg-muted/20 rounded-lg" />}>
                        <HeroServiceTiles theme={heroTheme} />
                      </Suspense>
                    </motion.div>
                  )}

                  {/* Video CTA */}
                  {content.video_url && (
                    <motion.button
                      variants={itemVariants}
                      onClick={() => setIsVideoOpen(true)}
                      className={`inline-flex items-center gap-3 transition-colors group mb-8 ${textMuted}`}
                    >
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110
                        ${isLight 
                          ? "bg-white border border-slate-200 group-hover:border-emerald-300" 
                          : "bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 group-hover:bg-primary-foreground/20 group-hover:border-secondary/40"
                        }`}>
                        <Play className="w-4 h-4 fill-current mx-auto.5" />
                      </span>
                      <span className="font-medium text-sm">Watch Video</span>
                    </motion.button>
                  )}

                  {/* Stats - Compact */}
                  {content.stats && content.stats.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className={`flex flex-wrap gap-6 pt-6 border-t ${isLight ? "border-slate-200" : "border-primary-foreground/15"}`}
                    >
                      {content.stats.slice(0, 3).map((stat) => (
                        <div
                          key={stat.label}
                          className="text-center group cursor-default"
                        >
                          <div className={`font-kufi text-2xl md:text-3xl font-bold mb-1 ${isLight ? "text-emerald-600" : "text-secondary"}`}>
                            {stat.number}
                          </div>
                          <div className={`text-xs md:text-sm ${textMuted}`}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal - Lazy Loaded */}
      {isVideoOpen && (
        <Suspense fallback={null}>
          <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
            <DialogContent className="max-w-4xl mx-auto p-0 bg-black border-none">
              <DialogTitle className="sr-only">Watch Video</DialogTitle>
              <div className="relative aspect-video">
                {content.video_url && isYouTubeUrl(content.video_url) ? (
                  <iframe
                    src={isVideoOpen ? getEmbedUrl(content.video_url) : ""}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : content.video_url ? (
                  <video src={content.video_url} controls autoPlay className="w-full h-full" />
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>
      )}

      {/* Slider arrow controls — show only when more than one slide is loaded */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === displayIndex ? "w-6 bg-secondary" : "w-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
