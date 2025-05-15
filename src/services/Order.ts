import type { SupabaseClient } from "@supabase/supabase-js";
import { OrderModel } from '../entities/Order';

export async function getAllOrders(supabase: SupabaseClient): Promise<OrderModel[]> {
    const { data, error } = await new OrderModel(supabase).query().select("*")

    if (error) throw new Error(`Error fetching orders: ${error.message}`);

    return data
}
