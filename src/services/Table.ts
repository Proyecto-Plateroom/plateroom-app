import type { SupabaseClient } from "@supabase/supabase-js";
import { TableModel } from "../entities/Table";

export async function getAllTables(supabase: SupabaseClient): Promise<TableModel[]> {
    const { data, error } = await new TableModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching tables: ${error.message}`);

    return data
}
