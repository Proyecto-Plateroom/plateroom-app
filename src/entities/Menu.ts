import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";
import { DishModel } from "./Dish";

// Entity for Menu
export interface Menu {
    id: number;
    name: string;
    price: number;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
}

export class MenuModel extends BaseModel<Menu> implements Menu {
    id: number;
    name: string;
    price: number;
    organization_id: string;
    created_at?: string;
    updated_at?: string;

    constructor(supabaseClient?: SupabaseClient, init?: Partial<Menu>) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.name = init?.name ?? '';
        this.price = init?.price ?? 0;
        this.organization_id = init?.organization_id ?? '';
        this.created_at = init?.created_at ?? undefined;
        this.updated_at = init?.updated_at ?? undefined;
    }

    protected tableName: string = 'menus';

    async getDishes(): Promise<DishModel[]> {
        const { data, error } = await this.rawQuery("dish_menu").select("dish: dishes(*)").eq("menu_id", this.id);

        if (error) throw new Error(`Error fetching dishes: ${error.message}`);

        return data.map((item) => new DishModel(this.supabase, item.dish as Partial<DishModel>)) ?? [];
    }

    //

}
