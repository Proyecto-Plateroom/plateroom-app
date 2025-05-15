import type { SupabaseClient } from "@supabase/supabase-js";
import { MenuModel } from "../entities/Menu";

export async function getAllMenus(supabase: SupabaseClient): Promise<MenuModel[]> {
    const { data, error } = await new MenuModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching menus: ${error.message}`);

    return data
}
