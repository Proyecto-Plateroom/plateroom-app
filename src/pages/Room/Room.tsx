import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from "@/entities/Order";
import type { Dish } from "@/entities/Dish";
import React, { useEffect, useState, useCallback, useRef } from 'react';

// Simple icon components with proper TypeScript types
const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const Minus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const Check: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Extended interfaces for our needs
interface ExtendedDish extends Dish {
  dish_categories: {
    name: string;
  };
}

interface ExtendedOrder extends Order {
  menu?: {
    name: string;
    dishes: ExtendedDish[];
  };
}

type CurrentRound = Record<number, number>;

// Server to client messages
type WebSocketMessage =
  | { type: 'order_data'; data: { order: ExtendedOrder, current_round: CurrentRound } }  // Initial order data
  | { type: 'update_round'; data: CurrentRound }  // Current round dishes with quantities
  | { type: 'round_completed' }  // Notify clients that round was completed
  | { type: 'error'; data: string }  // Error message

// Client to server messages
type ClientWebSocketMessage =
  | { type: 'update_dish'; data: { [dishId: number]: number } }  // +1 or -1 for dish quantity
  | { type: 'complete_round' };  // Request to complete current round

// Dish with quantity for the current round
interface DishWithQuantity extends ExtendedDish {
  quantity: number;
}

// Group dishes by category
interface DishesByCategory {
  categoryName: string;
  dishes: DishWithQuantity[];
}

export default function Room() {
    const { order_uuid } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<ExtendedOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentRound, setCurrentRound] = useState<Record<string, number>>({});
    const socketRef = useRef<WebSocket | null>(null);
    const [dishesByCategory, setDishesByCategory] = useState<DishesByCategory[]>([]);

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('Received message:', message);

            switch (message.type) {
                case 'order_data':
                    setOrder(message.data.order);
                    // Initialize dishes by category
                    if (message.data.order?.menu?.dishes) {
                        const categories = groupDishesByCategory(message.data.order.menu.dishes);
                        setDishesByCategory(categories);
                    }
                    setCurrentRound(message.data.current_round);
                    setDishesByCategory(prevCategories => 
                        prevCategories.map(category => ({
                            ...category,
                            dishes: category.dishes.map(dish => ({
                                ...dish,
                                quantity: message.data.current_round[dish.id] || 0
                            }))
                        }))
                    );
                    setIsLoading(false);
                    break;
                    
                case 'update_round':
                    setCurrentRound(message.data);
                    
                    // Update dishes in categories with new quantities
                    setDishesByCategory(prevCategories => 
                        prevCategories.map(category => ({
                            ...category,
                            dishes: category.dishes.map(dish => ({
                                ...dish,
                                quantity: message.data[dish.id] || 0
                            }))
                        }))
                    );
                    break;
                    
                case 'round_completed':
                    setCurrentRound({});
                    // Show success message
                    setError(null);
                    // Reset quantities in the UI
                    setDishesByCategory(prevCategories => 
                        prevCategories.map(category => ({
                            ...category,
                            dishes: category.dishes.map(dish => ({
                                ...dish,
                                quantity: 0
                            }))
                        }))
                    );
                    // Show success toast
                    alert('Round completed successfully!');
                    break;
                    
                case 'error':
                    setError(message.data);
                    // Auto-hide error after 5 seconds
                    const timer = setTimeout(() => setError(null), 5000);
                    return () => clearTimeout(timer);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            setError('Failed to process WebSocket message');
            setIsLoading(false);
        }
    }, []);
    
    // Group dishes by category
    const groupDishesByCategory = (dishes: ExtendedDish[]): DishesByCategory[] => {
        const categoriesMap = new Map<string, DishWithQuantity[]>();
        
        dishes.forEach(dish => {
            const categoryName = dish.dish_categories?.name || 'Other';
            if (!categoriesMap.has(categoryName)) {
                categoriesMap.set(categoryName, []);
            }
            const dishWithQuantity: DishWithQuantity = {
                ...dish,
                quantity: currentRound[dish.id] || 0,
                // Ensure all required Dish properties are included
                name: dish.name || 'Unnamed Dish',
                description: dish.description || null,
                dish_categories: dish.dish_categories || null,
                supplement: dish.supplement || 0
            };
            categoriesMap.get(categoryName)?.push(dishWithQuantity);
        });
        
        // Convert map to array and sort categories by name
        return Array.from(categoriesMap.entries())
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([categoryName, dishes]) => ({
                categoryName,
                dishes: dishes.sort((a, b) => a.name.localeCompare(b.name))
            }));
    };

    // Send message to WebSocket
    const sendWebSocketMessage = useCallback((message: ClientWebSocketMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            
            socketRef.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
            setError('Connection lost. Please refresh the page.');
        }
    }, []);

    // Handle dish quantity update
    const updateDishQuantity = useCallback((dishId: number, change: number) => {
        sendWebSocketMessage({
            type: 'update_dish',
            data: { [dishId]: change }
        });
    }, [sendWebSocketMessage]);

    // Handle complete round
    const completeRound = useCallback(() => {
        if (Object.keys(currentRound).length > 0) {
            sendWebSocketMessage({ type: 'complete_round' });
        }
    }, [currentRound, sendWebSocketMessage]);

    // Set up WebSocket connection
    useEffect(() => {
        if (!order_uuid) {
            navigate('/404', { replace: true });
            return;
        }

        let connected = false;
        const wsUrl = `ws://127.0.0.1:64321/functions/v1/room-websocket?order_uuid=${order_uuid}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            connected = true;
            console.log('WebSocket connection established');
        };

        ws.onmessage = handleWebSocketMessage;

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (!connected) {
                // Error during handshake
                console.error('WebSocket connection failed at handshake stage');
                navigate('/404', { replace: true });
            } else {
                // Error after connection was established
                console.error('WebSocket error after connection');
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
            if (ws.readyState === WebSocket.OPEN) {
                ws.close(1000, 'Component unmounting');
            }
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

    // Render dish quantity controls
    const renderDishControls = (dish: DishWithQuantity) => {
        const quantity = dish.quantity || 0;
        
        return (
            <div key={dish.id} className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 truncate pr-2">{dish.name}</h3>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap ml-2">
                            ${dish.supplement.toFixed(2)}
                        </span>
                    </div>
                    {dish.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {dish.description}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            updateDishQuantity(dish.id, -1);
                        }}
                        disabled={quantity <= 0}
                        className="w-10 h-10 flex items-center justify-center p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-lg font-medium">
                        {quantity}
                    </span>
                    <button
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            updateDishQuantity(dish.id, 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Calculate total items in current round
    const totalItems = Object.values(currentRound).reduce((sum, qty) => sum + qty, 0);

    // Main content
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {order?.menu?.name || 'Order Room'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Table: {order?.table_number || 'N/A'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} in round
                            </div>
                            <div className="text-xs text-gray-500">
                                {Object.keys(currentRound).length} {Object.keys(currentRound).length === 1 ? 'dish' : 'dishes'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {dishesByCategory.length > 0 ? (
                    <div className="space-y-6">
                        {dishesByCategory.map(({ categoryName, dishes }) => (
                            <div key={categoryName} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="bg-gray-800 px-4 py-3">
                                    <h2 className="font-semibold text-white">{categoryName}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {dishes.map(dish => renderDishControls(dish))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No dishes available</h3>
                        <p className="mt-1 text-sm text-gray-500">The menu doesn't contain any dishes yet.</p>
                    </div>
                )}
            </div>

            {/* Floating action button for completing the round */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 transition-transform duration-300 transform ${
                totalItems > 0 ? 'translate-y-0' : 'translate-y-full'
            }`}>
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'} in current round
                        </p>
                        <p className="text-xs text-gray-500">
                            Tap to review your order
                        </p>
                    </div>
                    <button
                        onClick={completeRound}
                        className="flex items-center space-x-2 px-6 py-3 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Check className="w-5 h-5" />
                        <span>Complete Round</span>
                    </button>
                </div>
            </div>

            {/* Error toast */}
            {error && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
