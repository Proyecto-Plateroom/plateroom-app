import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

interface Order {
    uuid: string;
    created_at: string;
    // Puedes agregar más campos según la estructura de tu tabla orders
}

export default function WebSocketTest() {
    const { user } = useUser();
    const supabase = useSupabaseClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderUuid, setSelectedOrderUuid] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [wsMessage, setWsMessage] = useState<string>('');
    const [wsMessages, setWsMessages] = useState<string[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    
    // Cargar pedidos al montar el componente
    useEffect(() => {
        if (!user) return;
        
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('uuid, created_at')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
                
                // Seleccionar el primer pedido por defecto si hay pedidos disponibles
                if (data && data.length > 0) {
                    setSelectedOrderUuid(data[0].uuid);
                }
            } catch (error) {
                console.error('Error al cargar los pedidos:', error);
                setWsMessages(prev => [...prev, '❌ Error al cargar los pedidos']);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, supabase]);
    
    // Configurar WebSocket cuando se selecciona un pedido
    useEffect(() => {
        if (!selectedOrderUuid) return;
        
        // Cerrar conexión anterior si existe
        if (ws) {
            ws.close();
            setWs(null);
            setWsMessages([]);
        }
        
        // URL de la edge function WebSocket con el ID del pedido como parámetro
        const wsUrl = `ws://127.0.0.1:64321/functions/v1/room-websocket?order_uuid=${encodeURIComponent(selectedOrderUuid)}`;
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
            console.log('WebSocket conectado para el pedido:', selectedOrderUuid);
            setWs(socket);
            setWsMessages(prev => [...prev, `✅ Conectado al pedido: ${selectedOrderUuid}`]);
        };
        
        socket.onmessage = (event) => {
            console.log('Mensaje recibido:', event.data);
            setWsMessages(prev => [...prev, `📨 [Pedido ${selectedOrderUuid}]: ${event.data}`]);
        };
        
        socket.onclose = () => {
            console.log('WebSocket desconectado');
            setWs(null);
            setWsMessages(prev => [...prev, '❌ Desconectado del servidor WebSocket']);
        };
        
        socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            setWsMessages(prev => [...prev, `❌ Error: ${error}`]);
        };
        
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [selectedOrderUuid]);
    
    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOrderUuid(e.target.value);
        setWsMessages(prev => [...prev, `🔁 Seleccionado pedido: ${e.target.value}`]);
    };

    const sendWsMessage = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()) return;
        
        const messageData = {
            text: wsMessage,
            order_uuid: selectedOrderUuid,
            timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(messageData));
        setWsMessages(prev => [...prev, `✉️ Tú (Pedido ${selectedOrderUuid}): ${wsMessage}`]);
        setWsMessage('');
    };

    return (
        <div className="space-y-4">
            
            {/* Selector de pedidos */}
            <div className="space-y-2">
                <label htmlFor="order-select" className="block text-sm font-medium text-gray-700">
                    Seleccionar Pedido
                </label>
                <select
                    id="order-select"
                    value={selectedOrderUuid}
                    onChange={handleOrderChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading || orders.length === 0}
                >
                    {loading ? (
                        <option value="">Cargando pedidos...</option>
                    ) : orders.length === 0 ? (
                        <option value="">No hay pedidos disponibles</option>
                    ) : (
                        <>
                            <option value="" disabled>Selecciona un pedido</option>
                            {orders.map((order) => (
                                <option key={order.uuid} value={order.uuid}>
                                    Pedido {order.uuid} - {new Date(order.created_at).toLocaleString()}
                                </option>
                            ))}
                        </>
                    )}
                </select>
                {loading && (
                    <p className="text-sm text-gray-500">Cargando lista de pedidos...</p>
                )}
            </div>
            
            {/* Chat WebSocket */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <div className="h-64 overflow-y-auto mb-4 p-2 bg-white rounded border">
                    {!selectedOrderUuid ? (
                        <p className="text-gray-500">Selecciona un pedido para comenzar el chat</p>
                    ) : wsMessages.length === 0 ? (
                        <p className="text-gray-500">Los mensajes aparecerán aquí...</p>
                    ) : (
                        <div className="space-y-2">
                            {wsMessages.map((msg, index) => (
                                <div key={index} className="break-words">{msg}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={wsMessage}
                        onChange={(e) => setWsMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendWsMessage()}
                        placeholder={!selectedOrderUuid ? "Selecciona un pedido primero" : "Escribe un mensaje..."}
                        className={`flex-1 p-2 border rounded ${
                            !selectedOrderUuid ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        disabled={!selectedOrderUuid || !ws || ws.readyState !== WebSocket.OPEN}
                    />
                    <button
                        onClick={sendWsMessage}
                        disabled={!selectedOrderUuid || !ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()}
                        className={`px-4 py-2 rounded ${
                            !selectedOrderUuid || !ws || ws.readyState !== WebSocket.OPEN || !wsMessage.trim()
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        Enviar
                    </button>
                </div>
                
                {selectedOrderUuid && ws && ws.readyState === WebSocket.OPEN && (
                    <div className="mt-2 text-xs text-green-600">
                        Conectado al pedido: {selectedOrderUuid}
                    </div>
                )}
            </div>
        </div>
    );
}
