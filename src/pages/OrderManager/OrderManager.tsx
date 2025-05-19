import { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/clerk-react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { TableCard, CreateOrderModal } from './components';
import type { Table, Order, Menu } from './types';

export default function OrderManager() {
    const { organization } = useOrganization();
    const supabase = useSupabaseClient();
    const [tables, setTables] = useState<Table[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch tables, orders and menus on mount 
    useEffect(() => {
        if (!organization) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch tables for the organization
                const { data: tablesData, error: tablesError } = await supabase
                    .from('tables')
                    .select('*')
                    .eq('organization_id', organization.id);

                if (tablesError) throw tablesError;

                // Fetch open orders with their associated table data
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        tables!inner(
                            id,
                            organization_id
                        )
                    `)
                    .eq('is_open', true)
                    .eq('tables.organization_id', organization.id);

                if (ordersError) throw ordersError;

                // Fetch menus for the organization
                const { data: menusData, error: menusError } = await supabase
                    .from('menus')
                    .select('*')
                    .eq('organization_id', organization.id);

                if (menusError) throw menusError;

                setTables(tablesData || []);
                setOrders(ordersData || []);
                setMenus(menusData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateOrder = (table: Table) => {
        const hasActiveOrder = orders.some(order => order.table_id === table.id && order.is_open);
        if (hasActiveOrder) return;
        
        setSelectedTable(table);
        setIsModalOpen(true);
    };

    const handleOrderCreated = async (menuId: string) => {
        if (!selectedTable || !organization) return;

        try {
            const newOrder = {
                uuid: crypto.randomUUID(),
                menu_id: menuId,
                table_id: selectedTable.id,
                is_open: true,
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('orders')
                .insert([newOrder]);

            if (error) throw error;

            // Refresh orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    tables!inner(
                        id,
                        organization_id
                    )
                `)
                .eq('is_open', true)
                .eq('tables.organization_id', organization.id);


            if (ordersError) throw ordersError;

            setOrders(ordersData || []);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    if (loading) {
        return <div className="p-4">Cargando mesas y pedidos...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => {
                    const tableOrders = orders.filter(order => order.table_id === table.id);
                    const hasActiveOrder = tableOrders.some(order => order.is_open);
                    const activeOrder = tableOrders.find(order => order.is_open);

                    return (
                        <TableCard 
                            key={table.id}
                            table={table}
                            hasActiveOrder={hasActiveOrder}
                            activeOrderUuid={activeOrder?.uuid}
                            onCreateOrder={() => handleCreateOrder(table)}
                        />
                    );
                })}
            </div>

            {selectedTable && (
                <CreateOrderModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTable(null);
                    }}
                    menus={menus}
                    onSubmit={handleOrderCreated}
                />
            )}
        </div>
    );
}
