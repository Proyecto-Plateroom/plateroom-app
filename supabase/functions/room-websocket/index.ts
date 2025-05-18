// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get("APP_SUPABASE_URL"),
  Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY"),
);

Deno.serve(async (req: any) => {
  // Check that request is a websocket upgrade
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade to websocket.", { status: 400 });
  }

  // Check that order exists and is opened
  const url = new URL(req.url);
  const order_uuid = url.searchParams.get('order_uuid');

  const { data , error } = await supabase
    .from('orders')
    .select('*')
    .eq('uuid', order_uuid)
    .eq('is_open', true)
    .limit(1);

  if (error) {
    console.error("Error checking order:", error);
    return new Response("Error checking order.", { status: 400 });
  }

  if (!data || data.length === 0) {
    console.error("Order not found or not open.");
    return new Response("Order not found or not open.", { status: 400 });
  }

  // Upgrade request to websocket and handle it
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("client connected!");
    socket.send(`Welcome to Plateroom for order ${order_uuid}.`);
    socket.send(`Order data: ${JSON.stringify(data)}`);
  };
  
  socket.onmessage = (e: any) => {
    console.log("client sent message:", e.data);
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
