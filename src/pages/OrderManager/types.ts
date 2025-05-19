export interface Table {
    id: string;
    name: string;
    organization_id: string;
    created_at: string;
}

export interface Order {
    id: string;
    uuid: string;
    menu_id: string;
    table_id: string;
    is_open: boolean;
    created_at: string;
    tables: {
        id: string;
        organization_id: string;
    };
}

export interface Menu {
    id: string;
    name: string;
    organization_id: string;
}
