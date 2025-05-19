import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for DishCategory
export interface DishCategory {
    id: number;
    name: string;
    organization_id: string;
}

export class DishCategoryModel extends BaseModel<DishCategory> implements DishCategory {
    id: number;
    name: string;
    organization_id: string;

    constructor(supabaseClient?: SupabaseClient, init?: Partial<DishCategory>) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.name = init?.name ?? '';
        this.organization_id = init?.organization_id ?? '';
    }

    protected tableName: string = 'dish_categories';

    //

}
