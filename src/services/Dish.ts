import type { SupabaseClient } from "@supabase/supabase-js";
import { DishModel } from "../entities/Dish";

export async function getAllDishes(supabase: SupabaseClient): Promise<DishModel[]> {
    const { data, error } = await new DishModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching dishes: ${error.message}`);

    return data
}
