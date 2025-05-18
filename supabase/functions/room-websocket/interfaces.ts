export interface Order {
  id: number;
  uuid: string;
  total_amount: number;
  is_open: boolean;
  menu_id: number;
  table_id: number;
};

export interface Round {
  id: number;
  number: number;
  is_open: boolean;
  order_id: number;
  dishes: {
    id: number;
    name: string;
    dish_round: {
      quantity: number;
    };
  }[];
};
