import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentTenant } from "@/lib/tenant";
import { useAuth } from "@/hooks/useAuth";
import { ViewerModeProvider } from "@/contexts/ViewerModeContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp,
  ArrowLeft,
  LogOut,
  Wallet,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminAirTicketBookings from "@/components/admin/AdminAirTicketBookings";
import AdminAirTicketSettings from "@/components/admin/AdminAirTicketSettings";
import AdminPackages from "@/components/admin/AdminPackages";
import AdminPackageSections from "@/components/admin/AdminPackageSections";
import AdminRevenue from "@/components/admin/AdminRevenue";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminHero from "@/components/admin/AdminHero";
import AdminHeroServiceTiles from "@/components/admin/AdminHeroServiceTiles";
import AdminServices from "@/components/admin/AdminServices";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminTeam from "@/components/admin/AdminTeam";
import AdminFAQ from "@/components/admin/AdminFAQ";
import AdminVisa from "@/components/admin/AdminVisa";
import AdminVisaApplications from "@/components/admin/AdminVisaApplications";
import AdminContact from "@/components/admin/AdminContact";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminLegalPages from "@/components/admin/AdminLegalPages";
import AdminOfficeLocations from "@/components/admin/AdminOfficeLocations";
import AdminPaymentMethods from "@/components/admin/AdminPaymentMethods";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminSectionVisibility from "@/components/admin/AdminSectionVisibility";
import AdminEMIReport from "@/components/admin/AdminEMIReport";
import AdminNotices from "@/components/admin/AdminNotices";
import AdminStaffManagement from "@/components/admin/AdminStaffManagement";
import AdminSocialNetworks from "@/components/admin/AdminSocialNetworks";
import AdminBackupRestore from "@/components/admin/AdminBackupRestore";
import AdminReportsAnalytics from "@/components/admin/AdminReportsAnalytics";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import AdminPaymentReconciliation from "@/components/admin/AdminPaymentReconciliation";
import AdminNotificationRetry from "@/components/admin/AdminNotificationRetry";
import AdminNotificationTemplates from "@/components/admin/AdminNotificationTemplates";
import AdminBookingSettings from "@/components/admin/AdminBookingSettings";
import AdminLeadsManagement from "@/components/admin/AdminLeadsManagement";
import AdminMarketingAnalytics from "@/components/admin/AdminMarketingAnalytics";
import AdminTrafficStatus from "@/components/admin/AdminTrafficStatus";
import AdminLeadMagnets from "@/components/admin/AdminLeadMagnets";
import AdminReferrals from "@/components/admin/AdminReferrals";
import AdminAgents from "@/components/admin/AdminAgents";
import AdminCRMAutomation from "@/components/admin/AdminCRMAutomation";
import AdminGroupInquiries from "@/components/admin/AdminGroupInquiries";
import AdminFinancialAnalytics from "@/components/admin/AdminFinancialAnalytics";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminTranslations from "@/components/admin/AdminTranslations";
import AdminTransactionLogs from "@/components/admin/AdminTransactionLogs";
import AdminHajjiReports from "@/components/admin/AdminHajjiReports";
import AdminHotels from "@/components/admin/AdminHotels";
import AdminHotelBookings from "@/components/admin/AdminHotelBookings";
import AdminHotelSettings from "@/components/admin/AdminHotelSettings";
import AdminOfferPopup from "@/components/admin/AdminOfferPopup";
import AdminDemoAccount from "@/components/admin/AdminDemoAccount";
import AdminWebinars from "@/components/admin/AdminWebinars";
import AdminRetargetingSegments from "@/components/admin/AdminRetargetingSegments";
import AdminInstallmentReminders from "@/components/admin/AdminInstallmentReminders";
import AdminSEO from "@/components/admin/AdminSEO";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AccountingDashboard from "@/components/admin/accounting/AccountingDashboard";
import ChartOfAccounts from "@/components/admin/accounting/ChartOfAccounts";
import IncomeManagement from "@/components/admin/accounting/IncomeManagement";
import ExpenseManagement from "@/components/admin/accounting/ExpenseManagement";
import GeneralLedger from "@/components/admin/accounting/GeneralLedger";
import BankAccounts from "@/components/admin/accounting/BankAccounts";
import FinancialReports from "@/components/admin/accounting/FinancialReports";
import { formatCurrency } from "@/lib/currency";

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalPackages: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, isViewer, canAccessAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalPackages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!canAccessAdmin) {
        navigate("/");
      }
    }
  }, [user, canAccessAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && canAccessAdmin) {
      fetchStats();
    }
  }, [user, canAccessAdmin]);

  const fetchStats = async () => {
    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("status, total_price");

      if (bookings) {
        const totalRevenue = bookings
          .filter(b => b.status === "confirmed" || b.status === "completed")
          .reduce((sum, b) => sum + Number(b.total_price), 0);
        
        setStats(prev => ({
          ...prev,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === "pending").length,
          confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
          totalRevenue,
        }));
      }

      const tenant = await getCurrentTenant();
      const packagesQuery = tenant
        ? (supabase as any).from("packages").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id)
        : (supabase as any).from("packages").select("*", { count: "exact", head: true });
      const { count: packagesCount } = await packagesQuery;

      setStats(prev => ({
        ...prev,
        totalPackages: packagesCount || 0,
      }));

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading || !canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pendingBookings,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Confirmed",
      value: stats.confirmedBookings,
      icon: TrendingUp,
      color: "text-accent-foreground",
      bgColor: "bg-accent/50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "customers": return <AdminCustomers />;
      case "bookings": return <AdminBookings onUpdate={fetchStats} />;
      case "air-ticket-bookings": return <AdminAirTicketBookings />;
      case "air-ticket-settings": return <AdminAirTicketSettings />;
      case "visa-applications": return <AdminVisaApplications />;
      case "leads": return <AdminLeadsManagement />;
      case "marketing-analytics": return <AdminMarketingAnalytics />;
      case "lead-magnets": return <AdminLeadMagnets />;
      case "offer-popup": return <AdminOfferPopup />;
      case "referrals": return <AdminReferrals />;
      case "agents": return <AdminAgents />;
      case "crm-automation": return <AdminCRMAutomation />;
      case "group-inquiries": return <AdminGroupInquiries />;
      case "packages": return <AdminPackages onUpdate={fetchStats} />;
      case "package-sections": return <AdminPackageSections />;
      case "hotels": return <AdminHotels />;
      case "hotel-bookings": return <AdminHotelBookings />;
      case "hotel-settings": return <AdminHotelSettings />;
      case "revenue": return <AdminRevenue />;
      case "financial-analytics": return <AdminFinancialAnalytics />;
      case "reports": return <AdminReportsAnalytics />;
      case "traffic-status": return <AdminTrafficStatus />;
      case "hajji-reports": return <AdminHajjiReports />;
      case "reconciliation": return <AdminPaymentReconciliation />;
      case "emi-report": return <AdminEMIReport />;
      case "payments": return <AdminPaymentMethods />;
      case "transaction-logs": return <AdminTransactionLogs />;
      case "webinars": return <AdminWebinars />;
      case "retargeting": return <AdminRetargetingSegments />;
      case "installment-reminders": return <AdminInstallmentReminders />;
      case "staff": return <AdminStaffManagement />;
      case "audit-log": return <AdminAuditLog />;
      case "notifications": return <AdminNotifications />;
      case "notification-retry": return <AdminNotificationRetry />;
      case "notification-templates": return <AdminNotificationTemplates />;
      case "booking-settings": return <AdminBookingSettings />;
      case "blog": return <AdminBlog />;
      case "notices": return <AdminNotices />;
      case "gallery": return <AdminGallery />;
      case "testimonials": return <AdminTestimonials />;
      case "faq": return <AdminFAQ />;
      case "translations": return <AdminTranslations />;
      case "sections": return <AdminSectionVisibility />;
      case "seo": return <AdminSEO />;
      case "menu": return <AdminMenu />;
      case "hero": return <AdminHero />;
      case "services": return <AdminServices />;
      case "team": return <AdminTeam />;
      case "visa": return <AdminVisa />;
      case "contact": return <AdminContact />;
      case "offices": return <AdminOfficeLocations />;
      case "social-networks": return <AdminSocialNetworks />;
      case "footer": return <AdminFooter />;
      case "legal": return <AdminLegalPages />;
      case "backup": return <AdminBackupRestore />;
      case "demo-account": return <AdminDemoAccount />;
      case "acc-dashboard": return <AccountingDashboard />;
      case "chart-of-accounts": return <ChartOfAccounts />;
      case "acc-income": return <IncomeManagement />;
      case "acc-expense": return <ExpenseManagement />;
      case "general-ledger": return <GeneralLedger />;
      case "bank-accounts": return <BankAccounts />;
      case "acc-reports": return <FinancialReports />;
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <ViewerModeProvider>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link to="/">
                <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-bold text-sm sm:text-lg truncate">Admin Dashboard</h1>
                    {isViewer && (
                      <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs flex-shrink-0">
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View Only</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block truncate">SM Elite Hajj Management</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-1.5 sm:gap-2 flex-shrink-0 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm">
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        <AdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex">
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />

          <main className="flex-1 p-4 lg:p-6 min-w-0">
            {isViewer && (
              <div className="mb-4 p-3 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center gap-2 text-secondary-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Demo Mode: You are viewing as a read-only demo account. Editing is disabled.</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="pt-4 lg:pt-6 px-3 lg:px-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">{stat.title}</p>
                          <p className="text-base sm:text-lg lg:text-3xl font-bold mt-1 truncate">{stat.value}</p>
                        </div>
                        <div className={`${stat.bgColor} p-2 lg:p-3 rounded-xl flex-shrink-0`}>
                          <stat.icon className={`w-4 h-4 lg:w-6 lg:h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="animate-in fade-in-50 duration-300">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </ViewerModeProvider>
  );
};

export default AdminDashboard;
