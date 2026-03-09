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
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>You received a GlowCard Gift!</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; width: 100% !important;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                    <!-- Header -->
                    <tr>
                      <td align="center" style="padding-bottom: 8px;">
                        <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; text-align: center;">GlowCards</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0; text-align: center;">Give the Gift of Yield</p>
                      </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                      <td style="background-color: #111111; border: 1px solid #222222; border-radius: 20px; padding: 40px 32px; text-align: center;">
                        <p style="font-size: 18px; color: #dddddd; margin-bottom: 16px; margin-top: 0;">You just received a yield-bearing gift card for:</p>
                        <h2 style="font-size: 48px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: -2px;">₣${amount} FLOW</h2>
                        <p style="font-size: 14px; color: #666666; margin-top: 24px; line-height: 1.6; margin-bottom: 0;">
                          This gift is securely locked on the Flow blockchain and is automatically earning yield through Increment Fi until you are ready to claim it.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- CTA -->
                    <tr>
                      <td align="center" style="padding-top: 40px;">
                        <a href="${claimUrl}" style="background-color: #ffffff; color: #000000; font-weight: 700; font-size: 16px; text-decoration: none; padding: 18px 40px; border-radius: 14px; display: inline-block;">
                          Claim Your Gift ✨
                        </a>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding-top: 60px;">
                        <p style="color: #333333; font-size: 11px; margin: 0; line-height: 1.5; text-align: center;">
                          Powered by Flow Blockchain.<br/>
                          This is a secure gift intended for ${email}. If you weren't expecting this, you can safely ignore it.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
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
