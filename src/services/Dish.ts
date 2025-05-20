import type { SupabaseClient } from "@supabase/supabase-js";
import { DishModel, type Dish } from "../entities/Dish";
import { getFileUrl } from "@/utils/helpers";

export async function getAllDishes(supabase: SupabaseClient): Promise<DishModel[]> {
    const { data, error } = await new DishModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching dishes: ${error.message}`);

    return data
}

export async function addDish(supabase: SupabaseClient, dish: Partial<Dish> & { file?: File }): Promise<DishModel> {
    const { id, file, ...rest } = dish;

    if (file) {
        const { error: UploadIamgeError } = await new DishModel(supabase).uploadFile(rest?.photo_path as string, file);

        if (UploadIamgeError) throw new Error(`Error uploading file: ${UploadIamgeError.message}`);

        rest.photo_path = getFileUrl(supabase, rest?.photo_path as string);
    }

    const { data, error: DataError } = await new DishModel(supabase).query().insert(rest).select();

    if (DataError) throw new Error(`Error adding dish: ${DataError.message}`);

    return data[0];
}

export async function editDish(supabase: SupabaseClient, dish: Partial<Dish> & { file?: File }): Promise<DishModel> {
    const { id, file, ...rest } = dish;

    if (file) {
        const { error: UploadIamgeError } = await new DishModel(supabase).uploadFile(rest?.photo_path as string, file);

        if (UploadIamgeError) throw new Error(`Error uploading file: ${UploadIamgeError.message}`);

        rest.photo_path = getFileUrl(supabase, rest?.photo_path as string);
    }

    const { data, error } = await new DishModel(supabase).query().update(rest).eq("id", dish.id).select();

    if (error) throw new Error(`Error editing dish: ${error.message}`);

    return data[0];
}

export async function deleteDish(supabase: SupabaseClient, id: number): Promise<DishModel[]> {
    const { error } = await new DishModel(supabase).query().delete().eq("id", id);

    if (error) throw new Error(`Error deleting dish: ${error.message}`);

    return getAllDishes(supabase);
}
