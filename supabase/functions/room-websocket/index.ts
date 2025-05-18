// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Order, Round } from './interfaces.ts'

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

  socket.onopen = () => {
    socket.send(`Welcome to Plateroom for order ${order_uuid}.`);
    socket.send(`Round data: ${JSON.stringify(round)}`);
  };
  
  socket.onmessage = (e: any) => {
    socket.send(`Server received: ${e.data}`);
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
