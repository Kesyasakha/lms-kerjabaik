import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const body = await req.json();
    const { email, password, nama_lengkap, role, id_lembaga } = body;

    console.log("Processing Create User (Admin Action):", { email, role, id_lembaga });

    if (!email || !password || !nama_lengkap || !role || !id_lembaga) {
      return new Response(JSON.stringify({
        error: "Lengkapi data pendaftaran (email, password, nama, peran, dan tenant wajib diisi)"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Create user in Supabase Auth with COMPLETE metadata
    // This will trigger 'on_auth_user_created' database trigger in SQL
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nama_lengkap,
          role,
          id_lembaga,
        },
      });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      return new Response(JSON.stringify({ error: `Penyedia Autentikasi: ${authError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!authUser.user) {
      throw new Error("Gagal menginisialisasi akun pengguna");
    }

    // 2. Fetch the profile created by the database trigger
    // We wait a tiny bit to ensure the trigger finished (usually instant)
    const { data: pengguna, error: fetchError } = await supabaseAdmin
      .from("pengguna")
      .select("*")
      .eq("auth_id", authUser.user.id)
      .single();

    if (fetchError) {
      console.log("Warning: User created in Auth but profile fetch failed yet. Returning basic info.");
      return new Response(JSON.stringify({
        id: authUser.user.id,
        email: authUser.user.email,
        nama_lengkap
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201, // Created
      });
    }

    return new Response(JSON.stringify(pengguna), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Function Handler Error:", err.message);
    return new Response(JSON.stringify({ error: `Kesalahan sistem internal: ${err.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
