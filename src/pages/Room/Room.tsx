import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Order } from "@/entities/Order";

interface WebSocketMessage {
    type: string;
    data: Order;
}

export default function Room() {
    const { order_uuid } = useParams();
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
            setError('No order UUID provided');
            setIsLoading(false);
            return;
        }

        // Create WebSocket connection
        const wsUrl = `ws://127.0.0.1:64321/functions/v1/room-websocket?order_uuid=${order_uuid}`;
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = handleWebSocketMessage;

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Failed to connect to the server');
            setIsLoading(false);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Clean up WebSocket on component unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [order_uuid, handleWebSocketMessage]);

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
