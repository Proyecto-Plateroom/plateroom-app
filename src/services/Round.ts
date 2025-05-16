import type { SupabaseClient } from "@supabase/supabase-js";
import { RoundModel } from "../entities/Round";

export async function getAllRounds(supabase: SupabaseClient): Promise<RoundModel[]> {
    const { data, error } = await new RoundModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching rounds: ${error.message}`);

    return data
}
