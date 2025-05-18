// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Order, Round } from './interfaces.ts'

// Store rooms by order_uuid
const rooms: Record<string, WebSocket[]> = {};

const supabase = createClient(
  Deno.env.get("APP_SUPABASE_URL"),
  Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY"),
);

const fetchOrder = async (order_uuid: string): Promise<Order | Response> => {
  const { data , error } = await supabase
    .from('orders')
    .select('*')
    .eq('uuid', order_uuid)
    .eq('is_open', true)
    .limit(1);

  if (error) {
    return new Response("Error checking order.", { status: 400 });
  }

  if (!data || data.length === 0) {
    return new Response("Order not found or not open.", { status: 400 });
  }

  return data[0];
};

const broadcastMessage = (order_uuid: string, message: string, currentClient?: WebSocket) => {
  if (!rooms[order_uuid]) return;
  rooms[order_uuid].forEach(client => {
    if (client !== currentClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

Deno.serve(async (req: any) => {
  // Check that request is a websocket upgrade
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade to websocket.", { status: 400 });
  }

  // Get order_uuid from URL and check that it exists
  const url = new URL(req.url);
  const order_uuid = url.searchParams.get('order_uuid');
  if (!order_uuid) {
    return new Response("Missing order_uuid", { status: 400 });
  }

  const order = await fetchOrder(order_uuid);
  if (order instanceof Response) {
    return order;
  }

  // Upgrade request to websocket and add the socket to the corresponding room
  const { socket, response } = Deno.upgradeWebSocket(req);

  if (!rooms[order_uuid]) {
    rooms[order_uuid] = [];
  }
  rooms[order_uuid].push(socket);
  
  // Handle connection open
  socket.onopen = () => {
    socket.send(`Welcome to Plateroom for order ${order_uuid}.`);
    broadcastMessage(order_uuid, `Client joined the room.`, socket);
  };
  
  // Handle incoming messages
  socket.onmessage = (e: any) => {
    // Send the message to all other sockets in the same room
    const data = JSON.parse(e.data);
    broadcastMessage(order_uuid, data.text, socket);
  };
  
  // Handle connection close
  socket.onclose = () => {
    if (rooms[order_uuid]) {
      // Remove the socket from the room
      rooms[order_uuid] = rooms[order_uuid].filter(s => s !== socket);
      
      // If there are no more sockets in the room, delete the room
      if (rooms[order_uuid].length === 0) {
        delete rooms[order_uuid];
        return;
      }
    }

    broadcastMessage(order_uuid, `Client left the room.`);
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
