// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Order, Round } from './interfaces.ts'

// Almacén de salas (rooms) por order_uuid
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

const fetchRound = async (order_id: number): Promise<Round | Response> => {
  const { data, error } = await supabase
  .from('rounds')
  .select('number, is_open, dishes (id, name, dish_round (quantity))')
  .eq('order_id', order_id)
  .eq('is_open', true)
  .limit(1)
  .single();

  if (error) {
    return new Response("Error fetching round.", { status: 500 });
  }

  if (!data) {
    return new Response("Round not found.", { status: 400 });
  }

  return data;
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

  // Upgrade request to websocket, fetch round and manage websocket connection
  const { socket, response } = Deno.upgradeWebSocket(req);

  const round = await fetchRound(order.id);
  if (round instanceof Response) {
    return round;
  }

  // Añadir el socket a la sala correspondiente
  if (!rooms[order_uuid]) {
    rooms[order_uuid] = [];
  }
  rooms[order_uuid].push(socket);
  
  socket.onopen = () => {
    socket.send(`Welcome to Plateroom for order ${order_uuid}.`);
    socket.send(`Round data: ${JSON.stringify(round)}`);
  };
  
  // Manejar mensajes entrantes
  socket.onmessage = (e: any) => {
    // Enviar el mensaje a todos los demás sockets en la misma sala
    if (rooms[order_uuid]) {
      rooms[order_uuid].forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(e.data);
        }
        client.send(`Clients in room ${order_uuid}: ${rooms[order_uuid].length}`);
      });
    }
  };
  
  // Manejar cierre de conexión
  socket.onclose = () => {
    if (rooms[order_uuid]) {
      // Eliminar el socket de la sala
      rooms[order_uuid] = rooms[order_uuid].filter(s => s !== socket);
      
      // Si no hay más sockets en la sala, eliminar la sala
      if (rooms[order_uuid].length === 0) {
        delete rooms[order_uuid];
      }
    }
  };
  
  // Manejar errores
  socket.onerror = (error) => {
    console.error(`Error en WebSocket para la sala ${order_uuid}:`, error);
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
