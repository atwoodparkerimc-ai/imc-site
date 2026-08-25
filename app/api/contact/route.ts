import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. HONEYPOT CHECK: If a bot fills out either hidden field, reject silently
    if (data.website_verify_lead || data.website_lead_verify) {
      // Return 200 OK so the bot thinks it succeeded, but drop the payload immediately
      return NextResponse.json({ success: true, message: "Inquiry processed." });
    }

    // 2. EXTRACT PUBLIC INQUIRY DATA
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

    // Basic validation
    if (!email && !phone) {
      return NextResponse.json(
        { error: "A valid email or phone number is required." },
        { status: 400 }
      );
    }

    // 3. TODO: Forward to your estimating inbox (via Resend, SendGrid, or Supabase table)
    // console.log("Valid Lead Received:", { fullName: fullName || `${firstName} ${lastName}`, email, phone, message });

    return NextResponse.json({ success: true, message: "Inquiry received successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}