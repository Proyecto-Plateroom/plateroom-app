import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for DishCategory
export interface DishCategory {
    id: number;
    name: string;
}

export class DishCategory extends BaseModel<DishCategory> implements DishCategory {
    id: number;
    name: string;

    constructor(init?: Partial<DishCategory>, supabaseClient?: SupabaseClient) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.name = init?.name ?? '';
    }

    protected tableName: string = 'dish_categories';

    //

}
