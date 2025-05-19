import type { SupabaseClient } from "@supabase/supabase-js";
import { DishCategoryModel, type DishCategory } from "../entities/DishCategory";

export async function getAllDishCategories(supabase: SupabaseClient): Promise<DishCategoryModel[]> {
    const { data, error } = await new DishCategoryModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching dish categories: ${error.message}`);

    return data
}

export async function createDishCategory(supabase: SupabaseClient, category: Partial<DishCategory>): Promise<DishCategoryModel> {
    const { id, ...rest } = category;
    const { data, error } = await new DishCategoryModel(supabase).query().insert(rest).select();

    if (error) throw new Error(`Error creating dish category: ${error.message}`);

    return data[0];
}

export async function editDishCategory(supabase: SupabaseClient, category: Partial<DishCategory>): Promise<DishCategoryModel> {
    const { id, ...rest } = category;
    const { data, error } = await new DishCategoryModel(supabase).query().update(rest).eq("id", category.id).select();

    if (error) throw new Error(`Error editing dish category: ${error.message}`);

    return data[0];
}
