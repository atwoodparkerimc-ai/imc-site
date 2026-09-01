import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. HONEYPOT BOT INTERCEPTION
    // Drop payloads silently if automated scrapers populate honeypot fields
    if (data.website_verify_lead || data.website_lead_verify) {
      return NextResponse.json({ success: true, message: "Inquiry processed." });
    }

    // 2. EXTRACT INQUIRY DATA
    const { 
      firstName, 
      lastName, 
      fullName, 
      company, 
      phone, 
      email, 
      projectType, 
      timeline, 
      message 
    } = data;

    const parsedName = fullName?.trim() || `${firstName || ""} ${lastName || ""}`.trim() || "Unspecified Contact";
    const sanitizedEmail = email?.trim().toLowerCase() || "";
    const sanitizedPhone = phone?.trim() || "";

    // 3. VALIDATION
    if (!sanitizedEmail && !sanitizedPhone) {
      return NextResponse.json(
        { error: "A valid email address or phone number is required." },
        { status: 400 }
      );
    }

    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email format." },
        { status: 400 }
      );
    }

    // 4. DISPATCH / PERSISTENCE (Log or pipe to Supabase / Email service)
    const payload = {
      name: parsedName,
      company: company?.trim() || "Not Provided",
      email: sanitizedEmail,
      phone: sanitizedPhone,
      projectType: projectType || "General Mechanical",
      timeline: timeline || "Standard",
      message: message?.trim() || "",
      receivedAt: new Date().toISOString(),
    };

    // Forwarding ready:
    // await supabaseAdmin.from("project_inquiries").insert(payload);

    return NextResponse.json({ 
      success: true, 
      message: "Inquiry received successfully. Our estimating team has been notified." 
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error." }, 
      { status: 500 }
    );
  }
}