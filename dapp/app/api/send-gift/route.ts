import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // Initialize Resend with the API key from environment variables inside the handler
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { email, amount, claimUrl } = body;

    if (!email || !amount || !claimUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "GlowCards <gifts@glow-cards.xyz>", // Verified domain
      to: [email],
      subject: "You received a GlowCard Gift! ✨",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000; color: #ffffff; border-radius: 16px;">
          <h1 style="text-align: center; font-size: 32px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px; background: linear-gradient(to bottom right, #ffffff, rgba(255,255,255,0.4)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            GlowCards
          </h1>
          <p style="text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 40px;">
            Give the Gift of Yield
          </p>
          
          <div style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
            <p style="font-size: 18px; color: rgba(255,255,255,0.8); margin-bottom: 16px;">You just received a yield-bearing gift card for:</p>
            <h2 style="font-size: 48px; font-weight: 800; margin: 0; color: #ffffff;">₣${amount} FLOW</h2>
            <p style="font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 16px; line-height: 1.5;">
              This gift is securely locked on the Flow blockchain and is automatically earning yield through Increment Fi until you are ready to claim it.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${claimUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 600; font-size: 16px; text-decoration: none; padding: 16px 32px; border-radius: 12px; transition: all 0.2s; box-shadow: 0 0 20px rgba(255,255,255,0.1);">
              Claim Your Gift ✨
            </a>
          </div>
          
          <p style="text-align: center; color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 48px;">
            Powered by Flow Blockchain.<br/>If you weren't expecting this email, you can safely ignore it.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
