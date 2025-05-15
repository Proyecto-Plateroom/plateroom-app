import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for Order
export interface Order {
    id: number;
    uuid: string;
    total_amount: number;
    is_open: boolean;
    menu_id: number;
    table_id: number;
}

export class Order extends BaseModel<Order> implements Order {
    id: number;
    uuid: string;
    total_amount: number;
    is_open: boolean;
    menu_id: number;
    table_id: number;

    constructor(supabaseClient?: SupabaseClient, init?: Partial<Order>) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.uuid = init?.uuid ?? '';
        this.total_amount = init?.total_amount ?? 0;
        this.is_open = init?.is_open ?? false;
        this.menu_id = init?.menu_id ?? 0;
        this.table_id = init?.table_id ?? 0;
    }

    protected tableName: string = 'orders';

    //

}
