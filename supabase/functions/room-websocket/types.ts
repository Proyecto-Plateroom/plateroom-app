
interface Dish {
  id: number;
  name: string;
  description: string | null;
  supplement: number;
  photo_path: string | null;
  category_id: number;
}

interface Menu {
  id: number;
  name: string;
  price: number;
  organization_id: number | null;
  dishes: Dish[];
}

interface Order {
  id: number;
  uuid: string;
  total_amount: number;
  is_open: boolean;
  menu_id: number;
  table_id: number;
  menu: Menu;
};

interface RoundDishes {
  [dish_id: string]: number; // dish_id: quantity
}

export interface Room {
  sockets: WebSocket[];
  current_round: RoundDishes;
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
