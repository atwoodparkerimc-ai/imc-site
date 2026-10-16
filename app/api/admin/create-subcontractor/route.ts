import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { companyName, password, location } = await req.json();

    if (!companyName || !password) {
      return NextResponse.json(
        { error: "Company name and password/PIN are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Check all standard environment variable names for the service role secret
    const serviceRoleKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_SERVICE_KEY || 
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[CreateSubcontractor] Missing server keys:", { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!serviceRoleKey 
      });
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local file." },
        { status: 500 }
      );
    }

    // Generate internal synthetic slug identifier
    const slug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const syntheticEmail = `${slug}@subcontractor.imc.internal`;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Create auto-confirmed auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: companyName.trim(),
        last_name: "(Subcontractor)",
        location: location || "Springville Shop",
        role: "subcontractor",
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // 2. Upsert profile with role = 'subcontractor' and 0 points
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        first_name: companyName.trim(),
        last_name: "(Subcontractor)",
        nickname: companyName.trim(),
        location: location || "Springville Shop",
        role: "subcontractor",
        points_balance: 0,
        is_active: true,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        companyName: companyName.trim(),
        syntheticEmail,
        location: location || "Springville Shop",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}