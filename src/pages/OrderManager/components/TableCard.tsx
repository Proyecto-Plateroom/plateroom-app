import type { Table } from '../types';

interface TableCardProps {
    table: Table;
    hasActiveOrder: boolean;
    activeOrderUuid?: string;
    onCreateOrder: () => void;
}

export function TableCard({ table, hasActiveOrder, activeOrderUuid, onCreateOrder }: TableCardProps) {
    return (
        <div className={`border rounded-lg p-4 ${hasActiveOrder ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">Mesa {table.name}</h3>
                    <p className="text-sm text-gray-600">
                        {hasActiveOrder ? 'Pedido activo' : 'Libre'}
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasActiveOrder 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                }`}>
                    {hasActiveOrder ? 'Ocupada' : 'Libre'}
                </span>
            </div>
            
            <div className="mt-4 space-y-2">
                <button
                    onClick={onCreateOrder}
                    disabled={hasActiveOrder}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                        hasActiveOrder
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    }`}
                >
                    Nuevo Pedido
                </button>
                
                {hasActiveOrder && activeOrderUuid && (
                    <a
                        href={`/rooms/${activeOrderUuid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-4 text-center bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                        Ver Pedido
                    </a>
                )}
            </div>
        </div>
    );
}
