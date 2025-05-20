import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from "@/entities/Order";
import type { Dish } from "@/entities/Dish";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import MinusIcon from '@/svg/MinusIcon';
import AddIcon from '@/svg/AddIcon';
import ToastErrorIcon from '@/svg/ToastErrorIcon';
import ReloadIcon from '@/svg/ReloadIcon';
import CheckIcon from '@/svg/CheckIcon';

// Extended interfaces for our needs
interface ExtendedDish extends Dish {
  dish_categories: {
    name: string;
  };
}

interface ExtendedOrder extends Order {
  menu: {
    name: string;
    dishes: ExtendedDish[];
  };
  table: {
    name: string;
    seats: number;
  };
}

type CurrentRound = {
    [dish_id: number]: number;
};

// Server to client messages
type WebSocketMessage =
  | { type: 'order_data'; data: { order: ExtendedOrder, current_round: CurrentRound } }  // Initial order data
  | { type: 'update_round'; data: CurrentRound }  // Current round dishes with quantities
  | { type: 'round_completed' }  // Notify clients that round was completed
  | { type: 'error'; data: string }  // Error message

// Client to server messages
type ClientWebSocketMessage =
  | { type: 'update_dish'; data: CurrentRound }  // +1 or -1 for dish quantity
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
    
    const [currentRound, setCurrentRound] = useState<CurrentRound>({});
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

    // Render dish quantity controls
    const renderDishControls = (dish: DishWithQuantity) => {
        const quantity = dish.quantity || 0;
        return (
            <article key={dish.id} className="flex items-center gap-4 p-4">
                <div className='flex items-center gap-4'>
                    {dish.photo_path && 
                        <figure className="w-16 aspect-square rounded overflow-hidden">
                            <img src={dish.photo_path} alt={dish.name} className="w-full h-full object-cover" />
                        </figure>
                    }
                </div>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col items-start">
                        <h3>{dish.name}</h3>
                        {dish.description && <p className="text-sm text-gray-400 line-clamp-2">{dish.description}</p>}
                    </div>
                    {dish.supplement > 0 &&
                        <p className=' flex items-center'>
                            {dish.supplement.toFixed(2)}€
                        </p>
                    }
                </div>
                <div className="flex items-center">
                    <button onClick={() => updateDishQuantity(dish.id, -1)} disabled={quantity <= 0} className="btn btn-circle btn-primary">
                        <MinusIcon className='w-4' />
                    </button>
                    <span className="w-8 text-center text-lg font-medium">{quantity}</span>
                    <button onClick={() => updateDishQuantity(dish.id, 1)} className="btn btn-circle btn-primary">
                        <AddIcon className="w-4" />
                    </button>
                </div>
            </article>
        );
    };

    // Calculate total items in current round
    const totalItems = Object.values(currentRound).reduce((sum, qty) => sum + qty, 0);

    // Main content
    return (
        <>
            <div className='grid grid-cols-1 grid-rows-[auto_1fr_auto] h-screen'>
                <header className="navbar bg-base-300 fixed top-0 left-0 right-0">
                    <div className=' flex justify-around m-auto px-4 w-full md:w-5/6 xl:w-4/6'>
                        <section className="w-1/3">
                            <h2>{order?.menu?.name || 'Order Room'}</h2>
                            <p className="text-sm text-gray-500">Mesa: {order?.table.name || 'N/A'}</p>
                        </section>

                        <Link to="/" className="w-1/3 flex items-center justify-center">
                            <h1>
                                <span className="text-base-content">Plate</span>
                                <span className="text-blue-400">Room</span>
                            </h1>
                        </Link>

                        <section className="w-1/3 flex items-center justify-end">
                            <div>
                                <p>
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'} in round
                                </p>
                                <p className="text-xs text-gray-400">
                                    {Object.keys(currentRound).length} {Object.keys(currentRound).length === 1 ? 'dish' : 'dishes'}
                                </p>
                            </div>
                        </section>
                    </div>
                </header>
                <main className='flex flex-col gap-4 m-auto p-4 py-20 w-full md:w-5/6 xl:w-4/6'>
                    {dishesByCategory.length > 0
                        ?   dishesByCategory.map(({ categoryName, dishes }) => (
                                <div key={categoryName}>
                                    <div className="alert alert-info">
                                        {categoryName}
                                    </div>
                                        {dishes.map((dish, index) => 
                                            <div key={index} className={`${dishes.length-1 === index ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                                {renderDishControls(dish)}
                                            </div>
                                        )}

                                </div>
                            ))
                        :   <div className="text-center">
                                <h3>No dishes available</h3>
                                <p className="text-gray-400">The menu doesn't contain any dishes yet.</p>
                            </div>
                    }
                </main>
                {/* Floating action button for completing the round */}
                <div className={`fixed bottom-0 left-0 right-0 bg-base-200`}>
                    <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} in current round
                            </p>
                            <p className="text-xs text-gray-500">
                                Tap to review your order
                            </p>
                        </div>
                        <button disabled={totalItems === 0} onClick={completeRound} className="btn btn-primary btn-r">
                            <CheckIcon className="w-5" />
                            Complete Round
                        </button>
                    </div>
                </div>
            </div>

            {/* Error toast */}
            {error && (
                <div className='w-full mx-4 md:w-auto fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 z-50 animate-fade-in'>
                    <div className="alert alert-error">
                        <ToastErrorIcon className='w-5' />
                        <span className="max-w-xs">{error}</span>
                        <button onClick={() => navigate(0)} className="btn btn-sm btn-circle btn-error bg-transparent">
                            <ReloadIcon className='w-5' />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
