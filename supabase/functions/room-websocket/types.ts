
export interface Order {
  id: number;
  uuid: string;
  total_amount: number;
  is_open: boolean;
  menu_id: number;
  table_id: number;
};

interface RoundDishes {
  [dish_id: string]: number; // dish_id: quantity
}

interface Room {
  sockets: WebSocket[];
  current_round: RoundDishes;
}

export interface Rooms {
  [order_uuid: string]: Room;
}
