import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay } from "date-fns";
import {
  Activity, Users, Eye, Globe2, Smartphone, MousePointerClick,
  Loader2, TrendingUp, Clock, UserPlus, MonitorSmartphone, Languages,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const RANGES = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

interface PageVisit {
  id: string;
  visitor_id: string | null;
  session_id: string | null;
  page_path: string;
  page_title: string | null;
  referrer_source: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  language: string | null;
  screen_resolution: string | null;
  is_new_visitor: boolean | null;
  duration_seconds: number | null;
  created_at: string;
}

const countBy = <T,>(items: T[], keyFn: (i: T) => string | null | undefined) => {
  const map = new Map<string, number>();
  items.forEach((i) => {
    const k = keyFn(i) || "Unknown";
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

// Country code → display name fallback (when geo only returned code)
const REGION_NAMES = typeof Intl !== "undefined" && (Intl as any).DisplayNames
  ? new (Intl as any).DisplayNames(["en"], { type: "region" })
  : null;

const CountryFlag = ({ code, name }: { code: string | null; name?: string | null }) => {
  if (!code || code.length !== 2) {
    return <span className="inline-block w-6 h-4 bg-muted rounded-sm align-middle" title="Unknown" />;
  }
  const cc = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/24x18/${cc}.png`}
      srcSet={`https://flagcdn.com/48x36/${cc}.png 2x`}
      width={24}
      height={18}
      alt={name || code}
      loading="lazy"
      className="inline-block rounded-sm shadow-sm align-middle"
    />
  );
};

const formatDuration = (s: number | null) => {
  if (!s || s < 1) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

const AdminTrafficStatus = () => {
  const [days, setDays] = useState("7");

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ["admin-traffic", days],
    queryFn: async () => {
      const since = subDays(new Date(), parseInt(days, 10)).toISOString();
      const { data, error } = await supabase
        .from("page_visits")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      return (data || []) as PageVisit[];
    },
    refetchInterval: 60_000,
  });

  const stats = useMemo(() => {
    const totalViews = visits.length;
    const uniqueVisitors = new Set(visits.map((v) => v.visitor_id).filter(Boolean)).size;
    const uniqueSessions = new Set(visits.map((v) => v.session_id).filter(Boolean)).size;
    const uniqueCountries = new Set(
      visits.map((v) => v.country_code || v.country).filter(Boolean)
    ).size;

    const newVisitors = new Set(
      visits.filter((v) => v.is_new_visitor).map((v) => v.visitor_id).filter(Boolean)
    ).size;
    const returningVisitors = Math.max(uniqueVisitors - newVisitors, 0);

    // Avg session duration: sum durations per session, then average
    const perSession = new Map<string, number>();
    visits.forEach((v) => {
      if (!v.session_id || !v.duration_seconds) return;
      perSession.set(v.session_id, (perSession.get(v.session_id) || 0) + v.duration_seconds);
    });
    const durations = Array.from(perSession.values());
    const avgSession = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Pages per session
    const sessionPageCount = new Map<string, number>();
    visits.forEach((v) => {
      if (!v.session_id) return;
      sessionPageCount.set(v.session_id, (sessionPageCount.get(v.session_id) || 0) + 1);
    });
    const pagesPerSession = sessionPageCount.size
      ? (Array.from(sessionPageCount.values()).reduce((a, b) => a + b, 0) / sessionPageCount.size).toFixed(2)
      : "0";

    // Bounce rate: sessions with exactly 1 page view
    const singleViewSessions = Array.from(sessionPageCount.values()).filter((c) => c === 1).length;
    const bounceRate = sessionPageCount.size
      ? ((singleViewSessions / sessionPageCount.size) * 100).toFixed(1)
      : "0";

    return {
      totalViews, uniqueVisitors, uniqueSessions, uniqueCountries,
      newVisitors, returningVisitors, avgSession, pagesPerSession, bounceRate,
    };
  }, [visits]);

  const timeline = useMemo(() => {
    const buckets = new Map<string, { date: string; views: number; visitors: Set<string> }>();
    const dayCount = parseInt(days, 10);
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = format(subDays(startOfDay(new Date()), i), "MMM dd");
      buckets.set(d, { date: d, views: 0, visitors: new Set() });
    }
    visits.forEach((v) => {
      const d = format(new Date(v.created_at), "MMM dd");
      const b = buckets.get(d);
      if (b) {
        b.views += 1;
        if (v.visitor_id) b.visitors.add(v.visitor_id);
      }
    });
    return Array.from(buckets.values()).map((b) => ({
      date: b.date, views: b.views, visitors: b.visitors.size,
    }));
  }, [visits, days]);

  // Hour-of-day distribution
  const hourly = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, visits: 0 }));
    visits.forEach((v) => {
      const h = new Date(v.created_at).getHours();
      arr[h].visits += 1;
    });
    return arr;
  }, [visits]);

  // Top countries with code resolution
  const topCountries = useMemo(() => {
    const map = new Map<string, { code: string | null; name: string; value: number }>();
    visits.forEach((v) => {
      const code = v.country_code || null;
      const name = v.country
        || (code && REGION_NAMES ? REGION_NAMES.of(code.toUpperCase()) : null)
        || "Unknown";
      const key = code || name;
      const cur = map.get(key) || { code, name, value: 0 };
      cur.value += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 12);
  }, [visits]);

  const topPages = useMemo(() => countBy(visits, (v) => v.page_path).slice(0, 10), [visits]);
  const topSources = useMemo(() => countBy(visits, (v) => v.referrer_source).slice(0, 8), [visits]);
  const devices = useMemo(() => countBy(visits, (v) => v.device_type), [visits]);
  const browsers = useMemo(() => countBy(visits, (v) => v.browser).slice(0, 6), [visits]);
  const oses = useMemo(() => countBy(visits, (v) => v.os).slice(0, 6), [visits]);
  const languages = useMemo(() => countBy(visits, (v) => v.language).slice(0, 6), [visits]);

  const newVsReturning = useMemo(
    () => [
      { name: "New", value: stats.newVisitors },
      { name: "Returning", value: stats.returningVisitors },
    ],
    [stats.newVisitors, stats.returningVisitors]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Traffic Status</h2>
          <p className="text-sm text-muted-foreground">
            Live visitor analytics — geography, devices, engagement, and sources.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards — row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total views in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Distinct people</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Visit sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueCountries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Locations reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards — row 2 (engagement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(stats.avgSession)}</div>
            <p className="text-xs text-muted-foreground mt-1">Time on site</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pages / Session</CardTitle>
            <Eye className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pagesPerSession}</div>
            <p className="text-xs text-muted-foreground mt-1">Depth of visit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.bounceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Single-page sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.returningVisitors.toLocaleString()} returning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Traffic Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#viewsGrad)" name="Page Views" />
              <Area type="monotone" dataKey="visitors" stroke="#22c55e" fill="url(#visitorsGrad)" name="Unique Visitors" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hour-of-day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Visits by Hour of Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Countries + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCountries.map((c) => (
                    <TableRow key={c.name + (c.code || "")}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CountryFlag code={c.code} name={c.name} />
                          <span>{c.name}</span>
                          {c.code && (
                            <span className="text-xs text-muted-foreground uppercase">
                              {c.code}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{c.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {((c.value / stats.totalViews) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5" /> Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSources} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Visits" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Devices, OS, New/Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" /> Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={(d) => `${d.name}: ${d.value}`}>
                    {devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" /> Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            {oses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {oses.map((o, i) => (
                  <div key={o.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{o.name}</span>
                    </div>
                    <span className="font-medium">{o.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> New vs Returning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.uniqueVisitors === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={newVsReturning} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    label={(d) => `${d.name}: ${d.value}`}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browsers, Languages, Top pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Browsers</CardTitle></CardHeader>
          <CardContent>
            {browsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {browsers.map((b, i) => (
                  <div key={b.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{b.name}</span>
                    </div>
                    <span className="font-medium">{b.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" /> Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {languages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {languages.map((l, i) => (
                  <div key={l.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{l.name}</span>
                    </div>
                    <span className="font-medium">{l.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {topPages.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <span className="truncate max-w-[180px]" title={p.name}>
                      {p.name === "/" ? "Home" : p.name}
                    </span>
                    <Badge variant="outline">{p.value}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent visits */}
      <Card>
        <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No visits recorded yet — once visitors browse the site, their activity will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.slice(0, 100).map((v) => {
                    const code = v.country_code;
                    const name = v.country
                      || (code && REGION_NAMES ? REGION_NAMES.of(code.toUpperCase()) : null)
                      || "—";
                    return (
                      <TableRow key={v.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {format(new Date(v.created_at), "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <CountryFlag code={code} name={name} />
                            <span>{name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{v.city || "—"}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={v.page_path}>
                          {v.page_path}
                        </TableCell>
                        <TableCell className="text-xs">{v.referrer_source || "Direct"}</TableCell>
                        <TableCell className="text-xs">{v.device_type || "—"}</TableCell>
                        <TableCell className="text-xs">{v.browser || "—"}</TableCell>
                        <TableCell className="text-xs">{v.os || "—"}</TableCell>
                        <TableCell className="text-xs">{formatDuration(v.duration_seconds)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTrafficStatus;
