import { supabase } from "@/integrations/supabase/client";

export const VPS_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function getCurrentTenant() {
  return {
    id: VPS_TENANT_ID,
    name: "SM Elite Hajj",
    domain: typeof window !== "undefined"
      ? window.location.hostname.replace("www.", "")
      : "smelitehajj.com",
  };
}

export async function getTenant() {
  return getCurrentTenant();
}

export async function getTenantPackages(options?: {
  select?: string;
  type?: string;
  activeOnly?: boolean;
  orderBy?: { column: string; ascending?: boolean };
}) {
  let query: any = supabase.from("packages").select(options?.select || "*");

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  if (options?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  } else {
    query = query.order("order_index", { ascending: true });
  }

  return query;
}

export function clearTenantCache() {}
