import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Order } from "@/entities/Order";

type WebSocketMessage = 
  | { type: 'order_data'; data: Order }
  | { type: 'error'; data: string };

export default function Room() {
    const { order_uuid } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const message: WebSocketMessage = JSON.parse(event.data);

            if (message.type === 'order_data') {
                setOrder(message.data);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            setError('Failed to process order data');
            setIsLoading(false);
        }
    }, []);

    // Set up WebSocket connection
    useEffect(() => {
        if (!order_uuid) {
            navigate('/404', { replace: true });
            return;
        }

        let connected = false;
        const wsUrl = `ws://127.0.0.1:64321/functions/v1/room-websocket?order_uuid=${order_uuid}`;
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            connected = true;
            console.log('WebSocket connection established');
        };

        ws.onmessage = handleWebSocketMessage;

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (!connected) {
                // Error during handshake
                navigate('/404', { replace: true });
            } else {
                // Error after connection was established
                setError('WebSocket connection error');
            }
        };

        ws.onclose = (event) => {
            if (event.code !== 1000) { // 1000 is normal closure
                setError(`Connection closed unexpectedly`);
            }
            connected = false;
        };

        // Clean up WebSocket on component unmount
        return () => {
            ws.close(1000, 'Component unmounting');
        };
    }, [order_uuid, handleWebSocketMessage]);

    if (!order && !error) return false;

    // Loading state
    if (isLoading) {
        return (
            <div className="p-4">
                <p>Loading order data...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                {order_uuid && <p className="mt-2 text-sm">Order ID: {order_uuid}</p>}
            </div>
        );
    }

    // Main content
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Order Room: {order_uuid}</h1>

            {order ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                        <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
                            {JSON.stringify(order, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : (
                <p>No order data available</p>
            )}
        </div>
    );
}
