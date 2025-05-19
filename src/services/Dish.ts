import type { SupabaseClient } from "@supabase/supabase-js";
import { DishModel, type Dish } from "../entities/Dish";

export async function getAllDishes(supabase: SupabaseClient): Promise<DishModel[]> {
    const { data, error } = await new DishModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching dishes: ${error.message}`);

    return data
}

export async function addDish(supabase: SupabaseClient, dish: Partial<Dish>): Promise<DishModel> {
    const { id, ...rest } = dish;
    const { data, error } = await new DishModel(supabase).query().insert(rest).select();

    if (error) throw new Error(`Error adding dish: ${error.message}`);

    return data[0];
}

export async function editDish(supabase: SupabaseClient, dish: Partial<Dish>): Promise<DishModel> {
    const { id, ...rest } = dish;
    const { data, error } = await new DishModel(supabase).query().update(rest).eq("id", dish.id).select();

    if (error) throw new Error(`Error editing dish: ${error.message}`);

    return data[0];
}

export async function deleteDish(supabase: SupabaseClient, id: number): Promise<DishModel[]> {
    const { error } = await new DishModel(supabase).query().delete().eq("id", id);

    if (error) throw new Error(`Error deleting dish: ${error.message}`);

    return getAllDishes(supabase);
}
