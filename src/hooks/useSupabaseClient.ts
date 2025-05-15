import { useSession } from "@clerk/clerk-react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

export function useSupabaseClient(): SupabaseClient {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        async accessToken() {
          return session?.getToken() ?? null;
        },
      }
    );
  }, [session]);

  return supabase;
}
