// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { Rooms, Room, InitialSetupResult, ClientMessage, ServerMessage } from './types.ts'

// Store rooms by order_uuid
const rooms: Rooms = {};

const createRoom = (): Room => ({
    sockets: [],
    current_round: {},
})

const supabase = createClient(
  Deno.env.get("APP_SUPABASE_URL"),
  Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY"),
);


const initialSetup = async (req: Request): Promise<InitialSetupResult> => {
  // Check that request is a websocket upgrade
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return { 
      response: new Response("request isn't trying to upgrade to websocket.", { status: 400 }),
      order: undefined
    };
  }

  // Get order_uuid from URL and check that it exists
  const url = new URL(req.url);
  const order_uuid = url.searchParams.get('order_uuid');
  if (!order_uuid) {
    return {
      response: new Response("Missing order_uuid", { status: 400 }),
      order: undefined
    };
  }

  // Check that order exists and is open
  const { data , error } = await supabase
    .from('orders')
    .select(`
      *,
      menus(
        *,
        dishes(
          *,
          dish_categories(
            name
          )
        )
      )
    `)
    .eq('uuid', order_uuid)
    .eq('is_open', true)
    .limit(1)
    .single();

  if (error) {
    return {
      response: new Response("Error checking order.", { status: 500 }),
      order: undefined
    };
  }

  if (!data) {
    return {
      response: new Response("Order not found or not open.", { status: 404 }),
      order: undefined
    };
  }

  const order = {
    ...data,
    menu: data.menus,
  }
  delete order.menus;

  // If everything is ok, return the order
  return {
    response: undefined,
    order: order
  };
};

const broadcastMessage = (order_uuid: string, message: string, currentClient?: WebSocket) => {
  if (!rooms[order_uuid]) return;
  rooms[order_uuid].sockets.forEach(client => {
    if (client !== currentClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}


Deno.serve(async (req: any) => {
  const { response: initialResponse, order } = await initialSetup(req);
  if (initialResponse) {
    return initialResponse;
  }
  
  const order_uuid = order.uuid;

  // Upgrade request to websocket and add the socket to the corresponding room
  const { socket, response } = Deno.upgradeWebSocket(req);

  if (!rooms[order_uuid]) {
    rooms[order_uuid] = createRoom();
  }
  rooms[order_uuid].sockets.push(socket);
  
  // Handle connection open
  socket.onopen = () => {
    // Send the order data with menu and dishes
    socket.send(JSON.stringify({
      type: 'order_data',
      data: {
        order: order,
        current_round: rooms[order_uuid].current_round,
      }
    }));
  };
  
  // Handle incoming messages
  socket.onmessage = async (e: MessageEvent) => {
    try {
      const message = JSON.parse(e.data) as ClientMessage;
      const room = rooms[order_uuid];
      
      if (!room) {
        console.error(`Room not found for order: ${order_uuid}`);
        return;
      }

      switch (message.type) {
        case 'update_dish': {
          // Update quantities in the current round
          Object.entries(message.data).forEach(([dishId, change]) => {
            const dishIdNum = parseInt(dishId, 10);
            const currentQty = room.current_round[dishIdNum] || 0;
            const changeNum = typeof change === 'number' ? change : 0;
            const newQty = Math.max(0, currentQty + changeNum);
            
            if (newQty > 0) {
              room.current_round[dishIdNum] = newQty;
            } else {
              delete room.current_round[dishIdNum];
            }
          });

          // Broadcast the updated round to all clients
          const updateMessage: ServerMessage = {
            type: 'update_round',
            data: { ...room.current_round }
          };
          broadcastMessage(order_uuid, JSON.stringify(updateMessage));
          break;
        }

        case 'complete_round': {
          if (Object.keys(room.current_round).length === 0) {
            // No dishes in the current round
            const errorMessage: ServerMessage = {
              type: 'error',
              message: 'Cannot complete an empty round'
            };
            socket.send(JSON.stringify(errorMessage));
            return;
          }

          try {
            // Create a new round in the database
            const { data: round, error } = await supabase
              .from('rounds')
              .insert({
                order_id: order.id,
                status: 'completed',
                dishes: room.current_round
              })
              .select()
              .single();

            if (error) throw error;

            // Broadcast round completion to all clients
            const completeMessage: ServerMessage = { type: 'round_completed' };
            broadcastMessage(order_uuid, JSON.stringify(completeMessage));
            
            // Reset the current round
            room.current_round = {};
            
          } catch (error) {
            console.error('Error completing round:', error);
            const errorMessage: ServerMessage = {
              type: 'error',
              message: 'Failed to complete round'
            };
            socket.send(JSON.stringify(errorMessage));
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ServerMessage = {
        type: 'error',
        message: 'Invalid message format'
      };
      socket.send(JSON.stringify(errorMessage));
    }
  };
  
  // Handle connection close
  socket.onclose = () => {
    if (rooms[order_uuid]) {
      // Remove the socket from the room
      rooms[order_uuid].sockets = rooms[order_uuid].sockets.filter(s => s !== socket);
      
      // If there are no more sockets in the room, delete the room
      if (rooms[order_uuid].sockets.length === 0) {
        delete rooms[order_uuid];
        return;
      }
    }
  };
  
  // Handle errors
  socket.onerror = (error) => {
    console.error(`Error in WebSocket for room ${order_uuid}:`, error);
  };

  return response;
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:64321/functions/v1/room-websocket' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
