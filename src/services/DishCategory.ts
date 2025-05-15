import type { SupabaseClient } from "@supabase/supabase-js";
import { DishCategoryModel } from "../entities/DishCategory";

export async function getAllDishCategories(supabase: SupabaseClient): Promise<DishCategoryModel[]> {
    const { data, error } = await new DishCategoryModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching dish categories: ${error.message}`);

    return data
}
