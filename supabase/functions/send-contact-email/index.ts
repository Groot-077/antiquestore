import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Supabase's built-in SMTP to send via the admin API
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Store the contact message in a table for record-keeping
    const supabaseAdmin = await import("https://esm.sh/@supabase/supabase-js@2.49.1");
    const client = supabaseAdmin.createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Insert into a contact_messages table (we'll create it)
    await client.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
    });

    // Send email notification using fetch to an SMTP relay or mailto
    // For now, we use a simple approach: store the message and notify via the Supabase dashboard
    // The admin can check contact_messages table

    console.log(`Contact form submission from ${name} (${email}): ${subject}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
