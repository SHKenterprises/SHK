/**
 * ==============================================================================
 * SHK AUTO - SUPABASE CLIENT (NATIVE POSTGREST CONNECTOR)
 * ==============================================================================
 * High-performance, zero-bloat Supabase client designed for Next.js.
 * Directly communicates with Supabase PostgREST & Auth endpoints.
 * Provides the familiar fluent Supabase query builder API (.from().select().eq()...)
 * with automatic fallback and detailed error reporting.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_Publishable_key ||
  "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_Secret_key ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/**
 * Check if valid Supabase credentials have been configured
 */
export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (
    SUPABASE_URL.includes("your-project-id") ||
    SUPABASE_ANON_KEY.includes("your-supabase-anon-key")
  ) {
    return false;
  }
  return SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;
}

export interface SupabaseResponse<T = any> {
  data: T | null;
  error: { message: string; details?: string; hint?: string; code?: string } | null;
  status: number;
}

class QueryBuilder<T = any> {
  private table: string;
  private action: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectColumns: string = "*";
  private payload: any = null;
  private onConflict: string | null = null;
  private filters: Array<{ column: string; op: string; value: any }> = [];
  private orderParams: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*"): this {
    this.action = "select";
    this.selectColumns = columns;
    return this;
  }

  insert(values: any | any[]): this {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  upsert(values: any | any[], options?: { onConflict?: string }): this {
    this.action = "upsert";
    this.payload = values;
    if (options?.onConflict) {
      this.onConflict = options.onConflict;
    }
    return this;
  }

  update(values: any): this {
    this.action = "update";
    this.payload = values;
    return this;
  }

  delete(): this {
    this.action = "delete";
    return this;
  }

  eq(column: string, value: any): this {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  neq(column: string, value: any): this {
    this.filters.push({ column, op: "neq", value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderParams = {
      column,
      ascending: options?.ascending !== false,
    };
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  single(): Promise<SupabaseResponse<T>> {
    this.isSingle = true;
    return this.execute();
  }

  private async execute(): Promise<SupabaseResponse<any>> {
    if (!isSupabaseConfigured()) {
      return {
        data: null,
        error: {
          message: "Supabase credentials are not configured or still using placeholders in .env.local",
          code: "NOT_CONFIGURED",
        },
        status: 400,
      };
    }

    try {
      const cleanUrl = SUPABASE_URL.replace(/\/+$/, "");
      const queryParams = new URLSearchParams();

      if (this.action === "select") {
        queryParams.append("select", this.selectColumns);
      }

      for (const f of this.filters) {
        queryParams.append(f.column, `${f.op}.${f.value}`);
      }

      if (this.orderParams) {
        queryParams.append(
          "order",
          `${this.orderParams.column}.${this.orderParams.ascending ? "asc" : "desc"}`
        );
      }

      if (this.limitCount !== null) {
        queryParams.append("limit", String(this.limitCount));
      }

      const queryString = queryParams.toString();
      const endpoint = `${cleanUrl}/rest/v1/${this.table}${queryString ? `?${queryString}` : ""}`;

      const headers: Record<string, string> = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      };

      if (this.action === "insert" || this.action === "update") {
        headers["Prefer"] = "return=representation";
      } else if (this.action === "upsert") {
        headers["Prefer"] = "resolution=merge-duplicates,return=representation";
      }

      if (this.isSingle) {
        headers["Accept"] = "application/vnd.pgrst.object+json";
      }

      let method = "GET";
      let body: string | undefined = undefined;

      if (this.action === "insert" || this.action === "upsert") {
        method = "POST";
        body = JSON.stringify(this.payload);
        if (this.onConflict) {
          queryParams.append("on_conflict", this.onConflict);
        }
      } else if (this.action === "update") {
        method = "PATCH";
        body = JSON.stringify(this.payload);
      } else if (this.action === "delete") {
        method = "DELETE";
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body,
        cache: "no-store",
      });

      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch {
          errData = { message: res.statusText };
        }
        return {
          data: null,
          error: {
            message: errData.message || `Supabase query failed with HTTP ${res.status}`,
            details: errData.details,
            hint: errData.hint,
            code: errData.code || String(res.status),
          },
          status: res.status,
        };
      }

      if (res.status === 204) {
        return { data: null, error: null, status: 204 };
      }

      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (err: any) {
      return {
        data: null,
        error: {
          message: err?.message || "Failed to connect to Supabase database",
          code: "NETWORK_ERROR",
        },
        status: 500,
      };
    }
  }

  // Promise-like interface
  then<TResult1 = SupabaseResponse<any>>(
    onfulfilled?:
      | ((value: SupabaseResponse<any>) => TResult1 | PromiseLike<TResult1>)
      | null
  ): Promise<TResult1> {
    return this.execute().then(onfulfilled as any);
  }
}

/**
 * Main Supabase client object mimicking @supabase/supabase-js
 */
export const supabase = {
  from<T = any>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  },

  /**
   * Helper to execute raw SQL RPC function if needed
   */
  async rpc(functionName: string, params: Record<string, any> = {}) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const cleanUrl = SUPABASE_URL.replace(/\/+$/, "");
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/rpc/${functionName}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message } };
    }
  },
};

export default supabase;
