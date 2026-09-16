import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in environment variables.");
      return NextResponse.json(
        { error: "Email service unconfigured. Please verify RESEND_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const data = await req.json();

    // 1. HONEYPOT BOT INTERCEPTION
    // Silently drop spam without triggering alerts or errors
    if (data.website_verify_lead || data.website_lead_verify) {
      return NextResponse.json({ success: true, message: "Inquiry processed." });
    }

    // 2. EXTRACT INQUIRY DATA
    const { 
      fullName, 
      firstName, 
      lastName, 
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

    // 4. DISPATCH LEAD DIRECTLY TO YOUR GMAIL VIA RESEND
    const emailResult = await resend.emails.send({
      from: "IMC Web Portal <noreply@interwestmechanical.com>",
      to: ["atwoodparkerimc@gmail.com"],
      replyTo: sanitizedEmail || undefined,
      subject: `[New Bid Lead] ${parsedName} - ${projectType || "General Mechanical"}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; border-radius: 6px; border: 1px solid #1e293b; max-width: 600px;">
          <div style="border-bottom: 2px solid #ea1f27; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #ea1f27; letter-spacing: 0.15em; text-transform: uppercase;">Interwest Mechanical Contractors</span>
            <h2 style="color: #ffffff; margin: 6px 0 0 0; font-size: 20px; text-transform: uppercase; letter-spacing: -0.02em;">New Project Bid Submission</h2>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 140px;"><strong>Client Name:</strong></td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${parsedName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Company:</strong></td>
              <td style="padding: 6px 0; color: #ffffff;">${company || "Not Provided"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Email:</strong></td>
              <td style="padding: 6px 0;"><a href="mailto:${sanitizedEmail}" style="color: #0088ff; text-decoration: none;">${sanitizedEmail || "None"}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0;"><a href="tel:${sanitizedPhone}" style="color: #0088ff; text-decoration: none;">${sanitizedPhone || "None"}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Discipline:</strong></td>
              <td style="padding: 6px 0; color: #38bdf8;">${projectType || "General Mechanical"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Target Timeline:</strong></td>
              <td style="padding: 6px 0; color: #ffffff;">${timeline || "Standard"}</td>
            </tr>
          </table>

          <div style="background: #030914; border: 1px solid #1e293b; padding: 14px; border-radius: 4px; margin-bottom: 20px;">
            <strong style="color: #94a3b8; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Scope & Specifications:</strong>
            <p style="white-space: pre-wrap; color: #cbd5e1; margin: 0; font-size: 14px; line-height: 1.5;">${message || "No additional scope details provided."}</p>
          </div>

          <p style="font-size: 11px; color: #64748b; margin: 0; font-family: monospace;">Transmitted via IMC Production Portal</p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error("Resend Dispatch Error:", emailResult.error);
      return NextResponse.json(
        { error: emailResult.error.message || "Failed to dispatch email notification." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Inquiry received successfully. Our estimating team has been notified." 
    });
  } catch (err: any) {
    console.error("Contact API Server Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." }, 
      { status: 500 }
    );
  }
}