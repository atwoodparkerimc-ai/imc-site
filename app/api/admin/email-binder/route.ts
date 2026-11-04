// app/api/admin/email-binder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Allow large multi-page PDF attachments
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server environment." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    
    const location = (formData.get("location") as string) || "Nestle Springville";
    const startDate = (formData.get("startDate") as string) || "";
    const endDate = (formData.get("endDate") as string) || "";
    const compilingManager = (formData.get("compilingManager") as string) || "Authorized Safety Lead";
    const totalRecords = (formData.get("totalRecords") as string) || "0";
    const customNote = (formData.get("customNote") as string) || "";
    
    const recipientsRaw = formData.get("recipients") as string;
    const recipients: string[] = recipientsRaw ? JSON.parse(recipientsRaw) : [];

    const sectionsRaw = formData.get("sectionsList") as string;
    const sectionsList: { section: string; count: number }[] = sectionsRaw ? JSON.parse(sectionsRaw) : [];

    const pdfFile = formData.get("pdfFile") as File | null;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient email address is required." },
        { status: 400 }
      );
    }

    const cleanRecipients = recipients
      .map((r: string) => r.trim().toLowerCase())
      .filter((r: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r));

    if (cleanRecipients.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses provided." },
        { status: 400 }
      );
    }

    const subject = `[AUDIT DISPATCH] IMC Safety Compliance Binder - ${location.toUpperCase()} (${startDate} to ${endDate})`;

    const sectionsHtml = (sectionsList || [])
      .map(
        (sec: { section: string; count: number }) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 14px; font-weight: 600; color: #1e293b; font-size: 13px;">${sec.section}</td>
          <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #047857; font-size: 13px;">${sec.count} Verified Records</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0f172a; line-height: 1.5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1;">
          
          <!-- BRAND TOP BAR -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 24px; border-bottom: 3px solid #0088ff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #0088ff; margin-bottom: 4px;">
                      Interwest Mechanical Contractors • EHS Division
                    </div>
                    <div style="font-size: 18px; font-weight: 900; text-transform: uppercase; color: #ffffff; letter-spacing: -0.5px;">
                      Safety Compliance Binder Audit Dispatch
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background: rgba(0, 136, 255, 0.2); border: 1px solid #0088ff; color: #38bdf8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                      OFFICIAL DOSSIER
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin-top: 0; font-size: 14px; color: #334155;">
                This dispatch provides the certified Master Safety Compliance Dossier compiled for operations at <strong style="color: #0f172a;">${location.toUpperCase()}</strong> covering the specified audit date window.
              </p>

              <!-- AUDIT METADATA CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; margin: 18px 0;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px;">
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Assigned Worksite:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 800; color: #0f172a;">${location.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Audit Date Window:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 800; color: #0f172a;">${startDate} to ${endDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Verified Records:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 800; color: #047857;">${totalRecords} Forms Compiled</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Compiling Safety Lead:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 800; color: #0369a1;">${compilingManager.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Sequence Mode:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 800; color: #0f172a;">Daily Docket (Chronological)</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Certified Timestamp:</td>
                        <td align="right" style="padding: 4px 0; font-weight: 700; color: #475569;">${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DIRECT AUDITOR NOTE -->
              ${
                customNote
                  ? `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fffbeb; border: 1px solid #fcd34d; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">
                        Auditor Direct Message:
                      </div>
                      <div style="font-size: 13px; color: #78350f; font-style: italic;">
                        "${customNote}"
                      </div>
                    </td>
                  </tr>
                </table>
              `
                  : ""
              }

              <!-- ATTACHMENT CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ecfeff; border: 1.5px solid #06b6d4; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="36" valign="top">
                          <span style="font-size: 24px; line-height: 1;">📑</span>
                        </td>
                        <td>
                          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0891b2; margin-bottom: 2px;">
                            Attached PDF Audit Dossier:
                          </div>
                          <div style="font-size: 13px; font-weight: 700; color: #0e7490; word-break: break-all;">
                            IMC-Safety-Binder-${location.replace(/\s+/g, "_")}-${startDate}-to-${endDate}.pdf
                          </div>
                          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                            The complete multi-page audit binder with all employee signatures and checklists is attached to this email as a PDF document.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TABLE OF CONTENTS LEDGER -->
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 6px; letter-spacing: 0.5px;">
                Compiled Forms Included in PDF:
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #cbd5e1; border-collapse: collapse; margin-bottom: 22px;">
                <thead>
                  <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                    <th align="left" style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Document / Section</th>
                    <th align="right" style="padding: 8px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Verified Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${sectionsHtml || '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #64748b; font-size: 12px;">Standard Shift Compliance Forms</td></tr>'}
                </tbody>
              </table>

              <!-- REGULATORY ASSURANCE -->
              <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
                This audit package certifies that all required job hazard analyses, employee check-ins, pre-use inspections, and equipment compliance forms were executed by qualified IMC personnel in strict accordance with OSHA regulations and client safety standards.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
              Interwest Mechanical Contractors • Environmental Health &amp; Safety Management System • Confidential Audit Document
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Process PDF binary from FormData
    const attachments = [];
    if (pdfFile) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      attachments.push({
        filename: `IMC-Safety-Binder-${location.replace(/\s+/g, "_")}-${startDate}-to-${endDate}.pdf`,
        content: buffer,
      });
    }

    const { data, error } = await resend.emails.send({
      from: "IMC Safety Portal <onboarding@resend.dev>",
      to: cleanRecipients,
      subject: subject,
      html: emailHtml,
      attachments,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Email dispatch failure:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error occurred while sending email." },
      { status: 500 }
    );
  }
}