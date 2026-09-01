import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPER_ADMIN_EMAIL = "atwoodparkerimc@gmail.com";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local file." },
        { status: 500 }
      );
    }

    // Safely create admin client inside request scope
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Verify caller session token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: { user }, error: authCheckError } = await supabaseAdmin.auth.getUser(token);

    if (authCheckError || !user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to provision accounts." },
        { status: 403 }
      );
    }

    // 2. Extract employee payload
    const { firstName, lastName, nickname, email, role, location } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "First Name, Last Name, and Email are required." },
        { status: 400 }
      );
    }

    // 3. Create auth account via GoTrue (Pre-confirmed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: "Imc123",
      email_confirm: true,
      user_metadata: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        location: location || "Springville Shop",
        must_change_password: true,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 400 });
    }

    const userId = authData.user.id;

    // 4. Create profile record with must_change_password = true
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        nickname: nickname ? nickname.trim() : `${firstName.trim()} ${lastName.trim()}`,
        role: role || "employee",
        points_balance: 0,
        location: location || "Springville Shop",
        must_change_password: true,
      });

    // Rollback auth user if profile creation fails
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}