import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
const authLocks = new Map<string, Promise<unknown>>();

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!browserClient) {
    browserClient = createClient(url, anon, {
      auth: {
        lock: async (name, _acquireTimeout, fn) => {
          const previous = authLocks.get(name) ?? Promise.resolve();
          const current = previous.catch(() => null).then(fn);

          authLocks.set(
            name,
            current.finally(() => {
              if (authLocks.get(name) === current) {
                authLocks.delete(name);
              }
            })
          );

          return current;
        },
      },
    });
  }

  return browserClient;
}
