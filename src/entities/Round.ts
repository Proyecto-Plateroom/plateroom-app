import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for Round
export interface Round {
    id: number;
    number: number;
    is_open: boolean;
    order_id: number;
}

export class RoundModel extends BaseModel<Round> implements Round {
    id: number;
    number: number;
    is_open: boolean;
    order_id: number;

    constructor(supabaseClient?: SupabaseClient, init?: Partial<Round>) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.number = init?.number ?? 0;
        this.is_open = init?.is_open ?? false;
        this.order_id = init?.order_id ?? 0;
    }

    protected tableName: string = 'rounds';

    //

}
