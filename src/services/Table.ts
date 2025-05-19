import type { SupabaseClient } from "@supabase/supabase-js";
import { TableModel } from "../entities/Table";

export async function getAllTables(supabase: SupabaseClient): Promise<TableModel[]> {
    const { data, error } = await new TableModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching tables: ${error.message}`);

    return data
}

export async function createTable(supabase: SupabaseClient, table: Partial<TableModel>): Promise<TableModel> {
    const { id, ...rest } = table;
    const { data, error } = await new TableModel(supabase).query().insert(rest).select();

    if (error) throw new Error(`Error creating table: ${error.message}`);

    return data[0];
}

export async function editTable(supabase: SupabaseClient, table: Partial<TableModel>): Promise<TableModel> {
    const { id, ...rest } = table;
    const { data, error } = await new TableModel(supabase).query().update(rest).eq("id", table.id).select();

    if (error) throw new Error(`Error updating table: ${error.message}`);

    return data[0];
}

export async function deleteTable(supabase: SupabaseClient, id: number): Promise<TableModel[]> {
    const { error } = await new TableModel(supabase).query().delete().eq("id", id);

    if (error) throw new Error(`Error deleting table: ${error.message}`);

    return getAllTables(supabase);
}
