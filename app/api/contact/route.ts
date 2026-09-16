import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in environment variables.");
      return NextResponse.json(
        { error: "Email service unconfigured. Please verify RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Read payload as multipart FormData to capture both text and binary files
    const formData = await req.formData();

    // 1. HONEYPOT BOT INTERCEPTION
    const botField1 = formData.get("website_verify_lead");
    const botField2 = formData.get("website_lead_verify");
    if (botField1 || botField2) {
      return NextResponse.json({ success: true, message: "Inquiry processed." });
    }

    // 2. EXTRACT INQUIRY DATA
    const fullName = formData.get("fullName") as string | null;
    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const company = formData.get("company") as string | null;
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;
    const projectType = formData.get("projectType") as string | null;
    const timeline = formData.get("timeline") as string | null;
    const message = formData.get("message") as string | null;

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

    // 4. EXTRACT FILE ATTACHMENTS (PDF, PLANS, SPECS)
    const attachments: { filename: string; content: Buffer }[] = [];
    const file = formData.get("file") || formData.get("attachment") || formData.get("pdf");

    if (file && file instanceof File && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // 5. DISPATCH LEAD WITH ATTACHMENT VIA RESEND
    const emailResult = await resend.emails.send({
      from: "IMC Web Portal <noreply@interwestmechanical.com>",
      to: ["atwoodparkerimc@gmail.com"],
      replyTo: sanitizedEmail || undefined,
      subject: `[New Bid Lead] ${parsedName} - ${projectType || "General Mechanical"}`,
      attachments: attachments.length > 0 ? attachments : undefined,
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
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>Attachment:</strong></td>
              <td style="padding: 6px 0; color: ${attachments.length > 0 ? "#10b981" : "#64748b"}; font-weight: 600;">
                ${attachments.length > 0 ? `Attached (${attachments[0].filename})` : "None"}
              </td>
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