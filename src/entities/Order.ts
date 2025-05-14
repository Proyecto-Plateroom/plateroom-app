// Entity for Order
export interface Order {
    id: number;
    uuid: string;
    total_amount: number;
    is_open: boolean;
    menu_id: number;
    table_id: number;
}
