import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  doctorName: string;
  doctorEmail: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received verification email request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, doctorEmail, status, rejectionReason }: VerificationEmailRequest = await req.json();

    console.log(`Sending ${status} email to ${doctorEmail} for ${doctorName}`);

    let subject: string;
    let htmlContent: string;

    if (status === "approved") {
      subject = "🎉 Congratulations! Your Doctor Account is Verified";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #0EA5E9, #0284C7); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; }
            .logo svg { width: 32px; height: 32px; color: white; }
            h1 { color: #0EA5E9; margin-top: 20px; }
            .success-box { background: #ECFDF5; border: 1px solid #10B981; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .success-box h2 { color: #059669; margin: 0 0 10px 0; font-size: 18px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #0EA5E9, #0284C7); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h1>Welcome to MediCare!</h1>
            </div>
            
            <p>Dear Dr. ${doctorName},</p>
            
            <div class="success-box">
              <h2>✅ Your Account is Now Verified</h2>
              <p style="margin: 0;">Your doctor registration has been reviewed and approved by our admin team. You now have full access to all doctor features on our platform.</p>
            </div>
            
            <p>You can now:</p>
            <ul>
              <li>Manage your appointments and schedule</li>
              <li>Connect with patients</li>
              <li>Write and publish health articles</li>
              <li>Update your professional profile</li>
            </ul>
            
            <center>
              <a href="https://medicare.lovable.app/doctor" class="cta-button">Go to Your Dashboard</a>
            </center>
            
            <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>© 2024 MediCare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Important Update About Your Doctor Registration";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #0EA5E9, #0284C7); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; }
            h1 { color: #333; margin-top: 20px; }
            .rejection-box { background: #FEF2F2; border: 1px solid #EF4444; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .rejection-box h2 { color: #DC2626; margin: 0 0 10px 0; font-size: 18px; }
            .reason-box { background: #FFF; border: 1px solid #FCA5A5; border-radius: 8px; padding: 15px; margin-top: 15px; }
            .cta-button { display: inline-block; background: #6B7280; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h1>Registration Update</h1>
            </div>
            
            <p>Dear Dr. ${doctorName},</p>
            
            <div class="rejection-box">
              <h2>Registration Not Approved</h2>
              <p style="margin: 0;">We regret to inform you that your doctor registration could not be approved at this time.</p>
              
              ${rejectionReason ? `
              <div class="reason-box">
                <strong>Reason:</strong><br/>
                ${rejectionReason}
              </div>
              ` : ''}
            </div>
            
            <p>If you believe this decision was made in error or if you have additional documentation to provide, please don't hesitate to contact our support team for further assistance.</p>
            
            <center>
              <a href="mailto:support@medicare.lovable.app" class="cta-button">Contact Support</a>
            </center>
            
            <div class="footer">
              <p>We appreciate your interest in joining our platform.</p>
              <p>© 2024 MediCare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "MediCare <onboarding@resend.dev>",
      to: [doctorEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
