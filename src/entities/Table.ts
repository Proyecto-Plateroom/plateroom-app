// Entity for Table
export interface Table {
    id: number;
    name: string;
    seats: number;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
}
