import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for Dish
export interface Dish {
    id: number;
    name: string;
    description: string;
    supplement: number;
    photo_path: string;
    category_id: number;
}

export class DishModel extends BaseModel<Dish> implements Dish {
    id: number;
    name: string;
    description: string;
    supplement: number;
    photo_path: string;
    category_id: number;

    
    constructor(init?: Partial<Dish>, supabaseClient?: SupabaseClient) {
        super(init, supabaseClient);
        
        this.id = init?.id ?? 0;
        this.name = init?.name ?? '';
        this.description = init?.description ?? '';
        this.supplement = init?.supplement ?? 0;
        this.photo_path = init?.photo_path ?? '';
        this.category_id = init?.category_id ?? 0;
    }

    protected tableName: string = 'dishes';

    //

}
