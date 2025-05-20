
export interface Dish {
  id: number;
  name: string;
  description: string | null;
  supplement: number;
  photo_path: string | null;
  dish_categories: {
    name: string;
  };
}

export interface Menu {
  name: string;
  dishes: Dish[];
}

export interface Order {
  id: number;
  uuid: string;
  total_amount: number;
  is_open: boolean;
  menu: Menu;
  table: {
    name: string,
    seats: number
  };
};

interface DishQuantity {
  [dish_id: number]: number; // dish_id: quantity
}

// Types for WebSocket messages
export type ClientMessage = 
  | { type: 'update_dish'; data: DishQuantity }
  | { type: 'complete_round' };

export type ServerMessage = 
  | { type: 'order_data'; data: Order }
  | { type: 'update_round'; data: DishQuantity }
  | { type: 'round_completed' }
  | { type: 'error'; message: string };

export interface Room {
  sockets: WebSocket[];
  current_round: DishQuantity;
}

export interface Rooms {
  [order_uuid: string]: Room;
}

type InitialSetupSuccess = {
  response: undefined;
  order: Order;
};

type InitialSetupError = {
  response: Response;
  order: undefined;
};

export type InitialSetupResult = InitialSetupSuccess | InitialSetupError;
