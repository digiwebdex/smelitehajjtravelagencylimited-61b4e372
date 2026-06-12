import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Analytics/SEO — lazy so they never compete with homepage LCP
const AnalyticsTracker = lazy(() => import("@/components/AnalyticsTracker"));
const FacebookPixel = lazy(() => import("@/components/FacebookPixel"));
const DynamicSEOHead = lazy(() => import("@/components/DynamicSEOHead"));

// Route-level code splitting — keeps initial bundle small
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const TrackVisa = lazy(() => import("./pages/TrackVisa"));
const Hotels = lazy(() => import("./pages/Hotels"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PaymentResult = lazy(() => import("./pages/PaymentResult"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="sm-elite-hajj-theme">
      <AuthProvider>
        <SiteSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={null}>
                <AnalyticsTracker />
                <FacebookPixel />
                <DynamicSEOHead />
              </Suspense>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/track-visa" element={<TrackVisa />} />
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
                  <Route path="/legal/:pageKey" element={<LegalPage />} />
                  <Route path="/payment/success" element={<PaymentResult />} />
                  <Route path="/payment/failed" element={<PaymentResult />} />
                  <Route path="/payment/cancelled" element={<PaymentResult />} />
                  <Route path="/payment/callback" element={<PaymentResult />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
