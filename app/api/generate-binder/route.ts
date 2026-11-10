// app/api/generate-binder/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  let browser = null;
  try {
    const { htmlDocuments } = await req.json();

    if (!htmlDocuments || !Array.isArray(htmlDocuments)) {
      return NextResponse.json(
        { error: "Missing HTML documents array" },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const masterPdf = await PDFDocument.create();
    const font = await masterPdf.embedFont(StandardFonts.HelveticaBold);

    for (const html of htmlDocuments) {
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.35in",
          bottom: "0.35in",
          left: "0.45in",
          right: "0.45in",
        },
      });

      const tempPdf = await PDFDocument.load(pdfBuffer);
      const pageIndices = tempPdf.getPageIndices();
      const copiedPages = await masterPdf.copyPages(tempPdf, pageIndices);
      copiedPages.forEach((p) => masterPdf.addPage(p));

      // Duplex protection: if odd number of pages, force a watermarked blank back page
      if (copiedPages.length % 2 !== 0) {
        const blankPage = masterPdf.addPage([612, 792]);
        const watermarkText = "[ INTENTIONALLY BLANK FOR DUPLEX PRINTING ]";
        const textSize = 11;
        const textWidth = font.widthOfTextAtSize(watermarkText, textSize);

        blankPage.drawText(watermarkText, {
          x: (612 - textWidth) / 2,
          y: 792 / 2,
          size: textSize,
          font: font,
          color: rgb(0.8, 0.83, 0.88),
        });
      }
    }

    await browser.close();
    browser = null;

    const pdfBytes = await masterPdf.save();
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Master-Compliance-Binder-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    if (browser) await browser.close();
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate PDF binder" },
      { status: 500 }
    );
  }
}