import type { SupabaseClient } from "@supabase/supabase-js";
import { MenuModel } from "../entities/Menu";
import { DishModel } from "../entities/Dish";

export async function getAllMenus(supabase: SupabaseClient): Promise<MenuModel[]> {
    const { data, error } = await new MenuModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching menus: ${error.message}`);

    return data
}

export async function getMenu(supabase: SupabaseClient, id: number): Promise<MenuModel>{
    const { data, error } = await new MenuModel(supabase).query().select("*").eq("id", id).single()

    if (error) throw new Error(`Error fetching menu: ${error.message}`);

    return new MenuModel(supabase, data);;
}

export async function deleteDishFromMenu(supabase: SupabaseClient, menu_id: number, dish_id: number): Promise<DishModel[]> {
    const menu = await getMenu(supabase, menu_id)

    const { error } = await menu.rawQuery("dish_menu").delete().eq("menu_id", menu_id).eq("dish_id", dish_id);

    if (error) throw new Error(`Error deleting dish from menu: ${error.message}`);

    return menu.getDishes();
}

export async function addDish(supabase: SupabaseClient, menu_id: number, dish_id: number): Promise<DishModel[]> {
    const menu = await getMenu(supabase, menu_id)

    const { error } = await menu.rawQuery("dish_menu").insert({ menu_id, dish_id });

    if (error) throw new Error(`Error adding dish to menu: ${error.message}`);

    return menu.getDishes();
}

export async function createMenu(supabase: SupabaseClient, menu: Partial<MenuModel>): Promise<MenuModel> {
    const { error } = await new MenuModel(supabase).query().insert(menu).select();

    if (error) throw new Error(`Error creating menu: ${error.message}`);

    return new MenuModel(supabase, menu);
}

export async function deleteMenu(menu: MenuModel): Promise<void> {
    const { error: relationDeleteError } = await menu.rawQuery("dish_menu").delete().eq("menu_id", menu.id);
    if (relationDeleteError) throw new Error(`Error deleting menu dishes: ${relationDeleteError.message}`);

    const { error: menuDeleteError } = await menu.query().delete().eq("id", menu.id);
    if (menuDeleteError) throw new Error(`Error deleting menu: ${menuDeleteError.message}`);
}
