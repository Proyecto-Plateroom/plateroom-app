import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "./BaseModel";

// Entity for Table
export interface Table {
    id: number;
    name: string;
    seats: number;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
}

export class Table extends BaseModel<Table> implements Table {
    id: number;
    name: string;
    seats: number;
    organization_id: string;
    created_at?: string;
    updated_at?: string;

    constructor(supabaseClient?: SupabaseClient, init?: Partial<Table>) {
        super(init, supabaseClient);

        this.id = init?.id ?? 0;
        this.name = init?.name ?? '';
        this.seats = init?.seats ?? 0;
        this.organization_id = init?.organization_id ?? '';
        this.created_at = init?.created_at ?? undefined;
        this.updated_at = init?.updated_at ?? undefined;
    }

    protected tableName: string = 'tables';

    //

}
